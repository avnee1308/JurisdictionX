// End-to-end scripted run of the demo scenario, through the same router the API uses.
// Usage: node scripts/demo.js   (ESCALATION_SECONDS defaults to 90; the clock is fast-forwarded here)
import { createStore } from '../src/store.js';
import { handle } from '../src/handlers.js';
import { checkEscalations } from '../src/workflow.js';
import { advanceClock } from '../src/util.js';

const store = await createStore('memory');
const call = async (method, path, user, body) => {
  const r = await handle(store, { method, path, headers: { 'x-demo-user': user }, body });
  if (r.statusCode >= 400) { console.log(`  !! ${method} ${path} as ${user} -> ${r.statusCode} ${r.body.error}`); }
  return r.body;
};
const step = (s) => console.log(`\n== ${s}`);

step('1. Citizen submits complaint');
let c = await call('POST', '/complaints', 'citizen1', {
  description: 'There is waterlogging on the road near Example Colony A. The drainage system is overflowing and the road has started breaking.',
});
console.log(' id:', c.complaintId, '| status:', c.status);
console.log(' issues:', c.analysis.issues.join(', '), '| locality:', c.analysis.locality, '| source:', c.analysis.source);
c.recommendations.forEach((r) => console.log(`  -> ${r.departmentName} [${r.role}] ${r.issues} | evidence ${r.evidence.sourceDoc} verified ${r.evidence.verifiedOn}`));
console.log(' plan:', c.plan.map((p) => `${p.key}(${p.department})<-[${p.dependsOn}]`).join('  '));
const id = c.complaintId;

step('2. Authorised approval');
c = await call('POST', `/complaints/${id}/approve-routing`, 'admin');
console.log(' status:', c.status, '| tasks:', c.tasks.map((t) => `${t.key}:${t.status}`).join(' '));

const task = async (key) => (await call('GET', `/complaints/${id}`, 'admin')).tasks.find((t) => t.key === key);
const ackResolve = async (key, user) => {
  const t = await task(key);
  await call('POST', `/tasks/${t.taskId}/acknowledge`, user);
  await call('POST', `/tasks/${t.taskId}/resolve`, user, { evidence: `evidence/${key}.jpg` });
  console.log(`  ${user}: ${key} done`);
};

step('3. Drainage dept works its tasks');
await ackResolve('inspect_drain', 'officer-drainage');
await ackResolve('clear_drain', 'officer-drainage');

step('4. Handover to roads goes unacknowledged -> escalation');
advanceClock(120_000);
console.log(' escalations:', JSON.stringify(await checkEscalations(store)));

step('5. Roads dept finally acts');
await ackResolve('inspect_road', 'officer-roads');
await ackResolve('repair_road', 'officer-roads');
c = await call('GET', `/complaints/${id}`, 'citizen1');
console.log(' status:', c.status);

step('6. Citizen verifies');
c = await call('POST', `/complaints/${id}/verify`, 'citizen1', { confirmed: true, note: 'Water cleared, road repaired' });
console.log(' status:', c.status);

step('7. Timeline (citizen view)');
c.timeline.forEach((e) => console.log(`  ${e.event.padEnd(26)} ${e.detail}`));

step('8. Admin analytics + graph');
const a = await call('GET', '/admin/analytics', 'admin');
console.log(' totals:', JSON.stringify(a.totals));
a.bottlenecks.forEach((b) => console.log(`  ${b.fromName} -> ${b.toName}: sent ${b.sent}, acked ${b.acknowledged}, escalated ${b.escalated}`));
const g = await call('GET', `/graph/${id}`, 'admin');
console.log(` graph: ${g.nodes.length} nodes, ${g.edges.length} edges`);

step('9. Safety checks');
const t1 = await call('POST', '/complaints', 'citizen1', { description: 'The streetlight is not working in colony c at night.' });
console.log(' no verified record ->', t1.status, '|', t1.triageReason);
const t2 = await call('POST', '/complaints', 'citizen1', { description: 'Waterlogging near my house, nothing is fixed.' });
console.log(' unknown location  ->', t2.status);
await call('GET', `/complaints/${id}`, 'citizen2');
