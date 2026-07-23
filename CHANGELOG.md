# Changelog

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
