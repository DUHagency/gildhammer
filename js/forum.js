// The forum — the boards it will open with, from data/forum.json. Nothing can be
// posted yet; the forum is set up later (user, 2026-10-09).
(() => {
  const $ = (id) => document.getElementById(id);
  document.addEventListener('DOMContentLoaded', async () => {
    const u = GH.user();
    $('forum-who').innerHTML = u
      ? `Signed in as <strong>${GH.esc(u)}</strong>. You will post from here once the board opens.`
      : 'Reading will be open to everyone; posting will need an account. <a href="login.html">Log in</a>.';
    try {
      const d = await GH.load('data/forum.json');
      $('boards').innerHTML = d.boards.map((b) => `
        <li class="board">
          <div><h4>${GH.esc(b.name)}</h4><p>${GH.esc(b.about)}</p></div>
          <p class="board-n"><span>0</span> threads</p>
        </li>`).join('');
      $('rules').innerHTML = d.rules.map((r) => `<li>${GH.esc(r)}</li>`).join('');
    } catch (err) {
      $('boards').innerHTML = `<li><p>The boards did not load (${GH.esc(err.message)}).</p></li>`;
    }
  });
})();
