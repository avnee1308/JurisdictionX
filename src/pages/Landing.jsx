import { useNavigate } from 'react-router-dom'
import { Users, Building2, BarChart3 } from 'lucide-react'
import { useAuth, HOME } from '../context/AuthContext'
import { Web, Bats, Fog, Pumpkin, GhostCop, HangingSpider, Moon, PumpkinPatch } from '../components/Spooky'
const ENTRIES = [
 { role:'citizen', identity:'citizen1', title:'I am a citizen', text:'Report a problem and follow who is fixing it.', icon:Users },
 { role:'officer', identity:'officer-drainage', title:'I am an officer', text:'Acknowledge tasks, hand over work, upload evidence.', icon:Building2 },
 { role:'admin', identity:'admin', title:'I am an administrator', text:'See where complaints get stuck between departments.', icon:BarChart3 },
]
const ENGINES = [
 {title:'Jurisdiction Intelligence',text:'Reads a complaint, spots every issue in it, and finds the authorities who may own each part.'},
 {title:'Responsibility Graph',text:'Maps assets, departments and dependencies, so overlapping ownership is visible, not guessed.'},
 {title:'Resolution Orchestration',text:'Turns the plan into tracked handovers and flags the ones that stall.'},
]
export default function Landing() {
 const nav=useNavigate(); const {setIdentity}=useAuth()
 const enter=(x)=>{setIdentity(x.identity);nav(HOME[x.role])}
 return <div className="relative min-h-screen overflow-hidden"><Bats n={7}/><Fog/><Moon className="w-24 h-24 md:w-40 md:h-40 top-8 right-6 md:right-[6%]"/><Web className="top-0 left-0 w-64 md:w-[26rem]"/><Web className="top-0 right-0 w-64 md:w-[26rem] -scale-x-100"/><HangingSpider length={150} className="left-[14%] top-0"/><HangingSpider length={90} className="left-[44%] top-0 hidden md:block"/>
 <div className="relative z-10 max-w-6xl mx-auto px-5 py-8"><header className="flex items-center gap-2 h-display text-xl"><Pumpkin size={36} className="animate-flicker"/>JurisdictionX</header>
 <section className="grid md:grid-cols-2 gap-6 items-center pt-10 pb-10"><div><h1 className="h-display text-5xl md:text-7xl leading-[1.05]">Every problem has an owner.</h1><p className="text-2xl md:text-3xl h-display mt-3 bg-gradient-to-r from-pumpkin to-witch bg-clip-text text-transparent">Find it. Fix it. Track it.</p><p className="muted mt-6 text-lg max-w-xl">Some complaints stay open because nobody knows which department should act first. JurisdictionX works that out, coordinates the handovers, and checks that the problem is really fixed.</p><div className="flex flex-wrap gap-3 mt-8"><button className="btn-primary" onClick={()=>enter(ENTRIES[0])}>Report an issue</button><button className="btn-ghost" onClick={()=>enter(ENTRIES[2])}>See the admin dashboard</button></div></div>
 <div className="relative h-80 md:h-[26rem]" aria-hidden="true"><Pumpkin size={230} className="absolute left-0 bottom-0 origin-bottom animate-wobble"/><Pumpkin size={150} className="absolute right-2 bottom-0 origin-bottom animate-wobble" style={{animationDelay:'1.5s'}}/><Pumpkin size={84} face={false} className="absolute left-[46%] bottom-0 origin-bottom animate-wobble" style={{animationDelay:'0.8s'}}/><GhostCop size={180} className="absolute left-[24%] top-2 z-10 animate-bob"/><p className="bubble absolute right-0 top-16 md:top-24">Officer Boo is on the case.</p></div></section>
 <section className="grid md:grid-cols-3 gap-4" aria-label="Choose your portal">{ENTRIES.map(({role,title,text,icon:Icon,...entry})=><button key={role} onClick={()=>enter({role,...entry})} className="card relative overflow-hidden text-left hover:border-pumpkin/60 hover:shadow-glow transition group"><Pumpkin size={60} className="absolute -right-2 -top-1 opacity-25 group-hover:opacity-100 transition rotate-12"/><Icon className="text-pumpkin mb-3"/><p className="h-display text-xl">{title}</p><p className="muted text-sm mt-1 max-w-[16rem]">{text}</p><p className="text-pumpkin text-sm mt-4 group-hover:translate-x-1 transition">Open portal</p></button>)}</section>
 <section className="grid md:grid-cols-3 gap-4 mt-14">{ENGINES.map(x=><div key={x.title} className="p-5 border-l-2 border-pumpkin/50"><Pumpkin size={34} className="mb-2"/><p className="font-medium">{x.title}</p><p className="muted text-sm mt-1">{x.text}</p></div>)}</section><p className="muted text-xs text-center mt-14 max-w-2xl mx-auto">JurisdictionX complements existing grievance platforms. AI recommends, and authorised officers approve every routing decision. All data in this demo is synthetic.</p></div><PumpkinPatch/></div>
}
