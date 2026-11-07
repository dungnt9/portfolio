/**
 * Official brand vectors from Simple Icons (CC0) — imported individually so only these are bundled.
 * AWS, C# and gRPC are not distributed by Simple Icons (trademark policy) → rendered as text badges.
 */
import {
  siAnsible, siApachekafka, siArgo, siDocker, siDotnet, siGithubactions, siHelm, siKubernetes, siLinux,
  siMinio, siNginx, siPostgresql, siRabbitmq, siReact, siRedis, siSocketdotio, siSpring, siTerraform,
  siTypescript, siVuedotjs,
} from 'simple-icons'

export interface Tech { name: string; path?: string; hex: string; text?: string }

const si = (name: string, i: { path: string; hex: string }): Tech => ({ name, path: i.path, hex: `#${i.hex}` })
const txt = (name: string, text: string, hex: string): Tech => ({ name, text, hex })

/** Orbits from the core outward: what I build with → what moves the data → where it runs. */
export const orbits: { label: string; seconds: number; items: Tech[] }[] = [
  {
    label: 'core',
    seconds: 38,
    items: [si('.NET', siDotnet), txt('C#', 'C#', '#9b4f96'), si('React', siReact), si('TypeScript', siTypescript), txt('gRPC', 'gRPC', '#244c5a')],
  },
  {
    label: 'data',
    seconds: 62,
    items: [
      si('PostgreSQL', siPostgresql), si('Redis', siRedis), si('RabbitMQ', siRabbitmq), si('Kafka', siApachekafka),
      si('MinIO', siMinio), si('Socket.io', siSocketdotio), si('Vue.js', siVuedotjs), si('Spring', siSpring),
    ],
  },
  {
    label: 'cloud',
    seconds: 96,
    items: [
      txt('AWS', 'aws', '#ff9900'), si('Docker', siDocker), si('Kubernetes', siKubernetes), si('Terraform', siTerraform),
      si('Ansible', siAnsible), si('Helm', siHelm), si('Argo CD', siArgo), si('GitHub Actions', siGithubactions),
      si('Nginx', siNginx), si('Linux', siLinux),
    ],
  },
]

/** Brand colours that vanish on a dark background (e.g. Kafka #231F20) fall back to the foreground colour. */
export function visibleColor(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return l < 0.28 ? 'var(--fg)' : hex
}
