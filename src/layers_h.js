
// =====================================================================================================
// Live: Husker scores as they happen, weather alerts that load on their own, and what City Hall is
// deciding right now. Every feed here is read by the page itself from a public source. If a feed
// cannot be reached, the map says so instead of guessing.
// =====================================================================================================
const ESPN='https://site.api.espn.com/apis/site/v2/sports/',huskLabels=[];
const HK={sp:[['now','Now'],['vb','Volleyball','volleyball/womens-college-volleyball','Devaney Sports Center',[8,9,10,11,12]],['fb','Football','football/college-football','Memorial Stadium',[8,9,10,11,12,1]],
  ['mbb','Men\'s hoops','basketball/mens-college-basketball','Pinnacle Bank Arena',[11,12,1,2,3,4]],['wbb','Women\'s hoops','basketball/womens-college-basketball','Pinnacle Bank Arena',[11,12,1,2,3,4]],['wsoc','Women\'s soccer','soccer/usa.ncaa.w.1','Barbara Hibner Soccer Stadium',[8,9,10,11,12],'20498'],['bsb','Baseball','baseball/college-baseball','Haymarket Park',[2,3,4,5,6]]],
  ev:{},rec:{},sum:{},at:0,ok:false,fail:false,busy:false,beacon:null};
const hkId=s=>s[5]||'158';
function hkParse(e,id){id=id||'158';const c=e.competitions&&e.competitions[0];if(!c||!c.competitors)return null;const me=c.competitors.find(q=>q.team&&q.team.id===id),op=c.competitors.find(q=>q!==me);if(!me||!op)return null;
  const ty=((c.status||e.status||{}).type)||{},sc=q=>q.score==null?null:(typeof q.score==='object'?q.score.displayValue:String(q.score)),rk=q=>q.curatedRank&&q.curatedRank.current>0&&q.curatedRank.current<=25?q.curatedRank.current:0;
  return {id:e.id,t:Date.parse(e.date),ha:me.homeAway,neutral:!!c.neutralSite,opp:op.team.shortDisplayName||op.team.displayName||'',oa:op.team.abbreviation||'',st:ty.state||'pre',det:ty.shortDetail||ty.detail||'',done:!!ty.completed,my:sc(me),th:sc(op),win:me.winner,tie:sc(me)!=null&&sc(me)===sc(op)&&!me.winner&&!op.winner,
    venue:(c.venue&&c.venue.fullName)||'',note:(c.notes&&c.notes[0]&&c.notes[0].headline)||'',stype:(e.seasonType&&e.seasonType.type)||0,ls:(me.linescores||[]).map(l=>l.displayValue),lo:(op.linescores||[]).map(l=>l.displayValue),rk:rk(me),ork:rk(op)}}
const hkSeason=s=>s[4].includes(lincolnNow().ymd/100%100|0);
async function hkLoad(force){if(!hosted()||HK.busy||(!force&&Date.now()-HK.at<9e5))return;HK.busy=true;let any=false;
  await Promise.all(HK.sp.slice(1).filter(hkSeason).map(async s=>{try{const j=await (await fetch(ESPN+s[2]+'/teams/'+hkId(s)+'/schedule')).json(),ev=(j.events||[]).map(e=>hkParse(e,hkId(s))).filter(Boolean).sort((a,b)=>a.t-b.t);if(!ev.length)return;const old=HK.ev[s[0]]||[];for(const e of ev){const o=old.find(q=>q.id===e.id);if(o&&e.my==null&&o.my!=null&&e.st!=='pre'){e.my=o.my;e.th=o.th;e.ls=o.ls;e.lo=o.lo;e.det=o.det||e.det}}
      HK.ev[s[0]]=ev;HK.rec[s[0]]=(j.team&&j.team.recordSummary)||hkRec(ev);(HK.stand=HK.stand||{})[s[0]]=(j.team&&j.team.standingSummary)||'';any=true}catch(e){}}));
  HK.busy=false;HK.at=Date.now();HK.ok=HK.ok||any;HK.fail=!any&&!HK.ok;hkAfter();try{await Promise.race([hkTick(true),new Promise(r=>setTimeout(r,5000))])}catch(e){}hkAfter()}
const hkRec=ev=>{const f=ev.filter(e=>e.st==='post'&&e.done&&e.my!=null),w=f.filter(e=>e.win).length,d=f.filter(e=>e.tie).length;return w+'-'+(f.length-w-d)+(d?'-'+d:'')};
const hkHot=e=>{const n=Date.now();return e.st==='in'||(e.st==='pre'&&e.t-n<12e5&&n-e.t<144e5)||(e.st==='post'&&n-e.t<144e5&&!e.sett)};
async function hkTick(first){if(!hosted()||(document.hidden&&!first)||!HK.ok)return;let ch=false;
  for(const s of HK.sp.slice(1)){for(const e of (HK.ev[s[0]]||[]).filter(hkHot)){try{const j=await (await fetch(ESPN+s[2]+'/scoreboard/'+e.id,{signal:AbortSignal.timeout(7000)})).json(),u=hkParse(j,hkId(s));if(u){const was=e.st;Object.assign(e,u);if(e.st==='post'&&e.done){e.sett=true;if(was!=='post')HK.rec[s[0]]=hkRec(HK.ev[s[0]])}ch=true}}catch(err){}}}
  if(first)return;if(ch)hkAfter();if(Date.now()-HK.at>9e5)hkLoad()}
function hkLine(e,s){const vb=s[0]==='vb',lead=e.my==null?`Nebraska vs ${e.opp}, score on its way`:`Nebraska ${e.my}, ${e.opp} ${e.th??0}`;if(e.st!=='in'||e.my==null)return lead;return lead+' · '+(vb&&e.ls.length?`set ${e.ls.length}: ${e.ls[e.ls.length-1]}-${e.lo[e.lo.length-1]??0}`:e.det)}
const hkWhen=t=>new Date(t).toLocaleString('en-US',{timeZone:'America/Chicago',weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
function hkVenue(n){if(n==='Memorial Stadium')return {x:LM.stadium[0],z:LM.stadium[1],h:70};if(n==='Devaney Sports Center'&&LM.dev)return {x:LM.dev.x,z:LM.dev.z,h:60};if(n==='Barbara Hibner Soccer Stadium')return {x:(-96.69961-H.lon0)*KXm,z:-(40.83794-H.lat0)*KYm,h:30};const b=H.blabels.find(q=>q[0]===n);return b?{x:b[1],z:-b[2],h:b[4]+34}:null}
// The 2026 roster as huskers.com lists it, read Nov. 21, 2026. One name at a time above the Devaney Center.
const VBROSTER=[[1,"Keri Leimbach","DS/libero"],[2,"Bergen Reilly","setter"],[3,"Virginia Adriano","opposite hitter"],[4,"Campbell Flynn","setter"],[6,"Laney Choboy","DS/libero"],[8,"Kenna Cogill","middle blocker"],[10,"Olivia Mauch","DS/libero"],[11,"Teraya Sigler","outside hitter"],[14,"Manaia Ogbechie","middle blocker"],[15,"Andi Jackson","middle blocker"],[17,"Keoni Williams","middle blocker"],[18,"Ryan Hunter","opposite hitter"],[20,"Jayden Robinson","outside hitter"],[21,"Skyler Pierce","outside hitter"],[23,"Gabby DiVita","outside hitter"],[27,"Harper Murray","outside hitter"]];
const vbStar={t:'',sub:'',x:0,y:0,z:0,k:3,pri:1100,near:0,far:5200,i:-1};
function vbStarTick(){if(!LM.dev||!HK.sp[1][4].includes(lincolnNow().ymd/100%100|0))return;const p=LM.dev;vbStar.i=(vbStar.i+1)%VBROSTER.length;const q=VBROSTER[vbStar.i];vbStar.t='#'+q[0]+' '+q[1];vbStar.sub=q[2]+' · 2026 Husker volleyball';
  vbStar.x=p.x;vbStar.z=p.z;vbStar.y=hAt(p.x,p.z)+150;if(!huskLabels.includes(vbStar))huskLabels.push(vbStar);if(Math.hypot(camera.position.x-p.x,camera.position.z-p.z)<6500)dirty=true}
// The All-American wall. Every Husker volleyball All-American, with the seasons she was named. AVCA teams first, second and third,
// plus Terri Kanouse, named by the AIAW in 1980. The list is the one kept on Wikipedia from AVCA and Nebraska records, through 2025.
const VBAA=[["Terri Kanouse","'80"],["Cathy Noth","'83 '84"],["Annie Adamczak","'85"],["Karen Dahlgren","'85 '86"],["Enid Schonewise","'86"],["Tisha Delaney","'86"],["Lori Endicott","'87 '88"],["Virginia Stahr","'88 '89"],["Janet Kruse","'89 '90 '91"],["Val Novak","'89 '90"],["Stephanie Thater","'90 '91 '92"],["Chris Hall","'91"],["Allison Weston","'93 '94 '95"],["Christy Johnson","'94 '95"],["Kelly Aspegren","'94"],["Lisa Reitsma","'95 '96 '97"],["Fiona Nepo","'96 '97 '98"],["Megan Korver","'98"],["Nancy Metcalf","'98 '99 '01"],["Amber Holmquist","'00 '01 '02"],["Greichaly Cepero","'00 '01 '02"],["Laura Pilakowski","'00 '02"],["Jenny Kropp","'01"],["Melissa Elmer","'03 '04 '05"],["Jennifer Saleaumua","'04 '05"],["Sarah Pavan","'04 '05 '06 '07"],["Christina Houghtelling","'05 '07"],["Jordan Larson","'06 '07 '08"],["Rachel Holloway","'06 '07"],["Tracy Stalls","'06 '07"],["Sydney Anderson","'08 '09"],["Tara Mueller","'08"],["Brooke Delano","'09 '10"],["Hannah Werth","'10 '12"],["Lindsey Licht","'10"],["Gina Mancuso","'11 '12"],["Lauren Cook","'12"],["Kadie Rolfzen","'13 '14 '15 '16"],["Kelsey Robinson","'13"],["Amber Rolfzen","'15 '16"],["Justine Wong-Orantes","'15 '16"],["Kelly Hunter","'16 '17"],["Annika Albrecht","'17"],["Mikaela Foecke","'17 '18"],["Kenzie Maloney","'18"],["Lauren Stivrins","'18 '19 '20"],["Lexi Sun","'19 '20"],["Nicklin Hames","'20"],["Kayla Caffey","'21"],["Lexi Rodriguez","'21 '22 '23 '24"],["Madi Kubik","'21"],["Bergen Reilly","'23 '24 '25"],["Harper Murray","'23 '24 '25"],["Merritt Beason","'23"],["Andi Jackson","'24 '25"],["Rebekah Allick","'25"]];
function aaWallInit(){const p=LM.dev;if(!p)return;const cv=document.createElement('canvas');cv.width=2048;cv.height=1152;const q=cv.getContext('2d');
  q.fillStyle='#b00d23';q.fillRect(0,0,2048,1152);q.fillStyle='#8f0a1c';q.fillRect(0,0,2048,150);q.strokeStyle='#fdf2d9';q.lineWidth=6;q.strokeRect(14,14,2020,1124);
  q.fillStyle='#fdf2d9';q.textAlign='center';q.font='800 74px system-ui,Arial,sans-serif';q.fillText('NEBRASKA VOLLEYBALL ALL-AMERICANS',1024,104);
  const COLS=4,per=Math.ceil(VBAA.length/COLS),cw=2020/COLS,y0=214,lh=(1152-y0-66)/per;q.textAlign='left';
  for(let i=0;i<VBAA.length;i++){const c=(i/per)|0,r=i%per,x=34+c*cw,y=y0+r*lh;q.font='700 34px system-ui,Arial,sans-serif';q.fillStyle='#ffffff';q.fillText(VBAA[i][0],x,y);const w=q.measureText(VBAA[i][0]).width;q.font='500 23px system-ui,Arial,sans-serif';q.fillStyle='#ffd9a0';q.fillText(VBAA[i][1],x+w+10,y,cw-w-34)}
  q.textAlign='center';q.font='500 28px system-ui,Arial,sans-serif';q.fillStyle='#fdf2d9';q.fillText(VBAA.length+' players · AVCA first, second and third teams, 1983 to 2025, and the AIAW in 1980 · a virtual wall, on this map only',1024,1118);
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;const W=88,Hh=W*1152/2048,g=new THREE.Group();
  for(const ry of [0,Math.PI]){const m=new THREE.Mesh(new THREE.PlaneGeometry(W,Hh),new THREE.MeshBasicMaterial({map:tex,fog:false}));m.rotation.y=ry;m.position.z=ry?-.6:.6;g.add(m)}
  const back=new THREE.Mesh(new THREE.BoxGeometry(W+4,Hh+4,1),new THREE.MeshLambertMaterial({color:0x2a2c30}));g.add(back);for(const sx of [-1,1]){const post=new THREE.Mesh(new THREE.BoxGeometry(2.4,10,2.4),new THREE.MeshLambertMaterial({color:0x2a2c30}));post.position.set(sx*W*.36,-Hh/2-5,0);g.add(post)}
  // it stands on the grass by the east parking lot, clear of the road, and turns to face you the way the Devaney sign does
  const x=p.x+292,z=p.z-162;g.position.set(x,hAt(x,z)+10+Hh/2,z);g.rotation.y=-Math.PI/2;
  g.userData.card=()=>aaCard();scene.add(g);pickables.push(g);LM.aaWall=g;try{vbKidsInit(x,z)}catch(e){}labels.push({t:'All-American Wall',sub:VBAA.length+' Husker volleyball All-Americans',x,y:hAt(x,z)+Hh+22,z,k:3,pri:960,near:0,far:2200})}
// A roadside sign of the kind that used to stand outside motels: a bulb-lit arrow over a letter board with clip-on letters.
function motelCanvas(dir){const cv=document.createElement('canvas');cv.width=640;cv.height=900;const q=cv.getContext('2d');
  // the arrow points at the arena; dir is 1 when the arena is to the right of the sign on screen, -1 when it is to the left
  q.save();q.translate(320,205);q.scale(dir,1);q.rotate(.06);q.beginPath();q.moveTo(-270,-120);q.lineTo(120,-120);q.lineTo(120,-175);q.lineTo(285,-20);q.lineTo(120,135);q.lineTo(120,80);q.lineTo(-270,80);q.closePath();q.fillStyle='#e23b2e';q.fill();q.lineWidth=10;q.strokeStyle='#fbe9b0';q.stroke();
  q.fillStyle='#ffe27a';const B=[[-250,-100],[-190,-100],[-130,-100],[-70,-100],[-10,-100],[50,-100],[105,-100],[140,-150],[185,-108],[228,-66],[262,-22],[228,24],[185,68],[140,112],[105,62],[50,62],[-10,62],[-70,62],[-130,62],[-190,62],[-250,62],[-252,-20]];for(const [x,y] of B){q.beginPath();q.arc(x,y,9,0,6.283);q.fill()}q.restore();
  q.save();q.translate(320+dir*-40,215);q.rotate(.06*dir);q.fillStyle='#fff7e0';q.textAlign='center';q.font='italic 800 78px Georgia,serif';q.fillText('Volleyball',0,10);q.restore();
  q.beginPath();q.ellipse(320,395,215,58,0,0,6.283);q.fillStyle='#1f8f8a';q.fill();q.lineWidth=8;q.strokeStyle='#fbe9b0';q.stroke();q.fillStyle='#fff7e0';q.textAlign='center';q.font='800 40px system-ui,Arial,sans-serif';q.fillText('SELLOUTS NIGHTLY',320,409);
  q.fillStyle='#f4f1e6';q.fillRect(40,480,560,330);q.lineWidth=10;q.strokeStyle='#2a2c30';q.strokeRect(40,480,560,330);q.strokeStyle='#c9c4b4';q.lineWidth=3;for(const y of [585,690]){q.beginPath();q.moveTo(48,y+8);q.lineTo(592,y+8);q.stroke()}
  const L=['CENTER OF THE','VOLLEYBALL','UNIVERSE'];q.fillStyle='#16171a';q.font='800 62px "Arial Narrow",Arial,sans-serif';
  for(let r=0;r<3;r++){const t=L[r],w=44,x0=320-(t.length-1)*w/2;for(let i=0;i<t.length;i++){const k=(r*17+i*7)%11;q.save();q.translate(x0+i*w+(k===3?4:0),558+r*105+(k===5?5:k===8?-4:0));q.rotate((k-5)*.012+(k===2?.09:0));q.fillText(t[i],0,0);q.restore()}}
  q.fillStyle='#e23b2e';q.font='700 26px system-ui,Arial,sans-serif';q.fillText('★ FREE PARKING FOR CHAMPIONS ★',320,850);
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;return tex}
// A roadside sign of the kind that used to stand outside motels: a bulb-lit arrow over a letter board with clip-on letters.
function motelSignInit(){const p=LM.dev;if(!p)return;const R=motelCanvas(1),Lt=motelCanvas(-1),Hh=30,W=Hh*640/900,g=new THREE.Group();
  const m=new THREE.Mesh(new THREE.PlaneGeometry(W,Hh),new THREE.MeshBasicMaterial({map:R,transparent:true,alphaTest:.05,side:THREE.DoubleSide,fog:false}));m.position.y=14+Hh/2;g.add(m);
  for(const sx of [-1,1]){const post=new THREE.Mesh(new THREE.BoxGeometry(.9,17,.9),new THREE.MeshLambertMaterial({color:0x3a3d42}));post.position.set(sx*W*.3,8.5,-.6);g.add(post)}
  const x=p.x+62,z=p.z+128;g.position.set(x,hAt(x,z),z);g.userData.info=['Center of the Volleyball Universe','A roadside sign in the old motel style, with a bulb-lit arrow and clip-on letters. It exists on this map only. The title is one fans give the Devaney Center, home of the most-attended program in college volleyball.'];g.userData.tex=[R,Lt];g.userData.dir=1;g.userData.panel=m;scene.add(g);pickables.push(g);LM.vbMotel=g}
// called each frame after the sign turns to face you: the arrow swaps sides so it always points at the arena
function motelAim(){const g=LM.vbMotel,p=LM.dev;if(!g||!p)return;const rx=Math.cos(g.rotation.y),rz=-Math.sin(g.rotation.y),d=(p.x-g.position.x)*rx+(p.z-g.position.z)*rz,dir=d>=0?1:-1;
  if(dir!==g.userData.dir){g.userData.dir=dir;const mt=g.userData.panel.material;mt.map=g.userData.tex[dir>0?0:1];mt.needsUpdate=true;dirty=true}}
function aaCard(){showCard('The All-American Wall',VBAA.length+' Nebraska volleyball players have been named All-Americans, more selections than any other program in the country. Each name is followed by the seasons she was honored: '+VBAA.map(q=>q[0]+' ('+q[1]+')').join(', ')+'. The years cover AVCA first, second and third teams from 1983 through 2025, and Terri Kanouse, named by the AIAW in 1980. This wall exists on this map only.',undefined,{label:'Roll the records',fn:()=>rollOpen('vb')},[{href:'https://en.wikipedia.org/wiki/Nebraska_Cornhuskers_women%27s_volleyball_honors_and_awards',label:'The full honors list ↗'},{href:'https://huskers.com/sports/volleyball/roster',label:'This season\'s roster ↗'}])}
function hkAfter(){huskLabels.length=0;if(vbStar.i>=0)huskLabels.push(vbStar);const live=[],byV=new Map();
  for(const s of HK.sp.slice(1)){const ev=HK.ev[s[0]];if(!ev)continue;const on=ev.find(e=>e.st==='in'),nx=ev.find(e=>e.st==='pre'&&e.t>Date.now()-36e5);if(on)live.push([s,on]);
    let v=byV.get(s[3]);if(!v){v={rec:[],sub:'',live:false};byV.set(s[3],v)}v.rec.push(s[1]+' '+HK.rec[s[0]]);
    if(on&&on.ha==='home'&&!on.neutral){v.live=true;v.sub='LIVE: '+hkLine(on,s)}else if(!v.sub&&nx&&nx.ha==='home'&&!nx.neutral)v.sub='next here: '+nx.opp+', '+hkWhen(nx.t)}
  for(const [n,v] of byV){const p=hkVenue(n);if(p)huskLabels.push({t:v.rec.join(' · '),sub:v.sub,x:p.x,y:hAt(p.x,p.z)+p.h+26,z:p.z,k:3,pri:v.live?1500:930,near:0,far:v.live?30000:7000})}
  const b=$('liveB');if(live.length){const [s,e]=live[0];b.textContent='● LIVE '+s[1]+': '+hkLine(e,s)+(live.length>1?' (+'+(live.length-1)+')':'');b.style.display='block'}else b.style.display='none';
  if(HK.beacon){const U=HK.beacon.material.uniforms;U.uA.value=live.some(([s,e])=>e.ha==='home')?1.25:.8}
  if(sheet===HUSK)hkRefresh();if(vbOn)vbT=null;dirty=true}
function hkRefresh(){const b=$('gbody'),y=b.scrollTop,i=[...$('gtabs').children].findIndex(q=>q.classList.contains('on'));b.innerHTML=hkHTML(Math.max(0,i));b.scrollTop=y}
const HKSTAT={fb:['totalYards','netPassingYards','rushingYards','firstDowns','thirdDownEff','turnovers','totalPenaltiesYards','possessionTime'],bb:['fieldGoalsMade-fieldGoalsAttempted','fieldGoalPct','threePointFieldGoalsMade-threePointFieldGoalsAttempted','freeThrowsMade-freeThrowsAttempted','totalRebounds','assists','turnovers','largestLead']};
async function hkSum(k,id){const s=HK.sp.find(q=>q[0]===k);HK.sum[id]={busy:true};hkRefresh();try{const j=await (await fetch(ESPN+s[2]+'/summary?event='+id)).json(),bx=j.boxscore||{},T=bx.teams||[],me=T.find(t=>t.team.id==='158'),op=T.find(t=>t.team.id!=='158'),want=HKSTAT[k==='fb'?'fb':'bb'],rows=[];
    if(me&&op&&me.statistics)for(const n of want){const a=me.statistics.find(q=>q.name===n),b=(op.statistics||[]).find(q=>q.name===n);if(a)rows.push([a.label||n,a.displayValue,b?b.displayValue:''])}
    const stars=[];for(const p of (bx.players||[]).filter(p=>p.team.id==='158'))for(const g of p.statistics||[]){const L=g.labels||[];if(k==='fb'){if(['passing','rushing','receiving'].includes(g.name)&&g.athletes&&g.athletes[0])stars.push(g.athletes[0].athlete.displayName+' ('+g.name+'): '+g.athletes[0].stats.map((v,q)=>v+' '+L[q]).slice(0,4).join(', '))}
        else{const pi=L.indexOf('PTS');if(pi>=0)for(const a of (g.athletes||[]).filter(a=>a.stats&&a.stats.length).sort((x,y)=>(+y.stats[pi]||0)-(+x.stats[pi]||0)).slice(0,3))stars.push(a.athlete.displayName+': '+a.stats[pi]+' pts, '+a.stats[L.indexOf('REB')]+' reb, '+a.stats[L.indexOf('AST')]+' ast')}}
    HK.sum[id]={rows,stars,at:Date.now()}}catch(e){HK.sum[id]={err:true}}hkRefresh()}
function hkGame(e,s,big){const k=s[0],su=HK.sum[e.id],fin=e.st==='post'&&e.done&&e.my!=null,rk=q=>q?'#'+q+' ':'';let h=`<div class="hkg${e.st==='in'?' live':''}">`;
  if(e.st==='pre')h+=`<b>${e.ha==='home'?'vs':'at'} ${rk(e.ork)}${esc(e.opp)}</b><small>${hkWhen(e.t)}${e.venue?' · '+esc(e.venue):''}</small>`;
  else if(e.st==='in'&&e.my==null)h+=`<b><i>LIVE</i> Nebraska ${e.ha==='home'?'vs':'at'} ${esc(e.opp)}</b><small>${esc(e.det)} · reading the score…</small>`;
  else if(fin||e.st==='in'){h+=`<b>${e.st==='in'?'<i>LIVE</i> ':(e.win?'W ':e.tie?'D ':'L ')}Nebraska ${esc(e.my)}, ${esc(e.opp)} ${esc(e.th)}</b><small>${e.st==='in'?esc(e.det):new Date(e.t).toLocaleDateString('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric'})}${e.ha==='home'?' · home':' · away'}${e.venue&&big?' · '+esc(e.venue):''}</small>`;
    if(e.ls.length&&big)h+=`<small>${k==='vb'?'Sets':k==='fb'?'Quarters':k==='bsb'?'Innings':k==='wsoc'?'Halves':'Periods'}: ${e.ls.map((v,q)=>esc(v)+'-'+esc(e.lo[q]??'')).join(' · ')}</small>`;
    if(big&&k!=='vb'&&k!=='bsb'&&k!=='wsoc'){if(!su)h+=`<button class="btn" data-sum="${k}:${e.id}">Team stats</button>`;else if(su.busy)h+='<small>Reading the box score…</small>';else if(su.err||!su.rows.length)h+='<small>No box score is posted for this game.</small>';
      else h+='<table><tr><th></th><th>Nebraska</th><th>'+esc(e.oa||e.opp)+'</th></tr>'+su.rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')+'</table>'+su.stars.map(x=>`<small>${esc(x)}</small>`).join('')}
    if(big&&k==='vb')h+='<small>The feed carries set scores for volleyball, not kills or digs.</small>'}
  else h+=`<b>${e.ha==='home'?'vs':'at'} ${esc(e.opp)}</b><small>${esc(e.det||'postponed')}</small>`;return h+'</div>'}
// where every tracked sport stands in its year: in season, in the postseason, finished, or off until its first month comes round again.
// Titles are read from the feed's own game notes (a win in a game ESPN labels a championship or final), so they appear on their own.
const HKMON=['','January','February','March','April','May','June','July','August','September','October','November','December'];
function hkSeasonState(s,nowMs){const now=nowMs||Date.now(),k=s[0],ev=HK.ev[k],mo=new Date(now).toLocaleDateString('en-US',{timeZone:'America/Chicago',month:'numeric'})|0,day=t=>new Date(t).toLocaleDateString('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric'});
  const back='back in '+HKMON[s[4][0]];if(!ev||!ev.length)return {st:'off',head:s[4].includes(mo)?'Schedule not read yet':'Off season',line:s[4].includes(mo)?'In season, but its schedule has not come through the feed.':'The season starts again in '+HKMON[s[4][0]]+'.',titles:[]};
  const done=ev.filter(e=>e.st==='post'&&e.done&&e.my!=null),up=ev.filter(e=>e.st==='pre'&&e.t>now-144e5),live=ev.find(e=>e.st==='in'),last=done[done.length-1];
  const titles=done.filter(e=>e.win&&/champion|final\b|title game/i.test(e.note)&&!/semi|quarter/i.test(e.note)).map(e=>e.note.replace(/\s+/g,' ').trim());
  const post=ev.some(e=>e.stype===3&&(e.st!=='pre'||e.t<now+12096e5)),rec=HK.rec[k]||hkRec(ev),stand=(HK.stand&&HK.stand[k]||'').replace(/big10/i,'the Big Ten');
  let st,head,line;
  if(live){st='live';head='Playing now';line=(live.ha==='home'?'vs ':'at ')+live.opp}
  else if(up.length){const n=up[0];st=n.stype===3||post?'post':'in';head=st==='post'?'Postseason':'In season';line='Next: '+day(n.t)+(n.ha==='home'?' vs ':' at ')+n.opp+(n.note?' · '+n.note:'')}
  else if(last&&now-last.t<21*864e5&&s[4].includes(mo)){st='wait';head=post?'Postseason':'In season';line='No next game is posted yet. Postseason dates appear once they are set.'}
  else{st='over';head='Season over';line='Finished '+rec+(last?' on '+day(last.t):'')+', '+back+'.'}
  return {st,head,line,rec,stand,titles}}
function hkSeasonsHTML(nowMs){return '<h4>Where each season stands</h4>'+HK.sp.slice(1).map(s=>{const q=hkSeasonState(s,nowMs),dot={live:'#ff4d5e',in:'#58d68d',post:'#f5c542',wait:'#f5c542',over:'#8a8f98',off:'#8a8f98'}[q.st];
    return `<div class="hg"><b><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${dot};margin-right:6px"></span>${esc(s[1])} · ${esc(q.head)}${q.rec&&q.st!=='off'?' · '+esc(q.rec):''}</b>${q.stand&&q.st!=='off'&&q.st!=='over'?`<small>${esc(q.stand)}</small>`:''}<small>${esc(q.line)}</small>${q.titles.map(t=>`<small>🏆 Won: ${esc(t)}</small>`).join('')}<small class="psub">Plays at ${esc(s[3])}</small></div>`}).join('')}
function hkHTML(i){if(!hosted())return '<p>Scores are read live from ESPN\'s public scoreboard. That works on the website copy of the map, not inside the Claude app.</p>';if(!HK.ok)return HK.fail?'<p>The scoreboard could not be reached just now. It will try again in a few minutes. Inside the Claude app it cannot be reached at all: scores load on the website copy of the map.</p>':'<p>Reading the scoreboard…</p>';
  const note='<p class="psub">Scores come from ESPN\'s public scoreboard feed and refresh about every 20 seconds while a game is on. ESPN does not promise the feed, so if it goes quiet this panel will say so.</p>';
  if(i===0){let h='';const now=Date.now(),day=lincolnNow().ymd,ymd=t=>+new Date(t).toLocaleDateString('en-CA',{timeZone:'America/Chicago'}).replace(/-/g,''),live=[],today=[],rest=[],soon=[];
    for(const s of HK.sp.slice(1)){const ev=HK.ev[s[0]];if(!ev)continue;for(const e of ev){if(e.st==='in')live.push([s,e]);else if(ymd(e.t)===day)today.push([s,e])}
      const last=ev.filter(e=>e.st==='post'&&e.done&&e.my!=null).pop(),up=ev.filter(e=>e.st==='pre'&&e.t>now&&ymd(e.t)!==day);for(const e of up)soon.push([s,e]);rest.push(`<h4>${s[1]} · ${HK.rec[s[0]]}</h4>`+(last?hkGame(last,s,false):'')+(up.length?'':'<small class="psub">No more games are posted in the feed. Postseason dates appear once they are set.</small>'))}
    soon.sort((a,b)=>a[1].t-b[1].t);
    if(live.length)h+='<h4>On now</h4>'+live.map(([s,e])=>`<p class="psub">${s[1]}</p>`+hkGame(e,s,true)).join('');
    if(today.length)h+='<h4>Today</h4>'+today.map(([s,e])=>`<p class="psub">${s[1]}</p>`+hkGame(e,s,true)).join('');
    if(!live.length&&!today.length)h+='<p>No Husker team in this feed plays today.</p>';
    if(soon.length)h+='<h4>Coming up</h4>'+soon.slice(0,12).map(([s,e])=>`<p class="psub">${s[1]}</p>`+hkGame(e,s,false)).join('');h+='<h4>Latest results</h4>';return h+rest.join('')+hkSeasonsHTML()+note}
  const s=HK.sp[i],ev=HK.ev[s[0]];if(!ev){const q=hkSeasonState(s);return `<p>${s[1]}: ${q.head.toLowerCase()}. ${q.line}</p>`+note}
  let h=`<h4>${s[1]} · ${HK.rec[s[0]]}</h4>`;if(s[0]==='fb'){const o=hkOneScore();if(o)h+=`<p>In games decided by one score this season: ${o[0]}-${o[1]}.</p>`}
  const fin=ev.filter(e=>e.st!=='pre').reverse(),up=ev.filter(e=>e.st==='pre');return h+(up.length?'<h4>Coming up</h4>'+up.slice(0,6).map(e=>hkGame(e,s,false)).join(''):'')+'<h4>Results</h4>'+fin.map(e=>hkGame(e,s,e.st==='in')).join('')+note}
function hkOneScore(){const ev=HK.ev.fb;if(!ev)return null;const f=ev.filter(e=>e.st==='post'&&e.done&&e.my!=null&&Math.abs(e.my-e.th)<=8);return [f.filter(e=>e.win).length,f.filter(e=>!e.win).length]}
const HUSK={title:'Husker <i>scores</i>',tabs:HK.sp.map(s=>s[1]),html:hkHTML,click:e=>{const b=e.target.closest('[data-sum]');if(b){const [k,id]=b.dataset.sum.split(':');hkSum(k,id)}}};
function huskOpen(tab){openSheet(HUSK,tab||0);hkLoad()}
function huskInit(){window.__hk=HK;$('bHusk').onclick=()=>{if(sheet===HUSK)closeSheet();else huskOpen(0)};$('liveB').onclick=()=>huskOpen(0);
  // the arenas get a scarlet beacon, the way the stadium gets its own treatment
  const V=['Devaney Sports Center','Pinnacle Bank Arena'].map(hkVenue).filter(Boolean);if(V.length){const n=V.length,X=new Float32Array(n*2),Hh=new Float32Array(n).fill(SKY),C=new Float32Array(n*3),Ti=new Float32Array(n);V.forEach((p,i)=>{X[2*i]=p.x;X[2*i+1]=p.z;C.set(c3(0xe41c38),3*i)});
    HK.beacon=mkPillars(n,X,Hh,null,C,Ti);HK.beacon.material.uniforms.uA.value=.8;scene.add(HK.beacon)}
  vbStarTick();setInterval(vbStarTick,2400);try{aaWallInit()}catch(e){}try{motelSignInit()}catch(e){}
  if(hosted()){setTimeout(()=>hkLoad(),1200);setInterval(hkTick,20000)}}
function huskFrame(){if(!HK.beacon)return;const d=camera.position.distanceTo(controls.target),u=HK.beacon.material.uniforms;u.uR.value=Math.min(40,Math.max(3,d*.002));u.uHS.value=Math.min(4,Math.max(.25,d/3600))}
function pbaCard(b){const m=HK.rec.mbb,w=HK.rec.wbb,links=[];bLinks(b,links);showCard('Pinnacle Bank Arena','Home court of Nebraska men\'s and women\'s basketball since 2013, with 15,500 seats in the West Haymarket. The men have ranked in the national top 25 for attendance every season here, and the women ranked 15th in the country in 2025-26. '
  +(m||w?`This season: men ${m||'not started'}, women ${w||'not started'}. `:'')+'In March 2026 the men won the first NCAA tournament game in school history here, then reached a first Sweet 16, finishing 28-7. The scarlet beacon marks the arena on the map. '+(RE.on?propLines(b)||'':''),undefined,{label:'Roll the records',fn:()=>rollOpen('bb')},[{label:'Husker scores',fn:()=>huskOpen(3)}].concat(links))}
// ---- weather that loads on its own: current conditions, any alert in force, and the next few forecast periods
async function wxDetail(){const dirs=['N','NE','E','SE','S','SW','W','NW'],w=wxNow(),F=c=>Math.round(c*9/5+32);let al=null,fc=null,err='';
  const now=()=>{if(!w||w.tC==null)return '<p>Current conditions have not loaded.</p>';const mph=w.kmh!=null?Math.round(w.kmh*.621):null,t=F(w.tC);let feel='';if(mph!=null&&t<=50&&mph>=3){const wc=Math.round(35.74+.6215*t-35.75*Math.pow(mph,.16)+.4275*t*Math.pow(mph,.16));if(wc<t-2)feel=` · feels like ${wc}°`}
    return `<p style="font-size:34px;font-weight:700;margin:2px 0 0">${t}°F<span style="font-size:15px;font-weight:400"> ${esc(w.desc||'')}${feel}</span></p><p class="psub">Lincoln Airport${mph!=null?` · wind ${w.dir!=null?dirs[Math.round(w.dir/45)%8]+' ':''}${mph} mph`+(w.gust?`, gusts ${Math.round(w.gust*.621)}`:''):''}</p>`};
  const html=()=>{let s=now();
    if(!hosted())return s+'<p>Alerts and the forecast come from the National Weather Service and load on the website copy of the map.</p>';
    if(al===null)s+='<p class="psub">Reading alerts and the forecast…</p>';
    else if(al===false)s+='';else if(al.length)s+=al.map(a=>`<p style="border-left:4px solid #ef4444;padding-left:8px"><b>${esc(a.ev)}</b>${a.until?' until '+esc(a.until):''}<br><span class="psub">${esc(a.txt)}</span></p>`).join('');
    else s+='<p><b>No weather alerts</b> in force for Lincoln.</p>';
    if(fc&&fc.length){s+='<h4>Next two days</h4>'+fc.map(p=>`<div class="prow"><span><b>${esc(p.name)}</b> · ${esc(p.short)}</span><b>${p.day?'high':'low'} ${p.t}°${p.pop?' · '+p.pop+'% rain or snow':''}</b></div>`).join('');
      const wet=fc.find(p=>p.pop>=40),cold=fc.find(p=>p.t<=32),hot=fc.find(p=>p.t>=95),tips=[];if(wet)tips.push(`Best chance of rain or snow: ${wet.name.toLowerCase()}, ${wet.pop}%.`);if(cold)tips.push(`Freezing by ${cold.name.toLowerCase()} (${cold.t}°).`);if(hot)tips.push(`Heat: ${hot.t}° ${hot.name.toLowerCase()}.`);if(w&&w.gust&&w.gust*.621>=35)tips.push('Gusts above 35 mph now.');
      if(tips.length)s+='<p>'+tips.map(esc).join(' ')+'</p>'}
    if(err)s+=`<p class="psub">${esc(err)}</p>`;
    return s+`<p><button class="btn go2" data-wx="1">${wxOn?'Weather effects are on':'Show wind and rain on the map'}</button> <a href="https://forecast.weather.gov/MapClick.php?lat=40.8136&lon=-96.7026" target="_blank" rel="noopener">Full forecast ↗</a></p>${err?'':'<p class="psub">National Weather Service, read just now.</p>'}`};
  const WXS={title:'Weather in <i>Lincoln</i>',tabs:['Now and next'],html,click:e=>{const b=e.target.closest('[data-wx]');if(b){closeSheet();if(!wxOn)setWx(true)}}};
  openSheet(WXS,0);lastInput=performance.now();if(!hosted())return;
  await Promise.all([fetch('https://api.weather.gov/alerts/active?point=40.8136,-96.7026',{headers:{Accept:'application/geo+json'}}).then(r=>r.json()).then(j=>{al=(j.features||[]).map(q=>{const p=q.properties,t=((p.headline||'')+(p.instruction?' '+p.instruction:'')).replace(/\s+/g,' ');return {ev:p.event,until:p.ends||p.expires?clock(p.ends||p.expires):'',txt:t.length>220?t.slice(0,217)+'…':t}})}).catch(()=>{al=false;err+='Alerts could not be read just now. '}),
    fetch('https://api.weather.gov/gridpoints/OAX/56,40/forecast').then(r=>r.json()).then(j=>{fc=j.properties.periods.slice(0,5).map(p=>({name:p.name,short:p.shortForecast,t:p.temperature,day:p.isDaytime,pop:p.probabilityOfPrecipitation&&p.probabilityOfPrecipitation.value||0}))}).catch(()=>{fc=[];err+='The forecast could not be read just now. '})]);
  if(sheet===WXS)openSheet(WXS,0)}
function wxInit(){const el=$('wx');el.setAttribute('role','button');el.tabIndex=0;el.onclick=wxDetail;el.onkeydown=e=>{if(e.key==='Enter')wxDetail()};
  if(hosted()){setTimeout(()=>{loadAlerts();if(!wx)loadWeather()},1500);setInterval(()=>{if(!document.hidden&&!wxDemo){loadAlerts();if(!wxOn)loadWeather()}},180000)}
  // inside the Claude app nothing live can load, so say where the live copy is
  setTimeout(()=>{if(!wx&&(!hosted()||/claude|anthropic/i.test(location.hostname+document.referrer)))$('offl').style.display='block'},9000)}
// ---- City Hall: what is being decided now, read live from the Planning Department, and how the council works
DLG.push('City Hall');
const CASE_F=[['PROJECT_NAME','Project','s'],['SUBTYPE','Kind of request','s'],['STATUS','Where it stands','s'],['DESCRIPTION','About','s'],['APPNUM','Case number','s'],['SUBMITTAL_DATE','Filed','s','',dayStr],['PC_HEARING','Planning Commission hearing','s','',v=>v?dayStr(v):''],['NUMBER_OF_DUS','Homes proposed','n'],['NUMBER_OF_LOTS','Lots','n'],['CC_ORDINANCE_','Council ordinance','s'],['CC_RESOLUTION_','Council resolution','s']];
const isoAgo=d=>new Date(Date.now()-d*864e5).toISOString().slice(0,10);
LIVEL.push({id:'cases',t:'Decisions in the works',g:'City Hall',k:'pg',st:{h:34,c:'STATUS',pal:'auto',a:.62},note:'Requests the Planning Department is working on now: zone changes, special permits, plats, annexations and design reviews that are in review or waiting for the Planning Commission or the City Council.',src:'Lincoln and Lancaster County Planning Department, development review applications',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/Planning/DevRevAPPLICATIONS/MapServer/1',get where(){return "STATUS IN ('In Review','Planning Commission Ready','City Council Ready','County/City Ready','UDC Ready','NCEC Ready','Hold','Listed') AND SUBMITTAL_DATE >= DATE '"+isoAgo(540)+"'"},off:.00002,max:600,empty:'Nothing is listed as in the works right now.',fields:CASE_F}},
 {id:'decided',t:'Decided in the last year',g:'City Hall',k:'pg',st:{h:26,c:'SUBTYPE',pal:'auto',a:.5},note:'Zone changes, special permits, annexations, plats and street vacations filed in the last twelve months that have been approved, denied or withdrawn.',src:'Lincoln and Lancaster County Planning Department, development review applications',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/Planning/DevRevAPPLICATIONS/MapServer/1',get where(){return "STATUS IN ('Approved','Approved with Conditions','Denied','Withdrawn') AND SUBTYPE IN ('Change of Zone','Special Permit','Annexation','Preliminary Plat','Final Plat','Comp Plan Amendment','Street and Alley Vacation','Use Permit') AND SUBMITTAL_DATE >= DATE '"+isoAgo(365)+"'"},off:.00002,max:900,fields:CASE_F}},
 {id:'permits',t:'Building permits this year',g:'City Hall',k:'pt',st:{h:60,col:0xffb347,r:.8},note:'Building permits other than new houses issued so far this year, from the city\'s permit map.',src:'City of Lincoln Building and Safety, through the Planning Department permit layers',
  live:{from:'the City of Lincoln GIS server',url:CITYSRV+'/Planning/Commercial_New_Construction_Permits/MapServer/2',max:1000,fields:[['DescWork','Work','s','',v=>nice(String(v||'').trim())],['Address','Address','s','',v=>String(v||'').trim()],['PermType','Type','s'],['Issued','Issued','s','',v=>String(v||'').trim()],['CurrStatus','Status','s'],['PermNo','Permit','s']]}});
function councilCard(){councilOpen(0)}
function councilCardOld(){const L=DL.get('council'),m=[];if(L){const f=k=>fget(L,L.fields.find(q=>q.k===k)),nm=f('name'),mb=f('member'),al=f('atlarge'),seen=new Set();for(let i=0;i<L.n;i++){if(seen.has(nm(i)))continue;seen.add(nm(i));m.push(nm(i).replace('City Council ','')+': '+mb(i))}if(L.n)m.push('at large: '+al(0))}
  showCard('Lincoln City Council','Seven members: four elected by district and three by the whole city. '+(m.length?'As the city\'s own map lists them, '+m.join(' · ')+'. ':'')
  +'The council meets most Mondays at 3 p.m., and at 5:30 p.m. on the last Monday of the month, in the Council Chambers on the first floor of the County-City Building, 555 S. 10th Street. Agendas come out by 4 p.m. the Thursday before. Anyone may speak on an item at its public hearing, and there is an open microphone on the second and last Mondays. Meetings air live on LNKTV. '
  +'Turn on Decisions in the works to see what is headed to the Planning Commission and the council, on the ground where it would happen.',undefined,{label:'Decisions in the works',fn:()=>{dlSet('cases',true);dlSet('council',true,true)}},
  [{href:'https://www.lincoln.ne.gov/City/City-Council/City-Council-Public-Meeting',label:'Meeting dates ↗'},{href:'https://www.lincoln.ne.gov/City/Departments/Finance/City-Clerk/Clerk-Council',label:'Agendas and members ↗'},{href:'https://www.lincoln.ne.gov/City/Departments/Finance/City-Clerk/Clerk-Council/request-to-speak',label:'How to speak ↗'},{href:'https://lnktv.lincoln.ne.gov/',label:'Watch on LNKTV ↗'}])}

// ---- little kids running a passing drill on the grass in front of the All-American wall: a circle of five, bump to bump, with one ball.
// Part of the map, not real players. Drawn a little larger than life so they read from a distance.
const VBK={g:null,kids:[],ball:null,i:0,t0:0,lb:null};
function vbKidsInit(wx,wz){const g=new THREE.Group(),cx=wx+26,cz=wz,R=4.2,J=[0xb00d23,0xffffff,0xb00d23,0xffffff,0xb00d23],SK=[0xf1c9a5,0xc68642,0x8d5524,0xe0ac69,0xf1c9a5],HR=[0x3b2a1a,0x111111,0x2b1b10,0xd8b26a,0x6b4423];
  const mat=c=>new THREE.MeshLambertMaterial({color:c}),B=(w,h,d,c,x,y,z,p)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);p.add(m);return m};
  for(let k=0;k<5;k++){const a=k/5*6.283,kid=new THREE.Group(),body=new THREE.Group();kid.add(body);
    for(const s of[-1,1]){B(.14,.55,.16,SK[k],s*.1,.28,0,body);B(.16,.12,.24,0xf5f5f5,s*.1,.05,.04,body)}
    B(.36,.2,.22,0x1b1b1b,0,.62,0,body);B(.4,.42,.24,J[k],0,.92,0,body);B(.26,.26,.26,SK[k],0,1.28,0,body);B(.28,.1,.28,HR[k],0,1.43,-.01,body);
    const arms=new THREE.Group();arms.position.set(0,1.06,0);body.add(arms);for(const s of[-1,1])B(.1,.1,.5,SK[k],s*.09,0,.25,arms);
    kid.position.set(cx+Math.cos(a)*R,0,cz+Math.sin(a)*R);kid.rotation.y=Math.atan2(cx-kid.position.x,cz-kid.position.z);kid.scale.setScalar(1.8);g.add(kid);VBK.kids.push({kid,body,arms})}
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.13,12,10),new THREE.MeshLambertMaterial({color:0xfaf6e8}));ball.scale.setScalar(1.8);g.add(ball);VBK.ball=ball;
  g.userData.card=()=>showCard('Passing drill','A few little kids working on their passing in front of the All-American wall: platform out, bend the knees, bump it to a teammate. Part of the map, not real players. Somebody on this wall started out just like this.',-1);
  for(const c of g.children)c.userData.card=g.userData.card;scene.add(g);pickables.push(g);VBK.g=g;VBK.c=[cx,cz];VBK.lb={t:'Passing drill',sub:'',x:cx,y:0,z:cz,k:16,pri:300,near:0,far:500}}
function vbKidsStep(now){const g=VBK.g;if(!g)return;const d=Math.hypot(camera.position.x-VBK.c[0],camera.position.z-VBK.c[1]),on=d<1400;if(g.visible!==on){g.visible=on;dirty=true}if(!on)return;
  const gy=hAt(VBK.c[0],VBK.c[1]);g.position.y=gy;
  // one pass every 1.3 seconds to the kid two spots around the circle, so the ball crosses the middle
  const T=1300;if(!VBK.t0)VBK.t0=now;let e=(now-VBK.t0)/T;if(e>=1){VBK.t0=now;VBK.i=(VBK.i+2)%5;e=0}
  const A=VBK.kids[VBK.i].kid.position,Bp=VBK.kids[(VBK.i+2)%5].kid.position;VBK.ball.position.set(A.x+(Bp.x-A.x)*e,2.1+Math.sin(Math.PI*e)*5.5,A.z+(Bp.z-A.z)*e);
  VBK.kids.forEach((q,k)=>{const recv=k===(VBK.i+2)%5,send=k===VBK.i,dip=recv?Math.max(0,e-.6)/.4:send?Math.max(0,.25-e)/.25:0;q.body.position.y=-.18*dip;q.arms.rotation.x=(recv||send)?.35*dip:-.25;q.body.rotation.x=.12*dip});
  VBK.lb.y=gy+4.5;if(d<500)lifeLabels.push(VBK.lb);ambient=true}
