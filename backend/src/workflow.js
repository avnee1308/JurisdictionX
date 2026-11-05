import { graph, playbooks, ISSUE_ASSET, assetFor, evidenceFor, deptName, findResponsibilities } from './graph.js';
import { analyze } from './analyzer.js';
import { transition, audit } from './transition.js';
import { HttpError, newId, now } from './util.js';

export const INSUFFICIENT = 'Insufficient verified information to determine the responsible authority.';
// Demo-configurable. Real deployments must use officially published timelines (store their source).
export const escalationSeconds = () => Number(process.env.ESCALATION_SECONDS || 90);

const requireRole = (user, ...roles) => {
  if (!roles.includes(user.role)) throw new HttpError(403, `Requires role: ${roles.join(' or ')}`);
};
const must = (x, msg = 'Not found') => { if (!x) throw new HttpError(404, msg); return x; };
const requireDept = (user, task) => {
  if (user.role === 'admin') return;
  if (user.role !== 'officer' || user.departmentId !== task.department) {
    throw new HttpError(403, 'Only an officer of the assigned department can do this');
  }
};

// ---------- visibility / views ----------
async function tasksOf(store, complaintId) {
  return (await store.list('tasks', (t) => t.complaintId === complaintId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function canSee(user, c, tasks) {
  if (user.role === 'admin') return true;
  if (user.role === 'citizen') return c.userId === user.id;
  const d = user.departmentId;
  return c.recommendations.some((r) => r.department === d) || c.plan.some((p) => p.department === d)
    || tasks.some((t) => t.department === d);
}

async function loadVisible(store, user, id) {
  const c = must(await store.get('complaints', id), 'Complaint not found');
  const tasks = await tasksOf(store, id);
  if (!canSee(user, c, tasks)) throw new HttpError(403, 'Not allowed to view this complaint');
  return { c, tasks };
}

const taskView = (t, user) => ({
  taskId: t.id, key: t.key, title: t.title, department: t.department, departmentName: deptName(t.department),
  dependsOn: t.dependsOn, status: t.status, ackedAt: t.ackedAt || null, doneAt: t.doneAt || null,
  evidence: t.evidence, ...(user.role !== 'citizen' && t.dispute ? { ownershipDispute: t.dispute } : {}),
});

async function view(store, user, c) {
  const tasks = await tasksOf(store, c.id);
  const log = (await store.list('audit', (a) => a.complaintId === c.id)).sort((a, b) => a.ts.localeCompare(b.ts));
  return {
    complaintId: c.id, status: c.status, description: c.description, createdAt: c.createdAt, updatedAt: c.updatedAt,
    analysis: c.analysis, recommendations: c.recommendations, gaps: c.gaps, explanation: c.explanation,
    triageReason: c.triageReason, plan: c.plan.map(({ key, title, department, departmentName, dependsOn }) => ({ key, title, department, departmentName, dependsOn })),
    tasks: tasks.map((t) => taskView(t, user)),
    timeline: log.filter((a) => user.role !== 'citizen' || !a.internal)
      .map(({ ts, actor, event, detail }) => ({ ts, actor, event, detail })),
  };
}

// ---------- complaint intake + AI pipeline ----------
export async function createComplaint(store, user, body) {
  requireRole(user, 'citizen', 'admin');
  const description = String(body.description || '').trim();
  if (description.length < 10) throw new HttpError(400, 'description must be at least 10 characters');
  const t = now().toISOString();
  const c = {
    id: newId('C'), userId: user.id, description, localityHint: body.locality || null,
    evidenceKeys: Array.isArray(body.evidenceKeys) ? body.evidenceKeys : [],
    status: 'SUBMITTED', analysis: null, recommendations: [], gaps: [], plan: [],
    explanation: null, triageReason: null, createdAt: t, updatedAt: t,
  };
  await store.put('complaints', c);
  await audit(store, c.id, user.id, 'COMPLAINT_RECEIVED', 'Complaint received and recorded');
  await runPipeline(store, c);
  return view(store, user, c);
}

async function triage(store, c, reason) {
  c.triageReason = `${INSUFFICIENT} (${reason})`;
  await audit(store, c.id, 'system', 'NEEDS_TRIAGE', c.triageReason);
  await transition(store, c, 'NEEDS_TRIAGE', 'system', reason);
}

// Steps map 1:1 to Step Functions states later: Analyze -> GraphLookup -> Choice -> Recommend -> WaitForApproval
export async function runPipeline(store, c) {
  c.analysis = await analyze(c.description, c.localityHint);
  await audit(store, c.id, 'system', 'AI_ANALYSIS',
    `Issues: ${c.analysis.issues.join(', ') || 'none'}; locality: ${c.analysis.locality || 'unresolved'} (source: ${c.analysis.source})`);
  await transition(store, c, 'ANALYZED', 'system');
  const { issues, locationId } = c.analysis;
  if (!issues.length) return triage(store, c, 'No recognised civic issue found in the complaint');
  if (!locationId) return triage(store, c, 'Location could not be matched to a known locality');

  const { candidates, gaps } = findResponsibilities(locationId, issues, c.analysis.confidence);
  c.gaps = gaps;
  if (!candidates.length) return triage(store, c, 'No verified ownership record for the affected assets');

  c.recommendations = candidates;
  c.plan = buildPlan(issues, locationId);
  c.explanation = explain(c);
  await audit(store, c.id, 'system', 'JURISDICTION_RECOMMENDED',
    candidates.map((r) => `${r.departmentName} (${r.role})`).join('; '));
  await transition(store, c, 'PENDING_APPROVAL', 'system', 'Awaiting authorised approval');
}

function buildPlan(issues, locationId) {
  const actions = new Map();
  for (const issue of issues) {
    for (const a of playbooks.issues[issue].actions) {
      if (actions.has(a.key)) continue;
      const asset = assetFor(locationId, a.assetType);
      if (!asset) continue;
      actions.set(a.key, {
        key: a.key, title: a.title, department: asset.maintainedBy, departmentName: deptName(asset.maintainedBy),
        dependsOn: [...a.dependsOn], evidence: evidenceFor(asset),
      });
    }
  }
  for (const rule of playbooks.crossDependencies) {
    const target = actions.get(rule.action);
    if (!target || !rule.if.every((i) => issues.includes(i))) continue;
    for (const d of rule.dependsOn) if (actions.has(d) && !target.dependsOn.includes(d)) target.dependsOn.push(d);
  }
  for (const a of actions.values()) a.dependsOn = a.dependsOn.filter((d) => actions.has(d));
  return [...actions.values()];
}

function explain(c) {
  const lines = c.recommendations.map((r) =>
    `${r.departmentName} (${r.role}) for ${r.issues.join(', ')}, per ${r.evidence.sourceDoc} verified ${r.evidence.verifiedOn}.`);
  const gaps = c.gaps.length ? ` Gaps needing manual review: ${c.gaps.map((g) => g.issue).join(', ')}.` : '';
  return `Derived from verified jurisdiction records. ${lines.join(' ')}${gaps} Requires authorised human approval before routing.`;
}

// ---------- approval, tasks, handovers ----------
async function openHandover(store, complaintId, task, fromDepartment) {
  const h = {
    id: newId('H'), complaintId, taskId: task.id, fromDepartment, toDepartment: task.department,
    sentAt: now().toISOString(), ackAt: null, disputedAt: null, escalated: false,
  };
  await store.put('handovers', h);
  await audit(store, complaintId, 'system', 'HANDOVER_SENT',
    `${fromDepartment === 'INTAKE' ? 'Intake' : deptName(fromDepartment)} -> ${deptName(task.department)}: ${task.title}`);
  return h;
}

export async function approveRouting(store, user, id) {
  requireRole(user, 'officer', 'admin');
  const c = must(await store.get('complaints', id), 'Complaint not found');
  if (c.status !== 'PENDING_APPROVAL') throw new HttpError(409, `Complaint is ${c.status}, not PENDING_APPROVAL`);
  if (user.role === 'officer' && !c.plan.some((p) => p.department === user.departmentId)) {
    throw new HttpError(403, 'Officer department is not part of this plan');
  }
  const idByKey = Object.fromEntries(c.plan.map((p) => [p.key, newId('T')]));
  const created = now().toISOString();
  const tasks = c.plan.map((p) => ({
    id: idByKey[p.key], complaintId: c.id, key: p.key, title: p.title, department: p.department,
    dependsOn: p.dependsOn.map((k) => idByKey[k]), status: p.dependsOn.length ? 'BLOCKED' : 'READY',
    evidence: [], createdAt: created,
  }));
  for (const t of tasks) await store.put('tasks', t);
  for (const t of tasks.filter((x) => x.status === 'READY')) await openHandover(store, c.id, t, 'INTAKE');
  c.approvedBy = user.id; c.approvedAt = created;
  await transition(store, c, 'ROUTED', user.id, 'Routing approved by authorised user');
  return view(store, user, c);
}

// Admin fallback when the engine could not find verified ownership (NEEDS_TRIAGE).
export async function manualRoute(store, user, id, body) {
  requireRole(user, 'admin');
  const c = must(await store.get('complaints', id), 'Complaint not found');
  if (c.status !== 'NEEDS_TRIAGE') throw new HttpError(409, `Complaint is ${c.status}, not NEEDS_TRIAGE`);
  const list = Array.isArray(body.assignments) ? body.assignments : [];
  if (!list.length) throw new HttpError(400, 'assignments[] required: {key,title,department,dependsOn?}');
  const keys = new Set(list.map((a) => a.key));
  for (const a of list) {
    if (!a.key || !a.title || !graph.departments.some((d) => d.id === a.department)) throw new HttpError(400, `Invalid assignment: ${a.key}`);
    if ((a.dependsOn || []).some((k) => !keys.has(k))) throw new HttpError(400, `Unknown dependency in ${a.key}`);
  }
  const manual = { assetId: null, assetType: null, sourceDoc: 'MANUAL-ADMIN-ENTRY', sourceDate: null, verifiedOn: null };
  c.plan = list.map((a) => ({ key: a.key, title: a.title, department: a.department, departmentName: deptName(a.department), dependsOn: a.dependsOn || [], evidence: manual }));
  c.recommendations = [...new Set(c.plan.map((p) => p.department))].map((d) => ({
    department: d, departmentName: deptName(d), role: 'manual', issues: [], confidence: null, evidence: manual, records: [manual],
  }));
  c.explanation = 'Manually routed by an administrator; ownership record still to be verified.';
  await transition(store, c, 'PENDING_APPROVAL', user.id, 'Manual routing entered by admin');
  return view(store, user, c);
}

async function loadTask(store, id) { return must(await store.get('tasks', id), 'Task not found'); }
async function openHandoverFor(store, taskId) {
  const hs = await store.list('handovers', (h) => h.taskId === taskId && !h.ackAt && !h.disputedAt);
  return hs.sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0] || null;
}

export async function acknowledgeTask(store, user, id) {
  const t = await loadTask(store, id);
  requireDept(user, t);
  if (t.status !== 'READY') throw new HttpError(409, `Task is ${t.status}, not READY`);
  t.status = 'ACKNOWLEDGED'; t.ackedAt = now().toISOString();
  await store.put('tasks', t);
  const h = await openHandoverFor(store, t.id);
  if (h) { h.ackAt = t.ackedAt; await store.put('handovers', h); }
  await audit(store, t.complaintId, user.id, 'TASK_ACKNOWLEDGED', `${deptName(t.department)} acknowledged: ${t.title}`);
  const c = await store.get('complaints', t.complaintId);
  if (c.status === 'ROUTED') await transition(store, c, 'IN_PROGRESS', user.id, 'First acknowledgement received');
  return taskView(t, user);
}

export async function resolveTask(store, user, id, body) {
  const t = await loadTask(store, id);
  requireDept(user, t);
  if (t.status !== 'ACKNOWLEDGED') throw new HttpError(409, `Task is ${t.status}, not ACKNOWLEDGED`);
  const ev = [].concat(body.evidence || []).filter(Boolean);
  if (!ev.length) throw new HttpError(400, 'Completion evidence is required (S3 key or description)');
  t.evidence = ev.map((e) => ({ ref: String(e), uploadedBy: user.id, ts: now().toISOString() }));
  t.status = 'DONE'; t.doneAt = now().toISOString();
  await store.put('tasks', t);
  await audit(store, t.complaintId, user.id, 'TASK_COMPLETED', `${deptName(t.department)} completed: ${t.title}`);

  const siblings = await tasksOf(store, t.complaintId);
  const byId = Object.fromEntries(siblings.map((s) => [s.id, s]));
  for (const s of siblings) {
    if (s.status === 'BLOCKED' && s.dependsOn.every((d) => byId[d]?.status === 'DONE')) {
      s.status = 'READY'; await store.put('tasks', s);
      if (s.department !== t.department) await openHandover(store, s.complaintId, s, t.department); // cross-department = handover
      else await audit(store, s.complaintId, 'system', 'TASK_READY', `Next action ready for ${deptName(s.department)}: ${s.title}`);
    }
  }
  if (siblings.every((s) => s.status === 'DONE')) {
    const c = await store.get('complaints', t.complaintId);
    await transition(store, c, 'PENDING_VERIFICATION', 'system', 'All actions completed; awaiting citizen verification');
  }
  return taskView(t, user);
}

// Officer says "this is not our asset" -> recorded, never silently re-routed.
export async function handoverTask(store, user, id, body) {
  const t = await loadTask(store, id);
  requireDept(user, t);
  if (!['READY', 'ACKNOWLEDGED'].includes(t.status)) throw new HttpError(409, `Task is ${t.status}`);
  if (!body.reason) throw new HttpError(400, 'reason is required');
  t.status = 'OWNERSHIP_DISPUTED';
  t.dispute = { by: user.id, reason: String(body.reason), ownershipEvidence: body.ownershipEvidence || null, ts: now().toISOString() };
  await store.put('tasks', t);
  const h = await openHandoverFor(store, t.id);
  if (h) { h.disputedAt = t.dispute.ts; await store.put('handovers', h); }
  await audit(store, t.complaintId, user.id, 'OWNERSHIP_DISPUTED',
    `${deptName(t.department)} states it is not responsible: ${t.dispute.reason}. Awaiting authorised verification.`);
  return taskView(t, user);
}

export async function reassignTask(store, user, id, body) {
  requireRole(user, 'admin');
  const t = await loadTask(store, id);
  if (t.status !== 'OWNERSHIP_DISPUTED') throw new HttpError(409, `Task is ${t.status}, not OWNERSHIP_DISPUTED`);
  if (!graph.departments.some((d) => d.id === body.toDepartment)) throw new HttpError(400, 'Unknown toDepartment');
  const from = t.department;
  t.department = body.toDepartment; t.status = 'READY'; delete t.dispute;
  await store.put('tasks', t);
  await openHandover(store, t.complaintId, t, from);
  await audit(store, t.complaintId, user.id, 'TASK_REASSIGNED',
    `Reassigned ${deptName(from)} -> ${deptName(t.department)}. Jurisdiction-graph update proposed; needs authorised verification.`, { internal: true });
  return taskView(t, user);
}

export async function verifyComplaint(store, user, id, body) {
  const c = must(await store.get('complaints', id), 'Complaint not found');
  if (user.role !== 'admin' && c.userId !== user.id) throw new HttpError(403, 'Only the complainant can verify');
  if (c.status !== 'PENDING_VERIFICATION') throw new HttpError(409, `Complaint is ${c.status}, not PENDING_VERIFICATION`);
  const ok = body.confirmed === true;
  await audit(store, c.id, user.id, ok ? 'CITIZEN_CONFIRMED' : 'CITIZEN_DISPUTED', String(body.note || ''));
  await transition(store, c, ok ? 'RESOLVED' : 'DISPUTED', user.id);
  return view(store, user, c);
}

// ---------- escalation (call from a timer locally; EventBridge/Step Functions Wait on AWS) ----------
export async function checkEscalations(store) {
  const limitMs = escalationSeconds() * 1000;
  const open = await store.list('handovers', (h) => !h.ackAt && !h.disputedAt && !h.escalated && !h.synthetic
    && now() - new Date(h.sentAt) >= limitMs);
  const out = [];
  for (const h of open) {
    h.escalated = true; h.escalatedAt = now().toISOString();
    await store.put('handovers', h);
    await audit(store, h.complaintId, 'system', 'ESCALATION_RECOMMENDED',
      `No acknowledgement from ${deptName(h.toDepartment)} within ${escalationSeconds()}s (configured demo window). ` +
      `Recommend escalation to the supervising officer under the configured rule.`);
    out.push({ handoverId: h.id, complaintId: h.complaintId, toDepartment: h.toDepartment });
  }
  return out;
}

// ---------- listing, graph view, analytics ----------
export async function listComplaints(store, user) {
  const [all, tasks] = await Promise.all([store.list('complaints'), store.list('tasks')]);
  return all
    .filter((c) => canSee(user, c, tasks.filter((t) => t.complaintId === c.id)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((c) => ({
      complaintId: c.id, status: c.status, description: c.description, createdAt: c.createdAt,
      departments: [...new Set(c.plan.map((p) => p.department))],
    }));
}

export async function getComplaintView(store, user, id) {
  const { c } = await loadVisible(store, user, id);
  return view(store, user, c);
}

export async function graphView(store, user, id) {
  const { c } = await loadVisible(store, user, id);
  const nodes = new Map(); const edges = [];
  const node = (nid, type, label) => nodes.set(nid, { id: nid, type, label });
  const edge = (from, to, type) => edges.push({ from, to, type });
  node(c.id, 'Complaint', `Complaint ${c.id}`);
  const a = c.analysis;
  if (a?.locationId) node(a.locationId, 'Location', a.locality);
  const depts = new Set();
  for (const issue of a?.issues || []) {
    node(`issue:${issue}`, 'Issue', issue); edge(c.id, `issue:${issue}`, 'COMPLAINT_HAS_ISSUE');
    const asset = a.locationId ? assetFor(a.locationId, ISSUE_ASSET[issue]) : null;
    if (!asset) continue;
    node(asset.id, 'Asset', asset.type);
    edge(`issue:${issue}`, asset.id, 'ISSUE_AFFECTS_ASSET');
    edge(asset.id, a.locationId, 'ASSET_LOCATED_IN');
    node(asset.maintainedBy, 'Department', deptName(asset.maintainedBy)); depts.add(asset.maintainedBy);
    edge(asset.id, asset.maintainedBy, 'ASSET_MAINTAINED_BY');
  }
  for (const p of c.plan) {
    node(`action:${p.key}`, 'Action', p.title);
    node(p.department, 'Department', deptName(p.department)); depts.add(p.department);
    edge(p.department, `action:${p.key}`, 'DEPARTMENT_RESPONSIBLE_FOR');
    for (const d of p.dependsOn) edge(`action:${p.key}`, `action:${d}`, 'ACTION_DEPENDS_ON');
  }
  for (const [x, y] of graph.coordinatesWith) if (depts.has(x) && depts.has(y)) edge(x, y, 'DEPARTMENT_COORDINATES_WITH');
  return { nodes: [...nodes.values()], edges };
}

export async function analytics(store, user) {
  requireRole(user, 'admin');
  const [cs, hs, ts] = await Promise.all([store.list('complaints'), store.list('handovers'), store.list('tasks')]);
  const pairs = new Map();
  for (const h of hs) {
    const k = `${h.fromDepartment}>${h.toDepartment}`;
    const p = pairs.get(k) || { from: h.fromDepartment, to: h.toDepartment, sent: 0, acknowledged: 0, disputed: 0, escalated: 0, ackSecs: [] };
    p.sent++;
    if (h.ackAt) { p.acknowledged++; p.ackSecs.push((new Date(h.ackAt) - new Date(h.sentAt)) / 1000); }
    if (h.disputedAt) p.disputed++;
    if (h.escalated) p.escalated++;
    pairs.set(k, p);
  }
  const bottlenecks = [...pairs.values()].map((p) => {
    const ackRate = p.sent ? p.acknowledged / p.sent : 0;
    return {
      from: p.from, fromName: p.from === 'INTAKE' ? 'Intake' : deptName(p.from), to: p.to, toName: deptName(p.to),
      sent: p.sent, acknowledged: p.acknowledged, disputed: p.disputed, escalated: p.escalated,
      ackRate: Number(ackRate.toFixed(2)),
      avgAckSeconds: p.ackSecs.length ? Math.round(p.ackSecs.reduce((a, b) => a + b, 0) / p.ackSecs.length) : null,
      flag: p.sent >= 3 && (ackRate < 0.5 || p.escalated / p.sent >= 0.3) ? 'POSSIBLE_BOTTLENECK' : null,
    };
  }).sort((a, b) => a.ackRate - b.ackRate);
  const deptsByComplaint = new Map();
  for (const t of ts) deptsByComplaint.set(t.complaintId, (deptsByComplaint.get(t.complaintId) || new Set()).add(t.department));
  const byStatus = {};
  for (const c of cs) byStatus[c.status] = (byStatus[c.status] || 0) + 1;
  return {
    totals: {
      complaints: cs.length,
      multiDepartment: [...deptsByComplaint.values()].filter((s) => s.size > 1).length,
      handoverDelays: hs.filter((h) => h.escalated).length,
      disputedAssignments: hs.filter((h) => h.disputedAt).length,
    },
    byStatus, bottlenecks,
    syntheticHandoversIncluded: hs.filter((h) => h.synthetic).length,
  };
}
