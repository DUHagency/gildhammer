// Ohio makerspaces, game stores, comic shops and computer stores: the 88 counties drawn from the
// Census Bureau's own shapes (data/ohio-counties.json) and every place in
// data/makerspaces.json and data/stores.json on them.
// Our own map, not tiles: tiles paint water blue, and the blue lock forbids it.
(() => {
  const { esc, load } = window.GH;
  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  // Rune-stone colours: the site's own Nordic dye palette (style.css custom
  // properties), not raw hex, so this tracks the palette if it is retuned.
  // Every one passes the blue lock (blue never more than red or green), and
  // each kind still keeps its own shape, so nothing rests on hue alone —
  // two kinds share a shape only when their colour differs, and vice versa.
  const KINDS = {
    community:       ['Community makerspace', 'var(--weld)', 'diamond'],
    fablab:          ['Fab lab', 'var(--chalk)', 'square'],
    library:         ['Library maker lab', 'var(--ochre)', 'circle'],
    university:      ['College or university', 'var(--moorit)', 'triangle'],
    'school-museum': ['School or museum', 'var(--red-lead)', 'down'],
    'tool-library':  ['Tool library', 'var(--green-hi)', 'square'],
    'game-store':    ['Game store', 'var(--madder)', 'diamond'],
    'comic-store':   ['Comic or anime shop', 'var(--green-hi)', 'triangle'],
    'computer-store': ['Computer store', 'var(--madder)', 'down'],
    other:           ['Other', 'var(--red-lead)', 'circle'],
  };
  const kindOf = (p) => (KINDS[p.kind] ? p.kind : 'other');
  let places = [], on = new Set(Object.keys(KINDS)), q = '', proj;

  function projection(counties) {
    let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
    const walk = (c) => (typeof c[0] === 'number' ? (x0 = Math.min(x0, c[0]), x1 = Math.max(x1, c[0]), y0 = Math.min(y0, c[1]), y1 = Math.max(y1, c[1])) : c.forEach(walk));
    counties.forEach((k) => walk(k.coordinates));
    const k = Math.cos(((y0 + y1) / 2) * Math.PI / 180), W = 1000, s = W / ((x1 - x0) * k), H = (y1 - y0) * s;
    return { W, H, xy: ([lon, lat]) => [((lon - x0) * k * s).toFixed(1), ((y1 - lat) * s).toFixed(1)] };
  }

  function drawCounties(counties) {
    const svg = $('map');
    svg.setAttribute('viewBox', `-10 -10 ${proj.W + 20} ${proj.H + 20}`);
    const ring = (r) => 'M' + r.map(proj.xy).map((p) => p.join(' ')).join('L') + 'Z';
    const g = document.createElementNS(NS, 'g');
    for (const c of counties) {
      const polys = c.type === 'MultiPolygon' ? c.coordinates : [c.coordinates];
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', polys.map((p) => p.map(ring).join('')).join(''));
      path.setAttribute('class', 'county');
      const t = document.createElementNS(NS, 'title'); t.textContent = `${c.name} County`;
      path.appendChild(t); g.appendChild(path);
    }
    svg.appendChild(g);
    const pins = document.createElementNS(NS, 'g'); pins.id = 'pins'; svg.appendChild(pins);
  }

  function shape(kind, x, y) {
    const [, color, form] = KINDS[kind], r = 7;
    let el;
    if (form === 'circle') { el = document.createElementNS(NS, 'circle'); el.setAttribute('cx', x); el.setAttribute('cy', y); el.setAttribute('r', r - 1); }
    else {
      const pts = { diamond: [[0, -r], [r, 0], [0, r], [-r, 0]], square: [[-r + 1, -r + 1], [r - 1, -r + 1], [r - 1, r - 1], [-r + 1, r - 1]], triangle: [[0, -r], [r, r - 1], [-r, r - 1]], down: [[-r, -r + 1], [r, -r + 1], [0, r]] }[form];
      el = document.createElementNS(NS, 'polygon'); el.setAttribute('points', pts.map(([a, b]) => `${+x + a},${+y + b}`).join(' '));
    }
    el.style.fill = color; el.setAttribute('class', 'pin');
    return el;
  }

  const visible = () => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return places.filter((p) => on.has(kindOf(p)) && words.every((w) => [p.name, p.city, p.county, p.address].join(' ').toLowerCase().includes(w)));
  };

  function draw() {
    const shown = visible();
    const pins = $('pins'); pins.innerHTML = '';
    const tip = $('tip');
    for (const p of shown) {
      if (typeof p.lat !== 'number' || typeof p.lon !== 'number') continue;
      const [x, y] = proj.xy([p.lon, p.lat]);
      const el = shape(kindOf(p), x, y);
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `${p.name}, ${p.city || ''}`);
      const show = () => {
        tip.innerHTML = `<strong>${esc(p.name)}</strong><br>${esc(KINDS[kindOf(p)][0])}<br>${esc([p.city, p.county].filter(Boolean).join(', '))}`;
        const box = $('map').getBoundingClientRect(), wrap = $('map').parentElement.getBoundingClientRect();
        const sx = box.width / (proj.W + 20);
        tip.style.left = `${Math.min(box.left - wrap.left + (+x + 10) * sx + 12, wrap.width - 200)}px`;
        tip.style.top = `${box.top - wrap.top + (+y + 10) * sx + 12}px`;
        tip.style.display = 'block';
      };
      el.addEventListener('mouseenter', show); el.addEventListener('focus', show);
      el.addEventListener('mouseleave', () => { tip.style.display = 'none'; }); el.addEventListener('blur', () => { tip.style.display = 'none'; });
      el.addEventListener('click', () => { const row = document.getElementById(`p-${places.indexOf(p)}`); if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
      pins.appendChild(el);
    }
    $('count').textContent = `${shown.length} of ${places.length} places`;
    const byCounty = {};
    for (const p of shown) (byCounty[p.county || 'County not recorded'] ||= []).push(p);
    $('list').innerHTML = Object.keys(byCounty).sort().map((c) => `
      <section class="group"><h3>${esc(c)}</h3><ul class="rows">
      ${byCounty[c].map((p) => `<li id="p-${places.indexOf(p)}"><h4>${p.url ? `<a href="${esc(p.url)}" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</h4>
        <p>${esc([p.address, p.city].filter(Boolean).join(', '))}</p>
        <div class="meta"><span><b>Kind</b> ${esc(KINDS[kindOf(p)][0])}</span>${p.verified ? `<span><b>Checked</b> ${esc(p.verified)}</span>` : '<span>Not yet confirmed on its own page</span>'}</div></li>`).join('')}
      </ul></section>`).join('');
  }

  function controls() {
    const present = new Set(places.map(kindOf));
    $('kinds').innerHTML = Object.entries(KINDS).filter(([k]) => present.has(k))
      .map(([k, [name]]) => `<button class="chip" type="button" data-kind="${k}" aria-pressed="${on.has(k)}">${name}</button>`).join('');
    $('legend').innerHTML = Object.entries(KINDS).filter(([k]) => present.has(k))
      .map(([, [name, color]]) => `<span><i style="background:${color}"></i>${name}</span>`).join('');
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button[data-kind]');
    if (!t) return;
    const k = t.dataset.kind;
    on.has(k) ? on.delete(k) : on.add(k);
    controls(); draw();
  });

  document.addEventListener('DOMContentLoaded', async () => {
    $('find').addEventListener('input', (e) => { q = e.target.value; draw(); });
    const { counties } = await load('data/ohio-counties.json');
    proj = projection(counties);
    drawCounties(counties);
    // Each file loads on its own, so one that fails never blanks the other.
    const link = (s) => (s.url ? `<a href="${esc(s.url)}" rel="noopener">${esc(s.name)}</a>` : esc(s.name));
    const credits = [];
    try {
      const d = await load('data/makerspaces.json');
      places = places.concat(d.places || []);
      credits.push(`Makerspaces compiled ${esc(d.generated || '')} from ${(d.sources || []).map(link).join(', ')}.`);
    } catch { /* drawn without them */ }
    try {
      const d = await load('data/stores.json');
      places = places.concat(d.places || []);
      // The ODbL credit is given once below, so the stores' own licence row is not repeated.
      const named = (d.sources || []).filter((s) => !/openstreetmap\.org\/copyright/.test(s.url || ''));
      credits.push(`Game, comic and computer stores compiled ${esc((d.generated || '').slice(0, 10))} from ${named.map(link).join(', ')}; what that coverage misses is said above.`);
    } catch { /* drawn without them */ }
    if (!places.length) { $('count').textContent = 'The list is still being compiled — the counties are drawn, the places come next.'; return; }
    $('sources').innerHTML = `${credits.join(' ')} County lines: U.S. Census Bureau (public domain). Some locations © <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap contributors</a>, available under the Open Database License. Know one we missed? <a href="quote.html">Tell us</a>.`;
    controls(); draw();
  });
})();
