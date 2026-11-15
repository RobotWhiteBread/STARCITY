
// ---- layers read live from the city, county and state servers (always current, nothing stored in the page)
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MAPBOX='geometry=-96.745%2C40.69%2C-96.535%2C40.85&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects';
const CITYSRV='https://gis.lincoln.ne.gov/public/rest/services',hosted=()=>/^https?:/.test(location.protocol);
const dayStr=ms=>ms?new Date(ms).toLocaleDateString('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric',year:'numeric'}):'';
const nice=s=>String(s||'').replace(/_/g,' ').toLowerCase().replace(/^./,c=>c.toUpperCase());
function dlIndex(L){const k=L.def.k;if(k==='ln'){L.lo=new Uint32Array(L.N.length);let o=0;for(let i=0;i<L.N.length;i++){L.lo[i]=o;o+=2*L.N[i]}}
  if(k==='pg'){const n=L.RC.length;L.ro=new Uint32Array(n);L.xo=new Uint32Array(n);let r=0,x=0;for(let i=0;i<n;i++){L.ro[i]=r;L.xo[i]=x;for(let q=0;q<L.RC[i];q++)x+=2*L.RN[r++]}}}
function dlFromGeo(L,feats){const k=L.def.k,lv=L.def.live,X=[],N=[],RC=[],RN=[],recs=[];const pr=c=>[(c[0]-H.lon0)*KXm,-(c[1]-H.lat0)*KYm],inb=p=>Math.abs(p[0])<=8150&&Math.abs(p[1])<=8150,cl=p=>[Math.max(-8150,Math.min(8150,p[0])),Math.max(-8150,Math.min(8150,p[1]))];
  for(const f of feats){const g=f.geometry,a=f.properties||{};if(!g)continue;if(lv.keep&&!lv.keep(a))continue;
    if(k==='pt'){const c=g.type==='Point'?g.coordinates:g.type==='MultiPoint'?g.coordinates[0]:null;if(!c)continue;const p=pr(c);if(!inb(p))continue;X.push(p[0],p[1]);recs.push(a)}
    else if(k==='ln'){const ls=g.type==='LineString'?[g.coordinates]:g.type==='MultiLineString'?g.coordinates:[];for(const l of ls){const pts=l.map(pr).filter(inb);if(pts.length<2)continue;N.push(pts.length);for(const p of pts)X.push(p[0],p[1]);recs.push(a)}}
    else{const ps=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];for(const poly of ps){if(!poly[0]||!poly[0].map(pr).some(inb))continue;const rr=[];let bad=false;
        poly.forEach((r,ri)=>{let q=r.map(pr).map(cl);if(q.length>1&&q[0][0]===q[q.length-1][0]&&q[0][1]===q[q.length-1][1])q.pop();q=q.filter((p,i)=>!i||p[0]!==q[i-1][0]||p[1]!==q[i-1][1]);if(q.length>=3)rr.push(q.slice(0,60000));else if(!ri)bad=true});
        if(bad||!rr.length)continue;RC.push(Math.min(255,rr.length));for(const q of rr.slice(0,255)){RN.push(q.length);for(const p of q)X.push(p[0],p[1])}recs.push(a)}}}
  L.X=new Float32Array(X);L.n=recs.length;if(k==='ln')L.N=new Uint16Array(N);if(k==='pg'){L.RC=new Uint8Array(RC);L.RN=new Uint16Array(RN)}dlIndex(L);L.grid=null;
  L.fields=lv.fields.map(([key,label,t,u,fn])=>{const v=recs.map(a=>{let x=a[key];if(fn)x=fn(x,a);return t==='n'?(+x||0):(x===null||x===undefined?'':String(x).trim())});return {k:key,l:label,t:t==='n'?'n':'s',u,v}})}
async function dlLive(L,quiet){if(L.loading)return;const lv=L.def.live;L.loading=true;if(!quiet)showCard(L.def.t,'Reading this layer live from '+lv.from+'…');
  try{if(!hosted())throw new Error('offline');let feats;
    if(lv.load)feats=await lv.load();
    else{const url=lv.url+'/query?where='+encodeURIComponent(lv.where||'1=1')+(lv.box===false?'':'&'+MAPBOX)+'&outFields='+encodeURIComponent(lv.fields.map(f=>f[0]).filter((v,i,a)=>a.indexOf(v)===i).join(','))+'&returnGeometry=true&outSR=4326&geometryPrecision=6'+(lv.off?'&maxAllowableOffset='+lv.off:'')+'&resultRecordCount='+(lv.max||2000)+'&f=geojson';
      const r=await fetch(url);if(!r.ok)throw new Error('http');const j=await r.json();if(j.error)throw new Error('server');feats=j.features||[]}
    dlFromGeo(L,feats);L.loaded=true;L.loading=false;L.def.asof='live';L.def.n=L.n;L.readAt=Date.now();
    if(!L.n){if(!quiet)showCard(L.def.t,(lv.empty||'Nothing is listed in this layer right now.')+' Read live from '+lv.from+' just now.');return}dlSet(L.id,true,quiet);if(sheet===LAYS)openSheet(LAYS)}
  catch(e){L.loading=false;if(!quiet)showCard(L.def.t,'This layer is read live from '+lv.from+' and could not be reached just now. Live layers load on the website copy of the map (the GitHub Pages link), not inside the Claude app.')}}
const LIVEL=[
 {id:'closures',t:'Road closures now',g:'Getting around',k:'ln',st:{h:70,c:'subtype',pal:'auto',a:.8},note:'Streets closed or restricted right now, as the city and county list them.',src:'City of Lincoln and Lancaster County road closures feed',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/CityCounty/RoadClosuresPublic/MapServer/1',box:false,empty:'No road closures are listed right now.',keep:a=>{const n=Date.now();return (!a.starttime||a.starttime<=n+864e5)&&(!a.endtime||a.endtime>=n)},
   fields:[['street','Street','s'],['subtype','Reason','s','',nice],['locdescription','Where','s'],['description','Details','s'],['direction','Direction','s','',nice],['starttime','Started','s','',dayStr],['endtime','Expected to end','s','',v=>v&&v<19e11?dayStr(v):'not set']]}},
 {id:'snow',t:'Snow plowing by district',g:'Getting around',k:'pg',st:{h:16,c:'PlowStatus',pal:'auto',a:.5},note:'How far along the plows are in each residential snow district. It only changes during a snow event.',src:'City of Lincoln street maintenance snow status',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/LTUStreetMaintenance/SnowStatus/MapServer/2',box:false,off:.0001,fields:[['DistNumber','Snow district','s'],['PlowStatus','Status','s'],['ResPerComplete','Residential streets done','n','%'],['ResSegTot','Street segments','n']]}},
 {id:'sweep',t:'Street sweepers, last 5 days',g:'Getting around',k:'ln',st:{h:30,col:0x7bdff2,a:.7},note:'Where the city\'s street sweepers have driven in the last five days, from their own tracking.',src:'City of Lincoln street maintenance sweeper tracks',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/LTUStreetMaintenance/SweeperTracks/MapServer/0',off:.00003,max:4000,empty:'No sweeper runs are logged for the last five days. Sweeping pauses for winter.',fields:[['Label','Sweeper','s'],['StartTime','Run started','s','',dayStr],['Distance','Distance','n']]}},
 {id:'bikeshare',t:'BikeLNK bikes available now',g:'Getting around',k:'pt',st:{h:'bikes',hcap:14,hmax:230,c:'bikes',ramp:'green',r:1.2},note:'Every BikeLNK station, as tall as the number of bikes parked there this minute.',src:'BikeLNK bike share (BCycle) public feed',
  live:{from:'the BikeLNK bike share feed',empty:'The bike share feed lists no stations right now.',load:async()=>{const [a,b]=await Promise.all(['station_information','station_status'].map(n=>fetch('https://gbfs.bcycle.com/bcycle_bikelnk/'+n+'.json').then(r=>r.json())));const st=new Map(b.data.stations.map(s=>[s.station_id,s]));
     return a.data.stations.map(s=>{const q=st.get(s.station_id)||{},ty=q.num_bikes_available_types||{};return {geometry:{type:'Point',coordinates:[s.lon,s.lat]},properties:{name:s.name,bikes:(q.num_bikes_available||0)+.001,ebikes:ty.electric||0,docks:q.num_docks_available||0,addr:s.address||''}}})},
   fields:[['name','Station','s'],['bikes','Bikes here now','n','',v=>Math.round(v)],['ebikes','Electric','n'],['docks','Open docks','n'],['addr','Address','s']]}},
 {id:'flood100',t:'Floodplain, 1% yearly chance',g:'Environment',k:'pg',st:{h:14,col:0x2f7bff,a:.5},note:'FEMA\'s mapped floodplain: land with at least a 1 in 100 chance of flooding in any year.',src:'FEMA flood maps as kept by Lincoln Transportation and Utilities, Watershed Management',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/LTUWatershed/FEMAFlood/MapServer/1',off:.00006,max:2000,fields:[['FLD_ZONE','FEMA zone','s'],['FLOODWAY','Floodway','s'],['FLD_Z_DESC','What it means','s']]}},
 {id:'flood500',t:'Floodplain, 0.2% yearly chance',g:'Environment',k:'pg',st:{h:10,col:0x7fb2ff,a:.42},note:'The wider area with at least a 1 in 500 chance of flooding in any year.',src:'FEMA flood maps as kept by Lincoln Transportation and Utilities, Watershed Management',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/LTUWatershed/FEMAFlood/MapServer/0',off:.00006,max:2000,fields:[['FLD_ZONE','FEMA zone','s'],['FLD_Z_DESC','What it means','s']]}},
 {id:'saline',t:'Saline wetlands',g:'Environment',k:'pg',st:{h:14,c:'CATEGORY',pal:'auto',a:.5},note:'Eastern Nebraska\'s salt marshes, one of the rarest wetland types in the country, found almost only around Lincoln.',src:'Lincoln and Lancaster County Planning Department natural resources layers',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/Planning/DevRevWetlands/MapServer/1',off:.00004,fields:[['CATEGORY','Category','s'],['CLASSIFY','Class','s']]}},
 {id:'beetle',t:'Salt Creek tiger beetle habitat',g:'Environment',k:'pg',st:{h:18,col:0xff7b54,a:.5},note:'Federally designated critical habitat for the Salt Creek tiger beetle, an endangered insect that lives nowhere else on Earth.',src:'Lincoln and Lancaster County Planning Department natural resources layers',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/Planning/NREndangered/MapServer/0',off:.00004,fields:[['Acres','Size','n','acres']]}},
 {id:'prairie',t:'Native grasslands',g:'Environment',k:'pg',st:{h:12,col:0x9bc53d,a:.5},note:'Remaining native prairie and grassland mapped by the planning department.',src:'Lincoln and Lancaster County Planning Department natural resources layers',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/Planning/NRVegetation/MapServer/0',off:.00004,fields:[['ECOLOGICAL','Type','s'],['LAND_USE','Land use','s'],['ACRES','Size','n','acres']]}},
 {id:'wellhead',t:'Wellhead protection areas',g:'Environment',k:'pg',st:{h:12,col:0x4cc9f0,a:.4},note:'Land above the groundwater that feeds public water wells, where what goes on the ground matters most.',src:'Lincoln and Lancaster County Planning Department natural resources layers',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/Planning/NRHydrology/MapServer/0',off:.00008,fields:[['SYSTEM_NAM','Water system','s'],['NRD_NAME','Natural resources district','s']]}},
 {id:'schooldist',t:'School districts',g:'People',k:'pg',st:{h:14,c:'DistrictName',pal:'auto',a:.36,label:'DistrictName'},note:'Public school district boundaries, with enrollment.',src:'Nebraska Office of the CIO statewide school districts layer',
  live:{from:'the State of Nebraska GIS server',url:'https://giscat.ne.gov/enterprise/rest/services/School_Districts/MapServer/0',off:.0002,fields:[['DistrictName','District','s','',v=>String(v||'').replace(/\b([A-Z])([A-Z]+)\b/g,(m,a,b)=>a+b.toLowerCase())],['StudentPopulation','Students','n'],['AreaSqmile','Area','n','sq mi']]}}];
// ---- hexagon layers: one grid, many measures
const HEXL=[
 ['hx_vpa','Property value per acre','Property and taxes','vpa',5000,'$','value',.55,360,null,'Assessed value of everything in each hexagon, per acre of parcel land. Downtown blocks tower over big-box lots: this is what an acre of city is worth on the tax rolls.'],
 ['hx_med','Typical home value','Property and taxes','med',1000,'$','value',1,330,[100000,200000,300000,400000,500000,750000,1000000],'Median assessed value of the homes in each hexagon, where there are three or more.'],
 ['hx_tpa','Property tax per acre (estimate)','Property and taxes','tpa',100,'$','heat',.55,360,null,'Estimated yearly property tax raised per acre. Each parcel\'s assessed value times the 2025 levy of its own tax district, before credits and exemptions. The few parcels with no district on file are left out.'],
 ['hx_psf','Home value per square foot','Property and taxes','psf',1,'$','value',1,300,null,'Median assessed value per square foot of living space for the homes in each hexagon.'],
 ['hx_yr','When homes were built','Property and taxes','yr',1,'','age',1,300,[1920,1950,1970,1990,2010],'Median year built of the homes in each hexagon. Taller means older.'],
 ['hx_pop','Population density (estimate)','People','pop',.1,'people per acre','cool',.6,420,null,'An estimate of where people live: 2020 Census block counts spread over the homes in each block by floor space, then added up per hexagon. Each drifting light stands for about a dozen residents.'],
 ['hx_cr','Crash density, 2019','Getting around','cr',1,'crashes','heat',.7,340,null,'Crash reports per hexagon in 2019, the year the city\'s public crash layer holds.'],
 ['hx_biz','Business clusters','Places','biz',1,'businesses','civic',.7,300,null,'How many businesses OpenStreetMap volunteers have mapped in each hexagon.']];
function hexCard(L,i){const g=k=>S2['hx_'+k][i],ac=H2.hex.acres,p=[],n=g('n'),nh=g('nh'),tot=g('tot')*1e5,vpa=g('vpa')*5000,med=g('med')*1000,tpa=g('tpa')*100,psf=g('psf'),yr=g('yr'),pop=g('pop')/10,cr=g('cr'),bz=g('biz');
  if(n)p.push(`${n} parcel${n===1?'':'s'}${nh?`, ${nh} of them homes`:''}`);if(tot)p.push('about '+fmtN(tot,'$')+' of assessed value in all');if(vpa)p.push(fmtN(vpa,'$')+' per acre');if(med)p.push('typical home '+fmtN(med,'$'));if(psf)p.push('$'+psf+' per sq ft of living space');if(yr)p.push('typical home built '+yr);
  if(tpa)p.push('estimated property tax '+fmtN(tpa,'$')+' per acre');if(pop>=.05)p.push('about '+Math.max(1,Math.round(pop*ac)).toLocaleString('en-US')+' residents, '+(Math.round(pop*10)/10)+' per acre');if(cr)p.push(cr+' crash report'+(cr===1?'':'s')+' in 2019');if(bz)p.push(bz+' mapped business'+(bz===1?'':'es'));
  showCard(L.def.t,`This hexagon covers about ${ac.toFixed(1)} acres: `+p.join(' · ')+'. '+L.def.note+' Source: '+L.def.src+'.')}
// ---- color every building by a property stratum
let paintOrig=null,paintMode=null;
const PAINT={value:{t:'Color buildings by assessed value',note:'Every building takes the color of its parcel\'s assessed value band.',br:[100000,200000,300000,400000,500000,1000000,2000000,5000000,10000000],ramp:'value',get:b=>S2.b_sv[b]||S2.b_val[b],u:'$'},
  cls:{t:'Color buildings by property class',note:'Homes, businesses, farms and land without buildings, as the county assessor classes each parcel.',cats:[['Residential',0xf2c14e],['Commercial',0xe4572e],['Agricultural',0x7fb069],['No class on record',0x9aa5b1]],get:b=>{const c=H2.cls[S2.b_cls[b]]||'';return c.startsWith('Res')?0:c.startsWith('Com')?1:c.startsWith('Ag')?2:3}},
  decade:{t:'Color buildings by year built',note:'Homes colored by the year the county assessor says they were built. Buildings without a recorded year keep their own color.',br:[1920,1950,1970,1990,2010],ramp:'age',get:b=>S.b_yr?S.b_yr[b]:0,u:''}};
function paintLegend(P){if(P.cats)return P.cats.map((c,i)=>({l:c[0],c:c3(c[1]),t:i}));const n=P.br.length+1,o=[];for(let t=0;t<n;t++)o.push({l:t===0?'under '+shortN(P.br[0],P.u):t===n-1?shortN(P.br[t-1],P.u)+' and up':shortN(P.br[t-1],P.u)+' to '+shortN(P.br[t],P.u),c:rampAt(P.ramp,t/(n-1)),t});return o}
function paintBuildings(mode){const meshes=pickables.filter(m=>m.userData&&m.userData.ids&&m.geometry&&m.geometry.attributes.color);
  if(!paintOrig){paintOrig=new Map();for(const m of meshes){const col=m.geometry.attributes.color;paintOrig.set(m,col.array.slice());
      const idx=m.geometry.index.array,st=m.userData.start,vs=new Uint32Array(st.length+1);for(let k=0;k<st.length;k++){const e=k+1<st.length?st[k+1]:idx.length;let mn=4294967295;for(let q=st[k];q<e;q++)if(idx[q]<mn)mn=idx[q];vs[k]=mn}vs[st.length]=col.count;m.userData.vs=vs}}
  const P=mode&&mode!=='ids'?PAINT[mode]:null,leg=P?paintLegend(P).map(q=>[LUT[Math.round(q.c[0]*255)],LUT[Math.round(q.c[1]*255)],LUT[Math.round(q.c[2]*255)]]):null;
  for(const m of meshes){const col=m.geometry.attributes.color,a=col.array,o=paintOrig.get(m);a.set(o);
    if(P){const ids=m.userData.ids,vs=m.userData.vs;for(let k=0;k<ids.length;k++){const v=P.get(ids[k]);let t;if(P.cats)t=v;else{if(!(v>0))continue;t=0;while(t<P.br.length&&v>=P.br[t])t++}const c=leg[t];
        for(let q=vs[k];q<vs[k+1];q++){const f=.5+.9*(o[3*q]*.3+o[3*q+1]*.5+o[3*q+2]*.2)/255;a[3*q]=Math.min(255,c[0]*f);a[3*q+1]=Math.min(255,c[1]*f);a[3*q+2]=Math.min(255,c[2]*f)}}}
    if(mode==='ids'){const ids=m.userData.ids,vs=m.userData.vs;for(let k=0;k<ids.length;k++){const hh=Math.imul(ids[k]+1,2654435761)>>>0,r=70+(hh&127),g=70+((hh>>>9)&127),bl=70+((hh>>>18)&127);for(let q=vs[k];q<vs[k+1];q++){a[3*q]=r;a[3*q+1]=g;a[3*q+2]=bl}}}
    col.needsUpdate=true}
  paintMode=mode;dirty=true}
// ---- start: register every layer
function dlInit(){dlWire();const src='Lancaster County Assessor, U.S. Census Bureau and City of Lincoln GIS, added up by this map';
  for(const [id,t,g,m,sc,u,ramp,gm,hmax,tiers,note] of HEXL){const raw=S2['hx_'+m],arr=new Float32Array(raw.length);for(let i=0;i<raw.length;i++)arr[i]=raw[i]*sc;
    const st={h:'v',c:'v',ramp,g:gm,tiers};if(m==='yr')st.hf=v=>v>0?Math.max(4,2030-v):0,st.hcap=130;if(m==='pop')st.haze=1;
    dlAdd({id,t,g,k:'hx',n:raw.length,src,asof:H2.man[1][3],note,f:[{k:'v',l:t,t:'n',u,arr}],st,card:hexCard},{val:raw})}
  for(const d of H2.layers){if(d.id==='pv'){d.card=pvCard;d.st.hcap=1e6;d.st.hover=6;d.st.g=1;d.st.r=1.4;d.st.tiers=[100000,200000,300000,400000,500000,1000000,2000000,5000000,10000000];d.note='One round bar on every parcel, colored by value band: steps of $100,000 up to $500,000, then $1 million, $2 million, $5 million and $10 million and beyond. Tap a band in the key to single it out, or a bar for the property behind it. Owner names are not stored.'}if(d.id==='sales')d.st.tiers=[150000,250000,350000,500000,750000,1000000,2000000];if(d.id==='cams')d.card=camCard;dlAdd(d)}
  for(const d of LIVEL){d.n=0;d.f=[];d.asof='live';dlAdd(d,{})}
  for(const k in PAINT){const P=PAINT[k];const L=dlAdd({id:'paint_'+k,t:P.t,g:'Property and taxes',k:'fn',n:0,note:P.note,src:'Lancaster County Assessor',st:{},onSet:(on,L)=>{if(on){for(const q in PAINT)if(q!==k&&DL.get('paint_'+q).on)dlSet('paint_'+q,false,true);paintBuildings(k)}else if(paintMode===k)paintBuildings(null)}},{});L.obj=new THREE.Object3D();L.mats=[];L.legend=paintLegend(P)}
  $('bLay').onclick=()=>{if(sheet===LAYS)closeSheet();else openSheet(LAYS)}}
function pvCard(L,i){const x=L.X[2*i],z=L.X[2*i+1],v=fget(L,L.fields[0])(i);let best=-1,bd=70*70;for(let b=0;b<LM.bc.length/2;b++){const dx=LM.bc[2*b]-x,dz=LM.bc[2*b+1]-z,d=dx*dx+dz*dz;if(d<bd&&Math.abs(S2.b_val[b]-v)<1){bd=d;best=b}}
  if(best>=0){showB(best);return}showCard('Parcel without a mapped building','Assessed at '+fmtN(v,'$')+' · '+fget(L,L.fields[1])(i)+'. '+L.def.note+' Source: '+L.def.src+'.')}
