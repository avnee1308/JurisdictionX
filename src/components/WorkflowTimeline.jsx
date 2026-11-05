import { Check, Clock, Ghost, Flame } from 'lucide-react'

const STYLE = {
  done: { dot: 'bg-slime/15 border-slime text-slime', icon: Check },
  active: { dot: 'bg-pumpkin/20 border-pumpkin text-pumpkin animate-pulseglow', icon: Flame },
  delayed: { dot: 'bg-red-500/15 border-red-400 text-red-300', icon: Ghost },
  pending: { dot: 'bg-white/5 border-white/15 text-bone/40', icon: Clock },
}

export default function WorkflowTimeline({ steps }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const { dot, icon: Icon } = STYLE[s.state]
        return (
          <li key={s.label} className="flex gap-4 pb-6 last:pb-0 relative">
            {i < steps.length - 1 && <span className="absolute left-[15px] top-9 bottom-0 w-px bg-pumpkin/20" />}
            <span className={`h-8 w-8 shrink-0 rounded-full border flex items-center justify-center ${dot}`}><Icon size={15} /></span>
            <div className="min-w-0">
              <p className={`font-medium ${s.state === 'pending' ? 'text-bone/50' : ''}`}>
                {s.label}
                {s.state === 'delayed' && <span className="badge border-red-400/40 text-red-300 ml-2">Haunted handover</span>}
              </p>
              <p className="muted text-xs">{s.actor} · {s.time}</p>
              <p className={`text-sm mt-1 ${s.state === 'delayed' ? 'text-red-300' : 'muted'}`}>{s.note}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
