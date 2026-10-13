// The arcade: MAME, built from its tag to WebAssembly (site/emu/, GPL — the
// source is the tag named in site/emu/SOURCE.md), run on a canvas the player
// never sees; noblue.js copies each frame to the one on the page with blue
// held to min(red, green).
//
// THE ROM IS THE PLAYER'S. It is read from the file they chose with the File
// API and written into the emulator's in-memory filesystem. It is never sent
// anywhere, never stored, never cached: closing the tab is the end of it. That
// is the only arrangement mamedev's terms allow a site that is not mamedev.org.
(() => {
  let booted = false;

  function script(src) {
    return new Promise((ok, no) => {
      const s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = () => no(new Error(`could not load ${src}`));
      document.head.append(s);
    });
  }

  async function boot(driver, file, screen) {
    if (booted) { location.hash = driver; location.reload(); return; } // one machine per page load
    if (!/^[a-z0-9_]+$/.test(driver)) throw new Error('unknown machine');
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error('that is not a .zip file — open the zip from mamedev.org as downloaded');
    booted = true;

    const hidden = document.createElement('canvas');
    hidden.id = 'canvas';
    hidden.style.cssText = 'position:absolute;left:-10000px;top:0';
    document.body.append(hidden);
    // MAME draws through bgfx on WebGL, which clears its buffer once a frame is
    // shown; keep it, so the mirror reads the frame rather than a blank.
    const getContext = hidden.getContext.bind(hidden);
    hidden.getContext = (kind, attrs = {}) => getContext(kind, /webgl/.test(kind) ? { ...attrs, preserveDrawingBuffer: true } : attrs);

    window.Module = {
      canvas: hidden,
      arguments: [driver, '-rompath', '/roms', '-window', '-nomaximize', '-skip_gameinfo', '-video', 'bgfx', '-sound', 'js'],
      locateFile: (p) => `emu/${p}`,
      preRun: [() => {
        const FS = window.FS;
        FS.mkdir('/roms');
        FS.writeFile(`/roms/${driver}.zip`, bytes);
      }],
      print: () => {},
      printErr: (t) => console.debug('[mame]', t),
    };
    window.GHNoBlue.mirror(hidden, screen);
    // Keys typed on the page reach the emulator (SDL listens on the document).
    screen.tabIndex = 0;
    screen.focus();
    await script('emu/gilds.js');
  }

  window.GHArcade = { boot };
})();
