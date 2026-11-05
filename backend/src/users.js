import { HttpError } from './util.js';

// DEMO AUTH ONLY. Production path = Amazon Cognito (groups: citizen / officer / admin).
export const DEMO_USERS = {
  citizen1: { id: 'citizen1', role: 'citizen', name: 'Demo Citizen 1' },
  citizen2: { id: 'citizen2', role: 'citizen', name: 'Demo Citizen 2' },
  'officer-drainage': { id: 'officer-drainage', role: 'officer', departmentId: 'DEP_DRAIN', name: 'Drainage Officer' },
  'officer-roads': { id: 'officer-roads', role: 'officer', departmentId: 'DEP_ROADS', name: 'Roads Officer' },
  'officer-zone': { id: 'officer-zone', role: 'officer', departmentId: 'DEP_ZONE', name: 'Zone Office Officer' },
  'officer-sanitation': { id: 'officer-sanitation', role: 'officer', departmentId: 'DEP_SANIT', name: 'Sanitation Officer' },
  'officer-lighting': { id: 'officer-lighting', role: 'officer', departmentId: 'DEP_LIGHT', name: 'Street Lighting Officer' },
  admin: { id: 'admin', role: 'admin', name: 'Administrator' },
};

export function getUser(headers = {}) {
  const user = DEMO_USERS[headers['x-demo-user']];
  if (!user) throw new HttpError(401, 'Missing or unknown x-demo-user header');
  return user;
}
