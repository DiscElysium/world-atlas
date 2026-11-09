import {prepareTitleBitmaps} from './atlas/atelier-composition.js?v=eed7fff475f6';
export function createAtlasLoader(THREE){
 const element=document.getElementById('atlas-loader');if(!element)return null;
 const ready=Promise.all([prepareTitleBitmaps(),...element.querySelectorAll('image')].map(e=>{if(e instanceof Promise)return e;const img=new Image();img.src=e.href.baseVal;return img.decode();}));
 let value=0,done=false,timer;
 const history=[{progress:0,phase:'start'}];
 const fill=element.querySelector('#loader-fill-window'),number=element.querySelector('.load-number');
 function stopFinalizing(){clearInterval(timer);timer=undefined;}
 function beginFinalizing(){
  if(done||timer!==undefined)return;
  update(.90,'building-world');
  const start=performance.now();
  timer=setInterval(()=>{
   const elapsed=performance.now()-start;
   const percent=Math.min(99,90+Math.floor(10*(1-Math.exp(-elapsed/5500))));
   // A long build can block the main thread. Resume one point at a time.
   update(Math.min(percent,Math.round(value*100)+1)/100,'finalizing');
   if(value===.99)stopFinalizing();
  },200);
 }
 function update(next,phase='resources'){
  if(done||!Number.isFinite(next))return;
  const percent=Math.min(99,Math.floor(next*100+1e-7));
  if(percent<=Math.round(value*100))return;
  value=percent/100;
  element.style.setProperty('--loaded',String(value));element.style.setProperty('--remaining',(100-percent)+'%');
  fill.setAttribute('width',String(value*3072));fill.style.width=value*3072+'px';
  element.setAttribute('aria-valuenow',String(percent));number.textContent=String(percent).padStart(2,'0')+'%';
  history.push({progress:value,phase});
 }
 THREE.DefaultLoadingManager.onProgress=(url,loaded,total)=>update(.68*loaded/Math.max(1,total),'assets');
 return {ready,update,beginFinalizing,async complete(){
  await ready;if(done)return;stopFinalizing();value=1;done=true;fill.style.transition='none';fill.setAttribute('width','3072');fill.style.width='3072px';element.style.setProperty('--loaded','1');element.classList.add('is-ready');element.style.setProperty('--remaining','0%');element.setAttribute('aria-valuenow','100');number.textContent='100%';history.push({progress:1,phase:'first-frame-ready'});
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  element.classList.add('loaded');const finish=event=>{if(event.target!==element)return;element.hidden=true;element.removeEventListener('transitionend',finish);};element.addEventListener('transitionend',finish);if(matchMedia('(prefers-reduced-motion: reduce)').matches)element.hidden=true;document.body.dataset.loaded='true';
 },fail(){stopFinalizing();done=true;element.hidden=true;element.classList.add('loaded');history.push({progress:value,phase:'fallback-visible'});},get state(){return {progress:value,done,history};}};
}
