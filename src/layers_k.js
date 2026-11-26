
// =====================================================================================================
// The wiring: one place that starts each feature above, steps it, hands its labels to the map and puts
// everything back when Bird's eye reset is pressed. Also Nader, the tornado who talks, and the credits
// roll that comes out of the Devaney Center and Memorial Stadium.
// =====================================================================================================
const skyLabels=[];
function labelSets(){if(walk.sky)return [skyLabels];const s=[labels,busLabels,wxLabels,lifeLabels,dlLabels,huskLabels,civLabels,festLabels,stopLabels];if(walk.on)s.push(walkLabels);return s}
function pickMore(x,y){if(SPOT.arm){const gp=groundPoint();if(gp)spotOpen(gp.x,gp.z);return true}if(RAIN.arm){const gp=groundPoint();if(gp)rainDrop(gp.x,gp.z);return true}if(CIV.arm){const gp=groundPoint();if(gp&&Math.abs(gp.x)<8300&&Math.abs(gp.z)<8300)civicStack(gp.x,gp.z);return true}if(DM.on&&dmPick())return true;return false}
let fmT=0,navPT=0,fmRide=null,hintT=0;
function hintShow(t,ms){const h=$('hint');h.textContent=t;h.style.display='block';clearTimeout(hintT);hintT=setTimeout(()=>{h.style.display='none'},ms||7000)}
// the round buttons sit above whatever card is open, so a card never covers them on a phone
function navPlace(now){if(now-navPT<220)return;navPT=now;const c=$('card'),n=$('nav'),uz=[1,1.18,1.36][ACC.z]||1;let b=(bottomH+10)*uz;if(innerWidth<700&&c.style.display==='block'&&!walk.on)b=Math.max(b,innerHeight-c.getBoundingClientRect().top+8);if(walk.on)b=Math.max(92*uz,b);
  // worked in screen pixels, then divided by the text-size zoom, because the controls are scaled with the rest of the interface
  const tr=$('tools').getBoundingClientRect(),top=innerHeight-b-n.getBoundingClientRect().height,hit=tr.height>0&&tr.bottom>top-6,ph=innerWidth<700,r=hit&&!ph?Math.round(innerWidth-tr.left+8):12*uz,s=Math.round(b/uz)+'px',rs=Math.round(r/uz)+'px';if(n.style.bottom!==s)n.style.bottom=s;if(n.style.right!==rs)n.style.right=rs;
  // on a phone with no room left between the buttons and an open card, the round controls step aside; pinch, twist and drag still work
  const hid=(ph&&(hit||top<$('title').getBoundingClientRect().bottom))?'hidden':'visible';if(n.style.visibility!==hid)n.style.visibility=hid}
function frameMore(now){const dt=Math.min(.1,(now-(fmT||now))/1000);fmT=now;
  // a ride just began: say how to move the camera, which no longer stops the ride
  if(ride!==fmRide){fmRide=ride;if(ride)hintShow(mobile?'Pinch to zoom down to street level · drag to look around the rider · twist to swing around a turn · Stop ends the ride':'Scroll to zoom down to street level · drag to look around the rider · Esc or Stop ends the ride',9000)}
  navFrame(now,dt);huskFrame();dmFrame(now);civFrame();treesFrame();rollFrame(now,dt);regionFrame(now);frame2(now,dt);navPlace(now)}
// ---- the running total for the part of the city in view, shown while a property layer is up, with a gold ring on the ground around what is counted
const RV={at:0,key:'',ring:null,bins:new Uint32Array(1501)};
const viewR=()=>Math.min(5000,Math.max(120,camera.position.distanceTo(controls.target)*.42));
function regionFrame(now){const L=dlTop,el=$('rv');if(!el)return;const on=!!(L&&L.def.g==='Property and taxes'&&!walk.on&&!sheet&&numData());
  if(!on){if(RV.key){RV.key='';el.style.display='none';if(RV.ring)RV.ring.visible=false;layoutCard();dirty=true}return}
  if(now-RV.at<300)return;RV.at=now;const t=controls.target,r=viewR(),key=Math.round(t.x/10)+','+Math.round(t.z/10)+','+Math.round(r/6);if(key===RV.key)return;const first=!RV.key;RV.key=key;
  const D=numData(),B=RV.bins,X=D.X,r2=r*r;B.fill(0);let n=0,tot=0,tax=0,hm=0;
  for(let i=0;i<D.n;i++){const dx=X[2*i]-t.x,dz=X[2*i+1]-t.z;if(dx*dx+dz*dz>r2)continue;const v=D.v[i];n++;tot+=v;tax+=v*D.tr[D.t[i]]/100;if(D.k[i]===D.home){hm++;B[Math.min(1500,Math.floor(v/1000))]++}}
  let med=0;if(hm){let c=0;for(let k=0;k<=1500;k++){c+=B[k];if(c>=hm/2){med=k*1000+500;break}}}
  el.textContent='In the gold ring, '+(r<700?Math.round(r*3.281/50)*50+' ft':(r/1609.344).toFixed(1)+' mi')+' around the center of your view: '+n.toLocaleString('en-US')+' properties · '+fmtN(tot,'$')+' assessed'+(hm?' · typical home about '+fmtN(med,'$'):'')+' · about '+fmtN(tax,'$')+' a year in property tax ▸';el.style.display='block';
  if(!RV.ring){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(144*3),3));RV.ring=new THREE.LineLoop(g,new THREE.LineBasicMaterial({color:0xe9b949,transparent:true,opacity:.95,depthTest:false,fog:false}));RV.ring.frustumCulled=false;RV.ring.renderOrder=6;scene.add(RV.ring)}
  const P=RV.ring.geometry.attributes.position;for(let k=0;k<144;k++){const a=k/144*6.2832,x=t.x+Math.cos(a)*r,z=t.z+Math.sin(a)*r;P.setXYZ(k,x,hAt(Math.max(-8390,Math.min(8390,x)),Math.max(-8390,Math.min(8390,z)))+2.5,z)}P.needsUpdate=true;RV.ring.visible=true;
  if(first)layoutCard();dirty=true}
function stepMore(dt,now){stepCreatures(dt,now);stepFlights(dt,now);bedsFlush()}
// Bird's eye reset: every switch, filter, tour and panel added above goes back to where it started
function resetAll(){reset2();if(DM.on)setVotes(false);civClear();if(FLT.on)setFlights(false);if(reAt>=0)reTour(-1);if(!CR.on)setCreatures(true);rollClose();trafH=1;wkSp=0;$('bNat').classList.remove('on');
  if($('q')){$('q').value='';$('res').style.display='none'}NUM.view=null;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
// ---- Nader, the tornado. On a real warning he says what the Weather Service says. In the preview he says he is a preview.
const NDIR=['north','northeast','east','southeast','south','southwest','west','northwest'];
function naderLines(a){if(wxDemo)return ['I\'m Nader. Relax, I\'m only a preview. There is no warning right now.','If I were real: get inside, lowest floor, a room with no windows.','I go where the Weather Service says the storm is going.','You say tornado. Around here, some folks say \'nader.'];
  const st=a&&a.storm;return ['I\'m Nader. This is a real Tornado Warning'+(a&&a.ends?' until '+clock(a.ends):'')+'.','Get inside now. Lowest floor, a room with no windows.','Do not come looking for me. Listen to local radio or NOAA Weather Radio.',st?'The Weather Service last had me moving '+NDIR[Math.round(((st.from+180)%360)/45)%8]+' at about '+Math.round(st.kt*1.151)+' mph.':'The red outline is the warned area.']}
function naderSay(g,now){const u=g.userData;if(!u.say)return;const L=naderLines(u.alert),t=L[Math.floor(now/5200)%L.length];if(u.say.sub!==t){u.say.sub=t;dirty=true}}
// ---- the credits roll: a window that comes out of the building and scrolls the record book like the end of a film
const ROLL={on:null,pos:0,hold:0,at:null};
// the 2026 football season as saved with the map (ESPN's public scoreboard, read Nov 14, 2026); the website copy reads it live
const FB26=[['2026-09-05T16:00Z','Ohio',49,21,'h'],['2026-09-12T23:00Z','Bowling Green',56,7,'h'],['2026-09-19T23:15Z','North Dakota',34,7,'h'],['2026-09-26T21:00Z','Michigan State',31,13,'a'],['2026-10-03T20:00Z','Maryland',48,23,'h'],['2026-10-10T16:00Z','Indiana',17,20,'h'],['2026-10-18T03:00Z','Oregon',14,17,'a'],['2026-11-01T00:00Z','Washington',10,17,'h'],['2026-11-07T01:00Z','Illinois',13,24,'a'],['2026-11-14T17:30Z','Rutgers',31,0,'a']];
// set scores for every finished volleyball match: ESPN's schedule leaves them out, so they are read once per match from its scoreboard and kept on this device
const VBS={m:{},busy:false};try{VBS.m=JSON.parse(localStorage.getItem('sc_vbsets')||'{}')||{}}catch(e){}
async function vbSets(){if(!hosted()||VBS.busy)return;const need=(HK.ev.vb||[]).filter(e=>e.st==='post'&&e.done&&!VBS.m[e.id]);if(!need.length)return;VBS.busy=true;let i=0;
  const run=async()=>{while(i<need.length){const e=need[i++];try{const j=await (await fetch(ESPN+HK.sp[1][2]+'/scoreboard/'+e.id)).json(),u=hkParse(j);if(u&&u.done&&u.ls.length)VBS.m[e.id]=[u.ls.map(Number),u.lo.map(Number)]}catch(err){}ROLL.seen=-1}};
  await Promise.all([run(),run(),run(),run()]);VBS.busy=false;ROLL.seen=-1;try{localStorage.setItem('sc_vbsets',JSON.stringify(VBS.m))}catch(e){}}
// a suspended or cancelled match is on ESPN's list with no result: only finished matches count
function vbSeason(){const lv=!!(HK.ev.vb&&HK.ev.vb.some(e=>e.st==='post'&&e.done)),S=e=>VBS.m[e.id]||[e.ls,e.lo];return {live:lv,off:lv?HK.ev.vb.filter(e=>e.st==='post'&&!e.done).map(e=>[e.t,e.opp,e.det]):[],ev:lv?HK.ev.vb.filter(e=>e.st==='post'&&e.done&&e.my!=null).map(e=>[e.t,e.opp,+e.my,+e.th,!!e.win,S(e)[0],S(e)[1],e.ha,e.ork,e.neutral]):VB26.map(r=>[Date.parse(r[0]),r[1],r[2],r[3],r[2]>r[3]])}}
function rollData(kind){const out=[],Hd=t=>out.push(['h',t]),P=(a,b)=>out.push(['p',a,b]),T=t=>out.push(['t',t]),day=ms=>new Date(ms).toLocaleDateString('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric'});
  if(kind==='vb'){const V=vbSeason(),ev=V.ev,w=ev.filter(e=>e[4]).length,sw=ev.reduce((s,e)=>s+e[2],0),sl=ev.reduce((s,e)=>s+e[3],0);
    Hd('Nebraska volleyball');T(TAG);Hd('This season');P('Record',V.live&&HK.rec.vb?HK.rec.vb:w+'-'+(ev.length-w));P('Sets won, sets lost',sw+' to '+sl);P('Sweeps',String(ev.filter(e=>e[4]&&e[3]===0).length));
    let run=0;for(let i=ev.length-1;i>=0&&ev[i][4];i--)run++;if(run>1)P('Wins in a row',String(run));
    if(V.live){let pf=0,pa=0,ns=0,big=0,nm=0;for(const e of ev){if((e[5]||[]).length)nm++;for(let k=0;k<(e[5]||[]).length;k++){const a=+e[5][k],b=+e[6][k];if(!(a>=0&&b>=0))continue;pf+=a;pa+=b;ns++;big=Math.max(big,a-b)}}
      const part=nm<ev.length?' · '+nm+' of '+ev.length+' matches read so far':'';
      if(ns){P('Points scored, points allowed'+part,pf.toLocaleString('en-US')+' to '+pa.toLocaleString('en-US'));P('Average set'+part,(pf/ns).toFixed(1)+' to '+(pa/ns).toFixed(1));if(big)P('Widest set'+part,big+' points')}
      const hm=ev.filter(e=>e[7]==='home'&&!e[9]),rk=ev.filter(e=>e[8]>0);if(hm.length)P('At home',hm.filter(e=>e[4]).length+'-'+hm.filter(e=>!e[4]).length);if(rk.length)P('Against ranked teams',rk.filter(e=>e[4]).length+'-'+rk.filter(e=>!e[4]).length)}
    Hd('Match by match');for(const e of ev)P(day(e[0])+' · '+e[1],(e[4]?'Won ':'Lost ')+e[2]+'-'+e[3]+((e[5]||[]).length?'  ('+e[5].map((a,k)=>a+'-'+e[6][k]).join(', ')+')':''));for(const o of V.off||[])P(day(o[0])+' · '+o[1],o[2]||'Not played');
    Hd('National champions');T('1995 · 2000 · 2006 · 2015 · 2017');
    Hd('Titles');for(const m of vbTitles())P(m[0],m[1]);Hd('The crowds');for(const m of VBMSG.slice(6))P(m[0],m[1]);Hd('The names');for(const m of VBMSG.slice(2,6))P(m[0],m[1]);
    T(V.live?'Scores read live from ESPN\'s public scoreboard.':'Scores are the map\'s saved list as of '+VB26ASOF+'. The website copy reads them live.');T('Crowd records carry the date they were true, because records fall.')}
  else if(kind==='bb'){
    Hd('Nebraska basketball');T('Pinnacle Bank Arena');P('Opened','2013');P('Seats','15,500');
    Hd('The drought, and the end of it');
    T('Until March 2026 Nebraska was the only program in a power conference that had never won an NCAA tournament game. Eight appearances across 87 years, eight exits.');
    P('March 19, 2026 \u00b7 Troy','Won 76-47');
    T('The first NCAA tournament win in school history. The 29-point margin was the largest in any school\u2019s first tournament win since 1971.');
    P('March 21, 2026 \u00b7 No. 5 Vanderbilt','Won 74-72');
    T('Braden Frager\u2019s basket sent Nebraska to its first Sweet 16.');
    P('March 26, 2026 \u00b7 Iowa','Lost 71-77');
    T('Houston, and the end of the best season the program has had.');
    Hd('2025-26');P('Record','28-7');P('Started the season','20-0');P('Big Ten','15-5');
    T('Twenty-eight wins broke a school record that had stood since 1990-91, when Nebraska won 26. Those two teams are the only Nebraska sides ever to finish in the top 15 of the AP poll.');
    P('All-time in the NCAA tournament','2-9');P('Postseason appearances','29 \u00b7 9 NCAA, 19 NIT, 1 Crown');
    Hd('Fred Hoiberg');P('2026','AP National Coach of the Year');P('Signed through','2031-32');P('Season in Lincoln','Eighth in 2026-27');
    T('His second Sweet 16; he took Iowa State to one in 2014. His grandfather, Jerry Bush, coached Toledo to the 1954 NCAA tournament, and his other grandfather taught here.');
    {const m=(HK.ev.mbb||[]).filter(e=>e.st==='post'&&e.done&&e.my!=null);
     Hd('Men, this season');if(HK.rec.mbb)P('Record',HK.rec.mbb);
     if(m.length)for(const e of m)P(day(e.t)+' \u00b7 '+(e.ha==='home'?'':'at ')+e.opp,(e.win?'Won ':'Lost ')+e.my+'-'+e.th);
     else T('No completed games read yet this season.')}
    Hd('Nebraska women');P('Amy Williams','11th season in 2026-27');P('At Nebraska','177-136 across ten seasons');
    P('NCAA tournaments','2018, 2022, 2024, 2025, 2026');T('Three in a row going into this season.');
    P('Average crowd','5,638 \u00b7 16th in the country');
    T('Allison Weidner is back as a graduate student after three knee surgeries, having torn her left ACL in December 2022 and her right in October 2023.');
    {const w=(HK.ev.wbb||[]).filter(e=>e.st==='post'&&e.done&&e.my!=null);
     Hd('Women, this season');if(HK.rec.wbb)P('Record',HK.rec.wbb);
     if(w.length)for(const e of w)P(day(e.t)+' \u00b7 '+(e.ha==='home'?'':'at ')+e.opp,(e.win?'Won ':'Lost ')+e.my+'-'+e.th);
     else T('No completed games read yet this season.')}
    T('Season records and scores read live from ESPN\u2019s public scoreboard on the website copy. Everything above them is the map\u2019s own saved record, sourced to Nebraska Athletics and the Associated Press.')}
  else{const ev=(HK.ev.fb||[]).filter(e=>e.st==='post'&&e.done&&e.my!=null);Hd('Nebraska football');T('Memorial Stadium');P('Opened','1923');P('Sold out every home game since','November 3, 1962');P('Straight sellouts going into 2026','410');P('Listed capacity','85,458');
    Hd('Volleyball Day in Nebraska');P('August 30, 2023 · Nebraska 3, Omaha 0',RECORD.toLocaleString('en-US'));T('The largest crowd ever recorded at a women\'s sporting event, in a football stadium. It broke the 91,648 at Barcelona in 2022 and this stadium\'s own record of 91,585 against Miami in 2014.');
    Hd('This season');if(ev.length){const w=ev.filter(e=>e.win).length;P('Record',HK.rec.fb||(w+'-'+(ev.length-w)));for(const e of ev)P(day(e.t)+' · '+(e.ha==='home'?'':'at ')+e.opp,(e.win?'Won ':'Lost ')+e.my+'-'+e.th)}
    else{const w=FB26.filter(g=>g[2]>g[3]).length;P('Record through '+VB26ASOF,w+'-'+(FB26.length-w));for(const g of FB26)P(day(Date.parse(g[0]))+' · '+(g[4]==='h'?'':'at ')+g[1],(g[2]>g[3]?'Won ':'Lost ')+g[2]+'-'+g[3])}
    Hd('The one-score ledger');P('2018 through 2024','10-35');P('2025','5-2');P('2026 so far','0-3');
    Hd('National champions');T('1970 · 1971 · 1994 · 1995 · 1997');Hd('Heisman Trophy');P('1972','Johnny Rodgers');P('1983','Mike Rozier');P('2001','Eric Crouch');
    Hd('Carved on the southwest corner, 1923');T('“Not the victory but the action; Not the goal but the game; In the deed the glory.”');T('Hartley Burr Alexander');
    T(ev.length?'Scores read live from ESPN\'s public scoreboard.':'Scores are the map\'s saved list as of '+VB26ASOF+'. The website copy reads them live.')}
  return out}
function rollFill(){ROLL.seen=HK.at;$('rollb').innerHTML=rollData(ROLL.on).map(r=>r[0]==='h'?'<h5>'+esc(r[1])+'</h5>':r[0]==='p'?'<p><small>'+esc(r[1])+'</small>'+esc(r[2])+'</p>':'<p class="t">'+esc(r[1])+'</p>').join('')+'<p class="t">★</p>'}
const ROLLV={vb:['Devaney Sports Center','DEVANEY CENTER'],bb:['Pinnacle Bank Arena','PINNACLE BANK ARENA'],fb:['Memorial Stadium','MEMORIAL STADIUM']};
function rollOpen(kind){const el=$('roll'),b=$('rollb');ROLL.on=kind;const V=ROLLV[kind]||ROLLV.fb;ROLL.at=hkVenue(V[0]);$('rollt').textContent=V[1];rollFill();
  {const tr=$('tools').getBoundingClientRect();el.style.right=innerWidth<700?'':(tr.width?Math.max(68,Math.round(innerWidth-tr.left+12)):68)+'px'}el.style.display='block';b.scrollTop=0;ROLL.pos=0;ROLL.hold=performance.now()+900;
  // it grows out of the building: the animation starts from the building's spot on the screen
  const p=ROLL.at;if(p){v3.set(p.x,hAt(p.x,p.z)+p.h*.5,p.z).project(camera);const r=el.getBoundingClientRect();el.style.transformOrigin=((v3.x*.5+.5)*innerWidth-r.left)+'px '+((-v3.y*.5+.5)*innerHeight-r.top)+'px'}
  el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');hkLoad();if(kind==='vb')vbSets();lastInput=performance.now()}
function rollClose(){if(!ROLL.on)return;ROLL.on=null;$('roll').style.display='none';$('rollL').style.display='none'}
function rollFrame(now,dt){if(!ROLL.on)return;const b=$('rollb'),ln=$('rollL');if(ROLL.seen!==HK.at){const y=b.scrollTop;rollFill();b.scrollTop=y}if(now>ROLL.hold){ROLL.pos+=dt*34;const max=b.scrollHeight-b.clientHeight;if(ROLL.pos>max){ROLL.pos=0;ROLL.hold=now+700}b.scrollTop=ROLL.pos}
  // a thin line ties the window to the building it came from
  const p=ROLL.at;let show=false;if(p&&!walk.on){v3.set(p.x,hAt(p.x,p.z)+p.h*.6,p.z).project(camera);if(v3.z<1&&v3.z>-1&&Math.abs(v3.x)<1&&Math.abs(v3.y)<1){const sx=(v3.x*.5+.5)*innerWidth,sy=(-v3.y*.5+.5)*innerHeight,r=$('roll').getBoundingClientRect(),ex=Math.max(r.left,Math.min(r.right,sx)),ey=Math.max(r.top,Math.min(r.bottom,sy)),L=Math.hypot(ex-sx,ey-sy);
      if(L>6){ln.style.left=sx+'px';ln.style.top=sy+'px';ln.style.width=L+'px';ln.style.transform='rotate('+Math.atan2(ey-sy,ex-sx)+'rad)';show=true}}}
  ln.style.display=show?'block':'none'}
function rollInit(){const b=$('rollb'),hold=()=>{ROLL.hold=performance.now()+3500};for(const ev of ['pointerdown','wheel','touchstart'])b.addEventListener(ev,hold,{passive:true});b.addEventListener('scroll',()=>{if(performance.now()<ROLL.hold)ROLL.pos=b.scrollTop},{passive:true});$('rollx').onclick=rollClose;
  // the stadium and the arena each open their own roll when tapped
  for(const o of pickables)if(o.userData&&o.userData.info&&o.userData.info[0]==='Memorial Stadium')o.userData.roll='fb'}
function manHTML(){return H2&&H2.man?'<h4>Every source, and when it was last pulled</h4><table><tr><th>What</th><th>Source</th><th>As of</th></tr>'+H2.man.map(r=>'<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[3])+'</td></tr>').join('')+'</table>':''}
// ---- start everything. Each piece starts on its own, so one that fails cannot take the map down with it.
function moreInit(){const run=(n,f)=>{try{f()}catch(e){console.warn('STARCITY: could not start '+n,e)}};
  run('navigation',navInit);run('walk',walkInit);run('creatures',creaturesInit);run('flights',flightsInit);run('scores',huskInit);run('weather',wxInit);if(H2){run('native places',nativeInit);run('city trees',treesInit)}run('credits roll',rollInit);run('region total',()=>{const rv=document.createElement('button');rv.id='rv';rv.setAttribute('aria-live','polite');rv.setAttribute('aria-label','Totals for the area in view. Opens the statistics');rv.onclick=()=>openSheet(NUMS,0);$('bottom').insertBefore(rv,$('dlg'))});
  // things that move are found by a tap wherever they have got to
  run('tap targets',()=>{const big=new THREE.Sphere(new THREE.Vector3(0,0,0),40000);for(const m of [CR.nesM,CR.fish&&CR.fish.m,CR.sq&&CR.sq.A,CR.sq&&CR.sq.B,CR.cowM,CR.capB&&CR.capB[0],CR.capB&&CR.capB[1],FLT.m])if(m)m.boundingSphere=big});
  run('buttons',()=>{$('bCre').onclick=()=>setCreatures(!CR.on);$('bCiv').onclick=demoCard;$('bNum').onclick=()=>openSheet(NUMS,0);$('bNIL').onclick=()=>openSheet(NILS,0);$('bRE').onclick=()=>reTour(reAt>=0?-1:0);
    $('bNat').onclick=()=>{const L=DL.get('nativeln'),on=!(L&&L.on);setNative(on);$('bNat').classList.toggle('on',on)};if(!H2)for(const id of ['bCiv','bNum','bNIL','bRE','bNat'])$(id).style.display='none'});
  // in Walk mode the wheel, or a pinch, zooms the view the way a camera lens does
  addEventListener('keydown',e=>{if(e.key==='Escape'&&ride)stopRide()});
  canvas.addEventListener('wheel',e=>{if(!walk.on)return;e.preventDefault();camera.fov=Math.min(walk.sky?100:80,Math.max(walk.sky?10:22,camera.fov*(e.deltaY>0?1.08:.925)));camera.updateProjectionMatrix();lastInput=performance.now();dirty=true},{passive:false});init2()}
