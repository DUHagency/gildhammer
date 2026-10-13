// Events: data/events.json drawn as a month calendar, the month's agenda, the
// weekly game nights in Ohio stores, and the finders that cover everywhere
// else. Every date was read on the organiser's own page (source_url).
(() => {
  const { esc, load } = window.GH;
  const $ = (id) => document.getElementById(id);
  const KINDS = {
    comic: 'Comic and pop culture', anime: 'Anime', toy: 'Toys and collectibles', scifi: 'Sci-fi and fantasy',
    wargame: 'Warhammer and wargames', rpg: 'D&D and roleplaying', boardgame: 'Board games', card: 'Card games', paint: 'Painting nights',
  };
  const NEAR = new Set(['IN', 'MI', 'KY', 'WV', 'PA']);
  const REGIONS = [['all', 'Everywhere'], ['near', 'Ohio and nearby'], ['oh', 'Ohio']];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  let data = { events: [], weekly: [], finders: [] };
  let on = new Set(Object.keys(KINDS)), region = 'all';
  const now = new Date(); now.setHours(0, 0, 0, 0);
  let year = now.getFullYear(), month = now.getMonth();

  const day = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const kindOf = (e) => (KINDS[e.kind] ? e.kind : 'comic');
  const inRegion = (e) => region === 'all' || e.state === 'OH' || (region === 'near' && NEAR.has(e.state));
  const shown = (e) => on.has(kindOf(e)) && inRegion(e);
  const place = (e) => [e.venue, [e.city, e.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ');
  const span = (e) => {
    const a = day(e.start), b = day(e.end || e.start);
    const f = (d, y) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}${y ? `, ${d.getFullYear()}` : ''}`;
    return +a === +b ? f(a, true) : `${f(a, a.getFullYear() !== b.getFullYear())} – ${a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear() ? b.getDate() : f(b)}, ${b.getFullYear()}`;
  };

  function chips() {
    $('kinds').innerHTML = Object.entries(KINDS)
      .filter(([k]) => data.events.some((e) => kindOf(e) === k) || data.weekly.some((w) => w.kind === k))
      .map(([k, name]) => `<button class="chip k-${k}" type="button" data-kind="${k}" aria-pressed="${on.has(k)}"><span class="kind-mark"></span>${name}</button>`).join('');
    $('regions').innerHTML = REGIONS.map(([id, name]) => `<button class="chip" type="button" data-region="${id}" aria-pressed="${id === region}">${name}</button>`).join('');
  }

  function grid() {
    $('month').textContent = `${MONTHS[month]} ${year}`;
    const first = new Date(year, month, 1), start = new Date(year, month, 1 - first.getDay());
    const evs = data.events.filter(shown);
    let html = DAYS.map((d) => `<div class="dow">${d.slice(0, 3)}</div>`).join('');
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      if (i === 35 && d.getMonth() !== month) break;
      const s = iso(d);
      const here = evs.filter((e) => e.start <= s && (e.end || e.start) >= s);
      const cls = [d.getMonth() !== month && 'out', +d === +now && 'today'].filter(Boolean).join(' ');
      html += `<div class="${cls}"><span class="d">${d.getDate()}</span>${here.slice(0, 3).map((e) => `<a class="ev k-${kindOf(e)}" href="#${esc(e.id)}" title="${esc(e.name)} — ${esc(place(e))}">${esc(e.name)}</a>`).join('')}${here.length > 3 ? `<span class="more-ev">+${here.length - 3} more</span>` : ''}</div>`;
    }
    $('cal').innerHTML = html;

    const m0 = iso(new Date(year, month, 1)), m1 = iso(new Date(year, month + 1, 0));
    const list = evs.filter((e) => e.start <= m1 && (e.end || e.start) >= m0).sort((a, b) => a.start.localeCompare(b.start));
    $('agenda').innerHTML = list.length ? list.map(row).join('') : '<li><p>Nothing on the calendar this month for what is chosen above. Try another month, or the finders below.</p></li>';
    $('count').textContent = `${list.length} this month · ${evs.filter((e) => (e.end || e.start) >= iso(now)).length} ahead in all`;
  }

  const row = (e) => `
    <li id="${esc(e.id)}" class="k-${kindOf(e)}">
      <span class="when">${span(e)}</span>
      <div><h4><a href="${esc(e.url)}" rel="noopener">${esc(e.name)}</a></h4>
      <p>${esc(place(e))}${e.note ? ` — ${esc(e.note)}` : ''}</p>
      <p class="meta"><span><b>Kind</b> ${esc(KINDS[kindOf(e)])}</span><span><b>Checked</b> <a href="${esc(e.source_url || e.url)}" rel="noopener">${esc(e.verified || '')}</a></span><span><button class="btn ics" type="button" data-ics="${esc(e.id)}">Add to my calendar</button></span></p></div>
    </li>`;

  function nights() {
    const w = data.weekly.filter((n) => on.has(n.kind) || !KINDS[n.kind]);
    const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const by = {};
    for (const n of w) (by[n.day] ||= []).push(n);
    const days = order.filter((d) => by[d]).concat(Object.keys(by).filter((d) => !order.includes(d)));
    $('nights').innerHTML = days.length ? days.map((d) => `
      <section><h4>${esc(d)}</h4><ul>${by[d].sort((a, b) => (a.city || '').localeCompare(b.city || '')).map((n) => `
        <li><b>${esc(n.name)}</b>${n.time ? ` · ${esc(n.time)}` : ''}${n.cadence && n.cadence !== 'weekly' ? ` · ${esc(n.cadence.replace(/-/g, ' '))}` : ''}<br>
        <a href="${esc(n.url || n.source_url)}" rel="noopener">${esc(n.store)}</a>, ${esc(n.city)}
        <span class="meta"><span><b>Checked</b> <a href="${esc(n.source_url || n.url)}" rel="noopener">${esc(n.verified || '')}</a></span></span></li>`).join('')}</ul></section>`).join('')
      : '<p class="intro" style="grid-column:1/-1">No weekly nights for what is chosen above.</p>';
  }

  function finders() {
    $('finders').innerHTML = data.finders.map((f) => `
      <li><h4><a href="${esc(f.url)}" rel="noopener">${esc(f.name)}</a></h4><p>${esc(f.what)}</p>
      <div class="meta"><span><b>For</b> ${esc(f.kind === 'all' || !KINDS[f.kind] ? 'every kind of game' : KINDS[f.kind])}</span></div></li>`).join('');
  }

  // One event as an .ics file, made in the browser: all-day, start to end.
  function ics(e) {
    const d = (s) => s.replace(/-/g, '');
    const end = day(e.end || e.start); end.setDate(end.getDate() + 1);
    const t = (s) => String(s || '').replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gildhammer//Events//EN', 'BEGIN:VEVENT',
      `UID:${e.id}@gildhammer`, `DTSTAMP:${d(iso(now))}T000000Z`, `DTSTART;VALUE=DATE:${d(e.start)}`, `DTEND;VALUE=DATE:${d(iso(end))}`,
      `SUMMARY:${t(e.name)}`, `LOCATION:${t(place(e))}`, `URL:${t(e.url)}`, `DESCRIPTION:${t(`Dates read on ${e.source_url || e.url} on ${e.verified}. Check before you travel.`)}`,
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
    a.download = `${e.id}.ics`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const draw = () => { chips(); grid(); nights(); };

  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('button');
    if (!t) return;
    if (t.dataset.kind) { const k = t.dataset.kind; if (on.size === Object.keys(KINDS).length) on = new Set([k]); else if (on.has(k)) { on.delete(k); if (!on.size) on = new Set(Object.keys(KINDS)); } else on.add(k); draw(); }
    else if (t.dataset.region) { region = t.dataset.region; draw(); }
    else if (t.dataset.step) { month += +t.dataset.step; if (month < 0) { month = 11; year--; } if (month > 11) { month = 0; year++; } grid(); }
    else if (t.dataset.today !== undefined) { year = now.getFullYear(); month = now.getMonth(); grid(); }
    else if (t.dataset.ics) { const e = data.events.find((x) => x.id === t.dataset.ics); if (e) ics(e); }
  });

  document.addEventListener('DOMContentLoaded', async () => {
    try { data = await load('data/events.json'); }
    catch { $('count').textContent = 'The calendar is being filled — check back soon.'; return; }
    data.events = data.events || []; data.weekly = data.weekly || []; data.finders = data.finders || [];
    $('generated').textContent = data.generated || '';
    draw(); finders();
  });
})();
