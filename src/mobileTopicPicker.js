/** Native modal keeps category choices readable without shrinking the 3D hero. */
export function mountMobileTopicPicker(root,{onChoose}){
  const mobile=matchMedia('(max-width:759px)');
  let dialog=null,trigger=null;
  function close(){if(!dialog)return;const old=dialog;dialog=null;old.close();old.remove();trigger?.focus();}
  function sync(){for(const details of root.querySelectorAll('.category-card'))details.open=!mobile.matches&&details.classList.contains('has-selection');}
  function open(summary){
    close();trigger=summary;
    const category=summary.closest('.category-card');
    dialog=document.createElement('dialog');dialog.className='mobile-topic-picker';dialog.setAttribute('aria-labelledby','mobile-topic-title');
    const header=document.createElement('header'),title=document.createElement('h2'),exit=document.createElement('button');
    title.id='mobile-topic-title';title.textContent=summary.querySelector('.title').textContent;
    exit.type='button';exit.textContent='×';exit.setAttribute('aria-label','Close topics');exit.addEventListener('click',close);
    header.append(title,exit);
    const hint=document.createElement('p');hint.textContent='Choose a psychological pattern to find its story.';
    const list=document.createElement('div');list.className='mobile-topic-options';
    for(const source of category.querySelectorAll('[data-path]')){
      const button=document.createElement('button');button.type='button';button.dataset.topicId=source.dataset.path;
      const art=source.querySelector('img');if(art){const img=art.cloneNode();img.alt='';button.append(img);}
      const label=document.createElement('span');label.textContent=source.getAttribute('aria-label')||source.textContent.trim();button.append(label);
      button.addEventListener('click',()=>{const id=source.dataset.path;close();onChoose(id);root.querySelector('.category-card.has-selection summary')?.focus();});
      list.append(button);
    }
    dialog.append(header,hint,list);dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    document.body.append(dialog);dialog.showModal();exit.focus();
  }
  function click(event){
    const summary=event.target.closest('summary.category-header');
    if(!mobile.matches||!summary||!root.contains(summary))return;
    event.preventDefault();event.stopPropagation();open(summary);
  }
  sync();root.addEventListener('click',click,true);mobile.addEventListener('change',sync);
  return {destroy(){close();root.removeEventListener('click',click,true);mobile.removeEventListener('change',sync);}};
}
