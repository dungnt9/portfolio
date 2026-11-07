export type Lang = 'en' | 'vi'
export type L = Record<Lang, string>

/** A single image, or one per theme. */
export type OrgLogo = string | { dark: string; light: string }

export interface Experience { period: string; title: L; company: string; logo?: OrgLogo; points: L[]; tags: string[] }
export interface Project { slug: string; featured?: boolean; title: L; summary: L; challenge?: L; solution?: L; tags: string[]; link?: string }
export interface Milestone { year: string; status: 'done' | 'now' | 'next' | 'goal'; title: L; desc: L }

export interface Profile {
  name: string
  nameShort: string
  handle: string
  role: L
  tagline: L
  rotatingTitles: L[]
  location: L
  company: string
  companyLogo: OrgLogo
  available: boolean
  contact: { email: string; linkedin: string; github?: string }
  about: L[]
  traits: { icon: 'target' | 'network' | 'scale' | 'compass'; title: L; desc: L }[]
  stats: { value: number; suffix: string; label: L }[]
  education: { school: string; short: string; logo: OrgLogo; degree: L; period: string; note: L }
  certs: { name: string; issuer: string; date: string }[]
  experience: Experience[]
  projects: Project[]
  skills: { group: L; items: string[] }[]
  journey: Milestone[]
  learning: { name: string; progress: number }[]
}
