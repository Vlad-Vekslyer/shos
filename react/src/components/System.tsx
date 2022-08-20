import { useRef, useState } from "react";
import * as THREE from "three";
import { useAsyncEffect } from "use-async-effect";

import init, { InitOutput, System as WasmSystem } from "../pkg/rust";

import AnimationLoop from "./AnimationLoop";
import { configureRenderer, attachRenderer } from "../three-utils/renderer";
import { addPlanetsToScene, addLightsToScene, addHelpersToScene } from "../three-utils/scene";

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

		const planets = initializePlanets(wasm.current, system.current);

		await addPlanetsToScene(planets, scene.current);
		const [pointLight] = addLightsToScene(scene.current);
		addHelpersToScene(scene.current, pointLight);
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