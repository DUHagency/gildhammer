// The mock store: data/store.json rendered as shelves, a find box, and a cart
// kept in this browser. Nothing is sold; checkout says so.
(() => {
  const { esc, load, cart, saveCart } = window.GH;
  // The home page links #nordic #film #rc #games #car #repair
  // #kitchen #vanity #halloween #organize #props #replicas; each names a trade.
  const LANES = [
    ['nordic', 'Nordic', /nordic|norse|viking/i],
    ['film', 'Film and camera', /film|camera/i],
    ['rc', 'RC and drone', /\brc\b|drone|radio/i],
    ['games', 'Games', /game|board|chess|mini/i],
    ['car', 'Car', /car|auto|vehicle/i],
    ['repair', 'Household repair', /repair|household|home/i],
    ['kitchen', 'Kitchen and food-grade', /kitchen|food/i],
    ['vanity', 'Vanity and makeup', /vanity|makeup|beauty/i],
    ['halloween', 'Halloween masks', /halloween|mask|costume/i],
    ['organize', 'Organizing', /^organize$/],
    ['props', 'Movie props', /^props$/],
    ['replicas', 'Prop firearms', /^replicas$/],
  ];
  const $ = (id) => document.getElementById(id);
  let data = { categories: [], items: [] };
  let cat = 'all', lane = null, q = '';

  const laneOf = (it) => (LANES.find(([, , re]) => re.test(it.lane || '')) || [])[0] || null;
  const money = (n) => (typeof n === 'number' ? `$${n.toFixed(2)}` : '—');
  const basis = (it) => {
    if (!it.price_basis || it.price_basis === 'sample') return 'Sample price';
    const m = /^msrp-(\d{4}-\d{2}-\d{2})/.exec(it.price_basis);
    return m ? `List price on ${m[1]}` : esc(it.price_basis);
  };

  function chips() {
    $('cats').innerHTML = [['all', 'Everything'], ...data.categories.map((c) => [c.id, c.name])]
      .map(([id, name]) => `<button class="chip" type="button" data-cat="${esc(id)}" aria-pressed="${id === cat}">${esc(name)}</button>`).join('');
    const printed = data.items.some((it) => laneOf(it));
    $('lanes').hidden = !printed;
    $('lanes').innerHTML = LANES.map(([id, name]) => `<button class="chip" type="button" data-lane="${id}" aria-pressed="${id === lane}">${name}</button>`).join('');
  }

  function shelves() {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const shown = data.items.filter((it) => (cat === 'all' || it.category === cat)
      && (!lane || laneOf(it) === lane)
      && words.every((w) => [it.name, it.blurb, it.lane, ...(it.specs || [])].join(' ').toLowerCase().includes(w)));
    const catName = Object.fromEntries(data.categories.map((c) => [c.id, c.name]));
    $('count').textContent = `${shown.length} of ${data.items.length} items`;
    // The prop-firearm rules stand over that lane (16 CFR 1272; 27 CFR 478.11–.12).
    let law = $('lane-law');
    if (!law) { law = document.createElement('p'); law.id = 'lane-law'; law.className = 'lane-law'; $('goods').before(law); }
    law.hidden = lane !== 'replicas';
    law.innerHTML = '<strong>Props, never guns.</strong> Every piece is solid and cannot fire: no bore, no chamber, no action, no frame or receiver, nothing that converts. Each ships marked the way federal law asks (an orange muzzle plug or band, or a bright or clear body), unless it goes to a production holding a Consumer Product Safety Commission waiver for it. We never print gun parts, jigs or kits, and we never take an order to remove a marking.';
    $('goods').innerHTML = shown.map((it) => `
      <li class="tile good">
        <span class="cat">${esc(catName[it.category] || it.category)}${it.lane ? ` · ${esc((LANES.find(([id]) => id === laneOf(it)) || [])[1] || it.lane)}` : ''}</span>
        <h3>${esc(it.name)}</h3>
        <p>${esc(it.blurb)}</p>
        ${it.specs && it.specs.length ? `<ul>${it.specs.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
        <span class="price">${money(it.price)}</span>
        <span class="basis">${basis(it)}${it.source_url ? ` · <a href="${esc(it.source_url)}" rel="noopener">source</a>` : ''}</span>
        <button class="btn" type="button" data-add="${esc(it.id)}">Add to cart</button>
      </li>`).join('');
  }

  function drawCart() {
    const c = cart();
    const byId = Object.fromEntries(data.items.map((it) => [it.id, it]));
    const lines = Object.entries(c).filter(([id, n]) => byId[id] && n > 0);
    if (!lines.length) { $('cart-body').innerHTML = '<p class="intro">Empty.</p>'; return; }
    const total = lines.reduce((s, [id, n]) => s + (byId[id].price || 0) * n, 0);
    $('cart-body').innerHTML = `
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th></th></tr></thead><tbody>
      ${lines.map(([id, n]) => `<tr><td>${esc(byId[id].name)}</td><td>${n}</td><td>${money((byId[id].price || 0) * n)}</td><td><button class="btn" type="button" data-remove="${esc(id)}">Remove</button></td></tr>`).join('')}
      </tbody></table>
      <p class="total">Total ${money(total)}</p>
      <p class="notice"><strong>Checkout is not open.</strong> This is a sample store; nothing is charged or sent.</p>`;
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.cat) { cat = t.dataset.cat; chips(); shelves(); }
    else if (t.dataset.lane) { lane = lane === t.dataset.lane ? null : t.dataset.lane; if (lane) cat = 'all'; chips(); shelves(); }
    else if (t.dataset.add) { const c = cart(); c[t.dataset.add] = (c[t.dataset.add] || 0) + 1; saveCart(c); drawCart(); t.textContent = 'Added'; setTimeout(() => { t.textContent = 'Add to cart'; }, 900); }
    else if (t.dataset.remove) { const c = cart(); delete c[t.dataset.remove]; saveCart(c); drawCart(); }
  });

  document.addEventListener('DOMContentLoaded', async () => {
    $('find').addEventListener('input', (e) => { q = e.target.value; shelves(); });
    try { data = await load('data/store.json'); }
    catch { $('count').textContent = 'The shelves are still being stocked — check back soon.'; return; }
    const h = location.hash.slice(1);
    if (LANES.some(([id]) => id === h)) lane = h;
    chips(); shelves(); drawCart();
  });
})();
