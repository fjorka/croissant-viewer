# Contributing

Thanks for your interest! This is a small, dependency-free Chrome extension — plain HTML, CSS, and
JavaScript, no build step.

## Project layout

```
croissant-viewer/
├── extension/            ← the loadable extension (this is what "Load unpacked" points at)
│   ├── manifest.json     ← extension declaration (permissions, entry points)
│   ├── background.js     ← service worker: opens the tab-scoped side panel
│   ├── sidepanel.html/js ← the side-panel UI + page detection
│   ├── viewer.html/js    ← the full-tab view (viewer-page.js is its script)
│   ├── render-engine.js  ← shared renderer (the six layers + provenance lineage)
│   ├── styles.css        ← shared styles (responsive for the narrow panel)
│   └── icons/            ← toolbar icons (transparent 🥐)
├── docs/                 ← screenshots + store-listing copy
└── scripts/build-zip.sh  ← packages extension/ into a store-uploadable zip
```

`render-engine.js` and `styles.css` are shared by both the side panel and the full-tab view, so a
change to the rendering appears in both.

## Developing

1. `chrome://extensions` → Developer mode → **Load unpacked** → select `extension/`.
2. Edit files. Click the ↻ reload button on the extension card to pick up changes (reload the panel
   too if it's open).
3. Test against: a Hugging Face dataset page, a raw `croissant.json` URL, and a local `.jsonld`.

## Building the store package (maintainers)

Package the `extension/` folder into an uploadable zip:

```bash
scripts/build-zip.sh    # writes croissant-viewer.zip
```

Upload that zip to the Chrome Web Store; ready-to-paste listing copy is in `docs/store-listing.md`.
For each release, bump `version` in `extension/manifest.json` (semver) and add a `CHANGELOG.md` entry.

## Pull requests

- Keep it dependency-free and framework-free unless there's a strong reason.
- Match the existing style (small vanilla functions, no bundler).
- Describe what you tested (which of the three open paths).

## Reporting issues

Please include your Chrome version, the page/URL or a sample Croissant file, and what you expected vs.
what happened.
