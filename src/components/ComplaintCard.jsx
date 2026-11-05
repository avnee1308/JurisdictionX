import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
const LABELS={SUBMITTED:'Submitted',ANALYZED:'Analysed',PENDING_APPROVAL:'Awaiting routing approval',NEEDS_TRIAGE:'Needs manual triage',ROUTED:'Routed',IN_PROGRESS:'In progress',PENDING_VERIFICATION:'Awaiting verification',RESOLVED:'Resolved',DISPUTED:'Disputed'}
const TONES={RESOLVED:'bg-slime/10 text-slime border-slime/30',PENDING_VERIFICATION:'bg-amber-400/10 text-amber-300 border-amber-400/30',NEEDS_TRIAGE:'bg-red-400/10 text-red-300 border-red-400/30'}
export const StatusBadge=({status})=><span className={`badge ${TONES[status]||'bg-pumpkin/15 text-pumpkin border-pumpkin/30'}`}>{LABELS[status]||status}</span>
export default function ComplaintCard({c}) {
 const id=c.complaintId; const title=c.description; const filed=c.createdAt?new Date(c.createdAt).toLocaleDateString():''; const departments=c.departments||[]
 return <Link to={`/complaints/${id}`} className="card block hover:border-pumpkin/40 transition"><div className="flex items-center justify-between gap-2"><span className="muted text-xs">{id} · filed {filed}</span><StatusBadge status={c.status}/></div><h3 className="h-display text-lg mt-2 leading-snug">{title}</h3><p className="muted text-sm mt-1 flex items-center gap-1"><MapPin size={14}/>{departments.length?departments.join(', '):'Department not yet determined'}</p></Link>
}
