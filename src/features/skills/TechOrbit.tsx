import { orbits, visibleColor, type Tech } from '@/content/techIcons'
import { profile } from '@/content/profile'

/**
 * "Tech Universe": my stack as a solar system.
 * Pure CSS transforms (GPU-composited, frame-time based → no drift in background tabs),
 * crisp SVG brand vectors; the system never stops, hovering a planet shows its name. Decorative: the
 * accessible list of skills lives in the cards below (this block is aria-hidden).
 */
const SIZES = [40, 68, 96] // ring diameter, % of the container

function Planet({ t, angle, seconds, reverse }: { t: Tech; angle: number; seconds: number; reverse: boolean }) {
  const color = visibleColor(t.hex)
  return (
    <div className="orbit-planet pointer-events-none absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
      <div className="group/planet absolute left-1/2 top-0" data-planet style={{ transform: `translate(-50%,-50%) rotate(${-angle}deg)` }}>
        {/* counter-spin keeps the logo upright while the ring rotates */}
        <div className="orbit-spin" style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? 'normal' : 'reverse' }}>
          <div
            className="pointer-events-auto relative grid h-9 w-9 place-items-center rounded-full border border-border bg-[var(--chip)] shadow-[0_0_24px_-6px_var(--c)] backdrop-blur transition-transform duration-300 group-hover/planet:scale-125 sm:h-12 sm:w-12"
            style={{ ['--c' as string]: color }}
          >
            {t.path ? (
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 sm:h-6 sm:w-6" fill={color} aria-hidden><path d={t.path} /></svg>
            ) : (
              <span className="font-mono text-[9px] font-bold sm:text-[11px]" style={{ color }}>{t.text}</span>
            )}
            <span role="tooltip" className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-white/10 bg-black/85 px-2 py-1 font-mono text-[11px] text-white opacity-0 shadow-lg transition duration-200 group-hover/planet:translate-y-0 group-hover/planet:opacity-100">{t.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TechOrbit() {
  return (
    <div aria-hidden className="orbit-system relative mx-auto aspect-square w-full max-w-[min(680px,92vw)] select-none" data-clip-ok>
      {/* nebula */}
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_65%)] blur-2xl" />
      <div className="absolute inset-[20%] rounded-full bg-[radial-gradient(circle_at_70%_30%,color-mix(in_oklab,var(--accent-2)_25%,transparent),transparent_60%)] blur-2xl" />

      {orbits.map((o, ri) => {
        const reverse = ri % 2 === 1
        return (
          <div key={o.label} data-ring className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `${SIZES[ri]}%`, height: `${SIZES[ri]}%` }}>
            {/* ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-[color-mix(in_oklab,var(--fg)_14%,transparent)]" />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-bg px-2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted sm:text-[10px]">{o.label}</span>
            {/* rotating carrier */}
            <div className="orbit-spin absolute inset-0" style={{ animationDuration: `${o.seconds}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
              {o.items.map((t, i) => (
                <Planet key={t.name} t={t} angle={(360 / o.items.length) * i + ri * 17} seconds={o.seconds} reverse={reverse} />
              ))}
            </div>
          </div>
        )
      })}

      {/* the sun */}
      <div
        data-sun className="sun-pulse absolute left-1/2 top-1/2 grid h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 shadow-[0_0_80px_10px_color-mix(in_oklab,var(--accent)_45%,transparent)]"
      >
        <div className="text-center leading-tight text-[var(--on-accent)]">
          <div className="font-mono text-[10px] font-bold sm:text-sm">{'</>'}</div>
          <div className="font-mono text-[9px] font-semibold sm:text-xs">{profile.handle}</div>
        </div>
      </div>
    </div>
  )
}
