/* Service worker.
   Open the side panel when the toolbar icon is clicked. `sidePanel.open()` MUST be called
   synchronously inside the click gesture — so it's the first thing we do, before any await —
   and the panel is enabled by default via manifest "side_panel.default_path". Errors are
   logged (not swallowed) so problems are visible in this service worker's console. */

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId })
    .catch((e) => console.warn("[Croissant Viewer] sidePanel.open failed:", e));
  chrome.storage.local.set({ scanReq: { tabId: tab.id, at: Date.now() } })
    .catch((e) => console.warn("[Croissant Viewer] storing scanReq failed:", e));
});

/* Cache housekeeping: drop a tab's parsed Croissant when it navigates or closes,
   so a panel showing that tab never displays stale content. */
async function dropCache(tabId) {
  try {
    const { cache = {} } = await chrome.storage.session.get("cache");
    if (cache[tabId] !== undefined) { delete cache[tabId]; await chrome.storage.session.set({ cache }); }
  } catch (e) {}
}
chrome.tabs.onUpdated.addListener((tabId, info) => { if (info.status === "loading") dropCache(tabId); });
chrome.tabs.onRemoved.addListener((tabId) => dropCache(tabId));
