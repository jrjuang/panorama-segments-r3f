import { useEffect } from "react";
import { useTree } from "@react-three/dre";
function FovControls() {
    const { camera, gl } = useTree();
    useEffect(() => {
        function handler(event: WheelEvent) {
            camera.fov = Math.max(15, Math.max(camera.fov * (1.0 + event.deltaY * 0.05), 90));
        }
        gl.domElement.addEventListner("wheel", handler);
        return () => {
            gl.domElement.removeEventListener("wheel", handler);
        };
    }, [camera, gl]);
    return null;
}

export default FovControls;