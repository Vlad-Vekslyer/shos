import * as THREE from "three";

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
import sunTexture from '../assets/sun.jpg';

function loadTextures(): Promise<THREE.Texture[]> {
  const textureLoader = new THREE.TextureLoader();
  const promises = [
    mercuryTexture,
    ceresTexture,
    earthTexture,
    erisTexture,
    haumeaTexture,
    makemakeTexture,
    marsTexture,
    saturnTexture
  ].map(texture => {
    return new Promise<THREE.Texture>(resolve => {
      textureLoader.load(texture, loadedTexture => resolve(loadedTexture))
    })
  })

  return Promise.all(promises);
}

export function addSunToScene(scene: THREE.Scene): void {
  const texture = new THREE.TextureLoader().load(sunTexture);

  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.SphereGeometry(0.5);
  const mesh = new THREE.Mesh(sphere, material);
  mesh.layers.enable(1);

  const pointLight = new THREE.PointLight(0xffffff, 2, 50);
  pointLight.castShadow = true;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  ambientLight.layers.set(1);

  mesh.add(pointLight);

  scene.add(ambientLight);
  scene.add(mesh);
}

export async function addPlanetsToScene(planets: Planet[], scene: THREE.Scene): Promise<void> {
  const textures = await loadTextures();
  planets.forEach((planet, i) => {
    const randomTextureIndex = Math.floor(Math.random() * textures.length); // from 0 to textures.length - 1
    const texture = textures[randomTextureIndex];

    const material = new THREE.MeshStandardMaterial({ map: texture });
    const sphere = new THREE.SphereGeometry(planet.radius);
    const mesh = new THREE.Mesh(sphere, material);

    mesh.position.x = planet.x;
    mesh.position.z = planet.y;
    mesh.name = getSphereName(i);
    mesh.receiveShadow = true;

    scene.add(mesh);
  });
}

export function addHelpersToScene(scene: THREE.Scene): void {
  const axesHelper = new THREE.AxesHelper(1);

  scene.add(axesHelper);
}

export function addAmbientLightToScene(scene: THREE.Scene): THREE.AmbientLight {
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);

  return ambientLight;
}