# Changelog

## 0.3.0 — 2026-07-24
- New color palette: the six layers now run along a single perceptual gradient (Metadata → Resources →
  Structure → Responsible AI → Provenance → Semantic) instead of six unrelated hues. Fixes Structure
  and Provenance previously both reading as green.
- Link color is now its own token (`--link`), decoupled from the Metadata hue, so links stay clearly
  blue regardless of the layer palette.
- Legend is now a collapsible "Color key" (collapsed by default), so the dataset content is what you
  see first and the key no longer looks like data.
- Legend keys for layers a file doesn't contain are greyed out (hollow swatch + "not in this file"),
  so a metadata-only Croissant visibly shows which layers are empty.

## 0.2.0 — 2026-07-23
- Tab-scoped panel: the side panel now closes when you switch to a different tab (it belongs to the
  tab you opened it on). Click 🥐 again to open it on another tab. Implemented by having the panel
  close itself on tab switch, while keeping it globally enabled so opening stays reliable — this
  avoids the `open()`-after-`await` gesture bug that broke the earlier tab-scoping attempt.
- Note: Chrome only allows opening a side panel from a user click, so returning to the owner tab
  does not auto-restore the panel — that's a platform limit, not a bug.

## 0.1.1 — 2026-07-23
- Fix: side panel would not open (the tab-scoped experiment disabled the panel and called
  `sidePanel.open()` after an `await`, so it silently failed). The panel now opens reliably;
  it follows the active tab and shows cached results when you switch tabs.

## 0.1.0 — 2026-07-22
Initial public release.

- Side-panel viewer for ML Croissant metadata, color-coded by layer.
- Embedded W3C PROV-O provenance rendered as a top-down lineage.
- Opens a Croissant from: a web page that embeds one, a raw JSON URL tab, or a local file.
- Tab-scoped panel (auto hide/restore per tab); full-tab view for large datasets.
- Light + dark; single transparent toolbar icon.
- Permissions: sidePanel, scripting, activeTab, storage (no broad host access).
