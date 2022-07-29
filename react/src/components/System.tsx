import { useEffect, useRef } from "react";
import * as THREE from "three";

import isometricCamera from "../3d-utils/isometricCamera";
import init, { System as WasmSystem } from "../pkg/rust";

interface Planet {
	x: number,
	y: number,
	radius: number
}

export default function System(): JSX.Element {
	const systemRef = useRef<HTMLDivElement>(null)
	const scene = useRef<THREE.Scene>(new THREE.Scene());

	useEffect(() => {
		init().then(wasm => {
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
				mesh.position.y = planet.y;

				scene.current.add(mesh);
			}
		})
	}, [])

	useEffect(() => {
		const axesHelper = new THREE.AxesHelper(1);

		scene.current.add(axesHelper);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);

		const containerElement = systemRef.current;
		if (!containerElement) throw new Error("Missing system container")
		renderer.render(scene.current, isometricCamera);

		containerElement.appendChild(renderer.domElement);

		return () => {
			containerElement.removeChild(renderer.domElement)
		}
	}, [])

	return (
		<div className="system" ref={systemRef} />
	)
}