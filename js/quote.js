// Get a quote: the form posts to /api/quote. A photo is shrunk in the browser
// (longest side 1600 px, JPEG) so a phone picture travels in a second and
// never runs into the server's size cap.
(() => {
  const $ = (id) => document.getElementById(id);
  let photo = null;

  function shrink(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1600 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('That file is not a picture we can read.'));
      img.src = URL.createObjectURL(file);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('quote'), msg = $('q-msg'), send = $('q-send');
    const params = new URLSearchParams(location.search);
    if (params.get('lane')) $('q-lane').value = params.get('lane');

    $('q-photo').addEventListener('change', async (e) => {
      const f = e.target.files[0];
      photo = null; $('q-preview').hidden = true;
      if (!f) return;
      try {
        photo = await shrink(f);
        $('q-preview').src = photo; $('q-preview').hidden = false;
        msg.textContent = '';
      } catch (err) { msg.textContent = err.message; e.target.value = ''; }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      delete data.photo;
      if (!data.name.trim() || !data.contact.trim() || !data.what.trim()) {
        msg.textContent = 'Please give your name, a way to reach you, and what the part is for.';
        return;
      }
      if (photo) data.photo = photo;
      send.disabled = true; msg.textContent = 'Sending…';
      try {
        const r = await fetch('/api/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
        // GitHub Pages has no server: the form shows, but nothing can take a request there.
        if (r.status === 404 || r.status === 405) throw new Error('Quote requests are not open on this address yet. Nothing was sent.');
        const out = await r.json().catch(() => ({}));
        if (!r.ok || !out.ok) throw new Error(out.error || 'Something went wrong. Please try again.');
        form.reset(); photo = null; $('q-preview').hidden = true;
        msg.textContent = `Sent. Your request number is ${out.id}. We will reach you with a quote; you owe nothing until you say yes.`;
      } catch (err) { msg.textContent = err.message; }
      finally { send.disabled = false; }
    });
  });
})();
