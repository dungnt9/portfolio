import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Edges, Grid, Html } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import type { MotionValue } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Color, EdgesGeometry, Group, Mesh, MeshStandardMaterial, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three-stdlib'
import { archEdges, archNodes, type ArchNode } from '@/content/architecture'
import { isLowPower, useSceneColors } from '@/three/useSceneColors'
import { useAdaptiveDpr } from '@/three/AdaptiveDpr'

const STEPS = 5
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const level = (p: number) => p * (STEPS + 0.4)
const ease = (t: number) => 1 - Math.pow(1 - t, 3)

function useKindColor() {
  const c = useSceneColors()
  return useMemo(() => {
    const map: Record<ArchNode['kind'], Color> = {
      user: c.fg.clone(), edge: c.accent, security: new Color('#f87171'), lb: c.accent2,
      service: c.accent, data: c.accent2, storage: new Color('#34d399'), observe: new Color('#fbbf24'),
    }
    return { map, c }
  }, [c])
}

/** Box bodies + their outlines are built once per height and shared by every node (mounting 14 copies janked the scroll). */
const boxCache = new Map<number, { body: BufferGeometry; edges: EdgesGeometry }>()
function box(h: number) {
  let g = boxCache.get(h)
  if (!g) {
    const body = new RoundedBoxGeometry(0.95, h, 0.95, 3, 0.08)
    g = { body, edges: new EdgesGeometry(body, 30) }
    boxCache.set(h, g)
  }
  return g
}

function Node({ node, progress, color, dark }: { node: ArchNode; progress: MotionValue<number>; color: Color; dark: boolean }) {
  const body = dark ? '#0b1020' : color // dark: glowing glass; light: solid painted blocks
  const glow = dark ? 0.45 : 0.1
  const edge = useMemo(() => color.clone().multiplyScalar(dark ? 2.2 : 0.75), [color, dark])
  const group = useRef<Group>(null)
  const mat = useRef<MeshStandardMaterial>(null)
  const label = useRef<HTMLDivElement>(null)
  const isUser = node.kind === 'user'
  const h = node.kind === 'data' ? 0.5 : node.kind === 'service' ? 0.42 : 0.36

  useFrame(({ clock }) => {
    const r = ease(clamp01(level(progress.get()) - node.step))
    const g = group.current
    if (!g) return
    g.scale.setScalar(0.001 + r)
    g.position.y = node.pos[1] + (1 - r) * 2 + Math.sin(clock.elapsedTime * 1.4 + node.pos[0]) * 0.04 * r
    if (mat.current) mat.current.emissiveIntensity = (0.3 + r * 0.7 + Math.sin(clock.elapsedTime * 2 + node.pos[2]) * 0.12) * glow
    if (label.current) label.current.style.opacity = String(r)
  })

  return (
    <group ref={group} position={node.pos}>
      {isUser ? (
        <mesh><icosahedronGeometry args={[0.42, 1]} /><meshStandardMaterial ref={mat} color={color} emissive={color} wireframe toneMapped={false} /></mesh>
      ) : node.kind === 'data' ? (
        <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.42, 0.42, h, 40]} /><meshStandardMaterial ref={mat} color={body} emissive={color} metalness={dark ? 0.5 : 0.1} roughness={dark ? 0.3 : 0.45} toneMapped={false} /><Edges threshold={40} color={edge} toneMapped={false} /></mesh>
      ) : (
        <group position={[0, h / 2, 0]}>
          <mesh geometry={box(h).body}>
            <meshStandardMaterial ref={mat} color={body} emissive={color} metalness={dark ? 0.5 : 0.1} roughness={dark ? 0.3 : 0.45} toneMapped={false} />
          </mesh>
          <lineSegments geometry={box(h).edges}><lineBasicMaterial color={edge} toneMapped={false} /></lineSegments>
        </group>
      )}
      {!isUser && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.62, 0.66, 48]} /><meshBasicMaterial color={color} transparent opacity={0.5} toneMapped={false} />
        </mesh>
      )}
      <Html position={[0, h + 0.55, 0]} center distanceFactor={9} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={label} style={{ opacity: 0 }} className="whitespace-nowrap rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-center backdrop-blur-md">
          <div className="text-[13px] font-semibold leading-tight text-white">{node.label}</div>
          <div className="font-mono text-[10px] leading-tight text-slate-400">{node.sub}</div>
        </div>
      </Html>
    </group>
  )
}

function Link({ a, b, progress, color }: { a: ArchNode; b: ArchNode; progress: MotionValue<number>; color: Color }) {
  const step = Math.max(a.step, b.step)
  const line = useRef<Mesh>(null)
  const packet = useRef<Mesh>(null)
  const { va, vb, mid, len, quat } = useMemo(() => {
    const va = new Vector3(a.pos[0], a.pos[1] + 0.2, a.pos[2]), vb = new Vector3(b.pos[0], b.pos[1] + 0.2, b.pos[2])
    const dir = vb.clone().sub(va)
    const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize())
    return { va, vb, mid: va.clone().add(vb).multiplyScalar(0.5), len: dir.length(), quat }
  }, [a, b])
  const hdr = useSceneColors().dark ? 3 : 0.8
  const speed = useMemo(() => 0.35 + Math.random() * 0.4, [])
  const off = useMemo(() => Math.random(), [])

  useFrame(({ clock }) => {
    const r = clamp01((level(progress.get()) - step) * 1.5)
    if (line.current) { line.current.scale.set(1, r, 1); (line.current.material as { opacity: number }).opacity = 0.15 + r * 0.35 }
    if (packet.current) {
      const t = (clock.elapsedTime * speed + off) % 1
      packet.current.position.lerpVectors(va, vb, t)
      packet.current.visible = r > 0.99
    }
  })
  return (
    <group>
      <mesh ref={line} position={mid} quaternion={quat}>
        <cylinderGeometry args={[0.012, 0.012, len, 6]} />
        <meshBasicMaterial color={color} transparent toneMapped={false} />
      </mesh>
      <mesh ref={packet}><sphereGeometry args={[0.055, 12, 12]} /><meshBasicMaterial color={color.clone().multiplyScalar(hdr)} toneMapped={false} /></mesh>
    </group>
  )
}

function Zone({ progress, step, size, pos, color, label }: { progress: MotionValue<number>; step: number; size: [number, number, number]; pos: [number, number, number]; color: Color; label: string }) {
  const g = useRef<Group>(null)
  const tag = useRef<HTMLDivElement>(null)
  useFrame(() => {
    const r = ease(clamp01(level(progress.get()) - step))
    if (g.current) { g.current.scale.set(1, 0.001 + r, 1); g.current.visible = r > 0.01 }
    if (tag.current) tag.current.style.opacity = String(r)
  })
  return (
    <group ref={g} position={pos}>
      <mesh position={[0, size[1] / 2, 0]}>
        <boxGeometry args={size} />
        <meshBasicMaterial color={color} transparent opacity={0.035} depthWrite={false} />
        <Edges color={color} />
      </mesh>
      <Html position={[0, size[1] + 0.15, -size[2] / 2]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div ref={tag} style={{ opacity: 0 }} className="whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-widest" >
          <span style={{ color: `#${color.getHexString()}` }}>{label}</span>
        </div>
      </Html>
    </group>
  )
}

function Rig({ progress }: { progress: MotionValue<number> }) {
  const mobile = window.innerWidth < 1024
  const target = useMemo(() => new Vector3(), [])
  const camera = useThree((s) => s.camera)
  const sw = useThree((s) => s.size.width), sh = useThree((s) => s.size.height)
  const size = useMemo(() => ({ width: sw, height: sh }), [sw, sh])
  // Desktop: shift the rendered frame right (projection offset) so the diagram never sits under the text panel.
  useEffect(() => {
    const cam = camera as PerspectiveCamera
    if (size.width >= 1024) cam.setViewOffset(size.width, size.height, -size.width * 0.2, 0, size.width, size.height)
    // portrait phones: lift the diagram so its tail (S3) clears the step card at the bottom
    else if (size.width < size.height) cam.setViewOffset(size.width, size.height, 0, size.height * 0.07, size.width, size.height)
    else cam.clearViewOffset()
    cam.updateProjectionMatrix()
  }, [camera, size])
  useFrame(({ camera, pointer }) => {
    const p = progress.get()
    // Portrait screens: the diagram is rotated to flow top → bottom, camera looks from the front, high up.
    const portrait = size.width / size.height < 1
    const ang = portrait ? -0.12 + p * 0.24 : (mobile ? -0.75 : -0.4) + p * (mobile ? 1.0 : 0.55) + pointer.x * 0.06
    const rad = portrait ? (size.width < 500 ? 24 : 19) : mobile ? 21 : 18.5
    const hgt = portrait ? (size.width < 500 ? 24.6 : 19.5) : (mobile ? 12 : 8) - p * 1.5 + pointer.y * 0.4
    target.set(Math.sin(ang) * rad, hgt, Math.cos(ang) * rad)
    camera.position.lerp(target, 0.06)
    camera.lookAt(0, 0.3, 0)
  })
  return null
}

export default function ArchScene({ progress, active = true }: { progress: MotionValue<number>; active?: boolean }) {
  const { map, c } = useKindColor()
  const byId = useMemo(() => Object.fromEntries(archNodes.map((n) => [n.id, n])), [])
  const portrait = typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 1
  const low = isLowPower()
  const [dpr, monitor] = useAdaptiveDpr(2, 1.5)
  return (
    <Canvas resize={{ scroll: false, debounce: { scroll: 0, resize: 50 } }} frameloop={active ? 'always' : 'never'} dpr={dpr} camera={{ position: [-8, 8, 10], fov: 40 }} gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => { gl.debug.checkShaderErrors = import.meta.env.DEV }}>
      {monitor}
      <ambientLight intensity={c.dark ? 0.4 : 1.1} />
      {!c.dark && <directionalLight position={[-4, 10, 6]} intensity={2.2} />}
      <pointLight position={[0, 6, 4]} intensity={40} color={c.accent} />
      <pointLight position={[-6, 4, -4]} intensity={25} color={c.accent2} />
      <Rig progress={progress} />
      <Grid position={[0, -0.01, 0]} args={[40, 40]} cellSize={0.5} sectionSize={2.5} cellThickness={0.5} sectionThickness={1}
        cellColor={c.dark ? '#1b2233' : '#c9cfdd'} sectionColor={c.accent} fadeDistance={26} fadeStrength={1.5} infiniteGrid />
      <group rotation={[0, portrait ? -Math.PI / 2 : 0, 0]}>
      <Zone progress={progress} step={1} pos={[1.1, 0, 0]} size={[6.2, 1.6, 6.0]} color={c.accent2} label="VPC · ap-southeast-1" />
      <Zone progress={progress} step={2} pos={[0.6, 0.02, 0]} size={[1.7, 1.1, 5.6]} color={c.accent} label="EKS · private subnet" />
      {archEdges.map(([x, y]) => <Link key={x + y} a={byId[x]} b={byId[y]} progress={progress} color={map[byId[y].kind]} />)}
      {archNodes.map((n) => <Node key={n.id} node={n} progress={progress} color={map[n.kind]} dark={c.dark} />)}
      </group>
      {c.dark && !low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.3} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
