// Downloads — Gildhammer's own design files, from data/downloads.json. Free to
// download; the licence on each says whether a print of it may be sold.
(() => {
  const $ = (id) => document.getElementById(id);
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const d = await GH.load('data/downloads.json');
      $('count').textContent = d.files.length ? `${d.files.length} design${d.files.length === 1 ? '' : 's'}` : '';
      if (!d.files.length) {
        $('files').innerHTML = '<li><h4>On the bench</h4><p>Our first designs are still being drawn and test-printed. Each will land here as a free download, with the printer settings we used and a licence that says whether you may sell what you print.</p><p>Until then, the <a href="designs.html">free designs</a> page lists the sites with thousands of models.</p></li>';
        return;
      }
      $('files').innerHTML = d.files.map((f) => `
        <li><h4>${GH.esc(f.name)}</h4><p>${GH.esc(f.what)}</p>
        <p class="fine-print">${(f.size_mm || []).join(' × ')} mm · about ${GH.esc(f.grams)} g · ${GH.esc(f.settings)}</p>
        <p class="fine-print">${GH.esc(f.licence || d.licence_default)} · prints ${f.sell_prints ? 'may' : 'may not'} be sold</p>
        <p><a class="btn" href="${GH.esc(f.file)}" download>Download ${GH.esc((f.formats || []).join(' / ').toUpperCase())}</a></p></li>`).join('');
    } catch (err) {
      $('files').innerHTML = `<li><p>The shelf did not load (${GH.esc(err.message)}).</p></li>`;
    }
  });
})();
