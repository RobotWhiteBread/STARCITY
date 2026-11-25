// ---- Squares: zoomed in, the map lays a quarter-mile grid over the city (Lincoln's streets run a mile apart, so four squares to a mile).
// The square under the middle of the screen lights up with a few quick numbers. Add up to four to a cart and compare them side by side,
// then dive into any one. Every number is a count of public records inside the square. Police reports are never counted by square:
// they stay by district, so nothing points at a household.
const SQR={enabled:false,S:402.336,cart:[],grid:null,hi:null,fills:[],key:'',ui:null,cur:null,on:false,pend:false};
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
  d.innerHTML='<span id="sqtxt" style="max-width:52vw"></span><button class="btn" id="sqadd">＋ Add square</button><button class="btn" id="sqcmp" style="display:none"></button><button class="btn" id="sqx">✕ Done</button>';document.body.appendChild(d);
  d.querySelector('#sqadd').onclick=()=>{const c=SQR.cur;if(!c)return;const k=SQR.cart.findIndex(q=>q.i===c[0]&&q.j===c[1]);if(k>=0)SQR.cart.splice(k,1);else{if(SQR.cart.length>=4)SQR.cart.shift();SQR.cart.push({i:c[0],j:c[1],name:sqName(c[0],c[1])})}sqFills();sqTxt();sqLoadAll();lastInput=performance.now()};
  d.querySelector('#sqx').onclick=()=>sqEnable(false);d.querySelector('#sqcmp').onclick=()=>{sqLoadAll();openSheet(SQRS,0)};SQR.ui=d;return d}
function sqFills(){for(const m of SQR.fills){scene.remove(m);m.geometry.dispose()}SQR.fills=[];SQR.cart.forEach((q,k)=>{const f=new THREE.Mesh(sqDrape(q.i,q.j,2.5),new THREE.MeshBasicMaterial({color:SQCOL[k],transparent:true,opacity:.28,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  const e=new THREE.LineSegments(sqEdge(q.i,q.j,5),new THREE.LineBasicMaterial({color:SQCOL[k],fog:false}));scene.add(f);scene.add(e);SQR.fills.push(f,e);
  SQR.lbs=SQR.cart.map((q,k)=>({t:'Square '+SQRL[k],sub:q.name,x:(q.i+.5)*SQR.S,y:hAt((q.i+.5)*SQR.S,(q.j+.5)*SQR.S)+60,z:(q.j+.5)*SQR.S,k:3,pri:900,near:0,far:9000}))});if(!SQR.cart.length)SQR.lbs=[];dirty=true}
function sqTxt(){const u=sqUI(),c=SQR.cur;if(!c)return;const inC=SQR.cart.findIndex(q=>q.i===c[0]&&q.j===c[1]);const s=SQR.quick;
  u.querySelector('#sqtxt').textContent=(s?`${s.name}: ${psN(s.bld)} buildings`+(s.yr?`, built ${s.yr} typical`:'')+(s.tree?`, ${psN(s.tree)} city trees`:'')+(s.lead+s.galv?`, ${s.lead+s.galv} lead or galvanized lines`:''):'');
  u.querySelector('#sqadd').textContent=inC>=0?'− Remove square '+SQRL[inC]:'＋ Add square'+(SQR.cart.length>=4?' (replaces A)':'');
  const b=u.querySelector('#sqcmp');b.style.display=SQR.cart.length?'':'none';b.textContent='Compare '+SQR.cart.length+(SQR.cart.length===1?' square':' squares')}
function stepSquares(dt,now){const t=controls.target,d=camera.position.distanceTo(t),on=SQR.enabled&&d<3400&&t.y<60&&!walk.on&&!walk.sky&&!(typeof AR!=='undefined'&&AR.on);
  if(!on){if(SQR.on){SQR.on=false;if(SQR.grid)SQR.grid.visible=false;if(SQR.hi)SQR.hi.visible=false;if(SQR.he)SQR.he.visible=false;if(SQR.ui)SQR.ui.style.display='none';dirty=true}if(SQR.lbs)for(const l of SQR.lbs)lifeLabels.push(l);return}
  if(!SQR.on){SQR.on=true;sqUI().style.display='flex';SQR.key=''}{const sh=$('guide').style.display==='block',u=sqUI();if(sh!==(u.style.display==='none'))u.style.display=sh?'none':'flex'}const c=sqCell(t.x,t.z),key=c[0]+','+c[1];
  if(key!==SQR.key){SQR.key=key;SQR.cur=c;sqGrid(c[0],c[1]);SQR.grid.visible=true;if(SQR.hi){scene.remove(SQR.hi);SQR.hi.geometry.dispose()}
    SQR.hi=new THREE.Mesh(sqDrape(c[0],c[1],2),new THREE.MeshBasicMaterial({color:0xffd166,transparent:true,opacity:.08,depthWrite:false,fog:false,side:THREE.DoubleSide}));scene.add(SQR.hi);if(SQR.he){scene.remove(SQR.he);SQR.he.geometry.dispose()}SQR.he=new THREE.LineSegments(sqEdge(c[0],c[1],5),new THREE.LineBasicMaterial({color:0xffd166,fog:false}));scene.add(SQR.he);
    const s=sqStats(c[0],c[1]);s.name=sqName(c[0],c[1]);SQR.quick=s;sqTxt();dirty=true}
  // the square under the middle of the screen gets a steady gold outline and a faint fill, so you can see which one the numbers are for
  if(SQR.hi){SQR.hi.visible=true;if(SQR.he)SQR.he.visible=true}if(SQR.lbs)for(const l of SQR.lbs)lifeLabels.push(l)}
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

function sqEnable(on){SQR.enabled=on;SQR.key='';if(!on){SQR.cart=[];sqFills();if(SQR.grid)SQR.grid.visible=false;if(SQR.hi)SQR.hi.visible=false;if(SQR.he)SQR.he.visible=false;if(SQR.ui)SQR.ui.style.display='none';SQR.on=false}
  else{sqLoadAll();const t=controls.target;if(camera.position.distanceTo(t)>3000)flyTo(camTo(t.x,t.z,1600,160,48),1200);showCard('Compare squares','A gold square marks the quarter mile under the middle of your screen, with its numbers in the bar below. Move the map to pick a different square, tap Add square to put it in your cart, and add up to four. Compare shows them side by side. Done turns the squares off.',-1)}dirty=true}
// ---- when the data was updated: one table, so nobody has to guess how fresh a view is
const FRESH=[['Weather and alerts','Now','Read live from the National Weather Service every visit','live'],['Buses','Now','StarTran positions, live','live'],['Night sky','Now','Worked out for the minute shown','live'],
 ['Fix-it requests (UPLNK)','2018 to November 2026','Read November 23, 2026 from the city\'s live service','current'],['Police reports, calls, arrests, stops, force','2013 to June 2026','Read November 23, 2026; the city adds to each year\'s table','current'],
 ['Crashes','2024 to mid 2026','Read November 22, 2026','current'],['Lead service lines','Today\'s city records','Read from the city\'s service line map, November 2026','current'],['City plans, permits, HOAs','Current','Read November 23, 2026','current'],
 ['Building growth','2007 to 2026','City footprint maps for each year','current'],['Fire and rescue response','2013 to 2019','The city stopped publishing this after 2019','stopped'],['Property sales','2013 to 2018','The county file on the city portal stops in 2018','stopped'],
 ['Home insurance costs','2018 to 2022','U.S. Treasury Federal Insurance Office, latest release','current'],['City budget and building permit history','As loaded in 2017 and 2018','Put on the city portal then and never updated, so the map does not use them','stopped']];
const FRESHS={title:'When the data <i>was updated</i>',tabs:['Every dataset'],html:()=>'<p>How fresh each part of the map is. Green is live, gold is current as of the date shown, red is where the city or county stopped publishing, so the map can only show what was released.</p><div class="tw"><table><tr><th>Data</th><th>Covers</th><th>Updated</th></tr>'+FRESH.map(r=>`<tr><td><span style="display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;background:${r[3]==='live'?'#22c55e':r[3]==='current'?'#e9b949':'#ef4444'}"></span>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')+'</table></div><p class="psub">STARCITY rebuilds its files when the city releases new data. Map built November 24, 2026.</p>',click:()=>{}};
// ---- "Show by": any data the city releases as points can be re-cut by the area you care about. Fire response comes only by ZIP code and
// police reports only by district, so those offer what they can and say where the data stops.
const BYG=[['zip','ZIP code'],['cc','Council district'],['vp','Voting precinct'],['quad','Quadrant (27th and O)'],['hoa','HOA'],['rd','Police district']];
const BYD={lead:{t:'Lead and galvanized service lines',u:'lines',load:()=>ldLoad(),pts:()=>{const {n,xz,c}=LD.d,o=[];for(let i=0;i<n;i++)o.push(xz[2*i]*2,xz[2*i+1]*2,1);return o}},
  fix:{t:'Fix-it requests (UPLNK), 2018 to 2026',u:'requests',load:()=>upLoad(),pts:()=>{const o=[];for(const p of UP.d.pts)o.push((p[0]-H.lon0)*KXm,-(p[1]-H.lat0)*KYm,p[3]);return o}},
  pot:{t:'Pothole requests, 2018 to 2026',u:'requests',load:()=>upLoad(),pts:()=>{const g=UP.d.street_groups.indexOf('Potholes'),o=[];for(const p of UP.d.pts)if(p[2]===g)o.push((p[0]-H.lon0)*KXm,-(p[1]-H.lat0)*KYm,p[3]);return o}},
  crash:{t:'Crash reports, 2024 to mid 2026',u:'crashes',load:()=>crashLoad(),pts:()=>{const X=CRASH.d.X,o=[];for(let i=0;i<CRASH.d.n;i++)o.push(X[2*i],X[2*i+1],1);return o}},
  fire:{t:'Fire and rescue response',only:['zip'],note:'The city publishes response times by ZIP code only, and only through 2019, so they cannot be cut any finer.'},
  police:{t:'Police reports, 2021 to 2025',only:['rd','cc','quad'],note:'Police reports are counted by district, council district or quadrant only, never smaller, so nothing points at a household.'}};
function byAreas(geo){return Promise.all([arLoad(),insLoad?insLoad():null,fetch('data/hoa.json').then(r=>r.json()).catch(()=>null)]).then(([d,z,h])=>{if(!d)return null;
  if(z&&!d.zip)d.zip=z.zips.map(Z=>({id:Z.z,p:Z.p,c:Z.c}));if(h&&!d.hoa)d.hoa=h.hoa.map(a=>({id:a.n,p:a.p,c:a.c}));return d})}
function byCount(A,pts){const out=new Map(),G=new Map(),cs=600;for(const a of A){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const p of a.p)for(let i=0;i<p.length;i+=2){x0=Math.min(x0,p[i]);x1=Math.max(x1,p[i]);z0=Math.min(z0,p[i+1]);z1=Math.max(z1,p[i+1])}a.bb=[x0,z0,x1,z1];
    for(let gx=Math.floor(x0/cs);gx<=Math.floor(x1/cs);gx++)for(let gz=Math.floor(z0/cs);gz<=Math.floor(z1/cs);gz++){const k=gx*100000+gz;(G.get(k)||G.set(k,[]).get(k)).push(a)}}
  const inP=(p,x,z)=>{let c=false;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2){const xi=p[i],zi=p[i+1],xj=p[j],zj=p[j+1];if((zi>z)!=(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c}return c};
  for(let k=0;k<pts.length;k+=3){const x=pts[k],z=pts[k+1],L=G.get(Math.floor(x/cs)*100000+Math.floor(z/cs));if(!L)continue;for(const a of L){const b=a.bb;if(x<b[0]||x>b[2]||z<b[1]||z>b[3])continue;if(a.p.some(p=>inP(p,x,z))){out.set(a.id,(out.get(a.id)||0)+pts[k+2]);break}}}return out}
function byShow(ds,geo){const D=BYD[ds];if(!D)return;if(D.only&&!D.only.includes(geo)){showCard(D.t+' by '+BYG.find(g=>g[0]===geo)[1].toLowerCase(),D.note,-1,null,byLinks(ds,geo));return}
  if(ds==='fire'){frShow();return}if(ds==='police'){geo==='quad'?psQuad(0):geo==='cc'?psCC():psArea(0);return}
  Promise.all([D.load(),byAreas(geo)]).then(([,d])=>{if(!d)return;const kind=geo==='quad'?'vp':geo,A=d[kind];if(!A)return;const pts=D.pts();let C=geo==='quad'?new Map():byCount(A,pts);
    if(geo==='quad'){const Q={};const qo=a=>(a.c[1]<-4828?'N':'S')+(a.c[0]<-3490?'W':'E');for(let k=0;k<pts.length;k+=3){const q=(pts[k+1]<-4828?'N':'S')+(pts[k]<-3490?'W':'E');Q[q]=(Q[q]||0)+pts[k+2]}const C2=new Map();for(const a of A)C2.set(a.id,Q[qo(a)]);C=C2}
    const tot=pts.reduce((s,v,i)=>i%3===2?s+v:s,0),gl=BYG.find(g=>g[0]===geo)[1],top=[...C.entries()].sort((a,b)=>b[1]-a[1]).slice(0,geo==='quad'?4:5);
    arShow(kind,id=>C.get(id)||null,{tall:700,dist:16000,labels:a=>geo==='quad'?'':(top.some(t=>t[0]===a.id)?String(a.id):''),
      title:D.t+' by '+gl.toLowerCase(),text:`${psN(tot)} ${D.u} counted by ${gl.toLowerCase()}. Taller and redder means more. `+(geo==='quad'?'':'Most: '+top.map(([k,v])=>`${k} ${psN(v)}`).join(', ')+'. ')+'Bigger areas hold more, so compare neighbors more than totals. Tap an area for its number, or cut it another way below.',
      back:null,card:a=>showCard(gl+' '+a.id,`${psN(C.get(a.id)||0)} ${D.u}.`,-1,null,byLinks(ds,geo))}).then(()=>{showCard(D.t+' by '+gl.toLowerCase(),$('cp').textContent,-1,null,byLinks(ds,geo))})})}
// the row of other ways to cut the same data; ones the data cannot support say why instead of hiding
function byLinks(ds,cur){const D=BYD[ds];return BYG.filter(g=>g[0]!==cur).map(([k,l])=>({label:(D.only&&!D.only.includes(k)?'✕ ':'')+'By '+l.toLowerCase(),fn:()=>byShow(ds,k)})).concat([{label:'Clear',fn:arOff}])}
// ---- who represents this spot: the precinct a building sits in gives its City Council, Legislature and County Board districts.
// Lincoln is all in Nebraska's 1st U.S. House district. Names change with elections, so the card links to each body's own lookup.
const REP={d:null};
function repLoad(){return REP.d?Promise.resolve(REP.d):fetch('data/representation.json').then(r=>r.json()).then(d=>REP.d=d).catch(()=>null)}
const REPL=[{href:'https://lincoln.ne.gov/city/council/members/index.htm',label:'City Council members ↗'},{href:'https://nebraskalegislature.gov/senators/senator_find.php',label:'Find your state senator ↗'},
  {href:'https://www.lancaster.ne.gov/',label:'Lancaster County Board ↗'},{href:'https://www.lps.org/about/boundaries/',label:'LPS home school and board district ↗'},{href:'https://www.house.gov/representatives/find-your-representative',label:'U.S. House ↗'},
  {href:'https://www.votercheck.necvr.ne.gov/voterview/',label:'Your registration and polling place ↗'}];
function repShow(x,z){Promise.all([repLoad(),arLoad()]).then(([R,A])=>{if(!R||!A)return;const inP=(p,x,z)=>{let c=false;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2){const xi=p[i],zi=p[i+1],xj=p[j],zj=p[j+1];if((zi>z)!=(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c}return c};
  const a=A.vp.find(q=>q.p.some(p=>inP(p,x,z)));const v=a&&R.vp[a.id];
  if(!v){showCard('Who represents this spot','This spot is outside Lincoln\'s city precincts on the county\'s map, so city districts do not apply. Use the official lookups below for county, legislature and school board.',-1,null,REPL);return}
  showCard('Who represents this spot',`Voting precinct ${a.id}. City Council district ${v[2]}, plus the three council members elected citywide. Legislative District ${v[0]} in the Nebraska Unicameral. Lancaster County Board district ${v[1]}. U.S. House: Nebraska's 1st district; U.S. Senate: Nebraska's two senators, elected statewide. School board: Lincoln Public Schools elects by district; check the LPS lookup.`+(v[3]?' This precinct is split between districts, so confirm with the official lookups.':'')+' From the Election Commissioner\'s precinct map, November 2026.',-1,null,REPL)})}
