import { useRef } from "react";
import { useEffect } from "react";
import * as THREE from "three";
import getSphereName from "../3d-utils/getSphereName";
import isometricCamera from "../3d-utils/isometricCamera";
import init, { System } from "../pkg/rust";

interface IAnimationLoop {
  scene: THREE.Scene,
  renderer: THREE.WebGL1Renderer,
  system: System
}

export default function AnimationLoop({ scene, renderer, system }: IAnimationLoop): JSX.Element {
  const animationRequestId = useRef<number>();

  function tick() {
    init().then(wasm => {
      const stream = system.tick();
      const planetCoordinates = new Float32Array(wasm.memory.buffer, stream.offset(), stream.size());

      for (let i = 0; i < planetCoordinates.length; i += 3) {
        const sphere = scene.getObjectByName(getSphereName(i / 3));
        console.log("Sphere", sphere);
        if (!sphere) throw new Error("Missing sphere in scene");

        sphere.position.x = planetCoordinates[i];
        sphere.position.z = planetCoordinates[i + 1];
      }
      renderer.render(scene, isometricCamera);

      animationRequestId.current = requestAnimationFrame(tick);
    })
  }

  useEffect(() => {
    tick();
    return () => {
      if (animationRequestId.current) {
        cancelAnimationFrame(animationRequestId.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <></>
}