import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {createBucketGameScene,createBuildingWorkspaceScene} from './bucketGameScene.js';
import {createMoonstoneReader,procrastinationComicPages,perfectionismComicPages} from './moonstoneReader.js';

export function fits(board,shape,x,y){return shape.every(([dx,dy])=>x+dx>=0&&x+dx<6&&y+dy>=0&&y+dy<4&&!board[(y+dy)*6+x+dx]);}
export const chapters=[
  ['Get a pen and paper','Before she can write, Mira needs a pen and one piece of paper.','One small action is enough to begin.','Pen and paper ready','Getting ready is the first small step.'],
  ['Write the letter','Mira sits down and writes what happened.','Type the sentence “I lost the book” below.','Letter written','Naming what happened makes the next step possible.'],
  ['Send the letter','The letter is ready. Mira can send it when she chooses.','One click sends the letter.','Letter sent','Mira took one honest step, even though it felt difficult.'],
];
const key='mindstone-mira-letter-steps-v1';
let sessionDone=0;
// Reuse at most two decoding workers across exploration visits. Creating and
// terminating one decoder per room races outstanding loads on quick navigation.
const roomDecoder=new DRACOLoader().setDecoderPath('/assets/decoders/draco/').setWorkerLimit(2);
export function createContinuation(container,panel,options={}){
  let storage;
  try{storage=options.storage??localStorage;storage.setItem(key,'0');}catch{}
  sessionDone=0;
  let chapter=Math.min(sessionDone,2),done=sessionDone,disposed=false,raf,last=0,active=false,feedback='',letterText='',nextGamePlaceholder=false,buildingGameActive=false,selected=0,pieces=[],board=[],placed=0,deferred=false,task=0,lane=1,distance=0,speed=.8,paused=true,builderSelected=0,builderComplete=false,builderSubmitted=false,buildCount=0,rainCollected=0;
  let renderer,replaying=false;
  let interludeReader=null,interludeOverlay=null;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{panel.innerHTML='<h2>3D is unavailable</h2><p>Please use a WebGL-capable browser. Your comic remains available in Scenario.</p>';return {destroy(){}};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor('#172754');
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate=false;
  container.replaceChildren(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Mira’s world. Drag to look around. Use the activity below to continue.');
  const rainEncouragement=document.createElement('div');rainEncouragement.className='mira-rain-encouragement';rainEncouragement.hidden=true;rainEncouragement.setAttribute('aria-live','polite');rainEncouragement.innerHTML='<strong>Raindrops collected <span data-rain-score>0</span></strong><span data-rain-message>Every drop counts. Move Mira to catch one.</span>';container.append(rainEncouragement);
  const scene=new THREE.Scene(),perspectiveCamera=new THREE.PerspectiveCamera(45,1,.1,100);perspectiveCamera.position.set(7,6,9);const bucketCamera=new THREE.OrthographicCamera(-4.5,4.5,3,-3,.1,100);bucketCamera.position.set(0,1.35,12);bucketCamera.lookAt(0,1.35,0);let camera=perspectiveCamera;
  const controls=new OrbitControls(perspectiveCamera,renderer.domElement);controls.target.set(0,1,0);controls.maxDistance=20;controls.minDistance=4;controls.maxPolarAngle=1.4;
  scene.add(new THREE.HemisphereLight('#c9ddff','#5e4266',1.45));
  const sun=new THREE.DirectionalLight('#ffe0ac',3);sun.position.set(-4,12,8);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);sun.shadow.radius=2.5;sun.shadow.intensity=.72;sun.shadow.bias=-.00015;sun.shadow.normalBias=.025;
  Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.5,far:40});scene.add(sun,sun.target);
  const rim=new THREE.DirectionalLight('#a5c9ff',.85);rim.position.set(3,5,-7);scene.add(rim);
  let visualRevision=0,renderSignature='',shadowRevision=-1,renderCount=0;
  let repairFragments=[];
  function prepareModel(root){root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;});visualRevision++;}
  const world=new THREE.Group();scene.add(world);const bucketGame=createBucketGameScene(THREE);scene.add(bucketGame);bucketGame.visible=false;const miraBucketPair=new THREE.Group();miraBucketPair.name='MiraHoldingBucket';bucketGame.add(miraBucketPair);const bucketProp=bucketGame.getObjectByName('MirasBucket');if(bucketProp){miraBucketPair.add(bucketProp);bucketProp.position.set(.42,.22,.3);}const buildingWorkspace=createBuildingWorkspaceScene(THREE),buildingScene=new THREE.Scene();buildingScene.background=new THREE.Color('#172754');buildingScene.add(new THREE.HemisphereLight('#d8eaff','#526185',1.65));const buildingSun=new THREE.DirectionalLight('#fff0cf',2.4);buildingSun.position.set(-3,9,5);buildingScene.add(buildingSun,buildingWorkspace);buildingWorkspace.visible=false;let avatar=null,mixer=null,walk=null;
  function activateStage(activeStage){
    for(const stage of [world,bucketGame]){
      if(stage===activeStage){if(stage.parent!==scene)scene.add(stage);stage.visible=true;}
      else{stage.visible=false;if(stage.parent===scene)scene.remove(stage);}
    }
  }
  const miraMovement={left:false,right:false};let miraMovementVelocity=0;
  function miraLaneLimit(){const aspect=container.clientWidth/Math.max(1,container.clientHeight);return Math.max(.2,Math.min(3.25,3*aspect-.65));}
  function clearMiraMovement(){miraMovement.left=false;miraMovement.right=false;miraMovementVelocity=0;}
  const builderBlocks=[
    {name:'Stone',shape:[.55,.55,.55],color:'#8e9bbd'},
    {name:'Long block',shape:[1.1,.55,.55],color:'#c18a66'},
    {name:'Tall block',shape:[.55,1.1,.55],color:'#d6b46f'},
    {name:'Blue block',shape:[.55,.55,.55],color:'#536eaa'},
  ];
  const placedBlocks=[];
  const buildRaycaster=new THREE.Raycaster();
  const pointer=new THREE.Vector2();
  let buildGesture=null;
  function placeBuildingBlock(event){
    if(!buildingGameActive||builderSubmitted||event.button!==0)return;
    const bounds=renderer.domElement.getBoundingClientRect();
    if(!bounds.width||!bounds.height)return;
    pointer.set(((event.clientX-bounds.left)/bounds.width)*2-1,-((event.clientY-bounds.top)/bounds.height)*2+1);
    buildingScene.updateMatrixWorld(true);camera.updateMatrixWorld();
    buildRaycaster.setFromCamera(pointer,camera);
    const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),.04),floorPoint=new THREE.Vector3();
    const groundHit=buildRaycaster.ray.intersectPlane(groundPlane,floorPoint);
    const blockHit=buildRaycaster.intersectObjects(placedBlocks,false).find(item=>item.face?.normal.clone().transformDirection(item.object.matrixWorld).y>.9);
    if(!groundHit&&!blockHit){const status=panel.querySelector('.mira-builder [role="status"]');if(status)status.textContent='Aim at the workspace floor, then click to place your selected block.';return;}
    const block=builderBlocks[builderSelected],baseY=blockHit?blockHit.object.position.y+blockHit.object.userData.blockHeight/2:-.04;
    const x=blockHit?blockHit.object.position.x:Math.round(THREE.MathUtils.clamp(floorPoint.x,-5.45,5.45)/.55)*.55;
    const z=blockHit?blockHit.object.position.z:Math.round(THREE.MathUtils.clamp(floorPoint.z,-5.45,5.45)/.55)*.55;
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(...block.shape),new THREE.MeshStandardMaterial({color:block.color,emissive:block.color,emissiveIntensity:.12,roughness:.65,metalness:.08}));
    mesh.name='MiraBuildBlock';mesh.position.set(x,baseY+block.shape[1]/2,z);mesh.userData.blockHeight=block.shape[1];mesh.castShadow=mesh.receiveShadow=true;buildingWorkspace.add(mesh);placedBlocks.push(mesh);buildCount++;visualRevision++;renderSignature='';render();
  }
  function buildingPointerDown(event){
    if(!buildingGameActive)return;
    if(event.button===0){event.preventDefault();placeBuildingBlock(event);return;}
    if(event.button!==1&&event.button!==2)return;
    event.preventDefault();buildGesture={pointerId:event.pointerId,button:event.button,x:event.clientX,y:event.clientY};
    renderer.domElement.setPointerCapture(event.pointerId);
  }
  function buildingPointerMove(event){
    if(!buildingGameActive||!buildGesture||event.pointerId!==buildGesture.pointerId)return;
    const dx=event.clientX-buildGesture.x,dy=event.clientY-buildGesture.y;
    buildGesture.x=event.clientX;buildGesture.y=event.clientY;
    if(!dx&&!dy)return;
    const target=controls.target,offset=camera.position.clone().sub(target);
    if(buildGesture.button===1){
      const scale=2*offset.length()/Math.max(1,renderer.domElement.clientHeight);
      const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
      const up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
      const shift=right.multiplyScalar(-dx*scale).add(up.multiplyScalar(dy*scale));
      camera.position.add(shift);target.add(shift);
    }else{
      const spherical=new THREE.Spherical().setFromVector3(offset);
      spherical.theta-=dx*.008;spherical.phi=THREE.MathUtils.clamp(spherical.phi-dy*.008,.2,Math.PI-.2);
      offset.setFromSpherical(spherical);camera.position.copy(target).add(offset);
    }
    camera.lookAt(target);camera.updateMatrixWorld();renderSignature='';
  }
  function buildingPointerUp(event){
    if(!buildGesture||event.pointerId!==buildGesture.pointerId)return;
    try{renderer.domElement.releasePointerCapture(buildGesture.pointerId);}catch{}
    buildGesture=null;
  }
  function buildingContextMenu(event){if(buildingGameActive)event.preventDefault();}
  function showBucketGame(show){
    nextGamePlaceholder=show;buildingGameActive=false;activateStage(show?bucketGame:world);
    buildingWorkspace.visible=false;
    clearMiraMovement();
    if(show){miraBucketPair.position.x=0;rainCollected=0;bucketGame.userData.resetRain();const score=rainEncouragement.querySelector('[data-rain-score]'),message=rainEncouragement.querySelector('[data-rain-message]');if(score)score.textContent='0';if(message)message.textContent='Every drop counts. Move Mira to catch one.';}
    rainEncouragement.hidden=!show;
    camera=show?bucketCamera:perspectiveCamera;controls.enabled=!show;if(show)container.dataset.bucketFrame='true';else delete container.dataset.bucketFrame;
    if(avatar){
      (show?miraBucketPair:scene).add(avatar);
      avatar.position.set(0,0,show?0:2);
      avatar.rotation.y=show?.3:0;
    }
    if(show){bucketCamera.position.set(0,1.35,12);bucketCamera.lookAt(0,1.35,0);sun.position.set(-3,9,5);sun.target.position.set(0,0,0);}
    else{camera.position.set(7,6,9);controls.target.set(0,1,0);sun.position.set(-4,12,8);sun.target.position.set(0,0,0);}
    renderer.domElement.setAttribute('aria-label',show?'Side-view 3D game frame. Use the left and right arrow keys or A and D to move Mira and the bucket along one line.':'Mira’s world. Drag to look around. Use the activity below to continue.');
    visualRevision++;renderSignature='';shadowRevision=-1;
  }
  function closeProcrastinationStory(){
    interludeReader?.destroy();interludeReader=null;
    interludeOverlay?.remove();interludeOverlay=null;
    panel.querySelector('[data-do="next-game"], [data-do="start-building"]')?.focus({preventScroll:true});
  }
  function openComicInterlude({pages,ariaLabel,altPrefix,finalPrompt,finalActionLabel,onFinalAction}){
    if(interludeReader)return;
    interludeOverlay=document.createElement('div');interludeOverlay.className='novel-overlay';
    const readerHost=document.createElement('section');readerHost.className='novel-modal moonstone-reader';readerHost.setAttribute('role','dialog');readerHost.setAttribute('aria-modal','true');readerHost.setAttribute('aria-label',ariaLabel);
    interludeOverlay.append(readerHost);document.body.append(interludeOverlay);
    interludeReader=createMoonstoneReader(readerHost,{
      pages,altPrefix,finalPrompt,finalActionLabel,
      onClose:closeProcrastinationStory,
      onFinalAction(){closeProcrastinationStory();onFinalAction();},
    });
  }
  function openProcrastinationStory(){
    openComicInterlude({pages:procrastinationComicPages,ariaLabel:'Before the raindrop game',altPrefix:'Mira and the Assignment',finalPrompt:'Ready to collect the rain with Mira?',finalActionLabel:'Continue to the raindrop game',onFinalAction(){showBucketGame(true);render();}});
  }
  function openPerfectionismStory(){
    openComicInterlude({pages:perfectionismComicPages,ariaLabel:'Before the building game',altPrefix:'Mira and the model castle',finalPrompt:'Ready to build a place for Mira?',finalActionLabel:'Continue to the building game',onFinalAction(){showBuildingGame(true);render();}});
  }
  function showBuildingGame(show){
    buildingGameActive=show;nextGamePlaceholder=true;if(show){clearMiraMovement();world.visible=false;bucketGame.visible=false;scene.remove(world,bucketGame);buildingWorkspace.visible=true;for(const block of placedBlocks){buildingWorkspace.remove(block);block.geometry.dispose();block.material.dispose();}placedBlocks.length=0;buildCount=0;builderComplete=false;builderSubmitted=false;builderSelected=0;}
    rainEncouragement.hidden=show;
    camera=perspectiveCamera;controls.enabled=!show;
    if(show){camera.position.set(4.2,5.1,6.5);controls.target.set(0,.1,0);sun.position.set(-3,9,5);sun.target.position.set(0,0,0);renderer.domElement.style.touchAction='none';renderer.domElement.style.cursor='crosshair';renderer.domElement.setAttribute('aria-label','Building workspace. Left-click to place blocks, middle-drag to pan, and right-drag to rotate the view.');}
    else{controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;controls.mouseButtons.MIDDLE=THREE.MOUSE.DOLLY;controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;showBucketGame(true);}
    visualRevision++;renderSignature='';shadowRevision=-1;
    if(show){controls.update();renderer.render(buildingScene,camera);}
  }
  const loader=new GLTFLoader().setDRACOLoader(roomDecoder);
  function release(root){root.traverse(o=>{o.shadow?.dispose();o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});}
  loader.load('/assets/story-models/ari-comic-candidate.glb',g=>{if(disposed){release(g.scene);return;}avatar=g.scene;prepareModel(avatar);avatar.position.set(0,0,nextGamePlaceholder?0:2);if(nextGamePlaceholder){avatar.rotation.y=.3;miraBucketPair.add(avatar);}else scene.add(avatar);mixer=new THREE.AnimationMixer(avatar);if(g.animations[0]){walk=mixer.clipAction(g.animations[0]);walk.play();walk.paused=true;}},undefined,()=>{feedback='Character artwork could not load. Activities still work.';render();});
  let generation=0;
  function box(size,pos,color){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,roughness:.8}));o.position.set(...pos);o.castShadow=o.receiveShadow=true;world.add(o);return o;}
  function addLostBook(){
    const book=new THREE.Group();book.name='MiraLostFriendsBook';
    const pages=new THREE.Mesh(new THREE.BoxGeometry(.9,.13,1.2),new THREE.MeshStandardMaterial({color:'#f2dfb8',roughness:.9}));
    pages.position.y=.14;pages.castShadow=pages.receiveShadow=true;book.add(pages);
    const coverMaterial=new THREE.MeshStandardMaterial({color:'#9d4b4b',roughness:.78});
    const cover=new THREE.Mesh(new THREE.BoxGeometry(.96,.055,1.27),coverMaterial);cover.position.set(0,.23,0);cover.castShadow=true;book.add(cover);
    const back=new THREE.Mesh(new THREE.BoxGeometry(.96,.055,1.27),new THREE.MeshStandardMaterial({color:'#713843',roughness:.82}));back.position.set(0,.055,0);back.castShadow=true;book.add(back);
    const spine=new THREE.Mesh(new THREE.BoxGeometry(.09,.19,1.27),new THREE.MeshStandardMaterial({color:'#713843',roughness:.82}));spine.position.set(-.47,.145,0);spine.castShadow=true;book.add(spine);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(.015,.01,.98),new THREE.MeshStandardMaterial({color:'#d7b56f',metalness:.45,roughness:.4}));stripe.position.set(0,.26,0);book.add(stripe);
    book.position.set(-1.25,.27,.15);book.rotation.y=-.2;world.add(book);
  }
  function addLostBookNote(){
    const canvas=document.createElement('canvas');canvas.width=960;canvas.height=560;
    const context=canvas.getContext('2d');
    context.fillStyle='#f8edcf';context.fillRect(0,0,canvas.width,canvas.height);
    context.strokeStyle='#c89e58';context.lineWidth=16;context.strokeRect(18,18,924,524);
    context.textAlign='center';context.fillStyle='#77563e';context.font='700 48px Georgia';context.fillText('MIRA’S NOTE',480,115);
    context.fillStyle='#25345e';context.font='700 78px Georgia';context.fillText('I LOST MY',480,260);context.fillText('FRIEND’S BOOK',480,365);
    context.strokeStyle='#b65c50';context.lineWidth=11;context.beginPath();context.moveTo(280,435);context.quadraticCurveTo(480,505,680,435);context.stroke();
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    const board=new THREE.Group();board.name='MiraLostFriendsBookNote';
    const frame=new THREE.Mesh(new THREE.BoxGeometry(2.5,1.52,.12),new THREE.MeshStandardMaterial({color:'#713843',roughness:.78}));
    frame.castShadow=true;frame.receiveShadow=true;board.add(frame);
    const face=new THREE.Mesh(new THREE.PlaneGeometry(2.38,1.4),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));face.position.z=.066;board.add(face);
    board.position.set(-1.2,1.85,-.35);board.rotation.y=.65;world.add(board);
  }
  function scenery(){
    generation++;visualRevision++;repairFragments=[];const token=generation;release(world);world.clear();
    if(chapter<2){loader.load('/assets/story-models/attic-delivery.glb',g=>{if(disposed||token!==generation){release(g.scene);return;}prepareModel(g.scene);world.add(g.scene);},undefined,()=>{feedback='Room artwork could not load; the activity is still available.';render();});}
    else{box([7,.3,22],[0,-.2,-5],'#4254a0');for(let i=0;i<9;i++)for(const s of [-1,1]){box([1.8,3+i%3,1.4],[s*4,1.3,-i*2],'#7367ba');box([.2,1,.1],[s*3.05,2,-i*2],'#ffdc87');}for(let i=0;i<3;i++)box([1.3,.6,.45],[(i%3-1)*1.7,.3,-2-i*3],'#f18b83');box([.8,1.3,.7],[0,.65,-12],'#e97d6b');}
    camera.position.set(7,6,9);controls.target.set(0,1,0);sun.position.set(-4,12,8);sun.target.position.set(0,0,0);if(avatar)avatar.position.set(0,0,2);
    if(chapter===0)loader.load('/assets/story-models/moonstone-repair.glb',g=>{
      if(disposed||token!==generation){release(g.scene);return;}
      g.scene.position.set(-.1,1.14,-1.6);prepareModel(g.scene);world.add(g.scene);addLostBook();addLostBookNote();
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
  function complete(){if(done<=chapter){done=chapter+1;sessionDone=done;try{storage?.setItem(key,String(done));}catch{}}feedback=['Pen and paper are ready.','The letter is written.','The letter is sent.'][chapter];replaying=false;active=false;paused=true;if(walk)walk.paused=true;render();}
  function render(){
    const c=chapters[chapter],solved=done>chapter&&!replaying;
    if(nextGamePlaceholder){
      if(!buildingGameActive){
        panel.innerHTML=`<div class="mira-panel mira-next-game"><small>MIRA’S NEXT STEP</small><h2>Mira and the bucket</h2><p>Move Mira along the path to catch the falling raindrops.</p><div class="mira-movement-controls" aria-label="Move Mira"><button type="button" data-move="left" aria-label="Hold to move Mira left">←</button><span>Hold to move</span><button type="button" data-move="right" aria-label="Hold to move Mira right">→</button></div><p class="mira-movement-hint">Use these buttons, ← / →, or A / D.</p><div class="mira-rain-counter" aria-live="polite">Raindrops collected <strong data-rain-count>${rainCollected}</strong></div><p class="mira-rain-gate" role="status">${rainCollected<3?`Collect ${3-rainCollected} more raindrop${3-rainCollected===1?'':'s'} to unlock the castle.`:'Three raindrops collected. The building game is unlocked.'}</p><div class="mira-next-game-art" aria-hidden="true">✧</div><button data-do="start-building" ${rainCollected<3?'disabled':''}>${rainCollected<3?'Collect 3 raindrops to unlock':'Continue to the building game →'}</button><button data-do="back-to-letter">Back to Mira’s story</button></div>`;
        return;
      }
      if(builderSubmitted){
        panel.innerHTML=`<div class="mira-panel mira-builder mira-builder-submitted"><small>CASTLE SUBMITTED</small><h2>A place for Mira</h2><p role="status">✧ Your castle is complete. It doesn’t need to be perfect to be worth sharing.</p><button data-do="continue-after-build">Continue</button></div>`;
        return;
      }
      panel.innerHTML=`<div class="mira-panel mira-builder"><small>FINAL GAME · BUILDING</small><h2>Build a castle for Mira</h2><p>Use the blocks to make a castle of your own. Start with a base, add walls, then build upward for towers. Place at least three blocks, then submit your castle to continue.</p><div class="mira-castle-reference" role="img" aria-label="A simple castle reference with a base, walls, and two towers"><span>CASTLE REFERENCE</span><svg viewBox="0 0 220 92" aria-hidden="true"><g fill="#536eaa" stroke="#293765" stroke-width="2"><rect x="31" y="60" width="158" height="22" rx="2"/><rect x="49" y="42" width="122" height="20" rx="2"/><rect x="61" y="24" width="22" height="20" rx="2"/><rect x="137" y="24" width="22" height="20" rx="2"/><rect x="99" y="48" width="22" height="34" rx="10"/><rect x="57" y="11" width="30" height="14"/><path d="M57 11 72 1l15 10z"/><rect x="133" y="11" width="30" height="14"/><path d="m133 11 15-10 15 10z"/></g><g fill="#f2d99a"><rect x="68" y="30" width="6" height="8" rx="3"/><rect x="145" y="30" width="6" height="8" rx="3"/></g></svg><small>BASE · WALLS · TOWERS</small></div><h3 class="mira-builder-heading">Blocks</h3><div class="mira-builder-blocks">${builderBlocks.map((block,i)=>`<button class="mira-builder-block" data-build-block="${i}" aria-pressed="${builderSelected===i}"><span class="mira-builder-swatch" style="--block-color:${block.color}" aria-hidden="true"></span><span>${block.name}</span></button>`).join('')}</div><p role="status">${buildCount} block${buildCount===1?'':'s'} placed. ${buildCount<3?'Place at least three blocks to unlock submit.':''}</p><div class="mira-builder-actions"><button data-do="clear-build" ${buildCount?'':'disabled'}>Clear workspace</button><button data-do="finish-build" ${buildCount<3?'disabled':''}>Submit castle</button></div><button data-do="back-to-bucket">Back to Mira and the bucket</button></div>`;
      return;
    }
    panel.innerHTML=`<div class="mira-panel"><small>AFTER THE COMIC · ${chapter+1} / 3</small><h2>${c[0]}</h2><p>${c[1]}</p><nav class="mira-nav" aria-label="Letter steps">${chapters.map((v,i)=>`<button data-chapter="${i}" ${i>done?'disabled':''} aria-label="Step ${i+1}: ${v[0]}">${i+1}${done>i?' ✓':''}</button>`).join('')}</nav>${solved?`<h3>✧ ${c[3]}</h3><p>${c[4]}</p><p>${chapter===2?'The letter is sent. Mira can take the next step at her own pace.':'This step is complete. Continue the letter when you are ready.'}</p>${chapter===2?'<button data-do="next-game">Read the next story →</button>':'<button data-do="replay">Start the letter again</button>'}`:chapter===0?`<p>${c[2]}</p><button data-do="get-paper">Get a pen and paper</button>`:chapter===1?`<p>${c[2]}</p><label class="mira-letter-label" for="mira-letter-body">Letter</label><textarea id="mira-letter-body" data-letter-body rows="3" autocomplete="off" spellcheck="false" placeholder="Type the sentence here…">${letterText}</textarea>`:`<p>${c[2]}</p><p class="mira-letter-preview">“I lost the book”</p><button data-do="send-letter">Send the letter</button>`}
    <p role="status">${feedback}</p><details><summary>Why this activity?</summary><p>${c[4]} This is a learning metaphor, not a treatment or a test of your mental health. Pausing is always allowed.</p></details></div>`;
  }
  function game(){
    if(chapter===0)return `<p>Select a fragment, then its matching outline.</p><div class="mira-fragments">${['△','◇','⬡'].map((s,i)=>`<button data-piece="${i}" aria-pressed="${selected===i}" ${pieces[i]?'disabled':''}>${s}</button>`).join('')}</div><div class="mira-fragments mira-sockets">${['△','◇','⬡'].map((s,i)=>`<button data-slot="${i}" aria-label="${s} outline">${pieces[i]?'✦':s}</button>`).join('')}</div><p>${pieces.filter(Boolean).length}/3 fragments joined. The rest can wait.</p>`;
    if(chapter===1)return `<p>${task<3?taskNames[task]:'Today has enough.'}</p>${task<3?`<p class="mira-shape">${task===0?'■ ■<br>■':task===1?'■ ■':'■<br>■ ■'}</p><p>Click a square to place this task. No timer.</p>`:''}<div class="mira-board">${board.map((v,i)=>`<button data-cell="${i}" aria-label="Today row ${Math.floor(i/6)+1}, column ${i%6+1}${v?', occupied':''}" ${v?'disabled':''} style="background:${v?'#e9af76':''}">${v?'✦':'·'}</button>`).join('')}</div>${task<3?'<button data-do="later">Leave this task for later</button>':''}<p>${placed}/2 tasks planned · ${deferred?'One task saved for later':'Leave one task for later'}</p><button data-do="reset-game">Clear plan</button>`;
    return `<p>← / → or buttons to change lanes. Reach the postbox; there is no time limit.</p><div class="mira-run" role="img" aria-label="Three lane path"><span class="mira-runner" style="left:${lane*33.333+16.66}%">M</span>${[0,1,2].map((l,i)=>`<span class="mira-barrier" style="left:${l*33.333+16.66}%;bottom:${15+(i*3+3-distance)*9}%">▰</span>`).join('')}</div><progress max="12" value="${distance}"></progress><div class="mira-nav"><button data-do="left">← Left</button><button data-do="pause">${paused?'Walk':'Pause'}</button><button data-do="right">Right →</button><button data-do="slow">${speed===.4?'Normal pace':'Slow pace'}</button></div><button data-do="detour">Try the comfortable detour</button>`;
  }
  function click(e){
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.chapter!==undefined){chapter=Number(b.dataset.chapter);replaying=false;feedback='';render();return;}
    const a=b.dataset.do;
    if(a==='close')options.onClose?.();
    if(a==='get-paper'){done=1;sessionDone=done;chapter=1;feedback='';try{storage?.setItem(key,String(done));}catch{}scenery();render();}
    if(a==='send-letter'){complete();}
    if(a==='next-game')openProcrastinationStory();
    if(a==='start-building'&&rainCollected>=3)openPerfectionismStory();
    if(a==='back-to-bucket'){showBuildingGame(false);render();}
    if(a==='back-to-letter'){showBucketGame(false);render();}
    if(b.dataset.buildBlock!==undefined&&!builderSubmitted){builderSelected=Number(b.dataset.buildBlock);render();}
    if(a==='clear-build'&&!builderSubmitted){for(const block of placedBlocks){buildingWorkspace.remove(block);block.geometry.dispose();block.material.dispose();}placedBlocks.length=0;buildCount=0;builderComplete=false;visualRevision++;renderSignature='';render();}
    if(a==='finish-build'&&buildCount>=3&&!builderSubmitted){builderComplete=true;builderSubmitted=true;render();}
    if(a==='continue-after-build'&&builderSubmitted){options.onComplete?.();options.onClose?.();}
    if(a==='replay'){replaying=true;done=0;sessionDone=0;chapter=0;letterText='';try{storage?.setItem(key,'0');}catch{}replaying=false;scenery();render();}
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
  function input(e){
    if(!e.target.matches('[data-letter-body]'))return;
    letterText=e.target.value;
    if(letterText.trim()!=='I lost the book'){
      feedback=letterText.length?'Type the sentence exactly as shown to continue.':'';
      const status=panel.querySelector('[role="status"]');if(status)status.textContent=feedback;
      return;
    }
    done=2;sessionDone=done;chapter=2;feedback='';try{storage?.setItem(key,String(done));}catch{}scenery();render();
  }
  function keydown(e){
    if(nextGamePlaceholder&&!buildingGameActive&&['ArrowLeft','ArrowRight','a','A','d','D'].includes(e.key)){
      e.preventDefault();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')miraMovement.left=true;else miraMovement.right=true;return;
    }
    if(chapter!==2||!active||!['ArrowLeft','ArrowRight',' '].includes(e.key)||e.target.matches('button,select'))return;e.preventDefault();if(e.key===' ')paused=!paused;else lane=Math.max(0,Math.min(2,lane+(e.key==='ArrowLeft'?-1:1)));render();
  }
  function keyup(e){if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')miraMovement.left=false;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')miraMovement.right=false;}
  function movementPointerDown(e){const direction=e.target.closest('[data-move]')?.dataset.move;if(!direction||!nextGamePlaceholder||buildingGameActive)return;e.preventDefault();miraMovement[direction]=true;}
  function movementPointerUp(){clearMiraMovement();}
  panel.addEventListener('click',click);panel.addEventListener('input',input);panel.addEventListener('pointerdown',movementPointerDown);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('pointerup',movementPointerUp);window.addEventListener('pointercancel',movementPointerUp);window.addEventListener('blur',clearMiraMovement);renderer.domElement.addEventListener('pointerdown',buildingPointerDown);renderer.domElement.addEventListener('pointermove',buildingPointerMove);renderer.domElement.addEventListener('pointerup',buildingPointerUp);renderer.domElement.addEventListener('pointercancel',buildingPointerUp);renderer.domElement.addEventListener('contextmenu',buildingContextMenu);
  const observer=new ResizeObserver(()=>{const {width,height}=container.getBoundingClientRect(),aspect=width/Math.max(1,height);renderer.setSize(width,height);perspectiveCamera.aspect=aspect;perspectiveCamera.updateProjectionMatrix();const halfHeight=3;bucketCamera.left=-halfHeight*aspect;bucketCamera.right=halfHeight*aspect;bucketCamera.top=halfHeight;bucketCamera.bottom=-halfHeight;bucketCamera.updateProjectionMatrix();});observer.observe(container);
  let uiTime=0,rainFrame=0;
  function loop(t){if(disposed)return;const dt=Math.min((t-last)/1000||0,.05);last=t;
    if(chapter===2&&active&&!paused){const next=distance+dt*speed;const hit=[3,6,9].find((v,i)=>distance<v&&next>=v&&lane===i);if(hit){paused=true;distance=hit-.15;feedback='A barrier, not a failure. Change lanes and keep walking.';render();}else distance=next;if(distance>=12)complete();uiTime+=dt;if(uiTime>.15&&!paused){uiTime=0;const bar=panel.querySelector('progress');if(bar)bar.value=distance;panel.querySelectorAll('.mira-barrier').forEach((el,i)=>el.style.bottom=`${15+(i*3+3-distance)*9}%`);}}
    if(avatar&&chapter===2&&!nextGamePlaceholder){avatar.position.set((lane-1)*1.7,0,2-distance);camera.position.set(5,5,avatar.position.z+8);controls.target.set(0,1,avatar.position.z-2);sun.position.z=avatar.position.z+8;sun.target.position.z=avatar.position.z;}
    const walking=chapter===2&&active&&!paused;if(walk)walk.paused=!walking;mixer?.update(dt);if(!buildingGameActive)controls.update();
    const bucketFrame=nextGamePlaceholder&&!buildingGameActive;
    if(buildingGameActive){world.visible=false;bucketGame.visible=false;buildingWorkspace.visible=true;}
    if(bucketFrame){
      const direction=Number(miraMovement.right)-Number(miraMovement.left);
      miraMovementVelocity=direction*3.1;
      const previousX=miraBucketPair.position.x,limit=miraLaneLimit();miraBucketPair.position.x=THREE.MathUtils.clamp(previousX+miraMovementVelocity*dt,-limit,limit);
      rainEncouragement.style.left=`${container.clientWidth/2+miraBucketPair.position.x*container.clientHeight/6}px`;
      if(miraBucketPair.position.x!==previousX){visualRevision++;renderSignature='';}
      if(Math.abs(miraBucketPair.position.x)>=limit-.001)miraMovementVelocity=0;
    }
    const rainAnimating=bucketFrame&&bucketGame.userData.updateRain(dt,miraLaneLimit(),()=>{rainCollected++;const counter=panel.querySelector('[data-rain-count]');if(counter)counter.textContent=String(rainCollected);const gate=panel.querySelector('.mira-rain-gate'),builderButton=panel.querySelector('[data-do="start-building"]');if(gate)gate.textContent=rainCollected<3?`Collect ${3-rainCollected} more raindrop${3-rainCollected===1?'':'s'} to unlock the castle.`:'Three raindrops collected. The building game is unlocked.';if(builderButton){builderButton.disabled=rainCollected<3;builderButton.textContent=rainCollected<3?'Collect 3 raindrops to unlock':'Continue to the building game →';}const score=rainEncouragement.querySelector('[data-rain-score]'),message=rainEncouragement.querySelector('[data-rain-message]');if(score)score.textContent=String(rainCollected);if(message)message.textContent=rainCollected===1?'Nice catch! You got your first drop.':rainCollected<5?'Great catching. Every drop counts.':rainCollected<10?'Look at you, gathering momentum.':`Amazing work. ${rainCollected} drops collected!`;});if(rainAnimating)rainFrame++;
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
    const signature=[visualRevision,rainFrame,renderer.domElement.width,renderer.domElement.height,...camera.position.toArray(),...camera.quaternion.toArray(),camera.zoom,...(avatar?.position.toArray()||[])].map(n=>n.toFixed(5)).join(':');
    if(walking||signature!==renderSignature){
      renderer.shadowMap.needsUpdate=walking||shadowRevision!==visualRevision||!rainAnimating&&renderSignature!==signature&&chapter===2;
      renderer.render(buildingGameActive?buildingScene:scene,camera);shadowRevision=visualRevision;renderSignature=signature;
      container.dataset.renderCount=String(++renderCount);container.dataset.drawCalls=String(renderer.info.render.calls);
    }
    raf=requestAnimationFrame(loop);
  }
  reset();raf=requestAnimationFrame(loop);
  return {destroy(){disposed=true;closeProcrastinationStory();cancelAnimationFrame(raf);observer.disconnect();panel.removeEventListener('click',click);panel.removeEventListener('input',input);panel.removeEventListener('pointerdown',movementPointerDown);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('pointerup',movementPointerUp);window.removeEventListener('pointercancel',movementPointerUp);window.removeEventListener('blur',clearMiraMovement);renderer.domElement.removeEventListener('pointerdown',buildingPointerDown);renderer.domElement.removeEventListener('pointermove',buildingPointerMove);renderer.domElement.removeEventListener('pointerup',buildingPointerUp);renderer.domElement.removeEventListener('pointercancel',buildingPointerUp);renderer.domElement.removeEventListener('contextmenu',buildingContextMenu);controls.dispose();release(scene);release(buildingScene);renderer.dispose();container.replaceChildren();panel.replaceChildren();}};
}
