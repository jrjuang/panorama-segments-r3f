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
    varying vec3 vWorldPosition;
    varying vec2 vUV;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      vUV = uv;
      vUV.x = -vUV.x + 1.0;
    }
  `,
    `
    precision mediump float;
    varying vec3 vWorldPosition;
    varying vec2 vUV;
    uniform float time;
    uniform sampler2D masks;

    void main() {
      vec3 color = vec3(0.1, 0.3, 0.6);
      float gradient = smoothstep(-1.0, 1.0, normalize(vWorldPosition).y);
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
        ref.current.geometry.radius = camera.nearClippingPlane;
    });

    return (
        <mesh ref={ref} scale={[1, 1, 1]}>
            <sphereGeometry args={[100, 32, 16]} />
            <skyboxMaterial side={THREE.BackSide} />
        </mesh>
    );
};

export default Skybox;