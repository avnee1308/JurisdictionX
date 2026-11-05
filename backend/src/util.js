import { randomUUID } from 'node:crypto';

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export const newId = (prefix) => `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`;

// Injectable clock so the demo/tests can "fast-forward" escalation timers.
let offsetMs = 0;
export const now = () => new Date(Date.now() + offsetMs);
export const advanceClock = (ms) => { offsetMs += ms; };
