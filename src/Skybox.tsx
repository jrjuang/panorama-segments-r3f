import { useEffect, useRef } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three"
const SkyboxMaterial = shaderMaterial(
  {
    time: 0,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    pointer: { value: new THREE.Vector3() },
    masks: { value: null }
  },
  `
    varying vec3 linearWorldPos;
    void main() {
      linearWorldPos = mat3(modelMatrix) * position;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
  `,
  `
    const float OVER_TWO_PI = 0.15915494309;
    vec2 sphereUV(vec3 direction) {
      float x = atan(direction.z, direction.x);
      x = x * OVER_TWO_PI + 0.5;
      float y = asin(direction.y) * OVER_TWO_PI * 2.0 + 0.5;
      vec2 uv = vec2(x, y);
      return uv;
    }

    precision mediump float;
    varying vec3 linearWorldPos;
    uniform float time;
    uniform sampler2D masks;
    uniform vec3 pointer;

    void main() {
      //debug sky blue
      // vec3 color = vec3(0.1, 0.3, 0.6);
      // float gradient = smoothstep(-1.0, 1.0, pointer.y);
      //gl_FragColor = vec4(mix(vec3(0.8, 0.9, 1.0), color, gradient), 1.0);
      
      vec3 worldDirection = normalize(linearWorldPos);
      vec2 uv = sphereUV(pointer);
      vec2 uv_masks = sphereUV(worldDirection);
      //debug testing
      // gl_FragColor = vec4(uv, 0, sin(time * 0.5) * 0.5 + 0.5);

      vec4 selection = texture2D(masks, uv);
      vec4 masks = texture2D(masks, uv_masks);
      //debug
      // gl_FragColor = vec4(masks.rgb, sin(time * 0.5) * 0.5 + 0.5);
      
      gl_FragColor = selection.rgb == masks.rgb ? selection : vec4(0.0);
    }
  `
);
extend({ SkyboxMaterial });

const Skybox = ({ pointer }) => {
  const ref = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    if (!ref.current) { return; }
    ref.current.material.uniforms.masks.value = loader.load("masks2.png");
  }, [ref.current]);

  const { camera } = useThree();
  useFrame(({ clock }) => {
    //debug
    console.log(`Pointer: ${pointer.direction.x}, ${pointer.direction.y}, ${pointer.direction.z}`);

    if (!ref.current) { return; }
    const material = ref.current.material;
    material.uniforms.time.value = clock.getElapsedTime();
    material.uniforms.pointer.value = pointer.direction;
    const pos = camera.position;
    ref.current.position.set(pos.x, pos.y, pos.z);
    const r = 0.5 * (camera.near + camera.far)
    ref.current.scale.set(r, r, r);
  });

  return (
    <mesh ref={ref} scale={[0.5 * (camera.near + camera.far), 0.5 * (camera.near + camera.far), 0.5 * (camera.near + camera.far)]}>
      <boxGeometry />
      <skyboxMaterial side={THREE.BackSide} />
    </mesh>
  );
};

export default Skybox;