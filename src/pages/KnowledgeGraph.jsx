import { useEffect,useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import GraphVisualization from '../components/GraphVisualization'
import { getComplaints,getGraph } from '../services/api'
import { useAuth } from '../context/AuthContext'
export default function KnowledgeGraph(){
 const [params,setParams]=useSearchParams();const {demoUser}=useAuth();const [items,setItems]=useState([]);const [graph,setGraph]=useState(null);const [error,setError]=useState('')
 const id=params.get('complaintId')||''
 useEffect(()=>{getComplaints().then(list=>{setItems(list);if(!id&&list[0])setParams({complaintId:list[0].complaintId},{replace:true})}).catch(e=>setError(e.message))},[demoUser])
 useEffect(()=>{if(id)getGraph(id).then(setGraph).catch(e=>{setGraph(null);setError(e.message)})},[id,demoUser])
 return <div className="space-y-6"><div><h1 className="h-display text-3xl">Jurisdiction graph</h1><p className="muted text-sm mt-1 max-w-2xl">Assets, authorities and actions linked by the backend's verified responsibility graph.</p></div>
 <label className="text-sm flex flex-wrap items-center gap-3">Complaint <select className="input" value={id} onChange={e=>setParams({complaintId:e.target.value})}><option value="">Select a complaint</option>{items.map(c=><option key={c.complaintId} value={c.complaintId}>{c.complaintId} — {c.description.slice(0,70)}</option>)}</select></label>
 {error&&<p role="alert" className="text-red-300 text-sm">{error}</p>}{graph?<GraphVisualization data={graph}/>:<p className="muted text-sm">Select a complaint with graph access to view its jurisdiction graph.</p>}
 </div>
}
