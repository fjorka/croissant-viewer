/* Croissant Viewer — shared render engine. Pure DOM rendering; no page wiring.
   Both the side panel and the full-tab viewer include this and call render()/showEmpty(). */

const bare = k => String(k).split(/[:#/]/).pop();
function pick(o, ...names){
  if(!o||typeof o!=="object") return undefined;
  for(const n of names){ if(o[n]!==undefined) return o[n]; }
  const want = names.map(bare);
  for(const k of Object.keys(o)){ if(want.includes(bare(k))) return o[k]; }
  return undefined;
}
const arr = x => x==null ? [] : (Array.isArray(x)?x:[x]);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function linkify(v){
  const s=String(v);
  if(/^https?:\/\//.test(s)){ let t=s.replace(/^https?:\/\//,""); if(t.length>48)t=t.slice(0,46)+"…"; return `<a href="${esc(s)}" target="_blank" rel="noopener">${esc(t)}</a>`; }
  return esc(s);
}
const typeOf = o => arr(pick(o,"@type")).map(bare).join("/");

function sec(cls, cvar, title, hint, bodyHTML){
  return `<section class="layer" style="--c:var(${cvar})">
    <div class="lhead"><span class="dot"></span><h2>${title}</h2></div>
    <div class="hint">${hint}</div>${bodyHTML}</section>`;
}

function renderMeta(d){
  const rows=[];
  const add=(k,v)=>{ if(v!=null&&v!=="") rows.push(`<div class="k">${k}</div><div class="v">${v}</div>`); };
  add("Name", esc(pick(d,"name")||""));
  add("Description", esc(pick(d,"description")||""));
  const url=pick(d,"url"); add("URL / DOI", url?linkify(url):null);
  add("Identifier", esc(pick(d,"alternateName","alternate_name")||""));
  const lic=pick(d,"license"); add("License", lic?linkify(lic):null);
  add("Version", esc(pick(d,"version")||""));
  add("Published", esc(pick(d,"datePublished","date_published")||""));
  const cr=arr(pick(d,"creator","creators")).map(c=>{
    const nm=esc(pick(c,"name")||""); const u=pick(c,"url","@id");
    return u?`<a href="${esc(u)}" target="_blank" rel="noopener">${nm}</a>`:nm;
  }).filter(Boolean);
  if(cr.length) add("Creators", cr.join(", "));
  const pub=arr(pick(d,"publisher")).map(p=>esc(pick(p,"name")||p)).join(", "); add("Publisher", pub||null);
  const mt=pick(d,"measurementTechnique"); add("Measurement", mt?esc(mt):null);
  const kws=arr(pick(d,"keywords"));
  let kwHTML=null;
  if(kws.length){ kwHTML=`<div class="chips">`+kws.map(k=>{
      const onto=/^(UBERON|NCBITaxon|CL|PATO)[:_]/i.test(k)||/:/.test(k);
      return `<span class="chip ${onto?"onto":""}">${esc(k)}</span>`;}).join("")+`</div>`; }
  let body=`<div class="kv">${rows.join("")}</div>`;
  if(kwHTML) body+=`<div style="margin-top:10px" class="k">Keywords</div>`+kwHTML;
  const isb=arr(pick(d,"isBasedOn","schema:isBasedOn"));
  if(isb.length) body+=`<div style="margin-top:10px"><span class="k">Protocols (isBasedOn)</span><div class="chips">`+
     isb.map(p=>`<span class="chip">${linkify(p)}</span>`).join("")+`</div></div>`;
  return sec("meta","--l-meta","① Metadata — what & who",
    "Identity of the dataset: name, description, license, DOI, authors, keywords.", body);
}

function renderRAI(d){
  const map=[["dataCollection","Data collection"],["dataCollectionType","Collection type"],
    ["dataCollectionRawData","Raw data"],["dataPreprocessingProtocol","Preprocessing"],
    ["personalSensitiveInformation","Sensitive information"],["dataLimitations","Limitations"],
    ["dataBiases","Biases"],["dataUseCases","Use cases"]];
  const parts=[];
  for(const [key,label] of map){
    const v=pick(d,"rai:"+key,key);
    if(v) parts.push(`<div class="box"><div class="bt">${label}</div><div class="prose">${esc(v)}</div></div>`);
  }
  if(!parts.length) return "";
  return sec("rai","--l-rai","④ Responsible AI (RAI) — how it was made & its limits",
    "How the data were collected, sensitive-data notes, and limitations.",
    `<div class="grid2">${parts.join("")}</div>`);
}

function renderAgents(act){
  const ags=arr(pick(act,"prov:wasAssociatedWith","wasAssociatedWith")).concat(arr(pick(act,"prov:used","used")));
  if(!ags.length) return "";
  const cells=ags.map(a=>{
    const t=typeOf(a); const nm=esc(pick(a,"name","schema:name")||pick(a,"@id")||"");
    const role=pick(a,"prov:role","role");
    const repo=pick(a,"schema:codeRepository","codeRepository"); const commit=pick(a,"hubmap:commit","commit");
    const id=pick(a,"@id");
    let label=nm;
    if(repo) label=`<a href="${esc(repo)}" target="_blank" rel="noopener">${nm}</a>`+(commit?` <span class="tag">@${esc(commit)}</span>`:"");
    else if(id&&/^https?:/.test(id)) label=`<a href="${esc(id)}" target="_blank" rel="noopener">${nm}</a>`;
    const kind = /Software/.test(t)?"software":/Organization/.test(t)?"org":/CreativeWork|Entity/.test(t)&&role==="protocol"?"protocol":"person";
    const meta = role?` · ${esc(role)}`:(kind==="software"?" · pipeline step":kind==="protocol"?" · protocol":"");
    return `<span class="ag"><b>${label}</b>${meta}</span>`;
  }).join("");
  return `<div class="agents">${cells}</div>`;
}
function renderActivity(act){
  const nm=esc(pick(act,"name","schema:name")||"Activity");
  const bits=[];
  const instr=pick(act,"hubmap:instrument"); if(instr) bits.push(["Instrument",esc(instr)]);
  const ab=pick(act,"hubmap:numberOfAntibodies"), rd=pick(act,"hubmap:numberOfImagingRounds"), ch=pick(act,"hubmap:numberOfChannels");
  const params=[ab&&`${ab} antibodies`, rd&&`${rd} imaging rounds`, ch&&`${ch} channels`].filter(Boolean).join(" · ");
  if(params) bits.push(["Parameters",params]);
  const t=pick(act,"prov:startedAtTime","startedAtTime"); if(t) bits.push(["When",esc(t)]);
  const kv=bits.map(([k,v])=>`<div class="k">${k}</div><div class="v">${v}</div>`).join("");
  return `<div class="node act"><div class="nt"><span class="badge act">activity</span>${nm}</div>`+
    (kv?`<div class="kv" style="margin-top:4px">${kv}</div>`:"")+renderAgents(act)+`</div>`;
}
function renderEntity(e){
  if(!e||typeof e!=="object") return "";
  const nm=esc(pick(e,"name","schema:name")||pick(e,"@id")||"entity");
  const id=pick(e,"@id");
  const dtype=pick(e,"hubmap:datasetType"); const scat=pick(e,"hubmap:sampleCategory"); const etype=pick(e,"hubmap:entityType");
  const label = (id&&/^https?:/.test(id))?`<a href="${esc(id)}" target="_blank" rel="noopener">${nm}</a>`:nm;
  const tag = dtype||scat||etype;
  const ccf=arr(pick(e,"hubmap:ccfAnnotations")).map(u=>"UBERON:"+String(u).split(/[_/]/).pop()).filter(x=>/\d/.test(x));
  const dim=pick(e,"hubmap:dimensions");
  let inner=`<div class="node"><div class="nt"><span class="badge">entity</span>${label}`+(tag?` <span class="tag">${esc(tag)}</span>`:"")+`</div>`;
  if(ccf.length) inner+=`<div class="chips" style="margin-top:5px">`+ccf.map(c=>`<span class="chip onto" style="--c:var(--l-prov)">${esc(c)}</span>`).join("")+`</div>`;
  if(dim&&(dim.x||dim.y||dim.z)) inner+=`<div class="prose">dimensions: ${esc(dim.x)}×${esc(dim.y)}×${esc(dim.z)} ${esc(dim.unit||"")}</div>`;
  const gen=pick(e,"prov:wasGeneratedBy","wasGeneratedBy");
  const der=pick(e,"prov:wasDerivedFrom","wasDerivedFrom");
  let nest="";
  if(gen) nest+=`<div class="rel">was generated by</div>`+renderActivity(gen);
  if(der) nest+=`<div class="rel">was derived from</div>`+renderEntity(der);
  if(nest) inner+=`<div class="nest">${nest}</div>`;
  return inner+`</div>`;
}
function renderProv(d){
  const gen=pick(d,"prov:wasGeneratedBy","wasGeneratedBy");
  const der=pick(d,"prov:wasDerivedFrom","wasDerivedFrom");
  const fwd=arr(pick(d,"hubmap:hasProcessedDataset"));
  const into=arr(pick(d,"hubmap:processedInto"));
  if(!gen&&!der&&!fwd.length&&!into.length) return "";
  let flow=`<div class="node" style="border-left-color:var(--l-meta);background:color-mix(in srgb,var(--l-meta) 6%,transparent)">
      <div class="nt"><span class="badge" style="background:color-mix(in srgb,var(--l-meta) 18%,transparent)">this dataset</span>${esc(pick(d,"name")||"")}</div></div>`;
  if(gen) flow+=`<div class="rel">was generated by</div>`+renderActivity(gen);
  if(der) flow+=`<div class="rel">was derived from</div>`+renderEntity(der);
  if(fwd.length){ flow+=`<div class="rel">has processed version(s)</div>`+fwd.map(f=>renderEntity(f)).join(""); }
  if(into.length){ flow+=`<div class="rel">was processed into</div>`+into.map(f=>renderEntity(f)).join(""); }
  return sec("prov","--l-prov","⑤ Provenance — the lineage (W3C PROV-O)",
    "Top-down: the dataset, the activity that produced it, and the chain it derives from.",
    `<div class="flow">${flow}</div>`);
}

function renderResources(d){
  const dist=arr(pick(d,"distribution"));
  let body;
  if(!dist.length){ body=`<div class="empty">No file objects — metadata-only Croissant (files not described).</div>`; }
  else body=`<table class="fields"><tr><th>File / set</th><th>Type</th><th>Format</th><th>Size</th></tr>`+
    dist.map(f=>{ const t=typeOf(f); const nm=esc(pick(f,"name")||pick(f,"@id")||"");
      const fmt=esc(pick(f,"encodingFormat","encoding_format")||""); const sz=pick(f,"contentSize","content_size");
      return `<tr><td>${nm}</td><td class="tag">${esc(t)}</td><td class="tag">${fmt}</td><td class="tag">${sz?esc(sz):"—"}</td></tr>`;
    }).join("")+`</table>`;
  return sec("res","--l-res","② Resources — the files",
    "The actual files (FileObject) or globbed groups (FileSet), with format, size, checksum.", body);
}
function renderStructure(d){
  const rs=arr(pick(d,"recordSet","record_set"));
  if(!rs.length) return sec("struct","--l-struct","③ Structure — fields inside the files","Columns/fields of each data table (RecordSet).",
    `<div class="empty">No record sets described.</div>`);
  const blocks=rs.map(r=>{
    const nm=esc(pick(r,"name")||"");
    const fields=arr(pick(r,"field","fields"));
    const rows=fields.map(f=>{
      const fn=esc(pick(f,"name")||"");
      const dt=arr(pick(f,"dataType","data_type")).map(x=>{ const s=String(x);
        return /^https?:/.test(s)?`<a href="${esc(s)}" target="_blank" rel="noopener" style="color:var(--l-sem)">${esc(bare(s))}</a>`:`<span class="tag">${esc(s)}</span>`;
      }).join(" ");
      const eq=pick(f,"equivalentProperty","equivalent_property");
      const sem=eq?`<a href="${esc(eq)}" target="_blank" rel="noopener" style="color:var(--l-sem)">${esc(bare(eq))} ↗</a>`:"";
      return `<tr><td>${fn}</td><td>${dt}</td><td>${sem}</td></tr>`;
    }).join("");
    return `<div class="box" style="--c:var(--l-struct)"><div class="bt">RecordSet: ${nm} <span class="tag">(${fields.length} fields)</span></div>
      <table class="fields"><tr><th>Field</th><th>Type</th><th style="color:var(--l-sem)">Semantic (⑥)</th></tr>${rows}</table></div>`;
  }).join("");
  return sec("struct","--l-struct","③ Structure — fields &nbsp;+&nbsp; ⑥ Semantic links",
    "Each RecordSet's columns and types. A violet link ties a column to an ontology term (e.g. a marker → UniProt).",
    `<div class="grid2">${blocks}</div>`);
}

const LEG=[["--l-meta","① Metadata","name, license, authors, DOI"],
  ["--l-res","② Resources","the files"],["--l-struct","③ Structure","columns inside files"],
  ["--l-rai","④ Responsible AI","collection story, limits"],["--l-prov","⑤ Provenance","W3C PROV-O lineage"],
  ["--l-sem","⑥ Semantic","column → ontology term"]];

function render(d){
  const leg=document.getElementById("legend");
  if(leg) leg.innerHTML=LEG.map(([c,t,x])=>`<div class="lg"><span class="swatch" style="background:var(${c})"></span><div><b>${t}</b><br>${x}</div></div>`).join("");
  const sub=document.getElementById("subtitle");
  if(sub) sub.textContent=(pick(d,"name")||"Croissant dataset")+"  ·  "+(pick(d,"conformsTo")||"");
  document.getElementById("view").innerHTML=[renderMeta(d),renderRAI(d),renderProv(d),renderResources(d),renderStructure(d),
    `<details class="raw"><summary>Show raw JSON-LD</summary><pre>${esc(JSON.stringify(d,null,2))}</pre></details>`].join("");
}
function showEmpty(msg){
  const leg=document.getElementById("legend"); if(leg) leg.innerHTML="";
  const sub=document.getElementById("subtitle"); if(sub) sub.textContent="No Croissant loaded";
  document.getElementById("view").innerHTML=`<div class="empty" style="padding:8px 2px">${esc(msg||"Open a Croissant using the controls above.")}</div>`;
}
