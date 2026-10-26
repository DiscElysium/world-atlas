(() => {
  'use strict';
  const {t, link: localizedLink} = window.I18n;
  let works = window.I18n.language === 'zh' ? window.WORKS : window.WORKS_EN;
  const collection = document.querySelector('.collection');
  const dialog = document.querySelector('#project-dialog');
  const content = document.querySelector('#dialog-content');
  let current = 0;
  let lastTrigger;
  const gameDialog = document.querySelector('#game-dialog');
  const gameMount = document.querySelector('#game-mount');
  let lastGameTrigger;
  const asset = name => `assets/${name}`;
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function updateFilterStatus() {
    const count = [...document.querySelectorAll('.chapter:not([hidden]) .work')].length;
    document.querySelector('#filter-status').textContent = t(`Showing ${count} projects`, `显示 ${count} 个项目`);
  }

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
      updateFilterStatus();
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
    if (work.playable) return `<div class="game-preview original-preview"><img src="assets/grapple-original-play.png" alt="${t('Original GameMaker gameplay: the pink pixel city, player, shotgun and movement diagnostics','GameMaker 原版实机画面：粉色像素城市、角色、霰弹枪与运动调试信息')}"><span class="original-preview-tag">${t('ORIGINAL GAMEMAKER BUILD','GAMEMAKER 原版实机画面')}</span></div>`;
    if (work.video) return `<video controls playsinline preload="metadata" poster="${asset(work.poster)}" aria-label="${escape(work.name)}${t(' — original film','原片')}"><source src="${asset(work.video)}" type="video/mp4">${t('Your browser cannot play this video.','浏览器暂不支持视频。')} <a href="${asset(work.video)}">${t('Open the original film','打开原片')}</a></video>`;
    if (work.demo === 'bitplane') return `<div class="bitplane-detail"><div class="bitplane-images">${[['rgb',t('RGB / ORIGINAL','RGB / 原图')],['msb',t('MSB / HIGH FOUR BITS','MSB / 高四位')],['lsb',t('LSB / LOW BITS, AMPLIFIED','LSB / 低四位放大')]].map(([id,label])=>`<figure><img src="${asset(`bitplane-${id}.webp`)}" width="224" height="224" alt="${label}"><figcaption>${label}</figcaption></figure>`).join('')}</div><p class="media-caption">${t('Input illustration · Different information in two bit planes of the same image','输入处理示意 · 同一图像在两种位平面中的不同信息')}</p></div>`;
    return `<img src="${asset(work.hero)}" alt="${escape(work.caption)}">`;
  }

  function renderProject(index,trigger,preserve = false) {
    const oldVideo = preserve ? content.querySelector('video') : null;
    const scroll = preserve ? dialog.scrollTop : 0;
    const notesOpen = preserve && content.querySelector('.detail-notes')?.open;
    const gameTriggerReplaced = preserve && content.contains(lastGameTrigger);
    if (!preserve) content.querySelectorAll('video').forEach(video => video.pause());
    current = (index + works.length) % works.length;
    const work = works[current];
    if (trigger) lastTrigger = trigger;
    document.querySelector('#dialog-position').textContent = `PROJECT ${work.number} / 07`;
    content.innerHTML = `<div class="detail-intro"><div><span class="detail-category">${escape(work.category)}</span><h2 id="dialog-title">${escape(work.name)}</h2><span class="detail-en">${escape(work.english)}</span><p class="detail-hook">${escape(work.hook)}</p><div class="detail-tags">${work.tags.map(t=>`<span>${escape(t)}</span>`).join('')}</div>${actionsFor(work)}</div><p class="detail-summary">${escape(work.summary)}</p></div><figure class="detail-main-media">${mediaFor(work)}<figcaption class="media-caption">${escape(work.caption)}</figcaption></figure><div class="detail-points">${work.points.map(([title,body],i)=>`<section class="detail-point"><span>0${i+1}</span><h3>${escape(title)}</h3><p>${escape(body)}</p></section>`).join('')}</div>${work.images.length?`<div class="detail-gallery">${work.images.map(([name,caption])=>`<figure><img src="${asset(name)}" alt="${escape(caption)}" loading="lazy"><figcaption>${escape(caption)}</figcaption></figure>`).join('')}</div>`:''}<details class="detail-notes"><summary>项目范围与材料说明</summary><p>${escape(work.notes)}</p></details>`;
    if (!dialog.open) {
      dialog.showModal();
      document.body.classList.add('dialog-open');
    }
    content.querySelector('.detail-notes summary').textContent = t('Project scope & source materials','项目范围与材料说明');
    content.querySelector('.detail-notes').open = Boolean(notesOpen);
    if (oldVideo) {
      const replacement = content.querySelector('video');
      oldVideo.setAttribute('aria-label',replacement.getAttribute('aria-label'));
      oldVideo.querySelector('a').textContent = t('Open the original film','打开原片');
      replacement.replaceWith(oldVideo);
    }
    if (gameTriggerReplaced) lastGameTrigger = content.querySelector('[data-play-game]');
    dialog.scrollTop = scroll;
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
    content.querySelectorAll('video').forEach(video => {video.pause();video.querySelectorAll('source').forEach(source=>source.removeAttribute('src'));video.removeAttribute('src');video.load();});
    if(gameDialog.open) closeGame();
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
    if(gameDialog.open) closeGame();
    const id=location.hash.replace('#project-','');
    const index=works.findIndex(w=>w.id===id);
    if(index>=0){if(!dialog.open||index!==current)renderProject(index);}
    else if(dialog.open)dialog.close();
  }
  window.addEventListener('popstate',readRoute);
  window.addEventListener('hashchange',readRoute);

  function actionsFor(work) {
    if(work.url) return `<div class="detail-actions"><a class="action-primary" href="${escape(work.url)}" target="_blank" rel="noopener noreferrer">${t('Explore Metabolic Topology','在线体验代谢拓扑')} ↗</a><span>${t('Opens the original project','打开原项目网页')}</span></div>`;
    if(work.playable) return `<div class="detail-actions"><button type="button" class="action-primary" data-play-game>${t('Play here','开始站内试玩')} →</button><a class="action-secondary" href="${localizedLink('game/index.html')}" target="_blank" rel="noopener noreferrer">${t('Open in new tab','独立窗口')} ↗</a></div>`;
    return '';
  }

  document.querySelector('.work-grapple').insertAdjacentHTML('beforeend','<button class="work-action" type="button" data-play-game></button>');
  const frameTitle = () => t('Grapple & Recoil — original GameMaker build','钩锁与霰弹 — GameMaker 原版');
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-play-game]');
    if(!trigger)return;
    lastGameTrigger=trigger;
    gameMount.innerHTML=`<iframe src="${localizedLink('game/index.html?embed=1')}" title="${frameTitle()}" allow="fullscreen" allowfullscreen></iframe>`;
    gameDialog.showModal();
    document.body.classList.add('dialog-open');
    document.querySelector('#close-game').focus({preventScroll:true});
  });
  function clearGame(){
    gameMount.replaceChildren();
    if(!dialog.open)document.body.classList.remove('dialog-open');
    if(lastGameTrigger?.isConnected)lastGameTrigger.focus({preventScroll:true});
  }
  function closeGame(){
    if(gameDialog.open)gameDialog.close();
    clearGame();
  }
  document.querySelector('#close-game').addEventListener('click',closeGame);
  gameDialog.addEventListener('close',clearGame);
  gameDialog.addEventListener('cancel',event=>{event.preventDefault();closeGame();});
  gameDialog.addEventListener('click',event=>{
    if(event.target!==gameDialog)return;
    const r=gameDialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeGame();
  });

  function localize() {
    works = window.I18n.language === 'zh' ? window.WORKS : window.WORKS_EN;
    updateFilterStatus();
    document.querySelector('.work-grapple > [data-play-game]').innerHTML = `${t('Play now','直接游玩')} <span aria-hidden="true">→</span>`;
    document.querySelector('.game-dialog-bar a').href = localizedLink('game/index.html');
    if (dialog.open) renderProject(current,undefined,true);
    const frame = gameMount.querySelector('iframe');
    if (frame) {
      frame.title = frameTitle();
      frame.contentWindow.postMessage({type:'portfolio-language',language:window.I18n.language},location.origin);
    }
  }
  window.I18n.apply();
  document.addEventListener('languagechange',localize);
  localize();
  readRoute();

})();
