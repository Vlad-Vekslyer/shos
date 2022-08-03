import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useAsyncEffect } from "use-async-effect";
import getSphereName from "../3d-utils/getSphereName";

import isometricCamera from "../3d-utils/isometricCamera";
import init, { InitOutput, System as WasmSystem } from "../pkg/rust";
import AnimationLoop from "./AnimationLoop";

interface Planet {
	x: number,
	y: number,
	radius: number
}

export default function System(): JSX.Element {
	const systemContainer = useRef<HTMLDivElement>(null)
	const scene = useRef(new THREE.Scene());
	const renderer = useRef(new THREE.WebGL1Renderer({ antialias: true }));
	const system = useRef<WasmSystem>();
	const wasm = useRef<InitOutput>();
	const executedOnce = useRef(false);
	const [loading, setLoading] = useState(true);

	useAsyncEffect(async () => {
		if (executedOnce.current) return;
		executedOnce.current = true;

		if (!systemContainer.current) throw new Error("Missing system container")

		wasm.current = await init();
		system.current = new WasmSystem();
		const stream = system.current.getPlanetCoordinates();
		const planetCoordinates = new Float32Array(wasm.current.memory.buffer, stream.offset(), stream.size());

		if (planetCoordinates.length % 3 !== 0) throw new Error("Wasm memory buffer length must be divisible by 3")

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
			mesh.name = getSphereName(i / 3);
			scene.current.add(mesh);
		}

		const axesHelper = new THREE.AxesHelper(1);
		scene.current.add(axesHelper);

		renderer.current.setSize(window.innerWidth, window.innerHeight);
		renderer.current.render(scene.current, isometricCamera);

		systemContainer.current.appendChild(renderer.current.domElement);
		setLoading(false);
	}, []);

	function renderAnimationLoop() {
		if (!loading && system.current && wasm.current) {
			return <AnimationLoop scene={scene.current} wasm={wasm.current} renderer={renderer.current} system={system.current} />
		} else return <></>
	}

	return (
		<>
			<div className="system" ref={systemContainer} />
			{renderAnimationLoop()}
		</>
	)
}