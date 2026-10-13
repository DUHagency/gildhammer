// Log in — a placeholder (user, 2026-10-09: "login user test pwd 123, login
// does nothing at the moment"). The one test account is written here in the
// open because nothing is behind it: signing in only puts the name in the bar
// for this tab. Real accounts will be checked by the server, never in a page.
(() => {
  const TEST = { name: 'test', password: '123' };
  const $ = (id) => document.getElementById(id);

  function show() {
    const u = GH.user();
    $('login').hidden = !!u;
    $('signed-in').hidden = !u;
    if (u) $('who').textContent = u;
  }

  document.addEventListener('DOMContentLoaded', () => {
    show();
    $('login').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('l-name').value.trim(), pw = $('l-pass').value;
      if (name === TEST.name && pw === TEST.password) {
        GH.setUser(name);
        $('l-msg').textContent = '';
        $('login').reset();
        show();
      } else {
        $('l-msg').textContent = 'That name and password do not match.';
      }
    });
    $('logout').addEventListener('click', () => { GH.setUser(''); show(); $('l-name').focus(); });
  });
})();
