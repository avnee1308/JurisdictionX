import { useMemo,useState } from 'react'
const COLORS={Complaint:'#FF7518',Issue:'#F5B301',Asset:'#9146FF',Location:'#7C7A8E',Department:'#C084FC',Action:'#5EEAA0'}
const ICON={Complaint:'🎃',Issue:'🕸️',Asset:'🏚️',Location:'📍',Department:'🏛️',Action:'⚡'}
const R=27
export default function GraphVisualization({data={nodes:[],edges:[]}}){
 const [sel,setSel]=useState(null)
 const positioned=useMemo(()=>{
  const groups=['Complaint','Issue','Asset','Location','Department','Action']; const nodes=data.nodes||[]
  return nodes.map((n,i)=>{const group=Math.max(0,groups.indexOf(n.type));const same=nodes.filter(x=>x.type===n.type);const idx=same.findIndex(x=>x.id===n.id);return {...n,x:n.x??(90+group*150),y:n.y??(70+(idx+1)*390/(same.length+1))}})
 },[data])
 const byId=Object.fromEntries(positioned.map(n=>[n.id,n]))
 const edges=(data.edges||[]).filter(e=>byId[e.from]&&byId[e.to])
 const node=positioned.find(n=>n.id===sel)
 const height=Math.max(300,...positioned.map(n=>n.y+90))
 return <div className="card p-0 overflow-hidden"><svg viewBox={`0 0 960 ${height}`} className="w-full h-auto" role="img" aria-label="Backend jurisdiction graph">
 <defs><marker id="jx-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7a7396"/></marker></defs>
 {edges.map((e,i)=>{const a=byId[e.from],b=byId[e.to];return <g key={i} opacity={!sel||e.from===sel||e.to===sel?1:.12}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#625b7d" strokeWidth="1.5" markerEnd="url(#jx-arrow)"/><text x={(a.x+b.x)/2} y={(a.y+b.y)/2-5} textAnchor="middle" fontSize="9" fill="#aaa2bd">{e.type}</text></g>})}
 {positioned.map(n=><g key={n.id} tabIndex={0} role="button" aria-label={`${n.type}: ${n.label}`} className="cursor-pointer" opacity={sel && sel !== n.id && !edges.some(e => (e.from === sel && e.to === n.id) || (e.to === sel && e.from === n.id)) ? 0.25 : 1} onClick={()=>setSel(sel===n.id?null:n.id)} onKeyDown={e=>e.key==='Enter'&&setSel(sel===n.id?null:n.id)}><circle cx={n.x} cy={n.y} r={R} fill="#171522" stroke={COLORS[n.type]||'#aaa'} strokeWidth="2"/><text x={n.x} y={n.y+7} textAnchor="middle" fontSize="21">{ICON[n.type]||'•'}</text><text x={n.x} y={n.y+R+17} textAnchor="middle" fontSize="11" fill="#F4EFE6">{n.label}</text></g>)}
 </svg><div className="border-t border-white/5 p-4 text-sm">{node?<><p className="font-medium">{node.label} <span className="muted font-normal">({node.type})</span></p><p className="muted text-xs mt-2">{edges.filter(e=>e.from===node.id||e.to===node.id).map(e=>`${byId[e.from].label} — ${e.type} — ${byId[e.to].label}`).join(' · ')}</p></>:<p className="muted text-xs">Select a node to inspect its relationships. Nodes and edges are supplied by the backend.</p>}</div></div>
}
