import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { rooms } from './rooms.js';
import { storyClues } from './story.js';
import { readProgress, saveProgress, canEnter, solveRoom, checkPuzzle } from './progress.js';
const puzzleDrafts = new Map(); // Preserve the arrangement while revisiting the comic.

// Ten distinct dioramas share movement and interaction, not their puzzles or scenery.
export function createAdventure(container, panel, options = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'}); }
  catch {
    panel.hidden = false;
    panel.innerHTML = '<h2>The city needs a 3D-capable browser</h2><p>You can still read the complete story from Scenario.</p>';
    return {destroy(){ panel.replaceChildren(); }};
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150);
  camera.position.set(10, 11, 14);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = 'fog-room-canvas';
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label','Walkable story world. WASD or arrow keys to move; E to interact.');
  container.replaceChildren(renderer.domElement);
  const hud = document.createElement('div'); hud.className = 'city-hud'; container.append(hud);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0.7,0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.5; controls.maxDistance = 25;
  controls.minPolarAngle = 0.4; controls.maxPolarAngle = 1.12;
  controls.minAzimuthAngle = -0.7; controls.maxAzimuthAngle = 0.9;
  scene.add(new THREE.HemisphereLight(0xffffff,0x5355ab,1.5));
  const sun = new THREE.DirectionalLight(0xffead0,2.1); sun.position.set(-3,10,7); scene.add(sun);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.5,far:35});
  sun.shadow.normalBias=.035;
  let progress = readProgress(), current = progress.room, roomGroup, gates = [], props = [], obstacles = [], floats = [];
  let mode = '', answer = [], feedback = '', frame = 0, disposed = false, last = performance.now(), elapsed = 0;
  let route = [], pendingInteraction = null, down = null, nearest = null, transitionAt = 0;
  const held = new Set();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const material = (color, glow=0) => new THREE.MeshStandardMaterial({color, roughness:0.72, emissive:color, emissiveIntensity:glow});
  function mesh(parent, geometry, color, pos, rotation=null, glow=0) {
    const object = new THREE.Mesh(geometry, material(color,glow)); object.position.set(...pos);
    object.castShadow=true; object.receiveShadow=true;
    if (rotation) object.rotation.set(...rotation);
    parent.add(object); return object;
  }
  const box = (parent,size,pos,color,rot=null,glow=0) => mesh(parent,new THREE.BoxGeometry(...size),color,pos,rot,glow);
  const ball = (parent,r,pos,color,glow=0) => mesh(parent,new THREE.SphereGeometry(r,20,14),color,pos,null,glow);
  const cylinder = (parent,r,h,pos,color) => mesh(parent,new THREE.CylinderGeometry(r,r,h,32),color,pos);
  const ring = (parent,r,pos,color,rot=null) => mesh(parent,new THREE.TorusGeometry(r,0.07,10,36),color,pos,rot,0.2);
  function disposeGroup(group) {
    if (!group) return;
    const textures=new Set();
    group.traverse(o => {o.geometry?.dispose(); if (o.material) for (const m of Array.isArray(o.material)?o.material:[o.material]) {for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}});
    textures.forEach(t=>t.dispose());
    scene.remove(group);
  }
  const character = new THREE.Group();
  mesh(character,new THREE.CapsuleGeometry(0.3,0.55,6,12),'#ff786b',[0,0.9,0]);
  ball(character,0.29,[0,1.56,0],'#ffd0aa');
  const hair = ball(character,0.31,[0,1.7,-0.02],'#29265d'); hair.scale.y=0.65;
  ball(character,0.022,[-0.1,1.57,0.26],'#24234f'); ball(character,0.022,[0.1,1.57,0.26],'#24234f');
  const legs = [-1,1].map(sign => mesh(character,new THREE.CapsuleGeometry(0.085,0.4,4,8),'#283d7c',[sign*0.14,0.3,0]));
  [-1,1].forEach(sign => {box(character,[0.2,0.12,0.32],[sign*0.14,0.04,0.05],'#fff0cd'); mesh(character,new THREE.CapsuleGeometry(0.075,0.43,4,8),'#ff786b',[sign*0.38,0.94,0]);});
  box(character,[0.32,0.38,0.17],[0.28,0.82,0.25],'#63d7c1');
  scene.add(character);
  const moth = new THREE.Group();
  ball(moth,0.07,[0,0,0],'#ffe0a0',0.5);
  [-1,1].forEach(sign => {const wing=ball(moth,0.14,[sign*0.14,0,0],'#8affde',0.4); wing.scale.set(1,0.6,0.2);});
  scene.add(moth);
  const modelLoader = new GLTFLoader();
  let modelLegs = [], modelArms = [], modelWings = [];
  let ariMixer = null, walkAction = null;
  let closeView = false;
  let selectedTile = null, puzzleMoves = 0;
  // Every load belongs to a particular world/room instance. Late responses must
  // not resurrect a disposed scene or attach a previous room's architecture.
  async function loadModel(name, parent, replace = false) {
    try {
      const {scene: model, animations} = await modelLoader.loadAsync(`${import.meta.env.BASE_URL}assets/story-models/${name}.glb`);
      if (disposed || (parent !== character && parent !== moth && parent !== roomGroup)) {
        disposeGroup(model); return;
      }
      if (replace) {
        for (const child of [...parent.children]) {parent.remove(child); disposeGroup(child);}
      }
      parent.add(model);
      model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
      if (name === 'ari' || name === 'ari-atelier' || name === 'ari-polished' || name === 'ari-hair-fixed' || name === 'ari-comic-candidate') {
        modelLegs = ['Leg_L','Leg_R'].map(n=>model.getObjectByName(n)).filter(Boolean);
        modelArms = ['Arm_L','Arm_R'].map(n=>model.getObjectByName(n)).filter(Boolean);
        renderer.domElement.dataset.character = name+'-blender';
        if(animations.length){ariMixer=new THREE.AnimationMixer(model);walkAction=ariMixer.clipAction(animations[0]);walkAction.play();modelLegs=[];modelArms=[];}
      }
      if (name === 'morrow') modelWings = ['Wing_L','Wing_R'].map(n=>model.getObjectByName(n)).filter(Boolean);
      if (parent === roomGroup) renderer.domElement.dataset.scenery = name + '-blender';
      if(name==='attic-atelier'||name==='attic-storybook'||name==='attic-storybook-v2'){
        for(const [node,id] of [['DeskPuzzle','puzzle'],['DetailLantern','detail-0'],['DetailAtlas','detail-1']]){
          const part=model.getObjectByName(node),target=props.find(p=>p.id===id)?.group;
          if(part&&target){for(const child of [...target.children]){target.remove(child);disposeGroup(child);}target.add(part);part.position.set(0,0,0);}
        }
      }
    } catch (error) {
      // The original lightweight shapes keep navigation usable offline.
      console.warn(`Story model ${name} unavailable; using lightweight scenery.`, error);
    }
  }
  loadModel('ari-comic-candidate', character, true);
  loadModel('morrow', moth, true);
  function prop(id, label, x, z, color, draw, radius=0.65) {
    const group = new THREE.Group(); group.position.set(x,0.12,z); group.userData.interaction=id;
    roomGroup.add(group); draw(group,color);
    const beacon = ball(group,0.08,[0,2.8,0],color,0.9); floats.push({object:beacon,y:2.8});
    props.push({id,label,group,x,z}); if(radius) obstacles.push({x,z,r:radius});
    return group;
  }
  function door(x,z,destination,locked=false) {
    const group = new THREE.Group(); group.position.set(x,0.12,z); roomGroup.add(group);
    const color = current===0?'#b88b41':locked ? '#b09de6' : '#ffd18b';
    box(group,[0.2,2.9,0.35],[-0.85,1.45,0],color); box(group,[0.2,2.9,0.35],[0.85,1.45,0],color); box(group,[1.9,0.2,0.35],[0,2.85,0],color);
    const leaf = box(group,[1.5,2.7,0.12],[0,1.35,0],current===0?'#172e51':'#735bab');
    if(current===0){
      for(const y of [-.66,.48]){
        box(leaf,[1.16,.94,.03],[0,y,.085],'#284873');
        for(const x of [-.60,.60])box(leaf,[.025,.99,.025],[x,y,.11],'#b88b41');
      }
      ball(leaf,.055,[.51,-.02,.15],'#b88b41');
    }
    const light = box(group,[1.4,2.6,0.025],[0,1.35,-0.09],'#fff0b7',null,0.9); light.visible=!locked;
    group.userData.interaction = destination > current ? 'exit' : 'back';
    props.push({id:group.userData.interaction,label:destination > current ? 'Next place' : 'Previous place',group,x,z});
    gates.push({leaf,light,destination,x,z});
    if(!locked) leaf.scale.x=0.02;
  }
  function drawMain(parent,color) {
    const theme=rooms[current].theme;
    if(theme==='attic') {
      box(parent,[2.2,0.22,1.2],[0,1.1,0],'#f49d87');
      [-0.85,0.85].forEach(x=>box(parent,[0.13,1,0.8],[x,0.55,0],'#695897'));
      box(parent,[0.8,0.1,0.58],[0,1.29,0], '#fff0d1'); cylinder(parent,0.2,0.33,[-0.63,1.39,0],'#66ddc8');
      [-0.5,0,0.5].forEach(x=>ring(parent,0.14,[x,0.8,0.64],color));
    } else if(theme==='station') {
      cylinder(parent,0.3,1.7,[0,0.85,0],'#6562aa'); const face=cylinder(parent,0.9,0.16,[0,2,0], '#ffe4ab'); face.rotation.x=Math.PI/2;
      box(parent,[0.06,0.65,0.06],[0,2.28,0.12],'#405ba1'); box(parent,[0.55,0.06,0.06],[0.24,2,0.12],'#405ba1');
      for(let i=0;i<12;i++) ball(parent,0.035,[Math.sin(i*Math.PI/6)*0.75,2+Math.cos(i*Math.PI/6)*0.75,0.13],'#986dab');
    } else if(theme==='workshop') {
      box(parent,[2.8,3.4,0.35],[0,1.7,0],'#e4887f'); box(parent,[0.65,0.9,0.08],[0,0.45,0.22],'#ffe3a0',null,0.2);
      box(parent,[0.4,0.08,0.08],[0.12,0.45,0.29],'#6a5da0');
    } else if(theme==='mirrors') {
      box(parent,[2.2,0.3,1.5],[0,0.2,0],'#b9a3ed');
      box(parent,[1.1,0.08,0.95],[0,0.4,0],'#fc9787',[0,0.18,0.03]);
      ring(parent,0.42,[0,1.45,0],color);
    } else if(theme==='observatory') {
      cylinder(parent,0.65,0.2,[0,0.15,0],color); box(parent,[0.15,1.1,0.15],[0,0.75,0],'#f4b78e');
      const scope=cylinder(parent,0.35,1.8,[0,1.65,0],'#77c8ee'); scope.rotation.z=0.8;
      ring(parent,0.36,[-0.65,2.25,0],color,[0,Math.PI/2,0]);
      [-1,1].forEach(sign=>ball(parent,0.24,[sign*0.9,1.3,0],sign<0?'#a8e2d4':'#b9a1e9'));
    } else if(theme==='garden') {
      cylinder(parent,1.15,0.25,[0,0.15,0],'#b3d9e2'); cylinder(parent,0.92,0.05,[0,0.3,0],'#65cecf');
      cylinder(parent,0.2,1,[0,0.65,0],'#b4ebcb'); ball(parent,0.17,[0,1.28,0],'#c0ffed',0.4);
    } else if(theme==='bridge') {
      for(let i=0;i<3;i++) box(parent,[0.75,0.18,0.85],[(i-1)*1.05,0.2+i*0.13,0],['#f6bb80','#b8dba9','#dbb2ee'][i]);
    } else if(theme==='archive') {
      box(parent,[1.8,2.5,0.7],[0,1.25,0],'#6d5b9e');
      for(let i=0;i<4;i++) {box(parent,[1.55,0.44,0.12],[0,0.4+i*0.55,0.42],i===2?'#ffb788':'#cdb0e5'); ball(parent,0.055,[0,0.4+i*0.55,0.53],color);}
    } else if(theme==='harbor') {
      [-0.85,0.85].forEach(x=>{box(parent,[0.15,1.7,0.15],[x,0.85,0],'#bcacd8');ring(parent,0.48,[x,1.5,0.15],color);box(parent,[0.8,0.07,0.07],[x,1.5,0.15],color);});
    } else {
      box(parent,[1.1,1.8,0.8],[0,0.9,0],'#ff8d7a'); ball(parent,0.58,[0,1.8,0],'#ff8d7a');
      box(parent,[0.7,0.12,0.04],[0,1.45,0.43],'#3b427e'); box(parent,[0.55,0.38,0.03],[0,0.9,0.43],'#ffe4ab');
    }
  }
  function buildScenery() {
    const room=rooms[current], [base,accent,gold]=room.palette;
    scene.background = new THREE.Color(base).multiplyScalar(0.5);
    scene.fog=new THREE.FogExp2(scene.background,0.012);
    if(room.theme==='attic'){
      scene.background=new THREE.Color('#829fcc');scene.fog=new THREE.Fog('#b2c9e4',17,48);
      const windowLight=new THREE.DirectionalLight('#ffdc9c',1.4);windowLight.position.set(-2,6,-5);roomGroup.add(windowLight);
      const deskLight=new THREE.PointLight('#ffbf68',8,5,2);deskLight.position.set(-.86,1.8,-1.82);roomGroup.add(deskLight);
      // The new kit supplies the complete attic, not decoration over the old set.
      const ground=box(roomGroup,[12,.15,10],[0,-.15,0],'#493328');ground.userData.floor=true;
      prop('puzzle',room.object,0,-1.6,gold,drawMain,1.3);
      room.details.forEach(([label],i)=>prop('detail-'+i,label,i?3.1:-3.2,i?1.3:-1.1,accent,(g,c)=>cylinder(g,.3,.3,[0,.15,0],c),.55));
      door(4.5,-3.4,1,!progress.solved.includes(room.id));
      return;
    }
    const ground=box(roomGroup,[12,0.45,10],[0,-0.18,0],base); ground.userData.floor=true;
    cylinder(roomGroup,6.7,0.65,[0,-0.7,0],accent);
    // Edge rails keep walking space legible without blocking the cutaway camera.
    box(roomGroup,[12,0.14,0.14],[0,0.05,-4.8],gold);
    box(roomGroup,[0.14,0.14,10],[-5.8,0.05,0],gold);
    const indoor=['attic','workshop','mirrors','archive'].includes(room.theme);
    if(indoor) {
      box(roomGroup,[12,3.8,0.22],[0,1.9,-4.9],'#244774');
      box(roomGroup,[0.22,2.6,7],[-5.9,1.3,-1.4],'#244774');
      for(let i=0;i<3;i++) box(roomGroup,[1.25,1.7,0.04],[-3.6+i*2,2.2,-4.76],'#a1d8ee',null,0.1);
    }
    if(room.theme==='attic') {
      for(let i=0;i<4;i++) box(roomGroup,[0.12,0.12,4],[-4+i*2.6,4.2,-3],gold,[0.4,0,0]);
      box(roomGroup,[2.3,0.09,1.5],[2.8,0.12,1], '#dd9bbe');
    }
    if(room.theme==='station') {
      [-3.7,-3.15].forEach(z=>box(roomGroup,[10,0.08,0.07],[0,0.1,z],gold));
      for(let i=0;i<16;i++) box(roomGroup,[0.1,0.05,0.85],[-5+i*0.65,0.08,-3.4],accent);
      box(roomGroup,[4,1.3,1.2],[-2,1,-4],accent); for(let i=0;i<4;i++) box(roomGroup,[0.6,0.55,0.04],[-3.3+i*0.9,1.2,-3.36],gold);
      box(roomGroup,[2,0.15,0.6],[3,0.5,1], '#f5ad8e');
    }
    if(room.theme==='workshop') for(let i=0;i<6;i++) {const g=ring(roomGroup,0.4+(i%2)*0.2,[-4+i*1.4,2.6,-4.65],gold); floats.push({object:g,y:2.6});}
    if(room.theme==='mirrors') for(let i=0;i<5;i++) {
      box(roomGroup,[1.1,2.7,0.2],[-4+i*1.7,1.5,-4.6],gold,[0,0,(i-2)*0.04]); box(roomGroup,[0.92,2.45,0.22],[-4+i*1.7,1.5,-4.46],'#b2c8ee');
    }
    if(room.theme==='observatory') {
      for(let i=0;i<5;i++) ring(roomGroup,1+i*0.55,[0,4,-3.8],accent,[0.4,i*0.2,0]);
      ball(roomGroup,0.65,[-3.7,4,-3],gold,0.5); ball(roomGroup,0.4,[3,3.4,-2.5],accent,0.4);
    }
    if(room.theme==='garden') for(let i=0;i<12;i++) {
      const x=-4.8+(i%4)*3.2,z=i<4?-4:i<8?3.6:0;
      cylinder(roomGroup,0.3,0.6,[x,0.4,z], '#edbc9f');const leaf=ball(roomGroup,0.5,[x,1.05,z],i%2?accent:'#edacca'); leaf.scale.set(0.8,1.6,0.8);
    }
    if(room.theme==='bridge') {
      for(let i=0;i<8;i++) box(roomGroup,[1.1,0.16,2],[0,0.1,-3.8+i*1.05],i%2?accent:gold);
      for(let i=0;i<6;i++) [-2.2,2.2].forEach(x=>box(roomGroup,[0.09,0.8,0.09],[x,0.4,-3.7+i*1.4],gold));
      [-2.2,2.2].forEach(x=>box(roomGroup,[0.07,0.07,8],[x,0.8,0],accent));
    }
    if(room.theme==='archive') for(let i=0;i<5;i++) {
      box(roomGroup,[1.2,3.3,0.6],[-4.5+i*1.7,1.65,-4.5],base);
      for(let j=0;j<5;j++) box(roomGroup,[0.85,0.13,0.65],[-4.5+i*1.7,0.5+j*0.55,-4.1],j%2?gold:accent);
    }
    if(room.theme==='harbor') {
      box(roomGroup,[11,0.04,3],[0,0.09,-3.5],'#57a5c5');
      for(let i=0;i<7;i++) box(roomGroup,[1.1,0.14,1.8],[-3.6+i*1.2,0.2,-3],gold);
      const boat=ball(roomGroup,0.9,[3,0.5,-4],accent); boat.scale.set(1.8,0.5,0.7);
      mesh(roomGroup,new THREE.ConeGeometry(0.55,1.4,5),gold,[-3,0.9,1]); ball(roomGroup,0.25,[-3,1.85,1],'#ffcaab');
    }
    if(room.theme==='post') {
      box(roomGroup,[7,3.5,0.6],[0,1.75,-4.2],accent);
      mesh(roomGroup,new THREE.ConeGeometry(4.5,1.3,4),gold,[0,4.1,-4.2],[0,Math.PI/4,0]);
      for(let i=0;i<4;i++) box(roomGroup,[0.8,1,0.04],[-2.5+i*1.65,2.3,-3.87], '#ffe7ad');
      for(let i=0;i<10;i++) ball(roomGroup,0.09,[-4.5+i,3.8,-1],i%2?gold:accent,0.5);
    }
    // Distant islands and geometric stars establish a continuous floating city.
    for(let i=0;i<14;i++) {
      const angle=i*2.4, radius=12+(i%3)*4;
      const island=mesh(roomGroup,new THREE.OctahedronGeometry(0.55+(i%3)*0.3),i%2?accent:gold,[Math.cos(angle)*radius,-1+(i%4)*1.6,Math.sin(angle)*radius]);
      floats.push({object:island,y:island.position.y});
    }
    prop('puzzle',room.object,0,-1.6,gold,drawMain,1.3);
    room.details.forEach(([label],i) => prop('detail-'+i,label,i?3.1:-3.2,i?1.3:-1.1,accent,(g,c)=>{cylinder(g,0.38,0.35,[0,0.2,0],c);ring(g,0.3,[0,1,0],gold);},0.55));
    if(current>0) door(-4.4,3,current-1,false);
    if(current<rooms.length-1) door(4.5,-3.4,current+1,!progress.solved.includes(room.id));
  }
  function updateHud() {
    const room=rooms[current];
    hud.innerHTML=`<div class="city-top"><div><span>PLACE ${String(current+1).padStart(2,'0')} / 10</span><h2>${room.name}</h2><p>${room.subtitle}</p></div><button data-world="map">Map · ${progress.solved.length}/10</button></div><div class="city-bottom"><div><span class="city-objective">${progress.solved.includes(room.id)? current===9?'Your letter has a tomorrow.':'The way is open. Find the golden doorway.':`Find ${room.object.toLowerCase()}.`}</span><small>WASD / arrows · Click to walk · E to interact</small></div><button data-world="inspect">Interact</button><button data-world="notebook">Notebook · ${progress.memories.length}</button></div><div class="city-touch" aria-label="Movement controls"><button data-walk="w" aria-label="Walk forward">↑</button><button data-walk="a" aria-label="Walk left">←</button><button data-walk="s" aria-label="Walk backward">↓</button><button data-walk="d" aria-label="Walk right">→</button></div>`;
  }
  function setPanel(next) {
    container.parentElement.dataset.puzzle=next==='puzzle'&&rooms[current].type==='jigsaw'?'jigsaw':'';
    if(!hud.querySelector('[data-world="camera"]'))hud.querySelector('.city-top')?.insertAdjacentHTML('beforeend',`<button data-world="camera">${closeView?'Room view':'Look closer'}</button>`);
    mode=next; held.clear(); route=[]; pendingInteraction=null;
    panel.hidden=!next;
    container.parentElement.dataset.panel=next?'open':'closed';
    renderPanel();
  }
  function puzzleContent(room) {
    if(room.type==='jigsaw')return `<div class="city-jigsaw" role="group" aria-label="Six-piece picture puzzle">${answer.map((piece,i)=>`<button class="city-tile" data-tile="${i}" aria-label="Piece in row ${Math.floor(i/3)+1}, column ${i%3+1}${selectedTile===i?', selected':''}" aria-pressed="${selectedTile===i}" style="background-position:${Number(piece)%3*50}% ${Math.floor(Number(piece)/3)*100}%"><span>${selectedTile===i?'Selected':''}</span></button>`).join('')}</div><p class="city-puzzle-instruction">${selectedTile===null?'Tap a piece to pick it up.':'Now tap another piece to swap them.'} · ${puzzleMoves} swaps</p><button data-world="reset-puzzle">Start puzzle over</button>`;
    if(room.type==='order') return `<p class="city-slots">${room.solution.map((_,i)=>`<span>${answer[i]?room.pieces.find(p=>p[0]===answer[i])[1]:`${i+1} · ?`}</span>`).join('')}</p><div class="city-choices">${room.pieces.map(([id,label])=>`<button data-piece="${id}" ${answer.includes(id)?'disabled':''}>${label}</button>`).join('')}</div><button data-world="undo" ${answer.length?'':'disabled'}>Undo last</button>`;
    if(room.type==='choice') return `<div class="city-choices">${room.pieces.map(([id,label])=>`<button aria-pressed="${answer[0]===id}" data-choice="${id}">${label}</button>`).join('')}</div>`;
    if(room.type==='pair') return room.groups.map((group,i)=>`<fieldset><legend>${group.name}</legend>${group.pieces.map(([id,label])=>`<button data-group="${i}" data-choice="${id}" aria-pressed="${answer[i]===id}">${label}</button>`).join('')}</fieldset>`).join('');
    return `<div class="city-sorting">${room.pieces.map(([id,label],i)=>`<label>${label}<select aria-label="Classify: ${label}" data-sort="${i}"><option value="">Choose…</option><option value="fact" ${answer[i]==='fact'?'selected':''}>Observation</option><option value="prediction" ${answer[i]==='prediction'?'selected':''}>Prediction</option></select></label>`).join('')}</div>`;
  }
  function renderPanel() {
    if(!mode) {panel.replaceChildren();return;}
    const room=rooms[current],clue=storyClues.find(c=>c.id===room.clue),solved=progress.solved.includes(room.id);
    let content='';
    if(mode==='map') content=`<span class="novel-eyebrow">A CITY TO RETURN TO</span><h2>Your journey</h2><div class="city-map">${rooms.map((r,i)=>`<button data-room="${i}" ${canEnter(i,progress)?'':'disabled'} ${i===current?'aria-current="location"':''}><b>${String(i+1).padStart(2,'0')}</b><span>${r.name}<small>${progress.solved.includes(r.id)?'✓ '+r.reward:canEnter(i,progress)?'Ready to explore':'Open the previous gate first'}</small></span></button>`).join('')}</div>`;
    else if(mode==='notebook') content=`<span class="novel-eyebrow">STORY MEMORIES & KEEPSAKES</span><h2>Ari's notebook</h2><p>Memories come from the comic. Keepsakes come from using them in the world.</p>${storyClues.map(c=>`<article class="city-memory"><h3>${progress.memories.includes(c.id)?'✦':'◇'} ${c.title}</h3><p>${progress.memories.includes(c.id)?c.memory:'A detail waits in the story.'}</p><button data-story-page="${c.page-1}">Revisit page ${c.page}</button></article>`).join('')}<h3>Your keepsakes · ${progress.solved.length}/10</h3><p>${rooms.filter(r=>progress.solved.includes(r.id)).map(r=>r.reward).join(' · ') || 'Your first keepsake waits in the attic.'}</p>`;
    else if(mode.startsWith('detail-')) {const detail=room.details[Number(mode.slice(7))]; content=`<span class="novel-eyebrow">A DETAIL IN THE WORLD</span><h2>${detail[0]}</h2><p>${detail[1]}</p><button data-world="puzzle">Find the room's obstacle →</button>`;}
    else if(mode==='exit') content=`<h2>${solved?'A path opens':'The gate is still sleeping'}</h2><p>${solved?'Your keepsake has released the gate.':'Use the story memory at this room’s obstacle to open the way.'}</p><button data-world="${solved?'next':'puzzle'}">${solved?'Enter the next place →':'Find the obstacle'}</button>`;
    else if(mode==='back') content='<h2>A familiar doorway</h2><p>You can revisit any place you have reached.</p><button data-world="back">Return to the previous place</button>';
    else content=`<span class="novel-eyebrow">${solved?'KEEPSAKE FOUND':'USE WHAT THE STORY TAUGHT YOU'}</span><h2>${room.object}</h2><p>${solved?room.success:room.description}</p>${solved?`<div class="city-reward">✦ ${room.reward}</div><button class="primary" data-world="${current===9?'ending':'next'}">${current===9?'Read the final pages':'Continue exploring'} →</button>`:`${puzzleContent(room)}<button class="primary" data-world="apply" ${room.solution.every((_,i)=>answer[i])?'':'disabled'}>Check my answer →</button>`}<p class="city-feedback" role="status">${feedback}</p>${!solved&&!progress.memories.includes(room.clue)?`<p class="city-story-hint">You can try now. To unlock the gate, also read page ${clue.page} and keep its memory.</p><button data-world="story">Read the clue · page ${clue.page} →</button>`:''}<details><summary>Recall the story</summary><p>${progress.memories.includes(room.clue)?clue.memory:'Read the scene to discover this memory.'}</p><button data-world="story">Revisit page ${clue.page}</button></details>`;
    panel.innerHTML=`<button class="city-panel-close" data-world="close" aria-label="Return to walking">×</button>${content}`;
  }
  function loadRoom(index) {
    progress=readProgress(); if(!canEnter(index,progress))return;
    current=index; progress.room=index; progress=saveProgress(progress);
    disposeGroup(roomGroup); roomGroup=new THREE.Group(); scene.add(roomGroup);
    props=[];obstacles=[];gates=[];floats=[];answer=rooms[index].type==='jigsaw'?['4','0','5','2','1','3']:[];selectedTile=null;puzzleMoves=0;feedback='';route=[];held.clear();nearest=null;
    if(rooms[index].type==='jigsaw'&&puzzleDrafts.has(index)){const draft=puzzleDrafts.get(index);answer=[...draft.answer];puzzleMoves=draft.moves;}
    buildScenery();loadModel(current===0?'attic-storybook-v2':rooms[current].theme, roomGroup);character.position.set(0,0.14,3.2); character.rotation.y=Math.PI;
    if(current===0)obstacles.push({x:4,z:2.8,r:.78},{x:0,z:-3,r:.42},{x:-1.7,z:-2.4,r:.35},{x:1.7,z:-2.6,r:.35},{x:-5.4,z:-1.8,r:.75},{x:-5.4,z:.5,r:.75});
    transitionAt=elapsed+1.5; setPanel('');updateHud();renderer.domElement.focus();
    closeView=false;controls.target.set(0,1.15,-.6);camera.position.set(7.7,7.4,11.2);
    if(!hud.querySelector('[data-world="camera"]'))hud.querySelector('.city-top').insertAdjacentHTML('beforeend','<button data-world="camera">Look closer</button>');
  }
  function blocked(x,z) { return Math.abs(x)>5.4 || Math.abs(z)>4.35 || obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+0.28); }
  function findRoute(x,z) {
    const cell=0.5, key=(a,b)=>`${a},${b}`;
    const sx=Math.round(character.position.x/cell),sz=Math.round(character.position.z/cell),tx=Math.round(x/cell),tz=Math.round(z/cell);
    const queue=[[sx,sz]], visited=new Map([[key(sx,sz),null]]);
    let found=null;
    for(let i=0;i<queue.length;i++) {
      const [a,b]=queue[i];
      if(a===tx && b===tz){found=[a,b];break;}
      for(const [da,db] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const na=a+da,nb=b+db,k=key(na,nb);
        if(!visited.has(k) && !blocked(na*cell,nb*cell)) {visited.set(k,[a,b]);queue.push([na,nb]);}
      }
    }
    if(!found)return [];
    const result=[];while(found){result.unshift(new THREE.Vector3(found[0]*cell,0.14,found[1]*cell));found=visited.get(key(...found));}
    result.shift();return result;
  }
  function approach(id) {
    const target=props.find(p=>p.id===id);if(!target)return;
    setPanel('');
    const candidates=[];
    for(let i=0;i<12;i++) {const a=i*Math.PI/6;const x=target.x+Math.sin(a)*1.8,z=target.z+Math.cos(a)*1.8;if(!blocked(x,z)) {const path=findRoute(x,z);if(path.length)candidates.push(path);}}
    candidates.sort((a,b)=>a.length-b.length);
    if(Math.hypot(character.position.x-target.x,character.position.z-target.z)<2.3) {setPanel(id);return;}
    route=candidates[0]||[];pendingInteraction=route.length?id:null;
  }
  function interact(id) { if(id==='puzzle'||id==='exit'||id==='back'||id.startsWith('detail-')) setPanel(id); }
  function handleClick(event) {
    const button=event.target.closest('button'); if(!button)return;
    if(button.dataset.tile!==undefined){
      const i=Number(button.dataset.tile);
      if(selectedTile===null)selectedTile=i;
      else{if(selectedTile!==i){[answer[selectedTile],answer[i]]=[answer[i],answer[selectedTile]];puzzleMoves++;}selectedTile=null;}
      puzzleDrafts.set(current,{answer:[...answer],moves:puzzleMoves});
      feedback='';renderPanel();return;
    }
    if(button.dataset.room!==undefined) {loadRoom(Number(button.dataset.room));return;}
    if(button.dataset.storyPage!==undefined) {options.onStory?.(Number(button.dataset.storyPage));return;}
    if(button.dataset.piece) {if(!answer.includes(button.dataset.piece))answer.push(button.dataset.piece); feedback='';renderPanel();return;}
    if(button.dataset.choice) {answer[Number(button.dataset.group||0)]=button.dataset.choice; feedback='';renderPanel();return;}
    const action=button.dataset.world;
    if(action==='reset-puzzle'){answer=['4','0','5','2','1','3'];selectedTile=null;puzzleMoves=0;feedback='';puzzleDrafts.delete(current);renderPanel();}
    if(action==='camera'){
      closeView=!closeView;
      if(closeView){controls.target.copy(character.position).add(new THREE.Vector3(0,1,0));camera.position.copy(controls.target).add(new THREE.Vector3(1.9,1.0,3.0));}
      else{controls.target.set(0,1.15,-.6);camera.position.set(7.7,7.4,11.2);}
      button.textContent=closeView?'Room view':'Look closer';
    }
    if(action==='close') {setPanel('');renderer.domElement.focus();}
    if(action==='map'||action==='notebook')setPanel(action);
    if(action==='inspect') {if(nearest)interact(nearest.id);else approach('puzzle');}
    if(action==='puzzle')approach('puzzle');
    if(action==='story')options.onStory?.(storyClues.find(c=>c.id===rooms[current].clue).page-1);
    if(action==='ending')options.onStory?.(13);
    if(action==='undo'){answer.pop();feedback='';renderPanel();}
    if(action==='next' && progress.solved.includes(rooms[current].id))loadRoom(current+1);
    if(action==='back')loadRoom(current-1);
    if(action==='apply') {
      if(!checkPuzzle(rooms[current],answer)) {feedback=rooms[current].wrong;renderPanel();return;}
      const result=solveRoom(current,answer);
      if(result.ok) {progress=result.progress;feedback='';updateHud();}
      else {feedback=result.reason==='answer'?rooms[current].wrong:'That is right! Now read the linked scene and keep its memory, then apply your answer to open the gate.';}
      renderPanel();
    }
  }
  function onChange(event) {if(event.target.dataset.sort!==undefined)answer[Number(event.target.dataset.sort)]=event.target.value; const apply=panel.querySelector('[data-world="apply"]');if(apply)apply.disabled=!rooms[current].solution.every((_,i)=>answer[i]);}
  function pointerPosition(event) {const rect=renderer.domElement.getBoundingClientRect();return new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);}
  function onDown(event) {renderer.domElement.focus();down=[event.clientX,event.clientY];}
  function onUp(event) {
    if(!down)return;const distance=Math.hypot(event.clientX-down[0],event.clientY-down[1]);down=null;if(distance>7)return;
    const ray=new THREE.Raycaster();ray.setFromCamera(pointerPosition(event),camera);
    const hits=ray.intersectObjects(props.map(p=>p.group),true);
    if(hits.length){let object=hits[0].object;while(object && !object.userData.interaction)object=object.parent;if(object)approach(object.userData.interaction);return;}
    const hit=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-0.14),new THREE.Vector3());
    if(hit && !blocked(hit.x,hit.z)){setPanel('');route=findRoute(hit.x,hit.z);}
  }
  function keyDown(event) {
    if(event.target.closest('button, input, textarea, select, summary, a'))return;
    const key=event.key.toLowerCase();
    if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){event.preventDefault();held.add(key);route=[];pendingInteraction=null;}
    if(key==='e' && !event.repeat && nearest){event.preventDefault();interact(nearest.id);}
    if(key==='escape'){setPanel('');renderer.domElement.focus();}
  }
  const keyUp=event=>held.delete(event.key.toLowerCase());
  const clear=()=>{held.clear();down=null;};
  function touchDown(event){const button=event.target.closest('[data-walk]');if(button){event.preventDefault();route=[];held.add(button.dataset.walk);button.setPointerCapture(event.pointerId);}}
  function touchUp(){held.clear();}
  function resize(){const w=container.clientWidth||1,h=container.clientHeight||1;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(container);
  function animate(now) {
    if(disposed)return;
    const dt=Math.min((now-last)/1000,0.05);last=now;elapsed+=dt;
    let x=Number(held.has('d')||held.has('arrowright'))-Number(held.has('a')||held.has('arrowleft'));
    let z=Number(held.has('s')||held.has('arrowdown'))-Number(held.has('w')||held.has('arrowup'));
    if(route.length){x=route[0].x-character.position.x;z=route[0].z-character.position.z;if(Math.hypot(x,z)<0.09){route.shift();x=z=0;if(!route.length && pendingInteraction){const id=pendingInteraction;pendingInteraction=null;interact(id);}}}
    const distance=Math.hypot(x,z);
    if(distance){const step=Math.min(2.6*dt,route.length?distance:Infinity),nx=character.position.x+x/distance*step,nz=character.position.z+z/distance*step;if(!blocked(nx,character.position.z))character.position.x=nx;if(!blocked(character.position.x,nz))character.position.z=nz;character.rotation.y=Math.atan2(x,z);}
    legs.forEach((leg,i)=>leg.rotation.x=!reducedMotion && distance?Math.sin(elapsed*12)*(i?-.35:.35):0);
    modelLegs.forEach((leg,i)=>leg.rotation.x=!reducedMotion && distance?Math.sin(elapsed*10)*(i?-.42:.42):0);
    modelArms.forEach((arm,i)=>arm.rotation.x=!reducedMotion && distance?Math.sin(elapsed*10)*(i?.3:-.3):0);
    modelWings.forEach((wing,i)=>wing.rotation.y=reducedMotion?0:Math.sin(elapsed*17)*(i?-.45:.45));
    if(ariMixer&&walkAction){walkAction.setEffectiveWeight(!reducedMotion&&distance?1:0);ariMixer.update(dt);}
    character.position.y=0.14+(!reducedMotion && distance?Math.abs(Math.sin(elapsed*12))*0.025:0);
    moth.position.set(character.position.x+0.7,character.position.y+2.0+(reducedMotion?0:Math.sin(elapsed*2)*0.15),character.position.z-0.2);
    nearest=null;let min=2.4;for(const p of props){const d=Math.hypot(p.x-character.position.x,p.z-character.position.z);if(d<min){nearest=p;min=d;}}
    const inspect=hud.querySelector('[data-world="inspect"]');if(inspect)inspect.textContent=nearest?`E · ${nearest.label}`:'Go to obstacle';
    renderer.domElement.dataset.position=`${character.position.x.toFixed(2)},${character.position.z.toFixed(2)}`;
    gates.forEach(gate=>{
      const open=gate.destination<current||progress.solved.includes(rooms[current].id);
      gate.leaf.scale.x=THREE.MathUtils.lerp(gate.leaf.scale.x,open?0.02:1,reducedMotion?1:0.1);gate.light.visible=open;
    });
    if(!mode && elapsed>transitionAt){const gate=gates.find(g=>canEnter(g.destination,progress)&&Math.hypot(g.x-character.position.x,g.z-character.position.z)<0.65);if(gate)loadRoom(gate.destination);}
    if(!reducedMotion)floats.forEach(({object,y},i)=>{object.position.y=y+Math.sin(elapsed*0.65+i)*0.12;});
    controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(animate);
  }
  hud.addEventListener('click',handleClick);panel.addEventListener('click',handleClick);panel.addEventListener('change',onChange);
  hud.addEventListener('pointerdown',touchDown);hud.addEventListener('pointerup',touchUp);hud.addEventListener('pointercancel',touchUp);
  renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointerup',onUp);
  renderer.domElement.addEventListener('pointercancel',clear);
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',clear);
  loadRoom(current);resize();frame=requestAnimationFrame(animate);
  return {destroy(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',clear);hud.removeEventListener('click',handleClick);hud.removeEventListener('pointerdown',touchDown);hud.removeEventListener('pointerup',touchUp);hud.removeEventListener('pointercancel',touchUp);panel.removeEventListener('click',handleClick);panel.removeEventListener('change',onChange);renderer.domElement.removeEventListener('pointerdown',onDown);renderer.domElement.removeEventListener('pointerup',onUp);renderer.domElement.removeEventListener('pointercancel',clear);disposeGroup(roomGroup);disposeGroup(character);disposeGroup(moth);renderer.dispose();container.replaceChildren();panel.replaceChildren();}};
}
