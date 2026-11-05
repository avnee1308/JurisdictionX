// Offline accuracy check against a hand-labelled gold set (data/gold.json). Expand to 30-50 cases before the demo.
// Report the REAL sample size; do not claim production-level accuracy from a small synthetic set.
import fs from 'node:fs';
import { analyze } from '../src/analyzer.js';
import { findResponsibilities } from '../src/graph.js';

const gold = JSON.parse(fs.readFileSync(new URL('../data/gold.json', import.meta.url), 'utf8'));
let issueOk = 0, top1 = 0, top3 = 0, routable = 0, triageOk = 0, triageCases = 0, evidenceOk = 0, recs = 0;
const fails = [];

for (const g of gold) {
  const a = await analyze(g.text);
  const sameIssues = a.issues.length === g.issues.length && g.issues.every((i) => a.issues.includes(i));
  if (sameIssues) issueOk++; else fails.push(`ISSUES  "${g.text.slice(0, 60)}..." got [${a.issues}] want [${g.issues}]`);

  const { candidates } = a.issues.length && a.locationId ? findResponsibilities(a.locationId, a.issues, a.confidence) : { candidates: [] };
  const got = candidates.map((c) => c.department);
  if (g.primary === null) {
    triageCases++;
    if (!got.length) triageOk++; else fails.push(`TRIAGE  "${g.text.slice(0, 60)}..." expected no recommendation, got [${got}]`);
    continue;
  }
  routable++;
  if (got[0] === g.primary) top1++; else fails.push(`TOP1    "${g.text.slice(0, 60)}..." got ${got[0]} want ${g.primary}`);
  const want = [g.primary, ...(g.alsoTop3 || [])];
  if (want.every((d) => got.slice(0, 3).includes(d))) top3++; else fails.push(`TOP3    "${g.text.slice(0, 60)}..." got [${got}] want ⊇ [${want}]`);
  candidates.forEach((c) => { recs++; if (c.evidence?.sourceDoc && c.evidence?.verifiedOn) evidenceOk++; });
}

const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(0)}%` : 'n/a');
console.log(`Gold set size N=${gold.length} (synthetic, small — indicative only)`);
console.log(`Issue classification exact-match : ${issueOk}/${gold.length} (${pct(issueOk, gold.length)})`);
console.log(`Top-1 routing accuracy           : ${top1}/${routable} (${pct(top1, routable)})`);
console.log(`Top-3 routing (all expected)     : ${top3}/${routable} (${pct(top3, routable)})`);
console.log(`Correct safe refusal (triage)    : ${triageOk}/${triageCases} (${pct(triageOk, triageCases)})`);
console.log(`Evidence coverage                : ${evidenceOk}/${recs} (${pct(evidenceOk, recs)})`);
if (fails.length) { console.log('\nFailures:'); fails.forEach((f) => console.log(' -', f)); }
