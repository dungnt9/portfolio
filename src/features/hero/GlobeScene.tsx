import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, BackSide, NormalBlending, Color, Group, Mesh, QuadraticBezierCurve3, Quaternion, Vector3 } from 'three'
import { isLowPower, isMobile, useSceneColors } from '@/three/useSceneColors'
import { FrameLimiter, useAdaptiveDpr } from '@/three/AdaptiveDpr'

/** AWS regions (approx. coordinates) + home node Hanoi. */
const HOME = { name: 'Hanoi', lat: 21.03, lon: 105.85 }
const REGIONS = [
  { name: 'us-east-1', lat: 38.9, lon: -77.0 },
  { name: 'us-west-2', lat: 45.5, lon: -122.7 },
  { name: 'sa-east-1', lat: -23.5, lon: -46.6 },
  { name: 'eu-west-1', lat: 53.3, lon: -6.3 },
  { name: 'eu-central-1', lat: 50.1, lon: 8.7 },
  { name: 'ap-south-1', lat: 19.0, lon: 72.8 },
  { name: 'ap-southeast-1', lat: 1.35, lon: 103.8 },
  { name: 'ap-northeast-1', lat: 35.7, lon: 139.7 },
  { name: 'ap-southeast-2', lat: -33.9, lon: 151.2 },
  { name: 'me-central-1', lat: 25.2, lon: 55.3 },
]
const R = 1.6
/** r3f re-measures the canvas on every page scroll by default (for pointer events, unused here) → state churn. */
const NO_SCROLL_TRACKING = { scroll: false, debounce: { scroll: 0, resize: 50 } }

function latLon(lat: number, lon: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180
  const th = ((lon + 180) * Math.PI) / 180
  return new Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th))
}

/** Procedural "continents" — dotted sphere masked by layered trig noise. */
function DottedSphere({ color, count, oceanOpacity = 0.22, dot = 1 }: { color: Color; count: number; oceanOpacity?: number; dot?: number }) {
  const [land, ocean] = useMemo(() => {
    const pts: number[] = []
    const sea: number[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const rad = Math.sqrt(1 - y * y)
      const t = golden * i
      const x = Math.cos(t) * rad, z = Math.sin(t) * rad
      const n = Math.sin(x * 3.1 + 1.3) * Math.cos(y * 2.7 - 0.4) + Math.sin(z * 4.3 + x * 1.7) * 0.6 + Math.cos(y * 6 + z * 2) * 0.25
      if (n > 0.0) pts.push(x * R, y * R, z * R)
      else if (i % 3 === 0) sea.push(x * R, y * R, z * R)
    }
    return [new Float32Array(pts), new Float32Array(sea)]
  }, [count])
  return (
    <>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[land, 3]} /></bufferGeometry>
        <pointsMaterial color={color} size={0.022 * dot} sizeAttenuation transparent opacity={0.9} toneMapped={false} />
      </points>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[ocean, 3]} /></bufferGeometry>
        <pointsMaterial color={color} size={0.012 * dot} sizeAttenuation transparent opacity={oceanOpacity} />
      </points>
    </>
  )
}

/** Fresnel atmosphere glow. */
function Atmosphere({ color, dark }: { color: Color; dark: boolean }) {
  const uniforms = useMemo(() => ({ uColor: { value: dark ? color : color.clone().lerp(new Color('#ffffff'), 0.55) }, uK: { value: dark ? 0.6 : 1.0 }, uA: { value: dark ? 0.55 : 0.3 } }), [color, dark])
  return (
    <mesh scale={1.07}>
      <sphereGeometry args={[R, 64, 64]} />
      <shaderMaterial
        side={BackSide} transparent blending={dark ? AdditiveBlending : NormalBlending} depthWrite={false} uniforms={uniforms}
        vertexShader={`varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`uniform vec3 uColor; uniform float uK; uniform float uA; varying vec3 vN; void main(){ float i = pow(max(0.0, 0.58 - dot(vN, vec3(0.0,0.0,1.0))), 5.0) * 4.0; gl_FragColor = vec4(uColor * uK, i * uA); }`}
      />
    </mesh>
  )
}

function Arc({ from, to, color, speed, offset }: { from: Vector3; to: Vector3; color: Color; speed: number; offset: number }) {
  const curve = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5)
    const lift = 1 + from.distanceTo(to) * 0.28
    mid.normalize().multiplyScalar(R * lift)
    return new QuadraticBezierCurve3(from, mid, to)
  }, [from, to])
  const points = useMemo(() => curve.getPoints(64), [curve])
  const hdr = useSceneColors().dark ? 3 : 1 // over-bright for bloom in dark; flat ink in light
  const head = useRef<Mesh>(null)
  const tail = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * speed + offset) % 1
    head.current?.position.copy(curve.getPoint(t))
    tail.current?.position.copy(curve.getPoint(Math.max(0, t - 0.04)))
  })
  return (
    <group>
      <Line points={points} color={color} lineWidth={hdr > 1 ? 1 : 1.4} transparent opacity={hdr > 1 ? 0.35 : 0.6} toneMapped={false} />
      <mesh ref={head}><sphereGeometry args={[0.022, 12, 12]} /><meshBasicMaterial color={color.clone().multiplyScalar(hdr)} toneMapped={false} /></mesh>
      <mesh ref={tail}><sphereGeometry args={[0.012, 8, 8]} /><meshBasicMaterial color={color.clone().multiplyScalar(1.5)} toneMapped={false} /></mesh>
    </group>
  )
}

function Pin({ pos, color, big }: { pos: Vector3; color: Color; big?: boolean }) {
  const hdr = useSceneColors().dark ? 3 : 1
  const ring = useRef<Mesh>(null)
  const quat = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), pos.clone().normalize()), [pos])
  useFrame(({ clock }) => {
    if (!ring.current) return
    const s = 1 + ((clock.elapsedTime * 0.8 + pos.x) % 1) * 2.5
    ring.current.scale.setScalar(s)
    ;(ring.current.material as { opacity: number }).opacity = 1 - (s - 1) / 2.5
  })
  return (
    <group position={pos} quaternion={quat}>
      <mesh><circleGeometry args={[big ? 0.04 : 0.025, 24]} /><meshBasicMaterial color={color.clone().multiplyScalar(hdr)} toneMapped={false} /></mesh>
      <mesh ref={ring}><ringGeometry args={[0.04, 0.05, 32]} /><meshBasicMaterial color={color} transparent toneMapped={false} /></mesh>
    </group>
  )
}

function Globe() {
  const c = useSceneColors()
  const group = useRef<Group>(null)
  // primitive selectors: re-render only when the canvas size really changes (not on every store update)
  const pointer = useThree((s) => s.pointer)
  const vw = useThree((s) => s.viewport.width), vh = useThree((s) => s.viewport.height)
  const sw = useThree((s) => s.size.width), sh = useThree((s) => s.size.height)
  const viewport = { width: vw, height: vh }, size = { width: sw, height: sh }
  const mobile = isMobile()
  const home = useMemo(() => latLon(HOME.lat, HOME.lon), [])
  const regions = useMemo(() => REGIONS.map((r) => latLon(r.lat, r.lon)), [])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    g.rotation.y += dt * 0.08
    g.rotation.x += ((pointer.y * 0.25) - g.rotation.x) * 0.04
    g.position.y += ((pointer.y * 0.1) - g.position.y) * 0.04
  })

  // Wide screens: globe sits in the right half. Narrow (hero taller than the screen): it peeks in from the
  // upper-right of the FIRST screen, behind the name — its dark core keeps the text readable.
  const wide = viewport.width / viewport.height > 1.2
  const u = viewport.height / size.height // world units per CSS pixel
  const screenH = Math.min(size.height, typeof window !== 'undefined' ? window.innerHeight : size.height)
  const rPx = Math.min(130, size.width * 0.28)
  const x = wide ? viewport.width * 0.25 : (size.width * 0.97 - size.width / 2) * u
  const y = wide ? 0 : (size.height / 2 - Math.max(200, screenH * 0.28)) * u
  const scale = wide ? Math.min(1, viewport.width / 11) : (rPx * u) / R
  return (
    <group position={[x, y, 0]} scale={scale}>
      <group ref={group} rotation={[0.35, -1.9, 0]}>
        <mesh><sphereGeometry args={[R * 0.985, 64, 64]} /><meshBasicMaterial color={c.dark ? '#060914' : '#f8fbff'} /></mesh>
        <DottedSphere color={c.accent} count={mobile ? 3200 : 11000} oceanOpacity={c.dark ? 0.22 : 0.45} dot={wide ? 1 : 0.7} />
        <Pin pos={home} color={c.accent2} big />
        {regions.map((p, i) => <Pin key={i} pos={p} color={c.accent} />)}
        {regions.map((p, i) => <Arc key={i} from={home} to={p} color={i % 2 ? c.accent : c.accent2} speed={0.18 + (i % 4) * 0.05} offset={i * 0.13} />)}
      </group>
      <Atmosphere color={c.accent} dark={c.dark} />
      <MoonOrbit />
    </group>
  )
}

const ORBIT_R = R * 1.75

/** Small moon riding its own dashed orbit (same plane, same radius), inclined around the globe. */
function MoonOrbit() {
  const c = useSceneColors()
  const pivot = useRef<Group>(null)
  useFrame((_, dt) => { if (pivot.current) pivot.current.rotation.y -= dt * 0.3 })
  const ring = useMemo(() => Array.from({ length: 161 }, (_, i) => {
    const a = (i / 160) * Math.PI * 2
    return new Vector3(Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R)
  }), [])
  const glow = useMemo(() => ({ uColor: { value: c.accent2 }, uA: { value: c.dark ? 0.32 : 0.18 } }), [c])
  return (
    <group rotation={[0.42, 0, -0.32]}>
      <Line points={ring} color={c.accent2} lineWidth={1} transparent opacity={c.dark ? 0.35 : 0.5} dashed dashSize={0.09} gapSize={0.07} />
      <group ref={pivot}>
        <group position={[ORBIT_R, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 48, 48]} />
            <meshStandardMaterial color={c.dark ? '#b8c2d8' : '#dfe6f2'} roughness={0.85} metalness={0.05} emissive={c.accent2} emissiveIntensity={c.dark ? 0.18 : 0.08} />
          </mesh>
          {/* soft rim glow */}
          <mesh scale={1.22}>
            <sphereGeometry args={[0.12, 32, 32]} />
            <shaderMaterial side={BackSide} transparent depthWrite={false} blending={c.dark ? AdditiveBlending : NormalBlending} uniforms={glow}
              vertexShader={`varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
              fragmentShader={`uniform vec3 uColor; uniform float uA; varying vec3 vN; void main(){ float i = pow(max(0.0, 0.62 - dot(vN, vec3(0.0,0.0,1.0))), 4.0) * 3.0; gl_FragColor = vec4(uColor, i * uA); }`}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export default function GlobeScene({ onReady, active = true }: { onReady?: () => void; active?: boolean }) {
  const c = useSceneColors()
  const mobile = isMobile()
  const low = isLowPower()
  const [dpr, monitor] = useAdaptiveDpr(low ? 1.25 : 2, low ? 1 : 1.5)
  return (
    <Canvas resize={NO_SCROLL_TRACKING} frameloop={!active ? 'never' : low ? 'demand' : 'always'} dpr={low ? 1.5 : dpr} camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: !low, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.debug.checkShaderErrors = import.meta.env.DEV; requestAnimationFrame(() => requestAnimationFrame(() => onReady?.())) }}>
      {!low && monitor /* at a capped 30 fps the monitor would misread the device as slow */}
      {low && active && <FrameLimiter fps={30} />}
      {c.dark && <Stars radius={60} depth={40} count={mobile ? 1200 : 3000} factor={3} saturation={0} fade speed={0.6} />}
      <Sparkles count={mobile ? 30 : 70} scale={[10, 6, 4]} size={c.dark ? 2 : 3} speed={0.3} color={c.accent2} opacity={c.dark ? 0.6 : 0.8} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 3, 5]} intensity={1.6} />
      <Globe />
      {/* glow is the dark theme's language; the blueprint (light) theme stays crisp. Skipped on phones: full-screen bloom is the costliest pass. */}
      {c.dark && !low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.35} luminanceSmoothing={0.3} />
          <Vignette eskil={false} offset={0.2} darkness={0.6} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
