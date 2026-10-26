(() => {
  'use strict';
  const {t} = window.I18n;
  let works = window.I18n.language === 'zh' ? window.WORKS : window.WORKS_EN;
  const collection = document.querySelector('.collection');
  const dialog = document.querySelector('#project-dialog');
  const content = document.querySelector('#dialog-content');
  let current = 0;
  let lastTrigger;
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
    if (work.originalScene) return `<div class="grapple-original-preview" role="img" aria-label="${t('Layered pixel city artwork from the original GameMaker project','GameMaker 原工程中的分层像素城市场景')}"><img src="assets/grapple-SprBgFar.webp" alt=""><img src="assets/grapple-SprBgMid.webp" alt=""><img src="assets/grapple-SprBgNear.webp" alt=""><span>GAMEMAKER / GML <i>${t('ORIGINAL PROJECT ASSETS','原工程场景素材')}</i></span></div>`;
    if (work.video) return `<video controls playsinline preload="metadata" poster="${asset(work.poster)}" aria-label="${escape(work.name)}${t(' — original film','原片')}"><source src="${asset(work.video)}" type="video/mp4">${t('Your browser cannot play this video.','浏览器暂不支持视频。')} <a href="${asset(work.video)}">${t('Open the original film','打开原片')}</a></video>`;
    if (work.demo === 'bitplane') return `<div class="bitplane-detail"><div class="bitplane-images">${[['rgb',t('RGB / ORIGINAL','RGB / 原图')],['msb',t('MSB / HIGH FOUR BITS','MSB / 高四位')],['lsb',t('LSB / LOW BITS, AMPLIFIED','LSB / 低四位放大')]].map(([id,label])=>`<figure><img src="${asset(`bitplane-${id}.webp`)}" width="224" height="224" alt="${label}"><figcaption>${label}</figcaption></figure>`).join('')}</div><p class="media-caption">${t('Input illustration · Different information in two bit planes of the same image','输入处理示意 · 同一图像在两种位平面中的不同信息')}</p></div>`;
    return `<img src="${asset(work.hero)}" alt="${escape(work.caption)}">`;
  }

  function renderProject(index,trigger,preserve = false) {
    const oldVideo = preserve ? content.querySelector('video') : null;
    const scroll = preserve ? dialog.scrollTop : 0;
    const notesOpen = preserve && content.querySelector('.detail-notes')?.open;
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

  function actionsFor(work) {
    if(work.url) return `<div class="detail-actions"><a class="action-primary" href="${escape(work.url)}" target="_blank" rel="noopener noreferrer">${t('Explore Metabolic Topology','在线体验代谢拓扑')} ↗</a><span>${t('Opens the original project','打开原项目网页')}</span></div>`;
    return '';
  }

  function localize() {
    works = window.I18n.language === 'zh' ? window.WORKS : window.WORKS_EN;
    updateFilterStatus();
    if (dialog.open) renderProject(current,undefined,true);
  }
  window.I18n.apply();
  document.addEventListener('languagechange',localize);
  localize();
  readRoute();

})();
