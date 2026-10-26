(() => {
  'use strict';
  const works = window.WORKS;
  const collection = document.querySelector('.collection');
  const dialog = document.querySelector('#project-dialog');
  const content = document.querySelector('#dialog-content');
  let current = 0;
  let lastTrigger;
  let disposeDemo = () => {};
  const asset = name => `assets/${name}`;
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b => {
        const active = b === button;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      let count = 0;
      document.querySelectorAll('.chapter').forEach(chapter => {
        chapter.hidden = selected !== 'all' && chapter.dataset.category !== selected;
        if (!chapter.hidden) count += chapter.querySelectorAll('.work').length;
      });
      document.querySelector('#filter-status').textContent = `显示 ${count} 个项目`;
    });
  });
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      collection.classList.toggle('index-view', button.dataset.view === 'index');
      document.querySelectorAll('[data-view]').forEach(b => {
        b.classList.toggle('active',b === button);
        b.setAttribute('aria-pressed',String(b === button));
      });
    });
  });

  function mediaFor(work) {
    if (work.video) return `<video controls playsinline preload="metadata" poster="${asset(work.poster)}" aria-label="${escape(work.name)}原片"><source src="${asset(work.video)}" type="video/mp4">浏览器暂不支持视频，请<a href="${asset(work.video)}">打开原片</a>。</video>`;
    if (work.demo === 'grapple') return `<div class="grapple-demo"><canvas id="grapple-canvas" width="1000" height="420" role="img" aria-label="钩锁机制示意：比较持续牵引、松钩后的惯性和射击反冲"></canvas><div class="grapple-demo-controls" role="group" aria-label="选择演示动作"><button type="button" data-mechanism="pull">01 持续牵引</button><button type="button" data-mechanism="release">02 松钩惯性</button><button type="button" data-mechanism="recoil">03 霰弹反冲</button><button type="button" data-mechanism="reset">重置 ↺</button><span id="demo-status" aria-live="polite">选择一个动作，观察运动轨迹。</span></div><p class="demo-caption">原型参数 · 径向牵引 0.80 / 阻力 0.001 / 后坐脉冲 15　（单位沿用原工程的逐步计算）</p></div>`;
    if (work.demo === 'bitplane') return `<div class="bitplane-detail"><div class="bitplane-images">${[['rgb','RGB / 原图'],['msb','MSB / 高四位'],['lsb','LSB / 低四位放大']].map(([id,label])=>`<figure><img src="${asset(`bitplane-${id}.webp`)}" width="224" height="224" alt="${label}"><figcaption>${label}</figcaption></figure>`).join('')}</div><p class="media-caption">输入处理示意 · 同一图像在两种位平面中的不同信息</p></div>`;
    return `<img src="${asset(work.hero)}" alt="${escape(work.caption)}">`;
  }

  function renderProject(index,trigger) {
    disposeDemo();
    content.querySelectorAll('video').forEach(video => video.pause());
    current = (index + works.length) % works.length;
    const work = works[current];
    if (trigger) lastTrigger = trigger;
    document.querySelector('#dialog-position').textContent = `PROJECT ${work.number} / 07`;
    content.innerHTML = `<div class="detail-intro"><div><span class="detail-category">${escape(work.category)}</span><h2 id="dialog-title">${escape(work.name)}</h2><span class="detail-en">${escape(work.english)}</span><p class="detail-hook">${escape(work.hook)}</p><div class="detail-tags">${work.tags.map(t=>`<span>${escape(t)}</span>`).join('')}</div></div><p class="detail-summary">${escape(work.summary)}</p></div><figure class="detail-main-media">${mediaFor(work)}<figcaption class="media-caption">${escape(work.caption)}</figcaption></figure><div class="detail-points">${work.points.map(([title,body],i)=>`<section class="detail-point"><span>0${i+1}</span><h3>${escape(title)}</h3><p>${escape(body)}</p></section>`).join('')}</div>${work.images.length?`<div class="detail-gallery">${work.images.map(([name,caption])=>`<figure><img src="${asset(name)}" alt="${escape(caption)}" loading="lazy"><figcaption>${escape(caption)}</figcaption></figure>`).join('')}</div>`:''}<details class="detail-notes"><summary>项目范围与材料说明</summary><p>${escape(work.notes)}</p></details>`;
    if (!dialog.open) {
      dialog.showModal();
      document.body.classList.add('dialog-open');
    }
    dialog.scrollTop = 0;
    if(work.demo === 'grapple') disposeDemo = createGrappleDemo();
  }

  document.querySelectorAll('.work-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const index = works.findIndex(w => w.id === link.closest('.work').dataset.project);
      history.pushState({project:works[index].id},'',`#project-${works[index].id}`);
      renderProject(index,link);
    });
  });
  function finishClose() {
    disposeDemo();
    content.querySelectorAll('video').forEach(video => {video.pause();video.querySelectorAll('source').forEach(source=>source.removeAttribute('src'));video.removeAttribute('src');video.load();});
    document.body.classList.remove('dialog-open');
    if(location.hash.startsWith('#project-')) history.replaceState(null,'',location.pathname+location.search+'#collection');
    if(lastTrigger) lastTrigger.focus({preventScroll:true});
  }
  document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',finishClose);
  dialog.addEventListener('click', e=> {
    if(e.target === dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}
  });
  for(const [id,direction] of [['prev-project',-1],['next-project',1]]) {
    document.querySelector(`#${id}`).addEventListener('click',()=> {
      const index = (current+direction+works.length)%works.length;
      history.replaceState({project:works[index].id},'',`#project-${works[index].id}`);
      renderProject(index);
      document.querySelector('#close-dialog').focus({preventScroll:true});
    });
  }
  function readRoute() {
    const id=location.hash.replace('#project-','');
    const index=works.findIndex(w=>w.id===id);
    if(index>=0){if(!dialog.open||index!==current)renderProject(index);}
    else if(dialog.open)dialog.close();
  }
  window.addEventListener('popstate',readRoute);
  window.addEventListener('hashchange',readRoute);
  readRoute();

  function createGrappleDemo(){
    const canvas=document.querySelector('#grapple-canvas');
    const ctx=canvas.getContext('2d');
    const W=1000,H=420,anchor={x:650,y:70};
    let raf, mode='reset',frames=0,last=0,accumulator=0;
    let point,trail;
    const init=()=>{point={x:360,y:230,vx:6,vy:-1};trail=[];frames=0;last=0;accumulator=0;};
    function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.strokeStyle='#9faaa41b';ctx.lineWidth=1;
      for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      ctx.font=`${Math.max(15,Math.round(W/canvas.clientWidth*9))}px monospace`;ctx.fillStyle='#c2c8bd';ctx.fillText('MECHANICS STUDY / 60 FPS',22,42);
      ctx.fillStyle='#eff2c5';ctx.beginPath();ctx.arc(anchor.x,anchor.y,5,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(anchor.x,anchor.y,14,0,Math.PI*2);ctx.strokeStyle='#eff2c5';ctx.stroke();
      ctx.fillText('ANCHOR',anchor.x+24,anchor.y+4);
      if(mode==='pull'||mode==='reset'){ctx.beginPath();ctx.moveTo(anchor.x,anchor.y);ctx.lineTo(point.x,point.y);ctx.strokeStyle='#eff2c5';ctx.lineWidth=1.5;ctx.stroke();}
      if(trail.length){ctx.beginPath();trail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='#a9c9ff';ctx.lineWidth=2;ctx.setLineDash([3,6]);ctx.stroke();ctx.setLineDash([]);}
      ctx.fillStyle='#e7edff';ctx.fillRect(point.x-8,point.y-8,16,16);
      ctx.beginPath();ctx.moveTo(point.x,point.y);ctx.lineTo(point.x+point.vx*5,point.y+point.vy*5);ctx.strokeStyle='#84a9ff';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#a8b1a8';ctx.font=`${Math.max(14,Math.round(W/canvas.clientWidth*8))}px monospace`;ctx.fillText('0.80 PULL / 0.001 DRAG / 15 RECOIL',22,H-20);
    }
    function step(){
      if(mode==='pull'){const dx=anchor.x-point.x,dy=anchor.y-point.y,d=Math.hypot(dx,dy)||1;point.vx+=dx/d*.8;point.vy+=dy/d*.8;}
      point.vx*=.999;point.vy=point.vy*.999+.38;
      const speed=Math.hypot(point.vx,point.vy);if(speed>24){point.vx*=24/speed;point.vy*=24/speed;}
      point.x+=point.vx;point.y+=point.vy;trail.push({x:point.x,y:point.y});frames++;
    }
    function tick(time){
      if(!last)last=time;
      accumulator+=Math.min(time-last,50);last=time;
      while(accumulator>=1000/60&&frames<75){step();accumulator-=1000/60;}
      draw();
      if(frames<75&&point.y<H-30&&point.x>20&&point.x<W-20)raf=requestAnimationFrame(tick);
      else document.querySelector('#demo-status').textContent='动作结束 · 可以重新选择，比较轨迹。';
    }
    init();draw();
    document.querySelectorAll('[data-mechanism]').forEach(button=>button.addEventListener('click',()=>{
      cancelAnimationFrame(raf);init();mode=button.dataset.mechanism;
      if(mode==='recoil'){point.vx-=Math.cos(-Math.PI/4)*15;point.vy-=Math.sin(-Math.PI/4)*15;}
      document.querySelector('#demo-status').textContent=({pull:'持续径向牵引，观察弧线如何改变。',release:'松开钩锁，保留初始切向速度。',recoil:'向右上方射击，获得反向速度脉冲。',reset:'选择一个动作，观察运动轨迹。'})[mode];
      draw();if(mode!=='reset')raf=requestAnimationFrame(tick);
    }));
    return ()=>cancelAnimationFrame(raf);
  }
})();
