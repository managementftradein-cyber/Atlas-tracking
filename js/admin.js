let currentShipmentId = null;
let signatureDirty = false;
let selectedPhotos = [];

const STATUS_LABEL = {
  pending:"Pending", picked_up:"Picked up", in_transit:"In transit",
  customs:"In customs", out_for_delivery:"Out for delivery",
  delivered:"Delivered", exception:"Exception"
};

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtDate = d => d ? new Date(d).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}) : "—";
const fmtDateTime = d => d ? new Date(d).toLocaleString(undefined,{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}) : "—";
const pill = s => `<span class="pill pill-${esc(s)}">${esc(STATUS_LABEL[s] || s)}</span>`;

(async function guard(){
  const {data,error}=await supabaseClient.auth.getSession();
  if(error || !data.session){location.href="login.html";return;}
  const {data:admin}=await supabaseClient.from("admin_users").select("user_id").eq("user_id",data.session.user.id).maybeSingle();
  if(!admin){await supabaseClient.auth.signOut();location.href="login.html";return;}
  init();
})();

$("#logout-link").addEventListener("click",async e=>{e.preventDefault();await supabaseClient.auth.signOut();location.href="login.html";});

function init(){
  $$("[data-tab]").forEach(a=>a.addEventListener("click",e=>{
    e.preventDefault();$$("[data-tab]").forEach(x=>x.classList.remove("active"));a.classList.add("active");
    $$(".tab-panel").forEach(x=>x.classList.add("hidden"));$("#tab-"+a.dataset.tab).classList.remove("hidden");
  }));
  $("#new-shipment-btn").addEventListener("click",()=>openShipmentModal(null));
  $("#refresh-shipments").addEventListener("click",loadShipments);
  $$("#shipment-modal [data-close-modal]").forEach(b=>b.addEventListener("click",closeModal));
  $("#shipment-modal").addEventListener("click",e=>{if(e.target.id==="shipment-modal")closeModal();});
  $("#shipment-form").addEventListener("submit",saveShipment);
  $("#event-form").addEventListener("submit",addEvent);
  $("#save-pod-btn").addEventListener("click",savePOD);
  $("#clear-signature").addEventListener("click",clearSignature);
  $("#delivery-photos").addEventListener("change",e=>{selectedPhotos=[...e.target.files];renderSelectedPhotos();});
  ["base_charge","per_kg_rate","service_charge","insurance_charge","additional_charge"].forEach(n=>$( `[name="${n}"]`).addEventListener("input",updateChargePreview));
  $("#shipment-form").weight_kg.addEventListener("input",updateChargePreview);
  setupSignature();
  loadShipments();loadQuotes();loadMessages();
}

function closeModal(){$("#shipment-modal").classList.add("hidden");currentShipmentId=null;}

async function loadShipments(){
  const tbody=$("#shipments-tbody");tbody.innerHTML='<tr><td colspan="6" class="skel">Loading…</td></tr>';
  const {data,error}=await supabaseClient.from("shipments").select("*").order("updated_at",{ascending:false});
  if(error){tbody.innerHTML='<tr><td colspan="6">Couldn’t load shipments.</td></tr>';return;}
  if(!data?.length){tbody.innerHTML='<tr><td colspan="6" class="skel">No shipments yet.</td></tr>';return;}
  tbody.innerHTML=data.map(s=>`<tr><td class="mono">${esc(s.tracking_number)}</td><td>${pill(s.status)}</td><td>${esc(s.origin||"—")} → ${esc(s.destination||"—")}</td><td>${esc(s.receiver_name||"—")}</td><td>${esc(fmtDate(s.updated_at))}</td><td><button class="row-btn" data-edit="${esc(s.id)}">Open</button></td></tr>`).join("");
  $$("[data-edit]",tbody).forEach(b=>b.addEventListener("click",()=>openShipmentModal(b.dataset.edit)));
}

function setFormValue(name,value){const el=$(`[name="${name}"]`);if(el)el.value=value ?? "";}
async function openShipmentModal(id){
  const modal=$("#shipment-modal"),form=$("#shipment-form");form.reset();currentShipmentId=id;selectedPhotos=[];signatureDirty=false;
  $("#photo-list").innerHTML="";$("#pod-message").className="notice hidden";clearSignature();
  if(!id){
    $("#shipment-modal-title").textContent="New shipment";$("#events-section").classList.add("hidden");$("#delivery-section").classList.add("hidden");
    updateChargePreview();modal.classList.remove("hidden");return;
  }
  $("#shipment-modal-title").textContent="Edit shipment";
  const {data:s,error}=await supabaseClient.from("shipments").select("*").eq("id",id).single();
  if(error||!s){alert("Shipment could not be loaded.");return;}
  ["id","tracking_number","status","service_type","est_delivery","origin","destination","sender_name","receiver_name","sender_email","receiver_email","weight_kg","dimensions","contents"].forEach(k=>setFormValue(k,s[k]));
  const {data:c}=await supabaseClient.from("shipment_charges").select("*").eq("shipment_id",id).maybeSingle();
  if(c){["currency","base_charge","per_kg_rate","service_charge","insurance_charge","additional_charge"].forEach(k=>setFormValue(k,c[k]));}
  $("#events-section").classList.remove("hidden");$("#delivery-section").classList.remove("hidden");
  await loadEvents(id);await loadPOD(id);updateChargePreview();modal.classList.remove("hidden");
}

function updateChargePreview(){
  const f=$("#shipment-form");
  const kg=Number(f.weight_kg.value||0),base=Number(f.base_charge.value||0),rate=Number(f.per_kg_rate.value||0),
    service=Number(f.service_charge.value||0),insurance=Number(f.insurance_charge.value||0),additional=Number(f.additional_charge.value||0);
  const weight=kg*rate,total=base+weight+service+insurance+additional;
  $("#weight-charge-preview").textContent=weight.toFixed(2);$("#total-charge-preview").textContent=`${f.currency.value} ${total.toFixed(2)}`;
  return {kg,base,rate,service,insurance,additional,weight,total,currency:f.currency.value};
}

async function saveShipment(e){
  e.preventDefault();const f=e.target,b=f.querySelector('button[type="submit"]');b.disabled=true;b.textContent="Saving…";
  const payload={
    tracking_number:f.tracking_number.value.trim(),status:f.status.value,service_type:f.service_type.value.trim(),
    origin:f.origin.value.trim(),destination:f.destination.value.trim(),sender_name:f.sender_name.value.trim(),
    receiver_name:f.receiver_name.value.trim(),sender_email:f.sender_email.value.trim()||null,receiver_email:f.receiver_email.value.trim()||null,
    weight_kg:f.weight_kg.value?Number(f.weight_kg.value):null,dimensions:f.dimensions.value.trim(),contents:f.contents.value.trim(),
    est_delivery:f.est_delivery.value||null
  };
  let result=f.id.value?await supabaseClient.from("shipments").update(payload).eq("id",f.id.value).select().single():await supabaseClient.from("shipments").insert(payload).select().single();
  b.disabled=false;b.textContent="Save shipment";
  if(result.error){alert("Couldn't save shipment: "+result.error.message);return;}
  currentShipmentId=result.data.id;
  const c=updateChargePreview();
  const {error:ce}=await supabaseClient.from("shipment_charges").upsert({
    shipment_id:currentShipmentId,currency:c.currency,base_charge:c.base,per_kg_rate:c.rate,
    weight_charge:c.weight,service_charge:c.service,insurance_charge:c.insurance,additional_charge:c.additional,total_charge:c.total
  },{onConflict:"shipment_id"});
  if(ce){alert("Shipment saved, but charges could not be saved: "+ce.message);return;}
  $("#events-section").classList.remove("hidden");$("#delivery-section").classList.remove("hidden");
  await loadEvents(currentShipmentId);await loadPOD(currentShipmentId);await loadShipments();
}

async function loadEvents(id){
  const list=$("#events-list");list.innerHTML='<p class="skel">Loading…</p>';
  const {data,error}=await supabaseClient.from("tracking_events").select("*").eq("shipment_id",id).order("event_time",{ascending:false});
  if(error||!data?.length){list.innerHTML='<p class="skel">No events yet.</p>';return;}
  list.innerHTML=data.map((e,i)=>`<div class="timeline-item ${i===0?"current":""}"><div class="timeline-time mono">${esc(fmtDateTime(e.event_time))}</div><div class="timeline-status">${esc(STATUS_LABEL[e.status]||e.status)}</div><div class="timeline-loc">${esc(e.location||"")}${e.note?" — "+esc(e.note):""}</div></div>`).join("");
}
async function addEvent(e){
  e.preventDefault();if(!currentShipmentId){alert("Save the shipment first.");return;}
  const f=e.target;
  const {error}=await supabaseClient.from("tracking_events").insert({shipment_id:currentShipmentId,status:f.status.value,location:f.location.value.trim(),note:f.note.value.trim()});
  if(error){alert("Couldn't add event: "+error.message);return;}
  // Keep shipment status synchronized with the newest event.
  await supabaseClient.from("shipments").update({status:f.status.value}).eq("id",currentShipmentId);
  f.reset();await loadEvents(currentShipmentId);await loadShipments();
}

function setupSignature(){
  const c=$("#signature-pad"),ctx=c.getContext("2d");ctx.lineWidth=2.2;ctx.lineCap="round";
  let drawing=false,last=null;
  const pos=e=>{const r=c.getBoundingClientRect(),p=e.touches?.[0]||e;return{x:(p.clientX-r.left)*c.width/r.width,y:(p.clientY-r.top)*c.height/r.height}};
  const start=e=>{e.preventDefault();drawing=true;last=pos(e)};
  const move=e=>{if(!drawing)return;e.preventDefault();const p=pos(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;signatureDirty=true};
  const end=()=>{drawing=false;last=null};
  c.addEventListener("pointerdown",start);c.addEventListener("pointermove",move);window.addEventListener("pointerup",end);
  c.dataset.ready="1";
}
function clearSignature(){const c=$("#signature-pad");c.getContext("2d").clearRect(0,0,c.width,c.height);signatureDirty=false;$("#signature-status").textContent="";}
function renderSelectedPhotos(){
  const list=$("#photo-list");list.innerHTML="";
  selectedPhotos.forEach((f,i)=>{const d=document.createElement("div");d.className="photo-chip";d.innerHTML=`<span>${esc(f.name)}</span><button type="button" data-photo="${i}">Remove</button>`;list.appendChild(d);});
  $$("[data-photo]",list).forEach(b=>b.addEventListener("click",()=>{selectedPhotos.splice(Number(b.dataset.photo),1);renderSelectedPhotos();}));
}

async function loadPOD(id){
  const {data:pod}=await supabaseClient.from("delivery_confirmations").select("*").eq("shipment_id",id).maybeSingle();
  if(pod){
    $("#pod-recipient").value=pod.recipient_name||"";$("#pod-delivered-at").value=pod.delivered_at?new Date(pod.delivered_at).toISOString().slice(0,16):"";
    $("#pod-location").value=pod.location||"";$("#pod-notes").value=pod.notes||"";
    if(pod.signature_path){$("#signature-status").textContent="Signature already saved. Draw again to replace it.";}
  }
  const {data:photos}=await supabaseClient.from("delivery_photos").select("*").eq("shipment_id",id).order("created_at",{ascending:false});
  const list=$("#photo-list");list.innerHTML="";
  for(const ph of photos||[]){
    const {data}=await supabaseClient.storage.from("delivery-proof").createSignedUrl(ph.storage_path,3600);
    const d=document.createElement("div");d.className="photo-card";
    d.innerHTML=`${data?.signedUrl?`<img src="${esc(data.signedUrl)}" alt="Delivery proof">`:""}<div>${esc(ph.caption||"Delivery photo")}</div>`;
    list.appendChild(d);
  }
}

async function savePOD(){
  if(!currentShipmentId){alert("Save the shipment first.");return;}
  const btn=$("#save-pod-btn");btn.disabled=true;btn.textContent="Saving proof…";
  const recipient=$("#pod-recipient").value.trim(),deliveredAt=$("#pod-delivered-at").value||new Date().toISOString();
  const location=$("#pod-location").value.trim(),notes=$("#pod-notes").value.trim();
  let signaturePath=null;
  if(signatureDirty){
    const blob=await new Promise(r=>$("#signature-pad").toBlob(r,"image/png"));
    signaturePath=`${currentShipmentId}/signature-${Date.now()}.png`;
    const up=await supabaseClient.storage.from("delivery-proof").upload(signaturePath,blob,{contentType:"image/png",upsert:false});
    if(up.error){alert("Signature upload failed: "+up.error.message);btn.disabled=false;btn.textContent="Save proof of delivery";return;}
  }else{
    const {data:existing}=await supabaseClient.from("delivery_confirmations").select("signature_path").eq("shipment_id",currentShipmentId).maybeSingle();
    signaturePath=existing?.signature_path||null;
  }
  const {error:pe}=await supabaseClient.from("delivery_confirmations").upsert({
    shipment_id:currentShipmentId,recipient_name:recipient,delivered_at:deliveredAt,location,notes,signature_path:signaturePath
  },{onConflict:"shipment_id"});
  if(pe){alert("Could not save delivery record: "+pe.message);btn.disabled=false;btn.textContent="Save proof of delivery";return;}

  for(const file of selectedPhotos){
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){continue;}
    const path=`${currentShipmentId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
    const up=await supabaseClient.storage.from("delivery-proof").upload(path,file,{contentType:file.type,upsert:false});
    if(!up.error) await supabaseClient.from("delivery_photos").insert({shipment_id:currentShipmentId,storage_path:path,caption:"Delivery proof"});
  }
  selectedPhotos=[];$("#delivery-photos").value="";signatureDirty=false;
  $("#pod-message").className="notice success";$("#pod-message").textContent="Proof of delivery saved.";$("#pod-message").classList.remove("hidden");
  await loadPOD(currentShipmentId);await loadShipments();
  btn.disabled=false;btn.textContent="Save proof of delivery";
}

async function loadQuotes(){
  const tb=$("#quotes-tbody"),{data,error}=await supabaseClient.from("quote_requests").select("*").order("created_at",{ascending:false});
  if(error){tb.innerHTML="<tr><td colspan=6>Couldn't load quote requests.</td></tr>";return;}
  tb.innerHTML=(data||[]).map(q=>`<tr><td>${esc(fmtDate(q.created_at))}</td><td>${esc(q.name)}</td><td>${esc(q.email)}</td><td>${esc(q.origin||"—")} → ${esc(q.destination||"—")}</td><td>${esc(q.status)}</td><td><select data-quote="${esc(q.id)}"><option ${q.status==="new"?"selected":""}>new</option><option ${q.status==="contacted"?"selected":""}>contacted</option><option ${q.status==="closed"?"selected":""}>closed</option></select></td></tr>`).join("")||'<tr><td colspan="6" class="skel">No quote requests yet.</td></tr>';
  $$("[data-quote]",tb).forEach(s=>s.addEventListener("change",async()=>{await supabaseClient.from("quote_requests").update({status:s.value}).eq("id",s.dataset.quote);}));
}
async function loadMessages(){
  const tb=$("#messages-tbody"),{data,error}=await supabaseClient.from("contact_messages").select("*").order("created_at",{ascending:false});
  if(error){tb.innerHTML="<tr><td colspan=6>Couldn't load messages.</td></tr>";return;}
  tb.innerHTML=(data||[]).map(m=>`<tr><td>${esc(fmtDate(m.created_at))}</td><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(m.subject||"—")}</td><td>${esc(m.status)}</td><td><select data-msg="${esc(m.id)}"><option ${m.status==="new"?"selected":""}>new</option><option ${m.status==="read"?"selected":""}>read</option><option ${m.status==="closed"?"selected":""}>closed</option></select></td></tr>`).join("")||'<tr><td colspan="6" class="skel">No messages yet.</td></tr>';
  $$("[data-msg]",tb).forEach(s=>s.addEventListener("change",async()=>{await supabaseClient.from("contact_messages").update({status:s.value}).eq("id",s.dataset.msg);}));
}
