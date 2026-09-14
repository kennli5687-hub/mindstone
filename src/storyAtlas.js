import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {storyFrustum} from './storyAtlasLayout.js';
import {settleMotion} from './storyAtlasMotion.js';
import {previewStatus} from './storyAtlasStatus.js';
import {chapterAtHit,chapterCue} from './storyAtlasInteraction.js';

import {atlasTopics} from './storyTopics.js';
export {atlasTopics} from './storyTopics.js';
export const storybookAsset='/assets/story-models/storybook-gateway.glb';
export const libraryAsset='/assets/story-models/story-library-room.glb';
export function createStoryAtlas(host,{onStory,onSelect,initialTopic=null}={}){
  let disposed=false,frame=0,model=null,library=null,book=null,loadingBook=false,visible=true,paused=false,last=0,clock=0,selected=-1,down=null,drag=0,targetX=0,targetY=0,contextLost=false,door=null,doorOpen=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let renderer,unavailable=false,libraryFailed=false,bookFailed=false;
  let renderSignature='',renderCount=0;
  const chapterRoots=[];
  let hovered=-1,focused=-1;
  host.innerHTML=`<div class="atlas-viewport" tabindex="0" role="group"><img class="atlas-poster" src="/assets/story-library-poster.png" alt="Three illustrated chapter bindings for different psychological stories."/><span class="atlas-loading" role="status">Preparing the story library…</span><span class="atlas-eyebrow">THE STORY LIBRARY</span><button class="atlas-motion" type="button" aria-label="Pause 3D motion">Ⅱ</button><span class="atlas-help">Choose a book · Drag to turn</span></div><div class="atlas-topics" role="group" aria-label="Choose a psychological pattern">${atlasTopics.map((t,i)=>`<button type="button" data-atlas-topic="${i}" aria-pressed="false">${t.name}</button>`).join('')}</div><div class="atlas-detail" aria-live="polite"></div>`;
  const viewport=host.querySelector('.atlas-viewport'),detail=host.querySelector('.atlas-detail'),poster=host.querySelector('.atlas-poster'),status=host.querySelector('.atlas-loading'),motion=host.querySelector('.atlas-motion');
  const help=host.querySelector('.atlas-help');
  const doorControl=document.createElement('button');
  doorControl.type='button';doorControl.className='atlas-door-control';
  doorControl.setAttribute('aria-label','Open the miniature door');
  doorControl.setAttribute('aria-pressed','false');
  doorControl.textContent='Open door ↗';doorControl.hidden=true;
  viewport.append(doorControl);
  const bookCue=document.createElement('div');bookCue.className='atlas-book-cue';bookCue.hidden=true;bookCue.setAttribute('aria-hidden','true');
  const cueTitle=document.createElement('strong'),cueHint=document.createElement('span');bookCue.append(cueTitle,cueHint);viewport.append(bookCue);
  function syncBookCue(){
    const index=hovered>=0?hovered:focused;
    const cue=!unavailable&&!contextLost&&model===library&&library?chapterCue(atlasTopics[index]):null;
    bookCue.hidden=!cue;
    if(cue){cueTitle.textContent=cue.title;cueHint.textContent=cue.hint;}
    host.dataset.hoveredStory=cue?atlasTopics[index].id:'none';
    viewport.dataset.bookHit=String(hovered>=0&&!unavailable&&!contextLost);
    host.querySelectorAll('[data-atlas-topic]').forEach((b,j)=>{
      b.toggleAttribute('data-book-preview',!!cue&&index===j);
      b.setAttribute('aria-description',chapterCue(atlasTopics[j]).hint);
    });
  }
  function syncDoorControl(){
    doorControl.hidden=selected!==0||!book||!door||unavailable||contextLost;
    doorControl.setAttribute('aria-pressed',String(doorOpen));
    doorControl.setAttribute('aria-label',doorOpen?'Close the miniature door':'Open the miniature door');
    doorControl.textContent=doorOpen?'Close door ↙':'Open door ↗';
  }
  function syncPreview(){
    const feedback=previewStatus({unavailable,contextLost,selected,library:!!library,book:!!book,libraryFailed,bookFailed});
    poster.hidden=!feedback.fallback;
    status.hidden=!feedback.message;
    status.textContent=feedback.message;
    motion.hidden=feedback.fallback;
    help.textContent=feedback.fallback?'Preview artwork · Choose a story below':selected===0?(doorOpen?'The door is open. Meet Mira below.':'Open the miniature door · Drag to turn'):'Choose a book or a topic below · Drag to turn';
    viewport.tabIndex=feedback.fallback?-1:0;
    viewport.setAttribute('aria-label',feedback.fallback?'Story preview artwork. Choose a topic below.':selected===0?'Mira’s 3D storybook. Click or press Enter to open its door. Escape returns to all stories.':'A 3D library of different psychological stories. Choose a topic below. Arrow keys rotate; Home resets.');
    if(renderer)renderer.domElement.hidden=feedback.fallback;
    syncDoorControl();
    syncBookCue();
  }
  function toggleDoor(){if(selected!==0||!book||!door||contextLost||unavailable)return;doorOpen=!doorOpen;syncDoorControl();help.textContent=doorOpen?'The door is open. Meet Mira below.':'Open the miniature door · Drag to turn';viewport.setAttribute('aria-description',doorOpen?'The miniature door is open.':'The miniature door is closed.');}
  function showSelection(){
    if(library)library.visible=selected!==0||!book;if(book)book.visible=selected===0;
    const next=selected===0&&book?book:library;
    if(next&&model!==next&&!reduced.matches){const canvas=viewport.querySelector('canvas');canvas?.getAnimations().forEach(a=>a.cancel());canvas?.animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'ease-out'});}
    model=next;host.dataset.selectedStory=atlasTopics[selected]?.id||'none';syncPreview();
  }
  function select(i,notify=true){
    hovered=focused=-1;
    selected=i;const t=atlasTopics[i];doorOpen=false;
    host.querySelectorAll('[data-atlas-topic]').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
    host.querySelector('.atlas-eyebrow').textContent=i===0?'AVOIDANCE · MIRA’S STORY':'THE STORY LIBRARY';
    help.textContent=i===0?'Click the book to open its door · Drag to turn':'Choose a book or a topic below · Drag to turn';
    viewport.setAttribute('aria-label',i===0?'Mira’s 3D storybook. Click or press Enter to open its door. Escape returns to all stories.':'A 3D library of different psychological stories. Choose a topic below. Arrow keys rotate; Home resets.');
    viewport.removeAttribute('aria-description');
    poster.src=i===0?'/assets/storybook-poster.png':'/assets/story-library-poster.png';poster.alt=i===0?'Mira’s illustrated storybook with a miniature doorway.':'Three gilded clothbound books on a lamplit reading desk: Avoidance, Procrastination and Perfectionism. Each theme has a different story.';
    detail.innerHTML=t?`<div><span class="atlas-status">${t.ready?'PLAYABLE NOW · MIRA’S STORY':'CHAPTER · IN DEVELOPMENT'}</span><p>${t.copy}</p></div><button type="button" data-atlas-open ${t.ready?'':'disabled'}>${t.ready?'Meet Mira ↗':'Coming soon'}</button><button type="button" data-atlas-back>← All stories</button>`:`<div><span class="atlas-status">DIFFERENT TERMS. DIFFERENT PEOPLE.</span><p>Choose a psychological pattern to discover its story, then step into that character’s world.</p></div>`;
    showSelection();if(notify)onSelect?.(t?.id??null);if(i===0)ensureBook();
  }
  select(-1,false);
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{unavailable=true;syncPreview();}
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-2.3,2.3,1.8,-1.8,.1,60);camera.position.set(1.5,5.6,4.6);camera.lookAt(0,.2,0);
  let canvasAspect=1,lastComposition=null;
  let environment,resize,intersection;
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),spin=new THREE.Group();scene.add(spin);
  function release(root){root?.traverse(o=>{o.shadow?.dispose();o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});}
  function updateMotion(){motion.disabled=reduced.matches;motion.textContent=paused||reduced.matches?'▶':'Ⅱ';motion.setAttribute('aria-label',reduced.matches?'Motion reduced by system preference':paused?'Resume 3D motion':'Pause 3D motion');}
  function click(e){const b=e.target.closest('button');if(!b)return;if(b.dataset.atlasTopic!==undefined)select(Number(b.dataset.atlasTopic));if(b.hasAttribute('data-atlas-back')){const previous=selected;select(-1);host.querySelector(`[data-atlas-topic="${Math.max(0,previous)}"]`)?.focus();}if(b.hasAttribute('data-atlas-open')&&atlasTopics[selected]?.ready)onStory?.();if(b===motion){paused=!paused;updateMotion();}}
  host.addEventListener('click',click);updateMotion();
  doorControl.addEventListener('click',toggleDoor);
  function hitChapter(e){
    if(!model||unavailable||contextLost)return -1;
    const b=viewport.getBoundingClientRect();if(!b.width||!b.height)return -1;
    pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,camera);
    return chapterAtHit(ray.intersectObjects(model.children,true),atlasTopics);
  }
  function pointerDown(e){if(e.target.closest('button'))return;down={x:e.clientX,y:e.clientY};drag=0;hovered=-1;syncBookCue();viewport.setPointerCapture?.(e.pointerId);}
  function pointerMove(e){
    if(down){drag+=Math.hypot(e.clientX-down.x,e.clientY-down.y);targetY=Math.max(-.65,Math.min(.65,targetY+(e.clientX-down.x)*.006));down={x:e.clientX,y:e.clientY};}
    else{
      const next=e.pointerType==='touch'||e.target.closest('button')?-1:hitChapter(e);
      if(next!==hovered){hovered=next;syncBookCue();}
      if(!reduced.matches&&!paused){const b=viewport.getBoundingClientRect();targetX=((e.clientY-b.top)/b.height-.5)*.10;}
    }
  }
  function pointerUp(e){if(e.type!=='pointercancel'&&down&&drag<6){const i=hitChapter(e);if(i>=0){if(model===book)toggleDoor();else select(i);}}down=null;}
  function pointerLeave(){hovered=-1;syncBookCue();}
  function topicFocus(e){const b=e.target.closest('[data-atlas-topic]');focused=b?.matches(':focus-visible')?Number(b.dataset.atlasTopic):-1;syncBookCue();}
  function topicBlur(){focused=-1;syncBookCue();}
  host.addEventListener('focusin',topicFocus);host.addEventListener('focusout',topicBlur);
  function lost(e){e.preventDefault();contextLost=true;syncPreview();}
  function rebuildEnvironment(){
    const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
    let next;
    try{next=generator.fromScene(room,.04);}finally{room.dispose();generator.dispose();}
    environment?.dispose();environment=next;scene.environment=next.texture;
  }
  function restored(){
    if(disposed)return;
    try{
      // Render-target contents are lost, unlike reloadable geometry and images.
      // Regenerate the lighting map instead of reusing its empty GPU allocation.
      rebuildEnvironment();contextLost=false;renderSignature='';lastComposition=null;
      syncPreview();
    }catch{contextLost=true;syncPreview();}
  }
  function keyboard(e){if(e.target!==viewport||unavailable||contextLost)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();targetY=THREE.MathUtils.clamp(targetY+(e.key==='ArrowLeft'?-.15:.15),-.65,.65);}if(e.key==='Home'){e.preventDefault();targetX=targetY=0;}if(e.key==='Escape')select(-1);if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleDoor();}}
  function prepare(g){g.traverse(o=>{if(g===library&&o.userData.storyId)chapterRoots.push({node:o,baseY:o.position.y,id:o.userData.storyId});if(o.userData.part==='doorHinge')door=o;if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.map)m.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());});spin.add(g);}
  function ensureBook(){if(!renderer||book||loadingBook)return;loadingBook=true;bookFailed=false;syncPreview();new GLTFLoader().load(storybookAsset,g=>{loadingBook=false;if(disposed){release(g.scene);return;}book=g.scene;prepare(book);showSelection();},undefined,()=>{loadingBook=false;if(disposed)return;bookFailed=true;syncPreview();});}
  viewport.addEventListener('keydown',keyboard);
  if(renderer){
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
    renderer.domElement.setAttribute('aria-hidden','true');viewport.prepend(renderer.domElement);
    rebuildEnvironment();
    scene.environmentIntensity=.5;
    scene.add(new THREE.HemisphereLight('#e0edff','#172448',.8));const key=new THREE.DirectionalLight('#ffe5bc',2.6);key.position.set(-3,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:.5,far:15});key.shadow.bias=-.0003;key.shadow.normalBias=.008;scene.add(key);const rim=new THREE.DirectionalLight('#a5d6ff',1.2);rim.position.set(3,4,-2);scene.add(rim);
    key.shadow.radius=4;key.shadow.blurSamples=8;
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.ShadowMaterial({opacity:.18}));ground.rotation.x=-Math.PI/2;ground.position.y=-.27;ground.receiveShadow=true;scene.add(ground);
    resize=new ResizeObserver(()=>{const r=viewport.getBoundingClientRect();renderer.setSize(r.width,r.height);canvasAspect=r.width/Math.max(1,r.height);lastComposition=null;renderSignature='';});resize.observe(viewport);
    intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});intersection.observe(host);
    viewport.addEventListener('pointerdown',pointerDown);viewport.addEventListener('pointermove',pointerMove);viewport.addEventListener('pointerup',pointerUp);viewport.addEventListener('pointercancel',pointerUp);viewport.addEventListener('pointerleave',pointerLeave);renderer.domElement.addEventListener('webglcontextlost',lost);
    status.textContent='Preparing the story library…';
    renderer.domElement.addEventListener('webglcontextrestored',restored);
    new GLTFLoader().load(libraryAsset,g=>{if(disposed){release(g.scene);return;}library=g.scene;prepare(library);showSelection();host.dataset.loaded='true';},undefined,()=>{if(disposed)return;libraryFailed=true;syncPreview();});
    function loop(t){if(disposed)return;const dt=Math.min((t-last)/1000||0,.05);last=t;if(visible&&!document.hidden&&!contextLost){
      const composition=model===book&&book?'open':'library';
      if(lastComposition!==composition){Object.assign(camera,storyFrustum(canvasAspect,composition==='open'));camera.updateProjectionMatrix();lastComposition=composition;}
      if(!paused&&!reduced.matches)clock+=dt;
      spin.rotation.y=settleMotion(spin.rotation.y,targetY+Math.sin(clock*.25)*.055,dt,reduced.matches);
      spin.rotation.x=settleMotion(spin.rotation.x,targetX,dt,reduced.matches);
      spin.position.y=paused||reduced.matches?0:Math.sin(clock*.65)*.035;
      if(door)door.rotation.y=settleMotion(door.rotation.y,doorOpen?-1.05:0,dt,reduced.matches);
      for(const chapter of chapterRoots){
        const raised=model===library&&chapter.id===atlasTopics[selected]?.id;
        const previewed=model===library&&chapter.id===atlasTopics[hovered>=0?hovered:focused]?.id;
        chapter.node.position.y=settleMotion(chapter.node.position.y,chapter.baseY+(raised?.16:previewed?.10:0),dt,reduced.matches);
      }
      const signature=[model?.uuid,spin.rotation.x.toFixed(5),spin.rotation.y.toFixed(5),spin.position.y.toFixed(5),door?.rotation.y.toFixed(5),...chapterRoots.map(c=>c.node.position.y.toFixed(5)),camera.left,camera.top].join(':');
      if(signature!==renderSignature){renderer.render(scene,camera);renderSignature=signature;host.dataset.renderCount=String(++renderCount);host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.triangles=String(renderer.info.render.triangles);}
      host.dataset.doorOpen=String(doorOpen);}frame=requestAnimationFrame(loop);}
    frame=requestAnimationFrame(loop);
  }
  if(initialTopic)select(atlasTopics.findIndex(t=>t.id===initialTopic),false);
  reduced.addEventListener('change',updateMotion);
  const detachRestore=()=>renderer?.domElement.removeEventListener('webglcontextrestored',restored);
  return {destroy(){disposed=true;detachRestore();cancelAnimationFrame(frame);resize?.disconnect();intersection?.disconnect();host.removeEventListener('click',click);host.removeEventListener('focusin',topicFocus);host.removeEventListener('focusout',topicBlur);viewport.removeEventListener('keydown',keyboard);viewport.removeEventListener('pointerdown',pointerDown);viewport.removeEventListener('pointermove',pointerMove);viewport.removeEventListener('pointerup',pointerUp);viewport.removeEventListener('pointercancel',pointerUp);viewport.removeEventListener('pointerleave',pointerLeave);renderer?.domElement.removeEventListener('webglcontextlost',lost);reduced.removeEventListener('change',updateMotion);release(scene);environment?.dispose();renderer?.dispose();host.replaceChildren();}};
}
