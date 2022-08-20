import getCamera from "./camera";

export function configureRenderer(renderer: THREE.WebGLRenderer): void {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
}

export function render(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
  const camera = getCamera('top-down');

  renderer.autoClear = true;
  camera.layers.set(0);
  renderer.render(scene, camera);
  renderer.autoClear = false;

  camera.layers.set(1);
  renderer.render(scene, camera);
}

export function attachRenderer(renderer: THREE.WebGLRenderer, container: HTMLDivElement | null): void {
  if (!container) throw new Error("Missing container")
  container.appendChild(renderer.domElement);
}