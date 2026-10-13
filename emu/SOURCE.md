# The emulator in this folder

`gilds.js` and `gilds.wasm` are **MAME 0.289**, built unmodified for the browser by DUH on
2026-10-09. MAME is free software: the whole is licensed under the GNU General Public License,
version 2 or later, and many parts are under the 3-clause BSD licence. `COPYING.txt` in this
folder is MAME's own licence file.

## The corresponding source

- Source: https://github.com/mamedev/mame, tag `mame0289`, commit
  `f34f02505e32c1993c6a782b6814232cbfc74e36` (2026-07-30). No file was changed.
- Archive of that exact source: https://github.com/mamedev/mame/archive/refs/tags/mame0289.tar.gz
- Toolchain: Emscripten 6.0.12 (emsdk `latest`, 2026-10-09).
- Build command, run from the source root:

      emmake make -j10 SUBTARGET=gilds REGENIE=1 \
        SOURCES=src/mame/bally/gridlee.cpp,src/mame/videogames/supertnk.cpp,src/mame/bally/astrocde.cpp,src/mame/videogames/looping.cpp,src/mame/exidy/circus.cpp,src/mame/exidy/carpolo.cpp,src/mame/exidy/exidy.cpp,src/mame/exidy/starfire.cpp,src/mame/exidy/vertigo.cpp,src/mame/exidy/victory.cpp,src/mame/misc/goldnpkr.cpp,src/mame/williams/williams.cpp

If either link stops working, ask Gildhammer for the source through the quote form and we will
send it, as the GPL requires.

## What it plays

All 28 machines whose ROMs their owners released through
[mamedev.org/roms](https://www.mamedev.org/roms/): the Exidy games, the Video Klein games,
Robby Roto, Super Tank, Looping, Gridlee and Alien Arena. **No ROM is in this folder or anywhere on this site.** The player downloads it
from mamedev.org on mamedev's terms and opens it in the page, which reads it in the browser and
never sends it anywhere.
