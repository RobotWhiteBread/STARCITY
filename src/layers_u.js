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
// ---- the Lincoln statue on the Capitol's west side (Daniel Chester French's standing Lincoln, head bowed), and behind it the Unicameral:
// when the Legislature meets, which districts cover Lincoln, and how to take part. Tap the statue.
let ABE=null;
function abeInit(){if(ABE||!LM.capitol)return;const c=LM.capitol,x=c[0]-90,z=c[1]+3,g=new THREE.Group(),M=(w,h,d,col,px,py,pz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:col}));m.position.set(px,py,pz);g.add(m);return m};
  const BR=0x4a3b2a,GR=0xb9b4a8;M(4.2,2.4,4.2,GR,0,1.2,0);M(3.4,.4,3.4,0xd8d3c6,0,2.6,0);
  for(const s of[-1,1])M(.42,2.2,.5,BR,s*.32,3.9,0);M(1.35,2.4,.8,BR,0,5.6,0);M(1.5,.9,.9,BR,0,4.5,0);for(const s of[-1,1])M(.32,1.9,.36,BR,s*.86,5.4,.1);
  const hd=M(.62,.7,.62,BR,0,7.15,.12);hd.rotation.x=.28;M(.64,.25,.4,0x2e2418,0,6.86,.3);
  g.position.set(x,hAt(x,z),z);g.rotation.y=Math.PI/2;g.scale.setScalar(1.6);g.userData.card=()=>uniOpen(0);g.traverse(o=>{if(o.isMesh)o.userData.card=g.userData.card});scene.add(g);pickables.push(g);
  ABE={g,lb:{t:'Lincoln statue',sub:'tap for the Unicameral',x,y:hAt(x,z)+16,z,k:3,pri:700,near:0,far:1600}}}
function stepAbe(){if(!ABE){abeInit();return}lifeLabels.push(ABE.lb)}
const UNIL=[{href:'https://nebraskalegislature.gov/senators/senator_find.php',label:'Find your senator ↗'},{href:'https://nebraskalegislature.gov/bills/intro.php',label:'Bills and laws ↗'},{href:'https://nebraskalegislature.gov/calendar/hearings_range.php',label:'Hearing schedule ↗'},{href:'https://nebraskapublicmedia.org/en/watch/live/',label:'Watch live (NPM) ↗'}];
let UV=null;const uvLoad=()=>UV?Promise.resolve(UV):fetch('data/unicameral.json').then(r=>r.json()).then(d=>UV=d).catch(()=>null);
const UVL=k=>'https://nebraskalegislature.gov/bills/view_votes.php?KeyID='+k;
const uvPct=(a,b)=>b?Math.round(1000*a/b)/10:0;
function uvRow(s){const cast=s.y+s.n;return {cast:uvPct(cast,s.on),pnv:uvPct(s.p,s.on),exc:uvPct(s.e,s.on),abs:s.a}}
function uvBar(parts){return '<div style="display:flex;height:9px;border-radius:5px;overflow:hidden;background:#ffffff12;margin:3px 0 8px">'+parts.map(([v,c])=>`<div style="width:${v}%;background:${c}"></div>`).join('')+'</div>'}
const UVC={cast:'#e8b84a',pnv:'#6aa9e8',exc:'#8a8f98'};
function uvKey(){return `<div style="font-size:11.5px;opacity:.8;margin:2px 0 8px"><span style="color:${UVC.cast}">■</span> voted yes or no · <span style="color:${UVC.pnv}">■</span> present, not voting · <span style="color:${UVC.exc}">■</span> excused · the rest absent</div>`}
function uvSen(s){const r=uvRow(s);return `<div data-uni="s:${encodeURIComponent(s.k)}" style="cursor:pointer;border:1px solid #ffffff1c;border-radius:10px;padding:9px 11px;margin:7px 0"><div style="display:flex;justify-content:space-between"><b>${s.name}</b><span style="opacity:.75">District ${s.ld||'?'}</span></div>`+
  `<div style="font-size:12.5px;margin-top:3px">Voted on <b>${r.cast}%</b> of ${psN(s.on)} recorded votes · present not voting ${r.pnv}% · excused ${r.exc}%${s.a?' · absent '+s.a+'×':''}</div>`+uvBar([[r.cast,UVC.cast],[r.pnv,UVC.pnv],[r.exc,UVC.exc]])+
  `<div style="font-size:12.5px">On the winning side of contested votes: <b>${s.maj}%</b>${s.most.length?' · votes most like '+s.most.slice(0,2).map(q=>q[0]).join(' and '):''}</div></div>`}
function uniHTML(tab){if(tab===0)return '<p><b>The Unicameral.</b> Nebraska is the only state with a one-house, officially nonpartisan legislature: 49 senators, one per district, meeting in the Capitol behind this statue.</p><p><b>Next session:</b> the 110th Legislature convenes January 6, 2027. Odd-year sessions run 90 working days, into June; even-year sessions run 60.</p><p><b>Lincoln is split among nine legislative districts:</b> 2, 21, 25, 26, 27, 28, 29, 30 and 46. Some reach well outside the city. <button class="btn go2" data-uni="map">Show them on the map</button></p><p>The next tabs show how Lincoln\'s senators and all 49 voted in 2025 and 2026, from the Legislature\'s own recorded votes. Tap any building and choose <b>Who represents this spot</b> to see its district.</p>';
  if(tab===4)return '<p><b>Testify at a hearing.</b> Every bill gets a public hearing in committee. You can testify in person in the Capitol, or submit written comments online before the hearing; the Legislature\'s site explains the deadlines and rules.</p><p><b>Follow a bill.</b> Bills move from committee to General File, Select File and Final Reading. Most big fights happen on General File. A filibuster is ended by a cloture motion, which needs 33 of the 49 votes, so 17 senators can stop a bill.</p><p><b>Watch it.</b> Floor debate and many hearings stream live on Nebraska Public Media.</p>';
  if(!UV){uvLoad().then(()=>{if(sheet===UNIS)openSheet(UNIS,tab)});return '<p>Loading the votes…</p>'}
  const M=UV.meta,src=`<p style="font-size:12px;opacity:.7">${psN(M.votes)} recorded votes, ${UV.session.toLowerCase()}, from the Legislature's own vote pages. "Present, not voting" is a choice a senator records on the floor; "excused" means the senator had leave to be away. Counted ${UV.updated}.</p>`;
  if(tab===1){const L=UV.lincoln.map(d=>UV.sen.find(s=>s.ld===d&&s.on>1500)).filter(Boolean);
    let h='<p><b>Lincoln\'s nine senators</b> and how they voted in 2025 and 2026. Tap one for the senators they vote most and least like.</p>'+uvKey()+L.map(uvSen).join('');
    const m=UV.M,col=v=>v>=95?'#e8b84a':v>=85?'#b08a3e':v>=75?'#6b5a35':'#3a3a3a';
    h+='<p style="margin-top:14px"><b>How often Lincoln\'s senators agree</b> on votes where both voted yes or no. Across all 49 senators the middle pair agrees '+M.agree_med+'% of the time; the range is '+M.agree_min+'% to '+M.agree_max+'%.</p><div style="overflow:auto"><table style="border-collapse:collapse;font-size:11px"><tr><th></th>'+UV.LS.map(n=>`<th style="padding:2px 3px;writing-mode:vertical-rl;transform:rotate(180deg)">${n}</th>`).join('')+'</tr>'+
      UV.LS.map((a,i)=>`<tr><th style="text-align:right;padding:2px 5px;white-space:nowrap">${a}</th>`+m[i].map((v,j)=>`<td title="${a} and ${UV.LS[j]}: ${v}%" style="width:30px;height:24px;text-align:center;background:${i===j?'transparent':col(v)};color:${v>=85?'#111':'#ddd'}">${i===j?'':Math.round(v)}</td>`).join('')+'</tr>').join('')+'</table></div>';
    return h+src}
  if(tab===2){const S=UV.sen.filter(s=>s.on>1000).slice().sort((a,b)=>uvRow(b).cast-uvRow(a).cast);
    return '<p><b>All 49 senators</b>, most votes cast first. Tap a name for who they vote most and least like.</p>'+uvKey()+'<table style="width:100%;border-collapse:collapse;font-size:12.5px"><tr style="opacity:.7"><th style="text-align:left">Senator</th><th>LD</th><th style="text-align:right">Voted</th><th style="text-align:right">Present, not voting</th><th style="text-align:right">Excused</th><th style="text-align:right">With the winning side</th></tr>'+
      S.map(s=>{const r=uvRow(s);return `<tr data-uni="s:${encodeURIComponent(s.k)}" style="cursor:pointer;border-top:1px solid #ffffff14${UV.lincoln.includes(s.ld)?';color:#e8b84a':''}"><td style="padding:4px 0">${s.name}</td><td style="text-align:center">${s.ld||''}</td><td style="text-align:right">${r.cast}%</td><td style="text-align:right">${r.pnv}%</td><td style="text-align:right">${r.exc}%</td><td style="text-align:right">${s.maj}%</td></tr>`}).join('')+'</table><p style="font-size:12px">Gold names represent part of Lincoln. Two senators served part of the term: one seat changed hands in 2025.</p>'+src}
  if(tab===3){const b=k=>UV.B[k]?' · '+UV.B[k]:'',a=(k,t)=>`<a href="${UVL(k)}" target="_blank" rel="noopener">${t}</a>`;
    let h='<p><b>Cloture votes.</b> Ending a filibuster takes 33 of 49 votes. These are the cloture votes of 2025 and 2026; the yes count decides it, so 16 or more no votes or absences can stop a bill.</p>';
    h+=UV.clo.map(([k,bill,d,y,n])=>`<div style="font-size:12.5px;padding:5px 0;border-top:1px solid #ffffff14"><b>${bill}</b>${b(bill)}<br>${d} · ${y} yes, ${n} no · <b style="color:${y>=33?'#e8b84a':'#e87a5a'}">${y>=33?'cloture reached':'fell short'}</b> · ${a(k,'roll call ↗')}</div>`).join('');
    h+='<p style="margin-top:14px"><b>Ties and near-ties.</b> Votes decided by a handful, including three veto overrides that needed 30 and got 24 or fewer.</p>'+UV.tie.map(([k,bill,st,d,what,y,n])=>`<div style="font-size:12.5px;padding:5px 0;border-top:1px solid #ffffff14"><b>${bill}</b>${b(bill)}<br>${st}, ${d} · ${what}: ${y} yes, ${n} no · ${a(k,'roll call ↗')}</div>`).join('');
    return h+src}
  return ''}
function uvSenCard(k){const s=UV.sen.find(q=>q.k===k);if(!s)return;const r=uvRow(s);closeSheet();
  showCard(s.name+(s.ld?', District '+s.ld:''),`In 2025 and 2026 ${s.name.split(' ').pop()} voted yes or no on ${r.cast}% of ${psN(s.on)} recorded votes (${psN(s.y)} yes, ${psN(s.n)} no), recorded present not voting ${r.pnv}% of the time, was excused ${r.exc}% and absent ${s.a} times. On contested votes, on the winning side ${s.maj}% of the time. Votes most like: ${s.most.map(q=>q[0]+' '+q[1]+'%').join(', ')}. Least like: ${s.least.map(q=>q[0]+' '+q[1]+'%').join(', ')}. Agreement counts only votes where both voted yes or no; the middle pair of senators agrees ${UV.meta.agree_med}% of the time.`,-1,{label:'Back to the Unicameral',fn:()=>uniOpen(2)},UNIL)}
const UNIS={title:'The <i>Unicameral</i>',tabs:['The Legislature','Lincoln\'s senators','All 49','Tough votes','Take part'],html:uniHTML,click:e=>{const b=e.target.closest('[data-uni]');if(!b)return;const v=b.dataset.uni;if(v==='map'){closeSheet();uniMap();return}if(v.startsWith('s:'))uvSenCard(decodeURIComponent(v.slice(2)))}};
function uniOpen(t){openSheet(UNIS,t||0)}
// legislative districts over Lincoln, from the Election Commissioner's precinct layer
function uniMap(){Promise.all([repLoad(),arLoad()]).then(([R,A])=>{if(!R||!A)return;const ld=id=>{const v=R.vp[id];return v?v[0]:null},S={};
  arShow('vp',id=>ld(id)?40+((ld(id)*37)%9)*25:null,{tall:1,dist:16000,labels:()=>'',title:'Legislative districts over Lincoln',text:'Each color step is a different legislative district, from the Election Commissioner\'s precinct map. Lincoln is split among nine; several reach into the county. Tap a precinct for its district.',
    back:{label:'The Unicameral',fn:()=>uniOpen(0)},links:UNIL,card:a=>showCard('Legislative District '+ld(a.id),'Voting precinct '+a.id+' is in Legislative District '+ld(a.id)+'. Find the senator for that district with the link below.',-1,{label:'The Unicameral',fn:()=>uniOpen(0)},UNIL)}).then(()=>{
    for(const a of AR.d.vp){const k=ld(a.id);if(!k)continue;(S[k]=S[k]||[0,0,0]);S[k][0]+=a.c[0];S[k][1]+=a.c[1];S[k][2]++}for(const k in S)AR.lbs.push({t:'District '+k,sub:'',x:S[k][0]/S[k][2],y:400,z:S[k][1]/S[k][2],k:3,pri:900,near:0,far:90000})})})}
// ---- the Tour button opens a menu: guided tours, data stories with graphs, and plain explanations of how the map works
const TMT=(t)=>(typeof TRY!=='undefined'?TRY:[]).find(r=>r[0]===t);
const TMENU=[
 {k:'Tours',intro:'Sit back and watch. Press Stop (where the Tour button was) to end one.',it:[
  ['The Little Bluestem Star City Prix','Five state animals race Jamaica North and MoPac, city limit to city limit. Pick a racer.',()=>pxOpen()],
  ['The short tour','About 40 seconds: the Capitol, Memorial Stadium, the arena and the Devaney Center.',()=>startTour()],
  ['Fly through Lincoln','About two minutes over every place in the bottom row, from downtown to Holmes Lake to the zoo, with a line about each.',()=>flyThrough()],
  'See it at night','The view from the Capitol tower','Champion trees','Fall color','Watch Lincoln grow, 1867 to today','Follow a raindrop','The sky tonight over Lincoln','Lake monsters and Sasquatch','Lost and found pets']},
 {k:'Data and graphs',intro:'Each one colors the map, opens charts and tables, and explains where the numbers come from.',it:[
  'The numbers for where you are looking','Everything about one spot','Potholes','Lead water service lines','Public safety, handled with care','Crashes, 2024 to mid 2026',
  'Your dollar: rent, sales tax, who decides','Value over time','Compare areas side by side','Where the money goes','Pivot tables','Strange but true','Jobs and wages','Cut any data by area','How Lincoln has voted','Follow the money in Lincoln politics','The Unicameral','Who represents you']},
 {k:'How it works',intro:'',it:[]}];
const TMHOW='<p><b>Move around.</b> Drag to turn, pinch or scroll to zoom, two fingers to tilt. Zoom all the way out for a flat map from above. The buttons on the right do the same.</p>'+
 '<p><b>Tap anything.</b> Buildings, trees, buses, the statue, even the cat. A card tells you what it is and offers deeper views.</p>'+
 '<p><b>Colors mean something only in a data view.</b> When a view colors the map, its card says what the colors mean, and <b>Clear</b> turns it off. Gold outlines mark what you picked.</p>'+
 '<p><b>Where the data comes from.</b> City, county, state and federal open data, OpenStreetMap and the Census. Every view names its source; <b>When the data was updated</b> shows how fresh each one is.</p>'+
 '<p><b>Privacy.</b> Property cards show property facts, not owner names. Police data is counted by area, never by person, case or address, and sensitive categories are shown citywide only.</p>'+
 '<p><b>For fun, not record.</b> The animals, cyclists and other moving characters are animations. The data views are the real numbers.</p>';
function tmHTML(tab){const g=TMENU[tab];if(tab===2){const x=['This view in words','When the data was updated','All city data','Make this for your city'].map(t=>TMT(t)?t:null).filter(Boolean);
  return TMHOW+x.map(t=>'<button class="btn go2" data-tm="'+t+'" style="display:block;width:100%;text-align:left;margin:6px 0">'+t+'</button>').join('')}
  return (g.intro?'<p>'+g.intro+'</p>':'')+g.it.map((r,i)=>{const R=typeof r==='string'?TMT(r):r;if(!R)return '';return '<button class="btn go2" data-tm="'+tab+':'+i+'" style="display:block;width:100%;text-align:left;margin:6px 0;padding:9px 12px;white-space:normal"><b>'+R[0]+'</b><br><span style="opacity:.75;font-size:12.5px">'+R[1]+'</span></button>'}).join('')}
const TMS={title:'Where to <i>start</i>',tabs:TMENU.map(g=>g.k),html:tmHTML,click:e=>{const b=e.target.closest('[data-tm]');if(!b)return;const v=b.dataset.tm,m=v.match(/^(\d):(\d+)$/);
  const r=m?TMENU[+m[1]].it[+m[2]]:v,R=typeof r==='string'?TMT(r):r;if(!R)return;closeSheet();U._t=1;R[2]()}};
function tourMenu(t){openSheet(TMS,t||0)}
// fly through every place in the bottom row, with a caption at each stop
const FTSAY={'Overview':'All of Lincoln, about 300,000 people.','Capitol':'The 400-foot Capitol and the Sower on top.','Memorial Stadium':'Sold out since 1962.','Haymarket':'Old warehouses, now restaurants and the arena.',
 'UNL City Campus':'The University of Nebraska–Lincoln.','UNL East Campus':'Farms, labs and the Dairy Store.','Downtown':'O Street, the long main street.','Holmes Lake':'A flood-control lake with trails and an observatory.','Southeast Lincoln':'Where the city keeps growing.'};
function flyThrough(){stopTour();const bs=[...$('chips').children];if(!bs.length)return;let i=0;tour=true;$('bTour').classList.add('on');$('bTour').textContent='■ Stop';
  const next=()=>{if(!tour)return;if(i>=bs.length){stopTour();return}const b=bs[i++],n=b.textContent,k=Object.keys(FTSAY).find(q=>n.startsWith(q));b.click();tour=true;$('bTour').classList.add('on');$('bTour').textContent='■ Stop';
    showCard(n,(k?FTSAY[k]+' ':'')+'Stop '+i+' of '+bs.length+'.',-1,{label:'Stop the fly-through',fn:()=>stopTour()});tour=setTimeout(next,7000)};next()}
// ---- every so often a section of the Memorial Stadium crowd breaks into "Meat pie power!", or shouts a meat pie recipe one slow step at a time.
// The words sit low over the red seating bowl, on the section that is shouting.
const MPP={ri:-1,rt:0,ui:0,TITLE:'In The Deed Meat Pie Glory',REC:['BROWN! THE! BEEF!','Onions in!','Shred the cabbage!','Salt! And! Pepper!','Make the dough!','Roll it out!','Fill it up!','Pinch it shut!','350! For 20!','Golden brown!','In da deed, da meat pie!','MEAT PIE POWER!'],
 SEC:[['west stands',-62,0],['east stands',62,0],['student section',58,-30],['north end zone',0,-95],['south end zone',0,95],['the band',-55,40]],next:0,until:0,t:'',sub:'',x:0,z:0,
 SAY:['MEAT PIE POWER!','In da deed, da meat pie!','IN DA DEED! DA MEAT PIE!','Meat! Pie! Power!','MEAT PIE POWER! MEAT PIE POWER!']};
function stepMPP(now){const S=LM.stadium;if(!S)return;const d=camera.position.distanceTo(controls.target);if(Math.hypot(controls.target.x-S[0],controls.target.z-S[1])>3000||d>5000){MPP.next=0;return}
  if(!MPP.next)MPP.next=now+2500;const sec=k=>{const q=MPP.SEC[k%MPP.SEC.length];MPP.x=S[0]+q[1];MPP.z=S[1]+q[2];return q[0]};
  if(now>MPP.next&&MPP.ri<0){if(Math.random()<.4){MPP.ri=0;MPP.rt=now;MPP.ui=Math.random()*6|0}else{MPP.t=MPP.SAY[Math.random()*MPP.SAY.length|0];MPP.sub=sec(Math.random()*6|0);MPP.until=now+7000}MPP.next=now+30000+Math.random()*20000}
  if(MPP.ri>=0){const step=6500,i=Math.floor((now-MPP.rt)/step),ph=(now-MPP.rt)%step;if(i>=MPP.REC.length){MPP.ri=-1;MPP.next=now+30000+Math.random()*20000}else{MPP.t=MPP.REC[i];const n=MPP.REC.length-2;MPP.sub=(i<n?MPP.TITLE+', step '+(i+1)+' of '+n+' · ':'')+sec(MPP.ui+i);MPP.until=ph<5000?now+50:0}}
  if(now<MPP.until||MPP.ri>=0||now-MPP.until<600){ambient=true;dirty=true}
  if(now<MPP.until)lifeLabels.push({t:MPP.t,sub:MPP.sub,x:MPP.x,y:hAt(MPP.x,MPP.z)+24,z:MPP.z,k:3,pri:5000,near:0,far:6000})}
// ---- pivot tables: pick how to cut the city (rows) and every measure becomes a column; sort, switch to rates, map a column, download CSV
const PVM=[['pot','Potholes','requests 2018–26',1],['fix','All fix-it requests','2018–26',1],['crash','Crashes','2024–mid 2026',1],['lead','Lead or galvanized lines','known so far',1],
 ['homes','Homes','residential parcels',0],['com','Business parcels','commercial',0],['val','Median home value','assessed',2],['yr','Median year built','homes',3],['km2','Area','km²',4]];
const PV={geo:'vp',mode:'n',sort:'pot',desc:true,cache:{}};
function pvArea(p){let s=0;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2)s+=(p[j]-p[i])*(p[j+1]+p[i+1]);return Math.abs(s/2)/1e6}
function pvIdx(A,n,X,Z){const cs=600,G=new Map(),out=new Int32Array(n).fill(-1);A.forEach((a,ai)=>{let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const p of a.p)for(let i=0;i<p.length;i+=2){x0=Math.min(x0,p[i]);x1=Math.max(x1,p[i]);z0=Math.min(z0,p[i+1]);z1=Math.max(z1,p[i+1])}a.bb=[x0,z0,x1,z1];
    for(let gx=Math.floor(x0/cs);gx<=Math.floor(x1/cs);gx++)for(let gz=Math.floor(z0/cs);gz<=Math.floor(z1/cs);gz++){const k=gx*100000+gz;(G.get(k)||G.set(k,[]).get(k)).push(ai)}});
  const inP=(p,x,z)=>{let c=false;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2){const xi=p[i],zi=p[i+1],xj=p[j],zj=p[j+1];if((zi>z)!=(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c}return c};
  for(let k=0;k<n;k++){const x=X(k),z=Z(k),L=G.get(Math.floor(x/cs)*100000+Math.floor(z/cs));if(!L)continue;for(const ai of L){const b=A[ai].bb;if(x<b[0]||x>b[2]||z<b[1]||z>b[3])continue;if(A[ai].p.some(p=>inP(p,x,z))){out[k]=ai;break}}}return out}
function pvBuild(geo){if(PV.cache[geo])return Promise.resolve(PV.cache[geo]);return Promise.all([byAreas(geo),ldLoad(),upLoad(),crashLoad(),vpaLoad()]).then(([d])=>{const kind=geo==='quad'?'vp':geo,A=d&&d[kind];if(!A)return null;
  const R=A.map(a=>({id:a.id,a,pot:0,fix:0,crash:0,lead:0,homes:0,com:0,vals:[],yrs:[],km2:a.km2||pvArea(a.p[0]||[])}));const add=(idx,w,key)=>{for(let k=0;k<idx.length;k++)if(idx[k]>=0)R[idx[k]][key]+=w?w(k):1};
  if(UP.d){const P=UP.d.pts,g=UP.d.street_groups.indexOf('Potholes'),ix=pvIdx(A,P.length,k=>(P[k][0]-H.lon0)*KXm,k=>-(P[k][1]-H.lat0)*KYm);for(let k=0;k<P.length;k++)if(ix[k]>=0){R[ix[k]].fix+=P[k][3];if(P[k][2]===g)R[ix[k]].pot+=P[k][3]}}
  if(CRASH.d){const X=CRASH.d.X;add(pvIdx(A,CRASH.d.n,k=>X[2*k],k=>X[2*k+1]),null,'crash')}
  if(LD.d){const L=LD.d;add(pvIdx(A,L.n,k=>L.xz[2*k]*2,k=>L.xz[2*k+1]*2),null,'lead')}
  if(VPA.d){const V=VPA.d,ix=pvIdx(A,V.n,k=>V.x[k],k=>V.z[k]);for(let k=0;k<V.n;k++){const r=R[ix[k]];if(!r)continue;if(V.cls[k]===0){r.homes++;r.vals.push(V.v[k]);if(V.y[k]>1800)r.yrs.push(V.y[k])}else if(V.cls[k]===2)r.com++}}
  const med=a=>{if(!a.length)return null;a.sort((x,y)=>x-y);return a[a.length>>1]};for(const r of R){r.val=med(r.vals);r.yr=med(r.yrs);delete r.vals;delete r.yrs}return PV.cache[geo]=R})}
function pvVal(r,k){const m=PVM.find(q=>q[0]===k),v=r[k];if(v==null)return null;if(m[3]!==1&&m[3]!==0)return v;if(PV.mode==='km'&&r.km2>.01)return v/r.km2;if(PV.mode==='h'&&k!=='homes')return r.homes>=20?100*v/r.homes:null;return v}
function pvFmt(k,v){if(v==null)return '—';if(k==='val')return '$'+Math.round(v/1000)+'k';if(k==='yr')return String(v);if(k==='km2')return v.toFixed(1);return PV.mode==='n'?psN(v):v.toFixed(v<10?1:0)}
function pvHTML(tab){if(tab===1)return stHTML();const G=BYG.filter(g=>g[0]!=='quad'),R=PV.cache[PV.geo];
  const pick=(nm,opts,cur)=>'<div style="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px">'+opts.map(([k,l])=>`<button class="btn${k===cur?' on':''}" data-pv="${nm}:${k}" style="padding:5px 10px;font-size:12.5px">${l}</button>`).join('')+'</div>';
  let h='<p>Pick the rows, then tap a column header to sort. Tap a row to map that area and column.</p><b style="font-size:12px;opacity:.7">ROWS</b>'+pick('geo',G,PV.geo)+'<b style="font-size:12px;opacity:.7">VALUES</b>'+pick('mode',[['n','Counts'],['km','Per km²'],['h','Per 100 homes']],PV.mode);
  if(!R)return h+'<p>Counting… this takes a few seconds the first time.</p>';
  const rows=R.filter(r=>r.homes||r.pot||r.crash).slice().sort((a,b)=>{const x=pvVal(a,PV.sort),y=pvVal(b,PV.sort);return (x==null)-(y==null)||(PV.desc?y-x:x-y)});
  h+='<div style="overflow:auto;max-height:52vh"><table style="border-collapse:collapse;font-size:12px;width:100%"><tr>'+['<th style="text-align:left;position:sticky;top:0;background:#1b1e24;padding:4px">Area</th>'].concat(PVM.map(([k,l,s])=>`<th data-pv="sort:${k}" style="cursor:pointer;position:sticky;top:0;background:#1b1e24;padding:4px;text-align:right;${k===PV.sort?'color:#e8b84a':''}">${l}${k===PV.sort?(PV.desc?' ▼':' ▲'):''}<br><span style="font-weight:400;opacity:.6">${s}</span></th>`)).join('')+'</tr>';
  for(const r of rows)h+=`<tr data-pv="row:${encodeURIComponent(r.id)}" style="cursor:pointer;border-top:1px solid #ffffff14"><td style="padding:4px">${r.id}</td>`+PVM.map(([k])=>`<td style="text-align:right;padding:4px">${pvFmt(k,pvVal(r,k))}</td>`).join('')+'</tr>';
  return h+'</table></div><p style="font-size:12px;opacity:.7">'+rows.length+' areas. "Per 100 homes" is left blank for areas with under 20 homes. Medians come from the county assessor\'s parcels. Counts are points inside each boundary; points outside every boundary are left out.</p><button class="btn go2" data-pv="csv:1">Download this table (CSV)</button>'}
function pvCSV(){const R=PV.cache[PV.geo];if(!R)return;const L=[['area'].concat(PVM.map(m=>m[1]+' ('+m[2]+')'))];for(const r of R)L.push([r.id].concat(PVM.map(([k])=>{const v=pvVal(r,k);return v==null?'':(+v).toFixed(2)})));
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([L.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n')],{type:'text/csv'}));a.download='starcity-pivot-'+PV.geo+'-'+PV.mode+'.csv';a.click()}
function pvMap(id){const R=PV.cache[PV.geo],k=PV.sort,m=PVM.find(q=>q[0]===k),gl=BYG.find(g=>g[0]===PV.geo)[1],M=new Map(R.map(r=>[String(r.id),pvVal(r,k)]));closeSheet();
  arShow(PV.geo,i=>M.get(String(i))||null,{tall:700,dist:16000,labels:a=>String(a.id)===String(id)?String(a.id):'',title:m[1]+' by '+gl.toLowerCase(),text:'Taller and redder means higher. This is the column you sorted in the pivot table.',
    back:{label:'Back to the table',fn:()=>pvOpen(0)},card:a=>showCard(gl+' '+a.id,m[1]+': '+pvFmt(k,M.get(String(a.id))),-1,{label:'Back to the table',fn:()=>pvOpen(0)})}).then(()=>{const a=AR.d[PV.geo].find(q=>String(q.id)===String(id));if(a)flyTo(camTo(a.c[0],a.c[1],3500,160,44),1800)})}
const PVS={title:'Pivot <i>tables</i>',tabs:['Build a table','Strange but true'],html:pvHTML,click:e=>{const b=e.target.closest('[data-pv]');if(!b)return;const [k,v]=b.dataset.pv.split(':');
  if(k==='geo'){PV.geo=v;pvOpen(0);return}if(k==='mode'){PV.mode=v;openSheet(PVS,0);return}if(k==='sort'){if(PV.sort===v)PV.desc=!PV.desc;else{PV.sort=v;PV.desc=true}openSheet(PVS,0);return}
  if(k==='csv'){pvCSV();return}if(k==='row'){pvMap(decodeURIComponent(v));return}if(k==='st'){stMap(+v);return}}};
function pvOpen(t){openSheet(PVS,t||0);const g=t===1?'vp':PV.geo;if(!PV.cache[g])pvBuild(g).then(()=>{if(sheet===PVS)openSheet(PVS,t||0)})}
// ---- strange but true: across Lincoln's precincts, pairs of measures that move together. Rank correlation, a scatter, and the likely third factor.
const STM=[['pot','Potholes per 100 homes'],['crash','Crashes per 100 homes'],['lead','Lead lines per 100 homes'],['val','Median home value'],['yr','Median year built'],['dens','Homes per km²'],['comS','Business parcels per 100 homes'],['fixO','Non-pothole fix-it requests per 100 homes']];
const STWHY={'pot|yr':['The older the houses, the more potholes','Older neighborhoods have older streets, and old pavement cracks. The houses did not do it.'],
 'lead|yr':['Old houses, old pipes','Lead service lines were laid before the 1950s, so they sit under the oldest blocks. This one is real cause and effect.'],
 'lead|pot':['Where the lead pipes are, the potholes are','Pipes do not make potholes. Both mark the oldest parts of town.'],
 'dens|pot':['Crowded blocks, cratered streets','More homes per block means more street per household to report, and the dense blocks are the old ones.'],
 'crash|comS':['Shops and crashes go together','Businesses sit on busy roads, and busy roads are where crashes happen.'],
 'val|yr':['Newer homes, higher values','New houses are bigger and assessed higher; the city grew outward, so newer also means farther out.'],
 'pot|val':['Pricier blocks report fewer potholes','Newer, pricier subdivisions have newer streets. Money does not fill potholes; age explains both.'],
 'fixO|pot':['Neighbors who report one thing report everything','Some blocks call the city more for all kinds of fixes. Reporting habits drive both columns.'],
 'crash|dens':['More neighbors, more fender benders','More people and driveways per block means more cars in the same space.'],
 'crash|fixO':['Crash corners call the city more','Busy streets get both: more crashes, and more signals, signs and road damage to report.'],
 'pot|crash':['Potholes and crashes ride together','Both pile up on the busiest, oldest streets. Traffic is the third factor.'],
 'crash|val':['Lower-value blocks see more crashes','Lower-value homes tend to sit near arterials and businesses, where the traffic is.'],
 'yr|fixO':['Older blocks need more fixing','Old sidewalks, old signs and old trees mean more for the city to repair.'],
 'lead|val':['Lead lines and lower values','Both trace back to the age of the block, not to each other.']};
function stRank(a){const o=a.map((v,i)=>[v,i]).sort((x,y)=>x[0]-y[0]),r=new Array(a.length);o.forEach((p,i)=>r[p[1]]=i);return r}
function stCorr(x,y){const n=x.length,mx=x.reduce((s,v)=>s+v,0)/n,my=y.reduce((s,v)=>s+v,0)/n;let a=0,b=0,c=0;for(let i=0;i<n;i++){a+=(x[i]-mx)*(y[i]-my);b+=(x[i]-mx)**2;c+=(y[i]-my)**2}return a/Math.sqrt(b*c)}
function stVals(r,k){if(r.homes<40)return null;if(k==='val'||k==='yr')return r[k];if(k==='dens')return r.km2>.05?r.homes/r.km2:null;if(k==='comS')return 100*r.com/r.homes;if(k==='fixO')return 100*(r.fix-r.pot)/r.homes;return 100*r[k]/r.homes}
function stPairs(){const R=PV.cache.vp;if(!R)return null;if(PV.st)return PV.st;const out=[];for(let i=0;i<STM.length;i++)for(let j=i+1;j<STM.length;j++){const X=[],Y=[],ids=[];for(const r of R){const a=stVals(r,STM[i][0]),b=stVals(r,STM[j][0]);if(a==null||b==null)continue;X.push(a);Y.push(b);ids.push(r.id)}
  if(X.length<30)continue;const rho=stCorr(stRank(X),stRank(Y));out.push({i,j,rho,X,Y,ids,n:X.length})}return PV.st=out.sort((a,b)=>Math.abs(b.rho)-Math.abs(a.rho)).slice(0,8)}
function stSVG(P){const p={i:P.i,j:P.j,X:stRank(P.X),Y:stRank(P.Y)},W=300,Hh=170,mx=0,Mx=P.n-1,my=0,My=P.n-1,q=(v,a,b,s)=>b>a?(v-a)/(b-a)*s:s/2;
  return `<svg viewBox="0 0 ${W} ${Hh+18}" style="width:100%;max-width:340px;display:block;margin:6px 0"><rect x="0" y="0" width="${W}" height="${Hh}" fill="#ffffff08"/>`+p.X.map((x,i)=>`<circle cx="${(6+q(x,mx,Mx,W-12)).toFixed(1)}" cy="${(Hh-6-q(p.Y[i],my,My,Hh-12)).toFixed(1)}" r="2.6" fill="#e8b84a" fill-opacity=".7"/>`).join('')+
   `<text x="2" y="${Hh+13}" font-size="10" fill="#aaa">→ ${STM[p.i][1]} (rank, low to high)</text><text x="${W-2}" y="11" font-size="10" fill="#aaa" text-anchor="end">↑ ${STM[p.j][1]} (rank)</text></svg>`}
function stHTML(){const P=stPairs();if(!P)return '<p>Counting every precinct… a few seconds.</p>';
  return '<p>Lincoln\'s precincts, compared on everything at once. These are the pairs that move together most. Each dot is a precinct with at least 40 homes, placed by its rank on each measure. <b>Moving together is not causing.</b> Each card names the likely third factor.</p>'+P.map((p,k)=>{const key1=STM[p.i][0]+'|'+STM[p.j][0],key2=STM[p.j][0]+'|'+STM[p.i][0],w=STWHY[key1]||STWHY[key2]||[STM[p.i][1]+' and '+STM[p.j][1].toLowerCase()+' travel together','Likely a third factor drives both, most often how old and how dense the neighborhood is.'];
   const s=Math.abs(p.rho)>.6?'strongly':Math.abs(p.rho)>.35?'clearly':'loosely';
   return `<div style="border:1px solid #ffffff1c;border-radius:10px;padding:10px 12px;margin:10px 0"><b>${w[0]}</b><div style="font-size:12.5px;opacity:.8">${STM[p.i][1]} and ${STM[p.j][1].toLowerCase()}: ${s} ${p.rho>0?'up together':'opposite ways'} (rank correlation ${p.rho.toFixed(2)}, ${p.n} precincts).</div>${stSVG(p)}<div style="font-size:13px">${w[1]}</div><button class="btn go2" data-pv="st:${k}" style="margin-top:6px">Map both</button></div>`}).join('')}
function stMap(k){const p=stPairs()[k];if(!p)return;const R=new Map(PV.cache.vp.map(r=>[String(r.id),r])),a=STM[p.i][0],b=STM[p.j][0],ra=stRank(p.X),rb=stRank(p.Y),M=new Map(),n=p.n;p.ids.forEach((id,i)=>M.set(String(id),{a:ra[i]/n,b:rb[i]/n}));closeSheet();
  arShow('vp',id=>{const v=M.get(String(id));return v?1+v.a*100:null},{tall:700,dist:16000,labels:()=>'',title:STM[p.i][1]+', with '+STM[p.j][1].toLowerCase(),text:'Height is the precinct\'s rank on '+STM[p.i][1].toLowerCase()+'. Tap one to see both ranks. Where tall precincts also rank high on the second measure, the pair holds.',
    back:{label:'Strange but true',fn:()=>pvOpen(1)},card:A=>{const v=M.get(String(A.id));showCard('Precinct '+A.id,v?`${STM[p.i][1]}: higher than ${Math.round(v.a*100)}% of precincts. ${STM[p.j][1]}: higher than ${Math.round(v.b*100)}%.`:'Too few homes to rank.',-1,{label:'Strange but true',fn:()=>pvOpen(1)})}})}
// ---- lost and found pets: the Capital Humane Society runs its own map
const LFL=[{href:'https://capitalhumanesociety.github.io/',label:'Lost and found pet map ↗'},{href:'https://www.capitalhumanesociety.org/',label:'Capital Humane Society ↗'},{href:'https://www.lincoln.ne.gov/City/Departments/Health-Department/Animal-Control',label:'Lincoln Animal Control ↗'}];
function lfOpen(){const L=(H.blabels||[]).concat(H.plabels||[]).find(b=>/humane/i.test(b[0]));if(L)flyTo(camTo(L[1],-L[2],420,200,30,6),2200);
  showCard('Lost or found a pet?','The Capital Humane Society keeps a live map of animals reported lost or found to the shelter, with filters by species. Reports made to Lincoln Animal Control are separate, so check both.',-1,null,LFL)}
// ---- jobs and wages: Select Lincoln / Lincoln Partnership for Economic Development's 2024 data book (BLS LAUS, CES, QCEW 2022, OEWS Q1 2024)
const EC={src:'https://www.selectlincoln.org/site-selectors/wages-employment',pdf:'https://d349zvxuwcv51z.cloudfront.net/5afe-57586177-Detailed_Lincoln_Data_2024.pdf?pfvId=19xznj.m61c9zjj',
 lead:[['Lincoln Public Schools','Education','5,000–7,500',/lincoln public schools|lps district office/i],['State of Nebraska','Government','5,000–7,500',/state capitol/i],['University of Nebraska','Education','5,000–7,500',/love memorial library|nebraska union/i],
  ['Bryan Medical Center','Health care','2,500–4,999',/bryan/i],['Nelnet','Student loans','2,500–4,999',/nelnet/i],['B&R Stores (Super Saver, Russ\'s)','Grocery','2,500–4,999',/super saver|russ/i],['Ameritas','Insurance','1,000–2,499',/ameritas/i],['BNSF Railway','Transportation','1,000–2,499',/bnsf|hobson/i],
  ['City of Lincoln','Government','1,000–2,499',/county.city building/i],['Duncan Aviation','Aviation service','1,000–2,499',/duncan/i],['Hy-Vee','Grocery','1,000–2,499',/hy-vee/i],['Kawasaki Motors Manufacturing','Manufacturing','1,000–2,499',/kawasaki/i],
  ['Lancaster County','Government','1,000–2,499',/county.city building/i],['Madonna Rehabilitation Hospital','Health care','1,000–2,499',/madonna/i],['Molex','Manufacturing','1,000–2,499',/molex/i],['CHI Health St. Elizabeth','Health care','1,000–2,499',/elizabeth/i],
  ['U.S. Government','Government','1,000–2,499',/federal building|denney/i],['Walmart','Retail','1,000–2,499',/walmart/i]],
 sect:{Manufacturing:[['Kawasaki Motors Manufacturing USA','1,000–2,499'],['Molex','1,000–2,499'],["Cook's Ham",'500–999'],['Lincoln Industries','500–999'],['Haleon','500–999'],['Tenneco Automotive','500–999'],['Zoetis','500–999'],['Cleaver-Brooks','250–499'],['Hughes Brothers','250–499'],['Lester Electrical','250–499'],['LI-COR Biosciences','250–499'],['MBA Poultry','250–499'],['Speedway Motors','250–499'],['Teledyne Isco','250–499']],
  'Public sector':[['State of Nebraska','5,000–7,500'],['University of Nebraska','5,000–7,500'],['City of Lincoln','1,000–2,499'],['Lancaster County','1,000–2,499'],['U.S. Government','1,000–2,499'],['Nebraska Army and Air National Guard','500–999']],
  Insurance:[['Ameritas','1,000–2,499'],['State Farm','500–999'],['NTT Data','500–999'],['Lincoln Benefit Life','500–999'],['Allied Insurance','250–499'],['Assurity Life','250–499']],
  Transportation:[['BNSF Railway','1,000–2,499'],['Duncan Aviation','1,000–2,499'],['Crete Carrier','500–999'],['Sysco','250–499']]},
 ind:[['Information',178,3592,1712],['Federal government',64,3235,1586],['Financial activities',1133,9362,1433],['State government',101,16002,1256],['Manufacturing',288,14620,1250],['Professional and business services',1911,20791,1213],['Construction',1221,10643,1160],
  ['Education and health services',2383,26873,1038],['Local government',68,14877,989],['Trade, transportation and utilities',1738,31755,952],['Other services',919,5269,820],['Natural resources and mining',93,631,777],['Leisure and hospitality',964,17849,379]],
 occ:[['Healthcare practitioners',48840,79170,119229],['Computer and math',51536,79513,98567],['Legal',50199,76831,116261],['Architecture and engineering',51928,75897,93721],['Business and finance',44954,63471,86078],['Life, physical and social science',43559,61131,77842],
  ['Education and library',36604,53419,77339],['Installation and repair',37126,50636,63994],['Construction',37718,48322,61101],['Community and social services',36926,48295,62464],['Arts, media and sports',30439,47462,66032],['Production',33194,46089,53769],
  ['Transportation and moving',30445,43440,64590],['Office and admin support',31754,40591,49649],['Sales',26110,35130,58596],['Food prep and serving',23799,29435,36019]],
 jobs:[['Software developers',68873,101962,117132],['Management',58589,99079,140671],['Heavy truck drivers',50013,89763,90655],['Registered nurses',63774,81305,86762],['Electricians',40899,59845,69187],['Customer service reps',31453,37544,43221],['Retail salespersons',25097,29625,38141],['Cashiers',24469,27954,30977]],
 lf:[[2019,188732,2.8,193100],[2020,187344,4.2,184600],[2021,186463,2.5,186700],[2022,188359,2.0,189900],[2023,190710,2.1,194300]]};
const ECL=[{href:EC.src,label:'Select Lincoln: wages and employment ↗'},{href:EC.pdf,label:'Full 2024 data book (PDF) ↗'}];
function ecBar(v,max,col){return `<div style="height:8px;border-radius:4px;background:#ffffff12;margin:2px 0 6px"><div style="height:100%;width:${(100*v/max).toFixed(1)}%;background:${col||'#e8b84a'};border-radius:4px"></div></div>`}
function ecHTML(tab){const src=t=>`<p style="font-size:12px;opacity:.7">${t} Compiled by the Lincoln Partnership for Economic Development (Select Lincoln), 2024 data book.</p>`;
  if(tab===0){let h='<p>Lincoln\'s largest employers. Counts are ranges; employers report bands, not exact headcounts. Tap one to find it on the map when the map knows its building.</p>';
    h+=EC.lead.map((e,i)=>`<button class="btn go2" data-ec="e:${i}" style="display:flex;justify-content:space-between;width:100%;margin:4px 0;padding:7px 10px;text-align:left"><span><b>${e[0]}</b> <span style="opacity:.65;font-size:12px">${e[1]}</span></span><span>${e[2]}</span></button>`).join('');
    for(const k in EC.sect)h+=`<p style="margin-top:14px"><b>${k}</b></p>`+EC.sect[k].map(e=>`<div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0"><span>${e[0]}</span><span style="opacity:.8">${e[1]}</span></div>`).join('');
    return h+src('Directory of Largest Employers, accessed June 2024.')}
  if(tab===1){const m=Math.max(...EC.ind.map(r=>r[3]));return '<p><b>Average weekly wage by industry</b>, Lincoln metro, 2022. All jobs together averaged <b>$1,054 a week</b> across 175,499 jobs at 11,058 workplaces.</p>'+EC.ind.map(r=>`<div style="display:flex;justify-content:space-between;font-size:13px"><span>${r[0]} <span style="opacity:.6">· ${psN(r[2])} jobs</span></span><b>$${psN(r[3])}</b></div>`+ecBar(r[3],m,/government/i.test(r[0])?'#6aa9e8':null)).join('')+'<p style="font-size:12.5px">Blue bars are government. Leisure and hospitality pays least per week partly because many of its jobs are part-time.</p>'+src('U.S. Department of Labor, Quarterly Census of Employment and Wages, 2022.')}
  if(tab===2){const m=Math.max(...EC.occ.concat(EC.jobs).map(r=>r[3])),row=r=>`<div style="font-size:13px;display:flex;justify-content:space-between"><span>${r[0]}</span><span>$${psN(r[1]/1000)}k · <b>$${psN(r[2]/1000)}k</b> · $${psN(r[3]/1000)}k</span></div><div style="position:relative;height:8px;margin:2px 0 7px;background:#ffffff12;border-radius:4px"><div style="position:absolute;left:${(100*r[1]/m).toFixed(1)}%;width:${(100*(r[3]-r[1])/m).toFixed(1)}%;height:100%;background:#e8b84a55;border-radius:4px"></div><div style="position:absolute;left:${(100*r[2]/m).toFixed(1)}%;width:3px;height:100%;background:#e8b84a"></div></div>`;
    return '<p><b>Yearly pay by occupation</b>, Lincoln metro, early 2024: entry · <b>median</b> · experienced. The bar runs from entry to experienced; the gold tick is the median. All jobs: $30k · <b>$47k</b> · $73k.</p>'+EC.occ.map(row).join('')+'<p style="margin-top:12px"><b>Some single jobs</b></p>'+EC.jobs.map(row).join('')+src('Bureau of Labor Statistics, Occupational Employment and Wage Statistics, Q1 2024. The full table has about 400 occupations.')}
  if(tab===3){const G=[['State government',101,16002,1256],['Local government',68,14877,989],['Federal government',64,3235,1586]],t=34114;
    return '<p><b>About 1 job in 5 in Lincoln is a government job</b>: 34,114 of 175,499 in 2022, paying $1,171 a week on average against $1,026 for private jobs. The State Capitol and the University make Lincoln a government town.</p>'+G.map(r=>`<div style="display:flex;justify-content:space-between;font-size:13px"><span>${r[0]} <span style="opacity:.6">· ${r[1]} workplaces</span></span><span>${psN(r[2])} jobs · <b>$${psN(r[3])}/wk</b></span></div>`+ecBar(r[2],t,'#6aa9e8')).join('')+
     '<p style="margin-top:12px"><b>Jobs by sector, 2023</b> (nonfarm, counted where people work)</p>'+[['Government',41600],['Trade, transportation, utilities',33000],['Education and health',31800],['Manufacturing',15200],['Financial activities',10600]].map(r=>`<div style="display:flex;justify-content:space-between;font-size:13px"><span>${r[0]}</span><b>${psN(r[1])}</b></div>`+ecBar(r[1],194300)).join('')+'<p style="font-size:12.5px">These count differently from the table above (Current Employment Statistics, 2023), so totals do not match exactly.</p>'+src('BLS QCEW 2022 and Current Employment Statistics 2023.')}
  const m=Math.max(...EC.lf.map(r=>r[2]));return '<p><b>Labor force and unemployment</b>, Lincoln metro. Lincoln\'s unemployment rate is among the lowest of any U.S. metro.</p>'+EC.lf.map(r=>`<div style="display:flex;justify-content:space-between;font-size:13px"><span><b>${r[0]}</b> · ${psN(r[1])} in labor force · ${psN(r[3])} jobs</span><b>${r[2]}%</b></div>`+ecBar(r[2],m,r[2]>3?'#e87a5a':null)).join('')+
   '<p>2020 is the pandemic spike. Population: city of Lincoln 294,757 and the metro 344,387 in 2023.</p><p><b>Business advocacy.</b> The Lincoln Chamber of Commerce publishes its own 2026 local, state and federal policy agendas; they are the Chamber\'s positions, linked for reference.</p><p><a href="https://www.lcoc.com/advocacy" target="_blank" rel="noopener">Lincoln Chamber advocacy ↗</a></p>'+src('BLS Local Area Unemployment Statistics; U.S. Census population estimates, 2023.')}
const ECS={title:'Jobs and <i>wages</i>',tabs:['Employers','By industry','By job','Government','Labor force'],html:ecHTML,click:e=>{const b=e.target.closest('[data-ec]');if(!b)return;const i=+b.dataset.ec.split(':')[1],E=EC.lead[i];
  const L=(H.blabels||[]).concat(H.plabels||[]).find(q=>E[3].test(q[0]));closeSheet();if(L){flyTo(camTo(L[1],-L[2],600,200,32,8),2200);showCard(E[0],`${E[1]}. About ${E[2]} people work here across Lincoln (a reported range). The map shows the building it knows by that name; large employers have many sites.`,-1,{label:'Jobs and wages',fn:()=>ecOpen(0)},ECL)}
  else showCard(E[0],`${E[1]}. About ${E[2]} people work for this employer in Lincoln (a reported range). The map does not have its building named, so it stays put.`,-1,{label:'Jobs and wages',fn:()=>ecOpen(0)},ECL)}};
function ecOpen(t){openSheet(ECS,t||0)}
// ---- budget holograms: Nebraska's General Fund over the Capitol, Lincoln's tax-funded budget over the County-City Building.
// They appear when chosen from the menu (or tapped), tick at each budget's average pace through its fiscal year, and open the breakdown.
const BUD={on:false,g:null,st:{t:'Nebraska General Fund',fy:'FY 2026–27',tot:5319251266,y0:Date.UTC(2026,6,1,5),y1:Date.UTC(2027,6,1,5),pop:2005000,popL:'about 2 million Nebraskans',
  seg:[['Education',2231737455,0xe8b84a],['Human resources development (health, welfare)',2037715720,0x6ee7f0],['Public safety (prisons, patrol, courts)',739123646,0xef6a5a],['Public finance (property tax relief and other aid)',211922094,0xa78bfa],['General government',42915195,0x9ca3af],['Agriculture, environment, natural resources',29084568,0x4ade80],['Economic development',26752588,0xf59e0b]],
  src:[{href:'https://das.nebraska.gov/budget/publications/docs/2025-2027/2026/2026%20General%20Fund%20Functional%20Summary.pdf',label:'State budget by function (DAS) ↗'},{href:'https://statespending.nebraska.gov/',label:'State checkbook, monthly ↗'},{href:'https://nebraskalegislature.gov/pdf/reports/fiscal/2026budget.pdf',label:'Legislature\'s budget report ↗'}]},
 ci:{t:'City of Lincoln, tax-funded',fy:'FY 2026–27',tot:316600000,y0:Date.UTC(2026,8,1,5),y1:Date.UTC(2027,8,1,5),pop:294757,popL:'294,757 Lincoln residents',
  seg:[['Public safety (police, fire, their pension)',.57,0xef6a5a],['Parks and recreation',.10,0x4ade80],['Libraries',.05,0x6ee7f0],['Everything else (streets, health, planning, transit, government)',.28,0xe8b84a]],
  src:[{href:'https://www.lincoln.ne.gov/City/Departments/Finance/Budget',label:'City budget documents ↗'},{href:'https://www.lincoln.ne.gov/files/sharedassets/public/v/1/finance/budget/2026-2028-council-budget/city-council-final-changes-approved-8-24-26-to-2026-28-mayors-proposed-budget.pdf',label:'Council changes, Aug 24, 2026 ↗'}]}};
function budSpent(B,t){const f=Math.max(0,Math.min(1,((t||Date.now())-B.y0)/(B.y1-B.y0)));return [B.tot*f,f]}
function budMoney(v){return v>=1e9?'$'+(v/1e9).toFixed(3)+' billion':v>=1e6?'$'+(v/1e6).toFixed(2)+' million':'$'+psN(v)}
function budHolo(B,x,z,y0,R,Hh){const g=new THREE.Group();let y=y0;const tot=B.seg.reduce((s,q)=>s+q[1],0);
  for(const [n,v,col] of B.seg){const h=Hh*v/tot,m=new THREE.Mesh(new THREE.CylinderGeometry(R,R,Math.max(h-.6,.4),48,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.34,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.y=y+h/2;g.add(m);
    const r=new THREE.Mesh(new THREE.TorusGeometry(R,.5,6,64),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));r.rotation.x=Math.PI/2;r.position.y=y+.3;g.add(r);y+=h}
  const cap=new THREE.Mesh(new THREE.TorusGeometry(R,.6,6,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));cap.rotation.x=Math.PI/2;cap.position.y=y;g.add(cap);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(R*.08,R*.5,y0,24,1,true),new THREE.MeshBasicMaterial({color:0x9ff3ff,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));beam.position.y=y0/2;g.add(beam);
  const cv=document.createElement('canvas');cv.width=640;cv.height=200;const tx=new THREE.CanvasTexture(cv),sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,depthTest:false}));sp.scale.set(R*4.2,R*1.31,1);sp.position.y=y+R*.95;g.add(sp);
  g.position.set(x,hAt(x,z),z);g.userData={B,cv,tx,last:0,base:g.children.map(o=>o.material.opacity)};g.visible=false;scene.add(g);return g}
function budDraw(g){const {B,cv,tx}=g.userData,c=cv.getContext('2d'),[s,f]=budSpent(B);c.clearRect(0,0,640,200);c.fillStyle='rgba(8,24,32,.55)';c.fillRect(0,0,640,200);c.strokeStyle='rgba(120,240,255,.8)';c.lineWidth=3;c.strokeRect(2,2,636,196);
  c.textAlign='center';c.fillStyle='#9ff3ff';c.font='600 24px Inter,system-ui,sans-serif';c.fillText(B.t.toUpperCase()+' · '+B.fy,320,46);c.fillStyle='#fff';c.font='700 58px Inter,system-ui,sans-serif';c.fillText('$'+Math.floor(s).toLocaleString('en-US'),320,112);
  c.fillStyle='#9ff3ff';c.font='500 22px Inter,system-ui,sans-serif';c.fillText('spent so far at the average pace · '+(100*f).toFixed(1)+'% of the year',320,150);c.fillText('of '+budMoney(B.tot)+' · tap for where it goes',320,184);tx.needsUpdate=true}
function budInit(){if(BUD.g||!LM.capitol)return;const c=LM.capitol,lat=40.8093,lon=-96.7053,cx=(lon-H.lon0)*KXm,cz=-(lat-H.lat0)*KYm;
  BUD.g=[budHolo(BUD.st,c[0]+190,c[1],135,40,100),budHolo(BUD.ci,cx,cz,70,26,70)];BUD.g.forEach((g,i)=>{g.traverse(o=>{if(o.isMesh||o.isSprite)o.userData.card=()=>budOpen(i)});pickables.push(g)})}
function stepBud(now){if(!BUD.on){if(BUD.g)BUD.g.forEach(g=>g.visible=false);return}budInit();if(!BUD.g)return;for(const g of BUD.g){g.visible=true;g.rotation.y=now*.00025;const fl=.85+.15*Math.sin(now*.013+g.position.x)*Math.sin(now*.0047);g.children.forEach((o,i)=>{if(!o.isSprite)o.material.opacity=g.userData.base[i]*fl});
  if(now-g.userData.last>250){g.userData.last=now;budDraw(g)}}ambient=true;dirty=true}
function budHTML(tab){BUD.tab=tab;if(tab===2)return '<p><b>Is this real time?</b> The counters are not a live feed of checks. Governments publish budgets, not second-by-second spending, so each counter runs at the budget\'s average pace: the year\'s total spread evenly from the first day of the fiscal year. Nebraska\'s year starts July 1; Lincoln\'s starts September 1.</p><p><b>The state\'s actual payments</b> are posted monthly to the State Treasurer\'s checkbook site, down to the vendor. The General Fund is the state\'s main account, paid mostly from sales and income taxes; cash, federal and revolving funds add billions more and are not in the hologram.</p><p><b>The city\'s tax-funded budget</b> is the part paid by property, sales and occupation taxes. Utilities like water and electricity run on their own rates and are not in it.</p><p><b>Reading the hologram:</b> each glowing band is one slice; taller means more money. It turns slowly so you can read it from any side.</p>';
  const B=tab===0?BUD.st:BUD.ci,[s,f]=budSpent(B),tot=B.seg.reduce((a,q)=>a+q[1],0),m=Math.max(...B.seg.map(q=>q[1]));
  return `<p style="font-size:13px;opacity:.75">${B.t}, ${B.fy}</p><div style="font-size:30px;font-weight:700" id="budCt">$${Math.floor(s).toLocaleString('en-US')}</div><p>spent so far this fiscal year at the budget's average pace (${(100*f).toFixed(1)}% of the year), out of <b>${budMoney(B.tot)}</b>. That is about <b>$${psN(B.tot/B.pop)}</b> for each of ${B.popL}, or <b>$${psN(B.tot/365/86400)}</b> a second.</p>`+
   B.seg.map(([n,v,col])=>{const amt=tab===0?v:v*B.tot,sh=v/tot;return `<div style="display:flex;justify-content:space-between;font-size:13px"><span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:#${col.toString(16).padStart(6,'0')};margin-right:6px"></span>${n}</span><span>${budMoney(amt)} · <b>${Math.round(100*sh)}%</b></span></div><div style="height:8px;border-radius:4px;background:#ffffff12;margin:2px 0 7px"><div style="height:100%;width:${(100*v/m).toFixed(1)}%;background:#${col.toString(16).padStart(6,'0')};border-radius:4px"></div></div>`}).join('')+
   (tab===0?'<p style="font-size:12.5px">The state also moves $442 million from the General Fund into the Property Tax Credit Fund this year. Source: Department of Administrative Services, General Fund functional summary as of the 2026 session.</p>':'<p style="font-size:12.5px">The Council adopted the 2026–28 budget on August 24, 2026. Year two (FY 2027–28) is about $334.6 million. Shares are the city\'s own year-one figures; "everything else" is the remainder.</p>')+'<button class="btn go2" data-bud="off">Hide the holograms</button>'}
const BUDS={title:'Where the <i>money</i> goes',tabs:['Nebraska','Lincoln','Is this real time?'],html:budHTML,click:e=>{const b=e.target.closest('[data-bud]');if(!b)return;BUD.on=false;closeSheet()}};
let budT=null;
function budOpen(t){BUD.on=true;openSheet(BUDS,t||0);clearInterval(budT);budT=setInterval(()=>{const el=document.getElementById('budCt');if(!el||sheet!==BUDS){clearInterval(budT);return}const B=BUD.tab===1?BUD.ci:BUD.st;el.textContent='$'+Math.floor(budSpent(B)[0]).toLocaleString('en-US')},250);
  const c=LM.capitol;if(c){const d=camera.position.distanceTo(controls.target);if(d>6000||Math.hypot(controls.target.x-c[0],controls.target.z-c[1])>1500)flyTo(camTo(c[0]+80,c[1]+300,1400,200,22,40),2200)}}

// ---- the browser's Back button leaves the night sky, a walk or the telescope and returns to the map, instead of leaving the page
let VHIST=false;
function viewHist(){const inV=walk.on||NSKY.on;if(inV&&!VHIST){VHIST=true;try{history.pushState({starcityView:1},'')}catch(e){}}else if(!inV&&VHIST){VHIST=false;try{if(history.state&&history.state.starcityView)history.back()}catch(e){}}}
addEventListener('popstate',()=>{if(walk.on||NSKY.on){VHIST=false;try{scopeOff()}catch(e){}viewExit(false)}});

// ---- a soft gold halo on the ground around the building whose card is open, so you can see which one it means
const HALO={m:null,on:false,t0:0};
function haloAt(o,st,lo){const g=o.geometry,P=g.attributes.position,I=g.index,i0=st[lo],i1=lo+1<st.length?st[lo+1]:(I?I.count:P.count);let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9;const v=new THREE.Vector3();
  for(let k=i0;k<i1;k++){const j=I?I.getX(k):k;v.fromBufferAttribute(P,j);o.localToWorld(v);if(v.x<x0)x0=v.x;if(v.x>x1)x1=v.x;if(v.z<z0)z0=v.z;if(v.z>z1)z1=v.z;if(v.y<y0)y0=v.y}
  if(x1<x0)return;const cx=(x0+x1)/2,cz=(z0+z1)/2,r=Math.max(4,Math.hypot(x1-x0,z1-z0)/2);
  if(!HALO.m){const g2=new THREE.Group(),ring=new THREE.Mesh(new THREE.RingGeometry(.86,1,64),new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.95,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})),
    glow=new THREE.Mesh(new THREE.RingGeometry(1,1.35,64),new THREE.MeshBasicMaterial({color:0xffb52e,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
    ring.rotation.x=glow.rotation.x=-Math.PI/2;g2.add(ring,glow);g2.renderOrder=5;scene.add(g2);HALO.m=g2}
  HALO.m.position.set(cx,y0+.6,cz);HALO.m.scale.setScalar(r*1.12);HALO.m.visible=true;HALO.on=true;HALO.t0=performance.now();dirty=true}
function haloStep(now){if(!HALO.on)return;const c=$('card');if(!c||c.style.display==='none'||walk.on){HALO.on=false;HALO.m.visible=false;dirty=true;return}const u=(now-HALO.t0)/1000,s=1+.06*Math.sin(u*3.2)+(u<.5?(.5-u)*.8:0);
  HALO.m.children[0].scale.setScalar(s);HALO.m.children[1].scale.setScalar(s);HALO.m.children[1].material.opacity=.25+.15*Math.sin(u*3.2);ambient=true;dirty=true}
// ---- three southern flying squirrels on East Campus. Native to eastern Nebraska, out from dusk to dawn.
// Before each glide one works the numbers in a thought cloud, then launches tree to tree. By day they sleep in a tree hole.
const FSQ={L:null,list:[],cx:-2100,cz:-6660,H:15.5};
function fsqMath(q,dist,h){const LD=(dist/h),ang=Math.atan(h/dist)/RD,v=Math.sqrt(2*.075*9.81/(1.2*.016*.9)),w=windV?Math.round(windV.ms*2.237):0;
  const M=[`Δh = ${h.toFixed(0)} m · range = ${dist.toFixed(0)} m`,`glide angle θ = atan(${h.toFixed(0)}/${dist.toFixed(0)}) ≈ ${ang.toFixed(0)}°`,`L/D needed = ${LD.toFixed(1)} … patagium says ~2 ✓`,`v = √(2mg / ρSC_L) ≈ ${v.toFixed(1)} m/s`,
   `t = ∫ ds / v ≈ ${(dist/v).toFixed(1)} s`,`dE/dt = −mg·v·sin θ … fine`,w?`wind ${w} mph · crab ${Math.min(20,Math.round(w*1.3))}° upwind`:'no wind · aim straight',`flare at 1.5 m · tail as air brake`,`∂(acorns)/∂t > 0 · go`];return M[q.mi++%M.length]}
function fsqInit(){const ec=(H.blabels||[]).find(b=>/East Union/i.test(b[0]));if(ec){FSQ.cx=ec[1];FSQ.cz=-ec[2]}let T=ybTrees(FSQ.cx,FSQ.cz,350);if(T.length<12)T=ybTrees(FSQ.cx,FSQ.cz,800);if(T.length<6)return false;FSQ.T=T;const mat=new THREE.MeshLambertMaterial({color:0x8a7a66}),belly=new THREE.MeshLambertMaterial({color:0xd9cdb8});
  for(let k=0;k<3;k++){const g=new THREE.Group(),body=new THREE.Mesh(new THREE.BoxGeometry(.11,.07,.26),mat),wing=new THREE.Mesh(new THREE.BoxGeometry(.36,.015,.22),mat),tail=new THREE.Mesh(new THREE.BoxGeometry(.07,.02,.2),mat),head=new THREE.Mesh(new THREE.BoxGeometry(.08,.07,.08),belly);
    tail.position.z=.22;head.position.z=-.16;head.position.y=.02;g.add(body,wing,tail,head);g.userData.wing=wing;g.userData.info=['Southern flying squirrel','Native to eastern Nebraska and out only at night. It does not fly; it glides on a skin flap between its wrists and ankles, steering with its tail, up to about 50 m from a tall tree. On this map three of them work out the math first.'];
    scene.add(g);pickables.push(g);const i=T[(Math.random()*T.length)|0];FSQ.list.push({g,st:'sit',t:0,at:i,to:-1,mi:k*3,lb:{t:'',sub:'',x:0,y:0,z:0,k:3,pri:1000,near:0,far:900},hold:2000+k*2500})}return true}
function fsqPos(i,h){const x=TR.X[2*i],z=TR.X[2*i+1];return new THREE.Vector3(x,hAt(x,z)+h,z)}
function stepFSQ(now){if(!TR.X)return;const t=controls.target,d=camera.position.distanceTo(t);if(Math.hypot(t.x-FSQ.cx,t.z-FSQ.cz)>1400||d>1600){if(FSQ.list.length)for(const q of FSQ.list)q.g.visible=false;return}
  if(!FSQ.list.length&&!fsqInit())return;const night=sleepy()||U.uNight.value>.45,sc=Math.max(3,d/20);
  for(const q of FSQ.list){const g=q.g;g.visible=true;g.scale.setScalar(sc);
    if(!night){const p=fsqPos(q.at,10);g.position.copy(p);g.userData.wing.scale.x=.3;q.lb.t='z z';q.lb.sub='flying squirrel, asleep in a tree hole';q.lb.x=p.x;q.lb.y=p.y+2*sc;q.lb.z=p.z;lifeLabels.push(q.lb);q.st='sit';q.t=now;continue}
    if(q.st==='sit'){const p=fsqPos(q.at,FSQ.H);g.position.copy(p);g.userData.wing.scale.x=.3;if(now-q.t>q.hold){q.st='think';q.t=now;let b=-1;for(let n=0;n<80;n++){const c=FSQ.T[(Math.random()*FSQ.T.length)|0],dd=Math.hypot(TR.X[2*c]-TR.X[2*q.at],TR.X[2*c+1]-TR.X[2*q.at+1]);if(dd>14&&dd<48){b=c;break}}if(b<0){let bd=1e9;for(const c of FSQ.T){const dd=Math.hypot(TR.X[2*c]-TR.X[2*q.at],TR.X[2*c+1]-TR.X[2*q.at+1]);if(dd>8&&dd<bd){bd=dd;b=c}}}q.to=b<0?q.at:b;
        const B=fsqPos(q.to,3),dist=Math.max(5,Math.hypot(B.x-p.x,B.z-p.z));q.math=[fsqMath(q,dist,9),fsqMath(q,dist,9),fsqMath(q,dist,9)]}}
    else if(q.st==='think'){const p=fsqPos(q.at,FSQ.H),k=Math.min(2,Math.floor((now-q.t)/3200));g.position.copy(p);q.lb.t='💭 '+q.math[k];q.lb.sub='flying squirrel, doing the flight math';q.lb.x=p.x;q.lb.y=p.y+2.2*sc;q.lb.z=p.z;lifeLabels.push(q.lb);if(now-q.t>9600){q.st='glide';q.t=now}}
    else{const A=fsqPos(q.at,FSQ.H),B=fsqPos(q.to,FSQ.H-6),dist=Math.hypot(B.x-A.x,B.z-A.z),dur=Math.max(1800,dist/7.6*1000),u=Math.min(1,(now-q.t)/dur);g.position.lerpVectors(A,B,u);g.position.y-=Math.sin(u*Math.PI)*1.2;
      g.rotation.y=Math.atan2(-(B.x-A.x),-(B.z-A.z));g.userData.wing.scale.x=u>.9?.5:1;if(u<.5&&u>.05){q.lb.t='wheee';q.lb.sub='';q.lb.x=g.position.x;q.lb.y=g.position.y+1.6*sc;q.lb.z=g.position.z;lifeLabels.push(q.lb)}
      if(u>=1){q.at=q.to;q.st='sit';q.t=now;q.hold=6000+Math.random()*14000}}}
  ambient=true;dirty=true}

// ---- read the map in another language. Lincoln's most common home languages after English first.
// Uses Google's page translation, loaded only when someone picks a language; English reloads the original.
const LANGS=[['es','Español','Spanish'],['vi','Tiếng Việt','Vietnamese'],['ar','العربية','Arabic'],['ckb','کوردی (سۆرانی)','Kurdish, Sorani'],['ku','Kurdî (Kurmancî)','Kurdish, Kurmanji'],['zh-CN','中文','Chinese'],['ne','नेपाली','Nepali'],['fr','Français','French'],['sw','Kiswahili','Swahili'],['ru','Русский','Russian'],['de','Deutsch','German'],['en','English','English']];
function langCur(){const m=document.cookie.match(/googtrans=\/en\/([^;]+)/);return m?m[1]:'en'}
function langHTML(){const c=langCur();return '<p>Pick a language to read the map, its cards and its views in it. Machine translation by Google: good for getting around, not perfect, and street and place names stay as they are. The text on screen is sent to Google to translate.</p>'+
  LANGS.map(([k,n,e])=>`<button class="btn go2${k===c?' on':''}" data-lg="${k}" style="display:flex;justify-content:space-between;width:100%;margin:5px 0;padding:9px 12px"><b dir="auto">${n}</b><span style="opacity:.65">${e}</span></button>`).join('')}
const LANGS_S={title:'<i>Language</i>',tabs:['Choose'],html:langHTML,click:e=>{const b=e.target.closest('[data-lg]');if(!b)return;langSet(b.dataset.lg)}};
function langOpen(){openSheet(LANGS_S,0)}
function langSet(k){const host=location.hostname,exp='expires=Thu, 01 Jan 1970 00:00:00 GMT';
  if(k==='en'){for(const d of ['',';domain='+host,';domain=.'+host])document.cookie='googtrans=;'+exp+';path=/'+d;location.reload();return}
  document.cookie='googtrans=/en/'+k+';path=/';closeSheet();
  const go=()=>{const s=document.querySelector('.goog-te-combo');if(s){s.value=k;s.dispatchEvent(new Event('change'))}else setTimeout(go,300)};
  if(window.google&&google.translate&&google.translate.TranslateElement){go();return}
  if(!document.getElementById('gt_el')){const d=document.createElement('div');d.id='gt_el';document.body.appendChild(d)}
  window.gtInit=()=>{new google.translate.TranslateElement({pageLanguage:'en',autoDisplay:false},'gt_el');go()};
  const sc=document.createElement('script');sc.src='https://translate.google.com/translate_a/element.js?cb=gtInit';document.head.appendChild(sc)}
$('bLang').onclick=langOpen;
// someone who picked a language before gets it again on their next visit
if(langCur()!=='en')setTimeout(()=>langSet(langCur()),1500);

// ---- card stunt: when the crowd chants, the two sideline stands flip white cards that spell MEAT on one side and PIE on the other
const CS={m:null,t0:0,on:false,F:{M:['10001','11011','10101','10101','10001','10001','10001'],E:['11111','10000','10000','11110','10000','10000','11111'],A:['01110','10001','10001','11111','10001','10001','10001'],T:['11111','00100','00100','00100','00100','00100','00100'],P:['11110','10001','10001','11110','10000','10000','10000'],I:['11111','00100','00100','00100','00100','00100','11111']}};
function csDraw(o,u){const c=o.cv.getContext('2d'),W=o.cv.width,Hc=o.cv.height,word=o.w,cols=word.length*6-1,cw=Math.floor(W/(cols+4)),ch=Math.floor(Hc/11),x0=Math.floor((W-cols*cw)/2),y0=Math.floor((Hc-7*ch)/2);
  c.fillStyle='#8f0016';c.fillRect(0,0,W,Hc);const nC=Math.ceil(W/cw),nR=Math.ceil(Hc/ch);
  for(let r=0;r<nR;r++)for(let q=0;q<nC;q++){const gx=q*cw-((cw-x0%cw)%cw),gy=r*ch-((ch-y0%ch)%ch),lc=Math.round((gx-x0)/cw),lr=Math.round((gy-y0)/ch);let on=false;
    if(lr>=0&&lr<7&&lc>=0&&lc<cols){const L=Math.floor(lc/6),k=lc%6;if(k<5)on=CS.F[word[L]][lr][k]==='1'}
    const flip=Math.min(1,Math.max(0,u*1.6-q/nC*0.6)),show=on&&flip>0.5,sq=Math.abs(Math.cos(flip*Math.PI));
    c.fillStyle=show?'#ffffff':((q+r)%2?'#c8102e':'#b40d27');const hh=(ch-3)*(on?Math.max(.15,sq===0?1:(flip>0&&flip<1?sq:1)):1);c.fillRect(gx+1,gy+(ch-hh)/2,cw-2,hh)}
  o.tx.needsUpdate=true}
function csInit(){if(CS.m||!LM.stadG)return;const s=LM.stadG,[ax,az]=LM.stadA,X2=ax-16,dx=X2-36,dy=44.8,L=Math.hypot(dx,dy),th=Math.atan2(dx,dy),len=Math.min(84,az*1.1);CS.m=[];
  for(const [side,word] of [[-1,'MEAT'],[1,'PIE']]){const cv=document.createElement('canvas');cv.width=1024;cv.height=Math.round(1024*L/len);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;
    const g=new THREE.PlaneGeometry(len,L*.86);g.rotateY(side<0?Math.PI/2:-Math.PI/2);g.rotateZ(side<0?th:-th);
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tx,transparent:true,opacity:0,polygonOffset:true,polygonOffsetFactor:-4,side:THREE.DoubleSide}));
    const n=new THREE.Vector3(side<0?Math.cos(th):-Math.cos(th),Math.sin(th),0);m.position.set(side*(36+X2)/2,(1.2+46)/2,0).addScaledVector(n,2.2);m.visible=false;s.add(m);CS.m.push({m,cv,tx,w:word,last:-1})}}
function stepCS(now){if(!LM.stadG)return;csInit();if(!CS.m)return;const act=now<MPP.until||MPP.ri>=0;if(act&&!CS.on){CS.on=true;CS.t0=now}if(!act&&CS.on&&now-CS.t0>2500){CS.on=false;CS.t0=now}
  const u=CS.on?Math.min(1,(now-CS.t0)/1400):Math.max(0,1-(now-CS.t0)/700);for(const o of CS.m){o.m.visible=u>0.01;o.m.material.opacity=Math.min(1,u*1.5);const st=Math.round(u*24);if(st!==o.last&&o.m.visible){o.last=st;csDraw(o,u)}}if(u>0&&u<1){ambient=true;dirty=true}}
// ---- the Little Bluestem Star City Prix: five Nebraska animals race north on the Jamaica North Trail from the south city limit,
// cross to the MoPac Trail and race east to where MoPac leaves the city limits. A fox starts them; a raccoon waves the checkered flag.
const PX={on:false,cl:null,course:null,racers:[],dir:[],pick:0,len:'full',wx:'real',t0:0,last:0,say:'',sayT:0,done:false,fin:[],follow:true,
 R:[{k:'lark',n:'Western meadowlark',c:0xf2c200,v:1.18,tag:'state bird, sings at every fence post'},{k:'bee',n:'Honeybee',c:0xffb300,v:1.0,tag:'state insect, loves goldenrod'},{k:'deer',n:'White-tailed deer',c:0xa0703c,v:1.14,tag:'state mammal, spooks easily'},
  {k:'cat',n:'Channel catfish',c:0x6f7f8a,v:.86,tag:'state fish, rides a wet wagon until the creeks'},{k:'turtle',n:'Ornate box turtle',c:0x6b8f3a,v:.62,tag:'state reptile, slow, steady, knows every culvert'}]};
function pxIn(x,z){let c=false;for(const r of PX.cl.rings)for(let i=0,j=r.length-2;i<r.length;j=i,i+=2){const xi=r[i],zi=r[i+1],xj=r[j],zj=r[j+1];if((zi>z)!=(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c}return c}
function pxPath(name){const TR=LM.trails;let best=-1;for(let w=0;w<TR.length;w++){const T=TR[w];if(T.tn===65535||!H.tnames||H.tnames[T.tn]!==name)continue;if(best<0||TR[best].len<T.len)best=w}return best<0?null:trailPath(best)}
function pxCourse(){const J=pxPath('Jamaica North Trail'),M=pxPath('MoPac Trail');if(!J||!M)return null;const pts=a=>{const o=[];for(let i=0;i<a.length;i+=2)o.push([a[i],a[i+1]]);return o};
  let j=pts(J),m=pts(M);if(j[0][1]<j[j.length-1][1])j.reverse();if(m[0][0]>m[m.length-1][0])m.reverse();
  // start: the first point of Jamaica North, going north, that is inside the city limits
  let s=0;while(s<j.length-1&&!pxIn(j[s][0],j[s][1]))s++;j=j.slice(s);
  // connect from Jamaica's north end to the nearest point on MoPac, then MoPac east to the last point inside the city limits
  const e=j[j.length-1];let bi=0,bd=1e18;m.forEach((p,i)=>{const d=(p[0]-e[0])**2+(p[1]-e[1])**2;if(d<bd){bd=d;bi=i}});
  // follow the trail network from Jamaica's north end to MoPac instead of cutting across town
  const link=pxLink(e,m);let conn=[];if(link){conn=link.path;bi=link.mi;bd=0}
  const jn=j.length;j=j.concat(conn);let mm=m.slice(bi);let f=0;for(let i=0;i<mm.length;i++){if(pxIn(mm[i][0],mm[i][1]))f=i;else if(i>f+3)break}mm=mm.slice(0,f+1);
  const all=j.concat(mm),cum=[0];for(let i=1;i<all.length;i++)cum.push(cum[i-1]+Math.hypot(all[i][0]-all[i-1][0],all[i][1]-all[i-1][1]));return {p:all,cum,L:cum[cum.length-1],jL:cum[jn-1],conn:Math.sqrt(bd)}}
function pxLink(e,m,SNAP){SNAP=SNAP||70;const TR=LM.trails,X=[],Z=[],adj=[],G=new Map(),cs=SNAP,key=(x,z)=>Math.floor(x/cs)*100003+Math.floor(z/cs);
  for(const T of TR){const D=T.d;let prev=-1;for(let k=0;k+1<D.length;k+=2){const id=X.length;X.push(D[k]);Z.push(D[k+1]);adj.push([]);if(prev>=0){const w=Math.hypot(D[k]-X[prev],D[k+1]-Z[prev]);adj[prev].push(id,w);adj[id].push(prev,w)}prev=id;const kk=key(D[k],D[k+1]);(G.get(kk)||G.set(kk,[]).get(kk)).push(id)}}
  for(const [kk,ids] of G){for(const a of ids){const gx=Math.floor(X[a]/cs),gz=Math.floor(Z[a]/cs);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const L=G.get((gx+dx)*100003+gz+dz);if(!L)continue;for(const b of L){if(b<=a)continue;const w=Math.hypot(X[a]-X[b],Z[a]-Z[b]);if(w<SNAP){adj[a].push(b,w*3+5);adj[b].push(a,w*3+5)}}}}}
  const MG=new Map();m.forEach((p,i)=>{const kk=key(p[0],p[1]);(MG.get(kk)||MG.set(kk,[]).get(kk)).push(i)});
  let src=-1,sd=1e18;for(let i=0;i<X.length;i++){const d=(X[i]-e[0])**2+(Z[i]-e[1])**2;if(d<sd){sd=d;src=i}}if(src<0)return null;
  const dist=new Float64Array(X.length).fill(Infinity),prv=new Int32Array(X.length).fill(-1),H=[[0,src]];dist[src]=0;
  const push=(d,i)=>{H.push([d,i]);let c=H.length-1;while(c>0){const p=(c-1)>>1;if(H[p][0]<=H[c][0])break;[H[p],H[c]]=[H[c],H[p]];c=p}},pop=()=>{const t=H[0],l=H.pop();if(H.length){H[0]=l;let c=0;for(;;){const a=2*c+1,b=a+1;let s=c;if(a<H.length&&H[a][0]<H[s][0])s=a;if(b<H.length&&H[b][0]<H[s][0])s=b;if(s===c)break;[H[s],H[c]]=[H[c],H[s]];c=s}}return t};
  while(H.length){const [d,u]=pop();if(d>dist[u])continue;if(d>40000)break;const L=MG.get(key(X[u],Z[u]));if(L&&d>0){let mi=-1,md=1e18;for(const i of L){const dd=(m[i][0]-X[u])**2+(m[i][1]-Z[u])**2;if(dd<md){md=dd;mi=i}}if(md<400){const path=[];for(let v=u;v>=0;v=prv[v])path.push([X[v],Z[v]]);path.reverse();return {path,mi,d}}}
    const A=adj[u];for(let q=0;q<A.length;q+=2){const v=A[q],nd=d+A[q+1];if(nd<dist[v]){dist[v]=nd;prv[v]=u;push(nd,v)}}}return null}
function pxAt(s){const C=PX.course,p=C.p,c=C.cum;s=Math.max(0,Math.min(C.L,s));let lo=0,hi=c.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(c[m]<=s)lo=m;else hi=m}const u=(s-c[lo])/Math.max(1e-6,c[hi]-c[lo]);const x=p[lo][0]+(p[hi][0]-p[lo][0])*u,z=p[lo][1]+(p[hi][1]-p[lo][1])*u;return [x,z,Math.atan2(p[hi][0]-p[lo][0],p[hi][1]-p[lo][1])]}
function pxMesh(k,c){const g=new THREE.Group(),MC={},M=(col,op)=>{const key=col+'_'+(op||1);return MC[key]||(MC[key]=new THREE.MeshLambertMaterial(op?{color:col,transparent:true,opacity:op,depthWrite:false}:{color:col}))},
  B=(w,h,d,col,x,y,z,p,op)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(col,op));m.position.set(x,y,z);(p||g).add(m);return m},
  S=(r,col,x,y,z,sx,sy,sz,p,op)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),M(col,op));m.position.set(x,y,z);m.scale.set(sx||1,sy||1,sz||1);(p||g).add(m);return m},
  P=(x,y,z,p)=>{const o=new THREE.Group();o.position.set(x,y,z);(p||g).add(o);return o},u={k,legs:[],wings:[]};g.userData=u;
  if(k==='lark'){// western meadowlark: streaky brown back, yellow breast with a black V, white outer tail feathers
    const body=P(0,.65,0);u.body=body;S(.32,0x8a6a3a,0,0,0,1,.9,1.5,body);S(.27,0xf2c200,0,-.06,-.12,1,.85,1.25,body);
    B(.36,.07,.06,0x1b1b1b,0,.06,-.42,body).rotation.x=.3;B(.05,.2,.05,0x1b1b1b,-.1,-.02,-.4,body).rotation.z=.5;B(.05,.2,.05,0x1b1b1b,.1,-.02,-.4,body).rotation.z=-.5;
    for(const z of[-.1,.1,.3])B(.3,.02,.06,0x4a3620,0,.27,z,body);
    const hd=P(0,.28,-.45,body);u.head=hd;S(.17,0x8a6a3a,0,0,0,1,1,1.1,hd);S(.12,0xf2c200,0,-.06,-.07,1,.8,1,hd);B(.04,.02,.22,0xf2e6cc,0,.12,0,hd);
    for(const sx of[-.12,.12])S(.03,0x111111,sx,.04,-.07,1,1,1,hd);const bk=B(.05,.05,.28,0x9a8a6a,0,-.02,-.24,hd);bk.rotation.x=.12;u.beak=bk;
    const tl=P(0,.02,.42,body);B(.28,.04,.4,0x6a5030,0,0,.18,tl);for(const sx of[-.13,.13])B(.05,.045,.4,0xffffff,sx,.005,.18,tl);tl.rotation.x=-.25;u.tail=tl;
    for(const s of[-1,1]){const w=P(s*.28,.1,0,body);B(.6,.04,.5,0x7a5a32,s*.3,0,.02,w);for(const z of[-.12,.08])B(.55,.045,.05,0x3a2a18,s*.3,.01,z,w);u.wings.push([w,s])}
    for(const s of[-1,1]){const l=P(s*.1,-.22,0,body);B(.04,.3,.04,0xc9a27a,0,-.15,0,l);B(.12,.03,.14,0xc9a27a,0,-.3,-.04,l);u.legs.push(l)}}
  else if(k==='bee'){// honeybee: fuzzy amber thorax, striped abdomen, glassy wings that buzz
    const body=P(0,.75,0);u.body=body;S(.2,0xc9902a,0,.05,-.08,1,1,1,body);S(.16,0x2a1a0a,0,.05,-.33,1,1,1,body);
    for(const sx of[-.1,.1]){S(.07,0x111111,sx,.09,-.43,1,1.3,.6,body);const an=B(.025,.3,.025,0x1a1a1a,sx*.6,.27,-.42,body);an.rotation.set(-.6,0,sx*2)}
    const ab=P(0,0,.12,body);u.abdomen=ab;const cols=[0xf2b31b,0x1b1208,0xf2b31b,0x1b1208,0xf2b31b,0x1b1208];cols.forEach((col,i)=>S(.21-i*.025,col,0,-.02*i,.05+i*.08,1,1,.5,ab));B(.025,.025,.14,0x222222,0,-.12,.52,ab);
    for(const s of[-1,1]){const w=P(s*.1,.22,-.1,body);B(.5,.015,.25,0xe8f4ff,s*.26,0,.06,w,.55);B(.32,.015,.16,0xe8f4ff,s*.18,0,.3,w,.45);u.wings.push([w,s])}
    for(const s of[-1,1])for(const z of[-.15,-.05,.05]){const l=P(s*.12,-.1,z,body);B(.025,.22,.025,0x1a1a1a,s*.05,-.1,0,l).rotation.z=s*.5;u.legs.push(l)}
    const pol=S(.06,0xffd84a,0,-.15,.03,1,1,1,body);pol.visible=true}
  else if(k==='deer'){// white-tailed deer: tan coat, white belly and throat, a white flag tail, a buck's antlers
    const body=P(0,1.3,0);u.body=body;B(.5,.55,1.35,c,0,0,0,body);B(.42,.12,1.1,0xf2ead8,0,-.28,0,body);S(.3,c,0,.02,.6,1,1,1,body);S(.29,c,0,.06,-.58,1,1,1,body);
    const nk=P(0,.2,-.62,body);u.neck=nk;const n=B(.24,.6,.26,c,0,.22,-.08,nk);n.rotation.x=-.45;B(.16,.25,.08,0xffffff,0,.12,-.2,nk).rotation.x=-.45;
    const hd=P(0,.52,-.28,nk);u.head=hd;B(.24,.24,.32,c,0,0,0,hd);B(.18,.16,.26,c,0,-.05,-.26,hd);B(.1,.07,.06,0x1a1a1a,0,-.02,-.4,hd);B(.2,.05,.08,0xffffff,0,-.12,-.3,hd);
    for(const s of[-1,1]){S(.04,0x111111,s*.12,.04,-.08,1,1,1,hd);const e=B(.08,.22,.04,c,s*.15,.17,.08,hd);e.rotation.z=s*-.7;
      const an=P(s*.07,.13,0,hd);const m1=B(.035,.32,.035,0xd8c8a0,0,.15,0,an);m1.rotation.set(-.3,0,s*-.35);const m2=B(.035,.36,.035,0xd8c8a0,s*.09,.27,-.12,an);m2.rotation.set(-1.1,0,s*-.2);for(const t of[0,1])B(.03,.16,.03,0xd8c8a0,s*(.1+t*.02),.34,-.06-t*.12,an).rotation.z=s*-.15}
    const tl=P(0,.18,.68,body);u.tail=tl;B(.14,.08,.3,c,0,0,.12,tl);B(.13,.07,.28,0xffffff,0,-.04,.13,tl);
    for(const sx of[-.16,.16])for(const sz of[-.52,.52]){const l=P(sx,-.22,sz,body);B(.11,.5,.11,c,0,-.25,0,l);const lo=P(0,-.5,0,l);B(.08,.48,.08,c,0,-.24,0,lo);B(.09,.08,.11,0x2a2018,0,-.5,-.01,lo);u.legs.push([l,lo,sz<0])}}
  else if(k==='cat'){// channel catfish riding a little red wagon with a water tank: forked tail, whiskers, spotted gray-blue
    const wg=P(0,0,0);u.wagon=wg;B(1.2,.28,1.8,0xc81e1e,0,.42,0,wg);B(1.24,.06,1.84,0xe23a3a,0,.57,0,wg);u.wheels=[];
    for(const sx of[-.64,.64])for(const sz of[-.6,.6]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.1,14),M(0x222222));w.rotation.z=Math.PI/2;w.position.set(sx,.24,sz);wg.add(w);const hub=B(.11,.08,.08,0xdddddd,sx*1.04,.24,sz,wg);u.wheels.push(w)}
    const hd=B(.06,.06,.8,0x555555,0,.32,-1.25,wg);hd.rotation.x=.5;B(.4,.06,.06,0x555555,0,.15,-1.6,wg);
    B(1.1,.8,1.7,0x5fb6e8,0,.98,0,wg,.35);B(1.12,.04,1.72,0xbfe6ff,0,1.32,0,wg,.6);
    const f=P(0,.95,0,wg);u.fish=f;S(.22,0x6e7f8c,0,0,-.15,1.1,.9,2.4,f);S(.17,0xdfe4e8,0,-.09,-.15,1,.6,2.1,f);for(let i=0;i<7;i++)S(.035,0x2a2f33,(i%2?.15:-.15)+(i%3-1)*.03,.1,-.5+i*.12,1,1,1,f);
    B(.03,.18,.25,0x5a6a78,0,.24,-.25,f);S(.18,0x6e7f8c,0,0,-.66,1.2,.8,1,f);for(const s of[-1,1]){S(.035,0x111111,s*.17,.05,-.7,1,1,1,f);for(const yy of[0,-.09]){const wh=B(.02,.02,.45,0x3a3a3a,s*.2,-.04+yy,-.82,f);wh.rotation.y=s*.6;wh.rotation.x=yy?.35:0}}
    const tl=P(0,0,.42,f);u.tail=tl;B(.04,.12,.3,0x5a6a78,0,0,.1,tl);B(.03,.35,.2,0x5a6a78,0,.14,.28,tl).rotation.x=.5;B(.03,.35,.2,0x5a6a78,0,-.14,.28,tl).rotation.x=-.5}
  else {// ornate box turtle: domed dark shell with yellow lines radiating from each scute, yellow-flecked head and legs
    const body=P(0,.32,0);u.body=body;S(.62,0x3a2a14,0,.1,0,1,.62,1.15,body);S(.6,0xd8b84a,0,-.07,0,1,.18,1.08,body);
    for(let i=0;i<5;i++)for(const s of[-1,1]){if(i===0&&s>0)continue;const sx=i?s*.28:0,sz=-.42+i*.21;for(let r=0;r<6;r++){const a=r/6*Math.PI*2,l=B(.025,.02,.16,0xf2d24a,0,0,0,body);const nx=sx+Math.cos(a)*.08,nz=sz+Math.sin(a)*.08,ny=.1+.36*Math.sqrt(Math.max(0,1-(nx*nx)/.39-(nz*nz)/.51));l.position.set(nx,ny,nz);l.rotation.y=-a+Math.PI/2;l.rotation.z=nx*.9}}
    const hd=P(0,0,-.62,body);u.head=hd;S(.15,0x5a4a28,0,0,-.08,1,.9,1.3,hd);for(const sx of[-.08,.04,.1])S(.03,0xf2d24a,sx,.08,-.12,1,1,1,hd);for(const s of[-1,1])S(.035,0xc23a1a,s*.12,.04,-.18,1,1,1,hd);
    for(const sx of[-.42,.42])for(const sz of[-.42,.42]){const l=P(sx,-.08,sz,body);S(.12,0x5a4a28,0,-.06,0,1.1,.7,1.3,l);S(.03,0xf2d24a,0,0,-.08,1,1,1,l);u.legs.push(l)}
    const tl=B(.08,.06,.16,0x5a4a28,0,-.06,.66,body)}
  return g}
// animate a racer: legs in gait, wings flapping or buzzing, tails wagging, and special moves while paused or boosting
function pxAnim(q,now,run){const u=q.g.userData;if(!u)return;const t=now*.001,i=q.i,b=q.boost>0,p=q.pause>0;
  if(u.k==='lark'){const f=p?0:Math.sin(t*(b?38:26)+i)*.9;for(const [w,s] of u.wings)w.rotation.z=s*(p?-.05:f*.8);u.body.rotation.x=p?-.25:Math.sin(t*3+i)*.08;u.beak.rotation.x=p?.12+Math.abs(Math.sin(t*14))*.35:.12;u.head.rotation.x=p?-.45:0;u.tail.rotation.x=-.25+(p?Math.sin(t*6)*.25:0);u.legs.forEach((l,k)=>l.rotation.x=p?0:.6)}
  else if(u.k==='bee'){for(const [w,s] of u.wings)w.rotation.z=s*(Math.sin(t*90+i)*.6);u.abdomen.rotation.x=Math.sin(t*(p?9:4)+i)*(p?.25:.1);u.body.rotation.z=Math.sin(t*2+i)*.12;u.body.position.y=.75+(p?-.3+Math.sin(t*5)*.05:Math.sin(t*6+i)*.08);u.legs.forEach((l,k)=>l.rotation.x=.4+Math.sin(t*12+k)*.2)}
  else if(u.k==='deer'){const sp=p?0:b?16:11,ph=t*sp+i;u.legs.forEach(([l,lo,fr],k)=>{const off=(fr?0:Math.PI)+(k%2)*.4,sw=Math.sin(ph+off);l.rotation.x=p?0:sw*(b?.9:.6);lo.rotation.x=p?0:Math.max(0,-Math.cos(ph+off))*(b?1.1:.8)});
    u.body.position.y=1.3+(p?0:Math.abs(Math.sin(ph))*(b?.45:.15));u.body.rotation.x=p?0:Math.sin(ph)*(b?.18:.06);u.neck.rotation.x=p?-.35:.1;u.head.rotation.y=p?Math.sin(t*3)*.6:0;u.tail.rotation.x=p||b?-1.2+Math.sin(t*20)*.15:-.1}
  else if(u.k==='cat'){for(const w of u.wheels)w.rotation.x=0;u.wheels.forEach(w=>w.rotation.y=(q.s||0)*1.5);u.tail.rotation.y=Math.sin(t*(b?14:6)+i)*(b?.7:.4);u.fish.rotation.y=Math.sin(t*(b?14:6)+i+1.6)*.12;u.fish.position.y=.95+(b?Math.abs(Math.sin(t*7))*.25:0);u.wagon.rotation.z=p?0:Math.sin(t*9+i)*.03}
  else {const sp=p?0:b?9:5;u.legs.forEach((l,k)=>{l.rotation.x=Math.sin(t*sp+(k%3?0:Math.PI))*.5;l.rotation.y=Math.sin(t*sp+k)*.3});u.head.position.z=-.62-(q.note==='steady as ever'?.06:0)+Math.sin(t*1.5+i)*.05;u.head.rotation.y=Math.sin(t*.8+i)*.3;u.body.rotation.z=Math.sin(t*sp)*.04}}
function pxDirector(kind,x,z,ang){const g=new THREE.Group(),M=col=>new THREE.MeshLambertMaterial({color:col}),B=(w,h,d,col,px,py,pz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(col));m.position.set(px,py,pz);g.add(m)};
  const c=kind==='fox'?0xd2691e:0x8a8a8a;B(.5,.5,1,c,0,.55,0);B(.45,.4,.45,c,0,.95,-.55);B(.12,.12,.2,0x222222,0,.92,-.85);if(kind==='fox'){B(.25,.25,.8,c,0,.6,.8);B(.2,.2,.2,0xffffff,0,.6,1.2)}else{B(.47,.14,.47,0x222222,0,1,-.56);for(let i=0;i<4;i++)B(.22,.22,.18,i%2?0x222222:0xaaaaaa,0,.6,.55+i*.18)}
  B(.06,1.6,.06,0x5a4a3a,.45,1.3,-.2);const fc=document.createElement('canvas');fc.width=64;fc.height=48;const cx=fc.getContext('2d');if(kind==='fox'){cx.fillStyle='#2fa84f';cx.fillRect(0,0,64,48)}else for(let i=0;i<8;i++)for(let j=0;j<6;j++){cx.fillStyle=(i+j)%2?'#111':'#fff';cx.fillRect(i*8,j*8,8,8)}
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(.8,.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(fc),side:THREE.DoubleSide}));fl.position.set(.85,1.9,-.2);g.add(fl);g.userData.flag=fl;
  g.position.set(x,hAt(x,z),z);g.rotation.y=ang;scene.add(g);return g}
const PXSAY={start:['Fox: Racers, take your marks!','Fox: Remember, it is not a race, it is a Prix.','Fox: Nobody eats anybody today.'],
 mid:['Raccoon: I can see the whole field from this trash can.','Fox: The turtle has a culvert map. Unbelievable.','Raccoon: Somebody dropped a roller dog at mile two. Investigating.','Fox: Wind check! Pure Nebraska.','Raccoon: The catfish is asking for a hose.'],
 fin:['Raccoon: Checkered flag! I also took the snacks.','Raccoon: And that is the Little Bluestem Star City Prix!']};
function pxSetup(){if(!PX.course){PX.course=pxCourse();if(!PX.course)return false}return true}
function pxStart(){if(!PX.cl){fetch('data/city-limits.json').then(r=>r.json()).then(d=>{PX.cl=d;pxStart()}).catch(()=>showCard('The Prix is not ready','The city limits did not load. Try again in a moment.'));return}
  if(!pxSetup()){showCard('The Prix is not ready','The trail map is still loading. Try again in a moment.');return}pxEnd(true);closeSheet();hideCard();
  const C=PX.course,L=PX.len==='sprint'?Math.min(C.L,C.jL):C.L;PX.goal=L;PX.on=true;PX.done=false;PX.fin=[];PX.t0=performance.now();PX.last=PX.t0;
  const wind=PX.wx==='calm'?0:PX.wx==='gusty'?1.6:(windV?Math.min(1.4,windV.ms/8):.3);PX.wind=wind;
  PX.racers=PX.R.map((r,i)=>{const g=pxMesh(r.k,r.c);scene.add(g);return {r,i,g,s:-i*3,v:r.v*(0.9+Math.random()*.2),pause:0,boost:0,note:'',lb:{t:r.n,sub:'',x:0,y:0,z:0,k:3,pri:i===PX.pick?4000:2500,near:0,far:9000}}});
  {const P=[];for(let d=0;d<=L;d+=15){const [x,z]=pxAt(d);P.push(new THREE.Vector3(x,hAt(x,z)+1.6,z))}PX.line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(P),new THREE.LineBasicMaterial({color:0xffd36a,transparent:true,opacity:.95,depthTest:false}));PX.line.renderOrder=6;scene.add(PX.line)}
  const [sx,sz,sa]=pxAt(0),[fx,fz,fa]=pxAt(L);PX.dir=[pxDirector('fox',sx+6,sz,sa),pxDirector('raccoon',fx+6,fz,fa+Math.PI)];
  PX.flb=[{t:'START · Fox, race director',sub:'Jamaica North Trail at the south city limit',x:sx,y:hAt(sx,sz)+14,z:sz,k:3,pri:3000,near:0,far:20000},{t:'FINISH · Raccoon, race director',sub:PX.len==='sprint'?'Jamaica North, before the turn to MoPac':'MoPac Trail where it leaves the city limits',x:fx,y:hAt(fx,fz)+14,z:fz,k:3,pri:3000,near:0,far:20000}];
  PX.say=PXSAY.start[Math.random()*3|0];PX.sayT=PX.t0;flyTo(camTo(sx,sz,320,(sa/RD)+180,42),1500)}
function pxEnd(quiet){if(PX.line){scene.remove(PX.line);PX.line=null}for(const q of PX.racers)scene.remove(q.g);for(const d of PX.dir)scene.remove(d);PX.racers=[];PX.dir=[];PX.on=false;if(!quiet){hideCard();dirty=true}}
function stepPX(now){if(!PX.on)return;const dt=Math.min(.1,(now-PX.last)/1000);PX.last=now;const el=(now-PX.t0)/1000;const go=el>2.5,K=PX.goal/(PX.len==='sprint'?55:110);
  for(const q of PX.racers){if(go&&q.s<PX.goal){let v=q.v*K;
      if(q.pause>0){q.pause-=dt;v=0}else if(Math.random()<dt*.12){const k=q.r.k,rnd=Math.random();
        if(k==='lark'){q.pause=1.2+rnd;q.note='singing on a fence post'}else if(k==='bee'){q.pause=1+rnd*1.5;q.note='visiting goldenrod'}else if(k==='deer'){if(rnd<.5){q.pause=1.5;q.note='spooked, frozen'}else{q.boost=2;q.note='bounding!'}}
        else if(k==='cat'){if(rnd<.4){q.boost=2.5;q.note='creek crossing, swimming fast'}else{q.pause=.8;q.note='wagon needs water'}}else{if(rnd<.35){q.s+=PX.goal*.06;q.note='took a culvert shortcut!'}else q.note='steady as ever'}}
      if(q.boost>0){q.boost-=dt;v*=2.1}
      const wx=PX.wind*(q.r.k==='bee'?-.35:q.r.k==='lark'?.25:q.r.k==='turtle'?0:-.1);v*=1+wx*.3;q.s=Math.min(PX.goal,q.s+v*dt);if(q.s>=PX.goal&&!PX.fin.includes(q))PX.fin.push(q)}
    const [x,z,a]=pxAt(Math.max(0,q.s)),sc=Math.max(5,camera.position.distanceTo(controls.target)/22),lane=(q.i-2)*1.6*sc,y=hAt(x,z)+(q.r.k==='lark'||q.r.k==='bee'?3+Math.sin(now*.01+q.i):0);
    q.g.position.set(x+Math.cos(a)*lane,y,z-Math.sin(a)*lane);q.g.rotation.y=a+Math.PI;q.g.scale.setScalar(sc);pxAnim(q,now,go&&q.s<PX.goal);
    const place=PX.fin.indexOf(q);q.lb.t=(q.i===PX.pick?'★ ':'')+({lark:'🐦',bee:'🐝',deer:'🦌',cat:'🐟',turtle:'🐢'}[q.r.k]||'')+' '+q.r.n;q.lb.sub=place>=0?['1st','2nd','3rd','4th','5th'][place]+' place':(q.note&&q.pause>0||q.boost>0||/culvert/.test(q.note)?q.note:Math.round(100*Math.max(0,q.s)/PX.goal)+'%');q.lb.x=q.g.position.x;q.lb.y=y+2.5*sc;q.lb.z=q.g.position.z;lifeLabels.push(q.lb)}
  for(const l of PX.flb)lifeLabels.push(l);for(const d of PX.dir)if(d.userData.flag)d.userData.flag.rotation.y=Math.sin(now*.008)*.6;
  if(now-PX.sayT>6000){PX.sayT=now;PX.say=PXSAY.mid[Math.random()*PXSAY.mid.length|0]}
  const me=PX.racers[PX.pick];if(PX.follow&&me&&go){const t=controls.target,dx=me.g.position.x-t.x,dz=me.g.position.z-t.z;const k=Math.min(1,dt*2.5);t.x+=dx*k;t.z+=dz*k;camera.position.x+=dx*k;camera.position.z+=dz*k;t.y+=(me.g.position.y-t.y)*k;controls.update()}
  const order=PX.racers.slice().sort((a,b)=>b.s-a.s);
  if(PX.fin.length===PX.racers.length&&!PX.done){PX.done=true;PX.say=PXSAY.fin[Math.random()*2|0];pxResults()}
  else if(!PX.done&&now-(PX.cardT||0)>700){PX.cardT=now;showCard('The Little Bluestem Star City Prix',(el<2.5?'On your marks… ':'')+PX.say+'\n'+order.map((q,i)=>`${i+1}. ${q.i===PX.pick?'★ ':''}${q.r.n}`).join('\n'),-1,{label:'End the race',fn:()=>pxEnd()},[{label:PX.follow?'Stop following':'Follow my racer',fn:()=>{PX.follow=!PX.follow}}]);$('cp').style.whiteSpace='pre-line'}
  ambient=true;dirty=true}
function pxResults(){const P=PX.fin,me=PX.racers[PX.pick],pl=P.indexOf(me);showCard('Results: the Little Bluestem Star City Prix',PX.say+'\n'+P.map((q,i)=>`${['🥇','🥈','🥉','4.','5.'][i]} ${q.r.n}`).join('\n')+`\nYour pick, the ${me.r.n.toLowerCase()}, finished ${['first','second','third','fourth','fifth'][pl]}. Course: ${(PX.goal/1609).toFixed(1)} miles, Jamaica North Trail${PX.len==='sprint'?'':' to the MoPac Trail'}, inside the Lincoln city limits.`,-1,{label:'Race again',fn:()=>{pxEnd(true);pxOpen()}},[{label:'Done',fn:()=>pxEnd()}]);$('cp').style.whiteSpace='pre-line'}
function pxHTML(){const b=(k,v,l,sub)=>`<button class="btn go2${PX[k]===v?' on':''}" data-px="${k}:${v}" style="display:block;width:100%;text-align:left;margin:5px 0;padding:8px 11px;white-space:normal"><b>${l}</b>${sub?'<br><span style="opacity:.7;font-size:12px">'+sub+'</span>':''}</button>`;
  return '<p>Five Nebraska state animals race the trails. The fox starts them at the <b>south city limit on the Jamaica North Trail</b>; the course runs north on Jamaica, crosses to the <b>MoPac Trail</b>, and finishes where MoPac leaves the <b>Lincoln city limits</b>, where the raccoon waves the checkered flag. Every race is different: songs, goldenrod, spooked deer, creek crossings and culvert shortcuts.</p><b style="font-size:12px;opacity:.7">PICK YOUR RACER</b>'+
   PX.R.map((r,i)=>b('pick',i,r.n,r.tag)).join('')+'<b style="font-size:12px;opacity:.7">COURSE</b>'+b('len','full','Full Prix','Jamaica North to MoPac, city limit to city limit')+b('len','sprint','Jamaica sprint','just the Jamaica North leg')+
   '<b style="font-size:12px;opacity:.7">WEATHER</b>'+b('wx','real','Today\'s real wind','from the weather layer')+b('wx','calm','Calm','a rare Nebraska day')+b('wx','gusty','Gusty','hold onto your antennae')+'<button class="btn" data-px="go:1" style="display:block;width:100%;margin-top:10px;padding:11px;font-size:16px;background:#e8b84a;color:#111"><b>Start the race</b></button>'}
const PXS={title:'The Little Bluestem <i>Star City Prix</i>',tabs:['Race'],html:pxHTML,click:e=>{const b=e.target.closest('[data-px]');if(!b)return;const [k,v]=b.dataset.px.split(':');if(k==='go'){pxStart();return}PX[k]=k==='pick'?+v:v;openSheet(PXS,0)}};
function pxOpen(){openSheet(PXS,0)}
// ---- dog runs: Lincoln's five public dog runs, open sunrise to sunset, full of dogs with the zoomies
const DOGR={parks:null,dogs:[],COL:[0x1b1b1b,0xc68a3a,0xf2e6cc,0x7a4a2a,0xb0b0b0,0xe2b06a,0x3a2a1a,0xffffff],SAY:['ZOOMIES!!','BEST FRIEND!!','*play bow*','Sniff report: excellent','Ball? BALL!','You again! Hi! HI!','Chase me!','I am a rocket','Tail at full speed','Mud is a lifestyle','Who wants to wrestle','Treat check'],
 FIND:[[/Rickman/i,"Rickman's Run, Holmes Lake Park"],[/Peterson Park|Stransky/i,'Stransky Dog Run, Peterson Park'],[/Bowling Lake/i,'Bowling Lake Dog Run'],[/Roper/i,'Roper Park Dog Run'],[/Oak Lake/i,'Oak Lake Dog Run'],[/Mahoney Dog/i,'Mahoney Dog Run']]};
function dogFind(){const L=(H.plabels||[]).filter(q=>!/Peterson/.test(q[0]));const out=[];const sp=(H.dogparks||[]).find(q=>Math.hypot(q[0]+4310,q[1]+183)<40);if(sp)out.push({n:'Stransky Dog Run, Peterson Park',x:sp[0],z:-sp[1],r:32});for(const [re,nm] of DOGR.FIND){const l=L.find(q=>re.test(q[0]));if(l&&out.length<6&&!out.some(o=>Math.hypot(o.x-l[1],o.z+l[2])<300))out.push({n:nm,x:l[1],z:-l[2],r:/Rickman/.test(nm)?45:28})}return out}
function dogMesh(c,s){const g=new THREE.Group(),M=new THREE.MeshLambertMaterial({color:c}),B=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M);m.position.set(x,y,z);g.add(m);return m};
  B(.32,.3,.75,0,.45,0);const hd=B(.28,.28,.3,0,.65,-.45);B(.16,.13,.18,0,.6,-.66);const tail=B(.06,.06,.32,0,.62,.45);tail.rotation.x=-.7;const legs=[];for(const sx of[-.11,.11])for(const sz of[-.25,.25])legs.push(B(.08,.32,.08,sx,.16,sz));
  for(const sx of[-.1,.1]){const e=B(.07,.12,.05,sx,.82,-.42)}g.scale.setScalar(s);g.userData={tail,legs,hd};return g}
function stepDogRun(now){if(!DOGR.parks){if(!H.plabels)return;DOGR.parks=dogFind()}const t=controls.target,d=camera.position.distanceTo(t);const open=U.uNight.value<.5;
  for(const P of DOGR.parks){const near=Math.hypot(t.x-P.x,t.z-P.z)<1500&&d<2200;
    if(!near||!open){if(P.dogs)for(const q of P.dogs)q.g.visible=false;continue}
    if(!P.dogs){P.dogs=[];const n=mobile?4:7;for(let i=0;i<n;i++){const g=dogMesh(DOGR.COL[(i*3+P.x|0)%DOGR.COL.length],.8+Math.random()*.9);scene.add(g);P.dogs.push({g,a:Math.random()*6.28,r:P.r*(.3+Math.random()*.6),w:(Math.random()<.5?-1:1)*(.5+Math.random()*.8),st:'zoom',t:now+Math.random()*4000,x:P.x,z:P.z,lb:{t:'',sub:'',x:0,y:0,z:0,k:3,pri:950,near:0,far:900}})}}
    const sc=Math.max(1.6,d/60);
    P.dogs.forEach((q,i)=>{q.g.visible=true;if(now>q.t){const r=Math.random();q.st=r<.5?'zoom':r<.7?'chase':r<.85?'bow':'sniff';q.t=now+2500+Math.random()*4000;q.say=Math.random()<.45?DOGR.SAY[Math.random()*DOGR.SAY.length|0]:'';if(q.st==='zoom'&&!q.say&&Math.random()<.5)q.say='ZOOMIES!!';q.tg=P.dogs[(i+1+(Math.random()*(P.dogs.length-1)|0))%P.dogs.length]}
      let px=q.g.position.x,pz=q.g.position.z,nx,nz,run=0;
      if(q.st==='zoom'){q.a+=q.w*.0045*16;const f=Math.sin(q.a*2)*.35;nx=P.x+Math.cos(q.a)*q.r*(1+f);nz=P.z+Math.sin(q.a)*q.r*.8;run=1}
      else if(q.st==='chase'&&q.tg){const T=q.tg.g.position;nx=px+(T.x-px)*.06;nz=pz+(T.z-pz)*.06;run=.8}
      else if(q.st==='sniff'){nx=px+Math.sin(now*.001+i)*.05;nz=pz+Math.cos(now*.0013+i)*.05;run=.1}else{nx=px;nz=pz;run=0}
      if(!isFinite(nx)||(px===0&&pz===0)){nx=P.x+(Math.random()-.5)*P.r;nz=P.z+(Math.random()-.5)*P.r}
      const dx=nx-px,dz=nz-pz;if(dx*dx+dz*dz>1e-4)q.g.rotation.y=Math.atan2(-dx,-dz);const bounce=run*Math.abs(Math.sin(now*.025+i))*.25;
      q.g.position.set(nx,hAt(nx,nz)+bounce*sc,nz);q.g.scale.setScalar(sc*(.8+(i%3)*.25));const u=q.g.userData;u.tail.rotation.y=Math.sin(now*(.03+run*.03)+i)*.8;u.legs.forEach((l,k)=>l.rotation.x=Math.sin(now*.03+k*1.6)*run*.9);u.hd.position.y=q.st==='bow'?.45:q.st==='sniff'?.35:.65;
      if(q.say){q.lb.t=q.say;q.lb.x=nx;q.lb.y=hAt(nx,nz)+2.2*sc;q.lb.z=nz;lifeLabels.push(q.lb)}});
    lifeLabels.push({t:P.n,sub:'open sunrise to sunset · dogs with the zoomies',x:P.x,y:hAt(P.x,P.z)+16*sc/2,z:P.z,k:3,pri:1200,near:0,far:3000});ambient=true;dirty=true}}
// ---- mammoths, Nebraska's state fossil, roam the lot by Morrill Hall and pick goldenrod, the state flower, with their trunks
const MAM={list:null,gr:[]};
function mamMesh(){const g=new THREE.Group(),fur=new THREE.MeshLambertMaterial({color:0x6b4a2b}),dk=new THREE.MeshLambertMaterial({color:0x4a3220}),ivory=new THREE.MeshLambertMaterial({color:0xefe6cf});
  const B=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o};
  B(2.4,2.4,4,fur,0,3.2,0);B(2.2,1,3.6,dk,0,4.5,.1);const hd=B(1.8,2,1.6,fur,0,4.2,-2.4);B(1.6,.8,1.2,dk,0,5.3,-2.3);const legs=[];for(const sx of[-.75,.75])for(const sz of[-1.3,1.3])legs.push(B(.75,2.2,.75,dk,sx,1.1,sz));
  for(const s of[-1,1]){const t=new THREE.Mesh(new THREE.TorusGeometry(1.1,.14,6,12,Math.PI*1.1),ivory);t.position.set(s*.6,3.2,-3.1);t.rotation.set(0,Math.PI/2,Math.PI*.95);g.add(t)}
  const trunk=new THREE.Group();trunk.position.set(0,3.6,-3.2);g.add(trunk);let p=trunk;const seg=[];for(let i=0;i<5;i++){const s=new THREE.Group();s.position.y=i?-.55:0;const m=new THREE.Mesh(new THREE.BoxGeometry(.42-i*.05,.6,.42-i*.05),fur);m.position.y=-.3;s.add(m);p.add(s);seg.push(s);p=s}
  const fl=new THREE.Mesh(new THREE.ConeGeometry(.35,.9,6),new THREE.MeshLambertMaterial({color:0xf2c200}));fl.position.y=-.7;fl.visible=false;p.add(fl);
  B(.2,1.6,.2,fur,0,3.6,2.1).rotation.x=.4;g.userData={seg,legs,fl};return g}
function stepMam(now){const mh=(H.blabels||[]).find(b=>/^Morrill Hall$/.test(b[0]));if(!mh)return;const cx=mh[1]-85,cz=-mh[2]-100,t=controls.target,d=camera.position.distanceTo(t);
  if(Math.hypot(t.x-cx,t.z-cz)>1800||d>2600){if(MAM.list)for(const m of MAM.list)m.g.visible=false;for(const g of MAM.gr)g.visible=false;return}
  if(!MAM.list){MAM.list=[];for(let i=0;i<3;i++){const g=mamMesh();g.scale.setScalar(.9+i*.12);scene.add(g);MAM.list.push({g,x:cx+(i-1)*40,z:cz+(i%2)*6,st:'walk',t:now+i*2500,tx:cx,tz:cz,lb:{t:'Columbian mammoth',sub:'Nebraska\'s state fossil',x:0,y:0,z:0,k:3,pri:1300,near:0,far:2600}})}
    for(let k=0;k<10;k++){const x=cx-95+k*21,z=cz+(k%2?20:-22),gr=new THREE.Group();for(let s=0;s<5;s++){const c=new THREE.Mesh(new THREE.ConeGeometry(.35,1.2,5),new THREE.MeshLambertMaterial({color:0xf2c200}));c.position.set((s%3-1)*.5,.9,(s>2?.5:-.3));const st=new THREE.Mesh(new THREE.BoxGeometry(.07,.8,.07),new THREE.MeshLambertMaterial({color:0x4a7a2a}));st.position.copy(c.position);st.position.y=.3;gr.add(c,st)}gr.position.set(x,hAt(x,z),z);gr.userData={back:0};scene.add(gr);MAM.gr.push(gr)}}
  for(const gr of MAM.gr){gr.visible=now>gr.userData.back}
  const dtm=Math.min(.1,(now-(MAM.lt||now))/1000);MAM.lt=now;MAM.list.forEach((m,i)=>{m.g.visible=true;const u=m.g.userData;
    if(m.st==='walk'){if(!m.goal||now>m.t){const free=MAM.gr.filter(g=>g.visible);m.goal=free.length?free[Math.random()*free.length|0]:null;m.t=now+60000}
      if(m.goal){const gx=m.goal.position.x,gz=m.goal.position.z,dx=gx-m.x,dz=gz-m.z,dd=Math.hypot(dx,dz);if(dd<6.5){m.st='pick';m.t=now;}else{const sp=Math.min(dd,2.2*dtm*1.0);m.x+=dx/dd*sp;m.z+=dz/dd*sp;m.g.rotation.y=Math.atan2(-dx,-dz)}}
      u.legs.forEach((l,k)=>l.rotation.x=Math.sin(now*.004+k*1.6)*.35);u.seg.forEach((s,k)=>s.rotation.x=Math.sin(now*.002+k)*.12);u.fl.visible=false;m.lb.sub='Nebraska\'s state fossil, looking for goldenrod'}
    else{const e=(now-m.t)/1000;u.legs.forEach(l=>l.rotation.x=0);const dn=e<1.5?e/1.5:e<3?1:Math.max(0,1-(e-3)/1.5);u.seg.forEach((s,k)=>s.rotation.x=dn*(k?.28:-.35)+(e>3?-dn*.2:0));
      if(e>1.5&&m.goal&&m.goal.visible){m.goal.userData.back=now+45000;u.fl.visible=true}if(e>4.5){m.st='walk';m.goal=null;u.fl.visible=false}m.lb.sub='picking goldenrod, the state flower'}
    m.g.position.set(m.x,hAt(m.x,m.z),m.z);m.lb.x=m.x;m.lb.y=hAt(m.x,m.z)+9*m.g.scale.x;m.lb.z=m.z;if(i===0||d<900)lifeLabels.push(m.lb)});ambient=true;dirty=true}
// ---- farmers markets: Lincoln's in-city markets, from the markets' own listings and UNL Extension's Buy Fresh Buy Local guide (2026 season)
const FM={L:[
 {n:"Haymarket Farmers' Market",x:-5990,z:-4960,d:6,when:'Saturdays 8 a.m. to noon',wk:'Sat 8 to noon',s:[5,2],e:[10,10],where:'7th and P Streets in the Haymarket, rain or shine',tents:22},
 {n:"Sunday Farmers' Market at College View",x:-993,z:-285,rot:Math.PI/2,d:0,when:'Sundays 10 a.m. to 2 p.m.',wk:'Sun 10 to 2',s:[4,26],e:[10,25],where:'4801 Prescott Avenue, producers only, rain or shine',tents:12},
 {n:"Hub Farmers' Market",x:-4510,z:-4975,d:3,when:'Wednesdays 5 to 7 p.m.',wk:'Wed 5 to 7 p.m.',s:[5,6],e:[9,30],where:'Union Plaza and the Jayne Snyder Trails Center, on the Billy Wolff Trail',tents:9},
 {n:'East Campus Discovery Days and Farmers Market',x:-2110,z:-6860,d:-1,wk:'3 summer Saturdays',when:'three Saturdays, 10 a.m. to 1 p.m. (June 13, July 11, August 8 in 2026)',s:[6,13],e:[8,8],where:'East Campus Mall, UNL, with science activities for kids',tents:10,dates:['6-13','7-11','8-8']}],g:null,
 COL:[0xd7263d,0xf46036,0xffffff,0x1b998b,0xc5d86d,0x2e294e,0xe9c46a,0x3a86ff]};
function fmStatus(m){const n=new Date(),mo=n.getMonth()+1,dy=n.getDate(),v=mo*100+dy,a=m.s[0]*100+m.s[1],b=m.e[0]*100+m.e[1];
  if(m.dates){if(m.dates.includes(mo+'-'+dy))return 'open today';return v>b||v<a?'season over, back next summer':'next date: '+m.dates.find(t=>{const[p,q]=t.split('-').map(Number);return p*100+q>=v})}
  if(v<a||v>b)return 'off season, back in '+['','January','February','March','April','May','June','July','August','September','October','November','December'][m.s[0]];return n.getDay()===m.d?'open today':'in season'}
function fmInit(){const G=new THREE.Group();scene.add(G);FM.g=G;const pole=new THREE.MeshLambertMaterial({color:0xdddddd}),crate=new THREE.MeshLambertMaterial({color:0x9a6a3a}),veg=[0xe63946,0x2a9d8f,0xf4a261,0x8ac926,0x6a4c93].map(c=>new THREE.MeshLambertMaterial({color:c}));
  for(const m of FM.L){const mg=new THREE.Group();mg.position.set(m.x,hAt(m.x,m.z),m.z);mg.rotation.y=m.rot||0;G.add(mg);m.g=mg;const rows=Math.ceil(m.tents/2);
    for(let k=0;k<m.tents;k++){const r=k%rows,side=k<rows?-1:1,t=new THREE.Group();t.position.set((r-rows/2)*3.6,0,side*5);mg.add(t);
      const c=FM.COL[(k*3+m.tents)%FM.COL.length],roof=new THREE.Mesh(new THREE.ConeGeometry(2.3,1.1,4),new THREE.MeshLambertMaterial({color:c}));roof.rotation.y=Math.PI/4;roof.position.y=3;t.add(roof);
      for(const px of[-1.4,1.4])for(const pz of[-1.4,1.4]){const p=new THREE.Mesh(new THREE.BoxGeometry(.08,2.5,.08),pole);p.position.set(px,1.25,pz);t.add(p)}
      const tb=new THREE.Mesh(new THREE.BoxGeometry(2.6,.12,1),crate);tb.position.set(0,.9,-side*.9);t.add(tb);for(let v=0;v<4;v++){const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.3,.5),veg[(k+v)%veg.length]);b.position.set(-.9+v*.6,1.1,-side*.9);t.add(b)}}
    m.shop=[];for(let p=0;p<Math.round(m.tents*1.4);p++){const s=new THREE.Group(),c=FM.COL[(p*5)%FM.COL.length],b=new THREE.Mesh(new THREE.BoxGeometry(.45,1.1,.3),new THREE.MeshLambertMaterial({color:c}));b.position.y=.95;s.add(b);const h=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3),new THREE.MeshLambertMaterial({color:[0xf1c27d,0x8d5524,0xe0ac69,0xc68642][p%4]}));h.position.y=1.68;s.add(h);
      const bag=new THREE.Mesh(new THREE.BoxGeometry(.25,.3,.15),new THREE.MeshLambertMaterial({color:0xd9c7a0}));bag.position.set(.3,.8,0);s.add(bag);mg.add(s);m.shop.push({s,u:Math.random()*rows*3.6-rows*1.8,v:(Math.random()-.5)*3,sp:(Math.random()<.5?-1:1)*(.5+Math.random()*.6),stop:0})}
    m.lb={t:'🥕 '+m.n.replace(' and Farmers Market','').replace("Sunday Farmers' Market at College View",'College View Sunday Market'),sub:'',x:m.x,y:0,z:m.z,k:3,pri:5200,near:0,far:4500}}}
function stepFM(now){const t=controls.target,d=camera.position.distanceTo(t);let near=false;for(const m of FM.L)if(Math.hypot(t.x-m.x,t.z-m.z)<3500&&d<5000)near=true;
  if(!near){if(FM.g)FM.g.visible=false;return}if(!FM.g)fmInit();FM.g.visible=true;const dt=Math.min(.1,(now-(FM.lt||now))/1000);FM.lt=now;
  const msc=Math.max(1,Math.min(3,d/220));for(const m of FM.L){m.g.scale.setScalar(msc);const st=fmStatus(m),busy=st==='open today'||st==='in season'||/^next/.test(st);const day=U.uNight.value<.5;
    m.shop.forEach((q,i)=>{q.s.visible=busy&&day&&i<(st==='open today'?99:Math.ceil(m.shop.length*.6));if(!q.s.visible)return;if(q.stop>0)q.stop-=dt;else{q.u+=q.sp*dt;if(Math.random()<dt*.15)q.stop=1+Math.random()*3;const lim=Math.ceil(m.tents/2)*1.8;if(q.u>lim||q.u<-lim)q.sp*=-1}
      q.s.position.set(q.u,Math.abs(Math.sin(now*.008+i))*(q.stop>0?0:.06),q.v);q.s.rotation.y=q.stop>0?(q.v>0?0:Math.PI):(q.sp>0?-Math.PI/2:Math.PI/2)});
    m.lb.sub=m.wk+' · '+st.replace('off season, back in ','back in ').replace('season over, back next summer','back next summer');m.lb.y=hAt(m.x,m.z)+Math.max(7,d/30);if(Math.hypot(t.x-m.x,t.z-m.z)<2800)lifeLabels.push(m.lb)}
  ambient=true;dirty=true}
function fmOpen(){showCard('Farmers markets in Lincoln',FM.L.map(m=>'🥕 '+m.n+'\n'+m.when+', '+m.where+'. Now: '+fmStatus(m)+'.').join('\n\n')+'\n\nThe Thursday market at Fallbrook is not running in 2026. Dates come from the markets and UNL Extension\'s Buy Fresh Buy Local guide; check with a market before you go.',undefined,undefined,FM.L.map(m=>({label:m.n.replace(/ Farmers.*| and Farmers.*|Sunday /g,'').replace("'s","")||m.n,fn:()=>{flyTo(camTo(m.x,m.z,140,30,32,0),2400)}})));$('cp').style.whiteSpace='pre-line'}
// ---- 1894 Rock Island wreck site: Wilderness Park, where the Rock Island crossed above today's Jamaica North Trail
const WRK={x:(-96.7125+96.64)*KXm,z:-(40.74389-40.77)*111000,g:null,
 T:'The 1894 Rock Island wreck',
 B:'On the night of August 9, 1894, a Rock Island train from Fairbury, a locomotive and two passenger cars, was minutes from Lincoln when it ran onto a wooden trestle about 40 feet above Salt Creek, here in what is now Wilderness Park. The rails had been pried apart. The train fell into the creek, the engine burst, and fire spread through the cars and the trestle. Eleven of the 33 passengers died.\n\nInvestigators found pulled spikes, wrench marks on a rail and a 40-pound crowbar in the grass, and ruled it sabotage. Police arrested George Washington Davis, a Black man survivors said they saw with a lantern near the trestle. The evidence was thin and no motive was found. His first trial ended without a verdict; a second jury in 1895 convicted him of second-degree murder. In 1905 Governor John Mickey paroled him, citing grave doubts. Who wrecked the train has never been settled.\n\nA historical marker was put up along the Jamaica North Trail in 2010, on the 116th anniversary. The steel bridge above the trail today was built by the Rock Island around 1899.'};
function wrkInit(){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c});const y=hAt(WRK.x,WRK.z);g.position.set(WRK.x,y,WRK.z);
  const post=new THREE.Mesh(new THREE.BoxGeometry(.15,1.6,.15),M(0x3a3a3a));post.position.y=.8;g.add(post);
  const cv=document.createElement('canvas');cv.width=256;cv.height=160;const c=cv.getContext('2d');c.fillStyle='#24452f';c.fillRect(0,0,256,160);c.strokeStyle='#d8c27a';c.lineWidth=6;c.strokeRect(6,6,244,148);c.fillStyle='#e8dca8';c.font='bold 22px Georgia';c.textAlign='center';c.fillText('ROCK ISLAND',128,52);c.fillText('WRECK',128,80);c.font='bold 30px Georgia';c.fillText('1894',128,122);
  const sign=new THREE.Mesh(new THREE.BoxGeometry(1.6,1,.08),[M(0x24452f),M(0x24452f),M(0x24452f),M(0x24452f),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cv)}),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cv)})]);sign.position.y=1.9;sign.rotation.x=-.25;g.add(sign);
  // a pale outline of the 1894 wooden trestle, about 400 feet long and 40 feet up, where the Rock Island line crossed
  const ghost=new THREE.MeshBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.28,depthWrite:false});const tr=new THREE.Group();tr.rotation.y=Math.PI/4;tr.position.set(0,0,-18);g.add(tr);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(122,.6,3.5),ghost);deck.position.y=12.2;tr.add(deck);for(let k=-60;k<=60;k+=6){const b=new THREE.Mesh(new THREE.BoxGeometry(.4,12,3),ghost);b.position.set(k,6,0);tr.add(b);const xb=new THREE.Mesh(new THREE.BoxGeometry(.25,8.5,.25),ghost);xb.position.set(k+3,6,0);xb.rotation.z=.6;tr.add(xb)}
  for(const o of [sign,post,deck]){o.userData.info=[WRK.T,WRK.B];pickables.push(o)}
  scene.add(g);WRK.g=g;WRK.lb={t:'🕯️ 1894 Rock Island wreck site',sub:'11 died · tap for the story',x:WRK.x,y:y+16,z:WRK.z,k:3,pri:2400,near:0,far:5000}}
function stepWrk(){const t=controls.target,d=camera.position.distanceTo(t);if(Math.hypot(t.x-WRK.x,t.z-WRK.z)>4000||d>6000){if(WRK.g)WRK.g.visible=false;return}if(!WRK.g)wrkInit();WRK.g.visible=true;WRK.lb.y=hAt(WRK.x,WRK.z)+Math.max(16,d/25);lifeLabels.push(WRK.lb)}
function wrkOpen(){flyTo(camTo(WRK.x,WRK.z,120,210,22,6),2400,()=>{showCard(WRK.T,WRK.B);$('cp').style.whiteSpace='pre-line';guideAt(WRK.T,WRK.B,WRK.x,WRK.z)})}
// ---- the fox and the raccoon, race directors by weekend, are the city's tour guides: they show up at places you open and at every tour stop
const GD={on:false,g:null,x:0,z:0,lines:[],k:0,next:0,lb:{t:'',sub:'',x:0,y:0,z:0,k:3,pri:5600,near:0,far:9000},lb2:null,idx:null,last:'',cardT:0,tourAt:''};
const GDQ=['Raccoon: I have checked every trash can here. Five stars.','Raccoon: Ask me about the snacks.','Raccoon: Stay with the group. I said stay with the group.','Raccoon: Fun fact: I was not invited. I came anyway.','Raccoon: The fox does the history. I do the vibes.','Raccoon: Gift shop is closed. I checked. Twice.','Raccoon: Watch your step, and your sandwich.','Raccoon: I give this place four paws.'];
const GDQS=[[/stadium|arena|devaney|field|ballpark|hawks/i,'Raccoon: I know exactly where the nachos land.'],[/capitol|sower|unicameral/i,'Raccoon: Nonpartisan, like me. I eat from every can.'],[/park|trail|lake|creek|wilderness/i,'Raccoon: This is my neighborhood. Wave to my cousins.'],[/wreck|1894|cemetery|ghost/i,'Raccoon: I will walk this one quietly.'],[/market|food|pie|restaurant|bakery|pub/i,'Raccoon: I would like to speak to the leftovers.'],[/school|university|college|campus|library/i,'Raccoon: I audited three classes. Nobody noticed.'],[/zoo|squirrel|dog|mammoth|bird/i,'Raccoon: My people. Well, my animals.']];
function gdIndex(){if(GD.idx)return GD.idx;const m=new Map();for(const b of (H.blabels||[]))m.set(b[0],[b[1],-b[2]]);for(const p of (H.plabels||[]))if(!m.has(p[0]))m.set(p[0],[p[1],-p[2]]);m.set(WRK.T,[WRK.x,WRK.z]);if(LM.capitol)m.set('Nebraska State Capitol',LM.capitol);if(LM.stadium)m.set('Memorial Stadium',LM.stadium);return GD.idx=m}
function gdSay(title,body){const s=String(body||'').replace(/\s+/g,' ').split(/(?<=[.!?])\s/)[0]||'';const short=s.length>84?s.slice(0,81).replace(/\s\S*$/,'')+'…':s;const q=(GDQS.find(r=>r[0].test(title+' '+body))||[0,GDQ[Math.random()*GDQ.length|0]])[1];
  return ['Fox: Welcome to '+title.replace(/^The /,'the ')+'!',short?'Fox: '+short:'Fox: Look around. Every block has a story.',q]}
function guideAt(title,body,x,z){if(!isFinite(x)||!isFinite(z))return;if(!GD.g){const g=new THREE.Group();g.add(pxDirector('fox',0,0,0),pxDirector('raccoon',0,0,0));g.children[1].position.set(2.2,0,0);g.children.forEach(c=>{scene.remove(c);c.position.y=0});scene.add(g);GD.g=g}
  GD.x=x;GD.z=z;GD.lines=gdSay(title,body);GD.k=0;GD.next=0;GD.on=true;GD.title=title;GD.t0=performance.now();GD.g.visible=true;ambient=true;dirty=true}
function guideOff(){GD.on=false;if(GD.g)GD.g.visible=false}
function stepGuide(now){
  // tours: at each stop, the guides go to the biggest named place near the view
  if(tour){const t=controls.target;if(!fly){let best=null,bd=1e9;const LMN=[['Nebraska State Capitol',LM.capitol],['Memorial Stadium',LM.stadium]].filter(q=>q[1]);for(const q of LMN){const dd=Math.hypot(q[1][0]-t.x,q[1][1]-t.z);if(dd<500&&dd<bd){bd=dd-400;best=[q[0],q[1][0],-q[1][1]]}}for(const b of (H.blabels||[])){const dd=Math.hypot(b[1]-t.x,-b[2]-t.z);if(dd<700&&dd<bd&&b[0].length<40){bd=dd;best=b}}
      const key=best?best[0]:'';if(key&&key!==GD.tourAt){GD.tourAt=key;const info=(typeof pickables!=='undefined'?pickables:[]).find(o=>o.userData&&o.userData.info&&o.userData.info[0]===key);guideAt(key,info?String(info.userData.info[1]):'',best[1],-best[2])}}}
  else if(GD.tourAt){GD.tourAt='';guideOff()}
  if(!GD.on||!GD.g)return;if(!tour&&$('card').style.display==='none'&&now-GD.t0>1500){guideOff();return}
  const cam=camera.position,d=cam.distanceTo(controls.target),sc=Math.max(2.5,Math.min(40,d/24));let ax=cam.x-GD.x,az=cam.z-GD.z;const L=Math.hypot(ax,az)||1;ax/=L;az/=L;
  const off=Math.min(60,10+sc*3),side=0,px=GD.x+ax*off-az*side,pz=GD.z+az*off+ax*side;GD.g.position.set(px,hAt(px,pz),pz);GD.g.rotation.y=Math.atan2(ax,az)+Math.PI;GD.g.scale.setScalar(sc);
  for(const c of GD.g.children){const f=c.userData.flag;if(f)f.rotation.y=Math.sin(now*.006)*.5}GD.g.children[0].position.y=Math.abs(Math.sin(now*.004))*.15;GD.g.children[1].position.y=Math.abs(Math.sin(now*.004+1.2))*.15;
  if(now>GD.next){GD.cur=GD.lines[GD.k%GD.lines.length];GD.k++;GD.next=now+(GD.k===1?2600:4800)}
  const who=/^Fox/.test(GD.cur)?'🦊':'🦝',txt=GD.cur.replace(/^(Fox|Raccoon): /,'');const lines=[];let cur='';for(const w of txt.split(' ')){if((cur+' '+w).length>30){lines.push(cur);cur=w}else cur=cur?cur+' '+w:w}lines.push(cur);
  GD.lb.t=who+' '+lines[0];{const r=lines.slice(1).join(' ');GD.lb.sub=r.length>56?r.slice(0,53).replace(/\s\S*$/,'')+'…':r}GD.lb.x=px;GD.lb.y=hAt(px,pz)+2.6*sc;GD.lb.z=pz;lifeLabels.push(GD.lb);ambient=true;dirty=true}
// every place card brings the guides; the card's title finds the place on the map
{const _sc=showCard;showCard=function(title,body,...r){_sc(title,body,...r);try{if(typeof GD==='undefined'||/Prix|Results:|Farmers markets in|Follow a raindrop|Where this rain|Language|Menu|Search/i.test(title))return;const p=gdIndex().get(title);if(p)guideAt(title,body,p[0],p[1])}catch(e){}}}
