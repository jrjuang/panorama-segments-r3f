// src/App.tsx
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
const SkyboxMaterial = shaderMaterial(
  { time: 0 },
  `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
    }
  `,
  `
    precision mediump float;
    varying vec3 vWorldPosition;

    void main() {
      vec3 color = vec3(0.1, 0.3, 0.6);
      float gradient = smoothstep(-1.0, 1.0, normalize(vWorldPosition).y);
      gl_FragColor = vec4(mix(vec3(0.8, 0.9, 1.0), color, gradient), 1.0);
    }
  `
);
extend({ SkyboxMaterial });

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
const Skybox = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({clock}) => {
    if (!ref.current) { return }
    ref.current.material.uniforms.time.value = clock.getElapsedTime();
  });
  return (
    <mesh ref={ref} scale={[1, 1, 1]}>
      <boxGeometry args={[100, 100, 100]} />
      <skyboxMaterial side={THREE.BackSide} />
    </mesh>
  );
};

const Model = () => {
  const { scene } = useGLTF('Suzanne.glb')
  return <primitive object={scene} />
}

const App = () => {
  return (
    <Canvas style={{ height: '100vh', width: '100vw' }}>
      <Skybox />
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
      <Environment files="studio_small_09_4k.exr" background/>
      <OrbitControls />
    </Canvas>
  )
}

export default App
