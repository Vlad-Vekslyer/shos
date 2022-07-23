import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function System(): JSX.Element {
	const systemRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
		camera.position.z = 3;
		camera.position.y = 0.75;
		camera.position.x = -1;
		camera.rotateX(-0.25);
		camera.rotateY(-0.3)

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
		renderer.render(scene, camera);

		containerElement.appendChild(renderer.domElement);

		return () => {
			containerElement.removeChild(renderer.domElement)
		}
	}, [])

	return (
		<div className="system" ref={systemRef} />
	)
}