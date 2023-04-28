import * as THREE from "https://cdn.skypack.dev/three@0.128.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/FBXLoader.js";

const container = document.createElement("div");

//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0);

//renderder
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//loader
const loader = new FBXLoader();
loader.load(
  "/drawing/fbx/apple.fbx",
  (object) => {
    scene.add(object);
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

//camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2, 18, 28);

//controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 12, 0);
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();

container.appendChild(renderer.domElement);
document.body.appendChild(container);
window.addEventListener("resize", onWindowResize);
