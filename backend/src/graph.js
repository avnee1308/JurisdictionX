import fs from 'node:fs';

const load = (f) => JSON.parse(fs.readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
export const graph = load('graph.json');
export const playbooks = load('playbooks.json');

// Issue -> asset type. Key order = priority order (first present issue is the "primary" issue).
export const ISSUE_ASSET = {
  drainage_overflow: 'drainage_network',
  road_damage: 'road_segment',
  waste_accumulation: 'waste_point',
  streetlight_failure: 'streetlight',
};

export const deptName = (id) => graph.departments.find((d) => d.id === id)?.name || id;

export function findLocation(text = '') {
  const t = String(text).toLowerCase();
  return graph.locations.find((l) => l.aliases.some((a) => new RegExp(`\\b${a}\\b`).test(t))) || null;
}

export const assetFor = (locationId, assetType) =>
  graph.assets.find((a) => a.locationId === locationId && a.type === assetType) || null;

export function evidenceFor(asset) {
  const s = graph.sources[asset.source];
  return { assetId: asset.id, assetType: asset.type, sourceDoc: s.doc, sourceDate: s.date, verifiedOn: s.verifiedOn };
}

// Core of the "never invent responsibility" rule: candidates come ONLY from verified asset records.
export function findResponsibilities(locationId, issues, confidence = {}) {
  const byDept = new Map();
  const gaps = [];
  issues.forEach((issue, idx) => {
    const asset = assetFor(locationId, ISSUE_ASSET[issue]);
    if (!asset) {
      gaps.push({ issue, reason: `No verified ${ISSUE_ASSET[issue]} record for this location` });
      return;
    }
    const entry = byDept.get(asset.maintainedBy) || {
      department: asset.maintainedBy,
      departmentName: deptName(asset.maintainedBy),
      role: 'secondary',
      issues: [],
      confidence: confidence[issue] ?? null,
      evidence: null,
      records: [],
    };
    entry.issues.push(issue);
    entry.records.push(evidenceFor(asset));
    entry.evidence = entry.records[0];
    if (idx === 0) { entry.role = 'primary'; entry.confidence = confidence[issue] ?? entry.confidence; }
    byDept.set(asset.maintainedBy, entry);
  });
  const candidates = [...byDept.values()].sort((a, b) => (a.role === 'primary' ? -1 : 0) - (b.role === 'primary' ? -1 : 0));
  return { candidates, gaps };
}
