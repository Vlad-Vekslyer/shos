import { useRef } from "react";
import { useEffect } from "react";
import * as THREE from "three";
import getSphereName from "../3d-utils/getSphereName";
import isometricCamera from "../3d-utils/isometricCamera";
import { InitOutput, System } from "../pkg/rust";

interface IAnimationLoop {
  scene: THREE.Scene,
  renderer: THREE.WebGL1Renderer,
  system: System,
  wasm: InitOutput
}

export default function AnimationLoop({ scene, renderer, system, wasm }: IAnimationLoop): JSX.Element {
  const animationRequestId = useRef<number>();

  function tick() {
    const stream = system.tick();
    const planetCoordinates = new Float32Array(wasm.memory.buffer, stream.offset(), stream.size());
    console.log("planetCoordinates", planetCoordinates);

    for (let i = 0; i < planetCoordinates.length; i += 3) {
      const sphere = scene.getObjectByName(getSphereName(i / 3));
      if (!sphere) throw new Error("Missing sphere in scene");

      sphere.position.x = planetCoordinates[i];
      sphere.position.z = planetCoordinates[i + 1];
    }
    renderer.render(scene, isometricCamera);

    animationRequestId.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    tick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <></>
}