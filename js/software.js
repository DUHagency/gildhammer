// Open-source software: data/software.json — groups of programs, each with
// its licence as read from its own repository.
(() => {
  const { esc, load } = window.GH;
  const $ = (id) => document.getElementById(id);
  let data = { groups: [], closed_but_free: [] };
  let group = 'all', q = '';

  const FIT = { yes: 'yes', no: 'no', likely: 'likely' };
  const fit = (r) => (r ? [['P1S', r.bambu_p1s], ['X-Max 3', r.qidi_xmax3]].filter(([, v]) => v).map(([m, v]) => `${m}: ${esc(FIT[v] || v)}`).join(' · ') : '');
  const row = (it) => {
    const url = it.official_url || it.url, repo = it.repo_url || it.repo;
    const rel = it.latest_release || it.release;
    return `
    <li><h4>${url ? `<a href="${esc(url)}" rel="noopener">${esc(it.name)}</a>` : esc(it.name)}</h4>
    <p>${esc(it.purpose || it.what || it.description || '')}</p>
    ${it.note ? `<p class="meta">${esc(it.note)}</p>` : ''}
    <div class="meta">
      ${it.license || it.licence ? `<span><b>Licence</b> ${esc(it.license || it.licence)}</span>` : ''}
      ${it.cost ? `<span><b>Cost</b> ${esc(it.cost)}</span>` : ''}
      ${it.platforms ? `<span><b>Runs on</b> ${esc([].concat(it.platforms).join(', '))}</span>` : ''}
      ${rel ? `<span><b>Release</b> ${esc(rel)}${it.release_date ? ` (${esc(it.release_date)})` : ''}</span>` : ''}
      ${repo ? `<span><a href="${esc(repo)}" rel="noopener">source</a></span>` : ''}
      ${fit(it.runs_with) ? `<span><b>Our printers</b> ${fit(it.runs_with)}</span>` : ''}
      ${it.verified ? `<span><b>Checked</b> ${esc(it.verified)}</span>` : ''}
    </div></li>`;
  };

  function draw() {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const match = (it) => words.every((w) => JSON.stringify(it).toLowerCase().includes(w));
    $('groups').innerHTML = [['all', 'Everything'], ...data.groups.map((g) => [g.id, g.name])]
      .map(([id, name]) => `<button class="chip" type="button" data-group="${esc(id)}" aria-pressed="${id === group}">${esc(name)}</button>`).join('');
    const html = data.groups.filter((g) => group === 'all' || g.id === group).map((g) => {
      const items = (g.items || []).filter(match);
      return items.length ? `<section class="group"><h3>${esc(g.name)}</h3><ul class="rows">${items.map(row).join('')}</ul></section>` : '';
    }).join('');
    $('list').innerHTML = html || '<p class="intro">Nothing matches.</p>';
    const closed = (data.closed_but_free || []).filter(match);
    $('closed').hidden = !closed.length || group !== 'all';
    $('closed-list').innerHTML = closed.map(row).join('');
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button[data-group]');
    if (t) { group = t.dataset.group; draw(); }
  });

  document.addEventListener('DOMContentLoaded', async () => {
    $('find').addEventListener('input', (e) => { q = e.target.value; draw(); });
    try { data = await load('data/software.json'); }
    catch { $('list').innerHTML = '<p class="intro">Being compiled — check back soon.</p>'; return; }
    data.groups = data.groups || [];
    draw();
  });
})();
