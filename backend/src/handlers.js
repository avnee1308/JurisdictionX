import { getUser } from './users.js';
import { HttpError } from './util.js';
import * as wf from './workflow.js';

const compile = (p) => new RegExp('^' + p.replace(/:([a-zA-Z]+)/g, '(?<$1>[^/]+)') + '$');
const R = (method, path, fn, status = 200) => ({ method, re: compile(path), fn, status });

const ROUTES = [
  R('POST', '/complaints', (c) => wf.createComplaint(c.store, c.user, c.body), 201),
  R('GET', '/complaints', (c) => wf.listComplaints(c.store, c.user)),
  R('GET', '/complaints/:id', (c) => wf.getComplaintView(c.store, c.user, c.params.id)),
  R('POST', '/complaints/:id/approve-routing', (c) => wf.approveRouting(c.store, c.user, c.params.id)),
  R('POST', '/complaints/:id/manual-route', (c) => wf.manualRoute(c.store, c.user, c.params.id, c.body)),
  R('POST', '/complaints/:id/verify', (c) => wf.verifyComplaint(c.store, c.user, c.params.id, c.body)),
  R('GET', '/graph/:id', (c) => wf.graphView(c.store, c.user, c.params.id)),
  R('POST', '/tasks/:id/acknowledge', (c) => wf.acknowledgeTask(c.store, c.user, c.params.id)),
  R('POST', '/tasks/:id/handover', (c) => wf.handoverTask(c.store, c.user, c.params.id, c.body)),
  R('POST', '/tasks/:id/resolve', (c) => wf.resolveTask(c.store, c.user, c.params.id, c.body)),
  R('POST', '/tasks/:id/reassign', (c) => wf.reassignTask(c.store, c.user, c.params.id, c.body)),
  R('GET', '/admin/analytics', (c) => wf.analytics(c.store, c.user)),
  R('POST', '/admin/run-escalations', async (c) => {
    if (c.user.role !== 'admin') throw new HttpError(403, 'Requires role: admin');
    return { escalated: await wf.checkEscalations(c.store) };
  }),
];

export async function handle(store, { method, path, headers = {}, body = null }) {
  try {
    if (method === 'GET' && path === '/health') return { statusCode: 200, body: { ok: true, store: store.kind } };
    const route = ROUTES.find((r) => r.method === method && r.re.test(path));
    if (!route) throw new HttpError(404, 'Not found');
    const params = path.match(route.re).groups || {};
    const user = getUser(headers);
    const result = await route.fn({ store, user, params, body: body || {} });
    return { statusCode: route.status, body: result };
  } catch (e) {
    if (e instanceof HttpError) return { statusCode: e.status, body: { error: e.message } };
    console.error(e);
    return { statusCode: 500, body: { error: 'Internal error' } };
  }
}
