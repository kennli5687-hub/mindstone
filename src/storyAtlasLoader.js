import {atlasTopics} from './storyTopics.js';
import {createLatestTask} from './latestTask.js';

// The homepage can paint and navigate without downloading/parsing Three first.
export function loadStoryAtlas(host,options={},loadModule=()=>import('./storyAtlas.js')){
  host.classList.toggle('atlas-display-only',!!options.displayOnly);
  const gate=createLatestTask();
  let selected=options.initialTopic??null,preview=null,disposed=false;
  host.innerHTML=`<div class="atlas-viewport"><img class="atlas-poster" src="/assets/story-library-poster.png" alt="Three clothbound books, each introducing a different psychological story."><span class="atlas-loading" role="status">Loading interactive books…</span><span class="atlas-eyebrow">THE STORY LIBRARY</span></div><div class="atlas-topics" role="group" aria-label="Choose a psychological pattern">${atlasTopics.map((t,i)=>`<button type="button" data-atlas-topic="${i}" aria-pressed="${t.id===selected}">${t.name}</button>`).join('')}</div><div class="atlas-detail" aria-live="polite"><span class="atlas-status">STORIES ARE AVAILABLE WHILE 3D LOADS</span><p>Choose a topic, then use Scenario below to begin.</p></div>`;
  function choose(event){
    if(preview)return;
    const button=event.target.closest('[data-atlas-topic]');if(!button)return;
    selected=atlasTopics[Number(button.dataset.atlasTopic)].id;
    host.querySelectorAll('[data-atlas-topic]').forEach(b=>b.setAttribute('aria-pressed',String(atlasTopics[Number(b.dataset.atlasTopic)].id===selected)));
    options.onSelect?.(selected);
  }
  host.addEventListener('click',choose);
  function start(){
    host.querySelector('.atlas-loading').textContent='Loading interactive books…';
    return gate.run({
      load:loadModule,
      isActive:()=>!disposed&&host.isConnected,
      commit:({createStoryAtlas})=>{
        const focused=host.contains(document.activeElement)?document.activeElement?.dataset.atlasTopic:undefined;
        host.removeEventListener('click',choose);
        preview=createStoryAtlas(host,{...options,initialTopic:selected});
        if(focused!==undefined)host.querySelector(`[data-atlas-topic="${focused}"]`)?.focus({preventScroll:true});
      },
      fail:()=>{
        host.querySelector('.atlas-loading').textContent='3D could not load. Story navigation is still available.';
        const detail=host.querySelector('.atlas-detail');
        if(!detail.querySelector('[data-retry-3d]')){
          const retry=document.createElement('button');retry.type='button';retry.dataset.retry3d='';retry.textContent='Retry 3D preview';
          retry.onclick=()=>{retry.remove();start();};detail.append(retry);
        }
      },
    });
  }
  start();
  return {destroy(){disposed=true;gate.invalidate();host.removeEventListener('click',choose);preview?.destroy();if(!preview)host.replaceChildren();}};
}
