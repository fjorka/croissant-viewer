/* Service worker: the side panel is TAB-SCOPED — disabled by default, enabled only on the
   tab where you click 🥐. Chrome auto-hides it when you switch away and auto-restores it on
   return. Cached Croissants (per tab, in session storage) are dropped when that tab navigates,
   so a restored panel never shows stale content.
   The toolbar icon is a single transparent croissant, so no theme handling is needed. */

async function dropCache(tabId){
  try{ const {cache={}} = await chrome.storage.session.get("cache");
    if(cache[tabId]!==undefined){ delete cache[tabId]; await chrome.storage.session.set({cache}); } }catch(e){}
}

async function initDefaults(){
  // default: our panel is OFF everywhere; we enable it per tab on click
  try{ await chrome.sidePanel.setOptions({ enabled:false }); }catch(e){}
}
chrome.runtime.onInstalled.addListener(initDefaults);
chrome.runtime.onStartup.addListener(initDefaults);
initDefaults();

// click 🥐 → enable + open the panel for THIS tab, and flag it for scanning (activeTab granted)
chrome.action.onClicked.addListener(async (tab) => {
  try{ await chrome.sidePanel.setOptions({ tabId: tab.id, path: "sidepanel.html", enabled: true }); }catch(e){}
  try{ await chrome.sidePanel.open({ tabId: tab.id }); }catch(e){}
  try{ await chrome.storage.local.set({ scanReq: { tabId: tab.id, at: Date.now() } }); }catch(e){}
});

// a pinned tab navigated / closed → its cached Croissant is stale
chrome.tabs.onUpdated.addListener((tabId, info) => { if(info.status === "loading") dropCache(tabId); });
chrome.tabs.onRemoved.addListener((tabId) => dropCache(tabId));
