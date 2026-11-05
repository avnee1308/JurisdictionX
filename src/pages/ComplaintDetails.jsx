import { useEffect,useState } from 'react'
import { Link,useParams } from 'react-router-dom'
import { ArrowLeft,ThumbsUp,Flag,ShieldCheck } from 'lucide-react'
import { getComplaint,verifyComplaint,approveRouting,getGraph } from '../services/api'
import { StatusBadge } from '../components/ComplaintCard'
import WorkflowTimeline from '../components/WorkflowTimeline'
import GraphVisualization from '../components/GraphVisualization'
import { useAuth } from '../context/AuthContext'
export default function ComplaintDetails(){
 const {id}=useParams(); const {role,demoUser}=useAuth(); const [c,setC]=useState(null); const [graph,setGraph]=useState(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
 const refresh=()=>getComplaint(id).then(setC).catch(e=>setError(e.message))
 useEffect(()=>{setC(null);setError('');refresh();getGraph(id).then(setGraph).catch(()=>setGraph(null))},[id,demoUser])
 const act=async fn=>{setBusy(true);setError('');try{await fn();await refresh()}catch(e){setError(e.message)}finally{setBusy(false)}}
 if(error&&!c)return <p className="text-red-300">{error}</p>; if(!c)return <p className="muted">Loading complaint...</p>
 return <div className="space-y-6"><Link to={role==='officer'?'/department':'/citizen'} className="muted text-sm inline-flex items-center gap-1 hover:text-pumpkin"><ArrowLeft size={14}/>Back</Link>
 <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="muted text-sm">{c.complaintId} · filed {new Date(c.createdAt).toLocaleString()}</p><h1 className="h-display text-3xl max-w-3xl">{c.description}</h1><p className="muted text-sm mt-2">Updated {new Date(c.updatedAt).toLocaleString()}</p></div><StatusBadge status={c.status}/></div>
 {error&&<p role="alert" className="text-red-300 text-sm">{error}</p>}
 {c.triageReason&&<div className="card border-amber-400/30 text-sm"><strong>Manual triage required</strong><p className="muted mt-1">{c.triageReason}</p></div>}
 {c.explanation&&<div className="card"><h2 className="h-display text-lg mb-2">Jurisdiction explanation</h2><p className="text-sm muted">{c.explanation}</p></div>}
 {c.status==='PENDING_APPROVAL'&&(role==='admin'||role==='officer')&&<button disabled={busy} className="btn-primary" onClick={()=>act(()=>approveRouting(id))}><ShieldCheck size={16}/>Approve routing</button>}
 <div className="grid lg:grid-cols-5 gap-6 items-start"><div className="card lg:col-span-3"><h2 className="h-display text-lg mb-4">Audit timeline</h2><WorkflowTimeline steps={(c.timeline||[]).map(x=>({label:x.event,actor:x.actor,time:new Date(x.ts).toLocaleString(),state:'done',note:x.detail}))}/>{!c.timeline?.length&&<p className="muted text-sm">No timeline events.</p>}</div>
 <div className="lg:col-span-2 space-y-6"><div className="card"><h2 className="h-display text-lg mb-3">Departments and actions</h2>{(c.tasks||[]).length?c.tasks.map(t=><div key={t.taskId} className="py-2 border-b border-white/5 last:border-0"><p className="text-sm font-medium">{t.title}</p><p className="muted text-xs">{t.departmentName} · {t.status}</p></div>):(c.recommendations||[]).map(r=><p key={r.department} className="text-sm py-1">{r.departmentName} · {r.role}</p>)}{!c.tasks?.length&&!c.recommendations?.length&&<p className="muted text-sm">No department assignment yet.</p>}</div>
 {c.status==='PENDING_VERIFICATION'&&(role==='citizen'||role==='admin')&&<div className="card"><h2 className="h-display text-lg mb-2">Is it fixed?</h2><p className="muted text-sm mb-3">Confirm the completed work or dispute the resolution.</p><div className="flex gap-2"><button disabled={busy} className="btn-primary flex-1" onClick={()=>act(()=>verifyComplaint(id,{confirmed:true}))}><ThumbsUp size={15}/>Confirm</button><button disabled={busy} className="btn-ghost flex-1" onClick={()=>act(()=>verifyComplaint(id,{confirmed:false,note:'The reported issue is not fully resolved.'}))}><Flag size={15}/>Dispute</button></div></div>}</div></div>
 <div><h2 className="h-display text-lg mb-3">Responsibility graph</h2>{graph?<GraphVisualization data={graph}/>:<p className="muted text-sm">Graph is not available for this complaint yet.</p>}</div></div>
}
