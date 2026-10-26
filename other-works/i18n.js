/* Shared by the portfolio and its playable edition. English is the first-visit default. */
(() => {
  const key = 'wcr-portfolio-language';
  const valid = value => value === 'en' || value === 'zh';
  const requested = new URLSearchParams(location.search).get('lang');
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  let language = valid(requested) ? requested : valid(saved) ? saved : 'en';
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  if (valid(requested)) { try { localStorage.setItem(key, language); } catch {} }

  function apply(root = document) {
    const dictionary = window.SITE_TRANSLATIONS || {};
    root.querySelectorAll('[data-i18n]').forEach(element => {
      const entry = dictionary[element.dataset.i18n];
      if (entry) element.innerHTML = entry[language];
    });
    root.querySelectorAll('[data-i18n-attrs]').forEach(element => {
      for (const [attribute, id] of Object.entries(JSON.parse(element.dataset.i18nAttrs))) {
        const entry = dictionary[id];
        if (entry) element.setAttribute(attribute, entry[language]);
      }
    });
    root.querySelectorAll('[data-language]').forEach(button => {
      const selected = button.dataset.language === language;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('active', selected);
    });
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }
  function setLanguage(next, persist = true) {
    if (!valid(next) || next === language) return;
    language = next;
    if (persist) { try { localStorage.setItem(key, language); } catch {} }
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', language);
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }
    apply();
    document.dispatchEvent(new CustomEvent('languagechange', {detail: {language}}));
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-language]');
    if (button) setLanguage(button.dataset.language);
  });
  window.addEventListener('storage', event => {
    if (event.key === key && valid(event.newValue)) setLanguage(event.newValue, false);
  });
  window.I18n = {
    get language() { return language; },
    t: (en, zh) => language === 'zh' ? zh : en,
    apply, setLanguage,
    link(path) {
      const url = new URL(path, location.href);
      url.searchParams.set('lang', language);
      return url.pathname + url.search + url.hash;
    }
  };
})();
