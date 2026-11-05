import { HttpError, newId, now } from './util.js';

const LEGAL = {
  SUBMITTED: ['ANALYZED'],
  ANALYZED: ['PENDING_APPROVAL', 'NEEDS_TRIAGE'],
  NEEDS_TRIAGE: ['PENDING_APPROVAL'],
  PENDING_APPROVAL: ['ROUTED'],
  ROUTED: ['IN_PROGRESS'],
  IN_PROGRESS: ['PENDING_VERIFICATION'],
  PENDING_VERIFICATION: ['RESOLVED', 'DISPUTED'],
  DISPUTED: ['IN_PROGRESS'],
  RESOLVED: [],
};

export async function audit(store, complaintId, actor, event, detail = '', { internal = false } = {}) {
  await store.put('audit', { id: newId('A'), complaintId, ts: now().toISOString(), actor, event, detail, internal });
}

// The ONLY place a complaint's status changes. Enforces legal moves and writes the audit trail.
export async function transition(store, complaint, to, actor, note = '') {
  const from = complaint.status;
  if (!(LEGAL[from] || []).includes(to)) throw new HttpError(409, `Illegal status change ${from} -> ${to}`);
  complaint.status = to;
  complaint.updatedAt = now().toISOString();
  await store.put('complaints', complaint);
  await audit(store, complaint.id, actor, `STATUS_${to}`, `${from} -> ${to}${note ? `: ${note}` : ''}`);
}
