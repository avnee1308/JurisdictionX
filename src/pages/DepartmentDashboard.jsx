import { useEffect,useState } from 'react'
import { Inbox,Clock,Lock,Flag,Check } from 'lucide-react'
import StatCard from '../components/StatCard'
import { getComplaints,getComplaint,acknowledgeTask,resolveTask,disputeTask } from '../services/api'
import { useAuth } from '../context/AuthContext'
const labels={READY:'Ready to acknowledge',ACKNOWLEDGED:'Acknowledged',BLOCKED:'Blocked by dependency',DONE:'Completed',OWNERSHIP_DISPUTED:'Ownership disputed'}
export default function DepartmentDashboard(){
 const {demoUser,identity}=useAuth();const [tasks,setTasks]=useState([]);const [error,setError]=useState('');const [busy,setBusy]=useState('')
 const load=async()=>{try{setError('');const list=await getComplaints();const views=await Promise.all(list.map(c=>getComplaint(c.complaintId)));setTasks(views.flatMap(c=>(c.tasks||[]).map(t=>({...t,complaintId:c.complaintId,description:c.description}))))}catch(e){setError(e.message)}}
 useEffect(()=>{load()},[demoUser])
 const act=async(id,fn)=>{setBusy(id);setError('');try{await fn();await load()}catch(e){setError(e.message)}finally{setBusy('')}}
 const n=s=>tasks.filter(t=>t.status===s).length
 const visible=tasks.filter(t=>identity.role==='admin'||t.department===identity.departmentId)
 return <div className="space-y-6"><div><h1 className="h-display text-3xl">Task queue</h1><p className="muted text-sm mt-1">{identity.label} · Tasks returned by the backend and scoped to your department.</p></div>
 {error&&<p role="alert" className="text-red-300 text-sm">{error}</p>}<div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><StatCard label="Tasks" value={visible.length} icon={Inbox}/><StatCard label="Ready" value={n('READY')} icon={Clock} tone="warn"/><StatCard label="Blocked" value={n('BLOCKED')} icon={Lock}/><StatCard label="Disputed" value={n('OWNERSHIP_DISPUTED')} icon={Flag} tone="warn"/></div>
 {!visible.length&&!error&&<p className="muted text-sm">No tasks are currently visible for this identity.</p>}
 {visible.map(t=><div key={t.taskId} className="card"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="muted text-xs">{t.taskId} · {t.complaintId} · {t.departmentName}</p><h3 className="h-display text-lg mt-1">{t.title}</h3><p className="muted text-xs mt-1">{t.description}</p>{t.dependsOn?.length>0&&<p className="text-sm text-pumpkin mt-1">Depends on task(s): {t.dependsOn.join(', ')}</p>}</div><span className="badge border-white/15 text-bone/70">{labels[t.status]||t.status}</span></div>
 {t.status==='READY'&&<div className="flex flex-wrap gap-3 mt-4"><button disabled={!!busy} className="btn-primary" onClick={()=>act(t.taskId,()=>acknowledgeTask(t.taskId))}><Check size={15}/>Acknowledge</button><button disabled={!!busy} className="btn-ghost" onClick={()=>{const reason=window.prompt('Explain why this asset is not owned by your department');if(reason?.trim())act(t.taskId,()=>disputeTask(t.taskId,reason))}}><Flag size={15}/>Dispute ownership</button></div>}
 {t.status==='ACKNOWLEDGED'&&<div className="mt-4"><label className="text-sm block mb-2">Completion evidence (required)</label><input id={`evidence-${t.taskId}`} className="input mb-2" placeholder="Evidence description or S3 key"/><button disabled={!!busy} className="btn-primary" onClick={()=>{const value=document.getElementById(`evidence-${t.taskId}`)?.value;if(value?.trim())act(t.taskId,()=>resolveTask(t.taskId,value));else setError('Completion evidence is required.')}}>Mark complete</button></div>}
 {t.status==='OWNERSHIP_DISPUTED'&&t.ownershipDispute&&<p className="muted text-xs mt-3">Dispute: {t.ownershipDispute.reason}</p>}</div>)}</div>
}
