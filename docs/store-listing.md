# Chrome Web Store listing — ready-to-paste copy

Use these when filling out the Developer Dashboard. Edit freely.

## Name
Croissant Viewer

## Summary (≤132 chars)
View ML Croissant dataset metadata in a side panel — the layers, files, and provenance, made
readable. From a page, a URL, or a file.

## Category
Developer Tools

## Detailed description
Croissant is an open metadata format (from MLCommons) for machine-learning datasets. Croissant files
are JSON-LD, which Chrome shows as raw text. Croissant Viewer renders them so a person can read them.

Click the toolbar icon on any page to open the side panel:

• On a dataset page that embeds Croissant (for example, Hugging Face or OpenML dataset pages), it
  renders that dataset's Croissant.
• On a raw croissant.json / .jsonld URL, it reads the tab and renders it.
• Or open a local .jsonld file, which opens in a full-tab view.

What you see is color-coded by the Croissant layers — Metadata, Resources (files), Structure (record
sets and fields), Responsible AI, Provenance, and Semantic links — with the embedded W3C PROV-O
provenance drawn as a readable top-down lineage and every identifier (ORCID, DOI, UniProt, GitHub
commit, ontology term) clickable.

The panel is tab-scoped: it belongs to the tab you opened it on, hides when you switch away, and
restores when you come back. A single transparent icon works in light and dark themes.

Everything renders locally in your browser. Nothing is uploaded anywhere.

## Permission justifications (for the dashboard)
- activeTab — Read the page you are currently viewing, only when you click the extension's icon, to
  find an embedded Croissant or read a raw Croissant JSON tab.
- scripting — Run the small detection/read script in that tab (paired with activeTab).
- sidePanel — Show the rendered Croissant in Chrome's side panel.
- storage — Remember your light/dark choice and cache the current tab's parsed Croissant so the
  panel can restore it. Local only.
- (No host permissions.) The extension does not request access to all sites and does not fetch
  arbitrary URLs.

## Data use / privacy
Single purpose: display Croissant dataset metadata. The extension does not collect, transmit, or sell
any user data. All processing happens locally in the browser. No remote servers, no analytics.

## Privacy policy (host this text somewhere and link it if the dashboard asks)
Croissant Viewer does not collect, store, or transmit any personal data. It reads a page only when you
click its icon, and only to locate and display Croissant metadata, which is rendered locally in your
browser. Nothing is sent to any server.
