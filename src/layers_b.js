
// ---- the layer registry
const shortN=(v,u)=>u==='$'?(v>=1e9?'$'+(v/1e9).toFixed(1)+'B':v>=1e6?'$'+(v/1e6).toFixed(v>=1e7?0:1)+'M':v>=1e4?'$'+Math.round(v/1e3)+'k':'$'+Math.round(v).toLocaleString('en-US')):u==='%'?Math.round(v)+'%':(v>=100?Math.round(v).toLocaleString('en-US'):String(Math.round(v*10)/10));
function fget(L,f){if(f.t==='s')return i=>f.v[i];if(f.t==='c'){const a=S2[f.s];return i=>f.d[a[i]]}const a=f.arr||(f.s?S2[f.s]:f.v);return i=>a[i]}
function dlAdd(def,geom){const L={def,id:def.id,n:def.n,on:false,obj:null,fields:def.f||[]};Object.assign(L,geom||{});
  if(!geom){const q=H2.q;
    if(def.k==='pt'||def.k==='ln'||def.k==='pg'){const s=S2[def.id+'_xy'];L.X=new Float32Array(s.length);for(let i=0;i<s.length;i+=2){L.X[i]=s[i]*q;L.X[i+1]=-s[i+1]*q}}
    if(def.k==='ln')L.N=S2[def.id+'_n'];
    if(def.k==='pg'){L.RC=S2[def.id+'_r'];L.RN=S2[def.id+'_n']}}
  if(L.X)dlIndex(L);
  DL.set(def.id,L);return L}
function dlStyle(L){const st=L.def.st,n=L.n,Hh=new Float32Array(n),C=new Float32Array(n*3),Ti=new Float32Array(n);let legend=[];const grey=[.62,.64,.68];
  const cf=st.c?L.fields.find(q=>q.k===st.c):null;
  if(cf&&cf.t!=='n'){const get=fget(L,cf),cats=cf.t==='c'?cf.d.slice():[...new Set(cf.v)],ix=new Map(cats.map((c,i)=>[c,i])),cnt=new Array(cats.length).fill(0);
    const cols=cats.map((c,i)=>c3(st.pal&&st.pal!=='auto'&&st.pal[c]!==undefined?st.pal[c]:AUTOPAL[i%AUTOPAL.length]));
    for(let i=0;i<n;i++){const k=ix.get(get(i));Ti[i]=k;C.set(cols[k],3*i);cnt[k]++}
    legend=cats.map((c,i)=>({l:c||'Not listed',c:cols[i],n:cnt[i],t:i})).filter(q=>q.n)}
  else if(cf){const get=fget(L,cf),vals=[];for(let i=0;i<n;i++){const v=get(i);if(v>0)vals.push(v)}vals.sort((a,b)=>a-b);
    let br=st.tiers;if(!br){br=[];for(const p of [.2,.4,.6,.8]){const v=vals[Math.min(vals.length-1,Math.floor(p*vals.length))];if(v!==undefined&&(!br.length||v>br[br.length-1]))br.push(v)}}
    const nT=br.length+1,cnt=new Array(nT+1).fill(0);
    for(let i=0;i<n;i++){const v=get(i);if(!(v>0)){Ti[i]=nT;C.set(grey,3*i);cnt[nT]++;continue}let t=0;while(t<br.length&&v>=br[t])t++;Ti[i]=t;C.set(rampAt(st.ramp,nT>1?t/(nT-1):.5),3*i);cnt[t]++}
    const u=cf.u;for(let t=0;t<nT;t++)legend.push({l:t===0?'under '+shortN(br[0],u):t===nT-1?shortN(br[t-1],u)+' and up':shortN(br[t-1],u)+' to '+shortN(br[t],u),c:rampAt(st.ramp,nT>1?t/(nT-1):.5),n:cnt[t],t});
    if(cnt[nT])legend.push({l:'no figure',c:grey,n:cnt[nT],t:nT});L.cap=vals.length?vals[Math.min(vals.length-1,Math.floor(.985*vals.length))]:1}
  else{const c=c3(st.col||0x4cc9f0);for(let i=0;i<n;i++)C.set(c,3*i)}
  if(typeof st.h==='number')Hh.fill(st.h);
  else{const hf=L.fields.find(q=>q.k===st.h),get=fget(L,hf);let cap=st.hcap;if(!cap){const v=[];for(let i=0;i<n;i++){const x=get(i);if(x>0)v.push(x)}v.sort((a,b)=>a-b);cap=v.length?v[Math.min(v.length-1,Math.floor(.985*v.length))]:1}
    const hm=SKY*(st.hk||1),g=st.g||1,tf=st.hf;for(let i=0;i<n;i++){let v=get(i);if(tf)v=tf(v);Hh[i]=v>0?Math.max(5,hm*Math.pow(Math.min(st.hover||1.25,v/cap),g)):(L.def.k==='hx'?0:3)}}
  L.Hh=Hh;L.C=C;L.Ti=Ti;L.legend=legend}
function dlBuild(L){dlStyle(L);const k=L.def.k,st=L.def.st;
  if(k==='pt'){if(st.r&&st.r!==1){L.Rm=new Float32Array(L.n).fill(st.r)}L.obj=mkPillars(L.n,L.X,L.Hh,L.Rm,L.C,L.Ti,{bar:st.bar})}
  else if(k==='ln')L.obj=mkWalls(L.N,L.X,L.Hh,L.C,L.Ti,false);
  else if(k==='pg'){L.flat=typeof st.h==='number';L.obj=mkPrisms(L,L.Hh,L.C,L.Ti,L.flat)}
  else if(k==='hx')L.obj=mkHex(L);
  L.mats=(L.obj.userData&&L.obj.userData.mats)||[L.obj.material];L.obj.visible=false;scene.add(L.obj);
  if(st.label&&k==='pg'){const f=L.fields.find(q=>q.k===st.label),get=fget(L,f);L.lbl=[];for(let i=0;i<L.n;i++){const r=ringsOf(L,i)[0];let sx=0,sz=0;for(const p of r){sx+=p[0];sz+=p[1]}sx/=r.length;sz/=r.length;L.lbl.push({t:String(get(i)),x:sx,y:hAt(sx,sz)+30,z:sz,k:3,pri:520,near:0,far:14000})}}}
function dlSet(id,on,quiet){const L=DL.get(id);if(!L)return;if(on&&!L.obj){if(L.def.live&&!L.loaded){dlLive(L,quiet);return}dlBuild(L)}
  if(L.on===on)return;L.on=on;if(L.obj)L.obj.visible=on;const k=dlOn.indexOf(L);if(on&&k<0)dlOn.push(L);if(!on&&k>=0)dlOn.splice(k,1);
  dlLabels.length=0;for(const q of dlOn)if(q.lbl)for(const l of q.lbl)dlLabels.push(l);
  if(on){dlTop=L;for(const m of L.mats)m.uniforms.uSolo.value=-1;L.solo=-1;hsFit(L)}else if(dlTop===L)dlTop=dlOn[dlOn.length-1]||null;
  dlLegend();if(on&&!quiet)dlIntro(L);if(L.def.onSet)L.def.onSet(on,L);lastInput=performance.now();dirty=true}
function dlIntro(L){const d=L.def;showCard(d.t,(d.note||'')+' '+(d.k!=='fn'&&typeof d.st.h!=='number'?(d.id==='pv'?'Height is in straight proportion to value: a quarter mile for every $1 million, seen from about two miles out, and it follows your zoom so the picture holds as you move in. Anything above $6 million is drawn at the $6 million height. The gold ring on the ground marks the area being totaled in the gold box. ':'The tallest stand about a quarter mile high and fade into the sky, and they follow your zoom so the picture holds as you move in. '):'')+(L.n?L.n.toLocaleString('en-US')+(d.k==='hx'?' hexagons':d.k==='pt'?' points':d.k==='ln'?' segments':' areas')+'. ':'')+'Tap one for its numbers. Source: '+d.src+(d.asof?(d.asof==='live'?', read live just now':', as of '+d.asof):'')+'.')}
// keep heights and widths readable at every zoom, and apply the two sliders
function dlFrame(){if(!dlOn.length)return;const d=camera.position.distanceTo(controls.target);
  for(const L of dlOn){const k=L.def.k,num=typeof L.def.st.h!=='number',z=L.flat?Math.min(6,Math.max(.6,d/1500)):Math.min(5.5,Math.max(.08,d/(k==='pt'&&!num?2500:k==='ln'&&!num?3000:3600)));L.hs=dlHS*z; // heights follow the zoom, so a bar covers the same share of the screen near or far: a true quarter mile for the tallest from about two miles out
    for(const m of L.mats){const u=m.uniforms;u.uHS.value=L.hs;u.uA.value=dlAL*dlAuto*(L.def.st.a?L.def.st.a/.55:1);u.uR.value=Math.min(34,Math.max(2.2,d*.0017))}
    if(L.obj.userData&&L.obj.userData.haze)L.obj.userData.haze.material.opacity=Math.min(1,.85*dlAL)}}
// ---- finding what was tapped
function dlGrid(L){if(L.grid)return L.grid;const g=new Map(),cs=160,add=(i,x0,z0,x1,z1)=>{for(let a=Math.floor(x0/cs);a<=Math.floor(x1/cs);a++)for(let b=Math.floor(z0/cs);b<=Math.floor(z1/cs);b++){const k=a*4096+b;let l=g.get(k);if(!l){l=[];g.set(k,l)}l.push(i)}};
  if(L.def.k==='pg')for(let i=0;i<L.n;i++){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,o=L.xo[i];const n=L.RN[L.ro[i]];for(let j=0;j<n;j++){const x=L.X[o+2*j],z=L.X[o+2*j+1];if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z}add(i,x0,z0,x1,z1)}
  else for(let i=0;i<L.N.length;i++){const o=L.lo[i];for(let j=1;j<L.N[i];j++){const ax=L.X[o+2*j-2],az=L.X[o+2*j-1],bx=L.X[o+2*j],bz=L.X[o+2*j+1];add(i*65536+j,Math.min(ax,bx)-30,Math.min(az,bz)-30,Math.max(ax,bx)+30,Math.max(az,bz)+30)}}
  L.grid={g,cs};return L.grid}
function pinR(x,z,r){let ins=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const xi=r[i][0],zi=r[i][1],xj=r[j][0],zj=r[j][1];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)ins=!ins}return ins}
function dlAt(L,x,z){if(L.def.k==='hx'){const i=hexIdx(x,z);return i>=0&&L.Hh[i]>0?i:-1}
  const G=dlGrid(L),l=G.g.get(Math.floor(x/G.cs)*4096+Math.floor(z/G.cs));if(!l)return -1;let best=-1,ba=1e18;
  for(const i of l){const rs=ringsOf(L,i);if(!pinR(x,z,rs[0]))continue;let hole=false;for(let k=1;k<rs.length;k++)if(pinR(x,z,rs[k])){hole=true;break}if(hole)continue;
    let a=0;const r=rs[0];for(let q=0;q<r.length;q++){const p=r[q],p2=r[(q+1)%r.length];a+=p[0]*p2[1]-p2[0]*p[1]}a=Math.abs(a);if(a<ba){ba=a;best=i}}return best}
function dlNearLine(L,x,z,tol){const G=dlGrid(L),l=G.g.get(Math.floor(x/G.cs)*4096+Math.floor(z/G.cs));if(!l)return -1;let best=-1,bd=tol;
  for(const code of l){const i=(code/65536)|0,j=code%65536,o=L.lo[i],ax=L.X[o+2*j-2],az=L.X[o+2*j-1],bx=L.X[o+2*j],bz=L.X[o+2*j+1],dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/((dx*dx+dz*dz)||1))),d=Math.hypot(x-ax-dx*t,z-az-dz*t);if(d<bd){bd=d;best=i}}return best}
const dlV=new THREE.Vector3(),dlV2=new THREE.Vector3();
function dlPick(cx,cy,solid){if(!dlOn.length)return false;const o=ray.ray.origin,d=ray.ray.direction;let best=null;const vis=(L,i)=>L.solo===undefined||L.solo<0||L.Ti[i]===L.solo;
  if(solid){for(const L of dlOn){if(L.def.k!=='pt'||L.noPick)continue;const X=L.X;for(let i=0;i<L.n;i++){if(!(L.Hh[i]>0)||!vis(L,i))continue;const x=X[2*i],z=X[2*i+1],y=hAt(x,z);dlV.set(x,y,z).project(camera);if(dlV.z>1||dlV.z<-1)continue;
        dlV2.set(x,y+L.Hh[i]*L.hs,z).project(camera);const ax=(dlV.x*.5+.5)*innerWidth,ay=(-dlV.y*.5+.5)*innerHeight,bx=(dlV2.x*.5+.5)*innerWidth,by=(-dlV2.y*.5+.5)*innerHeight,ux=bx-ax,uy=by-ay,t=Math.max(0,Math.min(1,((cx-ax)*ux+(cy-ay)*uy)/((ux*ux+uy*uy)||1))),dd=Math.hypot(cx-ax-ux*t,cy-ay-uy*t);
        if(dd<(mobile?18:12)){const dist=Math.hypot(x-o.x,y-o.y,z-o.z)+dd*.5;if(!best||dist<best.t)best={L,i,t:dist}}}}
    const ext=dlOn.filter(L=>L.def.k==='hx'||(L.def.k==='pg'&&!L.flat));
    if(ext.length){const gp=groundPoint(),tMax=(gp?gp.t:26000)+80;for(let t=6;t<tMax;t+=Math.max(2.5,t*.004)){const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t;let hit=null;
        for(const L of ext){const i=dlAt(L,x,z);if(i<0||!vis(L,i))continue;const top=L.def.k==='hx'?hAt(...hexXZ(S2.hx_i[i]))+1+Math.max(2,L.Hh[i]*L.hs):L.top[i]+1+L.Hh[i]*L.hs;if(y<=top){hit={L,i,t};break}}
        if(hit){if(!best||hit.t<best.t)best=hit;break}}}}
  else{const gp=groundPoint();if(gp)for(let q=dlOn.length-1;q>=0&&!best;q--){const L=dlOn[q];if(L.def.k==='pg'&&L.flat){const i=dlAt(L,gp.x,gp.z);if(i>=0&&vis(L,i))best={L,i,t:gp.t}}else if(L.def.k==='ln'){const i=dlNearLine(L,gp.x,gp.z,Math.max(16,gp.t*.016));if(i>=0&&vis(L,i))best={L,i,t:gp.t}}}}
  if(!best)return false;dlCard(best.L,best.i);return true}
function dlCard(L,i){const d=L.def;if(d.card){d.card(L,i);return}let title=d.t;const parts=[],links=[];
  L.fields.forEach((f,fi)=>{const v=fget(L,f)(i);if(v===undefined||v===null||v===''||v===0)return;if(f.k==='url'){links.push({href:String(v),label:'More about this ↗'});return}if(f.k==='img')return;
    if(f.t==='n')parts.push(f.l+': '+fmtN(v,f.u,f.k));else if(fi===0&&f.t==='s')title=String(v);else parts.push(f.l+': '+v)});
  showCard(title,(title!==d.t?d.t+'. ':'')+parts.join(' · ')+(parts.length?'. ':'')+'Source: '+d.src+(d.asof&&d.asof!=='live'?', as of '+d.asof:'')+'.',undefined,undefined,links)}
// ---- the key for the layer on top: tiers you can tap to single out, and the two sliders
function dlLegend(){const h=$('dlg');$('bottom').classList.toggle('haslayer',!!dlTop);if(!dlTop){h.style.display='none';layoutCard();return}const L=dlTop;h.style.display='block';
  let s=`<div class="dlh"><b>${esc(L.def.t)}</b>${dlOn.length>1?`<span class="dlc">+${dlOn.length-1} more on</span>`:''}<button class="dlb" data-a="info" aria-label="About this layer">i</button><button class="dlb" data-a="off" aria-label="Turn this layer off">×</button></div>`;
  if(L.legend&&L.legend.length)s+='<div class="dlt">'+L.legend.map(q=>`<button class="dlk${L.solo===q.t?' on':''}" data-t="${q.t}"><i style="background:${hex6(q.c)}"></i>${esc(q.l)}</button>`).join('')+'</div>';
  s+=`<div class="dls"><label>Height<input type="range" min="20" max="320" value="${Math.round(dlHS*100)}" data-s="h" aria-label="Height of the data"></label><label>See-through<input type="range" min="0" max="90" value="${Math.round((1-dlAL/1.4)*100)}" data-s="a" aria-label="How see-through the data is"></label></div>`;
  h.innerHTML=s;layoutCard()}
function dlSolo(L,t){if(!L.mats||!L.mats.length)return;L.solo=L.solo===t?-1:t;for(const m of L.mats)m.uniforms.uSolo.value=L.solo;dlLegend();dirty=true}
function dlWire(){const h=$('dlg');
  h.addEventListener('click',e=>{const k=e.target.closest('.dlk'),b=e.target.closest('.dlb');if(k&&dlTop)dlSolo(dlTop,+k.dataset.t);else if(b&&dlTop){if(b.dataset.a==='off')dlSet(dlTop.id,false);else dlIntro(dlTop)}});
  h.addEventListener('input',e=>{const s=e.target.dataset.s;if(!s)return;if(s==='h'){dlHS=+e.target.value/100;dlHSuser=true}else dlAL=1.4*(1-(+e.target.value)/100);lastInput=performance.now();dirty=true})}
// ---- the Layers sheet
const DLG=['Property and taxes','People','Getting around','Places','Environment'];
function layHTML(){let s='<p>Every dataset behind the map, each with a 3D form. Turn on as many as you like. The newest one gets the key at the bottom, where you can tap a tier to single it out and slide the height and see-through bars.</p><button class="btn" data-id="__tax">Open the property and taxes explorer</button>';
  for(const g of DLG){const ls=[...DL.values()].filter(L=>L.def.g===g&&!L.def.hide);if(!ls.length)continue;s+=`<h4>${g}</h4><div class="lyg">`+ls.map(L=>`<button class="btn lyb${L.on?' on':''}" data-id="${L.id}">${esc(L.def.t)}${L.def.live?' <small>live</small>':''}</button>`).join('')+'</div>'}
  return s+'<h4>&nbsp;</h4><button class="btn" data-id="__off">Turn every layer off</button> <button class="btn" data-id="__done">Done</button>'}
const LAYS={title:'Data <i>layers</i>',tabs:['Layers'],html:layHTML,click:e=>{const b=e.target.closest('[data-id]');if(!b)return;const id=b.dataset.id;if(id==='__done'){closeSheet();return}if(id==='__tax'){openSheet(TAXS);return}
  if(id==='__off'){for(const L of dlOn.slice())dlSet(L.id,false);hideCard();openSheet(LAYS);return}const L=DL.get(id);dlSet(id,!L.on,true);b.classList.toggle('on',DL.get(id).on||!!DL.get(id).loading)}};
