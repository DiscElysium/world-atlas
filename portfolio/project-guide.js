const clamp=v=>Math.max(0,Math.min(1,v));
const fade=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};

export function createProjectGuide({stage,projects,language,details,explore}){
 const section=document.createElement('section');section.id='project-guide';section.hidden=true;section.setAttribute('aria-label','作品导览');
 const eyebrow=document.createElement('p');eyebrow.className='guide-eyebrow';
 const title=document.createElement('h2');title.className='guide-title';
 const intro=document.createElement('p');intro.className='guide-intro';
 const actions=document.createElement('div');actions.className='guide-actions';
 const info=document.createElement('button');info.type='button';info.className='guide-details';
 const link=document.createElement('a');link.className='guide-open';
 actions.append(info,link);section.append(eyebrow,title,intro,actions);stage.append(section);
 const hint=document.createElement('div');hint.id='project-hint';hint.hidden=true;hint.setAttribute('aria-hidden','true');stage.append(hint);
 let focused=null,current=null,key='',opacity=0;
 const copy=()=>language()==='en';
 info.addEventListener('click',()=>{if(current)details(current.id);});
 link.addEventListener('click',event=>{if(!current){event.preventDefault();explore();}else if(!current.website){event.preventDefault();details(current.id);}});
 function paint(project,home){
  const en=copy();current=project;section.dataset.project=project?.id||'atelier';section.setAttribute('aria-label',en?'Project guide':'作品导览');
  eyebrow.textContent=home?(en?'THE ATLAS / SELECTED WORKS':'作品总览 / SELECTED WORKS'):project.number+' / '+project.role;
  title.textContent=home?(en?'The author’s worktop':'作者的制图台'):project.title;
  intro.textContent=home?(en?'Select a miniature, or scroll into the worlds.':'点选一件模型，或继续向下走进作品。'):project.intro;
  info.textContent=en?'Project notes':'项目介绍';info.hidden=home;
  link.textContent=home?(en?'Explore the works ↓':'开始浏览 ↓'):project.website?(en?'Visit project ↗':'进入项目 ↗'):(en?'View project →':'查看作品 →');
  link.href=home?'#oblivion':project.website||'#work-'+project.id;
  if(project?.website){link.target='_blank';link.rel='noopener noreferrer';}else{link.removeAttribute('target');link.removeAttribute('rel');}
  link.setAttribute('aria-label',home?link.textContent:en?'Open '+project.title+(project.website?' in a new tab':' details'):'查看 '+project.title+(project.website?' 项目网站（新标签页）':' 的项目介绍'));
 }
 return {
  update(view,world){
   const en=copy(),home=view.index<0&&world.phase==='atelier',project=view.index>=0?projects[view.index]:null,reading=home||project?.id==='tennis'||project?.id==='engine';
   const entry=project?world.entries.find(e=>e.project.id===project.id):null;
   opacity=home?1:entry?1-fade(.22,.46,Math.abs(world.cameraZ-entry.center)/world.L.depth):0;
   const nextKey=(project?.id||'atelier')+'/'+en+'/'+home;
   if(nextKey!==key){paint(project,!project);key=nextKey;hint.hidden=true;}
   section.dataset.reading=String(reading);section.dataset.keyboard=String(!!focused);section.style.setProperty('--guide-opacity',String(opacity));
   const visible=opacity>.01&&(reading||focused);section.hidden=!visible;section.inert=!visible;
   section.dataset.focusKind=focused?.kind||'';
  },
  focus(action){focused=action;section.dataset.keyboard=String(!!action);},
  hint(action,event){
   if(!action||event.pointerType!=='mouse'){hint.hidden=true;return;}
   const project=projects.find(p=>p.id===action.id);if(!project){hint.hidden=true;return;}
   const en=copy(),verb=action.kind==='chapter'?(en?'Enter this world ↓':'走进这个作品 ↓'):action.kind==='art'?(en?'Images & project notes →':'实机与项目介绍 →'):project.website?(en?'Visit project ↗':'进入项目 ↗'):(en?'Project notes →':'查看作品 →');
   hint.textContent=project.title+' · '+verb;hint.hidden=false;
   const bounds=stage.getBoundingClientRect();hint.style.left=Math.min(event.clientX-bounds.left+16,bounds.width-hint.offsetWidth-14)+'px';hint.style.top=Math.min(event.clientY-bounds.top+18,bounds.height-hint.offsetHeight-82)+'px';
  },
  hideHint(){hint.hidden=true;}
 };
}
