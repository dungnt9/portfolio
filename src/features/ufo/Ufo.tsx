/**
 * The probe. Static SVG (rasterised once) + gradient divs for glow and beam, so animating it only
 * ever touches transform/opacity — cheap enough for phones.
 * Theme-aware through --accent / --accent-2.
 */
const RIM_LIGHTS = Array.from({ length: 11 }, (_, i) => i)

export function Ufo({ beam, lowPower }: { beam: boolean; lowPower: boolean }) {
  return (
    <div className="ufo relative h-[120px] w-[200px]">
      {/* tractor beam: a cone of light with drifting scan bands */}
      <div className={`ufo-beam ${beam ? 'is-on' : ''}`} aria-hidden />
      {/* engine glow under the hull */}
      <div className="ufo-engine" aria-hidden />

      <svg viewBox="0 0 200 120" className="ufo-body relative h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="ufo-hull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef3fb" />
            <stop offset="0.35" stopColor="#9aa6ba" />
            <stop offset="0.62" stopColor="#4a5468" />
            <stop offset="1" stopColor="#151a26" />
          </linearGradient>
          <linearGradient id="ufo-skirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3142" />
            <stop offset="1" stopColor="#0b0e16" />
          </linearGradient>
          <radialGradient id="ufo-glass" cx="0.38" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="0.25" style={{ stopColor: 'var(--accent)' }} stopOpacity="0.55" />
            <stop offset="0.75" style={{ stopColor: 'var(--accent-2)' }} stopOpacity="0.35" />
            <stop offset="1" stopColor="#0b1020" stopOpacity="0.85" />
          </radialGradient>
          <radialGradient id="ufo-core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.4" style={{ stopColor: 'var(--accent)' }} />
            <stop offset="1" style={{ stopColor: 'var(--accent)' }} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* lower hull + engine ring */}
        <ellipse cx="100" cy="80" rx="46" ry="11" fill="url(#ufo-skirt)" />
        <ellipse cx="100" cy="84" rx="26" ry="5" fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth="2" opacity="0.9" />
        <ellipse cx="100" cy="85" rx="12" ry="3.2" fill="url(#ufo-core)" />

        {/* saucer */}
        <ellipse cx="100" cy="66" rx="92" ry="19" fill="url(#ufo-hull)" />
        <ellipse cx="100" cy="60" rx="80" ry="9" fill="#ffffff" opacity="0.18" />
        <path d="M14 68 Q100 92 186 68" fill="none" stroke="#0b0e16" strokeOpacity="0.55" strokeWidth="2" />
        {/* rim lights */}
        {RIM_LIGHTS.map((i) => {
          const t = -0.86 + (i / (RIM_LIGHTS.length - 1)) * 1.72
          const x = 100 + Math.sin(t) * 84
          const y = 70 + Math.cos(t) * 5
          return (
            <circle key={i} cx={x} cy={y} r={2.1} className={lowPower ? '' : 'ufo-rim'}
              style={{ fill: i % 2 ? 'var(--accent-2)' : 'var(--accent)', animationDelay: `${i * 0.12}s` }} />
          )
        })}

        {/* dome */}
        <path d="M58 60 C60 22 140 22 142 60 Z" fill="url(#ufo-glass)" />
        <path d="M58 60 C60 22 140 22 142 60" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.2" />
        <path d="M74 44 C80 32 96 28 106 29" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="100" cy="60" rx="43" ry="5" fill="#0b0e16" opacity="0.35" />
        {/* antenna beacon */}
        <line x1="100" y1="28" x2="100" y2="17" stroke="#cfd8e6" strokeWidth="1.4" />
        <circle cx="100" cy="15" r="2.6" style={{ fill: 'var(--accent)' }} />
      </svg>
    </div>
  )
}
