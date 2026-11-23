
// ---- property facts on every building card: assessed value, estimated tax, how it compares, and the owner on request
// value a building stands for in bars, counts, medians and sums. A parcel's value is counted once: on a home lot the main building carries it, elsewhere it is split among the parcel's buildings by size (footprint times height). Shares are 0 to 65535.
function bVal(b){const v=S2.b_sv[b]||S2.b_val[b];if(!v||!S2.b_sh)return v;const s=S2.b_sh[b];return s===65535?v:Math.round(v*s/65535)}
function propLines(b){if(!S2||!S2.b_val)return null;const v=S2.b_val[b];if(!v)return null;const out=[],un=S2.b_un[b],sv=S2.b_sv[b],cls=H2.cls[S2.b_cls[b]]||'',r=H2.txd[S2.b_tx[b]];
  out.push('Assessed at '+fmtN(v,'$')+' for 2026'+(cls&&cls!=='Unclassified'?' ('+cls.toLowerCase()+')':''));
  if(S2.b_pn&&S2.b_pn[b]>1&&!un){const n=S2.b_pn[b],s=S2.b_sh[b];out.push('that is the value of the whole parcel, which holds '+n+' buildings on this map'+(s===0?'; in value bars, counts and medians the main building carries it and this one carries none':s<65535?'; in value bars, counts and medians this building stands for '+fmtN(bVal(b),'$')+' of it, its share by size':''))}
  const tg=H.tags[S.b_tag[b]]||'',ex=/^(university|college|school|kindergarten|church|cathedral|chapel|religious|government|public|civic|hospital|fire_station|library|dormitory|stadium)$/.test(tg);
  if(r&&r[1])out.push('property tax about '+fmtN(v*r[1]/100,'$')+' a year (an estimate: value times the '+H2.city.rateYear+' levy of '+r[1].toFixed(4)+' per $100 in tax district '+r[0]+', before credits and exemptions'+(ex?'; public, school and church property is usually exempt, so the real bill here may be nothing':'')+'). What was billed and paid is on the county record');
  else out.push('no tax district is on file for this parcel, so no tax estimate. The county record has the bill');
  if(un>1&&sv>v)out.push(`this building holds ${un} parcels assessed at ${fmtN(sv,'$')} together`);
  const fa=S2.b_fa[b];if(fa>200&&cls.startsWith('Residential'))out.push(`${fa.toLocaleString('en-US')} sq ft of living space, $${Math.round(v/fa)} per sq ft`);
  const nb=H2.nb[S2.b_nb[b]];if(nb&&nb[1]&&nb[2]>=8&&cls==='Residential Improved'){const d=Math.round((v/nb[1]-1)*100);out.push(`the ${nb[2].toLocaleString('en-US')} homes in its assessor neighborhood have a median of ${fmtN(nb[1],'$')}, so this one is ${d===0?'right at the median':Math.abs(d)+'% '+(d>0?'above':'below')}`)}
  return out.join(' · ')}
async function ownerLookup(pid,btn){btn.disabled=true;btn.textContent='Asking the county…';const done=t=>{const p=$('cp');p.textContent+=' '+t;p.scrollTop=p.scrollHeight;btn.remove()};
  try{if(!hosted())throw 0;const r=await fetch(CITYSRV+'/Assessor/TaxParcels/MapServer/0/query?where='+encodeURIComponent("PARCELID='"+pid+"'")+'&outFields=OWNERNME1,OWNERNME2&returnGeometry=false&f=json');const j=await r.json(),a=j.features&&j.features[0]&&j.features[0].attributes;if(!a)throw 0;
    const names=[a.OWNERNME1,a.OWNERNME2].filter(x=>x&&x.trim()).map(x=>x.trim());done(names.length?'Owner on the county record today: '+names.join(' and ')+'. Read live from the Lancaster County Assessor just now. This map does not keep it.':'The county record lists no owner name for this parcel today.')}
  catch(e){done('The owner could not be read from the county just now. Use the County property record button, which opens the same public record. The lookup works on the website copy of the map.')}}
// ---- city totals and the tax explorer
const bar=(f,c)=>`<span class="pbar"><i style="width:${Math.max(1.5,Math.min(100,f*100)).toFixed(1)}%;background:${c||'var(--accent)'}"></i></span>`;
function taxHTML(i){const C=H2.city,T=H2.tax,M=v=>fmtN(v,'$'),N=v=>Math.round(v).toLocaleString('en-US');
  if(i===0){const mo=C.monthly||[],last=mo[mo.length-1],prev=mo.find(m=>last&&m[0]===last[0]-1&&m[1]===last[1]),mx=Math.max(...mo.map(m=>m[2]),1);
    return `<h4>Everything on this map</h4><p>The ${N(C.parcels)} parcels inside the map are assessed at <b>${M(C.total)}</b> for 2026. ${N(C.homes)} of them are homes, with a median of <b>${M(C.medHome)}</b>.</p>
<p>Using each tax district's ${C.rateYear} levy (${C.rate} per $100 in district 0001, which covers most of Lincoln), the ${N(C.taxParcels)} parcels with a district on file would owe about <b>${M(C.tax)}</b> a year before credits and exemptions. That is an estimate from this map, not a county figure.</p>
<h4>All of Lancaster County</h4><ul>${C.county.map(c=>`<li>${c[0]}: ${N(c[1])} properties, ${M(c[2])}</li>`).join('')}</ul><p>County totals are the assessor's own dashboard figures.</p>
<h4>How many properties fall in each value band, countywide</h4>${C.ranges.map(r=>`<div class="prow"><span>${r[0]}</span>${bar(r[1]/Math.max(...C.ranges.map(q=>q[1])))}<b>${N(r[1])}</b></div>`).join('')}
<h4>Median sale price by month</h4><div class="spark">${mo.slice(-60).map(m=>`<i title="${m[1]}/${m[0]}: ${M(m[2])}" style="height:${Math.round(m[2]/mx*100)}%"></i>`).join('')}</div>
<p>${last?`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][last[1]-1]} ${last[0]}: median ${M(last[2])} across ${N(last[3])} sales so far`+(prev?`. A year earlier: ${M(prev[2])}`:'')+'. The chart covers the last five years.':''}</p>
<button class="btn go2" data-l="hoods">See totals by neighborhood in 3D</button><button class="btn go2" data-l="hx_vpa">See value per acre in 3D</button><button class="btn go2" data-l="pv">See every property as a value bar</button>`}
  if(i===1){const tot=T.byClass.reduce((a,r)=>a+r[3],0),tv=T.byClass.reduce((a,r)=>a+r[2],0),bt=T.byBand.reduce((a,r)=>a+r[3],0);
    return `<h4>Who pays, by kind of property</h4><p>Share of the estimated ${M(tot)} in yearly property tax on this map. Estimates use each tax district\'s ${H2.city.rateYear} levy and leave out credits, exemptions and tax-exempt owners, so treat the shares as a guide.</p>
${T.byClass.filter(r=>r[2]>0).map(r=>`<div class="prow"><span>${r[0]}</span>${bar(r[3]/tot)}<b>${Math.round(r[3]/tot*100)}% of tax</b></div><p class="psub">${N(r[1])} parcels · ${M(r[2])} assessed, ${Math.round(r[2]/tv*100)}% of all value · about ${M(r[3])} a year</p>`).join('')}
<h4>Who pays among homes, by value band</h4>${T.byBand.map(r=>`<div class="prow"><span>${r[0]}</span>${bar(r[3]/bt)}<b>${Math.round(r[3]/bt*100)}%</b></div><p class="psub">${N(r[1])} homes · ${M(r[2])} assessed · about ${M(r[3])} a year, ${M(r[3]/Math.max(1,r[4]))} per home with a known levy</p>`).join('')}
<h4>Where a Lincoln tax dollar goes</h4><p>The city's 2024 budget summary says about 61 cents of each property tax dollar a Lincoln homeowner pays goes to Lincoln Public Schools and the educational service unit, 17 cents to city government and 14 cents to Lancaster County. The rest goes to smaller districts.</p>
<button class="btn go2" data-l="hx_tpa">See tax per acre in 3D</button><button class="btn go2" data-l="paint_cls">Color buildings by property class</button><button class="btn go2" data-l="paint_value">Color buildings by value band</button>`}
  if(i===2){const tv=T.bySchool.reduce((a,r)=>a+r[2],0);
    return `<h4>By school district</h4><p>Which school district each parcel on the map pays into, from the assessor's records.</p>${T.bySchool.map(r=>`<div class="prow"><span>${esc(r[0])}</span>${bar(r[2]/tv)}<b>${Math.round(r[2]/tv*1000)/10}%</b></div><p class="psub">${N(r[1])} parcels · ${M(r[2])} assessed${r[3]?` · about ${M(r[3])} a year on the ${N(r[4])} parcels with a known levy`:' · levy not in this map yet'}</p>`).join('')}
<h4>By tax district</h4><p>A tax district is one combination of school, city, county and other levies. District 0001 is most of Lincoln.</p>${T.byDistrict.map(r=>`<div class="prow"><span>District ${esc(r[0])}</span>${bar(r[2]/T.byDistrict[0][2])}<b>${M(r[2])}</b></div><p class="psub">${N(r[1])} parcels${r[5]?` · levy ${r[5]} per $100 in 2024`:' · levy not in this map yet'}</p>`).join('')}
<button class="btn go2" data-l="schooldist">Show school district lines (live)</button><button class="btn go2" data-l="tif">Show TIF districts in 3D</button>`}
  return `<h4>The twelve highest assessed parcels on the map</h4><p>By 2026 assessed value. Tap one to fly there. Owners are not stored. The property's card has a button that reads the owner from the county.</p>`+T.top.map((r,k)=>`<button class="btn go" data-top="${k}">${k+1}. ${M(r[2])}<small>${esc(r[3])}</small></button>`).join('')}
const TAXS={title:'Property <i>and taxes</i>',tabs:['Totals','Who pays','Schools','Biggest'],html:taxHTML,click:e=>{const g=e.target.closest('.go2'),t=e.target.closest('[data-top]');
  if(g){closeSheet();dlSet(g.dataset.l,true);if(g.dataset.l==='hoods'||g.dataset.l.startsWith('hx_')||g.dataset.l==='pv')flyTo(camTo(-2500,-2500,g.dataset.l==='pv'?2600:11000,200,38),2200)}
  else if(t){const r=H2.tax.top[+t.dataset.top];closeSheet();flyTo(camTo(r[0],-r[1],900,200,36),2400);showCard('Assessed at '+fmtN(r[2],'$'),r[3]+'. Tap the building for its full card.')}}};
// ---- local businesses: round pillars of light, tall for local, short for chains, with ways to narrow them down
let bizOn=false,bizL=null;const bizF={who:-1,cat:-1,cu:-1,how:0,open:false,q:''};
const WHO=['Local and independent','Nebraska-born','Chains'],WHOH=[150,115,52],HOW=[[1,'Takeout'],[2,'Drive-through'],[4,'Patio'],[8,'Wi-Fi'],[16,'Delivery'],[32,'Vegetarian options'],[64,'Step-free']];
const CATCOL=[0xff6b6b,0xffb347,0xc77dff,0x7bd389,0x4cc9f0,0xf4a261,0x9aa5b1,0xff8fab,0xffd166,0x80ed99,0xa0a7b4,0x8ecae6,0xb8b8d1],CUCOL=[0xe63946,0xf4a261,0x8d5524,0xe9c46a,0xffb703,0x2a9d8f,0x9d4edd,0x457b9d,0x06d6a0,0xadb5bd];
function openNow(s,day,min){if(!s)return null;s=s.trim();if(s==='24/7')return true;const D=['Su','Mo','Tu','We','Th','Fr','Sa'];let res=null;
  for(const rule of s.split(';')){const m=/^\s*((?:(?:Mo|Tu|We|Th|Fr|Sa|Su|PH)\s*(?:-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?\s*,?\s*)*)(.*)$/.exec(rule);if(!m)return null;let days=null;
    if(m[1].trim()){days=new Set();for(const part of m[1].split(',')){const p=part.trim();if(!p||p==='PH')continue;const r=p.split('-').map(x=>D.indexOf(x.trim()));if(r.some(x=>x<0))return null;if(r.length===1)days.add(r[0]);else{let d=r[0];for(let k=0;k<7;k++){days.add(d);if(d===r[1])break;d=(d+1)%7}}}}
    const rest=m[2].trim();if(!rest)continue;const ap=!days||days.has(day),pv=!days||days.has((day+6)%7);
    if(/^(off|closed)$/i.test(rest)){if(ap&&days)res=false;continue}
    const sp=rest.split(',').map(x=>/^\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\+?\s*$/.exec(x));if(sp.some(x=>!x))return null;let op=false;
    for(const q of sp){const a=+q[1]*60+ +q[2];let b=+q[3]*60+ +q[4];if(b<=a)b+=1440;if(ap&&min>=a&&min<b)op=true;if(pv&&b>1440&&min<b-1440)op=true}
    if(op)res=true;else if(ap&&res===null)res=false}
  return res}
function bizSetup(){const B=H2.biz,n=B.n.length,q=S2.bz_xy,X=new Float32Array(n*2);for(let i=0;i<n;i++){X[2*i]=q[2*i]*H2.q;X[2*i+1]=-q[2*i+1]*H2.q}
  bizL=dlAdd({id:'biz',t:'Local businesses',g:'Local',k:'pt',n,hide:true,src:'OpenStreetMap contributors',asof:H2.man[3][3],note:'',f:[],st:{},card:bizCard},{X});
  bizL.Hh=new Float32Array(n);bizL.C=new Float32Array(n*3);bizL.Ti=new Float32Array(n);bizL.Rm=new Float32Array(n).fill(1);bizL.legend=[];
  bizL.obj=mkPillars(n,X,bizL.Hh,bizL.Rm,bizL.C,bizL.Ti);bizL.mats=[bizL.obj.material];bizL.obj.visible=false;scene.add(bizL.obj)}
function bizMatch(i,skip){const F=bizF,c=S2.bz_c[i];if(skip!=='who'&&F.who>=0&&S2.bz_w[i]!==F.who)return false;if(skip!=='cat'&&F.cat>=0&&c!==F.cat)return false;if(skip!=='cu'&&F.cat===0&&F.cu>=0&&S2.bz_g[i]!==F.cu)return false;
  if(F.how&&(S2.bz_f[i]&F.how)!==F.how)return false;if(F.q&&!H2.biz.n[i].toLowerCase().includes(F.q)&&!H2.biz.k[i].toLowerCase().includes(F.q))return false;
  if(F.open){const t=lincolnNow(),o=openNow(H2.biz.h[i],(t.dow+1)%7,Math.floor(t.sec/60));if(o!==true)return false}return true}
function bizApply(){if(!bizL)return;const n=bizL.n,g=bizL.obj.geometry,S_=g.attributes.aS.array,C=g.attributes.aC.array,food=bizF.cat===0;let shown=0,local=0;bizL.list=[];
  for(let i=0;i<n;i++){const ok=bizMatch(i),w=S2.bz_w[i];bizL.Hh[i]=ok?WHOH[w]:0;S_[2*i]=bizL.Hh[i];S_[2*i+1]=w===2?.75:1;const c=c3(food?CUCOL[Math.min(9,S2.bz_g[i])]:CATCOL[S2.bz_c[i]]);C[3*i]=c[0];C[3*i+1]=c[1];C[3*i+2]=c[2];if(ok){shown++;if(w<2)local++;bizL.list.push(i)}}
  g.attributes.aS.needsUpdate=true;g.attributes.aC.needsUpdate=true;bizL.shown=shown;bizL.local=local;dirty=true}
function bizCount(kind,v){let n=0;const sv=bizF[kind];bizF[kind]=v;for(let i=0;i<bizL.n;i++)if(bizMatch(i))n++;bizF[kind]=sv;return n}
function bizRender(){const B=H2.biz,F=bizF,h=$('bizb');if(!bizL)return;const chip=(k,v,l,on,n,col)=>`<button class="bzc${on?' on':''}" data-k="${k}" data-v="${v}">${col?`<i style="background:${col}"></i>`:''}${l}${n!==undefined?` <small>${n}</small>`:''}</button>`;
  const t=controls.target,d2=i=>(bizL.X[2*i]-t.x)**2+(bizL.X[2*i+1]-t.z)**2,list=bizL.list.slice().sort((a,b)=>d2(a)-d2(b)),hx=c=>'#'+c.toString(16).padStart(6,'0');
  let s=`<div class="bzs"><b>${bizL.shown.toLocaleString('en-US')}</b> places · <b>${bizL.local.toLocaleString('en-US')}</b> local or Nebraska-born</div>`;
  s+='<div class="bzr"><em>Who</em>'+chip('who',-1,'All',F.who<0)+WHO.map((w,i)=>chip('who',i,w,F.who===i,bizCount('who',i))).join('')+'</div>';
  s+='<div class="bzr"><em>What</em>'+chip('cat',-1,'Everything',F.cat<0)+B.cats.map((c,i)=>{const n=bizCount('cat',i);return n||F.cat===i?chip('cat',i,c,F.cat===i,n,hx(CATCOL[i])):''}).join('')+'</div>';
  if(F.cat===0)s+='<div class="bzr"><em>Food</em>'+chip('cu',-1,'Any kind',F.cu<0)+B.cuis.map((c,i)=>{const n=bizCount('cu',i);return n||F.cu===i?chip('cu',i,c,F.cu===i,n,hx(CUCOL[i])):''}).join('')+'</div>';
  s+='<div class="bzr"><em>How</em>'+chip('open',1,'Open now',F.open)+HOW.map(([m,l])=>chip('how',m,l,!!(F.how&m))).join('')+'</div>';
  s+='<div class="bzl">'+(list.length?list.slice(0,60).map(i=>{const m=Math.sqrt(d2(i));return `<button class="bzi" data-i="${i}"><b>${esc(B.n[i])}</b><small>${esc(nice(B.k[i])||B.cats[S2.bz_c[i]])} · ${WHO[S2.bz_w[i]].toLowerCase()} · ${m<160?Math.round(m*3.281/10)*10+' ft':(m/1609.344).toFixed(1)+' mi'}</small></button>`}).join('')+(list.length>60?`<p class="bzn">Nearest 60 of ${list.length} shown. Move the map or narrow it down to see others.</p>`:''):'<p class="bzn">Nothing matches. Loosen a filter.</p>');
  s+='<p class="bzn">Tall pillars are local, short ones are chains. A place counts as local when OpenStreetMap lists no chain brand for it. Nebraska-born is a short hand-checked list (Runza, Valentino\'s, Amigos, Scooter\'s and others). This is what volunteers have mapped so far, not every business in Lincoln, and the "how" tags exist only where someone recorded them. <a href="https://www.openstreetmap.org/#map=14/40.8136/-96.7026" target="_blank" rel="noopener noreferrer">Add or fix a place ↗</a></p></div>';
  h.innerHTML=s}
function bizCard(L,i){const B=H2.biz,w=S2.bz_w[i],fl=S2.bz_f[i],t=lincolnNow(),o=openNow(B.h[i],(t.dow+1)%7,Math.floor(t.sec/60)),p=[];
  p.push(B.cats[S2.bz_c[i]]+(B.k[i]?' ('+nice(B.k[i]).toLowerCase()+')':''));p.push(w===0?'local or independent: OpenStreetMap lists no chain brand for it':w===1?'Nebraska-born, started in '+B.nb[i]:'part of a chain');
  if(B.a[i])p.push(B.a[i]);if(B.h[i])p.push((o===true?'open now':o===false?'closed now':'hours')+': '+B.h[i]);const how=HOW.filter(([m])=>fl&m).map(q=>q[1].toLowerCase());if(how.length)p.push(how.join(', '));
  const links=[];if(B.u[i])links.push({href:B.u[i],label:'Website ↗'});links.push({href:`https://www.google.com/maps/dir/?api=1&destination=${(H.lat0-L.X[2*i+1]/KYm).toFixed(6)},${(H.lon0+L.X[2*i]/KXm).toFixed(6)}`,label:'Directions ↗'});
  const ty={n:'node',w:'way',r:'relation'}[B.o[i][0]];links.push({href:`https://www.openstreetmap.org/${ty}/${B.o[i].slice(1)}`,label:'Fix on OpenStreetMap ↗'});
  showCard(B.n[i],p.join(' · ')+'. From OpenStreetMap volunteers, as of '+L.def.asof+'.',undefined,undefined,links)}
function setBiz(on){if(!H2)return;if(on&&!bizL)bizSetup();bizOn=on;$('bBiz').classList.toggle('on',on);$('biz').style.display=on?'flex':'none';$('biz').classList.remove('min');
  if(on){bizApply();dlSet('biz',true,true);bizRender();if(camera.position.distanceTo(controls.target)>9000)flyTo(camTo(-4700,-4300,3800,205,40),2200)}else{dlSet('biz',false);hideCard()}dirty=true}
function bizWire(){$('bBiz').onclick=()=>setBiz(!bizOn);$('bizx').onclick=()=>setBiz(false);$('bizm').onclick=()=>{const m=$('biz').classList.toggle('min');$('bizm').textContent=m?'Show list ▸':'◂ Hide list';if(!m)bizRender()};
  $('bizq').oninput=e=>{bizF.q=e.target.value.trim().toLowerCase();bizApply();bizRender()};
  $('bizb').addEventListener('click',e=>{const c=e.target.closest('.bzc'),it=e.target.closest('.bzi');
    if(c){const k=c.dataset.k,v=+c.dataset.v;if(k==='how')bizF.how^=v;else if(k==='open')bizF.open=!bizF.open;else{bizF[k]=bizF[k]===v?-1:v;if(k==='cat')bizF.cu=-1}bizApply();bizRender()}
    else if(it){const i=+it.dataset.i;if(mobile){$('biz').classList.add('min');$('bizm').textContent='Show list ▸'}flyTo(camTo(bizL.X[2*i],bizL.X[2*i+1],420,200,34),1800);bizCard(bizL,i)}})}
// ---- traffic cameras: the picture or live view opens beside the map
let camT=0;
function closeCam(){$('cam').style.display='none';$('camv').textContent='';clearInterval(camT)}
function camCard(L,i){const g=k=>fget(L,L.fields.find(f=>f.k===k))(i),name=g('name'),by=g('by'),url=g('url'),img=g('img'),v=$('camv');v.textContent='';clearInterval(camT);$('camt').textContent=name;
  if(img){const im=document.createElement('img');im.alt='Traffic camera at '+name;const load=()=>{im.src=img+(img.includes('?')?'&':'?')+'t='+Date.now()};load();camT=setInterval(load,30000);v.appendChild(im)}
  else if(url){const fr=document.createElement('iframe');fr.src=url;fr.title='Live traffic camera at '+name;fr.setAttribute('allow','autoplay; fullscreen');fr.referrerPolicy='no-referrer';v.appendChild(fr)}
  const a=$('cama');a.href=url||img;a.textContent=url?'Open the live view in a new tab ↗':'Open the picture in a new tab ↗';$('cam').style.display='flex';
  showCard(name,'Traffic camera run by '+(by==='Nebraska DOT'?'the Nebraska Department of Transportation. The picture refreshes about every half minute.':'the City of Lincoln. The live view comes straight from the city\'s camera server and may take a moment to start.')+' Nothing from the camera is stored by this map. If the view stays blank, use the button to open it in a new tab.',undefined,undefined,[{href:url||img,label:url?'Live view ↗':'Picture ↗'}])}
