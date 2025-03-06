import { useEffect, useRef, useState } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial, Environment } from "@react-three/drei";
import * as THREE from "three"
const SkyboxMaterial = shaderMaterial(
  {
    time: 0,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    masks: { value: null },
    selectionMask: new THREE.Vector4()
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
    uniform vec4 selectionMask;

    void main() {
      vec3 worldDirection = normalize(linearWorldPos);
      vec2 uv_masks = sphereUV(worldDirection);
      vec4 mask = texture2D(masks, uv_masks);
      float flicker = sin(time * 3.3) * 0.35 + 0.35;
      if (0.0 == selectionMask.a) {
        discard;
      }
      float fade = 0.333;
      if (selectionMask.rgb == mask.rgb) {
          gl_FragColor = vec4(selectionMask.rgb, flicker * fade);
          return;
      }
      // Outline FX
      gl_FragColor = vec4(0.0);
      for (int i = -1; i < 2; i += 2) {
        for (int j = -1; j < 2; j += 2) {
          vec4 mask = texture2D(masks, uv_masks + vec2(i, j) * 0.0025);
          if (selectionMask.rgb != mask.rgb) { continue; }
          gl_FragColor += vec4(selectionMask.rgb, flicker);
        }
      }
    }
  `
);
extend({ SkyboxMaterial });

const PanoScene = ({ pointer }: { pointer: { origin: THREE.Vector3, direction: THREE.Vector3 } }) => {
  const [masks, setMasks] = useState<CanvasRenderingContext2D | null>(null);

  const masksPathOfExr: Map<string, string> = new Map();
  masksPathOfExr.set("studio.exr", "masks2_studio.png");
  masksPathOfExr.set("brown.exr", "masks2_brown.png");
  masksPathOfExr.set("bathroom.exr", "masks2_bathroom.png");

  const textureLoader = new THREE.TextureLoader();
  function changeMasks(boxRef: React.RefObject<THREE.Mesh>, masksPath: string) {
    textureLoader.load(masksPath, (masks: THREE.Texture) => {
      if (boxRef.current) {
        // Keep RGB as intergers as IDs
        masks.format =  THREE.RGBFormat;
        masks.type = THREE.UnsignedByteType;
        masks.magFilter = THREE.NearestFilter; // Avoid interpolation
        masks.needsUpdate = true;

        boxRef.current.material.uniforms.masks.value = masks;
      }
      const tempCanvas = document.createElement("canvas");
      const img_masks = masks.image;
      tempCanvas.width = img_masks.width;
      tempCanvas.height = img_masks.height;
      const context = tempCanvas.getContext("2d");
      context?.drawImage(img_masks, 0, 0);
      setMasks(context);
    });
  }

  const OVER_TWO_PI: number = 0.5 / Math.PI;
  const sphereUV = (direction: THREE.Vector3): [number, number] => {
    let x: number = Math.atan2(direction.z, direction.x);
    x = x * OVER_TWO_PI + 0.5;
    const y: number = Math.asin(direction.y) * OVER_TWO_PI * 2.0 + 0.5;
    return [x, y];
  }

  const boxRef = useRef<THREE.Mesh>(null);
  const [exrPath, setExrPath] = useState<string>("studio.exr");

  useEffect(() => {
    changeMasks(boxRef, String(masksPathOfExr.get(exrPath)));
  }, [boxRef.current, exrPath]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        setExrPath((prev: string) => {
          if (prev === "studio.exr") {
            return "brown.exr";
          }
          if (prev === "brown.exr") {
            return "bathroom.exr";
          }
          return "studio.exr";
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

    if (masks) {
      const [u, v]: [number, number] = sphereUV(pointer.direction);
      const width: number = masks.canvas.width;
      const height: number = masks.canvas.height;
      const x: number = Math.floor(u * width);
      const y: number = Math.floor((1 - v) * height);
      const pixel: Uint8ClampedArray = masks.getImageData(x, y, 1, 1).data;
      
      console.log(`uv: ${u}, ${v}; pixel position: ${x}, ${y}; selection mask: ${pixel}`);

      const r: number = pixel[0];
      const g: number = pixel[1];
      const b: number = pixel[2];
      const a: number = pixel[3];
      material.uniforms.selectionMask.value.set(r, g, b, a);
    }

    const pos = camera.position;
    boxRef.current.position.set(pos.x, pos.y, pos.z);
    const radius: number = 0.5 * (camera.near + camera.far)
    boxRef.current.scale.set(radius, radius, radius);
  });

  return (
    <mesh ref={boxRef} scale={[0.5 * (camera.near + camera.far), 0.5 * (camera.near + camera.far), 0.5 * (camera.near + camera.far)]}>
      <Environment files={exrPath} background />
      <boxGeometry />
      <skyboxMaterial side={THREE.BackSide} />
    </mesh>
  );
};

export default PanoScene;