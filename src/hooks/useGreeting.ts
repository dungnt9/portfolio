import type { UiKey } from '@/i18n/ui'

/** Personalization: time-of-day greeting + returning-visitor detection (computed once per page load). */
let cached: { time: UiKey; visit: UiKey } | null = null

export function useGreeting() {
  if (cached) return cached
  const h = new Date().getHours()
  const time: UiKey = h < 12 ? 'greet.morning' : h < 18 ? 'greet.afternoon' : 'greet.evening'
  let visits = 0
  try {
    visits = Number(localStorage.getItem('visits') || 0)
    localStorage.setItem('visits', String(visits + 1))
  } catch { /* ignore */ }
  cached = { time, visit: visits > 0 ? 'greet.back' : 'greet.new' }
  return cached
}
