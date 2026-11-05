// AWS entry points. API Gateway HTTP API (payload v2) -> handler. Scheduler/Step Functions -> escalationHandler.
import { createStore } from './store.js';
import { handle } from './handlers.js';
import { checkEscalations } from './workflow.js';

let storeP;
const getStore = () => (storeP ||= createStore(process.env.STORE || 'dynamo'));
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type,x-demo-user',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
};

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  const headers = Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  let body = null;
  if (event.body) {
    try { body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body); }
    catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
  }
  const r = await handle(await getStore(), { method, path: event.rawPath || event.path, headers, body });
  return { statusCode: r.statusCode, headers: { 'content-type': 'application/json', ...CORS }, body: JSON.stringify(r.body) };
};

export const escalationHandler = async () => checkEscalations(await getStore());
