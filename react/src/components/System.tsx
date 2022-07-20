import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function System(): JSX.Element {
	const systemRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
		camera.position.z = 1;

		const scene = new THREE.Scene();

		const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
		const material = new THREE.MeshNormalMaterial();

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);

		if (!systemRef.current) throw new Error("Missing system container")
		renderer.render(scene, camera);
		systemRef.current.appendChild(renderer.domElement);
	}, [])

	return (
		<div className="system" ref={systemRef} />
	)
}