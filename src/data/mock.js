// ALL DATA HERE IS SYNTHETIC / ILLUSTRATIVE. Not real government records or statistics.

export const complaints = [
  { id: 'JX-001', title: 'Waterlogging and breaking road near Colony Gate 2', locality: 'Demo Locality, Delhi', status: 'In coordination', stage: 4, urgency: 'High', filed: '28 Oct 2026', issues: ['Drainage overflow', 'Road damage'], departments: ['Drainage Authority', 'Road Authority'] },
  { id: 'JX-002', title: 'Streetlight out on park lane', locality: 'Demo Locality, Delhi', status: 'Assigned', stage: 2, urgency: 'Medium', filed: '31 Oct 2026', issues: ['Streetlight failure'], departments: ['Electrical Maintenance'] },
  { id: 'JX-003', title: 'Garbage piled against storm drain', locality: 'Demo Market Road', status: 'Awaiting verification', stage: 1, urgency: 'Medium', filed: '2 Nov 2026', issues: ['Waste accumulation', 'Drain blockage'], departments: ['Sanitation', 'Drainage Authority'] },
  { id: 'JX-004', title: 'Pothole outside school gate', locality: 'Demo School Lane', status: 'Resolved', stage: 6, urgency: 'Low', filed: '14 Oct 2026', issues: ['Road damage'], departments: ['Road Authority'] },
]

export const timeline = [
  { label: 'Complaint received', actor: 'Citizen', time: '28 Oct, 09:14', state: 'done', note: 'Photo and location attached' },
  { label: 'AI analysis complete', actor: 'Bedrock', time: '28 Oct, 09:15', state: 'done', note: 'Two issues and two assets detected' },
  { label: 'Jurisdiction verified', actor: 'Nodal officer', time: '28 Oct, 11:40', state: 'done', note: 'Routing approved against ownership records' },
  { label: 'Drain inspection', actor: 'Drainage Authority', time: '29 Oct, 15:05', state: 'done', note: 'Blockage found 40 m from the colony gate' },
  { label: 'Blockage removal', actor: 'Drainage Authority', time: 'In progress', state: 'active', note: 'Crew assigned, due 5 Nov' },
  { label: 'Road inspection handover', actor: 'Road Authority', time: 'Waiting 52 h', state: 'delayed', note: 'No acknowledgement yet. Escalation recommended.' },
  { label: 'Road restoration', actor: 'Road Authority', time: 'Not started', state: 'pending', note: 'Starts after road inspection' },
  { label: 'Resolution verification', actor: 'Citizen and officer', time: 'Not started', state: 'pending', note: 'Citizen confirms or disputes' },
]

export const tasks = [
  { id: 'T-101', complaint: 'JX-001', action: 'Inspect road after drain clearance', dependsOn: 'Blockage removal (Drainage Authority)', due: '6 Nov', status: 'Awaiting acknowledgement', overdue: true },
  { id: 'T-102', complaint: 'JX-003', action: 'Remove waste piled near storm drain', dependsOn: null, due: '5 Nov', status: 'Awaiting acknowledgement', overdue: false },
  { id: 'T-103', complaint: 'JX-002', action: 'Replace faulty streetlight fuse', dependsOn: null, due: '7 Nov', status: 'Acknowledged', overdue: false },
  { id: 'T-104', complaint: 'JX-001', action: 'Restore road surface', dependsOn: 'Road inspection (T-101)', due: '12 Nov', status: 'Blocked by dependency', overdue: false },
]

export const analysis = {
  complaint_id: 'JX-001',
  issues: ['Drainage overflow', 'Road damage'],
  assets: ['Drainage network', 'Road segment'],
  locality: 'Demo Locality',
  urgency: 'High',
  departments: [
    { name: 'Drainage Authority', role: 'Primary investigation', confidence: 0.91, evidence: 'Asset ownership record DR-12, verified 12 Oct 2026 (demo)' },
    { name: 'Road Authority', role: 'Supporting coordination', confidence: 0.83, evidence: 'Road maintenance schedule RD-07, verified 12 Oct 2026 (demo)' },
  ],
  dependencies: [{ first: 'Drainage inspection', next: 'Road restoration' }],
  requires_human_approval: true,
}

export const graph = {
  nodes: [
    { id: 'c', type: 'complaint', label: 'Complaint JX-001', x: 70, y: 270, detail: 'Waterlogging with road deterioration, reported three times.' },
    { id: 'i1', type: 'issue', label: 'Drainage overflow', x: 250, y: 140, detail: 'Primary issue extracted by the AI model.' },
    { id: 'i2', type: 'issue', label: 'Road damage', x: 250, y: 400, detail: 'Secondary issue, caused by standing water.' },
    { id: 'a1', type: 'asset', label: 'Drainage line', x: 440, y: 90, detail: 'Storm drain serving the colony road.', source: 'Ownership record DR-12', verified: '12 Oct 2026' },
    { id: 'loc', type: 'location', label: 'Demo Locality', x: 440, y: 270, detail: 'Road segment between Gate 1 and Gate 2.' },
    { id: 'a2', type: 'asset', label: 'Road segment', x: 440, y: 450, detail: 'Internal road, maintenance owner differs from drain owner.', source: 'Maintenance schedule RD-07', verified: '12 Oct 2026' },
    { id: 'd1', type: 'department', label: 'Drainage Authority', x: 860, y: 130, detail: 'Primary responsibility for drain inspection and repair.', source: 'Ownership record DR-12', verified: '12 Oct 2026' },
    { id: 'd2', type: 'department', label: 'Road Authority', x: 860, y: 410, detail: 'Supporting responsibility for road restoration.', source: 'Maintenance schedule RD-07', verified: '12 Oct 2026' },
    { id: 'act1', type: 'action', label: 'Inspect and clear drain', x: 650, y: 210, detail: 'Must finish before road work starts.' },
    { id: 'act2', type: 'action', label: 'Restore road', x: 650, y: 330, detail: 'Waits on drain inspection.' },
  ],
  edges: [
    { from: 'c', to: 'i1', label: 'HAS_ISSUE' },
    { from: 'c', to: 'i2', label: 'HAS_ISSUE' },
    { from: 'i1', to: 'a1', label: 'AFFECTS' },
    { from: 'i2', to: 'a2', label: 'AFFECTS' },
    { from: 'a1', to: 'loc', label: 'LOCATED_IN' },
    { from: 'a2', to: 'loc', label: 'LOCATED_IN' },
    { from: 'a1', to: 'd1', label: 'MAINTAINED_BY' },
    { from: 'a2', to: 'd2', label: 'MAINTAINED_BY' },
    { from: 'd1', to: 'act1', label: 'ASSIGNED' },
    { from: 'd2', to: 'act2', label: 'ASSIGNED' },
    { from: 'act2', to: 'act1', label: 'DEPENDS_ON', dep: true },
    { from: 'd1', to: 'd2', label: 'COORDINATES_WITH', dep: true },
  ],
}

export const analytics = {
  stats: [
    { label: 'Total complaints', value: 248, hint: 'This quarter' },
    { label: 'Multi-department cases', value: 36, hint: '14.5% of all complaints' },
    { label: 'Handover delays', value: 19, hint: 'Past configured timeline', tone: 'warn' },
    { label: 'Disputed assignments', value: 12, hint: 'Awaiting ownership proof', tone: 'warn' },
  ],
  funnel: [
    { stage: 'Needs two departments', value: 100 },
    { stage: 'Acknowledged by first', value: 70 },
    { stage: 'Forwarded to second', value: 60 },
    { stage: 'Second responded in time', value: 20 },
  ],
  byDept: [
    { name: 'Drainage', open: 42 },
    { name: 'Roads', open: 35 },
    { name: 'Sanitation', open: 28 },
    { name: 'Electrical', open: 17 },
    { name: 'Horticulture', open: 6 },
  ],
  trends: [
    { m: 'Jun', Waterlogging: 18, Roads: 12, Garbage: 15, Lights: 8 },
    { m: 'Jul', Waterlogging: 34, Roads: 16, Garbage: 14, Lights: 9 },
    { m: 'Aug', Waterlogging: 41, Roads: 22, Garbage: 17, Lights: 7 },
    { m: 'Sep', Waterlogging: 29, Roads: 25, Garbage: 19, Lights: 10 },
    { m: 'Oct', Waterlogging: 21, Roads: 24, Garbage: 22, Lights: 12 },
  ],
  hotspots: [
    { name: 'Demo Locality A', x: 150, y: 120, n: 31 },
    { name: 'Demo Market Road', x: 330, y: 90, n: 22 },
    { name: 'Demo School Lane', x: 440, y: 210, n: 14 },
    { name: 'Demo Colony B', x: 220, y: 240, n: 26 },
    { name: 'Demo Ring Road', x: 80, y: 260, n: 9 },
  ],
  repeats: [
    { place: 'Demo Locality A', count: 7, note: 'Waterlogging, same drain' },
    { place: 'Demo Colony B', count: 5, note: 'Road damage after drain work' },
    { place: 'Demo Market Road', count: 4, note: 'Garbage near storm drain' },
  ],
  summary: 'Waterlogging cases that also involve road damage take the longest to close. Most of the delay sits at one step: the handover from drainage to roads, where only one in three referred cases gets a response inside the configured timeline. Two localities account for nearly a quarter of repeat complaints.',
}
