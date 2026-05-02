import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function OrbMesh() {
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.rotation.x = clock.elapsedTime * 0.15
    ref.current.rotation.y = clock.elapsedTime * 0.22
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.4
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[2.2, 1]} />
      <meshStandardMaterial color="#728C5A" wireframe transparent opacity={0.18} />
    </mesh>
  )
}

export default function HeroOrb() {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
      camera={{ position: [0, 0, 7], fov: 50 }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <OrbMesh />
    </Canvas>
  )
}
