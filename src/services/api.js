const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
let demoUser = 'citizen1'
export const setApiUser = (id) => { demoUser = id }

async function call(path, options = {}) {
  if (!BASE) throw new Error('Backend is not configured. Set VITE_API_URL to your JurisdictionX API URL.')
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'x-demo-user': demoUser, ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `API request failed (${res.status})`)
  return data
}

export const getComplaints = () => call('/complaints')
export const getComplaint = (id) => call(`/complaints/${encodeURIComponent(id)}`)
export const getAnalytics = () => call('/admin/analytics')
export const getGraph = (id) => call(`/graph/${encodeURIComponent(id)}`)
export const createComplaint = (payload) => call('/complaints', { method: 'POST', body: JSON.stringify(payload) })
export const approveRouting = (id) => call(`/complaints/${encodeURIComponent(id)}/approve-routing`, { method: 'POST' })
export const verifyComplaint = (id, payload) => call(`/complaints/${encodeURIComponent(id)}/verify`, { method: 'POST', body: JSON.stringify(payload) })
export const acknowledgeTask = (id) => call(`/tasks/${encodeURIComponent(id)}/acknowledge`, { method: 'POST' })
export const resolveTask = (id, evidence) => call(`/tasks/${encodeURIComponent(id)}/resolve`, { method: 'POST', body: JSON.stringify({ evidence }) })
export const disputeTask = (id, reason, ownershipEvidence) => call(`/tasks/${encodeURIComponent(id)}/handover`, { method: 'POST', body: JSON.stringify({ reason, ownershipEvidence }) })
export const reassignTask = (id, toDepartment) => call(`/tasks/${encodeURIComponent(id)}/reassign`, { method: 'POST', body: JSON.stringify({ toDepartment }) })
export const runEscalations = () => call('/admin/run-escalations', { method: 'POST' })
