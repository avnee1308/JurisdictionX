// Local dev server (no dependencies). On AWS the same `handle()` runs behind API Gateway via src/lambda.js.
import http from 'node:http';
import { createStore } from './store.js';
import { handle } from './handlers.js';
import { checkEscalations } from './workflow.js';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type,x-demo-user',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
};
const store = await createStore(process.env.STORE || 'file');

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  let raw = '';
  for await (const chunk of req) raw += chunk;
  let body = null;
  try { body = raw ? JSON.parse(raw) : null; } catch { res.writeHead(400, CORS); return res.end('{"error":"Invalid JSON"}'); }
  const url = new URL(req.url, 'http://localhost');
  const r = await handle(store, { method: req.method, path: url.pathname, headers: req.headers, body });
  res.writeHead(r.statusCode, { 'content-type': 'application/json', ...CORS });
  res.end(JSON.stringify(r.body));
}).listen(process.env.PORT || 3000, () => console.log(`JurisdictionX API on :${process.env.PORT || 3000} (store=${store.kind})`));

setInterval(() => checkEscalations(store).catch(console.error), 10_000);
