import { ISSUE_ASSET, findLocation } from './graph.js';

const ISSUES = Object.keys(ISSUE_ASSET);

// Deterministic fallback so the pipeline works with no Bedrock access (and is fast/testable).
const RULES = {
  drainage_overflow: /(waterlog|water-log|flood|drain|sewer|overflow|stagnant|water[^.]{0,30}(road|street|lane|accumulat))/i,
  road_damage: /(pothole|crack|road[^.]{0,40}(break|broke|damag|deteriorat|cave|sink)|(break|broke|damag|deteriorat)[^.]{0,20}road)/i,
  waste_accumulation: /(garbage|waste|trash|litter|dump)/i,
  streetlight_failure: /(street ?light|lamp ?post|dark (street|lane|road)|lights? (is|are)(n't| not) working)/i,
};

function rulesAnalysis(text) {
  const found = ISSUES.filter((i) => RULES[i].test(text));
  const urgency = /(accident|injur|child|school|hospital|electric|shock|several times|weeks|overflow)/i.test(text)
    ? 'high' : found.length ? 'medium' : 'low';
  return { issues: found, confidence: Object.fromEntries(found.map((i) => [i, 0.7])), urgency, source: 'rules' };
}

async function bedrockAnalysis(text) {
  const { BedrockRuntimeClient, ConverseCommand } = await import('@aws-sdk/client-bedrock-runtime');
  const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || process.env.AWS_REGION });
  const system =
    'You extract structured data from civic complaints. Reply with ONLY a JSON object: ' +
    '{"issues":[{"issue":string,"confidence":number}],"urgency":"low"|"medium"|"high"}. ' +
    `Allowed issue values: ${ISSUES.join(', ')}. Confidence is your own uncalibrated estimate 0-1. ` +
    'Do NOT decide which department is responsible.';
  const res = await client.send(new ConverseCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    system: [{ text: system }],
    messages: [{ role: 'user', content: [{ text }] }],
    inferenceConfig: { maxTokens: 400, temperature: 0 },
  }));
  const raw = res.output.message.content.map((c) => c.text || '').join('');
  const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
  const list = (parsed.issues || []).filter((x) => ISSUES.includes(x.issue));
  if (!['low', 'medium', 'high'].includes(parsed.urgency)) throw new Error('bad urgency from model');
  const issues = ISSUES.filter((i) => list.some((x) => x.issue === i)); // enforce priority order
  const confidence = Object.fromEntries(list.map((x) => [x.issue, Math.min(1, Math.max(0, Number(x.confidence) || 0))]));
  return { issues, confidence, urgency: parsed.urgency, source: 'bedrock' };
}

export async function analyze(text, localityHint) {
  let base = null;
  let fallbackReason = null;
  if (process.env.USE_BEDROCK === '1') {
    try { base = await bedrockAnalysis(text); }
    catch (e) { fallbackReason = String(e.message || e).slice(0, 200); }
  }
  if (!base) base = rulesAnalysis(text);
  // Locality must resolve to a KNOWN graph location, never to a model-invented one.
  const loc = findLocation(localityHint || '') || findLocation(text);
  return {
    issues: base.issues,
    assets: base.issues.map((i) => ISSUE_ASSET[i]),
    confidence: base.confidence,
    urgency: base.urgency,
    locality: loc?.name || null,
    locationId: loc?.id || null,
    source: base.source,
    fallbackReason,
    confidenceNote: 'Model/rule output, not proof of jurisdiction',
  };
}
