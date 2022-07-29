import { useEffect, useRef } from "react";
import * as THREE from "three";

import isometricCamera from "../3d-utils/isometricCamera";
import init, { System as WasmSystem } from "../pkg/rust";

export default function System(): JSX.Element {
	const systemRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		init().then(wasm => {
			const system = new WasmSystem();
			const stream = system.getPlanetCoordinates();
			const array = new Float32Array(wasm.memory.buffer, stream.offset(), stream.size());
		})
	}, [])

	useEffect(() => {
		const scene = new THREE.Scene();

		const axesHelper = new THREE.AxesHelper(1);
		const geometry = new THREE.SphereGeometry(0.2);
		const material = new THREE.MeshNormalMaterial();

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(axesHelper);
		scene.add(mesh);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);

		const containerElement = systemRef.current;
		if (!containerElement) throw new Error("Missing system container")
		renderer.render(scene, isometricCamera);

		containerElement.appendChild(renderer.domElement);

		return () => {
			containerElement.removeChild(renderer.domElement)
		}
	}, [])

	return (
		<div className="system" ref={systemRef} />
	)
}