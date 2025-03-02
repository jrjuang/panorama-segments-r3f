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
  const cursorRay = { origin: new THREE.Vector3(), direction: new THREE.Vector3(1, 0, 0) };
  useEffect(() => {
    function mouseMove(event) {
      const camera = cameraRef.current;
      const canvas = canvasRef.current;
      let cursorDir = new THREE.Vector3(event.clientX / canvas.width * 2 - 1, -event.clientY / canvas.height * 2 + 1, 0);
      cursorDir.unproject(camera);
      cursorDir = cursorDir.sub(camera.position);
      cursorDir.normalize();
      cursorRay.origin = camera.position;
      cursorRay.direction = cursorDir;
    }
    const c = canvasRef.current;
    c.addEventListener("mousemove", mouseMove);
    return () => c.removeEventListener("mousemove", mouseMove);
  }, []);
  return (
    <Canvas ref={canvasRef} style={{ height: '100vh', width: '100vw' }} camera={{ position: [0, -1.5, 4] }} onCreated={({ camera }) => cameraRef.current = camera} >
      <Skybox pointer={cursorRay}/>
      <ambientLight />
      <pointLight position={[1, 5, 2]} />
      <Environment files="studio_small_09_4k.exr" background />
      <OrbitControls />
    </Canvas>
  )
}

export default App
