
// =====================================================================================================
// City trees: every tree on the city's own list, drawn where it stands and sized by its trunk, and
// carrying its record the way a building carries its parcel: kind, species, trunk diameter, the park
// or street it stands on, and the city's tree ID. The list is the Parks and Recreation (Community
// Forestry) inventory. Only the trees near where you are looking are drawn, so a phone can keep up.
// =====================================================================================================
const TR={n:0,X:null,cs:null,M:[],L:[],N:[],key:'',con:null,sh:null,gone:0};
// five crown shapes, chosen by the kind of tree: 0 round, 1 conifer, 2 vase (elms, honeylocusts, hackberries: wide and open on top),
// 3 narrow and pointed (lindens, pears, pin oaks, sweetgums), 4 small flowering trees (crabapples, redbuds, lilacs: low and wide)
const TSHAPE=[[/elm|locust|hackberry|coffeetree|cottonwood|sycamore|planetree|walnut|catalpa|silver maple|bur oak|white oak|swamp white|zelkova|mulberry|willow|poplar|boxelder|ash/i,2],
 [/linden|pear|pin oak|sweetgum|ginkgo|tuliptree|tulip|hornbeam|aspen|columnar|sentry|scarlet oak|shingle oak/i,3],
 [/crab|apple|redbud|lilac|hawthorn|cherry|plum|serviceberry|dogwood|magnolia|amur maple|tatarian|goldenrain|buckeye|pagoda|filbert|sumac|smoke|witch/i,4]];
const TWF=[.8,.52,1.02,.5,1.05],THF=[1,1,1,1.05,.62];
function treeGeoms(){const out=[],mk=(fn)=>{const P=[],I=[],col=[],ring=(y,r,nn)=>{const b=P.length/3;for(let i=0;i<nn;i++){const a=i/nn*6.2832;P.push(Math.cos(a)*r,y,Math.sin(a)*r)}return b};
    const trunk=(h,r)=>{const a=ring(0,r,5),b=ring(h,r*.8,5);for(let i=0;i<5;i++){const j=(i+1)%5;I.push(a+i,b+i,a+j,a+j,b+i,b+j)}for(let i=0;i<10;i++)col.push(.1,.06,.035)};
    const crown=(R)=>{let prev=null,first=null;const leaf=y=>{const s=.75+.3*y;col.push(.09*s,.21*s,.05*s)};for(const [y,r] of R){const n=7,b=ring(y,r,n);if(first==null)first=b;for(let i=0;i<n;i++)leaf(y);if(prev!=null)for(let i=0;i<n;i++){const j=(i+1)%n;I.push(prev+i,b+i,prev+j,prev+j,b+i,b+j)}prev=b}
      const t=P.length/3,ty=R[R.length-1][0]+.08;P.push(0,ty,0);leaf(ty);for(let i=0;i<7;i++)I.push(prev+i,t,prev+(i+1)%7);const bt=P.length/3,by=R[0][0]-.04;P.push(0,by,0);leaf(by);for(let i=0;i<7;i++)I.push(first+(i+1)%7,bt,first+i)};
    fn(trunk,crown,ring,P,I,col);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(I);g.computeVertexNormals();return g};
  out[2]=mk((tr,cr)=>{tr(.42,.07);cr([[.36,.22],[.52,.5],[.74,.58],[.9,.44]])});
  out[3]=mk((tr,cr)=>{tr(.22,.06);cr([[.18,.3],[.42,.34],[.66,.24],[.86,.12]])});
  out[4]=mk((tr,cr)=>{tr(.28,.08);cr([[.24,.36],[.46,.52],[.68,.44],[.82,.22]])});
  return out}
const CONIFER=/^(pine|spruce|fir|juniper|cedar|arborvitae|hemlock|larch|baldcypress|bald cypress|douglas|yew|redwood|cypress|falsecypress)/i;
// how tall to draw a tree with a trunk this many inches across (10 when the list gives no size)
function treeH(i){const d=S2.tr_d[i]||10;return TR.con[TR.kk[i]]?Math.min(25,4+d*.6):Math.min(24,4.5+d*.5)*THF[TR.sh[TR.kk[i]]]}
function treeNear(x,z,r){const G=TR.G,C=TR.C,c0=Math.floor((x+(TR.H||8192))/C),r0=Math.floor((z+(TR.H||8192))/C),X=TR.X;let best=-1,bd=r*r;
  for(let a=Math.max(0,r0-1);a<=Math.min(G-1,r0+1);a++)for(let b=Math.max(0,c0-1);b<=Math.min(G-1,c0+1);b++){const k=a*G+b;for(let i=TR.cs[k];i<TR.cs[k+1];i++){const dx=X[2*i]-x,dz=X[2*i+1]-z,d=dx*dx+dz*dz;if(d<bd){bd=d;best=i}}}return best}
function treesInit(){if(!S2||!S2.tr_c||!H2.trees||!LM.treeMesh)return;const T=H2.trees,n=T.n,G=T.ng,C=T.cell,TH=T.half||8192,X=new Float32Array(n*2),cs=new Uint32Array(G*G+1),kk=new Uint8Array(n);
  // the list comes cell by cell, each tree stored as its place inside its 128 m cell: rebuild where every tree stands
  {let i=0;for(let k=0;k<G*G;k++){cs[k]=i;const x0=(k%G)*C-TH,z0=Math.floor(k/G)*C-TH;for(let j=S2.tr_c[k];j>0;j--,i++){X[2*i]=x0+S2.tr_x[i]*.5;X[2*i+1]=z0+S2.tr_z[i]*.5;kk[i]=T.names[S2.tr_n[i]][2]}}cs[G*G]=i}
  TR.n=n;TR.X=X;TR.cs=cs;TR.kk=kk;TR.con=T.kinds.map(k=>CONIFER.test(k));TR.sh=T.kinds.map((k,j)=>TR.con[j]?1:((TSHAPE.find(q=>q[0].test(k))||[0,0])[1]));TR.C=C;TR.G=G;TR.H=TH;
  // the map's stand-in trees step aside wherever the city has a real record
  {const m=LM.treeMesh,zero=new THREE.Matrix4().makeScale(0,0,0),pts=LM.treePts||[];let gone=0;for(let i=0;i<pts.length;i++){if(treeNear(pts[i][0],pts[i][1],pts[i][2]?20:8)>=0){m.setMatrixAt(i,zero);gone++}}m.instanceMatrix.needsUpdate=true;TR.gone=gone}
  // two shapes: the map's round-crowned tree for broadleaf kinds, and stacked cones for conifers
  const P=[],I=[],col=[],ring=(y,r,nn)=>{const b=P.length/3;for(let i=0;i<nn;i++){const a=i/nn*6.2832;P.push(Math.cos(a)*r,y,Math.sin(a)*r)}return b};
  {const a=ring(0,.07,5),b=ring(.2,.06,5);for(let i=0;i<5;i++){const j=(i+1)%5;I.push(a+i,b+i,a+j,a+j,b+i,b+j)}for(let i=0;i<10;i++)col.push(.1,.06,.035)}
  for(const [y0,r0,y1] of [[.13,.36,.56],[.4,.27,.8],[.66,.18,1.04]]){const b=ring(y0,r0,7),top=P.length/3;P.push(0,y1,0);for(let i=0;i<7;i++){I.push(b+i,top,b+(i+1)%7);col.push(.035+.03*y0,.13+.07*y0,.06+.03*y0)}col.push(.07,.2,.09)}
  const gB=new THREE.BufferGeometry();gB.setAttribute('position',new THREE.Float32BufferAttribute(P,3));gB.setAttribute('color',new THREE.Float32BufferAttribute(col,3));gB.setIndex(I);
  const cap=mobile?9000:30000,mat=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}),G5=treeGeoms();G5[0]=LM.treeMesh.geometry;G5[1]=gB;TR.G5=G5;
  const share=[.45,.35,.4,.3,.3],cc=new THREE.Color(1,1,1);for(let k=0;k<5;k++){const c=Math.round(cap*share[k]),m=new THREE.InstancedMesh(G5[k],mat,c);m.setColorAt(0,cc);m.count=0;m.frustumCulled=false;m.castShadow=true;scene.add(m);TR.M[k]=m;TR.L[k]=new Uint32Array(c);TR.N[k]=0}
  fallApply();
  // the same list as a layer: every tree a bar as tall as its trunk is wide, colored by kind
  const cnt=new Map();for(let i=0;i<n;i++){const k=TR.kk[i];cnt.set(k,(cnt.get(k)||0)+1)}const top=[...cnt].filter(e=>T.kinds[e[0]]&&T.kinds[e[0]]!=='Not identified').sort((a,b)=>b[1]-a[1]).slice(0,11),gi=new Map(top.map((e,i)=>[e[0],i])),GR=top.map(e=>T.kinds[e[0]]).concat('Other kinds'),tg=new Uint8Array(n);
  for(let i=0;i<n;i++){const g=gi.get(TR.kk[i]);tg[i]=g===undefined?GR.length-1:g}S2.tr_g=tg;TR.top=top.map(e=>[T.kinds[e[0]],e[1]]);
  dlAdd({id:'trees',t:'City trees',g:'Places',k:'pt',n,src:'City of Lincoln Parks and Recreation, Community Forestry tree inventory',asof:T.asof,card:(L,i)=>treeCard(i),
    note:`Every tree on the city's own list that stands on this map: ${n.toLocaleString('en-US')} of the ${T.active.toLocaleString('en-US')} the city lists as living. Most are street trees and park trees. Each bar is as tall as the trunk is wide, and the color is the kind of tree. The most common: ${TR.top.slice(0,5).map(e=>e[0].toLowerCase()+' '+e[1].toLocaleString('en-US')).join(', ')}. Zoom in close and the trees themselves are drawn where they stand: tap one for its record.`,
    f:[{k:'grp',l:'Kind',t:'c',d:GR,s:'tr_g'},{k:'dbh',l:'Trunk diameter',t:'n',u:'in',s:'tr_d'}],st:{h:'dbh',hcap:40,c:'grp',pal:'auto',r:.42,bar:1}},{X})}
const lTC=new THREE.Color();
function treePut(m,slot,i){const x=TR.X[2*i],z=TR.X[2*i+1],h=treeH(i),w=h*TWF[TR.sh[TR.kk[i]]]*(.88+.24*rnd(i*7+3));lP.set(x,hAt(x,z),z);lQ.setFromAxisAngle(lUp,rnd(i)*6.28);lS.set(w,h,w);lM.compose(lP,lQ,lS);m.setMatrixAt(slot,lM);
  const g=rnd(TR.kk[i]*13+5),v=rnd(i*5+4);lTC.setRGB(.74+.4*g,.84+.22*v,.66+.34*g);fallTint(lTC,TR.fk?TR.fk[TR.kk[i]]:null,i);m.setColorAt(slot,lTC)}
// ---- a nod to fall. From late September into early December the leafy trees take a touch of the color their kind turns.
// It follows the calendar and the kind of tree. It is not a report on the real leaves.
const FALLK=[[/maple/i,.95,[[3.5,.56,.5],[3.2,.86,.46],[2.8,1.2,.5]]],[/oak/i,.7,[[2.4,.62,.55],[2,.76,.6]]],[/ash/i,.9,[[2.8,1.25,.5],[2.3,.6,.9]]],
 [/pear|sweetgum|dogwood|serviceberry|sumac|burning/i,.85,[[3.4,.55,.6],[2.6,.5,.85]]],[/apple|crab|hawthorn|cherry|plum/i,.8,[[3,.95,.5],[3.2,.7,.5]]],[/larch|baldcypress|bald cypress/i,.85,[[2.6,1,.5]]],
 [/locust|linden|elm|birch|ginkgo|hackberry|coffeetree|cottonwood|poplar|walnut|catalpa|redbud|mulberry|willow|sycamore|planetree|buckeye|hickory|tuliptree|aspen/i,.88,[[2.9,1.3,.5],[2.5,1.15,.55]]]];
const FALL0=[.8,[[2.6,1.15,.55],[3,.9,.5],[2.3,.72,.58]]];
function fallAmt(){if(TR.fallSet!=null)return TR.fallSet;const n=lincolnNow(),m=Math.floor(n.ymd/100)%100,doy=[0,31,59,90,120,151,181,212,243,273,304,334][m-1]+n.ymd%100;
  return doy<263?0:doy<288?(doy-263)/25:doy<=304?1:doy<=324?1-(doy-304)/20*.6:doy<=340?.4*(1-(doy-324)/16):0}
// late in the season the bright colors go to russet
function fallLate(){if(TR.fallSet!=null)return 0;const n=lincolnNow(),m=Math.floor(n.ymd/100)%100,doy=[0,31,59,90,120,151,181,212,243,273,304,334][m-1]+n.ymd%100;return doy>304?Math.min(1,(doy-304)/36)*.6:0}
function fallTint(c,k,i){const a=TR.fa;if(!a||!k)return;const r=rnd(i*11+7),lim=a*k[0];if(r>=lim)return;const col=k[1][Math.floor(rnd(i*17+3)*k[1].length)],V=TR.fallSet!=null,u=V?1:Math.min(1,Math.max(.4,(lim-r)/.3))*.82,L=TR.fl||0,R=2.2,G=.74,B=.6,f=V?2.5:1;
  c.r+=((col[0]+(R-col[0])*L)*f-c.r)*u;c.g+=((col[1]+(G-col[1])*L)*f-c.g)*u;c.b+=((col[2]+(B-col[2])*L)*f-c.b)*u}
function fallApply(){const T=H2&&H2.trees;TR.fa=fallAmt();TR.fl=fallLate();if(T&&!TR.fk)TR.fk=T.kinds.map(k=>{if(CONIFER.test(k)&&!/larch|baldcypress|bald cypress/i.test(k))return null;const f=FALLK.find(q=>q[0].test(k));return f?[f[1],f[2]]:FALL0});
  // the map's stand-in trees, which have no kind, take the muted tones
  const m=LM.treeMesh;if(m&&m.instanceColor){const A=m.instanceColor.array,n=Math.min(A.length/3,(LM.treePts||[]).length);for(let i=0;i<n;i++){const g=rnd(i*5+4);lTC.setRGB(.8+.35*g,.85+.25*rnd(i*9),.7+.3*g);fallTint(lTC,FALL0,i);A[3*i]=lTC.r;A[3*i+1]=lTC.g;A[3*i+2]=lTC.b}
    m.instanceColor.needsUpdate=true;if(LM.prideTrees&&LM.prideTrees.c0&&!prideOn)LM.prideTrees.c0.set(A)}
  TR.key='';dirty=true}
function setFall(v){TR.fallSet=v==null?null:Math.max(0,Math.min(1,v));fallApply();return TR.fa}
function treesFrame(){if(!TR.M[0])return;const t=controls.target,d=camera.position.distanceTo(t);
  if(!walk.on&&d>4300||walk.sky){if(TR.key!=='off'){TR.key='off';for(let k=0;k<5;k++){TR.M[k].count=0;TR.N[k]=0}shadowDirty=true;dirty=true}return}
  const R=walk.on?460:Math.min(2400,Math.max(280,d*1.15)),cx=walk.on?camera.position.x:t.x,cz=walk.on?camera.position.z:t.z,st=R*.24,key=Math.round(cx/st)+','+Math.round(cz/st)+','+Math.round(Math.log(R)*4);if(key===TR.key)return;TR.key=key;
  // nearest grid cells first, until the budget is spent
  const G=TR.G,C=TR.C,c0=Math.floor((cx+(TR.H||8192))/C),r0=Math.floor((cz+(TR.H||8192))/C),rc=Math.ceil(R/C),cells=[];
  for(let r=Math.max(0,r0-rc);r<=Math.min(G-1,r0+rc);r++)for(let c=Math.max(0,c0-rc);c<=Math.min(G-1,c0+rc);c++){const dx=(c+.5)*C-(TR.H||8192)-cx,dz=(r+.5)*C-(TR.H||8192)-cz,dd=dx*dx+dz*dz;if(dd<(R+C)*(R+C))cells.push([dd,r*G+c])}
  cells.sort((a,b)=>a[0]-b[0]);const N=[0,0,0,0,0],kk=TR.kk,sh=TR.sh;let full=0;
  for(const q of cells){for(let i=TR.cs[q[1]];i<TR.cs[q[1]+1];i++){const k=sh[kk[i]],L=TR.L[k];if(N[k]<L.length){treePut(TR.M[k],N[k],i);L[N[k]++]=i;if(N[k]===L.length)full++}}if(full>=5)break}
  for(let k=0;k<5;k++){const m=TR.M[k];TR.N[k]=N[k];m.count=N[k];m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true}shadowDirty=true;dirty=true}
// a tap on a tree: the nearest crown the tap passes through, if nothing solid is in front of it
function treePick(maxT){if(!TR.M[0]||!TR.N.reduce((a,b)=>a+b,0))return false;const o=ray.ray.origin,d=ray.ray.direction,X=TR.X;let best=-1,bt=maxT;
  const test=i=>{const x=X[2*i],z=X[2*i+1],hh=treeH(i),rx=x-o.x,ry=hAt(x,z)+hh*.6-o.y,rz=z-o.z,t=rx*d.x+ry*d.y+rz*d.z;if(t<=0||t>=bt)return;const px=rx-d.x*t,py=ry-d.y*t,pz=rz-d.z*t,rr=Math.max(hh*.4,t*(mobile?.011:.006));if(px*px+py*py+pz*pz<rr*rr){bt=t;best=i}};
  for(let s=0;s<5;s++)for(let k=0;k<TR.N[s];k++)test(TR.L[s][k]);if(best<0)return false;treeCard(best);return true}
const TSITE={'Street':'a street tree, in the strip along the street that the city looks after','Park':'a park tree','Private':'listed by the city as standing on private ground','Golf Course':'on a city golf course','Boundary':'on the edge of city ground','Median':'in a street median','Other - Public':'on other public ground','Trail':'along a trail'};
const treeId=i=>{const v=S2.tr_i0[i]|S2.tr_i1[i]<<8|S2.tr_i2[i]<<16;return v?'T'+String(v).padStart(6,'0'):''};
function treeCard(i){const T=H2.trees,nm=T.names[S2.tr_n[i]]||['',''],kind=T.kinds[TR.kk[i]]||'',d=S2.tr_d[i],s=S2.tr_s[i],site=T.sites[s&15],dist=T.dist[(s>>4)&7],park=T.parks[S2.tr_p[i]],id=treeId(i),x=TR.X[2*i],z=TR.X[2*i+1],p=[];
  const title=nm[0]||(kind&&kind!=='Not identified'?kind:'City tree');if(nm[1])p.push(nm[1]);if(kind&&kind!=='Not identified'&&kind.toLowerCase()!==title.toLowerCase())p.push('kind: '+kind.toLowerCase());
  p.push(d?`trunk ${d} in across at chest height, about ${Math.round(d*Math.PI)} in around`:'no trunk size on the list');if(s&128)p.push('more than one trunk');
  if(TSITE[site])p.push(TSITE[site]+(park&&site!=='Street'?', in '+park:''));else if(park)p.push('in '+park);
  const st=streetNear(x,z,70);if(st&&st.name)p.push('nearest street: '+st.name);if(dist)p.push('Community Forestry district '+dist);if(id)p.push('city tree ID '+id);
  const links=[{href:`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${(H.lat0-z/KYm).toFixed(6)},${(H.lon0+x/KXm).toFixed(6)}`,label:'Street View ↗'}];if(id)links.unshift({label:'Read the city\'s record now',fn:b=>treeLive(i,b)});
  let body=p.join(' · ');body=body.charAt(0).toUpperCase()+body.slice(1);
  showCard(title,body+`. One of ${T.n.toLocaleString('en-US')} trees on the city's own list that stand on this map, as of ${T.asof}. It is drawn at the size its trunk suggests, not measured for height.${TR.fa>0&&TR.fk&&TR.fk[TR.kk[i]]?' Any fall color on it follows the calendar and its kind, not a look at its leaves.':''}`,undefined,{label:'All city trees as a layer',fn:()=>dlSet('trees',true)},links)}
// the rest of the city's record for one tree, read from the city's server only when asked for
async function treeLive(i,btn){const id=treeId(i);if(!hosted()){btn.textContent='Loads on the website copy';return}btn.textContent='Asking the city…';btn.disabled=true;
  try{const r=await fetch(CITYSRV+'/Parks/Trees/MapServer/0/query?where='+encodeURIComponent("TreeID='"+id+"'")+'&outFields=TreeID,CommonName,LifeCycle,DBH,SiteLocation,Address,ParkUnit,ProgramType,EditedDate&returnGeometry=false&f=json'),j=await r.json(),a=j.features&&j.features[0]&&j.features[0].attributes;
    if(!a){btn.textContent='Not on the city\'s list now';return}const q=[];if(a.Address&&String(a.Address).trim())q.push('listed at '+nice(String(a.Address).trim()).replace(/\b[a-z]/g,m=>m.toUpperCase()));if(a.LifeCycle)q.push('status '+String(a.LifeCycle).toLowerCase());if(a.DBH)q.push('trunk '+a.DBH+' in');if(a.ProgramType&&a.ProgramType!=='N/A')q.push('planting program: '+a.ProgramType);if(a.EditedDate)q.push('record last changed '+dayStr(a.EditedDate));
    btn.style.display='none';$('cp').textContent+=' The city\'s record, read just now: '+q.join(' · ')+'.'}catch(e){btn.disabled=false;btn.textContent='Could not reach the city. Try again'}}

// ---- Fall color view: pick a point in the season and the leafy trees take the color their kind turns. Drawn from the calendar and the
// kind of tree, not a report on the real leaves.
const FALLV=[['Early fall','early October',.45],['Peak color','mid to late October',1],['Late fall','early November',.55]];
function fallView(i){if(i==null){setFall(null);showCard('Trees back to today','The trees show the season as it is today.',-1);return}
  const v=FALLV[i];setFall(v[2]);if(i===1&&TR.fl!==undefined)TR.fl=0;try{const x=(-96.6795-H.lon0)*KXm,z=-(40.7862-H.lat0)*KYm;flyTo(camTo(x,z,900,35,30),2200)}catch(e){}
  showCard('Fall color: '+v[0],'Lincoln around '+v[1]+'. Maples go red and orange, ashes and honeylocusts and lindens go yellow, oaks turn russet and hold their leaves late, and the pines and spruces stay green. Each tree on the city\'s list takes the color its kind turns. A picture of the season, not a report on today\'s leaves.',-1,
   {label:i<2?'Next: '+FALLV[i+1][0]:'Back to today',fn:()=>fallView(i<2?i+1:null)},[{label:'Early',fn:()=>fallView(0)},{label:'Peak',fn:()=>fallView(1)},{label:'Today',fn:()=>fallView(null)}])}
