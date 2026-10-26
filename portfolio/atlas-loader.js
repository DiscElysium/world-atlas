import {prepareTitleBitmaps} from './atlas/atelier-composition.js';
export function createAtlasLoader(THREE){
 const element=document.getElementById('atlas-loader');if(!element)return null;
 const ready=Promise.all([prepareTitleBitmaps(),...element.querySelectorAll('image')].map(e=>{if(e instanceof Promise)return e;const img=new Image();img.src=e.href.baseVal;return img.decode();}));
 let value=0,done=false;const history=[{progress:0,phase:'start'}];
 function update(next,phase='resources'){
  if(done)return;value=Math.max(value,Math.min(.995,next));element.style.setProperty('--loaded',String(value));element.style.setProperty('--remaining',(100-value*100)+'%');const window=element.querySelector('#loader-fill-window');window.setAttribute('width',String(value*3072));window.style.width=value*3072+'px';element.setAttribute('aria-valuenow',String(Math.round(value*100)));element.querySelector('.load-number').textContent=String(Math.floor(value*100)).padStart(2,'0')+'%';history.push({progress:value,phase});
 }
 THREE.DefaultLoadingManager.onProgress=(url,loaded,total)=>update(.68*loaded/Math.max(1,total),'assets');
 return {ready,update,async complete(){
  await ready;value=1;done=true;const window=element.querySelector('#loader-fill-window');window.style.transition='none';window.setAttribute('width','3072');window.style.width='3072px';element.style.setProperty('--loaded','1');element.classList.add('is-ready');element.style.setProperty('--remaining','0%');element.setAttribute('aria-valuenow','100');element.querySelector('.load-number').textContent='100%';history.push({progress:1,phase:'first-frame-ready'});
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  element.classList.add('loaded');const finish=event=>{if(event.target!==element)return;element.hidden=true;element.removeEventListener('transitionend',finish);};element.addEventListener('transitionend',finish);if(matchMedia('(prefers-reduced-motion: reduce)').matches)element.hidden=true;document.body.dataset.loaded='true';
 },fail(){element.querySelector('.load-number').textContent='请刷新重试';},get state(){return {progress:value,done,history};}};
}
