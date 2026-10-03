// User-supplied avoidance comic, kept in numeric page order.
export const comicPages = Array.from({length:8}, (_,i) => `/assets/avoidance-comic/avoidance-8-page/${i+1}.jpg`);
export const procrastinationComicPages = Array.from({length:8}, (_,i) => `/assets/procrastination-comic/${i+1}.jpg`);
export const perfectionismComicPages = Array.from({length:8}, (_,i) => `/assets/perfectionism-comic/${i+1}.jpg`);
export function createMoonstoneReader(host, options = {}) {
  host.classList.add('moonstone-reader');
  const pages=options.pages??comicPages;
  let index = 0, enlarged = false, worldPrompt = false;
  function bindPanning() {
    const scroller=host.querySelector('.novel-scroll.is-enlarged');
    if(!scroller)return;
    let pointerId=null,startX=0,startY=0,startLeft=0,startTop=0;
    const stop=(event)=>{
      if(pointerId===null||event.pointerId!==pointerId)return;
      scroller.classList.remove('is-panning');
      try{scroller.releasePointerCapture(pointerId);}catch{}
      pointerId=null;
    };
    scroller.addEventListener('pointerdown',(event)=>{
      if(event.button!==0||event.target.closest('button,a,input,select,textarea'))return;
      pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;
      startLeft=scroller.scrollLeft;startTop=scroller.scrollTop;
      scroller.classList.add('is-panning');
      scroller.setPointerCapture(pointerId);
      event.preventDefault();
    });
    scroller.addEventListener('pointermove',(event)=>{
      if(event.pointerId!==pointerId)return;
      scroller.scrollLeft=startLeft-(event.clientX-startX);
      scroller.scrollTop=startTop-(event.clientY-startY);
      event.preventDefault();
    });
    scroller.addEventListener('pointerup',stop);
    scroller.addEventListener('pointercancel',stop);
    scroller.addEventListener('lostpointercapture',stop);
    scroller.querySelector('img')?.addEventListener('dragstart',(event)=>event.preventDefault());
  }
  function render() {
    host.innerHTML = `<span class="moonstone-page-count" aria-live="polite">PAGE ${index+1} / ${pages.length}</span>
      <button class="moonstone-zoom" data-comic="zoom">${enlarged?'Fit page':'Enlarge artwork'}</button>
      <button class="moonstone-close" data-comic="close" aria-label="Close story">×</button>
      <div class="moonstone-page-stage">
        <button class="moonstone-side-nav previous" data-comic="prev" aria-label="Previous comic page" ${index===0?'disabled':''}>‹</button>
        <div class="novel-scroll ${enlarged?'is-enlarged':''}">
          <img class="novel-art" src="${pages[index]}" alt="${options.altPrefix??'Avoidance: Mira and the Moonstone'}, comic page ${index+1}. English dialogue is included in the artwork." />
          <p class="novel-asset-error" hidden>Artwork could not load. <button data-comic="retry">Retry</button></p>
        </div>
        <button class="moonstone-side-nav next" data-comic="next" aria-label="${index===pages.length-1?'Finish comic':'Next comic page'}">›</button>
      </div>
      ${worldPrompt?`<div class="moonstone-world-prompt" role="dialog" aria-modal="true" aria-labelledby="moonstone-world-title">
        <div class="moonstone-world-prompt-card">
          <button class="moonstone-prompt-close" data-comic="dismiss-world" aria-label="Close prompt">×</button>
          <p id="moonstone-world-title">${options.finalPrompt??'Ready to step into the story?'}</p>
          <button class="moonstone-enter-world" data-comic="guide-world">${options.finalActionLabel??"Enter Mira's World"}</button>
        </div>
      </div>`:''}`;
    host.querySelector('img').addEventListener('error',()=>{host.querySelector('.novel-asset-error').hidden=false;});
    bindPanning();
  }
  function turn(next) {
    const boundedIndex=Math.max(0,Math.min(pages.length-1,next));
    if(boundedIndex===index)return;
    const movingForward=boundedIndex>index;
    index=boundedIndex;
    worldPrompt=false;
    render();
    const focusTarget=host.querySelector(`[data-comic="${movingForward?'next':'prev'}"]:not([disabled])`);
    (focusTarget??host.querySelector('[data-comic="close"]')).focus({preventScroll:true});
  }
  function showWorldPrompt() {
    if(index!==pages.length-1)return;
    worldPrompt=true;
    render();
    host.querySelector('[data-comic="guide-world"]')?.focus({preventScroll:true});
  }
  function dismissWorldPrompt() {
    worldPrompt=false;
    render();
    host.querySelector('[data-comic="next"]')?.focus({preventScroll:true});
  }
  function click(event) {
    const action=event.target.closest('[data-comic]')?.dataset.comic;
    if(action==='close') options.onClose?.();
    if(action==='guide-world') (options.onFinalAction??options.onGuideExplore)?.();
    if(action==='dismiss-world') dismissWorldPrompt();
    if(action==='prev') turn(index-1);
    if(action==='next') index===pages.length-1?showWorldPrompt():turn(index+1);
    if(action==='zoom'){enlarged=!enlarged;render();host.querySelector('[data-comic="zoom"]').focus();}
    if(action==='retry') render();
  }
  function key(event){
    if(worldPrompt){
      if(event.key==='Escape'){event.preventDefault();dismissWorldPrompt();}
      return;
    }
    if(event.key==='Escape')options.onClose?.();
    if(event.key==='ArrowRight'){event.preventDefault();index===pages.length-1?showWorldPrompt():turn(index+1);}
    if(event.key==='ArrowLeft'){event.preventDefault();turn(index-1);}
  }
  host.addEventListener('click',click);host.addEventListener('keydown',key);
  render();host.querySelector('[data-comic="close"]').focus();
  return {destroy(){host.removeEventListener('click',click);host.removeEventListener('keydown',key);host.replaceChildren();}};
}
