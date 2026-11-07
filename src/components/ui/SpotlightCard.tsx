import type { HTMLAttributes, MouseEvent } from 'react'

export function SpotlightCard({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <div onMouseMove={onMove} className={`spotlight card transition-transform duration-300 hover:-translate-y-0.5 ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function Tag({ children }: { children: string }) {
  return <span className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">{children}</span>
}
