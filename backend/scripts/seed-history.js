// Seeds ~40 SYNTHETIC historical handovers so the bottleneck dashboard isn't empty.
// They are flagged synthetic:true and reported as such by /admin/analytics. Label them as synthetic in the UI/video.
// Usage: STORE=dynamo node scripts/seed-history.js   (or STORE=file for local)
import { createStore } from '../src/store.js';
import { newId } from '../src/util.js';

const store = await createStore(process.env.STORE || 'file');
const plan = [ // from, to, sent, acknowledged, escalated
  ['DEP_DRAIN', 'DEP_ROADS', 20, 6, 10],
  ['DEP_ZONE', 'DEP_DRAIN', 10, 8, 1],
  ['INTAKE', 'DEP_DRAIN', 12, 11, 0],
  ['DEP_DRAIN', 'DEP_SANIT', 8, 7, 0],
];
let n = 0;
for (const [from, to, sent, acked, esc] of plan) {
  for (let i = 0; i < sent; i++) {
    const sentAt = new Date(Date.now() - (i + 1) * 36e5 * 5);
    const isAck = i < acked;
    await store.put('handovers', {
      id: newId('H'), complaintId: `SYN-${++n}`, taskId: `SYN-T-${n}`, fromDepartment: from, toDepartment: to,
      sentAt: sentAt.toISOString(), ackAt: isAck ? new Date(+sentAt + (isAck ? (900 + i * 700) * 1000 : 0)).toISOString() : null,
      disputedAt: null, escalated: !isAck && i - acked < esc, synthetic: true,
    });
  }
}
console.log(`Seeded ${n} synthetic handovers`);
