import { useRef, useState } from "react";
import * as THREE from "three";
import { useAsyncEffect } from "use-async-effect";

import isometricCamera from "../3d-utils/isometricCamera";
import init, { System as WasmSystem } from "../pkg/rust";

interface Planet {
	x: number,
	y: number,
	radius: number
}

export default function System(): JSX.Element {
	const systemRef = useRef<HTMLDivElement>(null)
	const scene = useRef(new THREE.Scene());
	const renderer = useRef(new THREE.WebGL1Renderer({ antialias: true }));
	const [planetCount, setPlanetCount] = useState(0);

	useAsyncEffect(async () => {
		if (!systemRef.current) throw new Error("Missing system container")
		systemRef.current.appendChild(renderer.current.domElement);

		const wasm = await init();
		const system = new WasmSystem();
		const stream = system.getPlanetCoordinates();
		const planetCoordinates = new Float32Array(wasm.memory.buffer, stream.offset(), stream.size());

		const material = new THREE.MeshNormalMaterial();

		for (let i = 0; i < planetCoordinates.length; i += 3) {
			const planet: Planet = {
				x: planetCoordinates[i],
				y: planetCoordinates[i + 1],
				radius: planetCoordinates[i + 2]
			}
			const sphere = new THREE.SphereGeometry(planet.radius);
			const mesh = new THREE.Mesh(sphere, material);
			mesh.position.x = planet.x;
			mesh.position.z = planet.y;
			mesh.name = `planet_${planetCount}`;
			setPlanetCount(planetCount + 1);
		}

		const axesHelper = new THREE.AxesHelper(1);
		scene.current.add(axesHelper);

		renderer.current.setSize(window.innerWidth, window.innerHeight);
		renderer.current.render(scene.current, isometricCamera);
	}, () => {
		if (!systemRef.current) throw new Error("Missing system container")
		systemRef.current.removeChild(renderer.current.domElement)
	}, []);

	return (
		<div className="system" ref={systemRef} />
	)
}