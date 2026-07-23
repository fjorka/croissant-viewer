/* Full-tab viewer: shows the Croissant handed over from the panel's ⤢ pop-out
   (via chrome.storage), or one you open / drop here. No URL fetching. */
function loadText(t){ try{ render(JSON.parse(t)); }catch(e){ showEmpty("Not valid JSON: "+e.message); } }

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("theme").onclick = () => {
    const r=document.documentElement; r.setAttribute("data-theme", r.getAttribute("data-theme")==="dark"?"light":"dark");
  };
  document.getElementById("file").onchange = e => { const f=e.target.files[0]; if(f){ const r=new FileReader(); r.onload=()=>loadText(r.result); r.readAsText(f); } };
  ["dragover","dragenter"].forEach(ev=>document.body.addEventListener(ev,e=>e.preventDefault()));
  document.body.addEventListener("drop", e=>{ e.preventDefault(); const f=e.dataTransfer.files[0]; if(f){ const r=new FileReader(); r.onload=()=>loadText(r.result); r.readAsText(f); } });

  try{
    if(typeof chrome!=="undefined" && chrome.storage){
      const s = await chrome.storage.local.get("croissant");
      if(s.croissant){ render(s.croissant); return; }
    }
  }catch(e){}
  if(window.__CROISSANT__){ render(window.__CROISSANT__); return; }
  showEmpty("Open a Croissant: choose a file, or drop one here.");
});
