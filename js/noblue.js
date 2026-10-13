// The blue lock on a game screen. An emulator paints its own palette, so its
// frames are drawn on a hidden canvas and copied to the one on the page with
// every pixel's blue held to the smaller of its red and green — the rule
// tools/check-blue.mjs holds the site's own colours to. Whites and greys pass
// unchanged; a blue sky becomes its grey, a purple its red.
(() => {
  function clamp(img) {
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const m = d[i] < d[i + 1] ? d[i] : d[i + 1];
      if (d[i + 2] > m) d[i + 2] = m;
    }
    return img;
  }

  // Copy src to dst through the clamp, every frame, until stop() is called.
  function mirror(src, dst) {
    const out = dst.getContext('2d', { willReadFrequently: true });
    const tmp = document.createElement('canvas');
    const tc = tmp.getContext('2d', { willReadFrequently: true });
    let on = true;
    (function frame() {
      if (!on) return;
      const w = src.width, h = src.height;
      if (w && h) {
        if (tmp.width !== w || tmp.height !== h) { tmp.width = w; tmp.height = h; }
        if (dst.width !== w || dst.height !== h) { dst.width = w; dst.height = h; }
        tc.drawImage(src, 0, 0);
        out.putImageData(clamp(tc.getImageData(0, 0, w, h)), 0, 0);
      }
      requestAnimationFrame(frame);
    })();
    return { stop() { on = false; } };
  }

  window.GHNoBlue = { clamp, mirror };
})();
