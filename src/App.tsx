// src/App.tsx
import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const Model = () => {
  const { scene } = useGLTF('Suzanne.glb')
  return <primitive object={scene} />
}
import Skybox from "./Skybox"
const App = () => {
  const canvasRef = useRef(null);
  return (
    useEffect(() => {
      const canvas = canvasRef.current;
      function mouseUp(event) {console.log(event);} 
      canvas.addEventListener("mouseup" mouseUp);
      return () => canvas.removeEventListener("mouseup" mouseUp);
    }, []);
  <Canvas ref={canvasRef} style={{ height: '100vh', width: '100vw' }} camera={{ position: [0, -1.5, 4] }}>
    <Skybox />
    <ambientLight />
    <pointLight position={[1, 5, 2]} />
    <Model />
    <mesh>
      <boxGeometry args={[8, 8, 8]} />
      <meshStandardMaterial color="orange" side={THREE.DoubleSide} args={[{ metalness: 1, roughness: 0 }]} />
    </mesh>
    <mesh scale={[16, 16, 16]} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 32, 16]} />
      <meshStandardMaterial side={THREE.DoubleSide} args={[{ metalness: 1, roughness: 0 }]} />
    </mesh>
    <Environment files="studio_small_09_4k.exr" background />
    <OrbitControls />
  </Canvas>
  )
}

export default App
