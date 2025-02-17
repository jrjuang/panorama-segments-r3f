// src/App.tsx
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const Model = () => {
  const { scene } = useGLTF('Suzanne.glb')
  return <primitive object={scene} />
}

const App = () => {
  return (
    <Canvas style={{ height: '100vh', width: '100vw' }}>
      <ambientLight />
      <pointLight position={[1, 5, 2]} />
      <Model />
      {/* <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" side={THREE.DoubleSide} args={[{metalness: 1, roughness: 0}]} />
      </mesh>
      <mesh scale={[10, 10, 10]} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial side={THREE.DoubleSide} args={[{ metalness: 1, roughness: 0 }]} />
      </mesh> */}
      {/* <Environment files="studio_small_09_4k.exr" background/> */}
      <Environment files="masks2_BGR.png" background/>
      <OrbitControls />
    </Canvas>
  )
}

export default App
