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
