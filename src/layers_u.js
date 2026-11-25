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
function uniHTML(tab){if(tab===0)return '<p><b>The Unicameral.</b> Nebraska is the only state with a one-house, officially nonpartisan legislature: 49 senators, one per district, meeting in the Capitol behind this statue.</p><p><b>Next session:</b> the 110th Legislature convenes January 6, 2027. Odd-year sessions run 90 working days, into June; even-year sessions run 60.</p><p><b>Lincoln is split among nine legislative districts:</b> 2, 21, 25, 26, 27, 28, 29, 30 and 46. Some reach well outside the city. <button class="btn go2" data-uni="map">Show them on the map</button></p><p>Tap any building and choose <b>Who represents this spot</b> to see its district.</p>';
  if(tab===1)return '<p><b>Testify at a hearing.</b> Every bill gets a public hearing in committee. You can testify in person in the Capitol, or submit written comments online before the hearing; the Legislature\'s site explains the deadlines and rules.</p><p><b>Follow a bill.</b> Bills move from committee to General File, Select File and Final Reading. Most big fights happen on General File. A filibuster is ended by a cloture motion, which needs 33 of the 49 votes, so 17 senators can stop a bill.</p><p><b>Watch it.</b> Floor debate and many hearings stream live on Nebraska Public Media.</p>';
  return ''}
const UNIS={title:'The <i>Unicameral</i>',tabs:['The Legislature','Take part'],html:uniHTML,click:e=>{const b=e.target.closest('[data-uni]');if(!b)return;closeSheet();uniMap()}};
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
  ['The short tour','About 40 seconds: the Capitol, Memorial Stadium, the arena and the Devaney Center.',()=>startTour()],
  ['Fly through Lincoln','About two minutes over every place in the bottom row, from downtown to Holmes Lake to the zoo, with a line about each.',()=>flyThrough()],
  'See it at night','The view from the Capitol tower','Champion trees','Fall color','Watch Lincoln grow, 1867 to today','Follow a raindrop','The sky tonight over Lincoln','Lake monsters and Sasquatch']},
 {k:'Data and graphs',intro:'Each one colors the map, opens charts and tables, and explains where the numbers come from.',it:[
  'The numbers for where you are looking','Everything about one spot','Potholes','Lead water service lines','Public safety, handled with care','Crashes, 2024 to mid 2026',
  'Your dollar: rent, sales tax, who decides','Value over time','Compare areas side by side','Cut any data by area','How Lincoln has voted','Follow the money in Lincoln politics','The Unicameral','Who represents you']},
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
// ---- every so often the Memorial Stadium crowd breaks into "Meat pie power!"
const MPP={ri:-1,rt:0,REC:['BROWN! THE! BEEF!','Onions in!','Shred the cabbage!','Salt! And! Pepper!','Make the dough!','Roll it out!','Fill it up!','Pinch it shut!','350! For 20!','Golden brown!','In da deed, da meat pie!','MEAT PIE POWER!'],SEC:['west stands','east stands','student section','north end zone','south end zone','the band'],next:0,until:0,t:'',sub:'',SAY:['MEAT PIE POWER!','In da deed, da meat pie!','IN DA DEED! DA MEAT PIE!','Meat! Pie! Power!','MEAT PIE POWER! MEAT PIE POWER!','M-E-A-T… PIE POWER!'],SUB:['the student section','the whole east stands','90,000 people, one chant','the north end zone','even the press box']};
function stepMPP(now){const S=LM.stadium;if(!S)return;const d=camera.position.distanceTo(controls.target);if(Math.hypot(controls.target.x-S[0],controls.target.z-S[1])>3000||d>5000)return;
  if(!MPP.next)MPP.next=now+4000+Math.random()*8000;
  if(now>MPP.next&&MPP.ri<0){if(Math.random()<.4){MPP.ri=0;MPP.rt=now}else{MPP.t=MPP.SAY[Math.random()*MPP.SAY.length|0];MPP.sub=MPP.SUB[Math.random()*MPP.SUB.length|0];MPP.until=now+4500}MPP.next=now+22000+Math.random()*30000}
  if(MPP.ri>=0){const i=Math.floor((now-MPP.rt)/2600);if(i>=MPP.REC.length){MPP.ri=-1;MPP.next=now+22000+Math.random()*30000}else{MPP.t=MPP.REC[i];MPP.sub=(i<MPP.REC.length-2?'meat pie, step '+(i+1)+' of '+(MPP.REC.length-2)+' · ':'')+MPP.SEC[i%MPP.SEC.length];MPP.until=now+300}}
  if(now<MPP.until){const b=(now/260|0)%2;lifeLabels.push({t:MPP.t,sub:MPP.sub,x:S[0],y:95+b*4,z:S[1],k:3,pri:1100,near:0,far:6000})}}
