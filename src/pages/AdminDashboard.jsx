import { useEffect,useState } from 'react'
import { FileText,GitMerge,Clock,Flag } from 'lucide-react'
import StatCard from '../components/StatCard'
import { getAnalytics,runEscalations } from '../services/api'
import { useAuth } from '../context/AuthContext'
export default function AdminDashboard(){
 const {demoUser}=useAuth();const [d,setD]=useState(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('')
 const load=()=>getAnalytics().then(setD).catch(e=>setError(e.message))
 useEffect(()=>{setD(null);load()},[demoUser])
 const escalate=async()=>{setBusy(true);setMessage('');setError('');try{const r=await runEscalations();setMessage(`${r.escalated.length} escalation recommendation(s) recorded.`);await load()}catch(e){setError(e.message)}finally{setBusy(false)}}
 if(error&&!d)return <p className="text-red-300">{error}</p>;if(!d)return <p className="muted">Loading backend analytics...</p>
 const t=d.totals||{}
 return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="h-display text-3xl">Coordination analytics</h1><p className="muted text-sm mt-1">Live aggregates from the backend store.</p></div><button className="btn-primary" disabled={busy} onClick={escalate}>Run escalation check</button></div>
 {error&&<p role="alert" className="text-red-300 text-sm">{error}</p>}{message&&<p className="text-slime text-sm">{message}</p>}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><StatCard label="Total complaints" value={t.complaints??0} icon={FileText}/><StatCard label="Multi-department" value={t.multiDepartment??0} icon={GitMerge}/><StatCard label="Handover delays" value={t.handoverDelays??0} icon={Clock} tone="warn"/><StatCard label="Disputed assignments" value={t.disputedAssignments??0} icon={Flag} tone="warn"/></div>
 <div className="grid lg:grid-cols-2 gap-6"><div className="card"><h2 className="h-display text-lg mb-3">Complaints by status</h2>{Object.entries(d.byStatus||{}).length?Object.entries(d.byStatus).map(([s,n])=><div key={s} className="flex justify-between py-2 border-b border-white/5 text-sm"><span>{s.replaceAll('_',' ')}</span><strong>{n}</strong></div>):<p className="muted text-sm">No complaint records yet.</p>}</div>
 <div className="card"><h2 className="h-display text-lg mb-3">Handover bottlenecks</h2>{d.bottlenecks?.length?d.bottlenecks.map((b,i)=><div key={i} className="py-3 border-b border-white/5 last:border-0"><div className="flex justify-between gap-3"><p className="text-sm font-medium">{b.fromName} → {b.toName}</p><span className="text-xs text-pumpkin">{Math.round(b.ackRate*100)}% acknowledged</span></div><p className="muted text-xs mt-1">{b.acknowledged}/{b.sent} acknowledged · {b.disputed} disputed · {b.escalated} escalated · avg {b.avgAckSeconds??'—'}s</p>{b.flag&&<span className="badge mt-2 border-amber-400/30 text-amber-300">Possible bottleneck</span>}</div>):<p className="muted text-sm">No handovers recorded yet.</p>}</div></div>
 <p className="muted text-xs">Synthetic handovers included: {d.syntheticHandoversIncluded??0}. Escalations are recommendations, not automatic jurisdiction changes.</p></div>
}
