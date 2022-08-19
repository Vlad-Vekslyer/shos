import { useRef, useState } from "react";
import * as THREE from "three";
import { useAsyncEffect } from "use-async-effect";
import getSphereName from "../3d-utils/getSphereName";

import mercuryTexture from '../assets/mercury.jpg';
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

	const initialPlanetData = system.getInitialPlanetData();

	if (initialPlanetData.length % 3 !== 0) throw new Error("Wasm memory buffer length must be divisible by 3")

	let planets: Planet[] = [];
	for (let i = 0; i < initialPlanetData.length; i += 3) {
		planets.push({
			x: initialPlanetData[i],
			y: initialPlanetData[i + 1],
			radius: initialPlanetData[i + 2]
		})
	}
	return planets;
}

async function addPlanetsToScene(planets: Planet[], scene: THREE.Scene): Promise<void> {
	const promises = planets.map((planet, i) => {
		return new Promise<void>(resolve => {
			new THREE.TextureLoader().load(mercuryTexture, texture => {
				const material = new THREE.MeshStandardMaterial({ map: texture });
				const sphere = new THREE.SphereGeometry(planet.radius);
				const mesh = new THREE.Mesh(sphere, material);

				mesh.position.x = planet.x;
				mesh.position.z = planet.y;
				mesh.name = getSphereName(i);
				mesh.receiveShadow = true;

				scene.add(mesh);
				resolve();
			});
		})
	});
	await Promise.all(promises);
}

function addAxesHelperToScene(scene: THREE.Scene): void {
	const axesHelper = new THREE.AxesHelper(1);
	scene.add(axesHelper);
}

function configureRenderer(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(scene, isometricCamera);
}

function attachRenderer(renderer: THREE.WebGLRenderer, container: HTMLDivElement | null): void {
	if (!container) throw new Error("Missing container")
	container.appendChild(renderer.domElement);
}

export default function System(): JSX.Element {
	const systemContainer = useRef<HTMLDivElement>(null)
	const scene = useRef(new THREE.Scene());
	const renderer = useRef(new THREE.WebGLRenderer({ antialias: true }));
	const system = useRef<WasmSystem>();
	const wasm = useRef<InitOutput>();
	const isInitialized = useRef(false);
	const [loading, setLoading] = useState(true);

	useAsyncEffect(async () => {
		if (isInitialized.current) return;
		isInitialized.current = true;

		wasm.current = await init();
		system.current = new WasmSystem();

		const ambientLight = new THREE.AmbientLight(0x404040, 1);
		scene.current.add(ambientLight);

		const pointLight = new THREE.PointLight(0xffffff, 2, 50);
		pointLight.position.set(0, 0, 0);
		scene.current.add(pointLight);

		pointLight.castShadow = true;

		// const lightHelper = new THREE.PointLightHelper(pointLight, 2);
		// scene.current.add(lightHelper);

		renderer.current.shadowMap.enabled = true;

		const planets = initializePlanets(wasm.current, system.current);
		await addPlanetsToScene(planets, scene.current);
		// addAxesHelperToScene(scene.current);
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