import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const COLORS = {
  night: 0x101b58,
  cobalt: 0x273b94,
  violet: 0x6650c7,
  cyan: 0x66e5e2,
  coral: 0xff6f61,
  yellow: 0xffc857,
  orange: 0xff8f5a,
  mint: 0x9cf2d0,
  cream: 0xfff3d3,
  ink: 0x17265d,
};

function createStandardMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.72,
    metalness: options.metalness ?? 0.04,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    depthWrite: options.depthWrite ?? true,
  });
}

function addBox(parent, size, position, material, rotation = null) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  if (rotation) {
    mesh.rotation.set(...rotation);
  }
  parent.add(mesh);
  return mesh;
}

function addCylinder(parent, radius, height, position, material, rotation = null, segments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
  mesh.position.set(...position);
  if (rotation) {
    mesh.rotation.set(...rotation);
  }
  parent.add(mesh);
  return mesh;
}

function addBeacon(parent, position, color, size = 0.1) {
  const material = createStandardMaterial(color, {
    emissive: color,
    emissiveIntensity: 1.8,
    roughness: 0.3,
    metalness: 0,
  });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 12), material);
  beacon.position.set(...position);
  parent.add(beacon);
  return beacon;
}

function buildCharacter() {
  const character = new THREE.Group();
  const skin = createStandardMaterial(0xffc7a3, { roughness: 0.84 });
  const jacket = createStandardMaterial(COLORS.coral, { roughness: 0.82 });
  const pants = createStandardMaterial(COLORS.cobalt, { roughness: 0.9 });
  const shoe = createStandardMaterial(COLORS.ink, { roughness: 0.88 });
  const hair = createStandardMaterial(0x2b2368, { roughness: 0.86 });
  const eye = createStandardMaterial(COLORS.ink, { roughness: 0.45 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 0.78, 6, 12), jacket);
  body.position.y = 1.2;
  character.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.43, 24, 18), skin);
  head.position.set(0, 2.12, 0.02);
  character.add(head);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.47, 24, 16), hair);
  hairCap.position.set(0, 2.31, -0.01);
  hairCap.scale.set(1.04, 0.62, 1.02);
  character.add(hairCap);

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), eye);
  leftEye.position.set(-0.14, 2.1, 0.4);
  character.add(leftEye);
  const rightEye = leftEye.clone();
  rightEye.position.x = 0.14;
  character.add(rightEye);

  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.72, 14), pants);
  leftLeg.position.set(-0.2, 0.42, 0);
  character.add(leftLeg);
  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.2;
  character.add(rightLeg);

  const leftShoe = addBox(character, [0.34, 0.14, 0.48], [-0.2, 0.04, 0.1], shoe, [0, 0.05, 0]);
  const rightShoe = leftShoe.clone();
  rightShoe.position.x = 0.2;
  rightShoe.rotation.y = -0.05;
  character.add(rightShoe);

  const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.62, 5, 10), jacket);
  leftArm.position.set(-0.59, 1.28, 0.02);
  leftArm.rotation.z = -0.18;
  character.add(leftArm);
  const rightArm = leftArm.clone();
  rightArm.position.x = 0.59;
  rightArm.rotation.z = 0.18;
  character.add(rightArm);

  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.7, 0.2), violetMaterial());
  backpack.position.set(0, 1.22, -0.38);
  backpack.rotation.x = -0.05;
  character.add(backpack);

  character.scale.setScalar(0.92);
  character.position.set(1.2, 0.16, 1.25);
  character.rotation.y = -0.34;
  return character;
}

function violetMaterial() {
  return createStandardMaterial(COLORS.violet, { roughness: 0.86 });
}

function buildDesk(interactables) {
  const desk = new THREE.Group();
  desk.position.set(-1.65, 0.18, 0.05);

  const deskTop = createStandardMaterial(COLORS.coral, { roughness: 0.78 });
  const deskLeg = createStandardMaterial(COLORS.ink, { roughness: 0.9 });
  addBox(desk, [2.65, 0.18, 1.25], [0, 1.24, 0], deskTop);
  addBox(desk, [0.16, 1.22, 0.16], [-1.02, 0.56, -0.38], deskLeg);
  addBox(desk, [0.16, 1.22, 0.16], [1.02, 0.56, -0.38], deskLeg);
  addBox(desk, [0.16, 1.22, 0.16], [-1.02, 0.56, 0.38], deskLeg);
  addBox(desk, [0.16, 1.22, 0.16], [1.02, 0.56, 0.38], deskLeg);

  const laptop = new THREE.Group();
  laptop.position.set(-0.32, 1.34, -0.05);
  const laptopBody = createStandardMaterial(COLORS.cream, { roughness: 0.54, metalness: 0.12 });
  addBox(laptop, [1.28, 0.1, 0.72], [0, 0, 0.18], laptopBody, [-0.08, 0, 0]);
  const laptopScreenFrame = addBox(laptop, [1.28, 0.84, 0.08], [0, 0.45, -0.14], laptopBody, [0, 0, 0]);
  const screenMaterial = createStandardMaterial(COLORS.cyan, {
    roughness: 0.28,
    emissive: 0x1c9fa9,
    emissiveIntensity: 0.5,
  });
  const laptopScreen = addBox(laptop, [1.04, 0.58, 0.025], [0, 0.45, -0.185], screenMaterial);
  addBox(laptop, [0.7, 0.035, 0.38], [0, 0.065, 0.18], createStandardMaterial(0xefe2bc, { roughness: 0.58 }));
  addBeacon(laptop, [0.49, 0.82, -0.2], COLORS.yellow, 0.055);
  laptop.userData.screen = laptopScreen;
  laptop.userData.interactionId = "laptop";
  interactables.push(laptop);
  desk.add(laptop);

  const phone = new THREE.Group();
  phone.position.set(0.78, 1.4, 0.27);
  const phoneBody = createStandardMaterial(COLORS.yellow, {
    roughness: 0.3,
    emissive: 0xf08d28,
    emissiveIntensity: 0.45,
  });
  addBox(phone, [0.32, 0.055, 0.62], [0, 0, 0], phoneBody, [0, 0.08, 0.08]);
  addBox(phone, [0.24, 0.012, 0.42], [0, 0.036, 0], createStandardMaterial(COLORS.coral, {
    roughness: 0.2,
    emissive: 0xf05f4c,
    emissiveIntensity: 0.65,
  }), [0, 0.08, 0.08]);
  addBeacon(phone, [0, 0.08, -0.35], COLORS.cream, 0.045);
  phone.userData.interactionId = "phone";
  interactables.push(phone);
  desk.add(phone);

  const mug = createStandardMaterial(COLORS.mint, { roughness: 0.64 });
  addCylinder(desk, 0.2, 0.32, [-0.9, 1.48, 0.34], mug, null, 20);
  addCylinder(desk, 0.12, 0.08, [-0.9, 1.66, 0.34], createStandardMaterial(COLORS.ink, { roughness: 0.5 }), null, 20);

  return { desk, laptop, phone };
}

function buildWallNote(interactables) {
  const note = new THREE.Group();
  note.position.set(-1.1, 2.9, -2.78);
  const paper = createStandardMaterial(COLORS.yellow, { roughness: 0.9 });
  const noteBoard = addBox(note, [1.38, 0.95, 0.07], [0, 0, 0], paper);
  noteBoard.rotation.z = -0.04;
  const ink = createStandardMaterial(COLORS.ink, { roughness: 0.68 });
  addBox(note, [0.86, 0.06, 0.025], [-0.1, 0.19, 0.052], ink);
  addBox(note, [0.62, 0.06, 0.025], [-0.2, -0.02, 0.052], ink);
  addBox(note, [0.4, 0.06, 0.025], [-0.3, -0.23, 0.052], ink);
  addBeacon(note, [0.52, 0.38, 0.1], COLORS.coral, 0.07);
  note.userData.interactionId = "note";
  interactables.push(note);
  return note;
}

function buildDoor(interactables) {
  const doorFrame = new THREE.Group();
  doorFrame.position.set(2.2, 0.25, -2.82);

  const frameMaterial = createStandardMaterial(COLORS.coral, { roughness: 0.7 });
  const doorMaterial = createStandardMaterial(COLORS.cobalt, {
    roughness: 0.54,
    emissive: 0x182a83,
    emissiveIntensity: 0.55,
  });
  addBox(doorFrame, [0.18, 3.3, 0.25], [-0.88, 1.65, 0], frameMaterial);
  addBox(doorFrame, [0.18, 3.3, 0.25], [0.88, 1.65, 0], frameMaterial);
  addBox(doorFrame, [1.94, 0.18, 0.25], [0, 3.21, 0], frameMaterial);

  const door = new THREE.Group();
  door.position.set(-0.78, 0.16, 0.03);
  addBox(door, [1.56, 3.02, 0.16], [0.78, 1.51, 0], doorMaterial);
  addBox(door, [0.76, 1.08, 0.04], [0.78, 2.1, 0.1], createStandardMaterial(COLORS.violet, {
    roughness: 0.42,
    emissive: 0x4736a1,
    emissiveIntensity: 0.65,
  }));
  addBox(door, [0.08, 0.08, 0.05], [1.28, 1.48, 0.12], createStandardMaterial(COLORS.yellow, {
    roughness: 0.25,
    emissive: 0xd68725,
    emissiveIntensity: 1.3,
  }));
  addBeacon(door, [0.78, 2.72, 0.14], COLORS.cyan, 0.075);
  door.userData.interactionId = "door";
  interactables.push(door);
  doorFrame.add(door);

  const doorwayLight = new THREE.PointLight(COLORS.yellow, 0.78, 5.5, 2);
  doorwayLight.position.set(0, 1.65, 0.52);
  doorFrame.add(doorwayLight);

  return { doorFrame, door, doorwayLight };
}

function buildParticleField() {
  const positions = [];
  for (let index = 0; index < 120; index += 1) {
    positions.push(
      (Math.random() - 0.5) * 9,
      Math.random() * 4.9 + 0.15,
      (Math.random() - 0.5) * 6.8,
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: COLORS.cyan,
    size: 0.045,
    transparent: true,
    opacity: 0.74,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}

function buildFogClouds() {
  const cloudGroup = new THREE.Group();
  const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0x9bbcff,
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
  });
  const cloudPositions = [
    [-2.9, 2.1, 0.7, 1.2, 0.5, 0.75],
    [-1.2, 2.75, -1.45, 0.85, 0.34, 0.55],
    [0.9, 1.65, -0.3, 1.35, 0.48, 0.7],
    [2.9, 2.45, 0.65, 0.95, 0.38, 0.6],
  ];

  const clouds = cloudPositions.map(([x, y, z, sx, sy, sz], index) => {
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), cloudMaterial.clone());
    cloud.position.set(x, y, z);
    cloud.scale.set(sx, sy, sz);
    cloud.userData.phase = index * 1.7;
    cloudGroup.add(cloud);
    return cloud;
  });

  return { cloudGroup, clouds };
}

export function createFogRoom(container, panel, options = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (error) {
    panel.innerHTML = `
      <div class="fog-panel-kicker">Explore unavailable</div>
      <div class="fog-panel-title">The Fog Room needs WebGL</div>
      <p class="fog-panel-lede">This browser could not start the 3D canvas. You can still return to the state notes.</p>
      <button class="fog-panel-button secondary" type="button" data-fog-action="close">Return to states</button>
    `;
    return {
      destroy() {
        container.replaceChildren();
        panel.replaceChildren();
      },
    };
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.night);
  scene.fog = new THREE.FogExp2(COLORS.night, 0.052);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(7.9, 5.6, 9.3);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "fog-room-canvas";
  renderer.domElement.setAttribute("aria-label", "Interactive 3D Fog Room");
  container.replaceChildren(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enableZoom = true;
  controls.minDistance = 6.5;
  controls.maxDistance = 13;
  controls.minPolarAngle = 0.58;
  controls.maxPolarAngle = 1.38;
  controls.target.set(0, 1.48, 0);
  controls.autoRotate = false;
  controls.minAzimuthAngle = -0.75;
  controls.maxAzimuthAngle = 0.75;
  controls.autoRotateSpeed = 0.42;

  scene.add(new THREE.HemisphereLight(0xaccfff, 0x17153f, 2.2));
  const keyLight = new THREE.DirectionalLight(0xfff1c7, 3.1);
  keyLight.position.set(-4, 8, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const cyanLight = new THREE.PointLight(COLORS.cyan, 1.6, 8, 2);
  cyanLight.position.set(-3.8, 3.1, 1.8);
  scene.add(cyanLight);
  const coralLight = new THREE.PointLight(COLORS.coral, 1.25, 7, 2);
  coralLight.position.set(3.3, 3.0, 1.5);
  scene.add(coralLight);

  const floor = new THREE.Group();
  const platformMaterial = createStandardMaterial(COLORS.violet, { roughness: 0.86 });
  const topMaterial = createStandardMaterial(COLORS.cobalt, { roughness: 0.88 });
  addCylinder(floor, 5.4, 0.34, [0, -0.25, 0], platformMaterial, null, 64);
  addCylinder(floor, 4.95, 0.16, [0, -0.03, 0], topMaterial, null, 64);
  addBox(floor, [8.7, 0.22, 6.9], [0, 0.05, 0], topMaterial);
  floor.traverse((object) => {
    if (object.isMesh) {
      object.receiveShadow = true;
    }
  });
  scene.add(floor);

  const room = new THREE.Group();
  const backWallMaterial = createStandardMaterial(0x263787, { roughness: 0.94 });
  const sideWallMaterial = createStandardMaterial(0x3348a0, { roughness: 0.94 });
  addBox(room, [8.4, 4.8, 0.22], [0, 2.35, -3.3], backWallMaterial);
  addBox(room, [0.22, 4.8, 6.55], [-4.15, 2.35, -0.05], sideWallMaterial, [0, 0, 0.02]);
  addBox(room, [0.22, 0.5, 6.55], [4.15, 0.25, -0.05], sideWallMaterial);
  addBox(room, [8.4, 0.16, 0.18], [0, 4.68, -3.16], createStandardMaterial(COLORS.cyan, {
    roughness: 0.35,
    emissive: 0x1c9fa9,
    emissiveIntensity: 0.5,
  }));
  scene.add(room);

  const interactables = [];
  const deskParts = buildDesk(interactables);
  scene.add(deskParts.desk);
  scene.add(buildWallNote(interactables));
  const doorParts = buildDoor(interactables);
  scene.add(doorParts.doorFrame);

  const character = buildCharacter();
  scene.add(character);

  const keys = new Set(options.keys || []);
  const stations = {};
  ['cycle', 'ground', 'step'].forEach((id, i) => {
    const station = new THREE.Group();
    station.position.set(-2.8 + i * 2.7, 0.3, 2.3);
    const color = [COLORS.yellow, COLORS.mint, COLORS.coral][i];
    const material = createStandardMaterial(keys.has(id) ? color : COLORS.violet, {emissive: color, emissiveIntensity: keys.has(id) ? 0.5 : 0.04});
    addCylinder(station, 0.42, 0.18, [0, 0, 0], material);
    if (id === 'cycle') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.07, 12, 32), material);
      ring.position.y = 0.6; station.add(ring);
    } else if (id === 'ground') {
      for (let j = 0; j < 3; j++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), material);
        leaf.position.set((j - 1) * 0.22, 0.4 + j * 0.15, 0); leaf.scale.y = 1.8; station.add(leaf);
      }
    } else {
      for (let j = 0; j < 3; j++) addBox(station, [0.3, 0.15 + j * 0.15, 0.45], [(j - 1) * 0.32, j * 0.075 + 0.15, 0], material);
    }
    station.userData.interactionId = id;
    stations[id] = station;
    interactables.push(station); scene.add(station);
  });

  const floatingGeometry = new THREE.BoxGeometry(0.32, 0.32, 0.32);
  const floatingColors = [COLORS.cyan, COLORS.yellow, COLORS.coral, COLORS.mint, COLORS.violet];
  const floatingBlocks = floatingColors.map((color, index) => {
    const block = new THREE.Mesh(floatingGeometry, createStandardMaterial(color, {
      roughness: 0.44,
      emissive: color,
      emissiveIntensity: 0.35,
    }));
    block.position.set(-3.05 + index * 1.42, 3.72 + (index % 2) * 0.38, -1.55 + (index % 3) * 0.42);
    block.rotation.set(index * 0.21, index * 0.4, index * 0.17);
    scene.add(block);
    return block;
  });

  const particleField = buildParticleField();
  scene.add(particleField);
  const { cloudGroup, clouds } = buildFogClouds();
  scene.add(cloudGroup);

  const indicatorBeacons = [];
  interactables.forEach((object) => {
    object.traverse((child) => {
      if (child.geometry && child.material?.emissiveIntensity > 0.9) {
        indicatorBeacons.push(child);
      }
    });
  });

  const progress = {
    thought: false,
    relief: false,
    laptop: false,
    tinyStep: false,
    door: false,
  };
  let message = "The task feels bigger in here. Look around and find what the fog is protecting you from.";
  let doorTargetRotation = 0;
  let fogTarget = 0.052;
  let characterBounce = 0;
  let hoveredObject = null;
  let pointerDown = null;
  let frameId = 0;
  let disposed = false;
  let resizeObserver;
  let activeStation = '';
  let practiceIndex = 0;
  let practiceDone = false;
  const held = new Set();
  let destination = null;
  let lastFrame = performance.now();
  const hud = document.createElement('div');
  hud.className = 'explore-world-badge';
  hud.textContent = 'WASD / arrows: walk · Click floor: walk · E: interact · Drag: look';
  container.append(hud);
  function onKeyDown(event) {
    if (event.target.closest('button, input, textarea, summary, a')) return;
    const key = event.key.toLowerCase();
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e'].includes(key)) {
      event.preventDefault(); held.add(key); destination = null;
      if (key === 'e' && !event.repeat) {
        let nearest = null, distance = 2;
        interactables.forEach(object => {
          const position = object.getWorldPosition(new THREE.Vector3());
          const d = Math.hypot(position.x-character.position.x,position.z-character.position.z);
          if (d < distance) { nearest = object; distance = d; }
        });
        if (nearest) handleInteraction(nearest.userData.interactionId);
      }
    }
  }
  function onKeyUp(event) { held.delete(event.key.toLowerCase()); }
  function clearMovement() { held.clear(); destination = null; }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', clearMovement);
  const practice = {
    cycle: {title: 'Loop lantern', prompts: ['Trigger: an assignment feels uncertain. Notice the urge to escape.', 'Short-term relief: closing the task feels easier. The lamp dims.', 'Later: the task remains. Try returning for one small action instead of judging yourself.'], done: 'You mapped the loop. A planned break includes a return time; avoidance keeps moving that time away.'},
    ground: {title: 'Grounding garden', prompts: ['Look around your actual surroundings. Notice three colors. Click when you have found them.', 'Feel two points of contact: your feet on the floor or your back against a chair.', 'Notice one sound. Let your breathing stay comfortable. You can stop or skip at any time.'], done: 'Check in: do you feel different, the same, or more tense? Any answer is valid. Grounding is optional support, not a test you must pass before acting.'},
    step: {title: 'Stepping stones', prompts: ['Practice task: starting an ordinary assignment. Step 1: open the document.', 'Step 2: write a rough title. It does not have to be a good one.', 'Step 3: write one imperfect sentence. Choose whether to continue or take a planned break.'], done: 'These are rehearsal steps. In daily life, choose a safe task and a manageable pace. Repetition matters more than finishing everything at once.'},
  };

  function findInteractionObject(object) {
    let current = object;
    while (current) {
      if (current.userData?.interactionId) return current;
      current = current.parent;
    }
    return null;
  }

  function getPointer(event) {
    const bounds = renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
  }

  function setObjectHover(object, active) {
    if (!object) return;
    object.scale.setScalar(active ? 1.045 : 1);
    object.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material || material.emissiveIntensity === undefined) return;
        if (material.userData.fogRoomBaseIntensity === undefined) {
          material.userData.fogRoomBaseIntensity = material.emissiveIntensity;
        }
        material.emissiveIntensity = active
          ? material.userData.fogRoomBaseIntensity + 0.42
          : material.userData.fogRoomBaseIntensity;
      });
    });
  }

  function raycast(event) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(getPointer(event), camera);
    const hits = raycaster.intersectObjects(interactables, true);
    return hits.length ? findInteractionObject(hits[0].object) : null;
  }

  function renderPanel() {
    const target = !progress.thought ? ['note','Find the yellow note','What are you telling yourself?'] : !progress.relief ? ['phone','Look at the phone','Notice the quick relief of distraction.'] : !progress.tinyStep ? ['laptop','Try one small action','Visit the desk. Starting can be enough.'] : ['door','Try the door','You can move with some uncertainty.'];
    panel.innerHTML = `
      <div class="fog-panel-kicker">YOUR NEXT STEP</div>
      <h2 class="fog-panel-title">${progress.door ? 'A beginning, not an ending' : target[1]}</h2>
      <p class="fog-panel-lede">${progress.door ? 'Practice again whenever you like. Real progress takes repetition.' : target[2]}</p>
      <button class="fog-panel-button primary" data-fog-action="inspect-${target[0]}">Explore this object →</button>
      <p class="fog-panel-message">${message}</p>
      ${progress.laptop && !progress.tinyStep ? '<button class="fog-panel-button primary" data-fog-action="tiny-step">Open the document · one tiny step</button>' : ''}
      <details class="room-unlocks"><summary>✧ Practice collection · ${keys.size}/3 unlocked</summary>${Object.entries(practice).map(([id,item]) => `<button data-fog-action="inspect-${id}">${keys.has(id) ? '✦' : '◇'} ${item.title}</button>`).join('')}<button data-fog-action="quiz">Learn in Quiz →</button></details>
      ${practice[activeStation] ? `<section class="practice-card"><h3>${practice[activeStation].title}</h3>${keys.has(activeStation) ? `<p>${practiceDone ? practice[activeStation].done : practice[activeStation].prompts[practiceIndex]}</p><button data-fog-action="${practiceDone ? 'restart-practice' : 'practice'}">${practiceDone ? 'Practice again' : 'Continue →'}</button><small>At your pace · Stop whenever you wish</small>` : '<p>Answer this topic in Quiz to unlock the exercise. Explanations and retries are always available.</p><button data-fog-action="quiz">Learn and unlock →</button>'}</section>` : ''}
      <details class="room-care"><summary>About avoidance & support</summary><p>Avoidance is a behavior pattern, not a diagnosis by itself. Rest and avoiding real danger can be healthy. This room is educational; the fog is a metaphor, not a measure of recovery.</p><p>For persistent distress or difficulties with daily life, a qualified professional can help with appropriate treatment. Practice with safe everyday tasks; you never have to force yourself through an exercise.</p><a href="https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/facing-your-fears/" target="_blank" rel="noopener noreferrer">NHS: gradual practice ↗</a></details>
      <button class="fog-panel-button secondary" data-fog-action="close">Return to states</button>`;
  }
  function handleInteraction(id) {
    if (practice[id]) { activeStation = id; practiceIndex = 0; practiceDone = false; renderPanel(); return; }
    if (id === "note") {
      progress.thought = true;
      message = "The first layer of fog is a promise: if you wait until you feel ready, the discomfort might never arrive.";
      renderPanel();
      return;
    }

    if (id === "phone") {
      progress.relief = true;
      message = "Avoidance works for a moment. The pressure drops, your body relaxes — and the task quietly grows in the dark.";
      fogTarget = Math.min(fogTarget + 0.008, 0.062);
      renderPanel();
      return;
    }

    if (id === "laptop") {
      progress.laptop = true;
      message = progress.tinyStep
        ? "You do not need to finish the whole task. Keep following the next visible action."
        : "The laptop is not asking for a perfect plan. What is the smallest visible action you could take?";
      renderPanel();
      return;
    }

    if (id === "door") {
      if (progress.door) return;
      if (!progress.tinyStep) {
        message = "The door is not locked. You are waiting for the fog to clear before taking the first step.";
        renderPanel();
        return;
      }

      progress.door = true;
      doorTargetRotation = -Math.PI * 0.62;
      fogTarget = 0.012;
      message = "You stepped out before feeling ready. That is the practice.";
      renderPanel();
      options.onComplete?.();
    }
  }

  function onPanelClick(event) {
    const button = event.target.closest("[data-fog-action]");
    if (!button) return;
    const action = button.dataset.fogAction;
    if (action.startsWith('inspect-')) { handleInteraction(action.slice(8)); return; }
    if (action === 'quiz') { options.onQuiz?.(); return; }
    if (action === 'restart-practice') { practiceIndex = 0; practiceDone = false; renderPanel(); return; }
    if (action === 'practice' && keys.has(activeStation) && !practiceDone) {
      if (practiceIndex < 2) practiceIndex++; else practiceDone = true;
      const station = stations[activeStation];
      station.rotation.y += Math.PI / 6;
      station.position.y = 0.3 + practiceIndex * 0.12;
      fogTarget = activeStation === 'cycle' && practiceIndex === 1 ? 0.062 : 0.035;
      renderPanel(); return;
    }
    if (action === "tiny-step") {
      progress.tinyStep = true;
      fogTarget = 0.018;
      characterBounce = 0.18;
      deskParts.laptop.userData.screen.material.emissiveIntensity = 1.15;
      deskParts.laptop.userData.screen.material.color.setHex(COLORS.mint);
      message = "One tiny step changes the room. The task is still here, but it is no longer a wall.";
      renderPanel();
      return;
    }
    if (action === "close") {
      options.onClose?.();
    }
  }

  function onPointerDown(event) {
    renderer.domElement.focus();
    pointerDown = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event) {
    if (!pointerDown) return;
    const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    pointerDown = null;
    if (distance > 8) return;
    const object = raycast(event);
    if (object) handleInteraction(object.userData.interactionId);
    else {
      const ray = new THREE.Raycaster();
      ray.setFromCamera(getPointer(event), camera);
      const hit = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0), -0.16), new THREE.Vector3());
      if (hit) destination = new THREE.Vector3(THREE.MathUtils.clamp(hit.x,-3.6,3.6),0.16,THREE.MathUtils.clamp(hit.z,-2.5,2.9));
    }
  }

  function onPointerMove(event) {
    const object = raycast(event);
    if (object === hoveredObject) return;
    if (hoveredObject) setObjectHover(hoveredObject, false);
    hoveredObject = object;
    if (hoveredObject) setObjectHover(hoveredObject, true);
    renderer.domElement.style.cursor = hoveredObject ? "pointer" : "grab";
  }

  function resizeRenderer() {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function animate() {
    if (disposed) return;
    const now = performance.now() * 0.001;
    const delta = Math.min((performance.now() - lastFrame) / 1000, 0.05);
    lastFrame = performance.now();
    let dx = Number(held.has('d') || held.has('arrowright')) - Number(held.has('a') || held.has('arrowleft'));
    let dz = Number(held.has('s') || held.has('arrowdown')) - Number(held.has('w') || held.has('arrowup'));
    if (destination) { dx = destination.x - character.position.x; dz = destination.z - character.position.z; if (Math.hypot(dx,dz) < 0.08) { destination = null; dx = dz = 0; } }
    const length = Math.hypot(dx,dz);
    if (length) {
      const x = THREE.MathUtils.clamp(character.position.x + dx / length * delta * 2.1,-3.6,3.6);
      const z = THREE.MathUtils.clamp(character.position.z + dz / length * delta * 2.1,-2.5,2.9);
      // Slide along the desk instead of walking through it.
      const blocked = (a,b) => a > -3.3 && a < 0.05 && b > -0.95 && b < 1.05;
      if (!blocked(x,character.position.z)) character.position.x = x;
      if (!blocked(character.position.x,z)) character.position.z = z;
      character.rotation.y = Math.atan2(dx,dz);
      character.children[5].rotation.x = Math.sin(now*10)*0.3;
      character.children[6].rotation.x = -Math.sin(now*10)*0.3;
    }
    controls.update();
    scene.fog.density += (fogTarget - scene.fog.density) * 0.035;
    doorParts.door.rotation.y += (doorTargetRotation - doorParts.door.rotation.y) * 0.08;
    doorParts.doorFrame.children.forEach((child) => {
      if (child.isPointLight) {
        child.intensity += ((progress.door ? 1.6 : 0.78) - child.intensity) * 0.08;
      }
    });
    character.position.y = 0.16 + Math.sin(now * 1.2) * 0.025 + characterBounce;
    characterBounce *= 0.92;
    particleField.rotation.y = now * 0.018;
    floatingBlocks.forEach((block, index) => {
      block.rotation.x += 0.002 + index * 0.0002;
      block.rotation.y -= 0.003 + index * 0.00015;
      block.position.y += Math.sin(now * 0.7 + index) * 0.0008;
    });
    clouds.forEach((cloud, index) => {
      cloud.position.x += Math.sin(now * 0.18 + cloud.userData.phase) * 0.0009;
      cloud.position.y += Math.cos(now * 0.16 + cloud.userData.phase) * 0.0007;
      cloud.material.opacity = 0.11 + Math.sin(now * 0.45 + index) * 0.018;
    });
    indicatorBeacons.forEach((beacon, index) => {
      const pulse = 1 + Math.sin(now * 2.1 + index * 0.7) * 0.12;
      beacon.scale.setScalar(pulse);
    });
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(animate);
  }

  panel.addEventListener("click", onPanelClick);
  renderer.domElement.tabIndex = 0;
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerleave", () => {
    if (hoveredObject) setObjectHover(hoveredObject, false);
    hoveredObject = null;
    renderer.domElement.style.cursor = "grab";
  });
  resizeObserver = new ResizeObserver(resizeRenderer);
  resizeObserver.observe(container);
  window.addEventListener("resize", resizeRenderer);
  resizeRenderer();
  renderer.domElement.style.cursor = "grab";
  renderPanel();
  animate();

  return {
    destroy() {
      disposed = true;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearMovement);
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resizeRenderer);
      panel.removeEventListener("click", onPanelClick);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      controls.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material?.dispose?.());
        }
      });
      renderer.dispose();
      container.replaceChildren();
      panel.replaceChildren();
    },
  };
}
