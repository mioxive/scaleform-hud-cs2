# scaleform-cs2

The Scaleform HUD ported to CS2.
Original work: https://github.com/abandonedpools/scaleform

![In game](https://i.imgur.com/rOLMGEw.jpeg)

## Project structure

```
scaleform-cs2.slnx        solution (VS 2026 XML format, x64)
scaleform-cs2.vcxproj     the hud.dll project (v145 toolset, C++20, x64)
main.cpp                  entry, the frame hook, HUD lifecycle
panorama.cpp              engine discovery, the RunFrame vtable hook
scripts.cpp               the js loader (reads from hud_scripts.h)
art.cpp                   the file://{hud}/ image channel (self-extracts PNGs to %TEMP%\scaleform)
hud.h                     shared declarations / every byte pattern
hud_assets.h              GENERATED - do not edit; run the build step or tools\make_assets.py
hud_scripts.h             GENERATED - do not edit; run the build step or tools\make_assets.py
thirdparty\minhook\       MinHook (include + sources, built into the dll)
js\                       the panorama modules, compiled into hud_scripts.h
art\                      source art + the two generated procedural PNGs (notice_bar, kill_badge); tools\make_assets.py embeds them into hud_assets.h and the debug build loads them from here
tools\make_assets.py      the asset + script generator (also wired as a vcxproj build step)
```

## Build

Open `scaleform-cs2.slnx` in Visual Studio and build Release|x64,
or from a developer prompt:

```
msbuild scaleform-cs2.slnx /p:Configuration=Release /p:Platform=x64
```

Output: `x64\Release\hud.dll`. The asset step runs `tools\make_assets.py` whenever the art
or js changes (needs `python` on PATH); `hud_assets.h` and `hud_scripts.h` are committed, so a
fresh checkout builds without python.

## JS

JS is packed directly into the DLL at build time — `tools\make_assets.py` reads every file
in `js\` and makes `hud_scripts.h` - a sorted array of byte blobs. The DLL loads them in
alphabetical order from the in-memory table, so there are no external files to ship.
