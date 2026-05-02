import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SHAPES = [
  { pos: [4,   2,   -2],  type: 'icosahedron',  args: [1.8, 1],          color: '#728C5A', fs: 0.35, rs: [0.003, 0.004], sf: 0.0006 },
  { pos: [-4,  -1,  -3],  type: 'torus',         args: [1.2, 0.3, 8, 18], color: '#94bb66', fs: 0.28, rs: [0.002, 0.003], sf: 0.001  },
  { pos: [-2,   3,  -4],  type: 'octahedron',    args: [1.1, 0],          color: '#4d6b38', fs: 0.45, rs: [0.005, 0.003], sf: 0.0005 },
  { pos: [ 5.5,-2,  -5],  type: 'icosahedron',   args: [0.9, 0],          color: '#94bb66', fs: 0.55, rs: [0.004, 0.006], sf: 0.0015 },
  { pos: [ 1,  -4,  -2.5],type: 'dodecahedron',  args: [0.65, 0],         color: '#728C5A', fs: 0.65, rs: [0.006, 0.004], sf: 0.0008 },
  { pos: [-5,   2,  -3.5],type: 'sphere',         args: [0.55, 8, 8],     color: '#d4e4b4', fs: 0.4,  rs: [0.003, 0.005], sf: 0.0004 },
  { pos: [ 2,   4.5,-4],  type: 'octahedron',    args: [0.7, 0],          color: '#4d6b38', fs: 0.5,  rs: [0.004, 0.002], sf: 0.0007 },
]

function ShapeMesh({ pos, type, args, color, fs, rs, sf, scrollRef, mouseRef, pulseRef }) {
  const ref = useRef()
  const phase = useRef(Math.random() * Math.PI * 2)
  const base = useRef(pos)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime + phase.current
    const scroll = scrollRef.current
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    ref.current.position.x = base.current[0] + Math.cos(t * fs * 0.7) * 0.25 + mx * 0.4
    ref.current.position.y = base.current[1] + Math.sin(t * fs) * 0.4 - scroll * sf + my * 0.3
    ref.current.position.z = base.current[2]
    ref.current.rotation.x += rs[0]
    ref.current.rotation.y += rs[1]
    ref.current.scale.setScalar(1 + pulseRef.current * 0.25)
  })

  return (
    <mesh ref={ref} position={pos}>
      {type === 'icosahedron'  && <icosahedronGeometry  args={args} />}
      {type === 'torus'        && <torusGeometry         args={args} />}
      {type === 'octahedron'   && <octahedronGeometry   args={args} />}
      {type === 'dodecahedron' && <dodecahedronGeometry args={args} />}
      {type === 'sphere'       && <sphereGeometry        args={args} />}
      <meshStandardMaterial color={color} wireframe transparent opacity={0.18} />
    </mesh>
  )
}

function Scene({ scrollRef, mouseRef, pulseRef }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[8, 8, 4]} intensity={0.6} />
      {SHAPES.map((s, i) => (
        <ShapeMesh key={i} {...s} scrollRef={scrollRef} mouseRef={mouseRef} pulseRef={pulseRef} />
      ))}
    </>
  )
}

export default function Background3D() {
  const location = useLocation()
  const scrollRef = useRef(0)
  const mouseRef  = useRef({ x: 0, y: 0 })
  const pulseRef  = useRef(0)
  const rafRef    = useRef(null)

  useEffect(() => {
    const onScroll = () => { scrollRef.current = window.scrollY }
    const onMouse  = (e) => {
      mouseRef.current = {
        x:  (e.clientX / window.innerWidth  - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('scroll',    onScroll, { passive: true })
    window.addEventListener('mousemove', onMouse,  { passive: true })
    return () => {
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    pulseRef.current = 1
    const decay = () => {
      pulseRef.current = Math.max(0, pulseRef.current - 0.04)
      if (pulseRef.current > 0) rafRef.current = requestAnimationFrame(decay)
    }
    rafRef.current = requestAnimationFrame(decay)
    return () => cancelAnimationFrame(rafRef.current)
  }, [location.pathname])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#F3EDE3' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <Scene scrollRef={scrollRef} mouseRef={mouseRef} pulseRef={pulseRef} />
      </Canvas>
    </div>
  )
}
