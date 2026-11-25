// ---- safety: places, not people. The map plots no one. It points to the official registry and says what the law allows.
function safeCard(){showCard('The offender registry and the law','This map does not plot people, and it will not. The Nebraska State Patrol keeps the official registry, and that is the place to look: it is kept current, it can be searched by name, by area, or by distance from an address you type, and it carries the rules for using it. Its own terms say the information is for awareness and must not be used to threaten or retaliate against a person on it, their family or their employer. '
  +'State law (Neb. Rev. Stat. 29-4017) lets a city limit where a person classed as a sexual predator may live, by no more than 500 feet from a school or a licensed child care facility, and not at all for other people on the registry. This map could not confirm from a public source that Lincoln has such an ordinance, so it draws no zones. What it can show are places: schools, playgrounds, parks, libraries, and police and fire stations.',
  undefined,{label:'Schools and playgrounds',fn:()=>{dlSet('schools',true,true);dlSet('playgrounds',true)}},[{href:'https://sor.nebraska.gov/',label:'State Patrol registry ↗'},{href:'https://law.justia.com/codes/nebraska/2020/chapter-29/statute-29-4017/',label:'The state law ↗'},{label:'Police stations',fn:()=>dlSet('police',true)}])}
// ---- all city data: browse the City of Lincoln's public map server and put any layer it publishes on this map
const CD={path:'',items:null,err:'',busy:false,svc:null,made:[],seq:0};DLG.push('From the city server');
// fields that could name or reach a person are never asked for, and layers about people are never listed
const CD_NO=/(own|ownr|applic|contact|phone|email|e_mail|mail|resident|tenant|occup|taxpayer|payer|grantor|grantee|buyer|seller|first.?name|last.?name|fname|lname|fullname|person|officer|inspector|staff|employee|creat|edit|user|login|notes?|comment|remark|ssn|dob|birth)/i;
const CD_SKIP=/^(objectid|fid|oid|shape|globalid|gdb_|st_area|st_length|shape_|se_anno)/i,CD_HIDE=/offender|inmate|arrest|warrant|registr|probation|parole|juvenile|victim/i;
async function cdGet(u){const r=await fetch(u+(u.includes('?')?'&':'?')+'f=json');if(!r.ok)throw new Error('http');const j=await r.json();if(j.error)throw new Error('server');return j}
async function cdLoad(path,svc){if(CD.busy)return;CD.busy=true;CD.err='';CD.path=path;CD.svc=svc||null;CD.items=null;if(sheet===CITYD)openSheet(CITYD,0);
  try{if(!hosted())throw new Error('offline');
    if(svc){const j=await cdGet(CITYSRV+'/'+svc);CD.items=(j.layers||[]).filter(l=>!l.subLayerIds&&!CD_HIDE.test(l.name)).map(l=>({k:'l',id:l.id,t:l.name,g:l.geometryType||''}))}
    else{const j=await cdGet(CITYSRV+(path?'/'+path:''));CD.items=(j.folders||[]).filter(f=>!CD_HIDE.test(f)).map(f=>({k:'f',t:f})).concat((j.services||[]).filter(s=>(s.type==='MapServer'||s.type==='FeatureServer')&&!CD_HIDE.test(s.name)).map(s=>({k:'s',t:s.name.split('/').pop(),p:s.name+'/'+s.type})))}}
  catch(e){CD.err=hosted()?'The city\'s map server could not be reached just now.':'The city\'s map server can only be read from the website copy of the map (the GitHub Pages link), not inside the Claude app.'}
  CD.busy=false;if(sheet===CITYD)openSheet(CITYD,0)}
function cityHTML(tab){if(tab===1)return '<h4>What this is</h4><p>The City of Lincoln and Lancaster County publish hundreds of map layers on a public server: zoning, parks, utilities, plans, districts, permits and more. This reads that server\'s own list and lets you put any layer on the 3D map. Your browser asks the city directly; nothing passes through anyone else.</p><h4>What it leaves out</h4><p>Any field that could name or reach a person (owner, applicant, contact, phone, mailing address, staff notes and the like) is never requested, and layers about people rather than places are not listed. A layer is cut to the part inside this map and to its first 1,000 records.</p><h4>What to keep in mind</h4><p>These layers arrive as the city publishes them. STARCITY has checked the layers in its own Layers list, one by one. It has not checked these: names may be terse, some are years old, and some are working files. Each card says where its record came from.</p>';
  let s='<p>Every folder and layer on the city\'s public map server. Tap a folder, then a map, then a layer to draw it. <b>'+(CD.path||CD.svc?esc((CD.svc||CD.path).replace(/\/(MapServer|FeatureServer)$/,'').replace(/\//g,' › ')):'Top')+'</b></p>';
  if(CD.path||CD.svc)s+='<button class="btn" data-cd="up">‹ Back</button> ';
  if(CD.made.length)s+='<button class="btn" data-cd="off">Remove the '+CD.made.length+' added</button>';
  if(CD.err)return s+'<p>'+esc(CD.err)+'</p>';if(!CD.items)return s+'<p>Reading the city\'s list…</p>';if(!CD.items.length)return s+'<p>Nothing is listed here.</p>';
  const G={esriGeometryPoint:'points',esriGeometryMultipoint:'points',esriGeometryPolyline:'lines',esriGeometryPolygon:'areas'};
  return s+'<div class="lyg">'+CD.items.map((q,i)=>q.k==='l'?(G[q.g]?`<button class="btn lyb" data-cd="${i}">${esc(q.t)} <small>${G[q.g]}</small></button>`:''):`<button class="btn lyb" data-cd="${i}">${q.k==='f'?'▸ ':''}${esc(q.t.replace(/_/g,' '))}${q.k==='s'?' <small>map</small>':''}</button>`).join('')+'</div>'}
async function cdAdd(svc,q){const url=CITYSRV+'/'+svc+'/'+q.id,id='cd'+(++CD.seq),k=q.g==='esriGeometryPolygon'?'pg':q.g==='esriGeometryPolyline'?'ln':'pt',place=svc.replace(/\/(MapServer|FeatureServer)$/,'').replace(/\//g,' › ');
  const def={id,t:q.t.replace(/_/g,' '),g:'From the city server',k,n:0,f:[],asof:'live',st:k==='pt'?{h:60,col:0x7fd6ff,r:.8}:k==='ln'?{h:46,col:0x7fd6ff,a:.85}:{h:22,col:0x7fd6ff,a:.5},
    note:'A layer read as the city publishes it, not one STARCITY has checked. Fields that could name or reach a person were not requested.',src:'City of Lincoln and Lancaster County GIS server, '+place,
    live:{from:'the City of Lincoln GIS server',url,fields:[],empty:'This layer has nothing inside the area of the map, or the server does not let it be read this way.',
      load:async()=>{const meta=await cdGet(url),F=(meta.fields||[]).filter(f=>!CD_SKIP.test(f.name)&&!CD_NO.test(f.name)&&!CD_NO.test(f.alias||'')&&['esriFieldTypeString','esriFieldTypeInteger','esriFieldTypeSmallInteger','esriFieldTypeDouble','esriFieldTypeSingle','esriFieldTypeDate'].includes(f.type)).slice(0,14);
        const r=await fetch(url+'/query?where=1%3D1&'+MAPBOX+'&outFields='+encodeURIComponent(F.map(f=>f.name).join(',')||'OBJECTID')+'&returnGeometry=true&outSR=4326&geometryPrecision=6'+(k==='pt'?'':'&maxAllowableOffset=0.00002')+'&resultRecordCount=1000&f=geojson');if(!r.ok)throw new Error('http');const j=await r.json();if(j.error)throw new Error('server');const feats=j.features||[];
        def.live.fields=F.map(f=>[f.name,(f.alias||f.name).replace(/_/g,' '),/String|Date/.test(f.type)?'s':'n','',f.type==='esriFieldTypeDate'?dayStr:undefined]);
        // color by the first text field that sorts the records into a handful of kinds
        for(const f of F){if(f.type!=='esriFieldTypeString')continue;const u=new Set(feats.map(x=>(x.properties||{})[f.name]));if(u.size>=2&&u.size<=12){def.st.c=f.name;def.st.pal='auto';delete def.st.col;break}}
        return feats}}};
  dlAdd(def,{});CD.made.push(id);closeSheet();dlSet(id,true)}
function cityClear(){for(const id of CD.made){dlSet(id,false,true);DL.delete(id)}CD.made.length=0}
const CITYD={title:'All <i>city data</i>',tabs:['Browse','About this'],html:cityHTML,click:e=>{const b=e.target.closest('[data-cd]');if(!b||CD.busy)return;const v=b.dataset.cd;
  if(v==='off'){cityClear();openSheet(CITYD,0);return}
  if(v==='up'){if(CD.svc)cdLoad(CD.path,null);else cdLoad(CD.path.includes('/')?CD.path.slice(0,CD.path.lastIndexOf('/')):'',null);return}
  const q=CD.items[+v];if(!q)return;if(q.k==='f')cdLoad(q.t,null);else if(q.k==='s')cdLoad(CD.path,q.p);else cdAdd(CD.svc,q)}};
function cityData(){openSheet(CITYD,0);if(!CD.items&&!CD.busy)cdLoad('',null)}
// ---- the view in words, for anyone who cannot see the picture or would rather read it
function describeView(){const t=controls.target,v=viewAngles(),wide=2*v.d*Math.tan(camera.fov*Math.PI/360)*camera.aspect,s=streetNear(t.x,t.z,600),hd=((-v.az)%360+360)%360,on=dlOn.map(L=>L.def.t),p=[];
  p.push(walk.on?`You are standing ${s&&s.name?'on or near '+s.name:'in Lincoln'}, looking ${compass(-walk.yaw*180/Math.PI)}`:`The view is centered ${s&&s.name?'near '+s.name:'on Lincoln'}, about ${wide<1609?Math.round(wide*3.281/100)*100+' feet':(wide/1609.34).toFixed(1)+' miles'} across, looking ${compass(hd)}${v.el>75?' from straight overhead':v.el<25?' from low to the ground':''}`);
  p.push('the map\'s clock reads '+(liveOn?clock(Date.now())+', which is now':$('sunL').textContent));
  {const w=wxNow();if(w&&w.tC!=null)p.push(`${Math.round(w.tC*9/5+32)}°F${w.desc?' and '+w.desc.toLowerCase():''} at the airport`)}
  p.push(on.length?'layers showing: '+on.join(', '):'no data layers are showing');
  {const m=[];if(busOn)m.push('buses');if(birdsOn)m.push('birds');if(trafOn)m.push('traffic');if(DM.on)m.push('vote history');if(NSKY.on)m.push('the night sky');if(m.length)p.push('also on: '+m.join(', '))}
  showCard('This view in words',p.map(q=>q.charAt(0).toUpperCase()+q.slice(1)).join('. ')+'. Search finds any street, address or building by name, the Guide lists everything the map holds, and each layer\'s card gives its numbers as text.',undefined,{label:'What is around here',fn:()=>aroundCard()},[{label:'Search',fn:()=>{if($('find').style.display!=='block')$('bFind').click()}},{label:'Guide',fn:()=>openSheet(GUIDE,0)}])}
// ---- reading comfort: bigger text, stronger contrast, and less motion when the device asks for it
const ACC={z:0,hc:false};
function accSet(z,hc){ACC.z=z;ACC.hc=hc;const k=[1,1.18,1.36][z];document.documentElement.style.setProperty('--uz',k);document.documentElement.style.setProperty('--ls',k);document.body.classList.toggle('hc',hc);
  $('bText').textContent=['Text size','Text size: large','Text size: largest'][z];$('bText').classList.toggle('on',z>0);$('bHC').classList.toggle('on',hc);try{localStorage.setItem('sc_acc',JSON.stringify({z,hc}))}catch(e){}layoutCard();dirty=true}
function accessInit(){$('bText').onclick=()=>accSet((ACC.z+1)%3,ACC.hc);$('bHC').onclick=()=>accSet(ACC.z,!ACC.hc);$('bSay').onclick=describeView;
  let a=null;try{a=JSON.parse(localStorage.getItem('sc_acc')||'null')}catch(e){}if(a&&(a.z||a.hc))accSet(a.z|0,!!a.hc);
  // a device set to reduce motion starts with the decorative animation off; every switch still works
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){if(birdsOn)$('bBirds').click();if(CR.on)setCreatures(false);hideCard();hintShow('Your device asks for less motion, so the birds and creatures start switched off. They are under More.',9000)}}
// ---- the tray: what you have switched on, kept in sight when the button grid folds away, with Menu one tap from adding more
const TRAY={key:'',at:0,mute:false};
// a view wide enough to see what was just switched on
const PANOUT={bTraf:5200,bTrails:5200,bBus:4200,bVB:6000,bWx:7000,bBiz:3200},PANK={hx:9000,pg:8000,ln:6000,pt:2600};
function panOut(minD){if(walk.on||ride||fly||tour)return;const v=viewAngles(),t=controls.target;if(v.d>=minD*.55)return;flyTo(camTo(t.x,t.z,minD,v.az,Math.max(v.el,46),-hAt(t.x,t.z)+t.y),1400)}
function trayItems(){const a=[];for(const L of dlOn)if(!(CORE.cl&&L.id==='closures'))a.push([L.def.t,()=>dlSet(L.id,false)]);if(DM.on)a.push(['Vote history',()=>setVotes(false)]);if(CIV.g)a.push(['District walls',()=>civClear()]);if(FEST.on)a.push(['Devaney lights',()=>devFest(false)]);
  if(BX.route!=null&&H.bus)a.push(['Route '+H.bus.routes[BX.route][0]+' path',()=>busLine(null)]);return a}
function trayDraw(force){if(TRAY.mute)return;const now=performance.now();if(!force&&now-TRAY.at<400)return;TRAY.at=now;const T=$('tools'),it=trayItems(),shut=T.classList.contains('shut'),nb=T.querySelectorAll('.btn.sel.on').length,key=it.map(q=>q[0]).join('|')+'#'+shut+'#'+nb;if(key===TRAY.key)return;TRAY.key=key;
  const host=$('tray');host.textContent='';for(const [t,off] of it){const b=document.createElement('button');b.className='btn on';b.textContent=t+'  ×';b.setAttribute('aria-label','Showing '+t+'. Tap to turn it off');b.onclick=e=>{e.stopPropagation();lastInput=performance.now();off();trayDraw(true)};host.appendChild(b)}
  menuLabel(it.length+nb)}
function trayInit(){const T=$('tools'),t=document.createElement('div');t.id='tray';t.setAttribute('role','group');t.setAttribute('aria-label','Switched on now');T.appendChild(t);
  T.addEventListener('click',e=>{const b=e.target.closest('.btn');if(!b||b.parentNode!==T||b.id==='bMenu'||b.id==='bMore'){setTimeout(()=>trayDraw(true),0);return}b.classList.add('sel');lastInput=performance.now();
    if(b.id==='bTraf'){CORE.user.tr=true;CORE.tr=false;b.classList.remove('auto')}if(b.id==='bWx'){CORE.user.wx=true;CORE.wx=false;b.classList.remove('auto')}
    setTimeout(()=>{if(b.classList.contains('on')&&PANOUT[b.id])panOut(PANOUT[b.id]);trayDraw(true)},420)})}
// ---- the core view. From bird's eye the map always shows right now: the weather as it is and traffic for this hour, with street closures read live on the website.
// Zoom in and they step aside, unless you switched them on yourself.
const CORE={on:false,wx:false,tr:false,cl:false,user:{},told:false,top:null,t0:0};
function coreSet(on){if(on===CORE.on)return;CORE.on=on;
  if(on){if(!wxOn&&!CORE.user.wx){CORE.wx=true;wxOn=true;$('bWx').classList.add('on','auto');loadWeather();loadAlerts();loadRadar();applyWx();drawOverlay();placeStorms()}
    if(!trafOn&&!CORE.user.tr){CORE.tr=true;trafOn=true;$('bTraf').classList.add('on','auto');if(!traf)buildTraffic();traf.mesh.visible=true}
    if(hosted()&&!CORE.user.cl){const L=DL.get('closures');if(L&&!L.on){CORE.cl=true;dlSet('closures',true,true)}}
    if(!CORE.told){CORE.told=true;hintShow('Bird\'s eye shows right now: the weather as it is, and traffic as it usually runs at this hour. Zoom in and they step aside.',8000)}}
  else{$('bWx').classList.remove('auto');$('bTraf').classList.remove('auto');if(CORE.wx&&wxOn){wxOn=false;$('bWx').classList.remove('on');if(wxDemo)setDemo(-1);applyWx();drawOverlay();placeStorms()}if(CORE.tr&&trafOn){trafOn=false;$('bTraf').classList.remove('on');if(traf)traf.mesh.visible=false}
    if(CORE.cl){const L=DL.get('closures');if(L&&L.on)dlSet('closures',false,true)}CORE.wx=CORE.tr=CORE.cl=false}
  trayDraw(true);dirty=true}
function coreFrame(now){if(!CORE.t0)CORE.t0=now;if(now-CORE.t0<6000||fly||tour)return;if(walk.on||ride||rideMode||gameOn||codeOn){if(CORE.on)coreSet(false);return}const d=camera.position.distanceTo(controls.target);if(!CORE.on&&d>8500)coreSet(true);else if(CORE.on&&d<5200)coreSet(false);
  // a layer just switched on by hand: step back far enough to see it
  if(dlTop!==CORE.top){CORE.top=dlTop;if(dlTop&&now-lastInput<2500&&!(CORE.cl&&dlTop.id==='closures'))panOut(PANK[dlTop.def.k]||0)}}
function coreReset(){CORE.user={};if(CORE.on){CORE.on=false;CORE.wx=CORE.tr=CORE.cl=false}for(const b of $('tools').querySelectorAll('.btn.sel'))b.classList.remove('sel');TRAY.key=''}
// ---- when several things are showing at once, each turns more see-through so the others show through it
const STACK={n:0,told:false};
function stackFrame(){const n=dlOn.length+(trafOn?1:0)+(DM.on?1:0)+(prideOn?1:0)+(CIV.g?1:0),want=n<=1?1:n===2?.74:n===3?.6:.5;if(Math.abs(dlAuto-want)>.004){dlAuto+=(want-dlAuto)*.2;dirty=true}
  if(n===STACK.n)return;STACK.n=n;if(LM.prideG){const op=prideOn&&n>1?.5:.94;LM.prideG.traverse(o=>{if(o.material&&o.material.opacity!==op){o.material.transparent=true;o.material.opacity=op;o.material.depthWrite=op>.9;o.material.needsUpdate=true}})}
  if(n>1&&!STACK.told){STACK.told=true;hintShow(n+' things are showing at once. Each has turned more see-through so the others show. The list under Menu says what is on.',6500)}trayDraw(true)}
