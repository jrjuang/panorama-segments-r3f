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
    varying vec3 linearWorldPos;
    void main() {
      linearWorldPos = mat3(modelMatrix) * position;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
  `,
    `
    precision mediump float;
    varying vec3 linearWorldPos;
    uniform float time;
    uniform sampler2D masks;
    const float OVER_TWO_PI = 0.15915494309;

    void main() {
      vec3 worldDirection = normalize(linearWorldPos);
      //debug sky blue
      vec3 color = vec3(0.1, 0.3, 0.6);
      float gradient = smoothstep(-1.0, 1.0, worldDirection.y);
      //gl_FragColor = vec4(mix(vec3(0.8, 0.9, 1.0), color, gradient), 1.0);
      
      float x = atan(worldDirection.z, worldDirection.x);
      x = x * OVER_TWO_PI + 0.5;
      float y = asin(worldDirection.y) * OVER_TWO_PI * 2.0 + 0.5;
      vec2 uv = vec2(x, y);
      //debug testing
      gl_FragColor = vec4(uv, 0, sin(time * 0.5) * 0.5 + 0.5);
      //gl_FragColor = vec4(texture2D(masks, vUV).rgb, sin(time) * 0.5 + 0.5);
    }
  `
);
extend({ SkyboxMaterial });

const Skybox = ({pointer}) => {
    const ref = useRef<THREE.Mesh>(null);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        if (!ref.current) { return; }
        ref.current.material.uniforms.masks.value = loader.load("masks2_BGR.png");
    }, [ref.current]);

    const { camera } = useThree();
    useFrame(({ clock }) => {
        //debug
        console.log(`Pointer: ${pointer.direction.x}, ${pointer.direction.y}, ${pointer.direction.z}`);

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
            <boxGeometry />
            <skyboxMaterial side={THREE.BackSide} />
        </mesh>
    );
};

export default Skybox;