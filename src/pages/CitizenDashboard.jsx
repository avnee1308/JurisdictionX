import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, FileText, Flame, GitMerge, CheckCircle2 } from 'lucide-react'
import StatCard from '../components/StatCard'
import ComplaintCard from '../components/ComplaintCard'
import { GhostCop, Pumpkin } from '../components/Spooky'
import { getComplaints } from '../services/api'
import { useAuth } from '../context/AuthContext'
export default function CitizenDashboard() {
 const {demoUser}=useAuth(); const [items,setItems]=useState([]); const [error,setError]=useState('')
 useEffect(()=>{getComplaints().then(setItems).catch(e=>setError(e.message))},[demoUser])
 const count=s=>items.filter(c=>c.status===s).length
 const open=items.filter(c=>!['RESOLVED','DISPUTED'].includes(c.status)).length
 return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="h-display text-3xl">Your complaints</h1><p className="muted text-sm mt-1">Track which departments are involved and what happens next.</p></div><Link to="/citizen/submit" className="btn-primary"><PlusCircle size={16}/>Report an issue</Link></div>
 <div className="card flex items-center gap-4 overflow-hidden border-pumpkin/30 bg-gradient-to-r from-pumpkin/10 to-witch/10"><GhostCop size={84} className="shrink-0 animate-bob"/><div><p className="font-medium">Officer Boo is tracking {open} open {open===1?'complaint':'complaints'} for you.</p><p className="muted text-sm">He will flag any handover that gets stuck.</p></div><Pumpkin size={76} className="ml-auto hidden sm:block origin-bottom animate-wobble"/></div>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><StatCard label="Total filed" value={items.length} icon={FileText}/><StatCard label="Open" value={open} icon={Flame} tone="warn"/><StatCard label="Awaiting approval" value={count('PENDING_APPROVAL')} icon={GitMerge}/><StatCard label="Resolved" value={count('RESOLVED')} icon={CheckCircle2}/></div>
 {error&&<p className="text-red-300 text-sm">{error}</p>}{!error&&items.length===0&&<p className="muted text-sm">No complaints yet. Submit an issue to get started.</p>}<div className="grid gap-4 md:grid-cols-2">{items.map(c=><ComplaintCard key={c.complaintId} c={c}/>)}</div></div>
}
