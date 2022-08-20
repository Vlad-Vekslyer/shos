import THREE from "three";

import { Planet } from "../interfaces";
import getSphereName from "./getSphereName";
import mercuryTexture from '../assets/mercury.jpg';
import ceresTexture from '../assets/ceres.jpg';
import earthTexture from '../assets/earth.jpg';
import erisTexture from '../assets/eris.jpg';
import haumeaTexture from '../assets/haumea.jpg';
import makemakeTexture from '../assets/makemake.jpg';
import marsTexture from '../assets/mars.jpg';
import saturnTexture from '../assets/saturn.jpg';

export async function addPlanetsToScene(planets: Planet[], scene: THREE.Scene): Promise<void> {
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

export function addHelpersToScene(scene: THREE.Scene, light: THREE.PointLight): void {
  const axesHelper = new THREE.AxesHelper(1);
  const lightHelper = new THREE.PointLightHelper(light, 2);

  scene.add(lightHelper);
  scene.add(axesHelper);
}

export function addLightsToScene(scene: THREE.Scene): [THREE.PointLight, THREE.AmbientLight] {
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 2, 50);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  pointLight.castShadow = true;

  return [pointLight, ambientLight];
}