import isometricCamera from "./isometricCamera";

export function configureRenderer(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.render(scene, isometricCamera);
}

export function attachRenderer(renderer: THREE.WebGLRenderer, container: HTMLDivElement | null): void {
  if (!container) throw new Error("Missing container")
  container.appendChild(renderer.domElement);
}