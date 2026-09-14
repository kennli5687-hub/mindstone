// Keep keyboard navigation within the active modal as its content changes.
export function containModalFocus(modal,{onEscape}={}){
  const selector='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,video[controls],[tabindex]:not([tabindex="-1"])';
  const items=()=>[...modal.querySelectorAll(selector)].filter(el=>!el.closest('[hidden],[inert]')&&el.getClientRects().length);
  function first(){(items()[0]||modal).focus({preventScroll:true});}
  function key(event){
    if(event.key==='Escape'){
      if(document.fullscreenElement)return;
      event.preventDefault();event.stopPropagation();onEscape?.();return;
    }
    if(event.key!=='Tab')return;
    const list=items(),index=list.indexOf(document.activeElement);
    if(!list.length){event.preventDefault();modal.focus();return;}
    if(index<0||(!event.shiftKey&&index===list.length-1)||(event.shiftKey&&index===0)){
      event.preventDefault();list[event.shiftKey?list.length-1:0].focus();
    }
  }
  function focus(event){if(!modal.contains(event.target))first();}
  modal.tabIndex=-1;
  document.addEventListener('keydown',key,true);
  document.addEventListener('focusin',focus);
  if(!modal.contains(document.activeElement))first();
  return {destroy(){document.removeEventListener('keydown',key,true);document.removeEventListener('focusin',focus);}};
}
