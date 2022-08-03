import { useRef, useState } from "react";
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

function initializePlanets(wasm: InitOutput | null, system: WasmSystem | null): Planet[] {
	if (!wasm || !system) throw new Error("Missing WebAssembly data");

	const stream = system.getPlanetCoordinates();
	const planetCoordinates = new Float32Array(wasm.memory.buffer, stream.offset(), stream.size());

	if (planetCoordinates.length % 3 !== 0) throw new Error("Wasm memory buffer length must be divisible by 3")

	let planets: Planet[] = [];
	for (let i = 0; i < planetCoordinates.length; i += 3) {
		planets.push({
			x: planetCoordinates[i],
			y: planetCoordinates[i + 1],
			radius: planetCoordinates[i + 2]
		})
	}
	return planets;
}

function addPlanetsToScene(planets: Planet[], scene: THREE.Scene): void {
	planets.forEach((planet, i) => {
		const material = new THREE.MeshNormalMaterial();
		const sphere = new THREE.SphereGeometry(planet.radius);
		const mesh = new THREE.Mesh(sphere, material);

		mesh.position.x = planet.x;
		mesh.position.z = planet.y;
		mesh.name = getSphereName(i);

		scene.add(mesh);
	})
}

function addAxesHelperToScene(scene: THREE.Scene): void {
	const axesHelper = new THREE.AxesHelper(1);
	scene.add(axesHelper);
}

function configureRenderer(renderer: THREE.WebGL1Renderer, scene: THREE.Scene): void {
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(scene, isometricCamera);
}

function attachRenderer(renderer: THREE.WebGL1Renderer, container: HTMLDivElement | null): void {
	if (!container) throw new Error("Missing container")
	container.appendChild(renderer.domElement);
}

export default function System(): JSX.Element {
	const systemContainer = useRef<HTMLDivElement>(null)
	const scene = useRef(new THREE.Scene());
	const renderer = useRef(new THREE.WebGL1Renderer({ antialias: true }));
	const system = useRef<WasmSystem>();
	const wasm = useRef<InitOutput>();
	const isInitialized = useRef(false);
	const [loading, setLoading] = useState(true);

	useAsyncEffect(async () => {
		if (isInitialized.current) return;
		isInitialized.current = true;

		wasm.current = await init();
		system.current = new WasmSystem();

		const planets = initializePlanets(wasm.current, system.current);
		addPlanetsToScene(planets, scene.current);
		addAxesHelperToScene(scene.current);
		configureRenderer(renderer.current, scene.current);
		attachRenderer(renderer.current, systemContainer.current);
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