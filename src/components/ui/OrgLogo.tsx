import type { OrgLogo as Logo } from '@/content/types'
import { useTheme } from '@/theme/ThemeProvider'

/** Organisation logo that swaps variant with the theme (e.g. white ELCOM on dark, blue on light). */
export function OrgLogo({ logo, alt, className = '' }: { logo: Logo; alt: string; className?: string }) {
  const { mode } = useTheme()
  const src = typeof logo === 'string' ? logo : logo[mode]
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`object-contain ${className}`} />
}
