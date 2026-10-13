// News — posts from data/news.json, newest first. Empty until Evan writes the
// first one; the page's look will be set to his liking then.
(() => {
  const $ = (id) => document.getElementById(id);
  const when = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const d = await GH.load('data/news.json');
      const posts = [...d.posts].sort((a, b) => b.date.localeCompare(a.date));
      if (!posts.length) {
        $('posts').innerHTML = '<li><h4>Nothing yet</h4><p>The first post is Evan&#39;s to write. Until then: what is new is on the <a href="events.html">events</a> calendar and in the <a href="store.html">store</a>.</p></li>';
        return;
      }
      $('posts').innerHTML = posts.map((p) => `
        <li><p class="date">${when(p.date)}</p><h4>${p.link ? `<a href="${GH.esc(p.link)}">${GH.esc(p.title)}</a>` : GH.esc(p.title)}</h4>
        <p>${GH.esc(p.body)}</p>${(p.tags || []).length ? `<p class="fine-print">${p.tags.map(GH.esc).join(' · ')}</p>` : ''}</li>`).join('');
    } catch (err) {
      $('posts').innerHTML = `<li><p>The news did not load (${GH.esc(err.message)}).</p></li>`;
    }
  });
})();
