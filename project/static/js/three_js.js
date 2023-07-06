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

function zoomFit(object3D, camera, viewMode, bFront) {
  const box = new THREE.Box3().setFromObject(object3D);
  const sizeBox = box.getSize(new THREE.Vector3()).length();
  const centerBox = box.getCenter(new THREE.Vector3());

  let offsetX = 0,
    offsetY = 0,
    offsetZ = 0;
  viewMode === "X"
    ? (offsetX = 1)
    : viewMode === "Y"
    ? (offsetY = 1)
    : (offsetZ = 1);

  if (!bFront) {
    offsetX *= -1;
    offsetY *= -1;
    offsetZ *= -1;
  }
  camera.position.set(
    centerBox.x + offsetX,
    centerBox.y + offsetY,
    centerBox.z + offsetZ
  );

  const halfSizeModel = sizeBox * 0.5;
  const halfFov = THREE.Math.degToRad(camera.fov * 0.5);
  const distance = halfSizeModel / Math.tan(halfFov);
  const direction = new THREE.Vector3()
    .subVectors(camera.position, centerBox)
    .normalize();
  const position = direction.multiplyScalar(distance).add(centerBox);

  camera.position.copy(position);
  camera.near = sizeBox / 100;
  camera.far = sizeBox * 100;

  camera.updateProjectionMatrix();

  camera.lookAt(centerBox.x, centerBox.y, centerBox.z);
  controls.target.set(centerBox.x, centerBox.y, centerBox.z);
}

//loader
const loader = new FBXLoader();
loader.load(
  "/drawing/fbx/{{category}}.fbx", // 해당주소의 fbx 파일을 요청시 서버에서 제공
  (object) => {
    scene.add(object);
    zoomFit(object, camera, "Z", true);
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
