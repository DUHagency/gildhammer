// Free designs: data/designs.json — where free models live, and a starter
// shelf per trade with each model's licence and whether a print may be sold.
(() => {
  const { esc, load } = window.GH;
  const $ = (id) => document.getElementById(id);
  let data = { sources: [], starter: [] };
  let lane = null;

  const yesno = (v) => (v === true || v === 'yes' ? '<span class="yes">Prints may be sold</span>' : v === false || v === 'no' ? '<span class="no">Personal use only</span>' : '<span class="no">Check the model</span>');
  const link = (u, t) => (u ? `<a href="${esc(u)}" rel="noopener">${esc(t)}</a>` : esc(t));

  function starter() {
    const lanes = [...new Set(data.starter.map((d) => d.lane).filter(Boolean))];
    $('lanes').innerHTML = lanes.map((l) => `<button class="chip" type="button" data-lane="${esc(l)}" aria-pressed="${l === lane}">${esc(l)}</button>`).join('');
    const shown = data.starter.filter((d) => !lane || d.lane === lane);
    $('starter').innerHTML = shown.length ? shown.map((d) => `
      <li><h4>${link(d.url, d.title || d.name)}</h4>
      ${d.note || d.why ? `<p>${esc(d.note || d.why)}</p>` : ''}
      <div class="meta"><span><b>Trade</b> ${esc(d.lane)}</span><span><b>Licence</b> ${esc(d.licence || d.license || '—')}</span>${yesno(d.commercial ?? d.commercial_use)}${d.site || d.source ? `<span><b>On</b> ${esc(d.site || d.source)}</span>` : ''}${d.author ? `<span><b>By</b> ${esc(d.author)}</span>` : ''}${d.attribution_required ? '<span>Credit the author on anything sold</span>' : ''}${d.share_alike ? '<span>Changes share alike</span>' : ''}</div></li>`).join('')
      : '<li><p>Nothing on this shelf yet.</p></li>';
  }

  function sources() {
    $('sources').innerHTML = data.sources.map((s) => `
      <li><h4>${link(s.url, s.name)}</h4>
      <p>${esc(s.what || s.description || '')}</p>${s.commercial_detail ? `<p class="meta">${esc(s.commercial_detail)}</p>` : ''}
      <div class="meta">${s.licences || s.licenses ? `<span><b>Licences</b> ${esc([].concat(s.licences || s.licenses).join(', '))}</span>` : ''}${s.commercial ? `<span><b>Selling prints</b> ${esc(s.commercial)}</span>` : ''}${s.signup != null ? `<span><b>Sign-up</b> ${esc(s.signup === true ? 'needed' : s.signup === false ? 'not needed' : s.signup)}</span>` : ''}${s.verified ? `<span><b>Checked</b> ${esc(s.verified)}</span>` : ''}</div></li>`).join('');
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button[data-lane]');
    if (!t) return;
    lane = lane === t.dataset.lane ? null : t.dataset.lane;
    starter();
  });

  document.addEventListener('DOMContentLoaded', async () => {
    try { data = await load('data/designs.json'); }
    catch { $('starter').innerHTML = $('sources').innerHTML = '<li><p>Being compiled — check back soon.</p></li>'; return; }
    data.sources = data.sources || []; data.starter = data.starter || [];
    starter(); sources();
  });
})();
