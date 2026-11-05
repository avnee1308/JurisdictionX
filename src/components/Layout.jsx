import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Network, BarChart3, Inbox } from 'lucide-react'
import { useAuth, HOME, DEMO_IDENTITIES } from '../context/AuthContext'
import { Web, Pumpkin, GhostCop, HangingSpider, Bats, PumpkinPatch } from './Spooky'

const NAV = {
  citizen: [{ to: '/citizen', label: 'My complaints', icon: LayoutDashboard, end: true }, { to: '/citizen/submit', label: 'Report an issue', icon: PlusCircle }],
  officer: [{ to: '/department', label: 'Task queue', icon: Inbox }, { to: '/graph', label: 'Jurisdiction graph', icon: Network }],
  admin: [{ to: '/admin', label: 'Analytics', icon: BarChart3 }, { to: '/graph', label: 'Jurisdiction graph', icon: Network }],
}
const SAYS = { citizen: 'Report it. I will help find who owns it.', officer: 'Acknowledge your tasks, or I start haunting.', admin: 'Some handovers are lurking. Check the funnel.' }
export const Logo = () => <Link to="/" className="flex items-center gap-2 h-display text-xl"><Pumpkin size={32} className="animate-flicker" />JurisdictionX</Link>

export default function Layout() {
  const { role, demoUser, setIdentity, identity } = useAuth()
  const nav = useNavigate()
  const items = NAV[role]
  const link = ({ isActive }) => `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition whitespace-nowrap ${isActive ? 'bg-pumpkin/15 text-pumpkin' : 'text-bone/70 hover:bg-white/5'}`
  return <div className="min-h-screen md:flex relative">
    <aside className="hidden md:flex w-60 shrink-0 flex-col gap-1 p-4 border-r border-pumpkin/10 bg-night/70 sticky top-0 z-10 h-screen overflow-hidden">
      <Web className="-right-10 bottom-0 w-56 rotate-180" /><div className="mb-6 px-1"><Logo /></div>
      {items.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={link}><Icon size={17} />{label}</NavLink>)}
      <div className="mt-auto relative text-center pb-2"><p className="bubble mb-2">{SAYS[role]}</p><GhostCop size={104} className="mx-auto animate-bob" /><p className="muted text-xs mt-1">Officer Boo is on duty</p></div>
    </aside>
    <div className="flex-1 min-w-0 relative">
      <Bats n={5} /><Web className="top-12 right-0 w-48 -scale-x-100 z-10 hidden sm:block" /><HangingSpider length={80} className="right-28 top-14 z-10 hidden sm:block" />
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-3 border-b border-pumpkin/10 bg-night/80 backdrop-blur">
        <div className="md:hidden"><Logo /></div><p className="hidden md:block muted text-sm">Backend demo identity: {identity.label}</p>
        <label className="flex items-center gap-2 text-xs muted">Demo identity
          <select aria-label="Demo identity" value={demoUser} onChange={(e) => { setIdentity(e.target.value); const next = DEMO_IDENTITIES.find(x => x.id === e.target.value); nav(HOME[next.role]) }} className="input py-2">
            {DEMO_IDENTITIES.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </label>
      </header>
      <nav className="md:hidden flex gap-1 overflow-x-auto px-4 py-2 border-b border-white/5">{items.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={link}><Icon size={16} />{label}</NavLink>)}</nav>
      <main className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto"><Outlet /></main><PumpkinPatch />
    </div>
  </div>
}
