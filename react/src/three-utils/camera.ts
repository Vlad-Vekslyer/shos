import * as THREE from "three";

const isometricCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
isometricCamera.position.z = 5;
isometricCamera.position.y = 1.75;
isometricCamera.position.x = -1;
isometricCamera.rotateX(-0.35);
isometricCamera.rotateY(-0.3)

const topDownCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);

topDownCamera.position.y = 5;
topDownCamera.rotateX(-(Math.PI / 2));

type CameraType = 'isometric' | 'top-down';

export default function getCamera(type: CameraType = 'isometric') {
  return type === 'isometric' ? isometricCamera : topDownCamera
}