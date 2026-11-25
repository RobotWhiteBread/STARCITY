// ---- Squares: zoomed in, the map lays a quarter-mile grid over the city (Lincoln's streets run a mile apart, so four squares to a mile).
// The square under the middle of the screen lights up with a few quick numbers. Add up to four to a cart and compare them side by side,
// then dive into any one. Every number is a count of public records inside the square. Police reports are never counted by square:
// they stay by district, so nothing points at a household.
const SQR={S:402.336,cart:[],grid:null,hi:null,fills:[],key:'',ui:null,cur:null,on:false,pend:false};
const SQCOL=[0xef4444,0x3b82f6,0x22c55e,0xa855f7],SQHEX=['#ef4444','#3b82f6','#22c55e','#a855f7'],SQRL='ABCD';
function sqCell(x,z){return [Math.floor(x/SQR.S),Math.floor(z/SQR.S)]}
function sqDrape(i,j,y0){const S=SQR.S,n=10,P=[],I=[];for(let a=0;a<=n;a++)for(let b=0;b<=n;b++){const x=(i+a/n)*S,z=(j+b/n)*S;P.push(x,hAt(x,z)+(y0||3),z)}
  for(let a=0;a<n;a++)for(let b=0;b<n;b++){const k=a*(n+1)+b;I.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);return g}
function sqEdge(i,j,y0){const S=SQR.S,P=[],n=16,pt=(x,z)=>P.push(x,hAt(x,z)+(y0||4),z);
  for(const [x0,z0,x1,z1] of [[0,0,1,0],[1,0,1,1],[1,1,0,1],[0,1,0,0]])for(let k=0;k<n;k++){const a=k/n,b=(k+1)/n;pt((i+x0+(x1-x0)*a)*S,(j+z0+(z1-z0)*a)*S);pt((i+x0+(x1-x0)*b)*S,(j+z0+(z1-z0)*b)*S)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));return g}
function sqGrid(ci,cj){if(SQR.grid){scene.remove(SQR.grid);SQR.grid.geometry.dispose()}const S=SQR.S,R=4,P=[],n=12;
  for(let a=-R;a<=R+1;a++)for(let k=0;k<(2*R+1)*n;k++){const t0=(cj-R)+k/n,t1=(cj-R)+(k+1)/n,x=(ci+a)*S;P.push(x,hAt(x,t0*S)+3,t0*S,x,hAt(x,t1*S)+3,t1*S);const z=(cj+a)*S,u0=(ci-R)+k/n,u1=(ci-R)+(k+1)/n;P.push(u0*S,hAt(u0*S,z)+3,z,u1*S,hAt(u1*S,z)+3,z)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));SQR.grid=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xffe08a,transparent:true,opacity:.28,depthWrite:false,fog:false}));scene.add(SQR.grid)}
function sqName(i,j){const cx=(i+.5)*SQR.S,cz=(j+.5)*SQR.S,c=new Map();try{for(let k=0;k<12;k++){const a=k*.5236,r=k%2?90:170,s=streetNear(cx+Math.cos(a)*r,cz+Math.sin(a)*r,220);if(s&&s.name)c.set(s.name,(c.get(s.name)||0)+1)}}catch(e){}
  const L=[...c.entries()].sort((a,b)=>b[1]-a[1]).map(q=>q[0]);return L.length>1?L[0]+' and '+L[1]:L.length?'near '+L[0]:'Square '+i+','+j}
// what sits inside one square, from the public records already on the map
function sqStats(i,j){const Q=SQR.S,x0=i*Q,z0=j*Q,x1=x0+Q,z1=z0+Q,inn=(x,z)=>x>=x0&&x<x1&&z>=z0&&z<z1,o={i,j};
  let nb=0,old=0;const yrs=[];if(LM.bc){const bc=LM.bc,n=bc.length/2;for(let b=0;b<n;b++){if(!inn(bc[2*b],bc[2*b+1]))continue;nb++;const y=S.b_yr?S.b_yr[b]:0;if(y>1800){yrs.push(y);if(y<1950)old++}}}
  yrs.sort((a,b)=>a-b);o.bld=nb;o.yr=yrs.length?yrs[yrs.length>>1]:null;o.old=yrs.length?Math.round(100*old/yrs.length):null;
  o.tree=0;if(TR.X)for(let k=0;k<TR.n;k++)if(inn(TR.X[2*k],TR.X[2*k+1]))o.tree++;
  o.lead=0;o.galv=0;if(LD.d){const {n,xz,c}=LD.d;for(let k=0;k<n;k++)if(inn(xz[2*k]*2,xz[2*k+1]*2)){if(c[k]===1)o.lead++;else o.galv++}}
  o.fix=null;o.fixOpen=0;if(UP.d){o.fix=0;const top=new Map();for(const p of UP.d.pts){const x=(p[0]-H.lon0)*KXm,z=-(p[1]-H.lat0)*KYm;if(!inn(x,z))continue;o.fix+=p[3];o.fixOpen+=p[4]||0;top.set(p[2],(top.get(p[2])||0)+p[3])}
    const t=[...top.entries()].sort((a,b)=>b[1]-a[1])[0];o.fixTop=t&&UP.d.street_groups?UP.d.street_groups[t[0]]:null}
  o.crash=null;if(CRASH.d){o.crash=0;const X=CRASH.d.X;for(let k=0;k<CRASH.d.n;k++)if(inn(X[2*k],X[2*k+1]))o.crash++}
  o.newb=null;o.gone=null;if(GR.d){o.newb=0;o.gone=0;const d=GR.d;for(let k=0;k<d.n;k++)if(inn(d.xy[2*k]*2,d.xy[2*k+1]*2))o.newb++;for(let k=0;k<d.g;k++)if(inn(d.gxy[2*k]*2,d.gxy[2*k+1]*2))o.gone++}
  return o}
function sqLoadAll(){if(SQR.pend)return;SQR.pend=true;Promise.all([ldLoad(),upLoad(),grLoad(),crashLoad()]).then(()=>{SQR.ready=true;SQR.key='';if(sheet===SQRS)$('gbody').innerHTML=sqHTML(0)})}
function sqUI(){if(SQR.ui)return SQR.ui;const d=document.createElement('div');d.id='sqbar';d.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:132px;z-index:30;display:none;gap:6px;align-items:center;background:rgba(14,16,20,.88);border:1px solid rgba(233,185,73,.55);border-radius:14px;padding:8px 10px;color:#f2eadb;font:13px system-ui,sans-serif;max-width:94vw;flex-wrap:wrap;justify-content:center;pointer-events:auto';
  d.innerHTML='<span id="sqtxt" style="max-width:52vw"></span><button class="btn" id="sqadd">＋ Add square</button><button class="btn" id="sqcmp" style="display:none"></button>';document.body.appendChild(d);
  d.querySelector('#sqadd').onclick=()=>{const c=SQR.cur;if(!c)return;const k=SQR.cart.findIndex(q=>q.i===c[0]&&q.j===c[1]);if(k>=0)SQR.cart.splice(k,1);else{if(SQR.cart.length>=4)SQR.cart.shift();SQR.cart.push({i:c[0],j:c[1],name:sqName(c[0],c[1])})}sqFills();sqTxt();sqLoadAll();lastInput=performance.now()};
  d.querySelector('#sqcmp').onclick=()=>{sqLoadAll();openSheet(SQRS,0)};SQR.ui=d;return d}
function sqFills(){for(const m of SQR.fills){scene.remove(m);m.geometry.dispose()}SQR.fills=[];SQR.cart.forEach((q,k)=>{const f=new THREE.Mesh(sqDrape(q.i,q.j,2.5),new THREE.MeshBasicMaterial({color:SQCOL[k],transparent:true,opacity:.28,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  const e=new THREE.LineSegments(sqEdge(q.i,q.j,5),new THREE.LineBasicMaterial({color:SQCOL[k],fog:false}));scene.add(f);scene.add(e);SQR.fills.push(f,e);
  SQR.lbs=SQR.cart.map((q,k)=>({t:'Square '+SQRL[k],sub:q.name,x:(q.i+.5)*SQR.S,y:hAt((q.i+.5)*SQR.S,(q.j+.5)*SQR.S)+60,z:(q.j+.5)*SQR.S,k:3,pri:900,near:0,far:9000}))});if(!SQR.cart.length)SQR.lbs=[];dirty=true}
function sqTxt(){const u=sqUI(),c=SQR.cur;if(!c)return;const inC=SQR.cart.findIndex(q=>q.i===c[0]&&q.j===c[1]);const s=SQR.quick;
  u.querySelector('#sqtxt').textContent=(s?`${s.name}: ${psN(s.bld)} buildings`+(s.yr?`, built ${s.yr} typical`:'')+(s.tree?`, ${psN(s.tree)} city trees`:'')+(s.lead+s.galv?`, ${s.lead+s.galv} lead or galvanized lines`:''):'');
  u.querySelector('#sqadd').textContent=inC>=0?'− Remove square '+SQRL[inC]:'＋ Add square'+(SQR.cart.length>=4?' (replaces A)':'');
  const b=u.querySelector('#sqcmp');b.style.display=SQR.cart.length?'':'none';b.textContent='Compare '+SQR.cart.length+(SQR.cart.length===1?' square':' squares')}
function stepSquares(dt,now){const t=controls.target,d=camera.position.distanceTo(t),on=d<3400&&!walk.on&&!walk.sky&&!(typeof AR!=='undefined'&&AR.on);
  if(!on){if(SQR.on){SQR.on=false;if(SQR.grid)SQR.grid.visible=false;if(SQR.hi)SQR.hi.visible=false;if(SQR.ui)SQR.ui.style.display='none';dirty=true}if(SQR.lbs)for(const l of SQR.lbs)lifeLabels.push(l);return}
  if(!SQR.on){SQR.on=true;sqUI().style.display='flex';SQR.key=''}{const sh=$('guide').style.display==='block',u=sqUI();if(sh!==(u.style.display==='none'))u.style.display=sh?'none':'flex'}const c=sqCell(t.x,t.z),key=c[0]+','+c[1];
  if(key!==SQR.key){SQR.key=key;SQR.cur=c;sqGrid(c[0],c[1]);SQR.grid.visible=true;if(SQR.hi){scene.remove(SQR.hi);SQR.hi.geometry.dispose()}
    SQR.hi=new THREE.Mesh(sqDrape(c[0],c[1],2),new THREE.MeshBasicMaterial({color:0xffd166,transparent:true,opacity:.2,depthWrite:false,fog:false,side:THREE.DoubleSide}));scene.add(SQR.hi);
    const s=sqStats(c[0],c[1]);s.name=sqName(c[0],c[1]);SQR.quick=s;sqTxt();dirty=true}
  // the square under the middle of the screen breathes so you can see which one you are on
  if(SQR.hi){SQR.hi.visible=true;SQR.hi.material.opacity=.14+.1*Math.sin(now*.004);ambient=true}if(SQR.lbs)for(const l of SQR.lbs)lifeLabels.push(l)}
// side by side: each row is one measure, each column one square, with a bar scaled to the biggest in the row
function sqHTML(tab){if(tab===1)return '<p>Squares are a quarter mile on a side, lined up with Lincoln\'s mile grid of arterial streets, so four make a mile. Zoom in and the square under the middle of your screen lights up; add up to four and compare them.</p><p>Every number counts public records whose map point falls inside the square: buildings and the year the county lists them built, the city\'s street and park tree list, the city\'s service line records, UPLNK fix-it requests (2022 on), crash reports (2024 to mid 2026), and buildings that appear or disappear between the 2007 and 2026 footprint maps.</p><p><b>Police reports are never counted by square.</b> A square can hold only a few homes, so police data stays by district and citywide, where it cannot point at a household. See Public safety.</p>';
  if(!SQR.cart.length)return '<p>Zoom in on any part of Lincoln. The square in the middle of your screen lights up; tap <b>＋ Add square</b> to put it in the cart, move, and add another. Up to four, then compare them here.</p>';
  if(!SQR.ready)return '<p>Counting the records in your squares…</p>';
  const st=SQR.cart.map(q=>Object.assign(sqStats(q.i,q.j),{name:q.name})),R=[['Buildings','bld'],['Typical year built','yr',1],['Built before 1950','old','%'],['City-listed trees','tree'],['Lead service lines','lead'],['Galvanized service lines','galv'],['Fix-it requests since 2022','fix'],['Still open','fixOpen'],['Crash reports, 2024 to mid 2026','crash'],['New buildings since 2007','newb'],['Buildings gone since 2007','gone']];
  let h='<div class="tw"><table><tr><th></th>'+st.map((s,k)=>`<th style="color:${SQHEX[k]}">${SQRL[k]}<br><small style="font-weight:400;color:#cfc6b4">${s.name}</small></th>`).join('')+'</tr>';
  for(const [lab,key,kind] of R){const v=st.map(s=>s[key]),mx=Math.max(...v.filter(x=>x!=null&&kind!==1),1);h+=`<tr><td>${lab}</td>`+v.map((x,k)=>`<td>${x==null?'–':kind===1?x:psN(x)+(kind==='%'?'%':'')}${x!=null&&kind!==1?`<div style="height:5px;border-radius:3px;margin-top:3px;background:${SQHEX[k]};width:${x>0?Math.max(4,Math.round(100*x/mx)):0}%"></div>`:''}</td>`).join('')+'</tr>'}
  h+='<tr><td>Most common fix-it</td>'+st.map(s=>`<td>${s.fixTop||'–'}</td>`).join('')+'</tr></table></div>';
  h+='<p>'+SQR.cart.map((q,k)=>`<button class="btn go2" data-sq="${k}" style="border-color:${SQHEX[k]}">Go to ${SQRL[k]}</button>`).join(' ')+' <button class="btn go2" data-sq="x">Empty the cart</button></p>';
  return h+'<p class="psub">Counts of public records inside each quarter-mile square. A bigger number can mean a bigger or busier square, not a worse one. Police data is never counted by square.</p>'}
const SQRS={title:'Compare <i>squares</i>',tabs:['Compare','How this works'],html:sqHTML,click:e=>{const b=e.target.closest('[data-sq]');if(!b)return;const k=b.dataset.sq;
  if(k==='x'){SQR.cart=[];sqFills();sqTxt();$('gbody').innerHTML=sqHTML(0);return}const q=SQR.cart[+k];if(!q)return;closeSheet();flyTo(camTo((q.i+.5)*SQR.S,(q.j+.5)*SQR.S,900,160,42),1500)}};
