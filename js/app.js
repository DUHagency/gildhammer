// Gildhammer — what every page shares: the mock cart's count in the bar, and
// the mock sign-in (login.html). The cart lives in this browser only; the store
// is a mock and takes nothing. The sign-in guards nothing either: it remembers a
// name for this tab so the bar can say who is in, until accounts are built.
window.GH = (() => {
  const KEY = 'gildhammer.cart';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const write = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* private window */ } paint(); };
  const paint = () => {
    const n = Object.values(read()).reduce((s, q) => s + q, 0);
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = n; });
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const load = async (path) => {
    const r = await fetch(path, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${path}: ${r.status}`);
    return r.json();
  };
  const UKEY = 'gildhammer.user';
  const user = () => { try { return sessionStorage.getItem(UKEY) || ''; } catch { return ''; } };
  const setUser = (name) => {
    try { if (name) sessionStorage.setItem(UKEY, name); else sessionStorage.removeItem(UKEY); } catch { /* private window */ }
    paintUser();
  };
  const paintUser = () => {
    const u = user();
    document.querySelectorAll('[data-login]').forEach((el) => { el.textContent = u ? `${u} · Account` : 'Log in'; });
  };
  document.addEventListener('DOMContentLoaded', () => { paint(); paintUser(); });
  return { cart: read, saveCart: write, esc, load, paint, user, setUser };
})();

// The language picker, 2026-10-09 (user: "add translation feature … for all
// nordic languages spoken today, dont translate the pages just add the
// graphic"). It is the graphic only: choosing a language marks it and says the
// translation is coming; no page text changes and nothing is sent anywhere.
// Each name is set in its own language, in our own faces, with the English
// name beneath it. The choice is remembered in this browser, nothing more.
(() => {
  const KEY = 'gildhammer.lang';
  const GROUPS = [
    ['English', [['en', 'English', 'English']]],
    ['North Germanic', [
      ['da', 'Dansk', 'Danish'], ['sv', 'Svenska', 'Swedish'], ['nb', 'Norsk bokmål', 'Norwegian Bokmål'],
      ['nn', 'Norsk nynorsk', 'Norwegian Nynorsk'], ['is', 'Íslenska', 'Icelandic'], ['fo', 'Føroyskt', 'Faroese'],
      ['ovd', 'Övdalsk', 'Elfdalian']]],
    ['Finnic', [
      ['fi', 'Suomi', 'Finnish'], ['fit', 'Meänkieli', 'Tornedalen Finnish'], ['fkv', 'Kainun kieli', 'Kven']]],
    ['Sámi', [
      ['se', 'Davvisámegiella', 'Northern Sámi'], ['smj', 'Julevsámegiella', 'Lule Sámi'],
      ['sma', 'Åarjelsaemien gïele', 'Southern Sámi'], ['smn', 'Anarâškielâ', 'Inari Sámi'],
      ['sms', 'Nuõrttsääʹmǩiõll', 'Skolt Sámi']]],
    ['Inuit', [['kl', 'Kalaallisut', 'Greenlandic']]],
  ];
  const get = () => { try { return localStorage.getItem(KEY) || 'en'; } catch { return 'en'; } };
  const put = (v) => { try { localStorage.setItem(KEY, v); } catch { /* private window */ } };

  const build = (nav) => {
    const esc = window.GH.esc;
    const li = document.createElement('li');
    li.className = 'lang';
    const groups = GROUPS.map(([name, items], g) => `
      <li class="lang-group" role="presentation"><span class="lang-head" id="lang-g${g}">${esc(name)}</span>
        <ul class="lang-list" aria-labelledby="lang-g${g}">${items.map(([code, own, en]) => `
          <li><button type="button" class="lang-opt" lang="${code}" data-lang="${code}" aria-pressed="false">
            <span class="lang-own">${esc(own)}</span><span class="lang-en" lang="en">${esc(en)}</span></button></li>`).join('')}
        </ul></li>`).join('');
    li.innerHTML = `
      <button type="button" class="lang-btn" aria-expanded="false" aria-controls="lang-menu" aria-haspopup="true">
        <img src="img/translate.svg" alt="" width="22" height="22"><span>Translate</span></button>
      <div class="lang-menu" id="lang-menu" role="group" aria-label="Choose a language" hidden>
        <ul class="lang-groups">${groups}</ul>
        <p class="lang-note" role="status" aria-live="polite"></p>
      </div>`;
    nav.appendChild(li);
    const btn = li.querySelector('.lang-btn'), menu = li.querySelector('.lang-menu'), note = li.querySelector('.lang-note');
    const mark = (code) => li.querySelectorAll('.lang-opt').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === code)));
    const set = (open) => { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; };
    btn.addEventListener('click', () => set(menu.hidden));
    li.addEventListener('click', (e) => {
      const o = e.target.closest('.lang-opt');
      if (!o) return;
      const code = o.dataset.lang;
      put(code); mark(code);
      note.textContent = code === 'en' ? 'English is what the pages are written in.' : 'Translation coming. The pages stay in English for now.';
    });
    document.addEventListener('click', (e) => { if (!menu.hidden && !li.contains(e.target)) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
    mark(get());
  };
  document.addEventListener('DOMContentLoaded', () => { const nav = document.querySelector('.bar .nav'); if (nav) build(nav); });
})();
