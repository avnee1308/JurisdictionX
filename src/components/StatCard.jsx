import { Pumpkin } from './Spooky'

export default function StatCard({ label, value, hint, icon: Icon, tone }) {
  const warn = tone === 'warn'
  return (
    <div className={`card relative overflow-hidden ${warn ? 'border-pumpkin/30' : ''}`}>
      <Pumpkin size={78} face={warn} className="absolute -right-4 -bottom-5 opacity-20 rotate-12" />
      <div className="relative flex items-start justify-between">
        <p className="muted text-sm">{label}</p>
        {Icon && <Icon size={18} className={warn ? 'text-pumpkin' : 'text-witch'} />}
      </div>
      <p className={`relative h-display text-4xl mt-2 ${warn ? 'text-pumpkin' : 'text-bone'}`}>{value}</p>
      {hint && <p className="relative muted text-xs mt-1">{hint}</p>}
    </div>
  )
}
