import fs from 'node:fs';
import path from 'node:path';

const TABLES = ['complaints', 'tasks', 'handovers', 'audit'];

// Store interface: get(table,id) / put(table,item) / list(table,filterFn). Every item has an `id`.
// kind: 'memory' | 'file' (local dev) | 'dynamo' (AWS)
export async function createStore(kind = process.env.STORE || 'memory') {
  if (kind === 'dynamo') {
    const m = await import('./store-dynamo.js');
    return m.createDynamoStore();
  }
  const file = kind === 'file' ? (process.env.STORE_FILE || './.data/store.json') : null;
  let data = Object.fromEntries(TABLES.map((t) => [t, {}]));
  if (file && fs.existsSync(file)) data = { ...data, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  const persist = () => {
    if (!file) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  };
  return {
    kind,
    async get(t, id) { return data[t][id] ? structuredClone(data[t][id]) : null; },
    async put(t, item) { data[t][item.id] = structuredClone(item); persist(); return item; },
    async list(t, filter = () => true) { return Object.values(data[t]).map((x) => structuredClone(x)).filter(filter); },
  };
}
