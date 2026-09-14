import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function createAvatarViewer(container, caption, {autoRotate=true}={}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4eee6);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, -0.35, 5.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth || 1, container.clientHeight || 1, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.replaceChildren(renderer.domElement);
  renderer.domElement.className = "avatar-canvas";

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = 1.1;
  controls.minPolarAngle = Math.PI * 0.34;
  controls.maxPolarAngle = Math.PI * 0.62;
  controls.target.set(0, 0.2, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 2.2));

  const keyLight = new THREE.DirectionalLight(0xfff3e2, 2.5);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xcfe0ff, 1.2);
  fillLight.position.set(-4, 3, 4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xf6d6b1, 0.8);
  rimLight.position.set(0, 3, -5);
  scene.add(rimLight);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(2.7, 64),
    new THREE.MeshStandardMaterial({ color: 0xd7c7b8, roughness: 1, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.55;
  ground.receiveShadow = true;
  scene.add(ground);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.8, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.49;
  shadow.scale.set(1.1, 0.5, 1);
  scene.add(shadow);

  let frameId = 0;
  let disposed = false;

  const loader = new GLTFLoader();
  loader.load(
    "/assets/center-specimen.glb",
    (gltf) => {
      if (disposed) return;

      const loadedModel = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(loadedModel);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z) || 1;

      loadedModel.position.sub(center);
      loadedModel.scale.setScalar(4.4 / maxDimension);
      scene.add(loadedModel);

      const scaledBounds = new THREE.Box3().setFromObject(loadedModel);
      loadedModel.position.y += -1.45 - scaledBounds.min.y;
      if (caption) caption.textContent = "";
    },
    undefined,
    () => {
      if (caption) caption.textContent = "Model could not load.";
    },
  );

  function resizeRenderer() {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function animate() {
    if (disposed) return;
    controls.update();
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(animate);
  }

  const resizeObserver = new ResizeObserver(resizeRenderer);
  resizeObserver.observe(container);
  window.addEventListener("resize", resizeRenderer);
  resizeRenderer();
  if (caption) caption.textContent = "";
  animate();

  return {
    destroy() {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeRenderer);
      controls.dispose();
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (material && typeof material.dispose === "function") {
              material.dispose();
            }
          });
        }
      });
      renderer.dispose();
      container.replaceChildren();
    },
  };
}

function buildAvatarModel() {
  const group = new THREE.Group();
  group.position.y = -1.18;
  group.rotation.y = 0.2;

  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xe7bf97, roughness: 0.82, metalness: 0 });
  const sweaterMaterial = new THREE.MeshStandardMaterial({ color: 0xe9dfd2, roughness: 0.95, metalness: 0 });
  const jeansMaterial = new THREE.MeshStandardMaterial({ color: 0x5d6f8d, roughness: 0.96, metalness: 0 });
  const shoeMaterial = new THREE.MeshStandardMaterial({ color: 0xe2d5c8, roughness: 0.95, metalness: 0 });
  const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x523a2f, roughness: 0.88, metalness: 0 });
  const backpackMaterial = new THREE.MeshStandardMaterial({ color: 0x7a563d, roughness: 0.9, metalness: 0 });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x211b18, roughness: 0.7, metalness: 0 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.95, 1.55, 8, 18), sweaterMaterial);
  torso.position.y = 1.2;
  torso.scale.set(1, 1.05, 0.94);
  group.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.22, 16), skinMaterial);
  neck.position.y = 2.4;
  group.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.84, 32, 24), skinMaterial);
  head.position.y = 3.18;
  group.add(head);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.96, 32, 24), hairMaterial);
  hairCap.position.y = 3.46;
  hairCap.scale.set(1.04, 0.82, 1.0);
  group.add(hairCap);

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), eyeMaterial);
  leftEye.position.set(-0.28, 3.22, 0.78);
  leftEye.scale.set(0.72, 1.25, 0.45);
  group.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.x = 0.28;
  group.add(rightEye);

  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.014, 8, 24, Math.PI),
    eyeMaterial,
  );
  mouth.position.set(0, 3.0, 0.81);
  mouth.rotation.set(0, 0, Math.PI);
  mouth.scale.set(1, 0.58, 1);
  group.add(mouth);

  const strandPositions = [
    [-0.52, 3.68, 0.32, 0.55, 0.24, 0.26, -0.38],
    [-0.18, 3.92, 0.18, 0.52, 0.24, 0.24, -0.12],
    [0.18, 3.96, 0.2, 0.52, 0.24, 0.24, 0.08],
    [0.54, 3.68, 0.28, 0.58, 0.25, 0.24, 0.4],
    [-0.34, 3.72, -0.42, 0.62, 0.24, 0.24, -0.72],
    [0.42, 3.74, -0.45, 0.6, 0.24, 0.24, -0.7],
  ];

  strandPositions.forEach(([x, y, z, length, radiusTop, radiusBottom, tilt]) => {
    const strand = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.12, length, 4, 10),
      hairMaterial,
    );
    strand.position.set(x, y, z);
    strand.rotation.z = tilt;
    strand.rotation.y = x > 0 ? -0.42 : 0.42;
    strand.scale.set(1, 0.65, 1);
    group.add(strand);
  });

  const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 1.2, 6, 12), sweaterMaterial);
  leftArm.position.set(-1.12, 1.96, 0.05);
  leftArm.rotation.z = 0.28;
  leftArm.rotation.y = 0.1;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 1.2, 6, 12), sweaterMaterial);
  rightArm.position.set(1.12, 1.96, 0.05);
  rightArm.rotation.z = -0.28;
  rightArm.rotation.y = -0.1;
  group.add(rightArm);

  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMaterial);
  leftHand.position.set(-1.22, 1.24, 0.06);
  group.add(leftHand);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMaterial);
  rightHand.position.set(1.22, 1.24, 0.06);
  group.add(rightHand);

  const backpack = new THREE.Mesh(new THREE.CapsuleGeometry(0.56, 1.35, 8, 18), backpackMaterial);
  backpack.position.set(0, 1.34, -0.46);
  backpack.rotation.x = -0.08;
  backpack.scale.set(1.16, 1, 0.42);
  group.add(backpack);

  const leftStrap = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 1.28, 6, 12), backpackMaterial);
  leftStrap.position.set(-0.48, 1.78, 0.45);
  leftStrap.rotation.z = 0.1;
  group.add(leftStrap);

  const rightStrap = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 1.28, 6, 12), backpackMaterial);
  rightStrap.position.set(0.48, 1.78, 0.45);
  rightStrap.rotation.z = -0.1;
  group.add(rightStrap);

  const leftGrip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), skinMaterial);
  leftGrip.position.set(-0.54, 1.5, 0.64);
  leftGrip.scale.set(0.9, 1.15, 0.9);
  group.add(leftGrip);

  const rightGrip = leftGrip.clone();
  rightGrip.position.x = 0.54;
  group.add(rightGrip);

  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.34, 1.7, 18), jeansMaterial);
  leftLeg.position.set(-0.35, -0.04, 0.08);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.34, 1.7, 18), jeansMaterial);
  rightLeg.position.set(0.35, -0.04, 0.08);
  group.add(rightLeg);

  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 1.02), shoeMaterial);
  leftShoe.position.set(-0.35, -1.0, 0.28);
  leftShoe.rotation.y = 0.04;
  group.add(leftShoe);

  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 1.02), shoeMaterial);
  rightShoe.position.set(0.35, -1.0, 0.28);
  rightShoe.rotation.y = -0.04;
  group.add(rightShoe);

  return {
    group,
  };
}
