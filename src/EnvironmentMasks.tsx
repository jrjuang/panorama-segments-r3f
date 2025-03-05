import { useEffect, useRef } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial, Environment, useLoader } from "@react-three/drei";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
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
      vec3 worldDirection = normalize(linearWorldPos);
      vec2 uv = sphereUV(pointer);
      vec2 uv_masks = sphereUV(worldDirection);
      vec4 selection = texture2D(masks, uv);
      vec4 mask = texture2D(masks, uv_masks);
      float flicker = sin(time * 3.3) * 0.35 + 0.35;
      if (0.0 == selection.a) {
        discard;
      }
      float fade = 0.333;
      if (selection.rgb == mask.rgb) {
          gl_FragColor = vec4(selection.rgb, flicker * fade);
          return;
      }
      // Outline FX
      gl_FragColor = vec4(0.0);
      for (int i = -1; i < 2; i += 2) {
        for (int j = -1; j < 2; j += 2) {
          vec4 mask = texture2D(masks, uv_masks + vec2(i, j) * 0.0025);
          if (selection.rgb != mask.rgb) { continue; }
          gl_FragColor += vec4(selection.rgb, flicker);
        }
      }
    }
  `
);
extend({ SkyboxMaterial });

const EnvironmentMasks = ({ pointer }: { pointer: { origin: THREE.Vector3, direction: THREE.Vector3 } }) => {
  const textureLoader = new THREE.TextureLoader();
  const [exrPath, setExrPath] = useState<string>("studio.exr");
  const panorama = useLoader(RGBELoader, exrPath);
  const boxRef = useRef<THREE.Mesh>(null);
  function changeMasks(boxRef: React.RefObject<THREE.Mesh>, masksPath: string) {
    if (boxRef.current) {
      boxRef.current.material.uniforms.masks.value = textureLoader.load("masksPath");
    }
  }
  
  // Initialization
  useEffect(() => {
    setExrPath((prev: string) => "masks_studio.png");
    changeMasks(boxRef, "masks_studio.png");
  }, [boxRef.current]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "F3") {
        setExrPath((prev: string) => {
          if (prev === "/studio.exr") {
            changeMasks(boxRef, "masks_studio.png");
            return "/brown.exr";
          }
          if (prev === "/brown.exr") {
            changeMasks(boxRef, "masks_brown.png");
            return "/bathroom.exr";
          }
          if (prev === "/bathroom.exr") {
            changeMasks(boxRef, "masks_bathroom.png");
            return "/studio.exr";
          }
          changeMasks(boxRef, "masks_studio.png");
          return "/studio.exr";
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const { camera } = useThree();
  useFrame(({ clock }) => {
    if (!boxRef.current) { return; }
    const material = boxRef.current.material;
    material.uniforms.time.value = clock.getElapsedTime();
    material.uniforms.pointer.value = pointer.direction;
    const pos = camera.position;
    boxRef.current.position.set(pos.x, pos.y, pos.z);
    const r = 0.5 * (camera.near + camera.far)
    boxRef.current.scale.set(r, r, r);
  });

  return (
    <mesh ref={boxRef} scale={[0.5 * (camera.near + camera.far), 0.5 * (camera.near + camera.far), 0.5 * (camera.near + camera.far)]}>
      <Environment map={panorama} background />
      <boxGeometry />
      <skyboxMaterial side={THREE.BackSide} />
    </mesh>
  );
};

export default EnvironmentMasks;