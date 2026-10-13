// The arcade: data/games.json — every machine whose ROM its owner released
// through the MAME project. Download opens the machine's page on mamedev.org
// (their terms are ticked there); Play opens the zip the player saved, which
// is read in the browser and handed to the emulator — never uploaded, never
// stored, never cached.
(() => {
  const { esc, load } = window.GH;
  const $ = (id) => document.getElementById(id);
  let machines = [];
  let era = null;

  const ERAS = [['1970s', 1970, 1979], ['1980s', 1980, 1989], ['1990s and on', 1990, 2099]];
  const script = (src) => new Promise((ok, no) => {
    const el = document.createElement('script');
    el.src = src; el.onload = ok; el.onerror = no;
    document.head.append(el);
  });

  function render() {
    $('eras').innerHTML = [['All', 0, 9999], ...ERAS].map(([n]) =>
      `<button class="chip" type="button" data-era="${esc(n)}" aria-pressed="${(era || 'All') === n}">${esc(n)}</button>`).join('');
    const [, lo, hi] = [['All', 0, 9999], ...ERAS].find(([n]) => n === (era || 'All'));
    const shown = machines.filter((g) => g.year >= lo && g.year <= hi);
    $('arcade').innerHTML = shown.map((g) => `
      <li class="machine">
        <p class="year">${esc(g.year)}</p>
        <h4>${esc(g.title)}</h4>
        <p class="maker">${esc(g.maker)}</p>
        <div class="acts">
          <a class="btn" href="${esc(g.rom_from)}" target="_blank" rel="noopener">Download</a>
          ${g.playable && window.GHArcade
            ? `<label class="btn primary">Play<input type="file" accept=".zip" data-sets="${esc(g.sets.join(' '))}" data-title="${esc(g.title)}" hidden></label>`
            : ''}
        </div>
        <p class="credit" title="${esc(g.credit)}">Released free by ${esc(g.released_by)}. Non-commercial use.</p>
        ${g.note ? `<p class="credit"><b>Note:</b> ${esc(g.note)}</p>` : ''}
      </li>`).join('');
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-era]');
    if (!b) return;
    era = b.dataset.era === 'All' ? null : b.dataset.era;
    render();
  });

  document.addEventListener('change', async (e) => {
    const input = e.target.closest('input[type=file][data-sets]');
    if (!input || !input.files[0]) return;
    const file = input.files[0];
    const sets = input.dataset.sets.split(' ');
    const name = file.name.toLowerCase().replace(/\.zip$/, '').replace(/\s*\(\d+\)$/, '');
    const driver = sets.includes(name) ? name : sets[0];
    const cab = $('cabinet');
    cab.hidden = false;
    cab.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('cab-msg').textContent = `Starting ${input.dataset.title}…`;
    try {
      await window.GHArcade.boot(driver, file, $('screen'));
      $('cab-msg').textContent = `${input.dataset.title} — 5 is a coin, 1 starts.`;
    } catch (err) {
      $('cab-msg').textContent = `It would not start: ${err.message || err}`;
    }
    input.value = '';
  });

  document.addEventListener('DOMContentLoaded', async () => {
    let data;
    try { data = await load('data/games.json'); }
    catch { $('arcade').innerHTML = '<li><p>Being set up — check back soon.</p></li>'; return; }
    machines = data.arcade || [];
    if (data.controls) $('controls').textContent = data.controls;
    const mb = (n) => `${n >= 1e8 ? Math.round(n / 1e6) : (n / 1e6).toFixed(1)} MB`;
    $('dl').innerHTML = (data.downloads || []).map((g) => `
      <li class="machine">
        <p class="year">${esc(g.year)}</p>
        <h4>${esc(g.title)}</h4>
        <p class="maker">${esc(g.maker)}</p>
        <p class="what">${esc(g.what)}</p>
        <div class="acts col">${g.files.map(([label, url, size]) => `<a class="btn primary" href="${esc(url)}" download>${esc(label)} · ${mb(size)}</a>`).join('')}</div>
        <p class="credit" title="${esc(g.licence)}">Free to share under the maker&#39;s own licence. Plays in <a href="${esc(g.player)}" rel="noopener">ScummVM</a>.</p>
      </li>`).join('');
    if (machines.some((g) => g.playable)) {
      try { await script('js/noblue.js'); await script('js/arcade.js'); } catch { /* Play buttons stay hidden */ }
    }
    render();
  });
})();
