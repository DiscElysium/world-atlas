import {PROJECTS as SOURCE_PROJECTS,STEP,imageURL} from './projects.mjs?v=eed7fff475f6';
import {LANGUAGE_KEY,resolveLanguage,localizedProject,translate,navName} from './i18n.mjs?v=eed7fff475f6';
import {PortfolioWorld} from './portfolio-world.js?v=eed7fff475f6';
import {copyCanvas,buttonCanvas,loadArtwork} from './content.js?v=eed7fff475f6';
import * as THREE from 'three';
import {loadGoldfishTextures} from './goldfish/assets.js?v=eed7fff475f6';
import {createEmbeddedJourney} from './embedded-journey.js?v=eed7fff475f6';
import {AtlasWorld} from './atlas-world.js?v=eed7fff475f6';
import {createAtlasLoader} from './atlas-loader.js?v=eed7fff475f6';
import {createProjectGuide} from './project-guide.js?v=eed7fff475f6';
const unified=document.body.classList.contains('unified-atlas'),atlasLoader=unified?createAtlasLoader(THREE):null;
let savedLanguage;try{savedLanguage=localStorage.getItem(LANGUAGE_KEY);}catch{}
let language=resolveLanguage(new URLSearchParams(location.search).get('lang'),savedLanguage);
const t=(key,values)=>translate(key,language,values),PROJECTS=SOURCE_PROJECTS.map(p=>localizedProject(p,language)),VISIBLE_PROJECTS=PROJECTS;
history.scrollRestoration='manual';
if(unified&&!location.hash)window.scrollTo({top:0,behavior:'instant'});
const stage=document.querySelector('#map-page'),journey=document.querySelector('#scroll-journey'),semantic=document.querySelector('#portfolio-content'),nav=document.querySelector('#project-nav'),status=document.querySelector('#render-status'),dialog=document.querySelector('#project-dialog'),media=matchMedia('(prefers-reduced-motion: reduce)');
let world,textures,extraTextures={},frame,visible=true,currentIndex=-2,resizeTimer,resizeProgress=null,focused=null,lastFocused=null,dialogProgress=null,dialogScroll=0,navigationRevision=0;
const embedded=createEmbeddedJourney({onScroll(){syncScroll();}}),scrollPosition=()=>embedded?embedded.scroll:window.scrollY;
const scrollToPage=(top,behavior='instant',id)=>embedded?embedded.jump(top,behavior,id):window.scrollTo({top,behavior});
const scrollCue=unified?document.getElementById('atlas-scroll-cue'):null;
const guide=unified?createProjectGuide({stage,projects:PROJECTS,language:()=>language,details:openProject,explore:()=>jumpTo(0)}):null;
scrollCue?.addEventListener('click',()=>{navigationRevision++;scrollToPage(stage.clientHeight*.55,media.matches?'instant':'smooth');});
const preservedProgress=()=>world?.L?(world.scrollProgress??world.cameraZ/world.L.depth):null;
function rememberDialogPosition(){dialogScroll=scrollPosition();dialogProgress=preservedProgress();}
function make(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
PROJECTS.forEach((p,i)=>{
 const chapter=make('article','semantic-chapter');chapter.dataset.project=p.id;chapter.style.setProperty('--ink',p.ink);chapter.style.setProperty('--accent',p.accent);chapter.style.setProperty('--ground',p.ground);chapter.setAttribute('aria-label',p.title+' · '+p.name);
 const copy=make('div','project-copy'),text=make('div','copy-text'),eyebrow=make('p','eyebrow');eyebrow.append(make('span','',p.number),document.createTextNode(p.category));text.append(eyebrow,make('h1','',p.title));if(p.id==='goldfish'||p.id==='tennis')text.append(make('p','project-name',p.name));text.append(make('p','intro',p.intro),make('p','disciplines',p.tags));
 const button=make(p.website?'a':'button','project-open',t('view'));if(p.website){button.href=p.website;button.target='_blank';button.rel='noopener noreferrer';button.setAttribute('aria-label',t('openWebsite',p));}else button.type='button';button.dataset.project=p.id;button.tabIndex=i===0?0:-1;copy.append(text,button);
 const art=make('figure','project-art'),artButton=make('button','art-open'),image=make('img');artButton.type='button';artButton.dataset.project=p.id;artButton.setAttribute('aria-label',t('artLabel',p));artButton.tabIndex=i===0?0:-1;image.src=imageURL(p.artwork||p.concept.replace('.png','.webp'));image.alt=t(p.artwork?'artAlt':'conceptAlt',p);image.width=1672;image.height=941;artButton.append(image);art.append(artButton);if(p.id!=='tennis')art.append(make('figcaption','art-caption',p.artworkCaption||t('conceptCaption')));chapter.append(copy,art);semantic.append(chapter);
 const jump=make('button','project-jump');jump.type='button';jump.dataset.index=i;jump.setAttribute('aria-label',t('jump',p));jump.append(make('span','nav-number',p.number),make('span','nav-name',navName(p,language)));jump.disabled=i>=VISIBLE_PROJECTS.length;nav.append(jump);
});
function refreshLanguage(){
 document.documentElement.lang=language==='en'?'en':'zh-CN';document.body.dataset.language=language;document.title=t('title');
 document.querySelector('meta[name=description]').content=t('description');
 const label=(selector,key)=>document.querySelector(selector).textContent=t(key),aria=(selector,key)=>document.querySelector(selector).setAttribute('aria-label',t(key));
 label('.skip-link','skip');aria('#map-page','map');label('.site-mark','mark');aria('.language-switch','language');
 label('.view-settings summary','settings');aria('.view-settings summary','openSettings');aria('.scene-controls','settings');label('.scene-controls>span','lighting');
 label('[data-light=day]','day');label('[data-light=golden]','golden');
 label('#effect-toggle',world?.styles.enabled===false?'effectsOn':'effectsOff');label('#motion-toggle',world?.paused?'resume':'pause');
 label('#tennis-palette',world?.references.views.get('tennis')?.palette==='black'?'paletteBlue':'paletteBlack');label('#capture-scene','capture');
 label('#scroll-hint','hint');aria('#project-nav','navigation');label('.dialog-close','close');aria('.dialog-close','closeDetails');
 if(unified){document.getElementById('atlas-back').textContent=language==='en'?'↑ Worktop':'↑ 制图台';document.getElementById('atlas-loader').setAttribute('aria-label',language==='en'?'Loading the portfolio world':'加载作品世界');scrollCue.querySelector('span').textContent=t('unfoldHint');}
 document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===language)));
 PROJECTS.forEach((p,i)=>{
  const chapter=semantic.querySelector('[data-project="'+p.id+'"]');chapter.setAttribute('aria-label',p.title+' · '+p.name);
  const eyebrow=chapter.querySelector('.eyebrow');eyebrow.replaceChildren(make('span','',p.number),document.createTextNode(p.category));
  const name=chapter.querySelector('.project-name');if(name)name.textContent=p.name;
  chapter.querySelector('.intro').textContent=p.intro;chapter.querySelector('.disciplines').textContent=p.tags;chapter.querySelector('.project-open').textContent=t('view');if(p.website)chapter.querySelector('.project-open').setAttribute('aria-label',t('openWebsite',p));
  chapter.querySelector('.art-open').setAttribute('aria-label',t('artLabel',p));chapter.querySelector('img').alt=t(p.artwork?'artAlt':'conceptAlt',p);
  const caption=chapter.querySelector('.art-caption');if(caption)caption.textContent=p.artworkCaption||t('conceptCaption');
  const jump=nav.querySelector('[data-index="'+i+'"]');jump.setAttribute('aria-label',t('jump',p));jump.querySelector('.nav-name').textContent=navName(p,language);
 });
 if(currentIndex>=0)document.querySelector('#current-project').textContent=t('current',PROJECTS[currentIndex]);
 if(document.body.classList.contains('no-webgl'))status.textContent=t('fallback');
}
refreshLanguage();
document.querySelector('.language-switch').addEventListener('click',async e=>{
 const next=e.target.closest('[data-language]')?.dataset.language;if(!next||next===language)return;
 const progress=preservedProgress();language=next;
 PROJECTS.forEach((p,i)=>Object.assign(p,localizedProject(SOURCE_PROJECTS[i],language)));
 try{localStorage.setItem(LANGUAGE_KEY,language);}catch{}
 const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
 refreshLanguage();await document.fonts.ready;
 // Let the selected language paint and release the click before rebuilding
 // the scene's printed typography and its reading clearings.
 await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
 if(language!==next)return;
 if(textures)resize(progress);
});
function measure(){const r=stage.getBoundingClientRect(),rect=e=>{const b=e.getBoundingClientRect();return{left:(b.left-r.left)/r.width,right:(b.right-r.left)/r.width,top:(b.top-r.top)/r.height,bottom:(b.bottom-r.top)/r.height}};return VISIBLE_PROJECTS.map(p=>{const e=semantic.querySelector('[data-project="'+p.id+'"]');return{copy:{rect:rect(e.querySelector('.copy-text')),canvas:copyCanvas(e.querySelector('.copy-text'))},button:{rect:rect(e.querySelector('.project-open')),canvas:buttonCanvas(e.querySelector('.project-open'))},art:{rect:rect(e.querySelector('.art-open'))},caption:e.querySelector('.art-caption')?{rect:rect(e.querySelector('.art-caption')),canvas:copyCanvas(e.querySelector('.art-caption'))}:null}});}
function setActive(i){if(i===currentIndex)return;currentIndex=i;if(i<0){document.body.dataset.scene='atelier';stage.style.setProperty('--active-ink','#30464b');document.querySelector('#tennis-palette').hidden=true;nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current','false'));semantic.querySelectorAll('button,a.project-open').forEach(b=>b.tabIndex=-1);return;}const p=PROJECTS[i];document.body.dataset.scene=p.id;document.querySelector('#tennis-palette').hidden=p.id!=='tennis';document.documentElement.style.setProperty('--active-ink',p.ink);document.documentElement.style.setProperty('--active-accent',p.accent);document.querySelector('meta[name=theme-color]').content=p.ground;nav.querySelectorAll('button').forEach((b,n)=>b.setAttribute('aria-current',String(n===i)));semantic.querySelectorAll('article').forEach((e,n)=>e.querySelectorAll('button,a.project-open').forEach(b=>b.tabIndex=n===i?0:-1));document.querySelector('#current-project').textContent=t('current',p);}
function syncScroll(){if(dialog.open||resizeTimer||(world?.L&&stage.clientHeight!==world.L.height))return;guide?.hideHint();world?.setHighlight(focused);world?.setScroll(scrollPosition());}
function resize(progressToKeep=null){if(!textures||document.body.classList.contains('no-webgl'))return;const height=stage.clientHeight,progress=progressToKeep??preservedProgress(),tail=stage.clientWidth<=700?.035:.14,screens=1+(world.preludeScreens||0)+(VISIBLE_PROJECTS.length-1)*STEP+tail;journey.style.setProperty('--journey-height',screens*height+'px');world.rebuild(stage.clientWidth,height,measure(),textures,extraTextures);if(progress!==null)scrollToPage(progress*height);world.snapScroll?.(scrollPosition());syncScroll();embedded?.announce(screens,PROJECTS.map(p=>p.id),STEP);}
function failure(error){console.error(error);cancelAnimationFrame(frame);document.body.classList.remove('scene-ready');document.body.classList.add('no-webgl');status.textContent=t('fallback');stage.insertBefore(status,semantic);atlasLoader?.fail();semantic.querySelectorAll('button,a.project-open').forEach(button=>button.tabIndex=0);}
async function boot(){
 try{
  world=unified?new AtlasWorld(document.querySelector('#world'),VISIBLE_PROJECTS,atlasLoader):new PortfolioWorld(document.querySelector('#world'),VISIBLE_PROJECTS);
  const loader=new THREE.TextureLoader();
  const loaded=await Promise.all([
   Promise.all(VISIBLE_PROJECTS.map(p=>loadArtwork(semantic.querySelector('[data-project="'+p.id+'"] img')))),
   Promise.all(['male','woman','goldfish'].map(name=>loader.loadAsync(imageURL('paper-'+name+'.png')))),
   Promise.all(['./assets/goldfish/seated-couple.png','./assets/projects/goldfish-room.jpg'].map(src=>loader.loadAsync(src))),
   loadGoldfishTextures(loader,Math.min(8,world.renderer.capabilities.getMaxAnisotropy())),
   world.references.load(),
   unified?world.prepare():Promise.resolve()
  ]);
  textures=loaded[0];loaded[1].forEach(t=>t.colorSpace=THREE.SRGBColorSpace);
  loaded[2].forEach(t=>t.colorSpace=THREE.SRGBColorSpace);
  extraTextures={male:loaded[1][0],woman:loaded[1][1],fish:loaded[1][2],couple:loaded[2][0],runtime:loaded[2][1],reference:textures[VISIBLE_PROJECTS.findIndex(p=>p.id==='goldfish')],...loaded[3]};
  await document.fonts.ready;if(unified)await atlasLoader.ready;atlasLoader?.update(.90,'building-world');await new Promise(resolve=>requestAnimationFrame(resolve));resize();
  if(unified){await atlasLoader.ready;await world.warmUp();}
  document.body.dataset.references='ready';
  function animate(t){
   frame=requestAnimationFrame(animate);
   if(visible&&(!embedded||embedded.active)){const view=world.update(t,media.matches);if(view){setActive(view.index);guide?.update(view,world);const uiInk=new THREE.Color(view.project.ink).lerp(new THREE.Color('#e3e3e3'),world.uiInk??world.styles.uniforms.uInk.value);stage.style.setProperty('--active-ink','#'+uiInk.getHexString());if(unified)document.body.dataset.atlasPhase=world.phase;}document.querySelector('#scroll-hint').style.opacity=String(Math.max(0,.7-scrollPosition()/450));if(scrollCue){const opacity=Math.max(0,1-scrollPosition()/(stage.clientHeight*.3));scrollCue.hidden=document.body.dataset.ready!=='true'||opacity<=.01;scrollCue.style.opacity=String(opacity);}}
  }
  frame=requestAnimationFrame(animate);document.body.classList.add('scene-ready');
  world.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();failure(new Error('WebGL context lost'));});
  if(unified){world.update(performance.now(),media.matches);await atlasLoader.complete();document.body.dataset.ready='true';}
  const first=PROJECTS.findIndex(p=>'#'+p.id===location.hash||'#work-'+p.id===location.hash||'#'+p.slug===location.hash);if(first>=0)jumpTo(first,false);
 }catch(e){failure(e);}
}
function jumpTo(index,smooth=true){if(index<0||index>=VISIBLE_PROJECTS.length)return;navigationRevision++;const top=((world?.preludeScreens||0)+index*STEP)*stage.clientHeight;scrollToPage(top,smooth&&!media.matches?'smooth':'instant',PROJECTS[index].id);if(!smooth&&world?.ready){world.setScroll(top);world.snapScroll?.(top);world.cameraZ=world.targetZ;world.applyCamera();}history.replaceState(null,'','#'+(PROJECTS[index].slug||PROJECTS[index].id));}
nav.addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b)jumpTo(Number(b.dataset.index));});addEventListener('scroll',syncScroll,{passive:true});addEventListener('resize',()=>{if(!resizeTimer)resizeProgress=preservedProgress();clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{resizeTimer=undefined;resize(resizeProgress);resizeProgress=null;},140)});document.addEventListener('visibilitychange',()=>visible=!document.hidden);
stage.addEventListener('pointermove',e=>{if(!world?.ready)return;if(e.target.closest('nav,details,.top-controls,#project-guide')){stage.style.cursor='default';guide?.hideHint();world.setHighlight(focused);return;}const r=stage.getBoundingClientRect(),action=world.pick((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);stage.style.cursor=action?'pointer':'default';guide?.hint(action,e);world.setHighlight(focused||action);},{passive:true});stage.addEventListener('pointerleave',()=>{stage.style.cursor='default';guide?.hideHint();world?.setHighlight(focused)});
stage.addEventListener('click',e=>{if(e.target.closest('button,nav,details,a,#project-guide')||!world?.ready)return;const r=stage.getBoundingClientRect(),action=world.pick((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);if(action){if(action.kind==='chapter')jumpTo(PROJECTS.findIndex(p=>p.id===action.id));else if(action.kind==='project')semantic.querySelector('[data-project="'+action.id+'"] .project-open')?.click();else openProject(action.id);}});
semantic.querySelectorAll('button,a.project-open').forEach(button=>{if(button.tagName==='BUTTON')button.addEventListener('click',()=>openProject(button.dataset.project));button.addEventListener('focus',()=>{focused={id:button.dataset.project,kind:button.classList.contains('art-open')?'art':'project'};world?.setHighlight(focused);guide?.focus(focused)});button.addEventListener('blur',()=>{focused=null;world?.setHighlight(null);guide?.focus(null)});});
function openProject(id){guide?.hideHint();const p=PROJECTS.find(p=>p.id===id);if(!p)return;rememberDialogPosition();lastFocused=document.activeElement;const content=document.querySelector('#dialog-content');content.replaceChildren();dialog.style.setProperty('--accent',p.id==='oblivion'?'#171717':p.accent);content.append(make('p','dialog-eyebrow',p.number+' / '+p.role),make('h2','',p.title+(p.id==='goldfish'&&language==='zh'?' · 金鱼':'')),make('p','detail-summary',p.summary));content.querySelector('h2').id='dialog-title';const details=make('div','project-details');for(const [title,body] of p.details){const section=make('section');section.append(make('h3','',title),make('p','',body));details.append(section)}content.append(details);if(p.website){const visit=make('a','dialog-visit',language==='en'?'Visit project website ↗':'进入项目网站 ↗');visit.href=p.website;visit.target='_blank';visit.rel='noopener noreferrer';content.append(visit);}const gallery=make('div','detail-gallery');for(const [file,caption] of p.gallery){const f=make('figure'),img=make('img');img.src=imageURL(file);img.alt=caption;img.loading='lazy';f.append(img,make('figcaption','',caption));gallery.append(f)}content.append(gallery);const concept=make('figure','detail-concept'),image=make('img');image.src=imageURL(p.concept);image.alt=t('detailConceptAlt',p);image.loading='lazy';concept.append(image,make('figcaption','',t('concept')));content.append(concept);dialog.showModal();dialog.scrollTop=0;}
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();openProject(PROJECTS[Math.max(0,currentIndex)].id);});
dialog.addEventListener('close',()=>{
 const progress=dialogProgress,top=progress!==null?progress*stage.clientHeight:dialogScroll,revision=navigationRevision;dialogProgress=null;
 lastFocused?.focus({preventScroll:true});
 const restore=()=>{if(revision!==navigationRevision)return;scrollToPage(top);if(world?.ready){world.setScroll(top);world.snapScroll?.(top);world.cameraZ=world.targetZ;world.applyCamera();world.renderFrame();}};
 restore();requestAnimationFrame(restore);
});
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
document.querySelectorAll('[data-light]').forEach(b=>b.addEventListener('click',()=>{world?.setLight(b.dataset.light);document.querySelectorAll('[data-light]').forEach(c=>c.setAttribute('aria-pressed',String(b===c)))}));document.querySelector('#motion-toggle').addEventListener('click',e=>{if(!world)return;world.paused=!world.paused;e.currentTarget.setAttribute('aria-pressed',String(world.paused));e.currentTarget.textContent=t(world.paused?'resume':'pause');});
document.querySelector('#capture-scene').addEventListener('click',()=>{
 if(!world?.ready)return;
 rememberDialogPosition();world.renderFrame();
 const p=currentIndex<0?{id:'atelier',title:language==='en'?'The author’s worktop':'作者制图台'}:PROJECTS[currentIndex],url=world.renderer.domElement.toDataURL('image/jpeg',.94),content=document.querySelector('#dialog-content');
 if(['127.0.0.1','localhost'].includes(location.hostname))fetch('/__capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:p.id+'-main-'+(innerWidth<=700?'mobile':'desktop')+'-'+Date.now(),image:world.renderer.domElement.toDataURL('image/png')})}).catch(()=>{});
 const settings=document.querySelector('.view-settings');settings.open=false;lastFocused=settings.querySelector('summary');lastFocused.focus({preventScroll:true});content.replaceChildren();dialog.style.setProperty('--accent',p.id==='oblivion'?'#171717':p.accent);
 const heading=make('h2','',t('snapshot',p));heading.id='dialog-title';const image=make('img','scene-capture');image.src=url;image.alt=t('snapshotAlt',p);const download=make('a','capture-download',t('download'));download.href=url;download.download=p.id+'-scene.jpg';content.append(heading,image,download);dialog.showModal();dialog.scrollTop=0;
});
document.querySelector('#effect-toggle').addEventListener('click',e=>{if(!world)return;world.styles.enabled=!world.styles.enabled;e.currentTarget.setAttribute('aria-pressed',String(world.styles.enabled));e.currentTarget.textContent=t(world.styles.enabled?'effectsOff':'effectsOn');world.renderFrame();});
boot();
window.__MAIN_PORTFOLIO__={jumpTo,openProject,get world(){return world;},get current(){return PROJECTS[currentIndex]?.id;},get scroll(){return scrollPosition();},get ready(){return !!world?.ready;}};
if(unified){
 window.__ATLAS__={get world(){return world;},get state(){return world?.diagnostics();},get loading(){return atlasLoader.state;},jumpTo,screens(value){navigationRevision++;window.scrollTo({top:value*stage.clientHeight,behavior:'instant'});world.snapScroll(value*stage.clientHeight);},back(){navigationRevision++;history.replaceState(null,'',location.pathname+location.search);window.scrollTo({top:world.prefix.intro*stage.clientHeight,behavior:media.matches?'instant':'smooth'});}};
 document.getElementById('atlas-back').onclick=()=>window.__ATLAS__.back();
}
document.querySelector('#tennis-palette').addEventListener('click',e=>{const dark=world?.references.togglePalette();e.currentTarget.setAttribute('aria-pressed',String(!!dark));e.currentTarget.textContent=t(dark?'paletteBlue':'paletteBlack');world?.renderFrame();});

