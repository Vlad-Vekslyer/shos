import * as THREE from "three";

const isometricCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
isometricCamera.position.z = 5;
isometricCamera.position.y = 1.75;
isometricCamera.position.x = -1;
isometricCamera.rotateX(-0.35);
isometricCamera.rotateY(-0.3)

const topDownCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);

isometricCamera.position.z = 0;
topDownCamera.position.y = 5;
isometricCamera.position.x = 0;
topDownCamera.rotateX(-(Math.PI / 2));

export { isometricCamera, topDownCamera }