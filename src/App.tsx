// src/App.tsx
import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import PanoScene from "./PanoScene.tsx"
import FovControls from "./FovControls"

// const Model = () => {
//   const { scene } = useGLTF('Suzanne.glb')
//   return <primitive object={scene} />
// }

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerpectiveCamera | null>(null);
  return (
    <Canvas ref={canvasRef} style={{ height: '100vh', width: '100vw' }} camera={{ position: [0, 0, -1], fov: 90 }} onCreated={({ camera }) => cameraRef.current = camera} >
      <PanoScene />
      <ambientLight />
      <pointLight position={[1, 5, 2]} />
      <OrbitControls rotateSpeed={-0.2}/>
      <FovControls />
    </Canvas>
  )
}

export default App
