'use strict';
const viewer=document.querySelector('#viewer'),stage=document.querySelector('.viewer-stage'),image=document.querySelector('#viewer-image'),fit=document.querySelector('#fit');
let source=null;
const zh=document.documentElement.lang==='zh-CN';
function setZoom(value){stage.classList.toggle('zoomed',value);fit.textContent=value?(zh?'适应画板 ↙':'Fit page ↙'):(zh?'放大 ＋':'Zoom in ＋');fit.setAttribute('aria-pressed',String(value));if(!value){stage.scrollLeft=0;stage.scrollTop=0;}}
document.querySelectorAll('.plate-open').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();source=link;image.src=link.href;image.alt=link.querySelector('img').alt;document.querySelector('#viewer-title').textContent=zh?'金鱼 / 第 '+link.dataset.page+' 页':'GOLDFISH / PAGE '+link.dataset.page;setZoom(false);viewer.showModal();document.body.classList.add('modal-open');document.querySelector('#close').focus();}));
document.querySelector('#close').addEventListener('click',()=>viewer.close());
viewer.addEventListener('close',()=>{document.body.classList.remove('modal-open');setZoom(false);source?.focus({preventScroll:true});});
fit.addEventListener('click',()=>setZoom(!stage.classList.contains('zoomed')));
image.addEventListener('dblclick',()=>setZoom(!stage.classList.contains('zoomed')));
stage.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){setZoom(true);e.preventDefault();}if(e.key==='-'){setZoom(false);e.preventDefault();}});
let drag=null;
stage.addEventListener('pointerdown',e=>{if(!stage.classList.contains('zoomed')||e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');e.preventDefault();});
stage.addEventListener('pointermove',e=>{if(drag){stage.scrollLeft=drag.left+drag.x-e.clientX;stage.scrollTop=drag.top+drag.y-e.clientY;}});
const end=()=>{drag=null;stage.classList.remove('dragging');};stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
const sections=[...document.querySelectorAll('.chapter')],links=[...document.querySelectorAll('.chapter-nav a')];
function current(){const line=innerHeight*.32;let active=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=line)active=section;}for(const link of links){if(link.hash==='#'+active.id)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');}}
let queued=false;addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{current();queued=false;});}},{passive:true});addEventListener('resize',current);current();

document.querySelector('.language-switch')?.addEventListener('click', event => {
  const link = event.currentTarget;
  link.hash = location.hash;
});
