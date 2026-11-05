// All the Halloween art lives here: pumpkins, Officer Boo (ghost police), spiders, moon, bats.

export function Web({ className = '' }) {
  const radii = [40, 80, 120, 160]
  const spokes = [[200, 0], [195, 70], [150, 150], [70, 195], [0, 200]]
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={`pointer-events-none absolute text-bone/20 ${className}`} fill="none" stroke="currentColor" strokeWidth="1">
      {spokes.map(([x, y], i) => <line key={i} x1="0" y1="0" x2={x} y2={y} />)}
      {radii.map((r) => <path key={r} d={`M${r} 0 Q${r * 0.55} ${r * 0.55} 0 ${r}`} />)}
    </svg>
  )
}

export function Pumpkin({ size = 80, face = true, className = '', style }) {
  return (
    <svg viewBox="0 0 100 90" width={size} height={size * 0.9} aria-hidden="true" className={`pumpkin-glow ${className}`} style={style}>
      <ellipse cx="26" cy="54" rx="24" ry="32" fill="#E5600A" />
      <ellipse cx="74" cy="54" rx="24" ry="32" fill="#E5600A" />
      <ellipse cx="38" cy="54" rx="24" ry="33" fill="#F26B10" />
      <ellipse cx="62" cy="54" rx="24" ry="33" fill="#F26B10" />
      <ellipse cx="50" cy="54" rx="20" ry="34" fill="#FF7518" />
      <path d="M36 24 Q28 54 36 84 M64 24 Q72 54 64 84" stroke="#C24E06" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M46 24 Q45 8 58 4 L61 9 Q54 13 54 24Z" fill="#4d6b24" />
      {face && (
        <g fill="#FFD166" style={{ filter: 'drop-shadow(0 0 3px #FFB347)' }}>
          <polygon points="28,46 41,46 34.5,33" />
          <polygon points="59,46 72,46 65.5,33" />
          <polygon points="46,56 54,56 50,48" />
          <path d="M26 62 L34 70 L41 63 L50 73 L59 63 L66 70 L74 62 Q50 88 26 62Z" />
        </g>
      )}
    </svg>
  )
}

// Officer Boo: the ghost police officer mascot
export function GhostCop({ size = 120, className = '' }) {
  return (
    <svg viewBox="0 0 130 140" width={size} height={(size * 140) / 130} role="img" aria-label="Officer Boo, a ghost police officer" className={className}>
      <path d="M20 125 V58 C20 22 42 10 60 10 C78 10 100 22 100 58 V125 L88 112 L76 125 L64 112 L52 125 L40 112 L28 125 Z" fill="#F4EFE6" style={{ filter: 'drop-shadow(0 0 10px rgba(244,239,230,.35))' }} />
      <path d="M32 32 Q32 4 60 4 Q88 4 88 32 Z" fill="#1f2a6b" />
      <rect x="30" y="30" width="60" height="7" rx="2" fill="#0f1538" />
      <path d="M34 37 Q60 48 86 37 L86 41 Q60 53 34 41Z" fill="#0B0A12" />
      <polygon points="60,10 62.5,16 69,16 63.8,20 66,26 60,22.5 54,26 56.2,20 51,16 57.5,16" fill="#FFC93C" />
      <ellipse cx="46" cy="64" rx="6" ry="8" fill="#0B0A12" />
      <ellipse cx="74" cy="64" rx="6" ry="8" fill="#0B0A12" />
      <ellipse cx="60" cy="86" rx="5" ry="7" fill="#0B0A12" />
      <path d="M70 98 h16 v11 q0 8 -8 11 q-8 -3 -8 -11z" fill="#FFC93C" stroke="#c99a1d" strokeWidth="1" />
      <circle cx="110" cy="96" r="11" fill="rgba(255,117,24,.18)" stroke="#FF7518" strokeWidth="3.5" />
      <line x1="102" y1="104" x2="94" y2="113" stroke="#FF7518" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  )
}

export function HangingSpider({ length = 120, className = '' }) {
  const legs = [[6, -3, 17, -11], [6, 0, 18, 2], [6, 3, 17, 13], [5, 6, 13, 17]]
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute origin-top animate-sway ${className}`}>
      <svg width="44" height={length + 34} viewBox={`0 0 44 ${length + 34}`}>
        <line x1="22" y1="0" x2="22" y2={length} stroke="#F4EFE6" strokeOpacity="0.35" />
        <g transform={`translate(22 ${length})`} fill="#1a1727" stroke="#9146FF" strokeWidth="1.2">
          {legs.flatMap(([x1, y1, x2, y2], i) => [
            <path key={`l${i}`} d={`M${-x1} ${y1} L${-x2} ${y2}`} fill="none" />,
            <path key={`r${i}`} d={`M${x1} ${y1} L${x2} ${y2}`} fill="none" />,
          ])}
          <circle r="8" />
          <circle cy="10" r="5" />
          <circle cx="-2" cy="9" r="1.2" fill="#FF7518" stroke="none" />
          <circle cx="2" cy="9" r="1.2" fill="#FF7518" stroke="none" />
        </g>
      </svg>
    </div>
  )
}

export function Moon({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{ background: 'radial-gradient(circle at 35% 35%, #FFE8C2, #FFB366 60%, #FF7518)', boxShadow: '0 0 80px 20px rgba(255,117,24,.3)' }}
    />
  )
}

export function Bats({ n = 7 }) {
  const glyphs = ['🦇', '👻', '🦇', '🦇', '👻', '🦇', '👻']
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className="absolute text-2xl opacity-30 animate-fly"
          style={{ top: `${6 + i * 12}%`, left: 0, animationDuration: `${22 + i * 5}s`, animationDelay: `${i * 4}s` }}
        >
          {glyphs[i % glyphs.length]}
        </span>
      ))}
    </div>
  )
}

export function Fog() {
  return <div aria-hidden="true" className="pointer-events-none fixed bottom-0 inset-x-0 h-48 z-0 bg-gradient-to-t from-witch/15 to-transparent" />
}

const PATCH = [[72, true], [112, false], [66, true], [144, true], [86, false], [106, true], [62, false], [124, true], [78, true]]

export function PumpkinPatch({ className = '' }) {
  return (
    <div aria-hidden="true" className={`relative z-10 flex items-end justify-center -space-x-4 overflow-hidden pt-10 mt-10 ${className}`}>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-night to-transparent" />
      {PATCH.map(([s, f], i) => (
        <Pumpkin key={i} size={s} face={f} className={`shrink-0 origin-bottom animate-wobble ${i > 4 ? 'hidden sm:block' : ''}`} style={{ animationDelay: `${i * 0.7}s`, marginBottom: i % 2 ? -8 : -18 }} />
      ))}
    </div>
  )
}
