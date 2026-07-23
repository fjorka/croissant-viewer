/* Side panel (tab-scoped): render the Croissant for the tab it belongs to.
   On (re)show it uses the per-tab cache so a restored panel shows the right content;
   a fresh 🥐 click triggers a live scan. No URL box, no host permissions — activeTab only. */

// Injected into the page (self-contained). Returns {croissant} or {none, host}.
async function scanFn(){
  const looks = o => {
    if(!o || typeof o !== "object") return false;
    const c = o.conformsTo || o["dct:conformsTo"] || "";
    return String(c).includes("mlcommons.org/croissant") || !!(o.recordSet || o["cr:recordSet"]);
  };
  for(const s of document.querySelectorAll('script[type="application/ld+json"]')){
    try{ const j = JSON.parse(s.textContent);
      for(const o of (Array.isArray(j)?j:[j])){ if(looks(o)) return {croissant:o}; } }catch(e){}
  }
  const ct = document.contentType || "";
  const bodyTxt = (document.body && document.body.innerText || "").trim();
  if(/json/.test(ct) || (bodyTxt.startsWith("{") && bodyTxt.endsWith("}"))){
    try{ const t = await (await fetch(location.href)).text(); const o = JSON.parse(t); if(looks(o)) return {croissant:o}; }catch(e){}
    try{ const o = JSON.parse(bodyTxt); if(looks(o)) return {croissant:o}; }catch(e){}
  }
  return {none:true, host: location.host};
}

async function getCache(tabId){ try{ const {cache={}} = await chrome.storage.session.get("cache"); return cache[tabId]; }catch(e){ return null; } }
async function setCache(tabId, obj){ try{ const {cache={}} = await chrome.storage.session.get("cache"); cache[tabId]=obj; await chrome.storage.session.set({cache}); }catch(e){} }
async function activeTabId(){ try{ const [t]=await chrome.tabs.query({active:true,currentWindow:true}); return t && t.id; }catch(e){ return undefined; } }

function show(obj){ render(obj); window.__current = obj; }

async function scanTab(tabId){
  document.getElementById("subtitle").textContent = "Scanning this tab…";
  let res;
  try{ const [r] = await chrome.scripting.executeScript({ target:{tabId}, func: scanFn }); res = r && r.result; }
  catch(e){ window.__current=null; showEmpty("This page can't be scanned. Use “Open file…”, or click 🥐 on a dataset page (e.g. a Hugging Face dataset)."); return; }
  if(res && res.croissant){ show(res.croissant); setCache(tabId, res.croissant); }
  else{
    window.__current = null;
    let msg = "No Croissant on this page. Click 🥐 on a page that embeds one (e.g. a Hugging Face dataset), open a raw croissant.json URL in Chrome and click 🥐, or use “Open file…”.";
    if(res && res.host && /kaggle\./.test(res.host))
      msg = "Kaggle serves its Croissant as a separate download, not in the page. Use its “Download Croissant” button, then “Open file…” here.";
    showEmpty(msg);
  }
}

async function refreshForActiveTab(){
  const tabId = await activeTabId();
  if(tabId == null){ showEmpty("Click the 🥐 toolbar icon on a page to scan it, or use “Open file…”."); return; }
  const { scanReq } = await chrome.storage.local.get("scanReq").catch(()=>({}));
  const fresh = scanReq && scanReq.tabId === tabId && (Date.now() - scanReq.at < 8000);
  if(fresh){ return scanTab(tabId); }
  const cached = await getCache(tabId);
  if(cached){ show(cached); return; }
  showEmpty("Click 🥐 to scan this page, or use “Open file…”.");
}

// A file opened from the panel goes to the FULL-TAB viewer (more room than the panel).
async function loadText(txt){
  let d; try{ d=JSON.parse(txt); }catch(e){ showEmpty("That file isn't valid JSON: "+e.message); return; }
  try{ await chrome.storage.local.set({croissant:d}); }catch(e){}
  chrome.tabs.create({ url: chrome.runtime.getURL("viewer.html") });
}

document.addEventListener("DOMContentLoaded", async () => {
  try{ const {theme} = await chrome.storage.local.get("theme"); if(theme) document.documentElement.setAttribute("data-theme", theme); }catch(e){}
  document.getElementById("theme").onclick = async () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try{ await chrome.storage.local.set({theme:next}); }catch(e){}
  };
  document.getElementById("file").onchange = e => { const f=e.target.files[0]; if(f){ const r=new FileReader(); r.onload=()=>loadText(r.result); r.readAsText(f); } };
  ["dragover","dragenter"].forEach(ev=>document.body.addEventListener(ev,e=>e.preventDefault()));
  document.body.addEventListener("drop", e=>{ e.preventDefault(); const f=e.dataTransfer.files[0]; if(f){ const r=new FileReader(); r.onload=()=>loadText(r.result); r.readAsText(f); } });
  document.getElementById("popout").onclick = async () => {
    if(window.__current){ try{ await chrome.storage.local.set({croissant: window.__current}); }catch(e){} }
    chrome.tabs.create({ url: chrome.runtime.getURL("viewer.html") });
    window.close();
  };

  // a new 🥐 click flags a tab to scan
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if(area === "local" && changes.scanReq && changes.scanReq.newValue){
      const tabId = await activeTabId();
      if(changes.scanReq.newValue.tabId === tabId) scanTab(changes.scanReq.newValue.tabId);
    }
  });
  // the page this panel belongs to navigated → clear stale content
  chrome.tabs.onUpdated.addListener(async (tid, info) => {
    if(info.status === "loading" && tid === await activeTabId()){
      window.__current = null; showEmpty("This page changed — click 🥐 to scan it.");
    }
  });

  refreshForActiveTab();
});
