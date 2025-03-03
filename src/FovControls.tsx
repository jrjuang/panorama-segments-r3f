import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
function FovControls() {
    const { camera, gl } = useThree();
    useEffect(() => {
        function handler(event: WheelEvent) {
            camera.fov = Math.max(15, Math.min(camera.fov * (1.0 + event.deltaY * 0.001), 120));
            camera.updateProjectionMatrix();
        }
        gl.domElement.addEventListener("wheel", handler);
        return () => {
            gl.domElement.removeEventListener("wheel", handler);
        };
    }, [camera, gl]);
    return null;
}

export default FovControls;