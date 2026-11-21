
// =====================================================================================================
// Getting around the map: two-finger gestures that work the way phone maps do, a compass and zoom
// buttons that are always on screen, street names that thin out as you pull back, and a Walk mode
// with a joystick, tap-to-walk, walls you cannot pass through and the name of the street you are on.
// =====================================================================================================
function setView(tx,tz,d,az,el){const c=camTo(Math.max(-8700,Math.min(8700,tx)),Math.max(-8700,Math.min(8700,tz)),d,az,el);camera.position.copy(c.p);controls.target.copy(c.t);dirty=true}
// ---- pinch to zoom on the spot under your fingers, twist to turn, slide two fingers up or down to tilt
let g2=null;
function g2Start(){const [a,b]=[...ptrs.values()],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  if(ride||walk.on){g2={sp:ride?1:2,d0:Math.max(30,Math.hypot(b.x-a.x,b.y-a.y)),a0:Math.atan2(b.y-a.y,b.x-a.x),z0:ride?ride.zm||1:camera.fov,y0:ride?ride.yo||0:0,t:performance.now()};return}
  pan=null;panV=null;fly=null;if(tour)stopTour();
  g2={d0:Math.max(30,Math.hypot(b.x-a.x,b.y-a.y)),a0:Math.atan2(b.y-a.y,b.x-a.x),mx,my,ya:a.y,yb:b.y,xa:a.x,xb:b.x,h:groundAt(mx,my),v:viewAngles(),mode:null,rot:false,t:performance.now()}}
function g2Move(){if(!g2||ptrs.size<2)return;const [a,b]=[...ptrs.values()],dist=Math.max(30,Math.hypot(b.x-a.x,b.y-a.y)),ang=Math.atan2(b.y-a.y,b.x-a.x),mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dya=a.y-g2.ya,dyb=b.y-g2.yb;
  let da=ang-g2.a0;da=Math.atan2(Math.sin(da),Math.cos(da));
  if(g2.sp){lastInput=performance.now();dirty=true;if(g2.sp===1){if(!ride){g2=null;return}ride.zm=Math.min(4,Math.max(.12,g2.z0*g2.d0/dist));ride.yo=g2.y0+da}else if(walk.on){camera.fov=Math.min(walk.sky?100:80,Math.max(walk.sky?10:22,g2.z0*g2.d0/dist));camera.updateProjectionMatrix()}return}
  if(!g2.mode){const spread=Math.abs(dist-g2.d0),twist=Math.abs(da)*g2.d0*.5,par=dya*dyb>0?Math.min(Math.abs(dya),Math.abs(dyb)):0,side=Math.max(Math.abs(a.x-g2.xa),Math.abs(b.x-g2.xb));
    if(par>14&&spread<par*.55&&twist<par*.55&&side<par*.8)g2.mode='tilt';else if(spread>9||twist>12||Math.hypot(mx-g2.mx,my-g2.my)>12)g2.mode='zr';else return}
  const t=controls.target;
  if(g2.mode==='tilt')setView(t.x,t.z,g2.v.d,g2.v.az,Math.max(4,Math.min(89,g2.v.el+(dya+dyb)*.5*.24)));
  else{if(!g2.rot&&Math.abs(da)>.16){g2.rot=true;g2.a0+=Math.sign(da)*.16;da-=Math.sign(da)*.16} // a small twist while pinching is ignored
    setView(t.x,t.z,Math.min(24000,Math.max(40,g2.v.d*g2.d0/dist)),g2.v.az+(g2.rot?da*180/Math.PI:0),g2.v.el);
    if(g2.h){const h=planeHit(mx,my,g2.h.y0);if(h)shiftView(g2.h.x-h.x,g2.h.z-h.z)}}
  lastInput=performance.now()}
// ---- the buttons: compass (tap for north, drag to turn), zoom (tap or hold), tilt (tap for flat or tilted, drag to tilt)
let navHold=0,navT=0,navCmp=1e9;
function navDrag(el,onMove,onTap){let s=null;el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}s={x:e.clientX,y:e.clientY,v:viewAngles(),m:false};if(ride){ride.yo0=ride.yo||0;ride.hm0=ride.hm||1;return}stopTour();fly=null;panV=null});
  el.addEventListener('pointermove',e=>{if(!s)return;const dx=e.clientX-s.x,dy=e.clientY-s.y;if(!s.m&&Math.hypot(dx,dy)<6)return;s.m=true;onMove(dx,dy,s.v);lastInput=performance.now()});
  const end=e=>{if(!s)return;const m=s.m;s=null;if(!m&&e.type==='pointerup')onTap()};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end)}
function navInit(){controls.touches={ONE:-1,TWO:-1}; // touch is handled here, so one map gesture never fights another
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'&&ptrs.size===2)g2Start()});
  canvas.addEventListener('pointermove',e=>{if(g2&&ptrs.size>=2)g2Move()});
  const end=()=>{if(g2&&ptrs.size<2){if(!g2.sp&&!g2.mode&&performance.now()-g2.t<320)zoomBy(1.9);pd=null;lastTap=null;g2=null}};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  for(const [id,dir] of [['bZin',-1],['bZout',1]]){const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();navHold=dir;navT=performance.now();if(ride)return;stopTour();fly=null;panV=null});
    const up=e=>{if(!navHold)return;const quick=performance.now()-navT<260;navHold=0;if(quick&&e.type==='pointerup'){if(ride)ride.zm=Math.min(4,Math.max(.12,(ride.zm||1)*(dir<0?.6:1.65)));else zoomBy(dir<0?.55:1.8)}};b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up);b.addEventListener('pointercancel',up);
    b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(ride)ride.zm=Math.min(4,Math.max(.12,(ride.zm||1)*(dir<0?.6:1.65)));else zoomBy(dir<0?.55:1.8)}})}
  navDrag($('bCmp'),(dx,dy,v)=>{if(ride){ride.yo=ride.yo0+dx*.012;dirty=true;return}if(walk.on){walk.yaw=walk.yaw0!==undefined?walk.yaw0+dx*.008:walk.yaw;dirty=true;return}const t=controls.target;setView(t.x,t.z,v.d,v.az+dx*.5,v.el)},()=>{if(ride){ride.yo=0;ride.hm=1;ride.zm=1;dirty=true}else $('bNorth').click()});
  $('bCmp').addEventListener('pointerdown',()=>{walk.yaw0=walk.yaw});
  navDrag($('bTilt'),(dx,dy,v)=>{if(ride){ride.hm=Math.min(4,Math.max(.2,ride.hm0*Math.exp(dy*.012)));dirty=true;return}if(walk.on)return;const t=controls.target;setView(t.x,t.z,v.d,v.az,Math.max(4,Math.min(89,v.el+dy*.4)))},()=>{if(ride){ride.hm=(ride.hm||1)<.6?1:.3;dirty=true}else if(!walk.on)set2D(!flat)});
  knobInit();
  $('nav').classList.remove('mob');
  // a short reminder of how to move, the first time
  let seen=false;try{seen=localStorage.getItem('sc_hint')==='1'}catch(e){}
  if(!seen){const h=$('hint');h.textContent=mobile?'Drag to move · pinch to zoom · twist to turn · slide two fingers up or down to tilt':'Drag to move · scroll to zoom · right-drag or Shift-drag to turn and tilt · double-click to zoom in';
    setTimeout(()=>{h.style.display='block';setTimeout(()=>{h.style.display='none'},9000)},2500);try{localStorage.setItem('sc_hint','1')}catch(e){}}}

// ---- view knobs: a slider each for tilt and turn, for anyone who cannot drag
// a button by a few pixels, which is everyone on a phone and every keyboard user.
let knobBusy=0,knobT=-999,knobZ=-999;
function knobHead(az){return ((az%360)+360)%360}
function knobFace(h){return ['N','NE','E','SE','S','SW','W','NW'][Math.round(h/45)%8]}
function knobApply(el,h){if(walk.on||ride)return;const v=viewAngles(),t=controls.target;
  setView(t.x,t.z,v.d,h===undefined?v.az:h,el===undefined?v.el:el)}
function knobShow(on){const k=$('knobs');k.hidden=!on;$('bKnob').setAttribute('aria-pressed',on?'true':'false');
  if(on){knobSync(true);$('kTilt').focus()}}
function knobSync(force){const v=viewAngles(),el=Math.round(Math.max(4,Math.min(89,v.el))),h=Math.round(knobHead(v.az));
  if(force||Math.abs(el-knobT)>=1){knobT=el;if(knobBusy!==1)$('kTilt').value=el;$('kTiltV').textContent=el+'°'}
  if(force||Math.abs(h-knobZ)>=1){knobZ=h;if(knobBusy!==2)$('kTurn').value=h;$('kTurnV').textContent=knobFace(h)+' '+h+'°'}}
function knobInit(){
  $('bKnob').onclick=()=>knobShow($('knobs').hidden);
  const ti=$('kTilt'),tu=$('kTurn');
  ti.addEventListener('input',()=>{knobBusy=1;lastInput=performance.now();stopTour();fly=null;panV=null;
    const el=+ti.value;$('kTiltV').textContent=el+'°';knobApply(el,undefined)});
  tu.addEventListener('input',()=>{knobBusy=2;lastInput=performance.now();stopTour();fly=null;panV=null;
    const h=+tu.value;$('kTurnV').textContent=knobFace(h)+' '+h+'°';knobApply(undefined,h)});
  for(const el of [ti,tu])for(const ev of ['pointerup','pointercancel','blur','change'])el.addEventListener(ev,()=>{knobBusy=0});
  $('kNorth').onclick=()=>{const v=viewAngles(),t=controls.target;setView(t.x,t.z,v.d,0,v.el);knobSync(true)};
  $('kFlat').onclick=()=>{const v=viewAngles(),t=controls.target;setView(t.x,t.z,v.d,v.az,89);knobSync(true)};
  // the two drag buttons answer the keyboard too: Enter does what a tap does,
  // arrows nudge, so neither one needs a steady hand.
  $('bTilt').addEventListener('keydown',e=>{if(walk.on||ride)return;const v=viewAngles();
    if(e.key==='Enter'||e.key===' '){e.preventDefault();set2D(v.el<80)}
    else if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();knobApply(Math.max(4,Math.min(89,v.el+(e.key==='ArrowUp'?5:-5))),undefined);knobSync(true)}});
  $('bCmp').addEventListener('keydown',e=>{if(walk.on||ride)return;const v=viewAngles(),t=controls.target;
    if(e.key==='Enter'||e.key===' '){e.preventDefault();setView(t.x,t.z,v.d,0,v.el);knobSync(true)}
    else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setView(t.x,t.z,v.d,v.az+(e.key==='ArrowRight'?10:-10),v.el);knobSync(true)}});
}
function navFrame(now,dt){if(navHold&&now-navT>260&&ride){ride.zm=Math.min(4,Math.max(.12,(ride.zm||1)*Math.exp(navHold*1.5*dt)));lastInput=now;dirty=true}
  else if(navHold&&now-navT>260&&!walk.on){const v=viewAngles(),t=controls.target;setView(t.x,t.z,Math.min(24000,Math.max(40,v.d*Math.exp(navHold*1.7*dt))),v.az,v.el);lastInput=now}
  const az=walk.on?walk.yaw*180/Math.PI:viewAngles().az;if(Math.abs(az-navCmp)>.4){navCmp=az;$('cmpN').style.transform='rotate('+az.toFixed(1)+'deg)'}
  if(!$('knobs').hidden)knobSync(false);
  const fl=!walk.on&&viewAngles().el>80;if(fl!==navFrame.fl){navFrame.fl=fl;$('bTilt').textContent=fl?'3D':'2D'}}
// ---- street names: the big roads from far away, every street as you come in close, each written along its street
function streetLabels(){const RD=LM.road,out=[];if(!RD||!RD.rsn||!H.snl)return out;const by=new Map();
  //            far limits and priorities by how close in you are    spacing between names along one street
  const TIER=[[[36000,12000,4600,1700],[560,450,330,240],[3200,1300,600,190]],[[30000,9000,3200,1200],[525,400,310,230],[3400,1400,560,190]],[[7000,2600,1300,800],[300,270,240,215],[1500,640,300,170]],[[1300,620],[205,190],[420,170]]];
  for(let i=0;i<RD.rn.length;i++){const sn=RD.rsn[i],c=RD.rc[i],n=RD.rn[i];if(sn===65535||c>6||n<2||(RD.rf[i]&8))continue;const o=RD.off[i],xy=RD.xy;let L=0;const seg=[];
    for(let k=1;k<n;k++){const ax=xy[o+2*k-2]*Qm,az=-xy[o+2*k-1]*Qm,bx=xy[o+2*k]*Qm,bz=-xy[o+2*k+1]*Qm,d=Math.hypot(bx-ax,bz-az);seg.push([ax,az,bx,bz,d,L]);L+=d}
    if(L<34)continue;const step=L<300?L:260,cnt=Math.max(1,Math.round(L/step));let list=by.get(sn);if(!list){list=[];by.set(sn,list)}
    for(let q=0;q<cnt;q++){const at=L*(q+.5)/cnt,s=seg.find(s=>s[5]+s[4]>=at)||seg[seg.length-1],f=s[4]?(at-s[5])/s[4]:0;list.push({x:s[0]+(s[2]-s[0])*f,z:s[1]+(s[3]-s[1])*f,ax:(s[2]-s[0])/(s[4]||1),az:(s[3]-s[1])/(s[4]||1),c})}}
  for(const [sn,list] of by){const c=Math.min(...list.map(p=>p.c)),T=TIER[c<=2?0:c===3?1:c===4?2:3],name=H.snl[sn],placed=[];
    for(let lv=0;lv<T[0].length;lv++){const gap=T[2][lv];for(const p of list){if(p.lv!==undefined)continue;let ok=true;for(const q of placed)if((q.x-p.x)**2+(q.z-p.z)**2<gap*gap){ok=false;break}if(!ok)continue;p.lv=lv;placed.push(p);
        out.push({t:name,x:p.x,y:hAt(p.x,p.z)+3,z:p.z,k:c<=3?8:4,pri:T[1][lv],near:0,far:T[0][lv],ax:p.ax,az:p.az})}}}
  return out}
// ---- Walk mode
let WG=null;
function wkGrid(){if(WG)return WG;const cs=48,B=new Map(),R=new Map(),nr=S.b_rings,rs=S.b_rs,xy=S.b_xy,N=nr.length,xo=new Uint32Array(N),ro=new Uint32Array(N);let r=0,x=0;
  const put=(M,a,c,v)=>{const k=a*8192+c;let l=M.get(k);if(!l){l=[];M.set(k,l)}l.push(v)};
  for(let b=0;b<N;b++){ro[b]=r;xo[b]=x;const n=rs[r];let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let j=0;j<n;j++){const px=xy[x+2*j]*Qm,pz=-xy[x+2*j+1]*Qm;if(px<x0)x0=px;if(px>x1)x1=px;if(pz<z0)z0=pz;if(pz>z1)z1=pz}
    for(let k=0;k<nr[b];k++)x+=rs[r++]*2;
    if((S.b_minh&&S.b_minh[b]>24)||H.tags[S.b_tag[b]]==='roof')continue; // canopies and raised parts can be walked under
    for(let a=Math.floor(x0/cs);a<=Math.floor(x1/cs);a++)for(let c=Math.floor(z0/cs);c<=Math.floor(z1/cs);c++)put(B,a,c,b)}
  const RD=LM.road;if(RD&&RD.rsn)for(let i=0;i<RD.rn.length;i++){if(RD.rsn[i]===65535||RD.rc[i]>6||(RD.rf[i]&8))continue;const o=RD.off[i],q=RD.xy;
    for(let k=1;k<RD.rn[i];k++){const ax=q[o+2*k-2]*Qm,az=-q[o+2*k-1]*Qm,bx=q[o+2*k]*Qm,bz=-q[o+2*k+1]*Qm,d=Math.hypot(bx-ax,bz-az),m=Math.max(1,Math.ceil(d/18));
      for(let j=0;j<m;j++){const f=(j+.5)/m,px=ax+(bx-ax)*f,pz=az+(bz-az)*f;put(R,Math.floor(px/cs),Math.floor(pz/cs),[px,pz,i])}}}
  WG={cs,B,R,xo,ro};return WG}
function bAt(x,z){const G=wkGrid(),l=G.B.get(Math.floor(x/G.cs)*8192+Math.floor(z/G.cs));if(!l)return -1;const qx=x/Qm,qy=-z/Qm,xy=S.b_xy;
  for(const b of l){const o=G.xo[b],n=S.b_rs[G.ro[b]];let ins=false;for(let i=0,j=n-1;i<n;j=i++){const xi=xy[o+2*i],yi=xy[o+2*i+1],xj=xy[o+2*j],yj=xy[o+2*j+1];if((yi>qy)!==(yj>qy)&&qx<(xj-xi)*(qy-yi)/(yj-yi)+xi)ins=!ins}if(ins)return b}return -1}
function streetNear(x,z,lim){const G=wkGrid(),a0=Math.floor(x/G.cs),c0=Math.floor(z/G.cs),rr=Math.ceil(lim/G.cs);let best=null,bd=lim*lim;
  for(let a=a0-rr;a<=a0+rr;a++)for(let c=c0-rr;c<=c0+rr;c++){const l=G.R.get(a*8192+c);if(!l)continue;for(const p of l){const d=(p[0]-x)**2+(p[1]-z)**2;if(d<bd){bd=d;best=p}}}
  return best?{x:best[0],z:best[1],i:best[2],d:Math.sqrt(bd),name:H.snl[LM.road.rsn[best[2]]]}:null}
function wkFree(x,z){if(bAt(x,z)<0)return [x,z];const s=streetNear(x,z,140);if(s)return [s.x,s.z];for(let r=5;r<=120;r+=5)for(let k=0;k<12;k++){const a=k*.5236,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(bAt(px,pz)<0)return [px,pz]}return [x,z]}
const WSPD=[['Walk',4.5],['Jog',10],['Fast',26]],walkLabels=[];let wkSp=0,wkGo=null,wkHudT=0,wkLblT=0,wkMark=null,wkProg=null;
function wkMove(x,z,dx,dz){const lim=8100,L=Math.hypot(dx,dz)||1,px=dx/L*.7,pz=dz/L*.7,here=bAt(x,z),ok=(a,b)=>{const q=bAt(a,b);return q<0||q===here};
  const nx=Math.max(-lim,Math.min(lim,x+dx)),nz=Math.max(-lim,Math.min(lim,z+dz));
  if(ok(nx+px,nz+pz))return [nx,nz];if(ok(nx+Math.sign(dx)*.7,z))return [nx,z];if(ok(x,nz+Math.sign(dz)*.7))return [x,nz];return [x,z]}
function setWalk(on,at){if(on===walk.on&&!at)return;if(on)viewKeep();if(on&&rideMode)setRideMode(false);stopTour();fly=null;if(ride)stopRide();const was=walk.on;walk.on=on;$('bWalk').classList.toggle('on',on);controls.enabled=!on;
  $('wkui').style.display=on?'block':'none';document.body.classList.toggle('walking',on);wkGo=null;if(wkMark)wkMark.visible=false;walkLabels.length=0;walk.mx=walk.mz=0;walk.keys={};walk.look=null;
  if(on){document.body.style.setProperty('--wktop',Math.round($('title').getBoundingClientRect().bottom+6)+'px');wkGrid();let x,z;if(at){x=at.x;z=at.z;if(at.yaw!==undefined)walk.yaw=at.yaw}else if(!was){const t=controls.target,dx=t.x-camera.position.x,dz=t.z-camera.position.z,dh=Math.hypot(dx,dz)||1,back=Math.min(60,dh*.25);walk.yaw=Math.atan2(-dx,-dz);x=t.x-dx/dh*back;z=t.z-dz/dh*back}
    if(x!==undefined){[x,z]=wkFree(Math.max(-16000,Math.min(16000,x)),Math.max(-16000,Math.min(16000,z)));walk.pitch=.02;camera.position.set(x,hAt(x,z)+1.7,z);camera.near=.4;camera.fov=62;camera.updateProjectionMatrix()}
    walk.t=performance.now();$('wktip').textContent=mobile?'Stick moves you · drag the view to look · tap a spot to walk there':'W A S D or arrows to walk · drag to look · click a spot to walk there · Shift to hurry · Esc to leave';$('wktip').style.display='block';setTimeout(()=>{$('wktip').style.display='none'},7000);
    $('wkSp').textContent=WSPD[wkSp][0];hideCard();wkHud()}
  else if(was){const fx=-Math.sin(walk.yaw),fz=-Math.cos(walk.yaw),x=camera.position.x,z=camera.position.z;camera.fov=45;controls.target.set(x+fx*60,hAt(x+fx*60,z+fz*60),z+fz*60);camera.position.set(x-fx*220,hAt(x,z)+170,z-fz*220);camera.updateProjectionMatrix()}
  if(!on&&was)viewBack();layoutCard();shadowDirty=true;dirty=true}
function stepWalk(now){const dt=Math.min(.1,(now-walk.t)/1000||0);walk.t=now;let mx=walk.mx,mz=walk.mz;const k=walk.keys;
  if(k.KeyW||k.ArrowUp)mz-=1;if(k.KeyS||k.ArrowDown)mz+=1;if(k.KeyA)mx-=1;if(k.KeyD)mx+=1;if(k.ArrowLeft||k.KeyQ){walk.yaw+=1.7*dt;dirty=true}if(k.ArrowRight||k.KeyE){walk.yaw-=1.7*dt;dirty=true}
  let x=camera.position.x,z=camera.position.z,moved=false;const sp=WSPD[wkSp][1]*((k.ShiftLeft||k.ShiftRight)?2.4:1),m=Math.hypot(mx,mz);
  if(m>.05){wkGo=null;if(wkMark)wkMark.visible=false;const s=Math.sin(walk.yaw),c=Math.cos(walk.yaw),f=Math.min(1,m)/m*sp*dt;[x,z]=wkMove(x,z,(mx*c+mz*s)*f,(-mx*s+mz*c)*f);moved=true}
  else if(wkGo){const dx=wkGo.x-x,dz=wkGo.z-z,d=Math.hypot(dx,dz);
    if(d<1.3){wkGo=null;if(wkMark)wkMark.visible=false}
    else{let dy=Math.atan2(-dx,-dz)-walk.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));walk.yaw+=dy*Math.min(1,dt*3.2);const st=Math.min(d,sp*dt),x0=x,z0=z;[x,z]=wkMove(x,z,dx/d*st,dz/d*st);moved=true;
      if(!wkProg||now-wkProg.t>1300){if(wkProg&&Math.hypot(x-wkProg.x,z-wkProg.z)<.5){wkGo=null;if(wkMark)wkMark.visible=false}wkProg={x,z,t:now}}}}
  if(moved){walk.ph=(walk.ph||0)+sp*dt*1.9;dirty=true}
  camera.position.set(x,hAt(x,z)+(walk.sky?95:(walk.eye||1.7))+(moved?Math.abs(Math.sin(walk.ph||0))*.05:0),z);camera.rotation.set(walk.pitch,walk.yaw,0,'YXZ');controls.target.set(x-Math.sin(walk.yaw)*40,camera.position.y,z-Math.cos(walk.yaw)*40);
  if(now-wkHudT>350){wkHudT=now;wkHud()}}
function wkHud(){if(walk.eye>3&&!walk.sky){const h=$('wkhud'),p=Math.round(walk.pitch*180/Math.PI),t='Looking '+compass(-walk.yaw*180/Math.PI)+', '+(p>=0?p+'° above':-p+'° below')+' the horizon, from '+(Math.round(walk.eye*3.281/10)*10).toLocaleString('en-US')+' ft up';if(h.textContent!==t)h.textContent=t;return}if(walk.sky){const h=$('wkhud'),t='Looking '+compass(-walk.yaw*180/Math.PI)+', '+Math.round(walk.pitch*180/Math.PI)+'° above the horizon';if(h.textContent!==t)h.textContent=t;return}const x=camera.position.x,z=camera.position.z,s=streetNear(x,z,42),hd=((-walk.yaw*180/Math.PI)%360+360)%360,dir=['north','northeast','east','southeast','south','southwest','west','northwest'][Math.round(hd/45)%8];
  let ahead='';const fx=-Math.sin(walk.yaw),fz=-Math.cos(walk.yaw);for(let t=5;t<=160;t+=3){const b=bAt(x+fx*t,z+fz*t);if(b>=0){const nm=H.infos[S.b_info[b]];if(nm)ahead=' · ahead: '+nm+' ('+Math.round(t*3.281/10)*10+' ft)';break}}
  $('wkhud').textContent=(s?'On '+s.name:'Off the street')+' · facing '+dir+ahead;
  const now=performance.now();if(now-wkLblT>900&&H2&&H2.biz){wkLblT=now;if(!bizL)bizSetup();walkLabels.length=0;const c=[];for(let i=0;i<bizL.n;i++){const d=(bizL.X[2*i]-x)**2+(bizL.X[2*i+1]-z)**2;if(d<150*150)c.push([d,i])}
    c.sort((a,b)=>a[0]-b[0]);for(const [d,i] of c.slice(0,9)){const bx=bizL.X[2*i],bz=bizL.X[2*i+1];walkLabels.push({t:H2.biz.n[i],x:bx,y:hAt(bx,bz)+7,z:bz,k:3,pri:420,near:0,far:260})}}}
// a tap in Walk mode: a building shows its card, open ground is somewhere to walk to
function walkTap(cx,cy){if(walk.sky){skyTap(cx,cy);return}ndc.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(ndc,camera);if(dlOn.length&&dlPick(cx,cy,true))return;const o=ray.ray.origin,d=ray.ray.direction;
  for(let t=1.5;t<420;t+=.8+t*.012){const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t;if(Math.abs(x)>8100||Math.abs(z)>8100)return;const g=hAt(x,z),b=bAt(x,z);
    if(b>=0&&y<=g+S.b_h[b]/10+1.5){if(treePick(t))return;showB(b);const bt=Math.max(0,t-3);wkTo(o.x+d.x*bt,o.z+d.z*bt);return}
    if(y<=g+.05){if(treePick(t))return;hideCard();wkTo(x,z);return}}}
function wkTo(x,z){wkGo={x,z};wkProg=null;if(!wkMark){wkMark=new THREE.Mesh(new THREE.RingGeometry(.55,.9,24),new THREE.MeshBasicMaterial({color:0xe9b949,transparent:true,opacity:.9,side:THREE.DoubleSide,depthTest:false}));wkMark.rotation.x=-Math.PI/2;wkMark.renderOrder=6;scene.add(wkMark)}
  wkMark.position.set(x,hAt(x,z)+.15,z);wkMark.visible=true;dirty=true}
function walkToB(b){wkGrid();const bx=LM.bc[2*b],bz=LM.bc[2*b+1],s=streetNear(bx,bz,170);let x,z;if(s){x=s.x;z=s.z}else[x,z]=wkFree(bx,bz);hideCard();setWalk(true,{x,z,yaw:Math.atan2(-(bx-x),-(bz-z))})}
function walkInit(){const j=$('wjoy'),knob=j.firstElementChild;let jp=null;
  const mv=e=>{const r=j.getBoundingClientRect(),R=r.width/2;let dx=e.clientX-(r.left+R),dy=e.clientY-(r.top+R);const m=Math.hypot(dx,dy),lim=R-14;if(m>lim){dx*=lim/m;dy*=lim/m}walk.mx=dx/lim;walk.mz=dy/lim;knob.style.transform=`translate(${dx}px,${dy}px)`;dirty=true;lastInput=performance.now()};
  j.addEventListener('pointerdown',e=>{e.preventDefault();jp=e.pointerId;try{j.setPointerCapture(jp)}catch(_){}mv(e)});j.addEventListener('pointermove',e=>{if(e.pointerId===jp)mv(e)});
  const up=e=>{if(e.pointerId!==jp)return;jp=null;walk.mx=walk.mz=0;knob.style.transform=''};j.addEventListener('pointerup',up);j.addEventListener('pointercancel',up);
  $('wkSp').onclick=()=>{wkSp=(wkSp+1)%WSPD.length;$('wkSp').textContent=WSPD[wkSp][0]};$('wkX').onclick=()=>viewExit(false);$('wkUp').onclick=()=>viewExit(true)}
