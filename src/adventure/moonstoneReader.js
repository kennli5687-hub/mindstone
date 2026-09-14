// User-supplied artwork, in numeric (not lexicographic) page order.
export const comicPages = Array.from({length:10}, (_,i) => `/assets/avoidance-comic/Story%20comic%2010/fant${i+1}.png`);
const bookmarkKey = 'mindstone-moonstone-comic-page-v1';
export function createMoonstoneReader(host, options = {}) {
  let index = 0, enlarged = false, introduction = true;
  try { index = Math.max(0,Math.min(9,Number(localStorage.getItem(bookmarkKey)) || 0)); } catch {}
  function render() {
    if(introduction){
      host.innerHTML=`<header class="novel-header"><div><span class="novel-eyebrow">SCENARIO · START HERE</span><h1>Before we meet Mira</h1></div><button data-comic="close" aria-label="Close story">×</button></header><div class="novel-scroll moon-intro"><p>A short introduction to avoidance, followed by Mira’s illustrated story.</p><video controls playsinline preload="metadata" src="/assets/what-avoidance-is-silent.mp4" aria-label="What avoidance is — video"></video><p>Watch at your own pace, or go straight to the comic.</p></div><footer class="novel-footer"><button data-comic="read">${index?'Continue reading':'Read the story'} →</button></footer>`;
      return;
    }
    host.innerHTML = `<header class="novel-header"><div><span class="novel-eyebrow">SCENARIO · AVOIDANCE</span><h1>Mira and the Moonstone</h1></div><button data-comic="close" aria-label="Close story">×</button></header>
      <div class="novel-toolbar"><span aria-live="polite">PAGE ${index+1} / 10</span><button data-comic="zoom">${enlarged?'Fit page':'Enlarge artwork'}</button></div>
      <div class="novel-scroll ${enlarged?'is-enlarged':''}"><img class="novel-art" src="${comicPages[index]}" alt="Avoidance: Mira and the Moonstone, comic page ${index+1}. English dialogue is included in the artwork." /><p class="novel-asset-error" hidden>Artwork could not load. <button data-comic="retry">Retry</button></p></div>
      <footer class="novel-footer"><button data-comic="prev" ${index===0?'disabled':''}>← Previous</button><label class="novel-page-select">Page <select aria-label="Story page">${comicPages.map((_,i)=>`<option value="${i}" ${i===index?'selected':''}>${i+1}</option>`).join('')}</select></label><button data-comic="next" ${index===9?'disabled':''}>Next →</button><button data-comic="close">Done</button></footer>`;
    if(index===9){const button=document.createElement('button');button.dataset.comic='world';button.textContent='Continue as Mira →';host.querySelector('footer').append(button);}
    host.querySelector('img').addEventListener('error',()=>{host.querySelector('.novel-asset-error').hidden=false;});
  }
  function turn(next) {
    index=Math.max(0,Math.min(9,next));
    try {localStorage.setItem(bookmarkKey,String(index));} catch {}
    render();
    host.querySelector('select').focus({preventScroll:true});
  }
  function click(event) {
    const action=event.target.closest('[data-comic]')?.dataset.comic;
    if(action==='close') options.onClose?.();
    if(action==='world') options.onWorld?.();
    if(action==='read'){introduction=false;render();host.querySelector('[data-comic="close"]').focus();}
    if(action==='prev') turn(index-1);
    if(action==='next') turn(index+1);
    if(action==='zoom'){enlarged=!enlarged;render();host.querySelector('[data-comic="zoom"]').focus();}
    if(action==='retry') render();
  }
  function change(event){if(event.target.matches('select'))turn(Number(event.target.value));}
  function key(event){
    if(event.key==='Escape')options.onClose?.();
    if(introduction||event.target.matches('select,video'))return;
    if(event.key==='ArrowRight'){event.preventDefault();turn(index+1);}
    if(event.key==='ArrowLeft'){event.preventDefault();turn(index-1);}
  }
  host.addEventListener('click',click);host.addEventListener('change',change);host.addEventListener('keydown',key);
  render();host.querySelector('[data-comic="close"]').focus();
  return {destroy(){host.removeEventListener('click',click);host.removeEventListener('change',change);host.removeEventListener('keydown',key);host.replaceChildren();}};
}
