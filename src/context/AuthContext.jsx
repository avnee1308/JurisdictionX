import { createContext, useContext, useEffect, useState } from 'react'
import { setApiUser } from '../services/api'

const AuthContext = createContext(null)
export const DEMO_IDENTITIES = [
  { id: 'citizen1', role: 'citizen', label: 'Demo Citizen 1' },
  { id: 'citizen2', role: 'citizen', label: 'Demo Citizen 2' },
  { id: 'officer-drainage', role: 'officer', label: 'Drainage Officer', departmentId: 'DEP_DRAIN' },
  { id: 'officer-roads', role: 'officer', label: 'Roads Officer', departmentId: 'DEP_ROADS' },
  { id: 'officer-zone', role: 'officer', label: 'Zone Office Officer', departmentId: 'DEP_ZONE' },
  { id: 'officer-sanitation', role: 'officer', label: 'Sanitation Officer', departmentId: 'DEP_SANIT' },
  { id: 'officer-lighting', role: 'officer', label: 'Street Lighting Officer', departmentId: 'DEP_LIGHT' },
  { id: 'admin', role: 'admin', label: 'Administrator' },
]
const identityFor = (id) => DEMO_IDENTITIES.find((x) => x.id === id) || DEMO_IDENTITIES[0]
export function AuthProvider({ children }) {
  const [demoUser, setDemoUser] = useState(() => localStorage.getItem('jx-demo-user') || 'citizen1')
  const identity = identityFor(demoUser)
  setApiUser(demoUser)
  useEffect(() => { setApiUser(demoUser); localStorage.setItem('jx-demo-user', demoUser) }, [demoUser])
  const setIdentity = (id) => setDemoUser(identityFor(id).id)
  return <AuthContext.Provider value={{ demoUser, identity, role: identity.role, setIdentity, setRole: setIdentity }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
export const HOME = { citizen: '/citizen', officer: '/department', admin: '/admin' }
