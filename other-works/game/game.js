(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const {t} = window.I18n;
  const copy = {
    back:['← Back to works','← 返回作品'],edition:['GameMaker original','GameMaker 原版'],controls:['Controls','操作说明'],pause:['Pause','暂停'],resume:['Resume','继续'],restart:['Restart','重新开始'],fullscreen:['Full screen ↗','全屏 ↗'],exitFullscreen:['Exit full screen ↙','退出全屏 ↙'],title:['Grapple<br>& Recoil.','钩锁与霰弹'],intro:['Swing, let go, and turn shotgun recoil into movement.','拉近、甩出，再借霰弹反冲改变方向。'], 'right-mouse':['RIGHT MOUSE','鼠标右键'],'left-mouse':['LEFT MOUSE','鼠标左键'],'mouse-up':['MOUSE ↑','鼠标上甩'],grapple:['Hold to grapple · release to detach','按住发射钩锁，松开断开'],fire:['Fire a shotgun blast','发射霰弹'],steer:['Steer in the air','微调水平运动'],reload:['Out of shells? Flick the mouse upward to reload.','两发打空后，快速上甩鼠标换弹。'],start:['Play original','进入原版'],device:['Best played on a computer with a mouse. R returns you to the room entrance.','建议使用电脑与鼠标体验。按 R 返回当前房间入口。'],loading:['Loading the original game…','正在加载原版游戏…'],'error-title':['The game could not start.','游戏暂时未能启动。'],'error-body':['Please retry, or open the game in a current desktop browser.','请重试，或使用电脑上的新版浏览器打开。'],retry:['Try again','重新加载'],close:['Close ×','关闭 ×'],respawn:['Return to the current room entrance','回到当前房间入口'],'help-note':['The original prototype has three connected rooms. Reach an exit to enter the next. Its debug overlay shows velocity, acceleration and rope forces.','原型包含三个相连房间，接触出口进入下一关。画面中的调试信息显示速度、加速度与绳索受力。']
  };
  let frame, started = false, paused = false, ready = false, resumeAfterHelp = false, loadTimer;
  if(new URLSearchParams(location.search).get('embed')==='1')document.body.classList.add('embedded');
  function send(command){frame?.contentWindow.postMessage({type:'portfolio-game',command,language:window.I18n.language},location.origin);}
  function localize(){
    document.querySelectorAll('[data-copy]').forEach(element=>{const entry=copy[element.dataset.copy];if(entry)element.innerHTML=t(...entry);});
    $('#pause-button').textContent=t(...copy[paused?'resume':'pause']);
    $('#fullscreen-button').textContent=t(...copy[document.fullscreenElement?'exitFullscreen':'fullscreen']);
    $('#back-link').href=window.I18n.link('../')+'#project-grapple';
    document.title=t('Grapple & Recoil — GameMaker Original','钩锁与霰弹 — GameMaker 原版');
    if(frame){frame.title=t('Original GameMaker prototype: Grapple & Recoil','GameMaker 原版：钩锁与霰弹');send('language');}
    window.I18n.apply();
  }
  function fail(){
    clearTimeout(loadTimer);$('#loading-state').hidden=true;$('#error-state').hidden=false;
    $('#pause-button').disabled=true;$('#restart-button').disabled=false;
  }
  function start(){
    clearTimeout(loadTimer);ready=false;started=true;paused=false;
    $('#intro').hidden=true;$('#error-state').hidden=true;$('#loading-state').hidden=false;
    $('#pause-button').disabled=true;$('#restart-button').disabled=true;
    $('#engine-mount').replaceChildren();
    frame=document.createElement('iframe');frame.src=window.I18n.link('runtime/index.html');frame.allow='fullscreen';frame.allowFullscreen=true;
    $('#engine-mount').append(frame);frame.addEventListener('error',fail);
    loadTimer=setTimeout(fail,45000);localize();
  }
  $('#start-button').addEventListener('click',start);$('#restart-button').addEventListener('click',start);$('#retry-button').addEventListener('click',start);
  $('#pause-button').addEventListener('click',()=>send(paused?'resume':'pause'));
  $('#fullscreen-button').addEventListener('click',async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}
  });
  document.addEventListener('fullscreenchange',()=>{localize();if(ready)send('focus');});
  $('#help-button').addEventListener('click',()=>{resumeAfterHelp=started&&ready&&!paused;if(resumeAfterHelp)send('pause');$('#help-dialog').showModal();});
  $('#close-help').addEventListener('click',()=>$('#help-dialog').close());
  $('#help-dialog').addEventListener('close',()=>{if(resumeAfterHelp)send('resume');resumeAfterHelp=false;});
  document.addEventListener('languagechange',localize);
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin)return;
    if(event.source===parent && event.data?.type==='portfolio-language'){window.I18n.setLanguage(event.data.language);return;}
    if(event.source!==frame?.contentWindow || event.data?.type!=='gamemaker-state')return;
    const state=event.data.state;
    if(state==='ready'){
      clearTimeout(loadTimer);ready=true;$('#loading-state').hidden=true;$('#error-state').hidden=true;
      $('#pause-button').disabled=false;$('#restart-button').disabled=false;send('language');send('focus');
      if($('#help-dialog').open)send('pause');
    }else if(state==='paused'||state==='running'){paused=state==='paused';localize();}
    else if(state==='error')fail();
  });
  window.addEventListener('pagehide',()=>{clearTimeout(loadTimer);$('#engine-mount').replaceChildren();});
  localize();
})();
