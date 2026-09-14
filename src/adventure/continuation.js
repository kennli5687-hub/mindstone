import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export function fits(board,shape,x,y){return shape.every(([dx,dy])=>x+dx>=0&&x+dx<6&&y+dy>=0&&y+dy<4&&!board[(y+dy)*6+x+dx]);}
export const chapters=[
  ['The Moonstone Workshop','“We start with one piece at a time.”','Fit three fragments into their outlines. You do not have to repair everything today.','A small light','One small action made the next step possible.'],
  ['The Letters Attic','“Later” had become a room full of unopened letters.','Fit two small tasks into Today. Leave one for Later: making room is part of the task.','A reply ready to send','A realistic plan includes what you are not doing today.'],
  ['The Returning Street','Mira has a reply now. The postbox is just across the street.','Change lanes to pass three barriers. Walk slowly if you prefer.','A letter delivered','You can take a step while still feeling uncertain.'],
];
const key='mindstone-mira-continuation-v1';
let sessionDone=0;
// Reuse at most two decoding workers across exploration visits. Creating and
// terminating one decoder per room races outstanding loads on quick navigation.
const roomDecoder=new DRACOLoader().setDecoderPath('/assets/decoders/draco/').setWorkerLimit(2);
export function createContinuation(container,panel,options={}){
  let storage;
  try{storage=options.storage??localStorage;sessionDone=Math.max(0,Math.min(3,parseInt(storage.getItem(key))||0));}catch{}
  let chapter=Math.min(sessionDone,2),done=sessionDone,disposed=false,raf,last=0,active=false,feedback='',selected=0,pieces=[],board=[],placed=0,deferred=false,task=0,lane=1,distance=0,speed=.8,paused=true;
  let renderer,replaying=false;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{panel.innerHTML='<h2>3D is unavailable</h2><p>Please use a WebGL-capable browser. Your comic remains available in Scenario.</p>';return {destroy(){}};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor('#172754');
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate=false;
  container.replaceChildren(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Mira’s world. Drag to look around. Use the activity below to continue.');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,1,.1,100);camera.position.set(7,6,9);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1,0);controls.maxDistance=20;controls.minDistance=4;controls.maxPolarAngle=1.4;
  scene.add(new THREE.HemisphereLight('#c9ddff','#5e4266',1.45));
  const sun=new THREE.DirectionalLight('#ffe0ac',3);sun.position.set(-4,12,8);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);sun.shadow.radius=2.5;sun.shadow.intensity=.72;sun.shadow.bias=-.00015;sun.shadow.normalBias=.025;
  Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.5,far:40});scene.add(sun,sun.target);
  const rim=new THREE.DirectionalLight('#a5c9ff',.85);rim.position.set(3,5,-7);scene.add(rim);
  let visualRevision=0,renderSignature='',shadowRevision=-1,renderCount=0;
  let repairFragments=[];
  function prepareModel(root){root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;});visualRevision++;}
  const world=new THREE.Group();scene.add(world);let avatar=null,mixer=null,walk=null;
  const loader=new GLTFLoader().setDRACOLoader(roomDecoder);
  function release(root){root.traverse(o=>{o.shadow?.dispose();o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});}
  loader.load('/assets/story-models/ari-comic-candidate.glb',g=>{if(disposed){release(g.scene);return;}avatar=g.scene;prepareModel(avatar);avatar.position.set(0,0,2);scene.add(avatar);mixer=new THREE.AnimationMixer(avatar);if(g.animations[0]){walk=mixer.clipAction(g.animations[0]);walk.play();walk.paused=true;}},undefined,()=>{feedback='Character artwork could not load. Activities still work.';render();});
  let generation=0;
  function box(size,pos,color){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,roughness:.8}));o.position.set(...pos);o.castShadow=o.receiveShadow=true;world.add(o);return o;}
  function scenery(){
    generation++;visualRevision++;repairFragments=[];const token=generation;release(world);world.clear();
    if(chapter<2){loader.load('/assets/story-models/attic-delivery.glb',g=>{if(disposed||token!==generation){release(g.scene);return;}prepareModel(g.scene);world.add(g.scene);},undefined,()=>{feedback='Room artwork could not load; the activity is still available.';render();});}
    else{box([7,.3,22],[0,-.2,-5],'#4254a0');for(let i=0;i<9;i++)for(const s of [-1,1]){box([1.8,3+i%3,1.4],[s*4,1.3,-i*2],'#7367ba');box([.2,1,.1],[s*3.05,2,-i*2],'#ffdc87');}for(let i=0;i<3;i++)box([1.3,.6,.45],[(i%3-1)*1.7,.3,-2-i*3],'#f18b83');box([.8,1.3,.7],[0,.65,-12],'#e97d6b');}
    camera.position.set(7,6,9);controls.target.set(0,1,0);sun.position.set(-4,12,8);sun.target.position.set(0,0,0);if(avatar)avatar.position.set(0,0,2);
    if(chapter===0)loader.load('/assets/story-models/moonstone-repair.glb',g=>{
      if(disposed||token!==generation){release(g.scene);return;}
      g.scene.position.set(-.1,1.14,-1.6);prepareModel(g.scene);world.add(g.scene);
      g.scene.traverse(node=>{if(Number.isInteger(node.userData.repairFragment)){
        const index=node.userData.repairFragment,angle=(index+.5)*Math.PI*2/3;
        const home=node.position.clone(),offset=new THREE.Vector3(Math.cos(angle)*.48,.12,-Math.sin(angle)*.48);
        repairFragments.push({node,index,home,offset});
        if(!(done>0&&!replaying)&&!pieces[index])node.position.copy(home).add(offset);
      }});
    },undefined,()=>{if(disposed||token!==generation)return;feedback='Moonstone artwork could not load. The fragment activity still works.';render();});
  }
  const shapes=[[[0,0],[1,0],[0,1]],[[0,0],[1,0]],[[0,0],[0,1],[1,1]]];
  const taskNames=['Write one sentence','Address the envelope','Sort every letter'];
  function focusActivity(){if(chapter===0){camera.position.set(3.8,3.6,3.3);controls.target.set(-.1,1.6,-1.6);}}
  function reset(){active=false;feedback='';pieces=[false,false,false];selected=0;board=Array(24).fill(0);placed=0;deferred=false;task=0;lane=1;distance=0;paused=true;scenery();render();}
  function complete(){if(done<=chapter){done=chapter+1;sessionDone=done;try{storage?.setItem(key,String(done));}catch{}}feedback=['All three fragments are joined. The golden seams remain part of the stone.','Two tasks have a place. One is saved for another day.','Mira reached the postbox. The letter is sent.'][chapter];replaying=false;active=false;paused=true;if(walk)walk.paused=true;render();}
  function render(){
    const c=chapters[chapter],solved=done>chapter&&!replaying;
    panel.innerHTML=`<div class="mira-panel"><small>AFTER THE COMIC · ${chapter+1} / 3</small><h2>${c[0]}</h2><p>${c[1]}</p><nav class="mira-nav">${chapters.map((v,i)=>`<button data-chapter="${i}" ${i>done?'disabled':''} aria-label="${v[0]}">${i+1}${done>i?' ✓':''}</button>`).join('')}</nav>${solved?`<h3>✧ ${c[3]}</h3><p>${c[4]}</p><p>${chapter===2?'The letter is sent. Mira still has more to do — but she is no longer standing still.':'The next place is now open.'}</p>${chapter<2?'<button data-do="next">Continue →</button>':'<button data-do="close">Back to the story hub</button>'}<button data-do="replay">Practice again</button>`:!active?`<p>${c[2]}</p><button data-do="start">${chapter===0?'Pick up one fragment':chapter===1?'Make room for today':'Take the first step'}</button>`:game()}
    <p role="status">${feedback}</p><details><summary>Why this activity?</summary><p>${c[4]} This is a learning metaphor, not a treatment or a test of your mental health. Pausing is always allowed.</p></details></div>`;
  }
  function game(){
    if(chapter===0)return `<p>Select a fragment, then its matching outline.</p><div class="mira-fragments">${['△','◇','⬡'].map((s,i)=>`<button data-piece="${i}" aria-pressed="${selected===i}" ${pieces[i]?'disabled':''}>${s}</button>`).join('')}</div><div class="mira-fragments mira-sockets">${['△','◇','⬡'].map((s,i)=>`<button data-slot="${i}" aria-label="${s} outline">${pieces[i]?'✦':s}</button>`).join('')}</div><p>${pieces.filter(Boolean).length}/3 fragments joined. The rest can wait.</p>`;
    if(chapter===1)return `<p>${task<3?taskNames[task]:'Today has enough.'}</p>${task<3?`<p class="mira-shape">${task===0?'■ ■<br>■':task===1?'■ ■':'■<br>■ ■'}</p><p>Click a square to place this task. No timer.</p>`:''}<div class="mira-board">${board.map((v,i)=>`<button data-cell="${i}" aria-label="Today row ${Math.floor(i/6)+1}, column ${i%6+1}${v?', occupied':''}" ${v?'disabled':''} style="background:${v?'#e9af76':''}">${v?'✦':'·'}</button>`).join('')}</div>${task<3?'<button data-do="later">Leave this task for later</button>':''}<p>${placed}/2 tasks planned · ${deferred?'One task saved for later':'Leave one task for later'}</p><button data-do="reset-game">Clear plan</button>`;
    return `<p>← / → or buttons to change lanes. Reach the postbox; there is no time limit.</p><div class="mira-run" role="img" aria-label="Three lane path"><span class="mira-runner" style="left:${lane*33.333+16.66}%">M</span>${[0,1,2].map((l,i)=>`<span class="mira-barrier" style="left:${l*33.333+16.66}%;bottom:${15+(i*3+3-distance)*9}%">▰</span>`).join('')}</div><progress max="12" value="${distance}"></progress><div class="mira-nav"><button data-do="left">← Left</button><button data-do="pause">${paused?'Walk':'Pause'}</button><button data-do="right">Right →</button><button data-do="slow">${speed===.4?'Normal pace':'Slow pace'}</button></div><button data-do="detour">Try the comfortable detour</button>`;
  }
  function click(e){
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.chapter!==undefined){chapter=Number(b.dataset.chapter);replaying=false;reset();return;}
    const a=b.dataset.do;
    if(a==='close')options.onClose?.();
    if(a==='next'){chapter++;reset();}
    if(a==='start'){active=true;focusActivity();render();}
    if(a==='replay'){replaying=true;reset();active=true;focusActivity();render();}
    if(a==='reset-game'){board.fill(0);placed=0;task=0;deferred=false;feedback='';render();}
    if(a==='later'){if(!deferred){deferred=true;task++;feedback='Saved for another day. It is not lost.';}else feedback='One task is already set aside. Try placing this small task.';if(task===3&&placed===2)complete();else render();}
    if(b.dataset.piece!==undefined){selected=Number(b.dataset.piece);render();}
    if(b.dataset.slot!==undefined){const s=Number(b.dataset.slot);if(s===selected&&!pieces[s]){pieces[s]=true;feedback='One piece joined. Take your time.';selected=pieces.findIndex(v=>!v);}else feedback='Try the outline with the same shape. Nothing is lost.';if(pieces.every(Boolean))complete();else render();}
    if(b.dataset.cell!==undefined&&task<3){const p=Number(b.dataset.cell),x=p%6,y=Math.floor(p/6);if(placed===2){feedback='Today has enough. Save the last task for later.';}else if(fits(board,shapes[task],x,y)){for(const [dx,dy]of shapes[task])board[(y+dy)*6+x+dx]=task+1;task++;placed++;feedback='A small task has a place.';}else feedback='That space is too small. Try another square.';if(task===3&&deferred)complete();else render();}
    if(a==='left'||a==='right'){lane=Math.max(0,Math.min(2,lane+(a==='left'?-1:1)));render();}
    if(a==='pause'){paused=!paused;render();}
    if(a==='slow'){speed=speed===.4?.8:.4;render();}
    if(a==='detour'){distance=0;paused=true;feedback='The detour felt easier, but brought Mira back. The direct path is still here when you are ready.';render();}
  }
  function keydown(e){if(chapter!==2||!active||!['ArrowLeft','ArrowRight',' '].includes(e.key)||e.target.matches('button,select'))return;e.preventDefault();if(e.key===' ')paused=!paused;else lane=Math.max(0,Math.min(2,lane+(e.key==='ArrowLeft'?-1:1)));render();}
  panel.addEventListener('click',click);container.addEventListener('keydown',keydown);
  const observer=new ResizeObserver(()=>{const {width,height}=container.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();});observer.observe(container);
  let uiTime=0;
  function loop(t){if(disposed)return;const dt=Math.min((t-last)/1000||0,.05);last=t;
    if(chapter===2&&active&&!paused){const next=distance+dt*speed;const hit=[3,6,9].find((v,i)=>distance<v&&next>=v&&lane===i);if(hit){paused=true;distance=hit-.15;feedback='A barrier, not a failure. Change lanes and keep walking.';render();}else distance=next;if(distance>=12)complete();uiTime+=dt;if(uiTime>.15&&!paused){uiTime=0;const bar=panel.querySelector('progress');if(bar)bar.value=distance;panel.querySelectorAll('.mira-barrier').forEach((el,i)=>el.style.bottom=`${15+(i*3+3-distance)*9}%`);}}
    if(avatar&&chapter===2){avatar.position.set((lane-1)*1.7,0,2-distance);camera.position.set(5,5,avatar.position.z+8);controls.target.set(0,1,avatar.position.z-2);sun.position.z=avatar.position.z+8;sun.target.position.z=avatar.position.z;}
    const walking=chapter===2&&active&&!paused;if(walk)walk.paused=!walking;mixer?.update(dt);controls.update();
    let repairing=false;
    for(const fragment of repairFragments){
      const joined=(done>0&&!replaying)||pieces[fragment.index];
      const target=fragment.home.clone();if(!joined)target.add(fragment.offset);
      if(fragment.node.position.distanceToSquared(target)>1e-8){
        if(reducedMotion.matches)fragment.node.position.copy(target);
        else fragment.node.position.lerp(target,1-Math.exp(-9*dt));
        repairing=true;
        if(fragment.node.position.distanceToSquared(target)<1e-8)fragment.node.position.copy(target);
      }
    }
    if(repairing)visualRevision++;
    container.dataset.joinedFragments=String(repairFragments.filter(f=>(done>0&&!replaying)||pieces[f.index]).length);
    const signature=[visualRevision,renderer.domElement.width,renderer.domElement.height,...camera.position.toArray(),...camera.quaternion.toArray(),camera.zoom,...(avatar?.position.toArray()||[])].map(n=>n.toFixed(5)).join(':');
    if(walking||signature!==renderSignature){
      renderer.shadowMap.needsUpdate=walking||shadowRevision!==visualRevision||renderSignature!==signature&&chapter===2;
      renderer.render(scene,camera);shadowRevision=visualRevision;renderSignature=signature;
      container.dataset.renderCount=String(++renderCount);container.dataset.drawCalls=String(renderer.info.render.calls);
    }
    raf=requestAnimationFrame(loop);
  }
  reset();raf=requestAnimationFrame(loop);
  return {destroy(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();panel.removeEventListener('click',click);container.removeEventListener('keydown',keydown);controls.dispose();release(scene);renderer.dispose();container.replaceChildren();panel.replaceChildren();}};
}
