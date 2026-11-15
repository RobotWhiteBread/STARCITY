// ---- where things are in the sky over Lincoln: low-precision formulas (after Paul Schlyter), good to a fraction of a degree
const SKL={lat:40.8136,lon:-96.7026},RD=Math.PI/180,rev=x=>((x%360)+360)%360;
function skyDay(ms){return ms/86400000+2440587.5-2451543.5}
function skySun(d){const w=282.9404+4.70935e-5*d,e=.016709-1.151e-9*d,M=rev(356.047+.9856002585*d),E=M+e/RD*Math.sin(M*RD)*(1+e*Math.cos(M*RD)),xv=Math.cos(E*RD)-e,yv=Math.sqrt(1-e*e)*Math.sin(E*RD),v=Math.atan2(yv,xv)/RD,r=Math.hypot(xv,yv),lon=rev(v+w);
  return {lon,r,M,w,x:r*Math.cos(lon*RD),y:r*Math.sin(lon*RD)}}
function skyEq(x,y,z,d){const ecl=(23.4393-3.563e-7*d)*RD,ye=y*Math.cos(ecl)-z*Math.sin(ecl),ze=y*Math.sin(ecl)+z*Math.cos(ecl);return {ra:rev(Math.atan2(ye,x)/RD),dec:Math.atan2(ze,Math.hypot(x,ye))/RD,r:Math.hypot(x,ye,ze)}}
const SKEL={Mercury:[48.3313,3.24587e-5,7.0047,5e-8,29.1241,1.01444e-5,.387098,.205635,5.59e-10,168.6562,4.0923344368],Venus:[76.6799,2.4659e-5,3.3946,2.75e-8,54.891,1.38374e-5,.72333,.006773,-1.302e-9,48.0052,1.6021302244],
  Mars:[49.5574,2.11081e-5,1.8497,-1.78e-8,286.5016,2.92961e-5,1.523688,.093405,2.516e-9,18.6021,.5240207766],Jupiter:[100.4542,2.76854e-5,1.303,-1.557e-7,273.8777,1.64505e-5,5.20256,.048498,4.469e-9,19.895,.0830853001],
  Saturn:[113.6634,2.3898e-5,2.4886,-1.081e-7,339.3939,2.97661e-5,9.55475,.055546,-9.499e-9,316.967,.0334442282],Moon:[125.1228,-.0529538083,5.1454,0,318.0634,.1643573223,60.2666,.0549,0,115.3654,13.0649929509]};
function skyOrb(n,d){const q=SKEL[n],N=rev(q[0]+q[1]*d),i=q[2]+q[3]*d,w=rev(q[4]+q[5]*d),a=q[6],e=q[7]+q[8]*d,M=rev(q[9]+q[10]*d);let E=M+e/RD*Math.sin(M*RD)*(1+e*Math.cos(M*RD));
  for(let k=0;k<6;k++)E=E-(E-e/RD*Math.sin(E*RD)-M)/(1-e*Math.cos(E*RD));const xv=a*(Math.cos(E*RD)-e),yv=a*Math.sqrt(1-e*e)*Math.sin(E*RD),v=Math.atan2(yv,xv)/RD,r=Math.hypot(xv,yv);return {N,i,w,M,v,r}}
function skyBody(n,d){const s=skySun(d);if(n==='Sun')return Object.assign(skyEq(s.x,s.y,0,d),{name:n});const o=skyOrb(n,d);let lon=rev(o.v+o.w),lat0=0,r=o.r;
  const xh=r*(Math.cos(o.N*RD)*Math.cos(lon*RD)-Math.sin(o.N*RD)*Math.sin(lon*RD)*Math.cos(o.i*RD)),yh=r*(Math.sin(o.N*RD)*Math.cos(lon*RD)+Math.cos(o.N*RD)*Math.sin(lon*RD)*Math.cos(o.i*RD)),zh=r*Math.sin(lon*RD)*Math.sin(o.i*RD);
  let el=rev(Math.atan2(yh,xh)/RD),eb=Math.atan2(zh,Math.hypot(xh,yh))/RD;
  if(n==='Moon'){const Ms=s.M,Mm=o.M,Ls=rev(s.M+s.w),Lm=rev(o.M+o.w+o.N),D=rev(Lm-Ls),F=rev(Lm-o.N),S=x=>Math.sin(x*RD);
    el+=-1.274*S(Mm-2*D)+.658*S(2*D)-.186*S(Ms)-.059*S(2*Mm-2*D)-.057*S(Mm-2*D+Ms)+.053*S(Mm+2*D)+.046*S(2*D-Ms)+.041*S(Mm-Ms)-.035*S(D)-.031*S(Mm+Ms)-.015*S(2*F-2*D)+.011*S(Mm-4*D);
    eb+=-.173*S(F-2*D)-.055*S(Mm-F-2*D)-.046*S(Mm+F-2*D)+.033*S(F+2*D)+.017*S(2*Mm+F);r+=-.58*Math.cos((Mm-2*D)*RD)-.46*Math.cos(2*D*RD);
    const x=r*Math.cos(el*RD)*Math.cos(eb*RD),y=r*Math.sin(el*RD)*Math.cos(eb*RD),z=r*Math.sin(eb*RD),q=skyEq(x,y,z,d),ph=rev(el-s.lon);return Object.assign(q,{name:n,rE:r,phase:(1-Math.cos(ph*RD))/2,waxing:ph<180})}
  if(n==='Jupiter'||n==='Saturn'){const Mj=skyOrb('Jupiter',d).M,Ms=skyOrb('Saturn',d).M,S=x=>Math.sin(x*RD),C=x=>Math.cos(x*RD);
    if(n==='Jupiter')el+=-.332*S(2*Mj-5*Ms-67.6)-.056*S(2*Mj-2*Ms+21)+.042*S(3*Mj-5*Ms+21)-.036*S(Mj-2*Ms)+.022*C(Mj-Ms)+.023*S(2*Mj-3*Ms+52)-.016*S(Mj-5*Ms-69);
    else{el+=.812*S(2*Mj-5*Ms-67.6)-.229*C(2*Mj-4*Ms-2)+.119*S(Mj-2*Ms-3)+.046*S(2*Mj-6*Ms-69)+.014*S(Mj-3*Ms+32);eb+=-.02*C(2*Mj-4*Ms-2)+.018*S(2*Mj-6*Ms-49)}}
  const x=r*Math.cos(el*RD)*Math.cos(eb*RD)+s.x,y=r*Math.sin(el*RD)*Math.cos(eb*RD)+s.y,z=r*Math.sin(eb*RD);return Object.assign(skyEq(x,y,z,d),{name:n})}
// right ascension and declination to compass direction and height above the horizon, for Lincoln at time ms
function skyAltAz(ra,dec,ms,par){const jd=ms/86400000+2440587.5,lst=rev(280.46061837+360.98564736629*(jd-2451545)+SKL.lon),ha=(lst-ra)*RD,la=SKL.lat*RD,de=dec*RD;
  let alt=Math.asin(Math.sin(de)*Math.sin(la)+Math.cos(de)*Math.cos(la)*Math.cos(ha));const az=rev(Math.atan2(Math.sin(ha),Math.cos(ha)*Math.sin(la)-Math.tan(de)*Math.cos(la))/RD+180);
  if(par)alt-=Math.asin(1/par)*Math.cos(alt);return {alt:alt/RD,az}}
// ---- the night sky over Lincoln: catalog stars turned to the moment, the Moon and planets by formula, satellites from their published orbits
const NSKY={on:false,off:0,grp:null,pts:[],at:0,satAt:0,bodies:[],sats:[],nUp:0,tle:null,tleAt:0,lib:null,busy:false,keep:null,R:40000,named:[]};
const compass=az=>['north','northeast','east','southeast','south','southwest','west','northwest'][Math.round(rev(az)/45)%8];
const skyMs=()=>Date.now()+NSKY.off*36e5;
const skyWhen=ms=>new Date(ms).toLocaleString('en-US',{timeZone:'America/Chicago',weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const SKCOL={Sun:0xfff2b0,Moon:0xf4f1e4,Mercury:0xd9d2c5,Venus:0xfff8e0,Mars:0xff8a5c,Jupiter:0xffe9c4,Saturn:0xf2dfa0};
function skyPoint(size,col,n){if(!NSKY.dot){const c=document.createElement('canvas');c.width=c.height=64;const q=c.getContext('2d');q.beginPath();q.arc(32,32,29,0,6.2832);q.fillStyle='#fff';q.fill();NSKY.dot=new THREE.CanvasTexture(c)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((n||1)*3),3));const p=new THREE.Points(g,new THREE.PointsMaterial({size,sizeAttenuation:false,color:col,map:NSKY.dot,alphaTest:.35,fog:false,depthWrite:false,transparent:true}));p.frustumCulled=false;return p}
function skyBuild(){if(NSKY.grp)return true;if(!S2||!S2.sky_ra||!H2||!H2.sky)return false;const n=S2.sky_ra.length,g=new THREE.Group(),cut=[.5,2,3.2],sz=mobile?[7,5,3.4,2.3]:[6,4.4,3,2],cnt=[0,0,0,0];NSKY.bk=new Uint8Array(n);NSKY.aa=new Float32Array(n*2);
  for(let i=0;i<n;i++){const m=S2.sky_mg[i]/10-2,b=m<cut[0]?0:m<cut[1]?1:m<cut[2]?2:3;NSKY.bk[i]=b;cnt[b]++}
  NSKY.pts=cnt.map((c,b)=>{const p=skyPoint(sz[b],b<2?0xffffff:0xdfe6ff,c);if(b===3)p.material.opacity=.78;g.add(p);return p});
  // the constellation lines, kept as pairs of sky positions
  const seg=[];for(const l of H2.sky.l)for(let i=2;i+1<l.length;i+=2)seg.push(l[i-2],l[i-1],l[i],l[i+1]);NSKY.seg=new Float32Array(seg);
  {const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(new Float32Array(seg.length/4*6),3));NSKY.lines=new THREE.LineSegments(ge,new THREE.LineBasicMaterial({color:0x6f8fd6,transparent:true,opacity:.5,fog:false,depthWrite:false}));NSKY.lines.frustumCulled=false;g.add(NSKY.lines)}
  NSKY.bp={};for(const k of Object.keys(SKCOL)){const p=skyPoint(k==='Moon'?(mobile?26:22):k==='Sun'?(mobile?30:26):(mobile?10:8.5),SKCOL[k]);NSKY.bp[k]=p;g.add(p)}
  NSKY.sp=skyPoint(mobile?6:5,0x8ff0ff,200);g.add(NSKY.sp);NSKY.grp=g;return true}
// where a sky position sits on the screen-wide dome around the camera
function skyPut(alt,az,P,i){const a=alt*RD,z=az*RD,c=Math.cos(a),q=camera.position,R=NSKY.R;P.setXYZ(i,q.x+Math.sin(z)*c*R,q.y+Math.sin(a)*R,q.z-Math.cos(z)*c*R)}
function skyUpdate(force){const now=performance.now();if(!force&&now-NSKY.at<5000)return;NSKY.at=now;skyDark();const ms=skyMs(),n=S2.sky_ra.length,k=[0,0,0,0],d=skyDay(ms),q=camera.position,R=NSKY.R;skyLabels.length=0;
  const lab=(t,sub,alt,az,kk,pri)=>{const a=alt*RD,z=az*RD,c=Math.cos(a);skyLabels.push({t,sub,x:q.x+Math.sin(z)*c*R,y:q.y+Math.sin(a)*R,z:q.z-Math.cos(z)*c*R,k:kk,pri,near:0,far:1e9,alt,az})};
  for(let i=0;i<n;i++){const h=skyAltAz(S2.sky_ra[i]/100,S2.sky_de[i]/100-90,ms);NSKY.aa[2*i]=h.alt;NSKY.aa[2*i+1]=h.az;if(h.alt<.7)continue;const b=NSKY.bk[i];skyPut(h.alt,h.az,NSKY.pts[b].geometry.attributes.position,k[b]++)}
  NSKY.pts.forEach((p,b)=>{p.geometry.setDrawRange(0,k[b]);p.geometry.attributes.position.needsUpdate=true});
  {const P=NSKY.lines.geometry.attributes.position,S=NSKY.seg;let m=0;for(let i=0;i<S.length;i+=4){const a=skyAltAz(S[i],S[i+1],ms),b=skyAltAz(S[i+2],S[i+3],ms);if(a.alt<.7||b.alt<.7)continue;skyPut(a.alt,a.az,P,m++);skyPut(b.alt,b.az,P,m++)}NSKY.lines.geometry.setDrawRange(0,m);P.needsUpdate=true}
  for(const [i,name] of H2.sky.n){const alt=NSKY.aa[2*i],az=NSKY.aa[2*i+1];if(alt>2.5)lab(name,'',alt+.9,az,9,330-S2.sky_mg[i])}
  for(const c of H2.sky.c){const h=skyAltAz(c[1],c[2],ms);if(h.alt>6)lab(c[0],'',h.alt,h.az,10,180)}
  NSKY.bodies=[];for(const name of Object.keys(SKCOL)){const b=skyBody(name,d),h=skyAltAz(b.ra,b.dec,ms,name==='Moon'?b.rE:0),p=NSKY.bp[name];NSKY.bodies.push({name,alt:h.alt,az:h.az,phase:b.phase,waxing:b.waxing});p.visible=h.alt>-.3;
    if(p.visible){skyPut(h.alt,h.az,p.geometry.attributes.position,0);p.geometry.attributes.position.needsUpdate=true;lab(name,name==='Moon'?Math.round(b.phase*100)+'% lit, '+(b.waxing?'waxing':'waning'):name==='Sun'?'':Math.round(h.alt)+'° up, '+compass(h.az),h.alt+(name==='Moon'||name==='Sun'?2.2:1.2),h.az,14,720)}}
  for(const [nm,az] of [['North',0],['East',90],['South',180],['West',270]])lab(nm,'',1.6,az,10,650);
  skySatPut(ms);dirty=true}
// bright satellites and the space stations: orbits published by CelesTrak, worked forward with the standard SGP4 method (satellite.js)
async function skySats(){if(!hosted()||NSKY.busy)return;NSKY.busy=true;
  try{if(!NSKY.lib)NSKY.lib=await import('https://cdn.jsdelivr.net/npm/satellite.js@5.0.0/+esm');
    if(!NSKY.tle){try{const c=JSON.parse(localStorage.getItem('sc_tle')||'null');if(c&&Date.now()-c.at<6*36e5){NSKY.tle=c.t;NSKY.tleAt=c.at}}catch(e){}}
    if(!NSKY.tle||Date.now()-NSKY.tleAt>6*36e5){const get=async g=>(await (await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP='+g+'&FORMAT=tle')).text()).split(/\r?\n/).map(s=>s.trimEnd()).filter(Boolean);
      const [v,s]=await Promise.all([get('visual'),get('stations')]),t=[];for(let i=0;i+2<s.length;i+=3)if(/^ISS \(ZARYA\)|^CSS \(TIANHE\)/.test(s[i]))t.push(s[i],s[i+1],s[i+2]);const have=new Set(t.filter((_,i)=>i%3===1).map(l=>l.slice(2,7)));
      for(let i=0;i+2<v.length;i+=3)if(!have.has(v[i+1].slice(2,7)))t.push(v[i],v[i+1],v[i+2]);NSKY.tle=t;NSKY.tleAt=Date.now();try{localStorage.setItem('sc_tle',JSON.stringify({at:NSKY.tleAt,t}))}catch(e){}}
    NSKY.rec=[];for(let i=0;i+2<NSKY.tle.length;i+=3){try{NSKY.rec.push([NSKY.tle[i].trim(),NSKY.lib.twoline2satrec(NSKY.tle[i+1],NSKY.tle[i+2])])}catch(e){}}
    NSKY.busy=false;if(NSKY.on){skyUpdate(true);if($('ch').textContent==='Night sky')skyCard()}}catch(e){NSKY.busy=false;NSKY.satFail=true}}
const satName=n=>/^ISS /.test(n)?'Space Station':/^CSS /.test(n)?'Tiangong station':n.replace(/ R\/B$/,' rocket body').replace(/\b([A-Z])([A-Z]+)\b/g,(m,a,b)=>b.length>2?a+b.toLowerCase():m);
function skySatPut(ms){NSKY.sats=[];NSKY.nUp=0;const P=NSKY.sp.geometry.attributes.position;let m=0;if(NSKY.rec&&NSKY.lib){const L=NSKY.lib,t=new Date(ms),g=L.gstime(t),obs={latitude:SKL.lat*RD,longitude:SKL.lon*RD,height:.36};
    for(const [name,rec] of NSKY.rec){try{const pv=L.propagate(rec,t);if(!pv.position)continue;const la=L.ecfToLookAngles(obs,L.eciToEcf(pv.position,g)),alt=la.elevation/RD,az=la.azimuth/RD;if(alt<1||m>=200)continue;skyPut(alt,az,P,m++);
        const s={name:satName(name),alt,az,km:la.rangeSat};NSKY.sats.push(s);const st=/station/i.test(s.name);if(st||alt>18){const a=alt*RD,z=az*RD,c=Math.cos(a),q=camera.position,R=NSKY.R;skyLabels.push({t:s.name,sub:Math.round(alt)+'° up, '+compass(az),x:q.x+Math.sin(z)*c*R,y:q.y+Math.sin(a+.012)*R,z:q.z-Math.cos(z)*c*R,k:15,pri:st?760:500,near:0,far:1e9,alt,az})}}catch(e){}}}
  NSKY.nUp=m;NSKY.sp.geometry.setDrawRange(0,m);P.needsUpdate=true}
function skyCard(){const ms=skyMs(),B=n=>NSKY.bodies.find(b=>b.name===n)||{alt:-90,az:0},sun=B('Sun'),moon=B('Moon'),up=NSKY.bodies.filter(b=>b.alt>1&&b.name!=='Sun'&&b.name!=='Moon').map(b=>`${b.name} ${Math.round(b.alt)}° up, ${compass(b.az)}`),st=NSKY.sats.filter(s=>/station/i.test(s.name));
  showCard('Night sky',`Over Lincoln, ${skyWhen(ms)}${NSKY.off?'':' (now)'}. `+(sun.alt>0?'The Sun is up at this hour, so these stars are washed out by daylight. ':sun.alt>-6?'Twilight: only the brightest stars and planets show. ':'')
    +`Moon ${Math.round((moon.phase||0)*100)}% lit, ${moon.waxing?'waxing':'waning'}, ${moon.alt>0?Math.round(moon.alt)+'° up, '+compass(moon.az):'below the horizon'}. `+(up.length?'Planets: '+up.join('; ')+'. ':'No bright planets are up. ')
    +(NSKY.rec?`${NSKY.nUp} bright satellites are above the horizon`+(st.length?', with the '+st.map(s=>s.name+' '+Math.round(s.alt)+'° up, '+compass(s.az)).join(' and the '):'')+'. ':hosted()?(NSKY.satFail?'The satellite list could not be reached just now. ':'Reading satellite orbits… '):'Satellites load on the website copy. ')
    +(mobile?'Drag to look, pinch to zoom, tap a star.':'Drag to look, scroll to zoom, click a star.'),
    undefined,{label:'\u2190 Back to the map',fn:()=>viewExit(false)},[{label:'−1 hour',fn:()=>skyShift(NSKY.off-1)},{label:'+1 hour',fn:()=>skyShift(NSKY.off+1)},{label:'Tonight, 10 PM',fn:skyTonight},{label:'Now',fn:()=>skyShift(0)},{label:'How this is worked out',fn:skyHow}])}
function skyHow(){showCard('How the sky is worked out','Stars: the 1,627 brightest in the Hipparcos catalog, placed for Lincoln at the minute shown by arithmetic. Nothing is fetched. The Moon and the planets: standard low-precision formulas, good to a fraction of a degree, so a planet sits in the right part of the right constellation but this is not an almanac. Satellites: orbits published by CelesTrak for about 150 of the brightest objects and the two space stations, read on the website copy and worked forward with the standard SGP4 method. A satellite above the horizon is only visible when it is in sunlight and your sky is dark, which is mostly soon after dusk and before dawn. Lights, clouds and the real horizon are not modeled.',undefined,{label:'Back to the sky',fn:skyCard})}
function skyShift(h){NSKY.off=h;skyUpdate(true);skyCard()}
function skyTonight(){const n=lincolnNow();let h=(22*3600-n.sec)/3600;if(h<-2)h+=24;skyShift(Math.round(h*4)/4)}
function skyDark(){scene.background.setHex(0x05080f);if(scene.fog)scene.fog.color.setHex(0x05080f);if(LM.bg0)LM.bg0.setHex(0x05080f)}
function setSky(on){if(on===NSKY.on)return;if(on&&codeOn)setCode(0);if(on&&!skyBuild()){showCard('Night sky','The star catalog did not load with this copy of the map.');return}NSKY.on=on;$('bSky').classList.toggle('on',on);document.body.classList.toggle('sky',on);$('wkX').textContent='\u2190 Back to the map';
  if(on){NSKY.keep={live:liveOn,h:curHour,walk:walk.on};if(!walk.on)setWalk(true);walk.sky=true;walk.pitch=.72;setHour(22.4);skyDark();scene.add(NSKY.grp);NSKY.off=0;skyUpdate(true);
    if((NSKY.bodies.find(b=>b.name==='Sun')||{alt:0}).alt>-6)skyTonight();else skyCard();skySats()}
  else{walk.sky=false;scene.remove(NSKY.grp);skyLabels.length=0;const k=NSKY.keep;NSKY.keep=null;if(k){if(!k.walk&&walk.on)setWalk(false);else if(walk.on){camera.fov=Math.min(camera.fov,72);camera.updateProjectionMatrix()}if(k.live)setLive(true);else setHour(k.h)}if(/^(Night sky|In the sky|How the sky)/.test($('ch').textContent))hideCard()}
  lastInput=performance.now();dirty=true}
function skyFrame(now){if(!NSKY.on)return;if(!walk.on){setSky(false);return}skyUpdate(false);if(NSKY.rec&&now-NSKY.satAt>2500){NSKY.satAt=now;NSKY.at=0}}
// a tap in the sky names the nearest thing drawn there
function skyTap(cx,cy){let best=null,bd=mobile?44:30;for(const l of skyLabels){if(l.k===10||l.k===1)continue;v3.set(l.x,l.y,l.z).project(camera);if(v3.z>1)continue;const d=Math.hypot((v3.x*.5+.5)*innerWidth-cx,(-v3.y*.5+.5)*innerHeight-cy);if(d<bd){bd=d;best=l}}
  if(!best)return;const b=NSKY.bodies.find(q=>q.name===best.t),s=NSKY.sats.find(q=>q.name===best.t);
  showCard('In the sky: '+best.t,`${Math.round(best.alt)}° above the horizon, toward the ${compass(best.az)}, at ${skyWhen(skyMs())}. `+(s?`A satellite about ${Math.round(s.km*.621).toLocaleString('en-US')} miles from Lincoln at this moment. Its place comes from the orbit CelesTrak publishes, worked forward to the minute.`:b?(b.name==='Moon'?`The Moon is ${Math.round((b.phase||0)*100)}% lit and ${b.waxing?'waxing':'waning'}.`:b.name==='Sun'?'The Sun.':'A planet, placed by formula to within a fraction of a degree.'):'A star from the Hipparcos catalog.'),undefined,{label:'Back to the whole sky',fn:skyCard})}
