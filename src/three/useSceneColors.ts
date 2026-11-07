import { useMemo } from 'react'
import { Color } from 'three'
import { useTheme, type Accent, type Mode } from '@/theme/ThemeProvider'

/** Mirror of the CSS accent tokens in styles/index.css — keep both in sync. */
const PALETTE: Record<Mode, Record<Accent, [string, string]>> = {
  dark: { aurora: ['#22d3ee', '#a78bfa'], sunset: ['#fb7185', '#fbbf24'], matrix: ['#4ade80', '#22d3ee'] },
  light: { aurora: ['#0369a1', '#6d28d9'], sunset: ['#be123c', '#b45309'], matrix: ['#15803d', '#0e7490'] },
}

/** Colors for 3D scenes, derived from the active theme & accent. */
export function useSceneColors() {
  const { mode, accent } = useTheme()
  return useMemo(() => {
    const [a, b] = PALETTE[mode][accent]
    const dark = mode === 'dark'
    return { accent: new Color(a), accent2: new Color(b), fg: new Color(dark ? '#eef0f6' : '#0a1020'), muted: new Color(dark ? '#a3aabb' : '#3f4a63'), dark }
  }, [mode, accent])
}

export { hasWebGL, isMobile, isLowPower } from './device'
