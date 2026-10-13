// The home page's "Around the table soon": the next five events still to come
// (or running today) from data/events.json, nearest first, Ohio ahead of a tie.
(() => {
  const { esc, load } = window.GH;
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const when = (e) => {
    const [y, m, d] = e.start.split('-').map(Number), [, m2, d2] = (e.end || e.start).split('-').map(Number);
    return `${MON[m - 1]} ${d}${e.end && e.end !== e.start ? `–${m2 !== m ? `${MON[m2 - 1]} ` : ''}${d2}` : ''}, ${y}`;
  };
  document.addEventListener('DOMContentLoaded', async () => {
    const out = document.getElementById('soon-list');
    let data;
    try { data = await load('data/events.json'); } catch { out.innerHTML = '<li><p>The calendar is being filled — check back soon.</p></li>'; return; }
    const t = new Date(), today = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const next = (data.events || []).filter((e) => (e.end || e.start) >= today)
      .sort((a, b) => a.start.localeCompare(b.start) || (b.state === 'OH') - (a.state === 'OH')).slice(0, 5);
    out.innerHTML = next.length ? next.map((e) => `
      <li class="k-${esc(e.kind)}"><span class="when">${when(e)}</span>
      <div><h4><a href="${esc(e.url)}" rel="noopener">${esc(e.name)}</a></h4><p>${esc([e.venue, [e.city, e.state].filter(Boolean).join(', ')].filter(Boolean).join(' · '))}</p></div></li>`).join('')
      : '<li><p>Nothing ahead on the calendar yet.</p></li>';
  });
})();
