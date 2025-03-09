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
    selectionMask: new THREE.Vector4(),
    pointer: new THREE.Vector3()
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
    uniform vec3 pointer;

    void main() {
      vec3 worldDirection = normalize(linearWorldPos);
      vec2 uv_masks = sphereUV(worldDirection);
      vec4 mask = texture2D(masks, uv_masks);
      vec4 selection = texture2D(masks, sphereUV(pointer));
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

const PanoScene = () => {
  const masksPathOfExr: Map<string, string> = new Map();
  masksPathOfExr.set("studio.exr", "masks2_studio.png");
  masksPathOfExr.set("brown.exr", "masks2_brown.png");
  masksPathOfExr.set("bathroom.exr", "masks2_bathroom.png");

  const masksLookup: HTMLCanvasElement = document.createElement("canvas");
  const textureLoader = new THREE.TextureLoader();
  function changeMasks(boxRef: React.RefObject<THREE.Mesh>, masksPath: string) {
    textureLoader.load(masksPath, (masks: THREE.Texture) => {
      if (boxRef.current) {
        boxRef.current.material.uniforms.masks.value = masks;
      }
      const img_masks = masks.image;
      masksLookup.width = img_masks.width;
      masksLookup.height = img_masks.height;
      const context = masksLookup.getContext("2d");
      context?.drawImage(img_masks, 0, 0);
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
  const { camera, gl } = useThree();
  // Switch the scene by clicking on a mask
  useEffect(() => {
    const mouseUpToSwitchScene = (event: MouseEvent) => {
      const canvas = gl.domElement;
      const masksContent = masksLookup.getContext("2d");
      if (!masksContent) { return; }
      const pointerDirection: THREE.Vector3
        = new THREE.Vector3(
          event.clientX / canvas.width * 2 - 1,
          -event.clientY / canvas.height * 2 + 1,
          0).unproject(camera).sub(camera.position);
      pointerDirection.normalize();
      const [u, v]: [number, number] = sphereUV(pointerDirection);
      const x: number = Math.floor(u * masksLookup.width);
      const y: number = Math.floor((1 - v) * masksLookup.height);
      const pixel: Uint8ClampedArray = masksContent.getImageData(x, y, 1, 1).data;
      if (0 === pixel[3]) { return; }
      const mask: string = `${pixel[0]} ${pixel[1]} ${pixel[2]}`;
      const selection: string = "not implemented yet";
      console.log(`Mouse up at canvas ${event.clientX}, ${event.clientY};\n` +
        `UV: ${u}, ${v}; position at masks: ${x}, ${y};\n` +
        `mask: ${mask}; selection: ${selection}`);
      setExrPath((prev: string) => {
        console.log(`Not implemented yet to switch scene. Now the current scene is ${prev}`);
        return prev;
      });
    };
    gl.domElement.addEventListener("mouseup", mouseUpToSwitchScene);
    return () => {
      gl.domElement.removeEventListener("mouseup", mouseUpToSwitchScene);
    }
  }, []);
  // Load the masks
  useEffect(() => {
    changeMasks(boxRef, String(masksPathOfExr.get(exrPath)));
  }, [exrPath]);
  // Switch the scene by pressing F2
  useEffect(() => {
    const keyDownToSwitchScene = (event: KeyboardEvent) => {
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
    window.addEventListener("keydown", keyDownToSwitchScene);
    return () => window.removeEventListener("keydown", keyDownToSwitchScene);
  }, []);
  const [pointer, setPointer] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 1));
  // Hover FX for masks
  useEffect(() => {
    const mouseMoveToHoverFX = (event: MouseEvent) => {
      const canvas = gl.domElement;
      const directionInWorld = new THREE.Vector3(
        event.clientX / canvas.width * 2 - 1,
        -event.clientY / canvas.height * 2 + 1,
        0).unproject(camera).sub(camera.position);
      directionInWorld.normalize();
      setPointer((prev: THREE.Vector3) => {
        prev.set(directionInWorld.x, directionInWorld.y, directionInWorld.z);
        return prev;
      });
    };
    gl.domElement.addEventListener("mousemove", mouseMoveToHoverFX);
    return () => {
      gl.domElement.removeEventListener("mousemove", mouseMoveToHoverFX);
    }
  }, []);
  // Update the shader uniforms
  useFrame(({ clock }) => {
    if (!boxRef.current) { return; }
    const material = boxRef.current.material;
    material.uniforms.time.value = clock.getElapsedTime();

    // Hover FX for a specific mask
    material.uniforms.pointer.value.set(pointer.x, pointer.y, pointer.z);
    // Make the FX box follow the camera
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