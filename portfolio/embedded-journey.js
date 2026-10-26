export function createEmbeddedJourney({onScroll}){
  if(parent===window||!new URLSearchParams(location.search).has('embedded'))return null;
  document.body.classList.add('embedded-journey');
  const origin=location.origin,state={scroll:0,active:false};
  const send=data=>parent.postMessage(data,origin);
  addEventListener('message',event=>{
    if(event.origin!==origin||event.source!==parent||event.data?.type!=='portfolio:scroll')return;
    state.scroll=Math.max(0,event.data.pixels);state.active=event.data.active;onScroll(state.scroll);
  });
  addEventListener('wheel',e=>{
    if(document.querySelector('dialog[open]'))return;
    e.preventDefault();send({type:'portfolio:wheel',delta:e.deltaY*(e.deltaMode===1?18:e.deltaMode===2?innerHeight:1)});
  },{passive:false});
  let touch;
  addEventListener('touchstart',e=>{touch=e.touches.length===1?e.touches[0].clientY:null;},{passive:true});
  addEventListener('touchmove',e=>{
    if(touch===null||document.querySelector('dialog[open]'))return;
    const y=e.touches[0].clientY,delta=touch-y;touch=y;e.preventDefault();send({type:'portfolio:wheel',delta});
  },{passive:false});
  addEventListener('keydown',e=>{
    if(document.querySelector('dialog[open]')||e.target.matches('input,textarea,select')||e.key===' '&&e.target.matches('button,summary'))return;
    if(e.key==='Home'||e.key==='End'){e.preventDefault();send({type:'portfolio:document-edge',end:e.key==='End'});return;}
    const distance={ArrowDown:80,ArrowUp:-80,PageDown:innerHeight*.85,PageUp:-innerHeight*.85,' ':(e.shiftKey?-1:1)*innerHeight*.85};
    if(distance[e.key]!==undefined){e.preventDefault();send({type:'portfolio:wheel',delta:distance[e.key]});}
  });
  return {get scroll(){return state.scroll;},get active(){return state.active;},
    announce(screens,projects,step){send({type:'portfolio:ready',screens,projects,step});},
    jump(top,behavior,id){state.scroll=top;if(state.active||id)send({type:'portfolio:jump',top,behavior,id});}
  };
}
