// Shipping — print sizes, what they weigh packed, and what they cost to send,
// from data/shipping.json. A price the carrier's own list was not read for is
// null and shows as "not checked", never as a guess.
(() => {
  const $ = (id) => document.getElementById(id);
  const money = (n) => (n == null ? '<span class="nc">not checked</span>' : `$${Number(n).toFixed(2)}`);
  const range = (r, unit) => (Array.isArray(r) ? `${r[0]}–${r[1]} ${unit}` : '—');
  const oz = (r) => (Array.isArray(r) ? `${range(r, 'oz')} (${(r[0] / 16).toFixed(1)}–${(r[1] / 16).toFixed(1)} lb)` : '—');
  const src = (o) => (o.source_url ? ` <a href="${GH.esc(o.source_url)}" rel="noopener">source</a>${o.verified ? `, read ${GH.esc(o.verified)}` : ' — not checked'}` : '');

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const d = await GH.load('data/shipping.json');
      $('from').textContent = `Prices from ${d.from}, read ${d.generated}.`;
      $('tiers').innerHTML = d.tiers.map((t) => `
        <tr>
          <th scope="row">${GH.esc(t.name)}<small>${GH.esc(t.fits)}</small></th>
          <td>${GH.esc(t.example)}</td>
          <td>PLA ${range(t.grams?.pla, 'g')}${t.grams?.petg ? `<br>PETG ${range(t.grams.petg, 'g')}` : ''}</td>
          <td>${t.box?.in ? `${t.box.in.join(' × ')} in` : '—'}</td>
          <td>${oz(t.packed_oz)}${t.billed_lb ? `<small>billed as ${GH.esc(t.billed_lb)}${/lb|oz/.test(t.billed_lb) ? '' : ' lb'}</small>` : ''}</td>
          <td>${GH.esc(t.service)}</td>
          ${['zone2', 'zone5', 'zone8'].map((z) => `<td>${money(t.prices?.[z])}${t.retail_prices ? `<small>retail ${money(t.retail_prices[z])}</small>` : ''}</td>`).join('')}
        </tr>${t.note ? `<tr class="ship-note"><td colspan="9">${GH.esc(t.note)}</td></tr>` : ''}`).join('');
      $('carriers').innerHTML = (d.carriers || []).map((c) => `<li><h4>${GH.esc(c.name)}</h4><p>${GH.esc(c.rule)}</p><p class="fine-print">${src(c)}</p></li>`).join('');
      $('cannot').innerHTML = (d.cannot_ship || []).map((c) => `<li><h4>${GH.esc(c.what)}</h4><p>${GH.esc(c.why)}</p><p class="fine-print">${src(c)}</p></li>`).join('');
      $('intl').innerHTML = (d.international || []).map((c) => `<li>${typeof c === 'string' ? GH.esc(c) : `${GH.esc(c.rule || c.what || '')}${src(c)}`}</li>`).join('');
      $('method').textContent = d.method || '';
      $('notes').innerHTML = (d.notes || []).map((n) => `<li>${GH.esc(n)}</li>`).join('');
    } catch (err) {
      $('tiers').innerHTML = `<tr><td colspan="9">The shipping table did not load (${GH.esc(err.message)}).</td></tr>`;
    }
  });
})();
