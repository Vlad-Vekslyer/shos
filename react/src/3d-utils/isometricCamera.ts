import * as THREE from "three";

const isometricCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
isometricCamera.position.z = 3;
isometricCamera.position.y = 0.75;
isometricCamera.position.x = -1;
isometricCamera.rotateX(-0.25);
isometricCamera.rotateY(-0.3)

export default isometricCamera;