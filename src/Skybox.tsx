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
        masks: { value: null }
    },
    `
    varying vec3 vWorldDirection;
    varying vec2 vUV;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 0.0);
      vWorldDirection = normalize(worldPosition.xyz);
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      float x = atan2(vWorldDirection.z, vWorldDirection.x);
      x = x / 3.1415926 + 0.5;
      float y = vWorldDirection.y * 0.5 + 0.5;
      vUV = vec2(x, y);
    }
  `,
    `
    precision mediump float;
    varying vec3 vWorldDirection;
    varying vec2 vUV;
    uniform float time;
    uniform sampler2D masks;

    void main() {
      vec3 color = vec3(0.1, 0.3, 0.6);
      float gradient = smoothstep(-1.0, 1.0, normalize(vWorldDirection).y);
      //gl_FragColor = vec4(mix(vec3(0.8, 0.9, 1.0), color, gradient), 1.0);
      //debug testing
      gl_FragColor = vec4(texture2D(masks, vUV).rgb, sin(time) * 0.5 + 0.5);
    }
  `
);
extend({ SkyboxMaterial });

const Skybox = () => {
    const ref = useRef<THREE.Mesh>(null);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        if (!ref.current) { return; }
        ref.current.material.uniforms.masks.value = loader.load("masks2_BGR.png");
    }, [ref.current]);

    const { camera } = useThree();
    useFrame(({ clock }) => {
        if (!ref.current) { return; }
        const material = ref.current.material;
        material.uniforms.time.value = clock.getElapsedTime();
        const pos = camera.position;
        ref.current.position.set(pos.x, pos.y, pos.z);
        const r = 0.5 * (camera.near + camera.far)
        ref.current.scale.set(r, r, r);
    });

    return (
        <mesh ref={ref} scale={[0.5 * (camera.near + camera.far), 0.5 * (camera.near + camera.far), 0.5 * (camera.near + camera.far)]}>
            <boxGeometry/>
            <skyboxMaterial side={THREE.BackSide} />
        </mesh>
    );
};

export default Skybox;