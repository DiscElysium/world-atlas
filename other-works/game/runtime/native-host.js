(() => {
  'use strict';
  let ready=false;
  let language=new URLSearchParams(location.search).get('lang')==='zh'?'zh':'en';
  const send=state=>{if(parent!==window)parent.postMessage({type:'gamemaker-state',state},location.origin);};
  function localize(){
    document.documentElement.lang=language==='zh'?'zh-CN':'en';
    document.title=language==='zh'?'钩锁与霰弹 — GameMaker 原版':'Grapple & Recoil — GameMaker Original';
    document.querySelector('#resumeButton').textContent=language==='zh'?'继续游戏':'Resume';
  }
  const firstFrame=window.onFirstFrameRendered;
  window.onFirstFrameRendered=function(){
    firstFrame?.();
    if(!ready){ready=true;send('ready');}
  };
  const nativePause=window.pause,nativeResume=window.resume;
  window.pause=function(){nativePause();if(ready)send('paused');};
  window.resume=function(){nativeResume();if(ready){send('running');document.querySelector('#canvas').focus();}};
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='portfolio-game')return;
    if(event.data.language==='zh'||event.data.language==='en'){language=event.data.language;localize();}
    if(!ready)return;
    if(event.data.command==='pause')window.pause();
    else if(event.data.command==='resume')window.resume();
    else if(event.data.command==='focus')document.querySelector('#canvas').focus();
  });
  window.addEventListener('error',()=>send('error'));
  window.addEventListener('unhandledrejection',()=>send('error'));
  document.querySelector('#output-container').hidden=true;
  localize();
})();
