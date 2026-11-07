/**
 * The UFO's flight plan (see docs/STORYBOARD.md).
 *
 * Each waypoint is pinned to a section: `at` = 0 is the moment the section's top reaches ~35% of the
 * viewport (the visitor "arrives"), `at` = 1 is when the section is about to leave. Between waypoints the
 * position is interpolated from the scroll position and smoothed by a spring.
 * Positions are the UFO centre in viewport units: x in vw, y in vh, s = scale.
 * `d` = desktop (≥ 1024px), `m` = phones/tablets (UFO stays in the top band, alternating edges).
 */
export interface Pose { x: number; y: number; s: number }
export interface Waypoint { section: string; at: number; d: Pose; m: Pose; beam?: boolean; fade?: boolean }

export const WAYPOINTS: Waypoint[] = [
  // 0 · home planet: hovering above-right of the globe
  { section: 'top', at: 0, d: { x: 86, y: 24, s: 0.62 }, m: { x: 80, y: 16, s: 0.5 } },
  // 1 · About: crosses right → left, beams onto the chapter title
  { section: 'about', at: 0, d: { x: 15, y: 16, s: 0.8 }, m: { x: 18, y: 13, s: 0.55 }, beam: true },
  { section: 'about', at: 0.7, d: { x: 20, y: 14, s: 0.78 }, m: { x: 20, y: 12, s: 0.55 } },
  // 2 · Cloud: hovers over the construction site and beams the whole time, drifting as it "deploys"
  { section: 'cloud', at: 0.05, d: { x: 62, y: 15, s: 0.95 }, m: { x: 78, y: 12, s: 0.6 }, beam: true },
  { section: 'cloud', at: 0.95, d: { x: 80, y: 13, s: 0.9 }, m: { x: 80, y: 12, s: 0.6 }, beam: true },
  // 3 · Journey: diagonal climb, bottom-left → top-right (the career goes up)
  { section: 'journey', at: 0, d: { x: 8, y: 78, s: 0.6 }, m: { x: 16, y: 14, s: 0.5 } },
  { section: 'journey', at: 0.9, d: { x: 90, y: 14, s: 0.72 }, m: { x: 84, y: 12, s: 0.5 } },
  // 4 · Experience: shrinks into the distance — through the portal
  { section: 'experience', at: 0.15, d: { x: 52, y: 9, s: 0.22 }, m: { x: 52, y: 8, s: 0.2 }, fade: true },
  { section: 'experience', at: 0.85, d: { x: 50, y: 8, s: 0.18 }, m: { x: 50, y: 8, s: 0.18 }, fade: true },
  // 5 · Projects: bursts out of the portal, big, and scans the work with its beam
  { section: 'projects', at: 0, d: { x: 82, y: 14, s: 1 }, m: { x: 82, y: 13, s: 0.6 }, beam: true },
  { section: 'projects', at: 0.6, d: { x: 86, y: 18, s: 0.9 }, m: { x: 82, y: 12, s: 0.58 } },
  // 6 · Skills: a lap around the tech solar system
  { section: 'skills', at: 0, d: { x: 12, y: 16, s: 0.75 }, m: { x: 18, y: 13, s: 0.52 }, beam: true },
  { section: 'skills', at: 0.3, d: { x: 46, y: 26, s: 0.55 }, m: { x: 80, y: 14, s: 0.5 } },
  { section: 'skills', at: 0.55, d: { x: 70, y: 52, s: 0.85 }, m: { x: 20, y: 14, s: 0.5 } },
  { section: 'skills', at: 0.8, d: { x: 34, y: 70, s: 0.65 }, m: { x: 80, y: 14, s: 0.5 } },
  // 7 · Contact: lands centre-top and lights up the invitation
  { section: 'contact', at: 0, d: { x: 50, y: 16, s: 1.1 }, m: { x: 50, y: 11, s: 0.65 }, beam: true },
]
