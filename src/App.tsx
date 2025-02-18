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
  const cameraRef = useRef<THREE.PerpectiveCamera | null>(null);
  // Get the mouse cursor position
  useEffect(() => {
    function mouseUp(event) {
      const camera = cameraRef.current;
      const canvas = canvasRef.current;
      let cursorDir = new THREE.Vector3(event.clientX / canvas.width * 2 - 1, -event.clientY / canvas.height * 2 + 1, 0);
      cursorDir.unproject(camera);
      cursorDir.normalize();
      const cursorRay = { origin: camera.position, direction: cursorDir };
      //debug
      console.log(event);
      console.log(camera.matrixWorldInverse)
      console.log(cursorRay);
    }
    canvasRef.current.addEventListener("mouseup", mouseUp);
    return () => canvasRef.current.removeEventListener("mouseup", mouseUp);
  }, []);
  return (
    <Canvas ref={canvasRef} style={{ height: '100vh', width: '100vw' }} camera={{ position: [0, -1.5, 4] }} onCreated={({ camera }) => cameraRef.current = camera} >
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
