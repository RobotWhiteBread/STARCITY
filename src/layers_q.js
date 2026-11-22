// ---- 0.9.2: boxes that close go back to their options, a way back from close-up views, the City Council in depth, and this map for any city

// A card that is a list of options. Anything opened from it comes back to it when its box is closed, and what was switched on stays on.
function menuCard(tag,show,root){if(root)MENUS.length=0;const i=MENUS.findIndex(m=>m.tag===tag);if(i>=0)MENUS.length=i;MENUS.push({tag,show});show();cardTag=tag;if(cardLast)cardLast[5]=tag}
const deepView=()=>walk.on||!!ride||rideMode||gameOn||!!tour;
function menuTop(skip){const m=MENUS[MENUS.length-1];if(m)return m;if(SG.topic&&skip!=='i:'+SG.topic)return {tag:'i:'+SG.topic,show:()=>intentCard(SG.topic,true)};return null}
function menuShowTop(skip){const m=menuTop(skip);if(!m)return false;m.show();if(MENUS.length)cardTag=MENUS[MENUS.length-1].tag;return true}
// was: the tag of the card that just closed, if it was a list of options
function cardBack(was){if(deepView())return;if(was){const i=MENUS.findIndex(m=>m.tag===was);if(i<0)return;MENUS.length=i;if(i>0)menuShowTop();return}if(menuAt>0)menuShowTop()}
function sheetBack(){if(deepView()||sheet||$('card').style.display==='block')return;if(menuAt>0)menuShowTop()}

// ---- close-up views (the sky, walking, looking around, a bike ride) remember the map as it was, and Back to the map puts it back
const VIEW={keep:null,stay:false};
function viewKeep(){if(VIEW.keep)return;VIEW.keep={p:camera.position.clone(),t:controls.target.clone(),fov:camera.fov,near:camera.near}}
function viewBack(){const k=VIEW.keep;VIEW.keep=null;if(!k||VIEW.stay)return;fly=null;camera.position.copy(k.p);controls.target.copy(k.t);camera.fov=k.fov;camera.near=k.near;camera.updateProjectionMatrix();controls.update();shadowDirty=true;dirty=true}
// the one way out of every close-up view. stay: come up above where you are standing instead of going back
function viewExit(stay){VIEW.stay=!!stay;try{if(NSKY.on)setSky(false);if(LOOK.on)setLook(false);if(walk.on)setWalk(false)}finally{VIEW.stay=false}lastInput=performance.now();if(!stay&&menuAt>0&&$('card').style.display!=='block')menuShowTop()}

// ---- the City Council in depth: who, when, how a law is made, how to speak, and what is on its way to a vote
// Meeting dates are the city's own list (City Council Public Meeting page), read Nov 14, 2026. A trailing e marks a 5:30 p.m. meeting.
const CCD='2026-11-16 2026-11-23e 2026-12-07 2026-12-14 2026-12-21e 2027-01-11 2027-01-25e 2027-02-01 2027-02-08 2027-02-22e 2027-03-01 2027-03-08 2027-03-15 2027-03-22 2027-03-29e 2027-04-05 2027-04-12 2027-04-19 2027-04-26e 2027-05-03 2027-05-10 2027-05-17 2027-05-24e 2027-06-07 2027-06-14 2027-06-28e 2027-07-12 2027-07-19 2027-07-26e 2027-08-02 2027-08-09 2027-08-16 2027-08-23 2027-08-30e 2027-09-13 2027-09-20 2027-09-27e 2027-10-04 2027-10-18 2027-10-25e 2027-11-01 2027-11-08 2027-11-22e 2027-12-06 2027-12-13 2027-12-20e'.split(' ').map(s=>({ymd:+s.slice(0,10).replace(/-/g,''),eve:s.endsWith('e')}));
const CC={tab:0,vid:null,vidAt:0,vidErr:false,vbusy:false,pipe:null,pipeAt:0,pipeErr:'',pbusy:false,ready:[],over:false};
const CCU={meet:'https://www.lincoln.ne.gov/City/City-Council/City-Council-Public-Meeting',members:'https://www.lincoln.ne.gov/City/City-Council/Council-Members',faq:'https://www.lincoln.ne.gov/City/City-Council/FAQ',agenda:'https://www.lincoln.ne.gov/City/City-Council/Minutes-Agendas',comment:'https://www.lincoln.ne.gov/City/City-Council/Comment',speak:'https://www.lincoln.ne.gov/City/Departments/Finance/City-Clerk/Clerk-Council/request-to-speak',tv:'https://lnktv.lincoln.ne.gov/CablecastPublicSite/gallery/5?channel=1',yt:'https://www.youtube.com/playlist?list=PLj13AfdUD7Y9k1KQ6ABREcSPXh5p4Ma4y',site:'https://robotwhitebread.github.io/STARCITY/'};
const ext=(href,label)=>`<a href="${href}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
const ymdMs=y=>Date.UTC(Math.floor(y/10000),Math.floor(y/100)%100-1,y%100);
function ccNext(n){const now=lincolnNow(),out=[];for(const m of CCD){if(m.ymd<now.ymd)continue;if(m.ymd===now.ymd&&now.sec>(m.eve?19.5:17)*3600)continue;out.push(m);if(out.length>=n)break}return out}
const ccTime=m=>m.eve?'5:30 p.m.':'3 p.m.';
function ccDay(m){const now=lincolnNow(),y=Math.floor(m.ymd/10000),d=Math.round((ymdMs(m.ymd)-ymdMs(now.ymd))/864e5);return (d===0?'Today, ':d===1?'Tomorrow, ':'')+'Mon, '+MON3[Math.floor(m.ymd/100)%100-1]+' '+(m.ymd%100)+(y!==Math.floor(now.ymd/10000)?', '+y:'')}
// the chip for the top row: only when a meeting on the city's list is today or within two days
function ccChip(){const m=ccNext(1)[0];if(!m)return null;const d=Math.round((ymdMs(m.ymd)-ymdMs(lincolnNow().ymd))/864e5);if(d>2)return null;return 'City Council meets '+(d===0?'today':d===1?'tomorrow':'Monday')+' at '+ccTime(m)}
function ccWho(){const L=DL.get('council'),D=[];let al='';try{if(L&&L.n){const f=k=>fget(L,L.fields.find(q=>q.k===k)),nm=f('name'),mb=f('member'),a=f('atlarge'),seen=new Set();for(let i=0;i<L.n;i++){const d=+String(nm(i)).replace(/\D/g,'');if(!d||seen.has(d))continue;seen.add(d);D.push([d,mb(i)])}al=a(0)||''}}catch(e){}D.sort((p,q)=>p[0]-q[0]);return {D,al:String(al).split(',').map(s=>s.trim()).filter(Boolean),asof:L&&L.def&&L.def.asof||''}}
const CCQ={1:'Northeast',2:'Southeast',3:'Southwest',4:'Northwest'};
// recordings of past meetings, read live from the city's own TV channel
async function ccVideos(){if(!hosted()||CC.vbusy||(CC.vid&&Date.now()-CC.vidAt<6e5))return;CC.vbusy=true;
  try{const j=await (await fetch('https://lnktv.lincoln.ne.gov/CablecastAPI/v1/shows?search='+encodeURIComponent('Lincoln City Council Meeting')+'&page_size=12&include=vod')).json(),len=new Map((j.vods||[]).map(v=>[v.id,v.length]));
    CC.vid=(j.shows||[]).filter(s=>/^Lincoln City Council Meeting/i.test(s.title||'')&&s.eventDate).map(s=>({id:s.id,d:String(s.eventDate).slice(0,10),len:len.get((s.vods||[])[0])||0})).sort((a,b)=>a.d<b.d?1:-1).slice(0,6);CC.vidAt=Date.now();CC.vidErr=false}
  catch(e){CC.vidErr=true}CC.vbusy=false;const el=$('ccvid');if(el)el.innerHTML=ccVidHTML()}
function ccVidHTML(){if(!hosted())return `<p>Recordings are listed live on the website copy of the map. ${ext(CCU.tv,'All recordings on LNKTV')}</p>`;if(CC.vidErr)return `<p>The city's TV site could not be reached just now. ${ext(CCU.tv,'All recordings on LNKTV')}</p>`;if(!CC.vid)return '<p>Asking LNKTV for the latest recordings…</p>';
  if(!CC.vid.length)return `<p>No recordings were listed. ${ext(CCU.tv,'LNKTV')}</p>`;
  return CC.vid.map(v=>{const m=/^(\d{4})-(\d\d)-(\d\d)/.exec(v.d),h=Math.floor(v.len/3600),mi=Math.round(v.len%3600/60);return `<a class="btn go" href="https://lnktv.lincoln.ne.gov/CablecastPublicSite/show/${v.id}?channel=1" target="_blank" rel="noopener noreferrer">Meeting of ${MON3[+m[2]-1]} ${+m[3]}, ${m[1]} ↗<small>${v.len?'Video: '+(h?h+' h ':'')+mi+' min, with the agenda beside it':'Video and agenda'} · read live from LNKTV just now</small></a>`}).join('')}
// where every open planning request stands, read live from the Planning Department. One case can cover several pieces of ground, so cases are counted once.
const CCST=[['In review',['In Review','Hold','Listed']],['Ready for a design board',['UDC Ready','NCEC Ready']],['Ready for the Planning Commission',['Planning Commission Ready']],['Ready for the City Council or County Board',['City Council Ready','County/City Ready']],['Decided',['Approved','Approved with Conditions','Denied','Withdrawn']]];
async function ccPipe(force){if(!hosted()){CC.pipeErr='off';return}if(CC.pbusy||(!force&&CC.pipe&&Date.now()-CC.pipeAt<3e5))return;CC.pbusy=true;CC.pipeErr='';
  try{const base=CITYSRV+'/Planning/DevRevAPPLICATIONS/MapServer/1/query?',w="SUBMITTAL_DATE >= DATE '"+isoAgo(540)+"'",get=async u=>{const r=await fetch(u);if(!r.ok)throw new Error('http');const j=await r.json();if(j.error||!j.features)throw new Error('server');return j};
    const a=await get(base+'where='+encodeURIComponent(w)+'&outFields='+encodeURIComponent('APPNUM,STATUS')+'&returnGeometry=false&resultRecordCount=4000&f=json'),seen=new Set(),by=new Map();
    for(const f of a.features){const q=f.attributes,s=String(q.STATUS||'Not set').trim(),k=(q.APPNUM||Math.random())+'|'+s;if(seen.has(k))continue;seen.add(k);by.set(s,(by.get(s)||0)+1)}
    const b=await get(base+'where='+encodeURIComponent("STATUS IN ('City Council Ready','County/City Ready','Planning Commission Ready','UDC Ready','NCEC Ready') AND "+w)+'&outFields='+encodeURIComponent('PROJECT_NAME,SUBTYPE,STATUS,APPNUM,PC_HEARING,CC_ORDINANCE_,CC_RESOLUTION_,DESCRIPTION,SUBMITTAL_DATE')+'&returnGeometry=true&outSR=4326&geometryPrecision=5&maxAllowableOffset=0.0005&resultRecordCount=400&f=json'),items=new Map();
    for(const f of b.features){const q=f.attributes,id=q.APPNUM||q.PROJECT_NAME;let it=items.get(id);if(!it){it={a:Object.assign({},q),x0:1e9,x1:-1e9,y0:1e9,y1:-1e9};items.set(id,it)}if(!it.a.SUBTYPE&&q.SUBTYPE)it.a.SUBTYPE=q.SUBTYPE;for(const r of (f.geometry&&f.geometry.rings)||[])for(const p of r){it.x0=Math.min(it.x0,p[0]);it.x1=Math.max(it.x1,p[0]);it.y0=Math.min(it.y0,p[1]);it.y1=Math.max(it.y1,p[1])}}
    CC.pipe=by;CC.ready=[...items.values()].sort((p,q)=>(p.a.PC_HEARING||0)-(q.a.PC_HEARING||0));CC.over=!!a.exceededTransferLimit;CC.pipeAt=Date.now()}
  catch(e){CC.pipeErr='fail'}CC.pbusy=false;const el=$('ccpipe');if(el)el.innerHTML=ccPipeHTML()}
function ccPipeHTML(){if(CC.pipeErr==='off')return `<p>This tab reads the Planning Department's list live, which works on the website copy of the map. ${ext(CCU.site,'Open the website copy')}</p>`;
  if(CC.pipeErr)return '<p>The city\'s server could not be reached just now.</p><p><button class="btn" data-cc="retry">Try again</button></p>';if(!CC.pipe)return '<p>Reading the Planning Department\'s list from the city…</p>';
  const n=k=>CC.pipe.get(k)||0,sum=a=>a.reduce((s,k)=>s+n(k),0),used=new Set(CCST.flatMap(q=>q[1])),rest=[...CC.pipe].filter(([k])=>!used.has(k)).sort((a,b)=>b[1]-a[1]),t=new Date(CC.pipeAt).toLocaleTimeString('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'});
  let h='<div class="flow">'+CCST.map((q,i)=>`<button class="btn" data-cc="st${i}"><b>${sum(q[1])}</b>${q[0]}</button>`).join('<i>›</i>')+'</div>'
    +`<p class="psub">Cases filed in the last 18 months, counted once each, read live at ${t}. Decided: ${n('Approved')+n('Approved with Conditions')} approved, ${n('Denied')} denied, ${n('Withdrawn')} withdrawn.${rest.length?' Other labels the department uses: '+rest.map(([k,v])=>esc(k)+' '+v).join(', ')+'.':''}${CC.over?' The server cut the list short, so the counts are low.':''}</p>`;
  const list=(title,sts,empty)=>{const it=CC.ready.map((q,i)=>[q,i]).filter(([q])=>sts.includes(String(q.a.STATUS).trim()));return `<h4>${title} (${it.length})</h4>`+(it.length?it.map(([q,i])=>{const a=q.a;return `<button class="btn go" data-cc="it${i}">${esc(a.PROJECT_NAME||a.APPNUM||'Unnamed request')}<small>${esc(a.SUBTYPE||'Request')}${a.APPNUM?' · case '+esc(a.APPNUM):''}${a.PC_HEARING?' · Planning Commission '+dayStr(a.PC_HEARING):''}${a.CC_ORDINANCE_?' · ordinance '+esc(a.CC_ORDINANCE_):''}${a.CC_RESOLUTION_?' · resolution '+esc(a.CC_RESOLUTION_):''}</small></button>`}).join(''):`<p>${empty}</p>`)};
  h+=list('Ready for the City Council or County Board',CCST[3][1],'Nothing is listed at this stage right now.')+list('Ready for the Planning Commission',CCST[2][1],'Nothing is listed at this stage right now.')+list('Ready for a design board',CCST[1][1],'Nothing is listed at this stage right now.');
  return h+'<p><button class="btn go2" data-cc="st0">Show every open request on the map</button></p><p class="psub">Source: Lincoln and Lancaster County Planning Department, development review applications. Only planning and zoning requests are here. Contracts, the budget and the rest of the council\'s business are on its agenda.</p>'}
const step=(n,t,d)=>`<div class="step"><b class="n">${n}</b><div><p><b>${t}</b></p><p>${d}</p></div></div>`;
function ccHTML(tab){CC.tab=tab;
  if(tab===0){const W=ccWho(),nx=ccNext(1)[0];
    return (nx?`<p><b>Next meeting: ${ccDay(nx)} at ${ccTime(nx)}</b>, Council Chambers, County-City Building, 555 S. 10th Street.</p>`:'')
    +'<h4>Seven members</h4><p>Four are elected by district, one for each quarter of the city. Three are elected by the whole city. So four of the seven answer to every resident: your district member and the three at large.</p>'
    +(W.D.length?W.D.map(([d,m])=>`<button class="btn go" data-cc="lay">District ${d} · ${CCQ[d]||''}<small>${esc(m||'See the city\'s list')}</small></button>`).join('')+(W.al.length?`<button class="btn go" data-cc="lay">At large, elected citywide<small>${W.al.map(esc).join(' · ')}</small></button>`:''):'<p>The district layer did not load with this copy of the map.</p>')
    +`<p class="psub">Names as the city's own district map lists them${W.asof?', saved with this map on '+esc(W.asof):''}. Chair: Brodey Weber. Vice chair: Tom Duden, as the city's council page listed them on Nov 14, 2026. ${ext(CCU.members,'The city\'s member pages')}</p>`
    +'<button class="btn go2" data-cc="spot">Tap a spot to see every district it is in</button><button class="btn go2" data-cc="lay">Show the four districts on the map</button>'
    +'<h4>Terms, pay and the mayor</h4><ul><li>A term is four years. The city lists council pay at $24,000 a year.</li><li>District seats and the mayor are elected together: last in May 2023, next in spring 2027.</li><li>At-large seats were last elected in May 2025 and are next elected in 2029.</li><li>The mayor, Leirion Gaylor Baird, first elected in 2019, can veto what the council passes. Five of the seven members can override a veto.</li></ul>'
    +'<h4>What voters changed on Nov 3, 2026</h4><p>As reported after the election, and subject to the county\'s certified count:</p><ul><li>City elections move to even years, alongside state elections, starting in 2030. The mayor and the district seats are elected in 2027 and again in 2030. At-large seats are elected in 2029 and again in 2032.</li><li>Council members are limited to two four-year terms in a row, counting terms that begin in 2027 or later.</li><li>A proposal to let people who live within three miles outside the city limits vote in city elections did not pass.</li></ul>'
    +`<p class="psub">Sources: City of Lincoln council pages and FAQ. Election changes: ${ext('https://nebraskapublicmedia.org/en/news/news-articles/later-election-nights-could-become-the-norm-in-lincoln-after-voters-elect-to-combine-city-and-state-elections/','Nebraska Public Media')}, ${ext('https://nebraskaexaminer.com/2026/11/05/lincolnites-favor-changing-timing-of-city-elections-limiting-terms-of-city-council-members/','Nebraska Examiner')}, ${ext('https://klin.com/2026/11/04/election-2026-lincoln-voters-back-volleyball-complex-and-charter-changes-as-nebraska-republicans-lead-statewide-races/','KLIN')}.</p>`}
  if(tab===1){const nx=ccNext(7);setTimeout(ccVideos,0);
    return '<h4>Next meetings</h4>'+(nx.length?'<table>'+nx.map(m=>`<tr><td><b>${ccDay(m)}</b></td><td>${ccTime(m)}${m.eve?' · the evening meeting':''}</td></tr>`).join('')+'</table>':'<p>The dates saved with this map have run out.</p>')
    +`<p class="psub">From the city's own list of meeting dates, read Nov 14, 2026. Most Mondays at 3 p.m. The last Monday of the month starts at 5:30 p.m. so there is one evening meeting. No meeting in a week with a Monday holiday. Dates can change: ${ext(CCU.meet,'check the city\'s list')} before you go.</p>`
    +'<h4>Where</h4><p>Council Chambers, Room 112, first floor of the County-City Building, 555 S. 10th Street.</p><button class="btn go2" data-cc="fly">Fly to the County-City Building</button>'
    +'<p class="psub">Parking, as the city posted in November 2026: the public lot north of the building is closed for construction. Parking is validated for the Carriage Park garage, 1128 L Street, and the Center Park garage, 1120 N Street.</p>'
    +`<h4>Agendas</h4><p>Posted on the city's site late in the week before each meeting. One city page says by 4 p.m. Thursday, another says Friday. ${ext(CCU.agenda,'Agendas and minutes')}</p>`
    +`<h4>Watch</h4><p>Live on LNKTV City (Allo channel 2, Spectrum channel 1300) and on YouTube. ${ext(CCU.yt,'Past meetings on YouTube')}</p><div id="ccvid">${ccVidHTML()}</div>`}
  if(tab===2)return '<h4>An ordinance is a city law. It takes three Mondays.</h4>'
    +step(1,'First reading','The bill is introduced and its title is read. This is the public\'s notice. No testimony yet.')
    +step(2,'Second reading: the public hearing','The following Monday. Anyone may speak for up to five minutes.')
    +step(3,'Third reading: the vote','The Monday after that. The council debates, can amend, and votes.')
    +step(4,'The mayor','Signs it, or vetoes it. Five of the seven members can override a veto.')
    +'<p class="psub">State law requires the three readings on three different days. The council can waive that by a two-thirds vote, but never for an annexation or for redrawing its own districts (Nebraska Revised Statute 15-404).</p>'
    +'<h4>A resolution is a decision</h4><p>A contract, an appointment, a permit, a plan. It is on the agenda twice. The first time is notice. The second time it gets its public hearing and its vote on the same day. When a resolution travels with an ordinance, the two are voted on together.</p>'
    +'<h4>The consent agenda</h4><p>Routine items, such as reports, appointments and setting hearing dates, are heard together at the start of the meeting and voted on together. Anyone may speak on one of them then.</p>'
    +'<h4>Where a bill comes from</h4><p>A city department or a council member asks for it, and the City Attorney\'s office drafts it. The request reaches the City Clerk by the Friday ten days before the meeting where it will be introduced. The Clerk gives it a number: 26-123 would be an ordinance, 26R-123 a resolution.</p>'
    +'<h4>The numbers</h4><ul><li>7 members. 4 is a majority.</li><li>5 votes override the mayor\'s veto.</li><li>Anything that spends money needs a majority of all seven members, not only of those in the room (state law).</li></ul>'
    +'<h4>What the council decides</h4><p>City laws and the city code. The two-year budget, the tax levy, fees and rates. Zoning and land use. Redevelopment agreements and bonds. Appointments to boards and commissions. Liquor license recommendations to the state. Claims against the city. What goes to voters on the ballot. It can also look into the work of any city department.</p>'
    +'<h4>A zone change, start to finish</h4><p>An owner applies. Planning staff review it and write a report. The Planning Commission holds its own public hearing and makes a recommendation. Then it goes to the council as an ordinance: three readings, a hearing, a vote.</p><button class="btn go2" data-cc="tab4">See where every open request stands today</button>'
    +'<h4>The budget</h4><p>The city budgets two years at a time. The mayor proposes it and the council amends and adopts it. In 2026 the council took up eight amendments to the mayor\'s proposed 2026-28 budget on July 13 and approved its final changes on August 17.</p>'
    +`<p class="psub">Sources: ${ext(CCU.faq,'City Council FAQ')}, ${ext(CCU.speak,'the City Clerk\'s guide to speaking')}, ${ext('https://law.justia.com/codes/nebraska/chapter-15/statute-15-404/','Nebraska Revised Statute 15-404')}, and the city\'s 2026-28 budget documents.</p>`;
  if(tab===3)return '<h4>At the meeting</h4>'
    +step(1,'Find your item','Ordinances take testimony at second reading. Resolutions and the consent agenda take it the day they are voted on.')
    +step(2,'Sign up','At the table in the lobby outside the Council Chambers.')
    +step(3,'When you are called','Give your name and address, and say whether you support, oppose or are neutral. The address can be waived for your safety.')
    +step(4,'You have five minutes','Green light: go. Yellow: one minute left. Red: stop.')
    +'<p>Speakers are called in this order: supporters, opponents, neutral. Bring ten copies of anything you hand out. Signs are not allowed in the chambers.</p>'
    +'<h4>Open microphone</h4><p>At the end of the meeting on the second and last Mondays of the month, residents may raise anything that is not on the agenda.</p>'
    +`<h4>In writing</h4><p>Use the city's comment form, write to the council office at councilpacket@lincoln.ne.gov, or leave a message at 402-441-7515. Everything said or sent to the council becomes a public record.</p><p>${ext(CCU.comment,'Submit a comment')} · ${ext(CCU.members,'Email your member')}</p>`
    +'<h4>If you need an accommodation</h4><p>Assistive listening devices are in the chambers. For anything else, ask at least a week ahead: Lincoln Commission on Human Rights, 402-441-7624.</p>'
    +`<p class="psub">Source: ${ext(CCU.speak,'the City Clerk\'s guide to speaking at a meeting')} and the ${ext(CCU.faq,'City Council FAQ')}, read Nov 14, 2026.</p>`;
  setTimeout(()=>ccPipe(false),0);return '<p>Requests the Planning Department is working on now, and how far each has come. Tap a stage to see those requests on the ground where they would happen. Tap a request to fly to it.</p><div id="ccpipe">'+ccPipeHTML()+'</div>'}
const COUNCILS={title:'City <i>Council</i>',tabs:['Who','Meetings','How a law is made','Speak up','In the works'],html:ccHTML,click:e=>{const b=e.target.closest('[data-cc]');if(!b)return;const v=b.dataset.cc;lastInput=performance.now();
  if(v==='retry'){ccPipe(true);return}if(v==='tab4'){openSheet(COUNCILS,4);return}closeSheet();
  if(v==='spot'){civArm();return}if(v==='lay'){dlSet('council',true);return}
  if(v==='fly'){const x=(-96.70773-H.lon0)*KXm,z=-(40.80887-H.lat0)*KYm,nx=ccNext(1)[0];flyTo(camTo(x,z,420,200,30),2200);showCard('County-City Building','555 S. 10th Street. The City Council meets in the Council Chambers, Room 112, on the first floor.'+(nx?' Next meeting: '+ccDay(nx)+' at '+ccTime(nx)+'.':''),undefined,{label:'Back to the council',fn:()=>openSheet(COUNCILS,1)},[{href:CCU.meet,label:'Meeting dates ↗'}]);return}
  if(v.startsWith('st')){dlSet('cases',true);return}
  if(v.startsWith('it')){const q=CC.ready[+v.slice(2)];if(!q)return;const a=q.a,x=((q.x0+q.x1)/2-H.lon0)*KXm,z=-((q.y0+q.y1)/2-H.lat0)*KYm,span=Math.max((q.x1-q.x0)*KXm,(q.y1-q.y0)*KYm,60);dlSet('cases',true,true);
    if(Math.abs(x)<16150&&Math.abs(z)<16150)flyTo(camTo(x,z,Math.min(6000,Math.max(520,span*2.6)),200,44),2200);
    showCard(a.PROJECT_NAME||a.APPNUM||'Planning request',[(a.SUBTYPE||'Request')+(a.APPNUM?', case '+a.APPNUM:''),'Where it stands: '+String(a.STATUS).trim(),a.PC_HEARING?'Planning Commission hearing: '+dayStr(a.PC_HEARING):'',a.CC_ORDINANCE_?'Council ordinance '+a.CC_ORDINANCE_:'',a.CC_RESOLUTION_?'Council resolution '+a.CC_RESOLUTION_:'',a.SUBMITTAL_DATE?'Filed '+dayStr(a.SUBMITTAL_DATE):'',a.DESCRIPTION?String(a.DESCRIPTION).trim():'',Math.abs(x)<16150&&Math.abs(z)<16150?'':'This one lies outside the area the map covers.','Read live from the Planning Department'].filter(Boolean).join('. ')+'.',undefined,{label:'Back to the list',fn:()=>openSheet(COUNCILS,4)},[{href:CCU.agenda,label:'Council agendas ↗'}])}}};
function councilOpen(tab){openSheet(COUNCILS,tab||0)}
// ---- the University of Nebraska Board of Regents. Dates are the board's own meeting schedule and notices, read Nov 21, 2026.
// [yyyymmdd, time, where, kind, what]. Agendas come out about a week before a regular meeting.
const RGD=[[20260109,'3 p.m.','Varner Hall','special',''],[20260206,'9 a.m.','Varner Hall','regular',''],[20260424,'9 a.m.','Varner Hall','regular','moved from April 10'],[20260529,'9 a.m.','East Campus Union','emergency',''],
 [20260618,'9 a.m.','Varner Hall','regular','the 2026-27 budget, with a tuition increase'],[20260629,'','Varner Hall','special','governance of Nebraska Medicine'],[20260813,'9 a.m.','Varner Hall','regular',''],[20260901,'1 p.m.','Varner Hall','special',''],
 [20261009,'','UNK Regional Engagement Center, Kearney','regular',''],[20261120,'10:30 a.m.','Varner Hall','emergency','a memorandum of understanding with the Nebraska Medicine board to speed up Project Health, the planned UNMC teaching hospital in Omaha'],[20261204,'9 a.m.','Varner Hall','regular','']];
const RGU={sched:'https://nebraska.edu/regents/meeting-schedule',agenda:'https://nebraska.edu/regents/agendas-minutes/',dec4:'https://nebraska.edu/news-and-events/events/2026/12/board-of-regents-meeting-december-4',live:'https://nebraska.edu'};
const rgDay=y=>{const d=new Date(Date.UTC(Math.floor(y/10000),Math.floor(y/100)%100-1,y%100));return d.toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric',year:'numeric'})};
let rgVH;function rgVarner(){if(rgVH!==undefined)return rgVH;rgVH=null;for(let b=0;b<S.b_info.length;b++)if(H.infos[S.b_info[b]]==='Varner Hall'){rgVH=[LM.bc[2*b],LM.bc[2*b+1]];break}return rgVH}
function rgNext(){const t=lincolnNow().ymd;return RGD.find(m=>m[0]>=t)||null}
function rgChip(){const m=rgNext();if(!m)return null;const d=Math.round((ymdMs(m[0])-ymdMs(lincolnNow().ymd))/864e5);if(d>2)return null;return 'NU Regents meet '+(d===0?'today':d===1?'tomorrow':rgDay(m[0]).split(',')[0])+(m[1]?' at '+m[1]:'')}
function regentsCard(){const t=lincolnNow().ymd,nx=rgNext(),past=RGD.filter(m=>m[0]<t).slice(-3).reverse();
  const line=m=>rgDay(m[0])+(m[1]?', '+m[1]:'')+', '+m[2]+(m[3]!=='regular'?' ('+m[3]+' meeting)':'')+(m[4]?': '+m[4]:'');
  const body='The Board of Regents governs the University of Nebraska: UNL, UNO, UNK and UNMC. Eight voting regents are elected by district to six-year terms, and four student regents, one from each campus, sit without a vote. They pick the university president and approve the budget and tuition. As of the August 13, 2026 minutes the voting regents are Paul Kenney (chair), Jim Scheer (vice chair), Timothy Clare, Joel Makovicka, Robert Schafer, Jack Stark, Barbara Weitz and Kathy Wilmot. Newly elected regents take their seats in January. '
   +(nx?'Next meeting: '+line(nx)+'. ':'')+'Meetings are open to the public and streamed live at nebraska.edu. Most are in the board room at Varner Hall, 3835 Holdrege Street, on the edge of East Campus. The agenda for a regular meeting is posted about a week before. Anyone may speak to the board on an item on the agenda, and there is a public comment time for other subjects. To comment remotely, contact the Office of the Corporation Secretary ahead of time (402-472-3906). '
   +(past.length?'Recent meetings: '+past.map(line).join(' · ')+'. ':'')+'Source: the board\'s meeting schedule, agendas and minutes at nebraska.edu, read November 21, 2026. Dates can change, so check the board\'s page before you go.';
  const vh=rgVarner();
  showCard('University of Nebraska Board of Regents',body,undefined,vh?{label:'Show Varner Hall',fn:()=>{flyTo(camTo(vh[0],vh[1],420,200,30),2200)}}:undefined,
   [{href:RGU.agenda,label:'Agendas and minutes ↗'},{href:RGU.sched,label:'Meeting schedule ↗'},{href:RGU.live,label:'Watch live ↗'}])}

// ---- this map for any city: a link that builds a place from open map data, and the code to copy
const FORKU='https://robotwhitebread.github.io/STARCITY/anycity/';
// a plain count of how many times the map has been opened, from hits.sh, which keeps no account and asks for nothing
const COUNTSVG='https://hits.sh/robotwhitebread.github.io/STARCITY.svg?style=flat-square&label=times%20opened&color=e9b949&labelColor=1b1f26';
const COUNTH='<p><img src="'+COUNTSVG+'" alt="How many times this map has been opened" height="20" style="vertical-align:-4px"> &nbsp;<a href="'+FORKU+'" target="_blank" rel="noopener noreferrer">See your own city \u2197</a></p>'
  +'<p class="psub">That count is the one thing this map asks of anyone else: a single image from hits.sh each time the page opens, with no cookie and no account. Nothing else about you is collected, sent or stored.</p>';
// counted once when the page opens, so the number means what it says
function countOpen(){if(!hosted())return;const i=new Image();i.referrerPolicy='no-referrer';i.src=COUNTSVG+'&t='+Date.now()}
const FORKCODE=`# STARCITY for any city. Free to copy (MIT license).

# 1. Just look. Put a place, a ZIP code or a GPS point in the link.
${FORKU}?place=Omaha, Nebraska
${FORKU}?zip=68102
${FORKU}?lat=41.2565&lon=-95.9345&km=1.5

# 2. Make it yours. Run it on your own computer:
git clone https://github.com/RobotWhiteBread/STARCITY.git
cd STARCITY
python3 -m http.server 8000
# then open http://localhost:8000/anycity/?place=Your City, State

# To put it online, fork the repo on GitHub, open Settings, then Pages,
# and publish the main branch. Your link becomes
# https://YOUR-NAME.github.io/STARCITY/anycity/?place=Your City, State

# 3. Go deeper, the way Lincoln does. Add your city's own public data:
#   community/     drop in GeoJSON layers and list them in index.json
#   DATA_PLAN.md   the kinds of public sources to look for, and where
#   src/           the whole Lincoln pipeline, as a worked example`;
function forkHTML(tab){
  if(tab===0)return COUNTH+'<p>The Lincoln map is built from Lincoln\'s own public records. The same idea works anywhere there is open map data. Type a place, a ZIP code or a GPS point, and a 3D map of it is built in your browser from OpenStreetMap, the free map of the world that volunteers keep.</p>'
    +'<div class="row"><input id="fkq" type="text" placeholder="City, address or ZIP code" aria-label="City, address or ZIP code" autocomplete="off"><button class="btn" data-fk="go">Build it ↗</button></div>'
    +`<div class="row"><a class="btn" href="${FORKU}?gps=1" target="_blank" rel="noopener noreferrer">Use my location ↗</a><a class="btn" href="${FORKU}?place=Omaha%2C%20Nebraska" target="_blank" rel="noopener noreferrer">Omaha ↗</a><a class="btn" href="${FORKU}?place=Chicago%20Loop" target="_blank" rel="noopener noreferrer">Chicago ↗</a><a class="btn" href="${FORKU}?place=Notre-Dame%20de%20Paris" target="_blank" rel="noopener noreferrer">Paris ↗</a></div>`
    +'<p class="psub">It opens in a new tab. Buildings, streets, parks, water and trees come from OpenStreetMap, so the picture is as complete as local mappers have made it. Where a building\'s height is not mapped, the page estimates it and says so on the building\'s card. Lincoln\'s own layers, such as values, buses, votes and birds, are not part of it: those come from Lincoln\'s records, and every city has its own to add.</p>';
  if(tab===1)return '<p>Three ways to use it, from a link to your own copy. Everything here is free to copy and change.</p><p><button class="btn" data-fk="copy">Copy the code</button> '+ext('https://github.com/RobotWhiteBread/STARCITY','Open the repository')+`</p><pre id="fkcode">${esc(FORKCODE)}</pre>`;
  return '<h4>What makes the Lincoln map more than buildings</h4><p>Public records, joined to the ground. Most cities and counties publish the same kinds of things:</p><ul><li>Parcels and assessed values, from the county assessor.</li><li>Bus timetables, in the GTFS format transit agencies give to trip planners.</li><li>Trees, trails, parks and public art, from the parks department.</li><li>Traffic counts, crashes and road closures, from public works or the state.</li><li>Precinct results and districts, from the election office.</li><li>Zoning and what is headed to a vote, from the planning department.</li><li>Weather, river gauges, birds and the sky, from national sources that cover everywhere.</li></ul>'
    +`<p>${ext('https://github.com/RobotWhiteBread/STARCITY/blob/main/DATA_PLAN.md','The data plan')} lists every source behind the Lincoln map and what each one took. ${ext('https://github.com/RobotWhiteBread/STARCITY/blob/main/CONTRIBUTING.md','The contributing guide')} is the open invitation: a city office, a university, a business or a neighbor can add a layer.</p><p class="psub">Two rules worth keeping if you build your own: say where every number came from, and never publish people\'s names where a place will do.</p>`}
const FORKS={title:'Make this for <i>your city</i>',tabs:['Try a place','Copy the code','Go deeper'],html:forkHTML,click:e=>{const b=e.target.closest('[data-fk]');if(!b)return;const v=b.dataset.fk;
  if(v==='go'){const q=($('fkq').value||'').trim();if(!q){$('fkq').focus();return}const a=document.createElement('a');a.href=FORKU+(/^\d{5}$/.test(q)?'?zip='+q:'?place='+encodeURIComponent(q));a.target='_blank';a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove();return}
  if(v==='copy'){const done=ok=>{b.textContent=ok?'Copied':'Select the text below and copy it'};try{navigator.clipboard.writeText(FORKCODE).then(()=>done(true),()=>done(false))}catch(err){done(false)}}}};
addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='fkq'){const b=document.querySelector('[data-fk="go"]');if(b)b.click()}});

// ---- data heights that fit the screen: when a layer is switched on, the tallest bar is sized against the view you are in
function hsMax(L){
  if(L.hmax!=null)return L.hmax;
  let m=0;
  const look=o=>{const g=o.geometry;if(!g||!g.attributes)return;const A=g.attributes;
    if(A.aH){const a=A.aH.array;for(let i=0;i<a.length;i++)if(a[i]>m)m=a[i];return}
    if(A.aS&&A.aS.itemSize===2){const a=A.aS.array;for(let i=0;i<a.length;i+=2)if(a[i]>m)m=a[i];return}
    if(A.a&&A.a.itemSize>=2){const a=A.a.array,s=A.a.itemSize;for(let i=0;i<a.length;i+=s){const v=a[i]*a[i+1];if(v>m)m=v}}};
  if(L.obj)L.obj.traverse(o=>{if(o.isMesh||o.isLine||o.isPoints||o.isInstancedMesh)look(o)});
  L.hmax=m||0;return L.hmax}
// the same zoom factor dlFrame uses, so the fit holds the moment it is applied
function hsZoom(L,d){const k=L.def.k,num=typeof L.def.st.h!=='number';
  return L.flat?Math.min(6,Math.max(.6,d/1500)):Math.min(5.5,Math.max(.08,d/(k==='pt'&&!num?2500:k==='ln'&&!num?3000:3600)))}
function hsFit(L){
  if(dlHSuser||!L||!L.obj)return;
  const h=hsMax(L);if(!(h>0))return;
  const d=camera.position.distanceTo(controls.target),z=hsZoom(L,d);
  if(!(z>0))return;
  // the tallest should stand about a fifth of the way across the view, and never look like a wall or a stain
  const want=Math.max(40,Math.min(2600,d*.21))/(h*z);
  const s=Math.max(.2,Math.min(3.2,want));
  if(Math.abs(s-dlHS)<.02)return;
  dlHS=s;dirty=true;
  const sl=document.querySelector('#dlg input[data-s="h"]');if(sl)sl.value=Math.round(dlHS*100)}

// ---- Watch Lincoln grow: every building with a year on record appears in that year. The year is the county assessor's, which covers homes.
const GROW={on:false,play:false,y:1867,cum:null,n:0,sh:null};
function growInit(){if(GROW.cum)return;const cum=new Uint32Array(2027-1860),yr=S.b_yr;let n=0;for(let b=0;b<yr.length;b++){const y=yr[b];if(y>1800){n++;cum[Math.max(0,Math.min(2026,y)-1860)]++}}for(let i=1;i<cum.length;i++)cum[i]+=cum[i-1];GROW.cum=cum;GROW.n=n;
  for(const m of pickables){if(!(m.userData&&m.userData.ids&&m.geometry&&m.geometry.index&&m.userData.start))continue;const g=m.geometry,cnt=g.attributes.position.count,idx=g.index.array,st=m.userData.start,ids=m.userData.ids,a=new Float32Array(cnt);
    for(let k=0;k<st.length;k++){const e=k+1<st.length?st[k+1]:idx.length,y=yr[ids[k]]>1800?yr[ids[k]]:0;for(let i=st[k];i<e;i++)a[idx[i]]=y}g.setAttribute('aYr',new THREE.BufferAttribute(a,1))}}
function growSet(y){GROW.y=y;U.uYear.value=y;const yi=Math.round(y);$('growR').value=yi;$('growL').textContent=yi+' · '+GROW.cum[Math.max(0,yi-1860)].toLocaleString('en-US')+' homes';dirty=true}
function growOpen(){growInit();GROW.on=true;GROW.sh=shadowsOn;shadowsOn=false;shadowDirty=true;$('grow').style.display='flex';$('sun').style.display='none';growSet(1867);GROW.play=true;$('growP').textContent='❚❚';
  showCard('Watch Lincoln grow','Lincoln was named the capital in 1867. Press play or drag the year. Each home appears in the year the county assessor says it was built, and glows gold while it is new. Grey buildings have no year on record: that is most businesses, schools, churches and garages, so they stay up the whole time. '+GROW.n.toLocaleString('en-US')+' of the '+S.b_yr.length.toLocaleString('en-US')+' buildings on the map have a year. A house that replaced an older one shows only its own year, so the early city looks emptier than it was. Streets and trees are today\'s. Source: Lancaster County Assessor, year built.',undefined,{label:'Leave this view',fn:growClose})}
function growClose(){if(!GROW.on)return;GROW.on=false;GROW.play=false;U.uYear.value=0;shadowsOn=GROW.sh;shadowDirty=true;$('grow').style.display='none';$('sun').style.display='';hideCard();dirty=true}
function stepGrow(dt){if(!GROW.on||!GROW.play)return;const y=GROW.y+dt*(GROW.y<1945?9:6);if(y>=2026){growSet(2026);GROW.play=false;$('growP').textContent='▶';return}growSet(y)}
$('growR').oninput=e=>{GROW.play=false;$('growP').textContent='▶';growSet(+e.target.value)};
$('growP').onclick=()=>{if(!GROW.play&&GROW.y>=2026)growSet(1867);GROW.play=!GROW.play;$('growP').textContent=GROW.play?'❚❚':'▶'};
$('growX').onclick=growClose;

// ---- Follow a raindrop: where the rain on one spot runs. The ground is read on an 80 m grid, creeks are cut into it, and every
// low spot is filled until it spills (priority flood), so each cell hands its water to one neighbor until it leaves the map.
const RAIN={arm:false,dir:null,N:0,C:80,g:null,pts:null,t:0,len:0,drop:null,line:null,done:null};
function rainGrid(){if(RAIN.dir)return;const C=RAIN.C,HF=16400,N=RAIN.N=Math.floor(2*HF/C),z=new Float32Array(N*N),X=i=>-HF+(i+.5)*C;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++)z[j*N+i]=hAt(X(i),X(j));
  {let xi=0;const wn=S.w_n,wc=S.w_c,xy=S.w_xy,cut=[9,5,3];for(let w=0;w<wn.length;w++){const n=wn[w],c=cut[wc[w]]||3;let px=0,pz=0;for(let k=0;k<n;k++){const x=xy[xi]*Qm,zz=-xy[xi+1]*Qm;xi+=2;
      if(k){const L=Math.hypot(x-px,zz-pz),st=Math.max(1,Math.ceil(L/(C*.5)));for(let s=0;s<=st;s++){const i=Math.floor((px+(x-px)*s/st+HF)/C),j=Math.floor((pz+(zz-pz)*s/st+HF)/C);if(i>=0&&j>=0&&i<N&&j<N){const o=j*N+i;if(!(z[o]<-1e5)){z[o]=-(1e6)+z[o]-c}}}}px=x;pz=zz}}
   for(let o=0;o<z.length;o++)if(z[o]<-1e5)z[o]+=1e6}
  const dir=new Int32Array(N*N).fill(-2),hp=[],hz=[];const push=(o,v)=>{let i=hp.length;hp.push(o);hz.push(v);while(i>0){const p=(i-1)>>1;if(hz[p]<=v)break;hp[i]=hp[p];hz[i]=hz[p];i=p}hp[i]=o;hz[i]=v};
  const pop=()=>{const o=hp[0],lo=hp.pop(),lv=hz.pop();if(hp.length){let i=0;const n=hp.length;for(;;){let c=2*i+1;if(c>=n)break;if(c+1<n&&hz[c+1]<hz[c])c++;if(hz[c]>=lv)break;hp[i]=hp[c];hz[i]=hz[c];i=c}hp[i]=lo;hz[i]=lv}return o};
  for(let i=0;i<N;i++)for(const o of [i,(N-1)*N+i,i*N,i*N+N-1])if(dir[o]===-2){dir[o]=-1;push(o,z[o])}
  while(hp.length){const lv=hz[0],o=pop(),i=o%N,j=(o-i)/N;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const q=b*N+a;if(dir[q]!==-2)continue;dir[q]=o;push(q,Math.max(z[q],lv))}}
  RAIN.dir=dir}
function rainRaw(x,z){rainGrid();const C=RAIN.C,HF=16400,N=RAIN.N,X=i=>-HF+(i+.5)*C,i=Math.floor((x+HF)/C),j=Math.floor((z+HF)/C),raw=[[x,z]];if(i<0||j<0||i>=N||j>=N)return raw;let o=j*N+i,guard=0;while(o>=0&&guard++<4000){raw.push([X(o%N),X(Math.floor(o/N))]);o=RAIN.dir[o]}return raw}
// the first rated creek or lake this spot's rain reaches, and how far downhill that is
function rainFirst(x,z){const P=rainRaw(x,z);let d=0;for(let k=0;k<P.length;k++){if(k)d+=Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]);for(const w of WQ){const wx=(w[3]-H.lon0)*KXm,wz=-(w[2]-H.lat0)*KYm;if(Math.hypot(P[k][0]-wx,P[k][1]-wz)<330)return {w,mi:d/1609.34}}}return null}
function rainClear(){if(RAIN.g){scene.remove(RAIN.g);RAIN.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});RAIN.g=null}RAIN.pts=null;dirty=true}
function rainArm(){rainClear();RAIN.arm=true;showCard('Follow a raindrop','Tap any spot in the city: your roof, a parking lot, a park. The map will trace where rain that lands there runs.',undefined,{label:'Cancel',fn:()=>{RAIN.arm=false;hideCard()}})}
function rainDrop(x,z){RAIN.arm=false;rainGrid();rainClear();const C=RAIN.C,HF=16400,N=RAIN.N,X=i=>-HF+(i+.5)*C;let i=Math.floor((x+HF)/C),j=Math.floor((z+HF)/C);if(i<0||j<0||i>=N||j>=N){showCard('Follow a raindrop','That spot is off the edge of the map. Tap inside the city.');return}
  const raw=rainRaw(x,z);
  // smooth the stair-steps of the grid
  let P=raw;for(let it=0;it<2;it++){const Q=[P[0]];for(let k=1;k<P.length-1;k++)Q.push([(P[k-1][0]+2*P[k][0]+P[k+1][0])/4,(P[k-1][1]+2*P[k][1]+P[k+1][1])/4]);Q.push(P[P.length-1]);P=Q}
  const n=P.length,pos=new Float32Array(n*6),ix=[],cum=new Float32Array(n);RAIN.w=0;for(let k=0;k<n;k++){if(k){cum[k]=cum[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]);const q=2*(k-1);ix.push(q,q+1,q+2,q+1,q+3,q+2)}}
  RAIN.pts=P;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));RAIN.line={geometry:geo};rainWide(Math.max(900,Math.hypot(P[n-1][0]-x,P[n-1][1]-z)*1.25));geo.setIndex(ix);geo.setDrawRange(0,0);
  const line=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x35c8ff,side:THREE.DoubleSide,transparent:true,opacity:.92,depthTest:false}));line.renderOrder=20;line.frustumCulled=false;
  const drop=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),new THREE.MeshBasicMaterial({color:0xbfefff,depthTest:false}));drop.renderOrder=21;
  const g=new THREE.Group();g.add(line,drop);scene.add(g);
  // creeks and lakes it passes, in order, from the water quality markers
  const seen=[],dist=[];for(let k=0;k<n;k++)for(const q of WQ){const wx=(q[3]-H.lon0)*KXm,wz=-(q[2]-H.lat0)*KYm;if(Math.hypot(P[k][0]-wx,P[k][1]-wz)<330&&!seen.includes(q)){seen.push(q);dist.push(cum[k])}}
  const y0=hAt(x,z),y1=hAt(P[n-1][0],P[n-1][1]),mi=cum[n-1]/1609.34,ex=P[n-1],edge=ex[0]>HF-200?'east':ex[0]<-HF+200?'west':ex[1]<-HF+200?'north':'south';
  const pass=seen.length?' On the way it reaches '+seen.map((q,k)=>q[0]+' ('+(q[4]===5?'impaired':q[4]===1?'meets its standards':'not listed as impaired')+', '+(dist[k]/1609.34).toFixed(1)+' mi in)').join(', then ')+'. Tap a drop marker for what each one is impaired for.':' It does not pass a creek segment with a state water quality rating before it leaves the map.';
  RAIN.g=g;RAIN.pts=P;RAIN.cum=cum;RAIN.t=0;RAIN.len=cum[n-1];RAIN.line=line;RAIN.drop=drop;
  RAIN.done=()=>showCard('Where this rain goes','Rain that lands here runs about '+mi.toFixed(1)+' miles and drops about '+Math.round((y0-y1)*3.281)+' feet before it leaves the '+edge+' edge of the map.'+pass+' Nearly all of Lincoln drains to Salt Creek, which joins the Platte River near Ashland, then the Missouri and the Mississippi. How this is drawn: the ground is read from the USGS 10 meter elevation model on an 80 meter grid, mapped creeks are cut into it, and low spots are filled until they spill. It shows the lay of the land. It does not know about storm drains, culverts or curbs, so on a real street the first few blocks can differ.',undefined,{label:'Try another spot',fn:rainArm},[{label:'Clear the line',fn:()=>{rainClear();hideCard()}}]);
  showCard('Follow a raindrop','Running downhill…');const mx=(x+ex[0])/2,mz=(z+ex[1])/2,sp=Math.max(900,Math.hypot(ex[0]-x,ex[1]-z)*1.25);flyTo(camTo(mx,mz,Math.min(22000,sp),200,48),1400)}
// the line is redrawn wider as you pull back, so it stays visible from any height
function rainWide(d){const w=Math.min(110,Math.max(5,d/170));if(RAIN.w&&Math.abs(w-RAIN.w)/RAIN.w<.25)return;RAIN.w=w;const P=RAIN.pts,n=P.length,at=RAIN.line.geometry.attributes.position,pos=at.array;for(let k=0;k<n;k++){const a=P[Math.max(0,k-1)],b=P[Math.min(n-1,k+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const y=hAt(P[k][0],P[k][1])+2.2+w*.05;pos[6*k]=P[k][0]-dz*w;pos[6*k+1]=y;pos[6*k+2]=P[k][1]+dx*w;pos[6*k+3]=P[k][0]+dz*w;pos[6*k+4]=y;pos[6*k+5]=P[k][1]-dx*w}at.needsUpdate=true;dirty=true}
function stepRain(dt){if(!RAIN.pts||!RAIN.line)return;rainWide(camera.position.distanceTo(controls.target));const cum=RAIN.cum,n=cum.length;if(RAIN.t<RAIN.len){RAIN.t=Math.min(RAIN.len,RAIN.t+dt*Math.max(900,RAIN.len/9));if(RAIN.t>=RAIN.len&&RAIN.done){const f=RAIN.done;RAIN.done=null;f()}}
  let k=1;while(k<n-1&&cum[k]<RAIN.t)k++;RAIN.line.geometry.setDrawRange(0,6*(k-1));const f=(RAIN.t-cum[k-1])/Math.max(1e-6,cum[k]-cum[k-1]),a=RAIN.pts[k-1],b=RAIN.pts[k],x=a[0]+(b[0]-a[0])*Math.min(1,f),z=a[1]+(b[1]-a[1])*Math.min(1,f),s=Math.max(5,camera.position.distanceTo(controls.target)/110);
  RAIN.drop.position.set(x,hAt(x,z)+s*1.2,z);RAIN.drop.scale.setScalar(s);if(RAIN.t<RAIN.len||RAIN.s!==s){RAIN.s=s;dirty=true}}

// ---- Follow the money: what campaign money is on the public record in Nebraska, where the record stops, and where to read it.
// The same card for every office and every candidate. Read Nov 21, 2026.
const MNU={search:'https://nadc-e.nebraska.gov/PublicSite/Search.aspx',data:'https://nadc-e.nebraska.gov/PublicSite/DataDownload.aspx',nadc:'https://nadc.nebraska.gov/',fec:'https://www.fec.gov/data/'};
function moneyCard(){showCard('Follow the money in Lincoln politics','What is on the public record: every candidate and committee for state or local office in Nebraska, including Lincoln mayor, City Council, school board and county races, files campaign statements with the Nebraska Accountability and Disclosure Commission (NADC). You can search any candidate, committee or donor, and download every contribution and every expenditure by year as a spreadsheet. Committees that spend on their own for or against a candidate file independent expenditure reports there too. Federal races (Congress, President) file with the Federal Election Commission instead. '
 +'Where the record stops: small donors are not listed by name, and a group\'s report shows what the group gave, not always who funded the group. Money that is never reported cannot be put on any map. What a map can do is show all of the money that is reported, in one place, the same way for every candidate, and mark plainly where the trail ends. '
 +'How to use it now: open the NADC search, type a candidate\'s name, and read who gave and what was spent. To check one donor across every race, search the donor instead. If something looks wrong, the NADC takes complaints and its staff answer questions at 402-471-2522. '
 +'What the filings add up to: $1,068,502 in independent spending is on file for Lincoln\'s mayor and City Council races in 2023 and 2025, from 8 groups, and $308,249 of it was described as mail or printing. For 3 of the 8 groups the public record stops at the group\'s name. The paper lists every group, who it supported or opposed, and who funded it. Sources: NADC bulk data downloaded November 21, 2026, and the FEC.',undefined,
 {label:'See it on the map',fn:moneyMap},[{href:MNU.search,label:'Search the filings ↗'},{href:'https://starcitylincoln.org/campaign.html',label:'Read the paper: who paid ↗'},{href:MNU.data,label:'Download the data ↗'},{href:MNU.fec,label:'Federal races (FEC) ↗'},{label:'City Council',fn:()=>councilOpen(0)}])}

// ---- Irish pubs: a shamrock and a small tricolor over each one. McKinney's is where Liverpool supporters watch, per the person who built this map.
const IRISH=[["McKinney's Irish Pub",40.8146061,-96.7108086,"Lincoln's Liverpool FC bar","An Irish pub in the Haymarket, and the bar where Lincoln's Liverpool FC supporters gather to watch matches. Does your Premier League club have a home bar in Lincoln? Report it on the project's issues page and it goes on the map."],
 ["O'Rourke's Tavern",40.8132767,-96.7017569,'an Irish name on O Street',"A downtown tavern with an Irish name, on O Street. Know another Irish pub in Lincoln that should carry a shamrock? Report it on the project's issues page."]];
let irishDone=false;
function setupIrish(){if(irishDone||!H||!H.lat0)return;irishDone=true;const g=new THREE.Group(),gm=new THREE.MeshLambertMaterial({color:0x1fa34a,emissive:0x0c5a26,emissiveIntensity:.5}),pm=new THREE.MeshLambertMaterial({color:0x6b4a2a});
  for(const [nm,lat,lon,sub,txt] of IRISH){const x=(lon-H.lon0)*KXm,z=-(lat-H.lat0)*KYm,y=hAt(x,z)+26,s=new THREE.Group();
    for(const a of [90,210,330]){const r=a*Math.PI/180,l=new THREE.Mesh(new THREE.SphereGeometry(3.2,12,8),gm);l.position.set(Math.cos(r)*3.4,Math.sin(r)*3.4,0);l.scale.z=.45;s.add(l)}
    const st=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,7,6),gm);st.position.set(1.2,-6,0);st.rotation.z=.3;s.add(st);s.position.set(x,y+9,z);s.userData.spin=1;g.add(s);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,26,6),pm);pole.position.set(x+7,y-13,z);g.add(pole);
    [0x169b62,0xffffff,0xff883e].forEach((c,k)=>{const f=new THREE.Mesh(new THREE.PlaneGeometry(2.6,4.6),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));f.position.set(x+8.6+2.6*k,y-3,z);g.add(f)});
    labels.push({t:nm,sub,x,y:y+20,z,k:3,pri:540,near:0,far:2400})}
  g.userData.info=['Irish pubs of Lincoln',IRISH.map(q=>q[0]+': '+q[4]).join(' ')];g.userData.act={label:'Suggest a pub ↗',fn:()=>open('https://github.com/RobotWhiteBread/STARCITY/issues','_blank','noopener')};
  scene.add(g);pickables.push(g);LM.irish=g;dirty=true}
function stepIrish(now){const g=LM.irish;if(!g)return;const t=controls.target;if(Math.hypot(t.x-g.children[0].position.x,t.z-g.children[0].position.z)>3500)return;for(const c of g.children)if(c.userData.spin)c.rotation.y=now*.0012;dirty=true}

// ---- Everything about one spot: one tap, every public record the map holds for that place, each with its source.
const SPOT={arm:false,x:0,z:0};
function spotArm(){SPOT.arm=true;showCard('Everything about one spot','Tap your house, your block, or any place in the city. One page will list who represents it, what it is worth, its flood and water facts, and what is nearby, each with its source.',undefined,{label:'Cancel',fn:()=>{SPOT.arm=false;hideCard()}})}
function spotOpen(x,z){SPOT.arm=false;SPOT.x=x;SPOT.z=z;openSheet(SPOTS,0);if(!CRASH.d)crashLoad().then(d=>{if(d&&sheet===SPOTS&&SPOT.x===x&&SPOT.z===z){const b=$('gbody'),t=b.scrollTop;b.innerHTML=spotHTML();b.scrollTop=t}})}
function spotHTML(sheet){const x=SPOT.x,z=SPOT.z,row=(a,b)=>`<p><b>${esc(a)}</b><br>${b}</p>`,
  at=id=>{const L=DL.get(id);if(!L||!L.X)return null;let i=-1;try{i=dlAt(L,x,z)}catch(e){}return i<0?null:(k=>{const f=L.fields.find(f=>f.k===k);return f?fget(L,f)(i):''})},
  near=(id,k)=>{const L=DL.get(id);if(!L||!L.X||L.def.k!=='pt')return null;let b=-1,bd=1e18;for(let i=0;i<L.n;i++){const d=(L.X[2*i]-x)**2+(L.X[2*i+1]-z)**2;if(d<bd){bd=d;b=i}}if(b<0)return null;const f=L.fields.find(f=>f.k===k);return f?esc(String(fget(L,f)(b)))+' <span class="psub">'+far(Math.sqrt(bd))+'</span>':null},
  far=m=>m<400?Math.round(m*3.281/50)*50+' ft':(m/1609.344).toFixed(1)+' mi';
  let h='';const lat=H.lat0-z/KYm,lon=H.lon0+x/KXm,hd=at('hoods');
  h+=`<p class="psub">The spot you tapped: ${lat.toFixed(5)}, ${lon.toFixed(5)}${hd?' · '+esc(String(hd('name'))):''}. Figures for value and age describe the area around it (a hexagon of about ${H2.hex.acres.toFixed(0)} acres), not one property.</p>`;
  // who decides
  h+='<h4>Who decides for this spot</h4>';let any=false;
  for(const [id,what] of CIVL){const f=at(id);if(!f)continue;any=true;const nm=String(f('name')).replace(/^(City Council|County Board|LPS Board|Legislative|Lower Platte South NRD|Southeast Community College|NU Board of Regents) /,''),who=f('member')||f('senator');h+=row(what,esc(nm)+(who?' · '+esc(String(who)):'')+(id==='precincts'&&f('poll')?' · votes at '+esc(String(f('poll'))):''));if(id==='precincts'&&!sheet){const tl=t25Line(f('name'));if(tl){const v=t25(f('name')),stay=v[0]-v[1];h+=row('Who voted here',esc(tl)+'<br>'+esc(`${stay.toLocaleString('en-US')} registered voters in this precinct did not vote. For scale, Lincoln's 2019 street sales tax passed by 650 votes citywide, 25,281 to 24,631.`)+`<br><button class="btn go2" data-sp="share" data-pn="${esc(String(f('name')))}">Share this precinct's number</button> <a href="https://www.lancaster.ne.gov/election" target="_blank" rel="noopener">Register, vote early, find the next election ↗</a>`)}}}
  if(!any)h+='<p>No districts are on file here. This spot may be outside the city.</p>';
  {const m=ccNext(1)[0],r=rgNext();if(m)h+=row('Next City Council meeting',ccDay(m)+', '+ccTime(m)+', County-City Building');if(r&&!sheet)h+=row('Next NU Regents meeting',rgDay(r[0])+(r[1]?', '+r[1]:'')+', '+esc(r[2]))}
  // money
  h+='<h4>Value and taxes around it</h4>';const hi=hexIdx(x,z);
  if(hi>=0){const med=S2.hx_med[hi]*1000,vpa=S2.hx_vpa[hi]*5000,tpa=S2.hx_tpa[hi]*100,yr=S2.hx_yr[hi],psf=S2.hx_psf[hi];
    if(med)h+=row('Typical home',fmtN(med,'$')+' assessed'+(psf?' · $'+psf+' a square foot':''));if(vpa)h+=row('Assessed value per acre',fmtN(vpa,'$'));if(tpa)h+=row('Property tax raised per acre (estimate)',fmtN(tpa,'$')+' a year');if(yr)h+=row('Typical year homes were built',String(yr));
    if(!med&&!vpa)h+='<p>No assessed value is on file in this hexagon.</p>'}else h+='<p>No property figures here.</p>';
  try{const R=804.67,s=numSales((px,pz)=>(px-x)**2+(pz-z)**2<R*R);if(s&&s.n>=3)h+=row('Home sales within half a mile, last 12 months',s.n+' sales · median price '+fmtN(s.med,'$')+(s.psf?' · median $'+Math.round(s.psf)+' a square foot':''));else if(s)h+=row('Home sales within half a mile, last 12 months','Fewer than 3 on record, too few to summarize.')}catch(e){}
  {const c=crashNear(x,z,804.67);if(c)h+=row('Crashes within half a mile, January 2024 to June 2026',c.n+' recorded · '+c.inj+' with an injury'+(c.fatal?' · '+c.fatal+' fatal':'')+' · '+c.ped+' involving a pedestrian · '+c.bike+' a bicycle'+(sheet?'':' <span class="psub">Placed from police street text; about 7% of records citywide could not be placed.</span>'))}
  try{const L=DL.get('cases');if(L&&L.X&&L.n){let c=0;for(let i=0;i<L.n;i++)if((L.X[2*i]-x)**2+(L.X[2*i+1]-z)**2<804.67**2)c++;h+=row('Planning and zoning cases within half a mile',c?c+' open or recent. Turn on Decisions in the works on the map to read them.':'None on file right now.')}}catch(e){}
  if(at('council'))h+=levyHTML(hi>=0?S2.hx_med[hi]*1000:0);
  {const zn=at('zoning');if(zn)h+=row('Zoning',esc(String(zn('zone')))+' ('+esc(String(zn('cat')).toLowerCase())+')')}
  // water
  h+='<h4>Flood and water</h4>';
  {const f1=at('flood100'),f5=at('flood500'),L1=DL.get('flood100');
   if(L1&&L1.X)h+=row('Mapped floodplain',f1?'Inside the 1% yearly chance floodplain (the regulated zone).':f5?'Inside the 0.2% yearly chance band, outside the regulated zone.':'Outside both mapped flood zones. Most flood claims paid in Lincoln were rainfall, and nearly a third came from outside the mapped floodplain.');
   let rf=null;try{rf=rainFirst(x,z)}catch(e){}
   h+=row('Where its rain goes',rf?esc(rf.w[0])+', about '+rf.mi.toFixed(1)+' miles downhill. '+(rf.w[4]===5?'The state lists it as impaired.':rf.w[4]===1?'It meets its standards.':'It is not listed as impaired.'):'It leaves the map before reaching a creek with a state rating.')}
  // nearby
  h+='<h4>Nearby</h4>';
  for(const [id,k,l] of [['schools','name','School'],['libraries','name','Library'],['playgrounds','name','Playground'],['fire','no','Fire station']]){const s=near(id,k);if(s)h+=row(l,(id==='fire'?'Station ':'')+s)}
  try{if(BX.ok){const b=busNearest({x,z});if(b){const s=BX.stops[b.i];h+=row('Bus stop',esc(String(s[0]))+' <span class="psub">'+far(Math.hypot(s[1]-x,s[2]-z))+'</span>')}}}catch(e){}
  {let bd=1e18,bn=-1;for(const T of LM.trails||[]){const D=T.d;for(let k=0;k<D.length;k+=2){const d=(D[k]-x)**2+(D[k+1]-z)**2;if(d<bd){bd=d;bn=T.tn}}}const nm=bn>=0&&bn!==65535&&H.tnames?H.tnames[bn]:null;if(bd<1e17)h+=row('Bike trail',(nm?esc(nm):'A trail')+' <span class="psub">'+far(Math.sqrt(bd))+'</span>')}
  if(!sheet)h+='<p><button class="btn go" data-sp="sheet">Neighborhood sheet to print or share</button></p><p><button class="btn go" data-sp="rain">Follow this spot\'s rain</button> <button class="btn go" data-sp="walls">Raise its district walls</button> <button class="btn go" data-sp="cc">City Council</button> <button class="btn go" data-sp="again">Pick another spot</button></p>';
  h+='<p class="psub">Sources: districts and precincts from the Lancaster County Election Commissioner and city GIS; values from the Lancaster County Assessor 2026 roll, with tax estimated from the 2025 levy; flood zones from the FEMA layers the city publishes; creek ratings from Nebraska\'s 2022 Water Quality Integrated Report; rain path from the USGS 10 meter elevation model; bus stops from StarTran\'s timetable. Read November 2026.</p>';
  return h}
const SPOTS={title:'Everything about <i>one spot</i>',tabs:['This spot'],html:()=>spotHTML(),click:e=>{const b=e.target.closest('[data-sp]');if(!b)return;const v=b.dataset.sp,x=SPOT.x,z=SPOT.z;if(v==='share'){t25Share(b.dataset.pn);return}if(v==='sheet'){spotSheet();return}closeSheet();if(v==='rain')rainDrop(x,z);else if(v==='walls')civicStack(x,z);else if(v==='cc')councilOpen(0);else spotArm()}};

// ---- A saxophone player on the sidewalk in front of the Zoo Bar, 136 N. 14th Street, with the notes drifting down the street. For fun.
const SAX={g:null,x:0,z:0,dx:0,dz:1,notes:[],lb:null};
function setupSax(){if(SAX.g||!H||!H.lat0)return;const bx=(-96.7008172-H.lon0)*KXm,bz=-(40.8143782-H.lat0)*KYm;
  // step from the bar's door toward the nearest street, and stop on the sidewalk
  let rx=bx+9,rz=bz,bd=1e18;{const xy=S.r_xy,rn=S.r_n,rc=S.r_c;let i=0;for(let w=0;w<rn.length;w++){const ok=rc[w]<=5;let px=0,pz=0;for(let k=0;k<rn[w];k++,i+=2){const x=xy[i]*Qm,z=-xy[i+1]*Qm;if(ok&&k){const vx=x-px,vz=z-pz,l2=vx*vx+vz*vz||1,t=Math.max(0,Math.min(1,((bx-px)*vx+(bz-pz)*vz)/l2)),cx=px+vx*t,cz=pz+vz*t,d=(cx-bx)**2+(cz-bz)**2;if(d<bd){bd=d;rx=cx;rz=cz}}px=x;pz=z}}}
  const L=Math.hypot(rx-bx,rz-bz)||1,ux=(rx-bx)/L,uz=(rz-bz)/L,x=bx+ux*Math.max(3,L-7),z=bz+uz*Math.max(3,L-7),y=hAt(x,z),g=new THREE.Group(),
    M=c=>new THREE.MeshLambertMaterial({color:c}),box=(w,h,d,c,px,py,pz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(px,py,pz);g.add(m);return m};
  box(.34,.85,.3,0x23262e,-.2,.43,0);box(.34,.85,.3,0x23262e,.2,.43,0);box(.86,.9,.42,0x7a1f2b,0,1.3,0);const head=box(.42,.44,.42,0x8a5a3c,0,2.0,0);box(.5,.14,.5,0x15171c,0,2.27,0);box(.7,.04,.7,0x15171c,0,2.2,0);
  const gold=new THREE.MeshLambertMaterial({color:0xe2b33a,emissive:0x6b4a08,emissiveIntensity:.55});
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.05,.07,1.15,8),gold);neck.position.set(.12,1.3,.42);neck.rotation.x=.42;g.add(neck);
  const bell=new THREE.Mesh(new THREE.ConeGeometry(.24,.5,12,1,true),gold);bell.position.set(.12,.92,.78);bell.rotation.x=-2.3;g.add(bell);
  const bow=new THREE.Mesh(new THREE.TorusGeometry(.16,.06,8,12,Math.PI),gold);bow.position.set(.12,.78,.6);bow.rotation.set(Math.PI,Math.PI/2,0);g.add(bow);
  box(.2,.6,.2,0x7a1f2b,-.42,1.25,.3).rotation.x=-.7;box(.2,.6,.2,0x7a1f2b,.5,1.3,.3).rotation.x=-.8;
  // an open case on the sidewalk
  box(.9,.1,.4,0x2a1c12,1.3,.06,.5);box(.9,.4,.05,0x3a2819,1.3,.25,.3);
  g.position.set(x,y,z);g.rotation.y=Math.atan2(ux,uz);g.scale.setScalar(2.4);
  g.userData.info=['Saxophone outside the Zoo Bar','For fun. The Zoo Bar, 136 North 14th Street, has been Lincoln\'s blues club since 1973, and the music has always found its way out the door. The player is part of the map, not a real person.'];
  g.userData.act={label:'Hear a few bars ♪',fn:saxPlay};
  scene.add(g);pickables.push(g);SAX.g=g;SAX.x=x;SAX.z=z;SAX.dx=-uz;SAX.dz=ux;SAX.body=g;
  for(let i=0;i<7;i++)SAX.notes.push({t:i%3===1?'♫':i%3===2?'♬':'♪',x,y:y+4,z,k:3,pri:900-i,near:0,far:1500,ph:i/7});
  SAX.lb={t:'Zoo Bar',sub:'blues on 14th Street since 1973',x,y:y+13,z,k:3,pri:560,near:0,far:2400};labels.push(SAX.lb);dirty=true}
function stepSax(now){const g=SAX.g;if(!g)return;const t=controls.target,d=camera.position.distanceTo(t);if(Math.hypot(t.x-SAX.x,t.z-SAX.z)>900||d>1600)return;
  const s=now*.001,y0=hAt(SAX.x,SAX.z);g.rotation.z=Math.sin(s*2.2)*.07;g.position.y=y0+Math.abs(Math.sin(s*4.4))*.12;
  // each note leaves the horn, rises, and drifts along the street both ways
  for(const n of SAX.notes){const p=(s*.16+n.ph)%1,side=n.ph*7%2<1?1:-1,along=p*70*side,sway=Math.sin(p*9+n.ph*20)*3;n.x=SAX.x+SAX.dx*along+SAX.dz*sway;n.z=SAX.z+SAX.dz*along-SAX.dx*sway;n.y=y0+5+p*16;if(p<.92)lifeLabels.push(n)}
  dirty=true}

// ---- Real estate as one map: every measure is a button, the map redraws in place, and anything standing on it can be tapped.
function reMap(k){if(k===undefined)k=reAt>=0?reAt:0;if(reAt>=0&&RET[reAt]&&reAt!==k)dlSet(RET[reAt][0],false,true);reAt=k;const r=RET[k];dlSet(r[0],true,true);lastInput=performance.now();
  showCard('Real estate map: '+r[1],r[2]()+' Tap any neighborhood, hexagon, sale or bar on the map for its own numbers. Use the buttons to change what the map shows without leaving it.',undefined,{label:'Numbers for this view',fn:()=>openSheet(NUMS,0)},
   RET.map((q,i)=>({label:(i===k?'● ':'')+q[1],fn:()=>reMap(i)})).concat([{label:'Property and taxes tables',fn:()=>openSheet(TAXS,0)},{label:'Everything about one spot',fn:()=>spotArm()},{label:'Switch off',fn:()=>{dlSet(RET[reAt][0],false,true);reAt=-1;hideCard()}}]))}

// A short blues phrase made in the browser, no recording. It plays only when someone taps the button, because phones do not allow sound to start on its own.
let saxCtx=null,saxUntil=0;
function saxPlay(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;saxCtx=saxCtx||new AC();const c=saxCtx;if(c.state==='suspended')c.resume();if(c.currentTime<saxUntil)return;
  const out=c.createGain();out.gain.value=.16;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1500;lp.Q.value=3;lp.connect(out);out.connect(c.destination);
  // an A minor blues line: [semitones above A3, beats]
  const L=[[0,1],[3,.5],[5,.5],[6,.25],[5,.25],[3,.5],[0,1.5],[null,.5],[7,.5],[10,.5],[12,1],[10,.5],[7,.5],[6,.25],[5,.75],[3,.5],[0,2]],beat=.36;let t=c.currentTime+.06;
  for(const [n,b] of L){const d=b*beat;if(n!==null){const f=220*Math.pow(2,n/12),o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),v=c.createOscillator(),vg=c.createGain();
      o.type='sawtooth';o2.type='square';o.frequency.setValueAtTime(f*.97,t);o.frequency.linearRampToValueAtTime(f,t+.06);o2.frequency.value=f*1.005;v.frequency.value=5.5;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.012,t+d*.7);v.connect(vg);vg.connect(o.frequency);
      const g2=c.createGain();g2.gain.value=.25;o2.connect(g2);g2.connect(g);o.connect(g);g.connect(lp);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+.03);g.gain.setValueAtTime(1,t+d*.75);g.gain.linearRampToValueAtTime(0,t+d*.98);
      for(const q of [o,o2,v]){q.start(t);q.stop(t+d)}}t+=d}
  saxUntil=t}catch(e){}}

// ---- Campaign money on the ground. Outside groups stand in a ring around the County-City Building, as tall as what they reported spending
// in Lincoln's mayor and council races, 2023 and 2025. Blue is spent to support a candidate, orange to oppose. A dark block means the
// public files hold no list of that group's funders. Positions are a ring for reading, not anyone's address. Data: NADC bulk files, Nov 21, 2026.
const MFLOW=[{"g":"Together Nebraska","spent":770672,"to":[["Leirion Gaylor Baird","Oppose","2023","Mayor",678628],["Suzanne Geist","Support","2023","Mayor",92043]],"rec":1699102,"geo":{"lnk":910000,"ne":729000,"out":60000,"none":102},"known":true},{"g":"Onward Lincoln","spent":109581,"to":[["Leirion Gaylor Baird","Support","2023","Mayor",40001],["Thomas Beckius","Support","2025","Council",22365],["Sandra Washington","Support","2025","Council",22364],["Bennie Shobe","Support","2025","Council",22351],["Bailey Feit","Support","2023","Council",2500]],"rec":301740,"geo":{"lnk":212430,"ne":46000,"out":30000,"none":13310},"known":true},{"g":"Nebraska Democratic Party","spent":83427,"to":[["Jerry Shoecraft","Oppose","2025","Council",47446],["Bennie Shobe","Support","2025","Council",35981]],"rec":3753011,"geo":{"out":952147,"ne":1439419,"lnk":1361446},"known":true},{"g":"Lancaster County Republican Party","spent":51459,"to":[["Jerry Shoecraft","Support","2025","Council",30579],["Stan Parker","Support","2025","Council",20880]],"rec":509341,"geo":{"lnk":370798,"ne":134233,"out":800,"none":3510},"known":true},{"g":"International Assn Of Firefighters Local 644","spent":25000,"to":[["Leirion Gaylor Baird","Support","2023","Mayor",25000]],"rec":0,"geo":{},"known":false},{"g":"Bold Alliance INC","spent":11377,"to":[["Leirion Gaylor Baird","Support","2023","Mayor",10000],["Bennie Shobe","Support","2025","Council",1377]],"rec":0,"geo":{},"known":false},{"g":"Planned Parenthood Advocates Of Nebraska","spent":9188,"to":[["Suzanne Geist","Oppose","2023","Mayor",9188]],"rec":0,"geo":{},"known":false},{"g":"Lincoln Independent Business Association PAC","spent":7798,"to":[["Suzanne Geist","Support","2023","Mayor",4328],["Tom Duden","Support","2023","Council",1909],["Taylor Wyatt","Support","2023","Council",918],["Wayne Reinwald","Support","2023","Council",643]],"rec":65655,"geo":{"lnk":33280,"none":28625,"ne":2750,"out":1000},"known":true}];
const MM={g:null,dots:[],lbl:[]};
function moneyMapOff(){if(MM.g){scene.remove(MM.g);MM.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});MM.g=null}for(const l of MM.lbl){const i=labels.indexOf(l);if(i>=0)labels.splice(i,1)}MM.lbl.length=0;MM.dots.length=0;dirty=true}
function moneyMap(){moneyMapOff();const cx=(-96.70773-H.lon0)*KXm,cz=-(40.80887-H.lat0)*KYm,cy=hAt(cx,cz),g=new THREE.Group(),R=420,K=560/MFLOW[0].spent,n=MFLOW.length,
   mat=c=>new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:.25}),SUP=0x2b7bba,OPP=0xd9822b,DARK=0x1b1d22;
  MFLOW.forEach((G,i)=>{const a=-Math.PI*.15+i*(Math.PI*1.3/(n-1)),x=cx+Math.cos(a)*R,z=cz+Math.sin(a)*R,y0=hAt(x,z),sup=G.to.filter(t=>t[1]==='Support').reduce((s,t)=>s+t[4],0),opp=G.spent-sup,hs=Math.max(sup?22:0,sup*K),ho=Math.max(opp?22:0,opp*K),w=44;
    const add=(h,yb,c,what)=>{if(h<=0)return;const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),mat(c));m.position.set(x,y0+yb+h/2,z);m.userData.mi=i;g.add(m)};add(hs,0,SUP);add(ho,hs,OPP);
    // behind each group: where its own reported money came from, or a dark block when no funders are on file
    const bx=cx+Math.cos(a)*(R+70),bz=cz+Math.sin(a)*(R+70);
    if(G.known){const tot=G.rec||1,parts=[[G.geo.lnk||0,0xe9b949],[G.geo.ne||0,0x9ac27a],[G.geo.out||0,0xb07ad6],[G.geo.none||0,0x8a9099]];let yb=0;const HH=Math.max(30,(hs+ho)*.6);for(const [v,c] of parts){const h=HH*v/tot;if(h>0.3){const m=new THREE.Mesh(new THREE.BoxGeometry(24,h,24),mat(c));m.position.set(bx,hAt(bx,bz)+yb+h/2,bz);m.userData.mi=i;g.add(m);yb+=h}}}
    else{const h=Math.max(30,(hs+ho)*.6),m=new THREE.Mesh(new THREE.BoxGeometry(24,h,24),new THREE.MeshLambertMaterial({color:DARK}));m.position.set(bx,hAt(bx,bz)+h/2,bz);m.userData.mi=i;g.add(m)}
    // an arc from the group to the building where the winners sit, with dots that travel along it
    const top=y0+hs+ho,P=[];for(let k=0;k<=24;k++){const t=k/24;P.push(new THREE.Vector3(x+(cx-x)*t,top+(cy+30-top)*t+Math.sin(Math.PI*t)*160,z+(cz-z)*t))}
    const col=opp>sup?OPP:SUP,line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(P),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.75}));line.frustumCulled=false;g.add(line);
    const nd=Math.max(1,Math.min(6,Math.round(G.spent/120000)+1));for(let d=0;d<nd;d++){const s=new THREE.Mesh(new THREE.SphereGeometry(7,8,6),new THREE.MeshBasicMaterial({color:col}));g.add(s);MM.dots.push({s,P,ph:d/nd})}
    const L={t:G.g,sub:'$'+G.spent.toLocaleString('en-US')+(G.known?'':' · funders not on file'),x,y:top+16,z,k:3,pri:1250-i,near:0,far:6000};labels.push(L);MM.lbl.push(L)});
  g.userData.card=hit=>{const i=hit.object.userData.mi;if(i!==undefined)moneyGroupCard(i)};scene.add(g);pickables.push(g);MM.g=g;
  flyTo(camTo(cx,cz,2300,200,44),2200);lastInput=performance.now();
  showCard('Campaign money, on the ground','Each pillar is one outside group, as tall as what it reported spending in Lincoln\'s mayor and City Council races in 2023 and 2025. Blue was spent to support a candidate. Orange was spent to oppose one. The dots travel to the County-City Building, where the winners sit. Behind each pillar, a thinner stack shows where that group\'s own reported money came from: gold from Lincoln ZIP codes, green from the rest of Nebraska, purple from out of state. A dark block means the public files hold no list of who funded that group. The ring is for reading. It is not where anyone is located. Heights are in proportion to dollars, except that the smallest pillars are drawn at a minimum height so they can be seen. Tap a pillar for its numbers. Source: Nebraska Accountability and Disclosure Commission files downloaded November 21, 2026.',undefined,{label:'Put it away',fn:()=>{moneyMapOff();hideCard()}},[{href:'https://starcitylincoln.org/campaign.html',label:'Read the paper ↗'},{label:'How to trace a mailer',fn:moneyCard}])}
function moneyGroupCard(i){const G=MFLOW[i],$$=v=>'$'+Math.round(v).toLocaleString('en-US');
  showCard(G.g+': '+$$(G.spent)+' in Lincoln city races',G.to.map(t=>t[1]+(t[1]==='Support'?'ed ':'d ')+t[0]+' for '+(t[3]==='Mayor'?'mayor':'City Council')+' in '+t[2]+': '+$$(t[4])).join('. ')+'. '
   +(G.known?'Its own filings list '+$$(G.rec)+' in receipts for everything it does statewide: '+[['lnk','from Lincoln ZIP codes'],['ne','from elsewhere in Nebraska'],['out','from out of state'],['none','from donors of $250 or less or with no address listed']].filter(q=>G.geo[q[0]]).map(q=>$$(G.geo[q[0]])+' '+q[1]).join(', ')+'. No filing ties a donor to a particular mailer or ad. The paper lists its largest funders by name, as the state publishes them.':'The public record stops here. The state\'s files show what this group spent and hold no list of who funded it.'),
   undefined,{label:'Back to all groups',fn:moneyMap},[{href:'https://starcitylincoln.org/campaign.html',label:'Read the paper ↗'}])}
function stepMoney(now){if(!MM.g)return;const s=now*.00022;for(const d of MM.dots){const t=(s+d.ph)%1,f=t*24,k=Math.min(23,Math.floor(f)),u=f-k,a=d.P[k],b=d.P[k+1];d.s.position.set(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u,a.z+(b.z-a.z)*u)}dirty=true}

// ---- Where a property tax dollar goes, for tax district 0001 (most of Lincoln), tax year 2025.
// Rates per $100 from the Nebraska Department of Revenue's reference list of taxing subdivisions (Certificates of Taxes Levied as of 12-31-2025).
// Check: the sixteen rates add to 1.666284, the consolidated levy the county reports for district 0001.
const LEVY25=[['Lincoln Public Schools',[['General fund',.925324],['Bond 2006',.035232],['Bond 2014',.020692],['Bond 2020',.04001],['Educational Service Unit 18',.015]],0x4c9be8],
 ['City of Lincoln',[['City',.297319]],0xe9b949],['Lancaster County',[['County',.214482]],0x7fb069],['Lincoln Airport Authority',[['Airport',.029289]],0xb07ad6],
 ['Lower Platte South Natural Resources District',[['NRD',.022999]],0x35b8a8],['Southeast Community College',[['Capital fund',.02]],0xe4572e],
 ['Railroad Transportation Safety District',[['RTSD',.015275]],0x9aa5b1],['Public Building Commission',[['PBC',.014875]],0xc98f5a],
 ['Lancaster Correctional Facility joint agency (city and county shares)',[['City share',.006315],['County share',.004244]],0x8a6fa8],['County fair (Ag Society and fairgrounds)',[['Ag Society',.003766],['Fairgrounds',.001462]],0xd4b483]];
const LEVY25T=LEVY25.reduce((s,g)=>s+g[1].reduce((a,r)=>a+r[1],0),0);
function levyHTML(val){const hex=c=>'#'+c.toString(16).padStart(6,'0');let h='<h4>Where a property tax dollar goes</h4><p class="psub">Tax district 0001, which covers most of Lincoln, at the 2025 levies. '+(val?'Dollar figures are for a home assessed at '+fmtN(val,'$')+', before the state school tax credit and any exemptions.':'')+'</p>';
  for(const [nm,rows,c] of LEVY25){const r=rows.reduce((a,q)=>a+q[1],0),sh=r/LEVY25T;h+=`<p style="margin:6px 0"><b>${esc(nm)}</b> · ${(sh*100).toFixed(1)}¢ of each dollar${val?' · about '+fmtN(val*r/100,'$')+' a year':''}<br><span style="display:block;height:10px;border-radius:5px;background:${hex(c)};width:${Math.max(1.5,sh*100).toFixed(1)}%"></span></p>`}
  return h+`<p class="psub">The total levy is ${LEVY25T.toFixed(6)} per $100 of taxable value${val?', about '+fmtN(val*LEVY25T/100,'$')+' a year on that home':''}. Schools include three voter-approved bond issues and the educational service unit. Parts of Lincoln in another school or fire district pay a different mix. Source: Nebraska Department of Revenue, reference list of taxing subdivisions and tax rates, tax year 2025. The sixteen rates were checked against the county's consolidated levy for district 0001 and match.</p>`}

// ---- Property finder: the filters people pay listing and data services for, run on public records for every building in Lincoln.
// A building matches on its parcel's assessed value, the assessor's class, floor area and year built. Matches glow gold; the rest go grey.
const FIND={on:false,f:null,flood:null,res:null};
const FINDP=[['Homes under $200,000',{t:'res',v1:200000}],['Homes $200,000 to $350,000',{t:'res',v0:200000,v1:350000}],['Homes $350,000 to $600,000',{t:'res',v0:350000,v1:600000}],['Homes $1 million and up',{t:'res',v0:1000000}],
 ['Built before 1930',{t:'res',y1:1929}],['Built since 2015',{t:'res',y0:2015}],['Small homes, under 1,000 sq ft',{t:'res',a1:999}],['Big homes, 3,000 sq ft and up',{t:'res',a0:3000}],
 ['Under $150 a sq ft',{t:'res',p1:150}],['Over $300 a sq ft',{t:'res',p0:300}],['Homes in a mapped flood zone',{t:'res',fl:'in'}],['Commercial over $5 million',{t:'com',v0:5000000}]];
function findVB(){for(const m of pickables){if(!(m.userData&&m.userData.ids&&m.geometry&&m.geometry.index&&m.userData.start)||m.userData.vb)continue;const g=m.geometry,cnt=g.attributes.position.count,idx=g.index.array,st=m.userData.start,ids=m.userData.ids,vb=new Uint32Array(cnt);
    for(let k=0;k<st.length;k++){const e=k+1<st.length?st[k+1]:idx.length;for(let i=st[k];i<e;i++)vb[idx[i]]=ids[k]}m.userData.vb=vb;g.setAttribute('aHi',new THREE.BufferAttribute(new Float32Array(cnt),1))}}
function findFlood(){if(FIND.flood)return FIND.flood;const L1=DL.get('flood100'),L5=DL.get('flood500');if(!L1||!L1.X)return null;const n=S.b_yr.length,a=new Uint8Array(n);for(let b=0;b<n;b++){const x=LM.bc[2*b],z=LM.bc[2*b+1];let v=0;try{if(dlAt(L1,x,z)>=0)v=1;else if(L5&&L5.X&&dlAt(L5,x,z)>=0)v=2}catch(e){}a[b]=v}return FIND.flood=a}
function finderApply(f){findVB();const n=S.b_yr.length,hit=new Uint8Array(n),fl=f.fl?findFlood():null,vals=[],yrs=[],psf=[];let tot=0,sx=0,sz=0;
  for(let b=0;b<n;b++){const v=S2.b_sv[b]||S2.b_val[b];if(!v)continue;const c=H2.cls[S2.b_cls[b]]||'',res=c.startsWith('Res'),com=c.startsWith('Com');
    if(f.t==='res'&&!(res&&S2.b_fa[b]>200))continue;if(f.t==='com'&&!com)continue;if(f.v0&&v<f.v0)continue;if(f.v1&&v>f.v1)continue;
    const y=S.b_yr[b];if(f.y0||f.y1){if(!(y>1800))continue;if(f.y0&&y<f.y0)continue;if(f.y1&&y>f.y1)continue}
    const a=S2.b_fa[b];if(f.a0||f.a1||f.p0||f.p1){if(!(a>200))continue;if(f.a0&&a<f.a0)continue;if(f.a1&&a>f.a1)continue;const pp=v/a;if(f.p0&&pp<f.p0)continue;if(f.p1&&pp>f.p1)continue}
    if(f.fl){if(!fl)continue;if(f.fl==='in'&&!fl[b])continue;if(f.fl==='out'&&fl[b])continue}
    hit[b]=1;vals.push(v);tot+=v;if(y>1800)yrs.push(y);if(res&&a>200)psf.push(v/a);sx+=LM.bc[2*b];sz+=LM.bc[2*b+1]}
  for(const m of pickables){const vb=m.userData&&m.userData.vb;if(!vb)continue;const at=m.geometry.attributes.aHi,A=at.array;for(let i=0;i<vb.length;i++)A[i]=hit[vb[i]];at.needsUpdate=true}
  const med=a=>{if(!a.length)return 0;a.sort((p,q)=>p-q);return a[a.length>>1]};FIND.on=true;FIND.f=f;U.uHi.value=1;FIND.sh=FIND.sh===undefined?shadowsOn:FIND.sh;
  FIND.res={n:vals.length,med:med(vals),tot,yr:med(yrs),psf:med(psf),cx:vals.length?sx/vals.length:0,cz:vals.length?sz/vals.length:0};dirty=true;return FIND.res}
function finderOff(){FIND.on=false;U.uHi.value=0;dirty=true;hideCard()}
function findWords(f){const w=[],M=v=>fmtN(v,'$');w.push(f.t==='res'?'Homes':f.t==='com'?'Commercial property':'All property');
  if(f.v0&&f.v1)w.push('assessed '+M(f.v0)+' to '+M(f.v1));else if(f.v0)w.push('assessed '+M(f.v0)+' and up');else if(f.v1)w.push('assessed under '+M(f.v1));
  if(f.y0&&f.y1)w.push('built '+f.y0+' to '+f.y1);else if(f.y0)w.push('built '+f.y0+' or later');else if(f.y1)w.push('built '+f.y1+' or earlier');
  if(f.a0&&f.a1)w.push(f.a0.toLocaleString('en-US')+' to '+f.a1.toLocaleString('en-US')+' sq ft');else if(f.a0)w.push(f.a0.toLocaleString('en-US')+' sq ft and up');else if(f.a1)w.push('under '+f.a1.toLocaleString('en-US')+' sq ft');
  if(f.p0&&f.p1)w.push('$'+f.p0+' to $'+f.p1+' a sq ft');else if(f.p0)w.push('over $'+f.p0+' a sq ft');else if(f.p1)w.push('under $'+f.p1+' a sq ft');
  if(f.fl==='in')w.push('in a mapped flood zone');if(f.fl==='out')w.push('outside the mapped flood zones');return w.join(', ')}
function finderRun(f){closeSheet();const r=finderApply(f),M=v=>fmtN(v,'$');lastInput=performance.now();
  if(!r.n){showCard('Property finder: no matches',findWords(f)+'. Nothing on the map fits all of that. Loosen a filter.',undefined,{label:'Change the filters',fn:finderOpen},[{label:'Clear',fn:finderOff}]);return}
  showCard('Property finder: '+r.n.toLocaleString('en-US')+' buildings',findWords(f)+'. The matches are gold on the map and everything else is grey. Median assessed value '+M(r.med)+(r.yr?', median year built '+r.yr:'')+(r.psf?', median $'+Math.round(r.psf)+' a square foot':'')+'. Together they are assessed at '+M(r.tot)+'. Tap any gold building for its own value, tax estimate, size and year. These are the county assessor\'s 2026 values, not asking prices or sale prices, and a building on a shared parcel carries its share of the parcel\'s value. "Homes" means residential buildings with a floor area on record, which leaves out detached garages and sheds and includes apartment buildings. Year built and floor area are on record for homes and missing for most other buildings, so a filter on either one leaves those out.',undefined,{label:'Change the filters',fn:finderOpen},
   [{label:'Clear',fn:finderOff},{label:'Recent sales',fn:()=>reMap(5)},{label:'Everything about one spot',fn:spotArm},{href:'https://starcitylincoln.org/sales.html',label:'Home sales paper ↗'}]);
  const d=camera.position.distanceTo(controls.target);if(d<6000)flyTo(camTo(controls.target.x,controls.target.z,9000,200,48),1600)}
function finderHTML(){const f=FIND.f||{t:'res'},v=k=>f[k]?`value="${f[k]}"`:'',inp=(k,ph)=>`<input type="number" inputmode="numeric" data-ff="${k}" placeholder="${ph}" ${v(k)} style="width:46%;padding:9px;border-radius:9px;border:1px solid var(--line);background:rgba(255,255,255,.06);color:inherit;font:inherit">`,
  sel=(k,opts)=>`<select data-ff="${k}" style="width:100%;padding:9px;border-radius:9px;border:1px solid var(--line);background:#1b1f26;color:inherit;font:inherit">${opts.map(([val,l])=>`<option value="${val}"${(f[k]||'')===val?' selected':''}>${l}</option>`).join('')}</select>`,hasFl=!!(DL.get('flood100')&&DL.get('flood100').X);
  return '<p>The filters people pay listing and data services for, run on public records for every building in Lincoln. Matches turn gold on the map.</p><h4>One tap</h4><p>'+FINDP.filter(q=>hasFl||!q[1].fl).map((q,i)=>`<button class="btn go" data-fp="${FINDP.indexOf(q)}">${esc(q[0])}</button>`).join(' ')+'</p>'
   +'<h4>Or build your own</h4><p><b>Kind of property</b><br>'+sel('t',[['res','Homes'],['com','Commercial'],['','Everything']])+'</p>'
   +'<p><b>Assessed value, dollars</b><br>'+inp('v0','at least')+' '+inp('v1','at most')+'</p><p><b>Year built</b><br>'+inp('y0','from')+' '+inp('y1','to')+'</p>'
   +'<p><b>Floor area, square feet</b><br>'+inp('a0','at least')+' '+inp('a1','at most')+'</p><p><b>Value per square foot, dollars</b><br>'+inp('p0','at least')+' '+inp('p1','at most')+'</p>'
   +(hasFl?'<p><b>Mapped flood zone</b><br>'+sel('fl',[['','Either'],['in','Inside a flood zone'],['out','Outside the flood zones']])+'</p>':'')
   +'<p><button class="btn go2" data-fgo="1">Show the matches</button></p><p class="psub">Source: Lancaster County Assessor, 2026 assessment roll, and the FEMA flood layers the city publishes. Assessed values are not sale prices. For what actually sold, see Recent sales. No owner names are stored.</p>'}
const FINDS={title:'Property <i>finder</i>',tabs:['Filters'],html:()=>finderHTML(),click:e=>{const p=e.target.closest('[data-fp]');if(p){finderRun(Object.assign({},FINDP[+p.dataset.fp][1]));return}if(!e.target.closest('[data-fgo]'))return;const f={};document.querySelectorAll('#gbody [data-ff]').forEach(el=>{const k=el.dataset.ff,val=el.value;if(val==='')return;f[k]=(k==='t'||k==='fl')?val:+val});finderRun(f)}};
function finderOpen(){openSheet(FINDS,0)}
// ---- the university, plainly: how students do, what it costs, and where the corn East Campus studies actually goes.
// Every figure is the university's or the state's own, with the year. Nothing here is from the map's own data except the note on rent.
const UNLL=(h,t)=>`<a href="${h}" target="_blank" rel="noopener">${t} ↗</a>`;
function unlHTML(i){const go=(k,l)=>`<button class="btn go2" data-${k}="1">${l}</button>`;
  if(i===0)return `<h4>How students do</h4><div class="prow"><span>Graduate within six years</span>${bar(.67)}<b>67.0%</b></div><div class="prow"><span>Come back for a second year</span>${bar(.857)}<b>85.7%</b></div>
<p>Both are the university's fall 2025 figures. The graduation rate is the highest it has recorded, up 3 points in one year. Counting students who transferred and finished at another University of Nebraska campus, it is 71.1%.</p>
<h4>Where it is heading</h4><p>Second-year return was 81.5% for the class that started in 2021 and 85.7% for the class that started in 2024, after a record 86.0% the year before. Of 4,629 students who started in fall 2024, 3,966 came back, 70 moved to another Nebraska campus and 593 did not return.</p>
<h4>What it is</h4><p>The state's land-grant university, founded in 1869, a member of the Big Ten, with two campuses in Lincoln two miles apart. It is governed by eight elected regents whose meetings are public.</p>
${go('rg','The Board of Regents')}${go('nil','For athletes: Play in Lincoln')}
<h4>Not here yet</h4><p>Earnings after graduation by major, debt at graduation and four-year graduation rates by college. The federal College Scorecard publishes them, and they belong on this card once they are checked.</p>
<p class="psub">Sources: ${UNLL('https://news.unl.edu/article/annual-undergraduate-academic-performance-report-available-online','UNL, Fall 2025 update on undergraduate academic performance')} · ${UNLL('https://ianrnews.unl.edu/article/universitys-six-year-graduation-rate-reaches-all-time-high','UNL, October 2025')}. This map is not part of the university.</p>`;
  if(i===1){const R=[['Tuition and fees',11382,31182],['Housing and food, on campus',13950,13950],['Books and supplies',1128,1128],['Personal expenses',2324,2324],['Loan fees, if any',64,64]],d=v=>'$'+v.toLocaleString('en-US');
    return `<h4>One year, 2026-27, undergraduate</h4><div class="tw"><table><thead><tr><th></th><th>Nebraska resident</th><th>Non-resident</th></tr></thead><tbody>`+R.map(r=>`<tr><td>${r[0]}</td><td>${d(r[1])}</td><td>${d(r[2])}</td></tr>`).join('')+`<tr><td><b>Total</b></td><td><b>$28,848</b></td><td><b>$48,648</b></td></tr></tbody></table></div>
<p>These are the university's standard estimates before any scholarship or aid, so most students pay less than the total. Living with family, the housing and food line drops to $6,000 and the totals to $20,898 and $40,698.</p>
<h4>Which way it is moving</h4><p>Tuition and fees rose from $11,100 to $11,382 for residents in one year, about 2.5%, and from $30,330 to $31,182 for non-residents, about 2.8%.</p>
<h4>Four years at this year's prices</h4><p>About $115,400 for a resident and $194,600 for a non-resident living on campus, before aid. That is this map's arithmetic, four times the one-year total, and it assumes no increases and no aid, so treat it as a ceiling to plan against.</p>
<h4>If you rent off campus</h4><p>Renters pay property tax through their rent. Tap any building and open Everything about one spot to see where that tax goes.</p>
<p class="psub">Source: ${UNLL('https://financialaid.unl.edu/2026-2027-estimated-cost-attendance/','UNL Scholarships and Financial Aid, 2026-27 estimated cost of attendance')} and the same page for 2025-26. Your own number: the university's net price calculator.</p>`}
  return `<h4>"Feeding the world," with the details</h4><p>East Campus is the university's agriculture campus, and the phrase is on a lot of signs in this state. It is true, with some turns along the way.</p>
<h4>Most of the corn is not for people to eat</h4><p>Nebraska harvested about 2.03 billion bushels of corn for grain in 2025. About 99% of the state's corn is field corn, the hard yellow kind, not the sweet corn on a dinner plate.</p>
<div class="prow"><span>Made into ethanol</span>${bar(.35)}<b>about 35%</b></div><div class="prow"><span>Fed straight to livestock</span>${bar(.17)}<b>about 17%</b></div>
<p>Those are shares of the 2023-24 crop from a study commissioned by the Nebraska Corn Board. Most of the rest leaves for other states and other countries or goes to processors. What is left of the kernel after ethanol, the distillers grains, goes back to cattle as feed, so the fuel and the feed are tied together.</p>
<h4>So the food is mostly beef</h4><p>Nebraska had 2.8 million cattle on feed on January 1, 2026, slaughtered 6.4 million head in 2025 and produced 7.76 billion pounds of red meat. Beef and veal exports were $1.66 billion in 2024. The corn feeds the world mainly by way of the feedlot, and it fuels cars along the way: 2.1 billion gallons of ethanol in 2025.</p>
<h4>And it runs on water</h4><p>7.86 million acres of harvested cropland were irrigated in the 2022 census of agriculture. How much grain an acre-foot of water can grow is one of the questions the labs and plots on this campus work on.</p>
<h4>Why say this here</h4><p>None of this is a knock on the work. It is the fuller sentence: Nebraska grows feed and fuel at a scale few places match, and people are fed mostly through cattle. Who eats, what it costs in water, and who decides are public questions, and the numbers are public too.</p>${go('east','Fly to East Campus')}
<p class="psub">Sources: ${UNLL('https://nda.nebraska.gov/sites/default/files/ag_week/2026%20facts%20for%20website.pdf','Nebraska Department of Agriculture, 2026 agriculture facts')} · ${UNLL('https://flatwaterfreepress.org/flatwater-explains-where-does-nebraskas-corn-go/','Flatwater Free Press, Where does Nebraska\'s corn go?')} · ${UNLL('https://nebraskacorn.gov/corn-101/corn-uses/golden-triangle','Nebraska Corn Board')}. The cattle and combine on the map are animations.</p>`}
const UNLS={title:'The <i>university</i>',tabs:['How students do','What it costs','Feeding the world'],html:unlHTML,click:e=>{const b=e.target.closest('.go2');if(!b)return;const d=b.dataset;closeSheet();
  if(d.nil)openSheet(NILS,0);else if(d.rg)regentsCard();else if(d.east)chipGo('UNL East Campus')}};
function unlOpen(i){lastInput=performance.now();openSheet(UNLS,i||0)}
let unlDone=false;const UNLM=[];
function setupUNL(){if(unlDone||!H||!H.blabels)return;unlDone=true;const at=re=>{const b=H.blabels.find(q=>re.test(q[0]));return b?{x:b[1],z:-b[2],h:b[4]||20}:null};
  const put=(p,col,em,t,sub,fn,dy)=>{if(!p)return;const y=hAt(p.x,p.z)+p.h+(dy||34),m=new THREE.Mesh(new THREE.OctahedronGeometry(9,0),new THREE.MeshLambertMaterial({color:col,emissive:em,emissiveIntensity:.55}));
    m.scale.y=1.5;m.position.set(p.x,y,p.z);m.userData.card=fn;scene.add(m);pickables.push(m);UNLM.push(m);labels.push({t,sub,x:p.x,y:y+18,z:p.z,k:3,pri:560,near:0,far:3200})};
  put(at(/^Love Library/i)||at(/Nebraska Union/i),0xd00000,0x700000,'The university','graduation, cost, where it is heading',()=>unlOpen(0));
  put(at(/East Union|Dinsdale|Thompson Library/i),0xe2b93b,0x7a5a0a,'Feeding the world','where the corn actually goes',()=>unlOpen(2));
  {const s=hkVenue('Memorial Stadium');if(s)put({x:s.x,z:s.z,h:s.h},0xffffff,0x999999,'Play in Lincoln','for athletes weighing Nebraska',()=>{lastInput=performance.now();openSheet(NILS,0)},60)}
  dirty=true}
function stepUNL(now){if(!UNLM.length)return;const t=controls.target;let near=false;for(const m of UNLM)if(Math.hypot(t.x-m.position.x,t.z-m.position.z)<3500){m.rotation.y=now*.001;near=true}if(near)dirty=true}

// ---- real estate value from as far back as the public record goes: the county's taxable value each year since 2005 (state reports),
// and Lincoln's homes by the decade they were built, at today's assessed values (this map's parcels). Two different things, labeled as such.
const VALY=[15956277441,18055378076,18352523504,18807139415,18640159827,18793289211,19021815940,20128746326,20853387003,21336257938,22740340848,23418257589,25435412800,26683924667,28510075585,29360798500,32609379673,33872765406,41325286431,42931645058,47158053856];
const VALD=[[1880,43,11010800,212400,122,1710],[1890,58,12524700,198050,124,1665],[1900,2947,540017200,172500,144,1193],[1910,3009,621973700,191900,150,1281],[1920,4860,1157546300,210350,180,1176],[1930,1446,449966700,259050,203,1472],[1940,2291,557491300,224400,218,1020],[1950,10897,2580402700,224900,216,1050],[1960,7541,2116145200,262100,222,1156],[1970,9977,2848398700,269800,221,1203],[1980,6541,2024715000,295100,212,1308],[1990,10042,3600143400,334300,222,1446],[2000,11798,4440145400,340300,244,1456],[2010,5064,2145303800,392050,263,1579],[2020,2771,1136371400,384400,263,1589]];
function valHTML(i){const B=v=>'$'+(v/1e9).toFixed(v<1e10?2:1)+'B',go=(k,l)=>`<button class="btn go2" data-${k}="1">${l}</button>`;
  if(i===0){const W=320,Hh=150,mx=48e9,n=VALY.length,bw=W/n,pc=k=>((VALY[k]/VALY[k-1]-1)*100);
    let s=`<svg viewBox="0 0 ${W} ${Hh+18}" style="width:100%;max-width:520px;display:block" role="img" aria-label="Lancaster County taxable value by year, 2005 to 2025">`;
    VALY.forEach((v,k)=>{const h=v/mx*Hh,big=k&&pc(k)>9;s+=`<rect x="${(k*bw+1).toFixed(1)}" y="${(Hh-h).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${h.toFixed(1)}" fill="${big?'#ffffff':'var(--accent)'}"><title>${2005+k}: ${B(v)}${k?' ('+(pc(k)>=0?'+':'')+pc(k).toFixed(1)+'%)':''}</title></rect>`;if(k%5===0)s+=`<text x="${k===0?0:k===n-1?W:(k*bw+bw/2).toFixed(1)}" y="${Hh+13}" font-size="9" text-anchor="${k===0?'start':k===n-1?'end':'middle'}" fill="currentColor">${2005+k}</text>`});
    s+=`<text x="2" y="${(Hh-VALY[0]/mx*Hh-4).toFixed(1)}" font-size="9" fill="currentColor">${B(VALY[0])}</text><text x="${W-2}" y="${(Hh-VALY[n-1]/mx*Hh-4).toFixed(1)}" font-size="9" text-anchor="end" fill="currentColor">${B(VALY[n-1])}</text></svg>`;
    return `<h4>Lancaster County taxable value, 2005 to 2025</h4>${s}<p>From $15.96 billion to $47.16 billion in twenty years, nearly three times over. White bars are years it rose more than 9%: 2006, 2021, 2023 and 2025. Tap or hover a bar for its year.</p>
<div class="prow"><span>2005 to 2015</span>${bar(42.52/107.38)}<b>+42.5%</b></div><div class="prow"><span>2015 to 2025</span>${bar(1)}<b>+107.4%</b></div><div class="prow"><span>All of Nebraska, 2015 to 2025</span>${bar(66.52/107.38)}<b>+66.5%</b></div>
<p>The second decade rose two and a half times as fast as the first, and faster than the state as a whole. From 2008 to 2011 the total barely moved, and in 2009 it fell.</p>
<h4>Read it with care</h4><p>These are dollars of each year, not adjusted for inflation. The total rises for two reasons the figure does not separate: existing property being revalued, and new buildings being added. It is the whole county, since the state does not publish this series for the city alone, and Lincoln is about 83% of the county's value today. It is taxable value, so exempt property is left out.</p>
${go('grow','Watch the city get built, year by year')}${go('pv','Today\'s value, one bar per property')}
<p class="psub">Source: Nebraska Department of Revenue, Property Assessment Division, annual reports for ${UNLL('https://revenue.nebraska.gov/sites/default/files/doc/pad/research/annual-reports/2025/annrpt2025%20table%204%20.pdf','2025')} and ${UNLL('https://revenue.nebraska.gov/sites/revenue.nebraska.gov/files/doc/pad/research/annual-reports/2015/annrpt2015_table_4.pdf','2015')}, Table 4A. The two reports agree on 2015. Earlier years exist in older reports and are not loaded yet.</p>`}
  const mxs=Math.max(...VALD.map(d=>d[2])),tot=VALD.reduce((a,d)=>a+d[2],0),nn=VALD.reduce((a,d)=>a+d[1],0);
  return `<h4>Lincoln's homes by the decade they were built</h4><p>${nn.toLocaleString('en-US')} homes in Lincoln's main tax district, grouped by year built, at their 2026 assessed values. Together: ${B(tot)}.</p>`
   +VALD.map(d=>`<div class="prow"><span>${d[0]===1880?'1880s':d[0]===2020?'2020 on':d[0]+'s'} · ${d[1].toLocaleString('en-US')} homes</span>${bar(d[2]/mxs)}<b>${B(d[2])}</b></div>`).join('')
   +`<h4>What a home from each era is assessed at now</h4><div class="tw"><table><thead><tr><th>Built</th><th>Median value</th><th>Median size</th><th>Per square foot</th></tr></thead><tbody>`
   +VALD.filter(d=>d[1]>500).map(d=>`<tr><td>${d[0]===2020?'2020 on':d[0]+'s'}</td><td>$${d[3].toLocaleString('en-US')}</td><td>${d[5].toLocaleString('en-US')} sq ft</td><td>$${d[4]}</td></tr>`).join('')+`</tbody></table></div>
<p>The 2000s built the most homes that still stand, with the 1950s close behind, and the 1990s and 2000s hold the most value. Homes from the 1940s and 1950s are the smallest. Per square foot, a house from the 1950s is assessed about the same as one from the 1990s; newer homes are worth more mostly because they are bigger.</p>
<h4>What this is not</h4><p>It is not a price history. It shows today's value of the homes that survive from each decade, so homes torn down are missing, and it says nothing about what they sold for when new. Homes with no year or floor area on record are left out.</p>${go('grow','Watch the city get built, year by year')}
<p class="psub">Source: Lancaster County Assessor parcels, retrieved November 21, 2026; computed by this map. Tax district 0001, improved residential, floor area on record.</p>`}
const VALS={title:'Value over <i>time</i>',tabs:['20 years of value','Built by decade'],html:valHTML,click:e=>{const b=e.target.closest('.go2');if(!b)return;const d=b.dataset;closeSheet();if(d.grow)growOpen();else if(d.pv)dlSet('pv',true)}};
function valOpen(i){lastInput=performance.now();openSheet(VALS,i||0)}

// ---- who shows up: registered voters and ballots cast in every precinct, Lincoln city general election, May 6, 2025.
// Read from the Election Commissioner's Official Final Precinct Results. The same number for every precinct, shown the same way.
const T25S="01A00,731,122;01A01,1552,353;01B00,581,61;01D01,977,175;01D02,1782,338;01D04,1064,326;01D05,887,193;01D06,1280,270;01D07,778,247;01D08,1209,260;01D09,1186,196;01D10,1343,225;01D11,1306,147;01E02,1636,154;01E03,751,129;01E04,943,240;01E05,1078,189;01E06,1096,259;01E07,1762,216;01E08,936,228;01E09,1427,396;01F01,1170,160;01F02,1171,177;01F03,1280,233;01F04,1197,191;02A00,1818,293;02C01,1338,192;02C02,1031,208;02C03,900,199;02D01,1013,143;02D02,1653,308;02D03,1090,222;03A00,1403,227;03D00,525,19;04A00,1334,256;05B01,1392,210;05C01,827,157;05C03,1560,357;05E03,700,200;05E04,917,281;05E05,1089,461;05E07,1753,343;05E08,1102,280;05E09,1059,437;05E11,691,115;06A01,1258,270;06D02,1311,282;06E01,1381,485;06E02,1197,359;07A00,1422,182;07D02,1155,290;08A00,1037,132;08C02,1255,238;09A01,896,220;09C01,993,278;09D01,907,281;09E01,910,372;09E02,955,422;09E04,625,288;09E05,848,422;09F01,934,374;09F02,1206,376;09F03,938,326;09F04,823,276;09F05,832,230;09F09,1252,234;09F11,713,180;09G01,1033,400;09G02,839,234;09G03,848,252;09G04,1083,233;09G05,1056,350;09G06,746,251;09G07,708,273;09G08,913,313;09G09,753,240;09H01,937,375;09H02,918,304;09H03,971,263;09H04,913,347;09H05,774,202;09H06,876,302;09H07,915,278;09H08,872,212;09H09,1690,390;10A00,1349,320;10B01,1433,407;10B02,592,203;10B03,625,209;10B04,945,395;10B05,1376,330;10C04,646,286;10C05,737,252;10C06,599,201;10C08,580,270;10C12,750,307;10D01,683,227;10D02,1221,393;10D03,490,113;10D04,937,274;10D08,1039,366;10E01,532,227;10E04,1095,368;10E05,1135,314;10E07,1039,288;10E08,980,257;10E10,1111,358;10E11,545,234;10E12,1287,261;10E14,1053,384;10E15,658,260;10E16,1482,466;10E17,1015,275;10F01,709,185;10F02,561,152;10F03,608,273;10F04,805,286;10F05,813,343;10F06,723,228;10F07,902,359;10F10,1143,438;10F11,1091,373;10F12,854,275;10F14,1083,469;10F15,825,337;10F16,688,318;10G01,920,403;10G02,1268,508;10G03,951,309;10G04,1136,330;10G05,676,267;10G06,1054,397;10G07,711,257;10G08,621,254;10H01,1067,479;10H02,1150,528;10H03,1546,473;10H04,1394,460;10H05,1146,277;10H06,1372,529;10H07,1569,448;10H08,1113,247;10H09,1041,271;10H10,1314,334;11A01,1019,186;11A02,852,127;11B01,1095,198;11D02,815,139;11E01,1076,216;11E03,1360,297;11E05,635,174;11E06,1211,211;11E07,733,172;11E10,625,158;12A04,1469,343;12A05,909,246;12A07,1183,392;12A08,832,283;12A09,897,260;12A10,1729,444;12A11,1399,339;12B01,1101,244;12B02,809,199;12B04,953,310;12B06,823,256;12B07,826,271;12B08,1373,375;12B09,1455,393;12C02,1370,375;12C06,665,135;12C07,1606,437;12D00,1437,283;12F00,914,216;12G01,1025,159;12G02,1397,247;denton,757,65;middlecreek,103,21;yankeehill,1991,298";const T25={};T25S.split(';').forEach(s=>{const q=s.split(',');T25[q[0]]=[+q[1],+q[2]]});const T25C=[185244,49650];
function t25Key(s){s=String(s||'').trim();const m=/^0*(\d{1,2})\s*([A-Za-z])\s*(?:[-~]?\s*0*(\d{1,2}))?$/.exec(s);return m?String(+m[1]).padStart(2,'0')+m[2].toUpperCase()+String(+(m[3]||0)).padStart(2,'0'):s.toLowerCase().replace(/[^a-z0-9]/g,'')}
function t25(name){const v=T25[t25Key(name)];return v&&v[0]>=50?v:null}
function t25Line(name){const v=t25(name);if(!v)return '';const r=v[1]/v[0],n=Math.max(2,Math.round(1/r));return `In the May 2025 city election, ${v[1].toLocaleString('en-US')} of ${v[0].toLocaleString('en-US')} registered voters here voted: ${(100*r).toFixed(1)}%${r<.3?', about 1 in '+n:''}. Citywide it was ${(100*T25C[1]/T25C[0]).toFixed(1)}%.`}
function turnoutOpen(){lastInput=performance.now();flyTo(camTo(-5200,-5600,11000,200,42),2200);setVotes(true);if(DM.S){const k=DM.S.findIndex(s=>s.k==='t25');if(k>=0)dmShow(k)}}

// a square picture of one precinct's turnout, for a neighborhood group or a class to post. Same card for every precinct.
function t25Share(name){const v=t25(name);if(!v)return;const c=document.createElement('canvas');c.width=c.height=1080;const g=c.getContext('2d'),r=v[1]/v[0],city=T25C[1]/T25C[0],F='system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
  g.fillStyle='#0b1020';g.fillRect(0,0,1080,1080);g.fillStyle='#e2b93b';g.fillRect(0,0,1080,14);g.textAlign='left';
  g.fillStyle='#e2b93b';g.font='700 40px '+F;g.fillText('STARCITY',80,120);g.fillStyle='#9aa3b8';g.font='400 34px '+F;g.fillText('Lincoln, Nebraska · public records',300,120);
  g.fillStyle='#ffffff';g.font='700 58px '+F;g.fillText('Voting precinct '+name,80,250);g.fillStyle='#9aa3b8';g.font='400 38px '+F;g.fillText('City election, May 6, 2025',80,310);
  g.fillStyle='#e2b93b';g.font='800 300px '+F;g.fillText((100*r).toFixed(0)+'%',70,610);g.fillStyle='#ffffff';g.font='600 50px '+F;g.fillText('of registered voters here voted',80,700);
  g.fillStyle='#c9d0e0';g.font='400 40px '+F;g.fillText(v[1].toLocaleString('en-US')+' of '+v[0].toLocaleString('en-US')+' voted. '+(v[0]-v[1]).toLocaleString('en-US')+' did not.',80,770);
  const bar=(y,f,col,lab)=>{g.fillStyle='#1c2440';g.fillRect(80,y,920,34);g.fillStyle=col;g.fillRect(80,y,920*Math.min(1,f/.5),34);g.fillStyle='#c9d0e0';g.font='400 30px '+F;g.fillText(lab,80,y-12)};
  bar(860,r,'#e2b93b','This precinct: '+(100*r).toFixed(1)+'%');bar(950,city,'#7f8aa8','All of Lincoln: '+(100*city).toFixed(1)+'%');
  g.fillStyle='#9aa3b8';g.font='400 28px '+F;g.fillText('Source: Lancaster County Election Commissioner, official precinct results',80,1030);g.textAlign='right';g.fillStyle='#e2b93b';g.font='700 30px '+F;g.fillText('starcitylincoln.org',1000,1066);
  c.toBlob(async bl=>{if(!bl)return;const fn='starcity-precinct-'+t25Key(name)+'.png',file=new File([bl],fn,{type:'image/png'});
    try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Precinct '+name+' turnout',text:'How many of us voted in the last city election? starcitylincoln.org'});return}}catch(e){if(e&&e.name==='AbortError')return}
    const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=fn;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)},'image/png');return c}

// ---- a one-page neighborhood sheet for one spot: what an agent, a seller or a buyer would otherwise gather by hand.
// It leaves out voting and anything about who lives nearby, on purpose, and says what it is not.
function spotSheetDoc(label){const x=SPOT.x,z=SPOT.z,lat=H.lat0-z/KYm,lon=H.lon0+x/KXm,d=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});let hd='';try{const L=DL.get('hoods');if(L&&L.X){const i=dlAt(L,x,z);if(i>=0)hd=String(fget(L,L.fields.find(f=>f.k==='name'))(i))}}catch(e){}
  const body=spotHTML(true).replace(/<h4>Who decides for this spot<\/h4>/,'<h4>Districts and who represents this spot</h4>');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Neighborhood sheet · STARCITY</title><style>
body{font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#151a2c;max-width:760px;margin:0 auto;padding:22px}h1{font-size:24px;margin:0 0 2px}h4{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#8a6a00;border-bottom:1px solid #d9dce6;padding-bottom:3px;margin:20px 0 8px}
p{margin:0 0 9px}.psub{color:#5b6278;font-size:12.5px}.top{border-top:6px solid #e2b93b;padding-top:12px}.brand{font-weight:700;letter-spacing:.2em;color:#8a6a00;font-size:12px}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border-top:1px solid #d9dce6;padding:4px 6px;text-align:left}
.pbar{display:inline-block;width:90px;height:7px;background:#e6e8ef;border-radius:4px;vertical-align:middle;margin:0 6px}.pbar i{display:block;height:7px;background:#e2b93b;border-radius:4px}.prow{display:flex;justify-content:space-between;gap:8px;font-size:13px;border-top:1px solid #eceef4;padding:3px 0}
button{font:inherit;padding:8px 14px;border-radius:8px;border:1px solid #8a6a00;background:#e2b93b;cursor:pointer}.note{background:#f5f6fa;border-radius:8px;padding:10px 12px;margin-top:18px}a{color:#1d4ed8}@media print{button{display:none}body{padding:0}}
</style></head><body><div class="top"><div class="brand">STARCITY · LINCOLN, NEBRASKA</div><h1>Neighborhood sheet</h1>${label?'<p><b>Near '+esc(label)+'</b></p>':''}<p class="psub">${hd?esc(hd)+' · ':''}${lat.toFixed(5)}, ${lon.toFixed(5)} · prepared ${d} from public records · free at starcitylincoln.org</p><p><button onclick="print()">Print or save as PDF</button></p></div>
${body}
<div class="note"><p><b>What this sheet is not.</b> It is not an appraisal or a price opinion. Assessed value is the county's figure for tax purposes and recent Lincoln sales have run above it. The value and age figures describe the blocks around this spot, not one house. Tax figures are estimates before credits and exemptions.</p>
<p><b>What it leaves out on purpose.</b> Nothing here describes the people who live nearby. It has no owner names, no income or demographic figures and no voting information. Those do not belong in a decision about housing.</p>
<p class="psub">Check anything that matters to a sale against the source: the Lancaster County Assessor for the parcel, the city's floodplain office for flood status, and Lincoln Public Schools for attendance areas, which this sheet does not show. Live map: <a href="https://starcitylincoln.org">starcitylincoln.org</a></p></div></body></html>`}
function spotSheet(label){const u=URL.createObjectURL(new Blob([spotSheetDoc(label)],{type:'text/html'}));const w=window.open(u,'_blank');if(!w)location.href=u}

// ---- Your dollar: where a renter's or a shopper's money goes. Rates are the state's published ones; the rent share is arithmetic the reader does with their own building.
function ydCalc(){const t=+($('ydT')||{}).value||0,u=Math.max(1,+($('ydU')||{}).value||1),o=$('ydO');if(!o)return;if(!t){o.textContent='Enter the yearly tax from your building\'s card.';return}const m=t/u/12;o.textContent='About $'+Math.round(m).toLocaleString('en-US')+' a month for each unit, if the tax is spread evenly and passed through in rent. Of that, about $'+Math.round(m*.622)+' is Lincoln Public Schools, $'+Math.round(m*.178)+' the city and $'+Math.round(m*.129)+' the county.'}
function ydHTML(i){const go=(k,l)=>`<button class="btn go2" data-${k}="1">${l}</button>`;
  if(i===0)return `<h4>Renters pay property tax too</h4><p>You never see the bill. Your landlord does, and it is one of the costs your rent covers. In most of Lincoln the 2025 rate is $1.666 for every $100 of assessed value, so a building assessed at $1 million owes about $16,663 a year.</p>
<h4>Find your share</h4><p>1. Search your address or tap your building. Its card shows the assessed value and an estimate of this year's tax.<br>2. Put that tax and the number of units here.</p>
<p><label>Yearly tax on the building $ <input id="ydT" type="number" inputmode="numeric" min="0" style="width:8em"></label><br><label>Units in the building <input id="ydU" type="number" inputmode="numeric" min="1" value="1" style="width:5em"></label></p><p id="ydO" class="psub">Enter the yearly tax from your building's card.</p>
${levyHTML(0)}
<p class="psub">The share is an estimate. Units differ in size, and how much of a tax a landlord passes on depends on the rental market. Unit counts are not in the public record this map uses, so you supply that number.</p>${go('find','Search my address')}${go('spot','Everything about one spot')}`;
  if(i===1)return `<h4>A $10 purchase in Lincoln</h4><div class="prow"><span>State of Nebraska, 5.5%</span>${bar(5.5/7.25)}<b>55¢</b></div><div class="prow"><span>City of Lincoln, 1.75%</span>${bar(1.75/7.25)}<b>17.5¢</b></div>
<p>72.5 cents of sales tax on $10, a combined 7.25%. The county adds nothing. Unprepared groceries are not taxed in Nebraska.</p>
<h4>You voted on part of it</h4><p>In April 2025 Lincoln voters renewed a quarter-cent of the city's share for street work, 29,757 to 13,998. That is 68.0% in favor, on a turnout of about one registered voter in four.</p>
<h4>Outside the city limits</h4><p>Buy the same thing in a part of the county with no city tax and you pay only the state's 5.5%.</p>${go('turn','Who voted in that election')}
<p class="psub">Rates: ${UNLL('https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2026/salestax/slstax_rates_07-01-2026.pdf','Nebraska Department of Revenue, local sales and use tax rates effective July 1, 2026')}. Vote: Lancaster County Election Commissioner, official precinct results.</p>`;
  return `<h4>Who sets each piece, and when you can weigh in</h4><p><b>Property tax rates.</b> Each body sets its own every September: the school board, the City Council, the County Board and the rest. Their budget hearings are public.</p><p><b>City sales tax.</b> The City Council puts it on the ballot and voters decide.</p><p><b>State sales and income tax, and the university's state funding.</b> The Legislature, which meets each January a few blocks from campus.</p><p><b>Tuition and fees.</b> The Board of Regents, usually in June.</p>
<h4>The shortest path</h4><p>City elections are decided by about a quarter of registered voters. In the precinct that votes at the Nebraska Union, 19 of 525 registered voters cast a ballot in May 2025. About 7,400 people lived in that precinct at the 2020 census.</p>
${go('cc','City Council')}${go('rg','Board of Regents')}${go('turn','Turnout by precinct')}<p><a href="https://www.lancaster.ne.gov/election" target="_blank" rel="noopener">Register or check your registration with the Election Commissioner ↗</a></p>`}
const YDS={title:'Your <i>dollar</i>',tabs:['If you rent','When you buy','Who decides'],html:ydHTML,click:e=>{const b=e.target.closest('.go2');if(!b)return;const d=b.dataset;closeSheet();if(d.find){if($('find').style.display!=='block')$('bFind').click()}else if(d.spot)spotArm();else if(d.turn)turnoutOpen();else if(d.cc)councilOpen(0);else if(d.rg)regentsCard()}};
function ydOpen(i){lastInput=performance.now();openSheet(YDS,i||0)}
document.addEventListener('input',e=>{if(e.target&&(e.target.id==='ydT'||e.target.id==='ydU'))ydCalc()});

// ---- crashes, 2024 to mid 2026: Lincoln Police records placed on the street network by this map.
// The city publishes each crash as a line of street text with no coordinates. tools/analysis/crashes/geocode.py does the placing.
const CRASH={d:null,pts:null,mode:0,loading:null,MODES:['All crashes','Injury and fatal','Pedestrian','Bicycle','Night, 9 p.m. to 3 a.m.','Hit and run']};
function crashLoad(){if(CRASH.d)return Promise.resolve(CRASH.d);if(CRASH.loading)return CRASH.loading;CRASH.loading=fetch('data/crashes-2024-2026.json').then(r=>r.json()).then(j=>{const n=j.lon.length,X=new Float32Array(n*2);for(let i=0;i<n;i++){X[2*i]=(j.lon[i]/1e5-H.lon0)*KXm;X[2*i+1]=-(j.lat[i]/1e5-H.lat0)*KYm}j.X=X;j.n=n;CRASH.d=j;return j}).catch(()=>{CRASH.loading=null;return null});return CRASH.loading}
function crashPick(i,m){const d=CRASH.d,s=d.s[i],f=d.f[i];return m===0||(m===1&&s>0)||(m===2&&(f&1))||(m===3&&(f&2))||(m===4&&(f&8))||(m===5&&(f&4))}
function crashNear(x,z,R){const d=CRASH.d;if(!d)return null;const o={n:0,inj:0,fatal:0,ped:0,bike:0};for(let i=0;i<d.n;i++){if((d.X[2*i]-x)**2+(d.X[2*i+1]-z)**2>R*R)continue;o.n++;if(d.s[i]>0)o.inj++;if(d.s[i]===2)o.fatal++;if(d.f[i]&1)o.ped++;if(d.f[i]&2)o.bike++}return o}
function crashDraw(){const d=CRASH.d;if(!d)return;if(CRASH.pts){scene.remove(CRASH.pts);CRASH.pts.geometry.dispose()}const P=[],C=[],col=[[.55,.68,.95],[1,.6,.15],[1,.15,.2]];let k=0;
  for(let i=0;i<d.n;i++){if(!crashPick(i,CRASH.mode))continue;const x=d.X[2*i]+((i*37)%11-5)*2.2,z=d.X[2*i+1]+((i*53)%11-5)*2.2;P.push(x,hAt(x,z)+4+d.s[i]*3,z);C.push(...col[d.s[i]]);k++}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  CRASH.pts=new THREE.Points(g,new THREE.PointsMaterial({size:mobile?5:4,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.85,depthWrite:false}));CRASH.pts.frustumCulled=false;CRASH.pts.renderOrder=3;scene.add(CRASH.pts);CRASH.shown=k;dirty=true}
function crashCard(){const d=CRASH.d;if(!d)return;let inj=0,fat=0,ped=0,bike=0;for(let i=0;i<d.n;i++){if(d.s[i]>0)inj++;if(d.s[i]===2)fat++;if(d.f[i]&1)ped++;if(d.f[i]&2)bike++}const nx=(CRASH.mode+1)%CRASH.MODES.length;
  showCard('Crashes, 2024 to June 2026 · '+CRASH.MODES[CRASH.mode],`${N0(CRASH.shown)} dots showing. Blue is no injury, orange is an injury, red is a death. Lincoln Police recorded ${N0(d.rows)} crashes from January 2024 through June 2026. The city publishes each one as a line of street text with no map coordinates, so this map placed them itself: ${N0(d.placed)} of ${N0(d.rows)}, ${(100*d.placed/d.rows).toFixed(1)}%, could be put on a street. Of those, ${N0(inj)} involved an injury, ${N0(fat)} a death, ${N0(ped)} a pedestrian and ${N0(bike)} a bicycle. A crash on a block is drawn at the middle of that block, and dots are nudged apart so they do not hide each other, so read this by corridor and corner, not by doorstep. The ${N0(d.rows-d.placed)} it could not place are not on the map. Counts have not yet been checked against a published city total.`,undefined,{label:'Show: '+CRASH.MODES[nx].toLowerCase()+' ▸',fn:()=>{CRASH.mode=nx;crashDraw();crashCard()}},[{label:'Hide crashes',fn:()=>{crashOff();hideCard()}},{href:'https://github.com/RobotWhiteBread/STARCITY/tree/main/tools/analysis/crashes',label:'How they were placed ↗'},{href:'data_public/crashes_2024_2026_placed.csv',label:'Download the table ↗'}])}
function crashOff(){if(CRASH.pts){scene.remove(CRASH.pts);CRASH.pts.geometry.dispose();CRASH.pts=null;dirty=true}}
function crashOpen(){lastInput=performance.now();showCard('Crashes','Loading crash records…');crashLoad().then(d=>{if(!d){showCard('Crashes','The crash file did not load with this copy of the map.');return}CRASH.mode=0;crashDraw();crashCard();flyTo(camTo(-4200,-5200,9000,200,50),2000)})}
