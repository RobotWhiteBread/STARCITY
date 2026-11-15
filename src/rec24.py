import io,sys
P='/home/claude/work/page_pre_p19.html'
s=io.open(P,encoding='utf-8').read()
n=0
def rep(a,b,why):
    global s,n
    if a not in s:
        print('MISS:',why,file=sys.stderr);sys.exit(1)
    if s.count(a)!=1:
        print('AMBIGUOUS (%d):'%s.count(a),why,file=sys.stderr);sys.exit(1)
    s=s.replace(a,b);n+=1

# ---- 1. the full record set. indices 2-5 stay the names, 6 onward are the crowds,
#         because the records panel reads VBMSG.slice(2,6) and VBMSG.slice(6).
OLD_VBMSG = s[s.index('const VBMSG=['):s.index('\n',s.index('const VBMSG=['))]
NEW_VBMSG = ("const VBMSG=[['CENTER OF THE','VOLLEYBALL UNIVERSE'],"
 "['DEVANEY CENTER · ALSO KNOWN AS','DBK UNIVERSE ★'],"
 "['OPENED 1976 · NAMED FOR BOB DEVANEY IN 1978','BOB DEVANEY SPORTS CENTER'],"
 "['THE ARENA · NAMED APRIL 11, 2025','JOHN COOK ARENA'],"
 "['THE COURT · DEDICATED SEPT 6, 2013','TERRY PETTIT COURT'],"
 "['COACH DANI BUSBOOM KELLY · SINCE 2025','THE DBK UNIVERSE'],"
 # --- crowds and venue records, newest and biggest first, each with the date it was true
 "['EVERY HOME MATCH SINCE 2001','350+ STRAIGHT SELLOUTS'],"
 "['AMERICAN RECORD CROWD · AUG 30, 2023','92,003'],"
 "['MEMORIAL STADIUM BEFORE THAT · 2014','91,585'],"
 "['ONLY BIGGER ANYWHERE · 1971 WORLD CUP FINAL','ABOUT 110,000'],"
 "['LARGEST INDOOR HOME CROWD · SEPT 16, 2026','15,405'],"
 "['INDOOR HOME RECORD BEFORE THAT · 2009','13,870'],"
 "['JOHN COOK ARENA RECORD · SEPT 10, 2026','10,497'],"
 "['ARENA SEATS AFTER THE 2026 RESEAT','10,000+'],"
 "['ARENA SEATS BEFORE IT','8,309'],"
 "['NCAA ATTENDANCE LEADER · AS OF 2025','11 YEARS RUNNING'],"
 "['2021 NCAA FINAL · A RECORD THEN','18,755'],"
 "['2022 AT CREIGHTON · A RECORD THEN','15,797'],"
 "['2025 AT UCLA · PAULEY PAVILION RECORD','10,498'],"
 "['OF THE 9 BIGGEST NCAA CROWDS · AS OF 2023','NEBRASKA PLAYED IN 8'],"
 "['THIS BUILDING ALL-TIME · BASKETBALL, FEB 7 1981','15,038']];")
rep(OLD_VBMSG,NEW_VBMSG,'VBMSG record list')

# ---- 2. the long-form card text: American record, not world record, plus the 2026 records
old_rec = s[s.index('const VBREC=TAG+'):s.index('\n',s.index('const VBREC=TAG+'))]
new_rec = ('const VBREC=TAG+". Crowd records, each with the date it was true. More than 350 straight sellouts, '
 "every home match since 2001, the longest streak in NCAA women's sports (the 350th was Nov 20, 2025). "
 'Led the NCAA in attendance 11 years running as of 2025. 92,003 at Memorial Stadium on Aug 30, 2023, '
 "the American record for a women's sporting event, past the stadium's own 91,585 against Miami in 2014; "
 'the only larger crowd recorded anywhere for a women\\u2019s event is the 1971 World Cup final in Mexico City, '
 'estimated at about 110,000. 15,405 at Pinnacle Bank Arena against Creighton on Sept 16, 2026, the largest '
 'indoor home crowd in program history, past 13,870 against UCLA at the Devaney Center in 2009. 10,497 on '
 'Sept 10, 2026 for the reopening of the renovated John Cook Arena, a building record for volleyball, with '
 'the reseat taking the arena from 8,309 seats to more than 10,000. 18,755 at the 2021 NCAA final and 15,797 '
 'at Creighton in 2022, both records at the time. 10,498 at UCLA in 2025, the most ever for volleyball at '
 'Pauley Pavilion. Played in 8 of the 9 biggest crowds in NCAA volleyball history as of 2023. The most for '
 'anything in this building is 15,038, for basketball against Oklahoma State on Feb 7, 1981. '
 'The rooftop sign and the giant volleyball are this map\\u2019s own additions.";')
rep(old_rec,new_rec,'VBREC card text')

# ---- 3. the stadium itself
rep("s.userData.info=['Memorial Stadium',`World record holder: on Volleyball Day in Nebraska (Aug 30, 2023), ${RECORD.toLocaleString('en-US')} fans watched Nebraska sweep Omaha here, the largest announced crowd ever for a women's sporting event.",
    "s.userData.info=['Memorial Stadium',`American record holder: on Volleyball Day in Nebraska (Aug 30, 2023), ${RECORD.toLocaleString('en-US')} fans watched Nebraska sweep Omaha here, the largest crowd ever recorded at a women's sporting event in the United States, and the second largest anywhere after the 1971 World Cup final in Mexico City. It passed this stadium's own record of 91,585, set against Miami in 2014.",
    'Memorial Stadium info card')

# ---- 4. the floating label
rep("labels[labels.length-1].sub=`World record crowd: ${RECORD.toLocaleString('en-US')} · Volleyball Day 2023`",
    "labels[labels.length-1].sub=`American record crowd: ${RECORD.toLocaleString('en-US')} · Volleyball Day 2023`",
    'stadium label subtitle')

# ---- 5. the chip
rep("['World record crowd','Memorial Stadium on game day, home of the 92,003 Volleyball Day record.'",
    "['Record crowd','Memorial Stadium on game day, home of the 92,003 Volleyball Day record.'",
    'stadium chip')

# ---- 6. the videoboard on the stadium
rep("c.fillText('WORLD RECORD CROWD',640,54)","c.fillText('AMERICAN RECORD CROWD',640,54)",'stadium videoboard')

# ---- 7. the rooftop board: let a long label shrink to fit instead of running off the panel
rep("x.font=`700 58px ${F}`;x.fillStyle=ink||'#ffd34d';x.globalAlpha=.8;x.fillText(sub,w/2,86);x.globalAlpha=1;",
    "let ss=58;x.font=`700 ${ss}px ${F}`;const sw=x.measureText(sub).width;if(sw>w-120){ss=Math.floor(ss*(w-120)/sw);x.font=`700 ${ss}px ${F}`}\n       x.fillStyle=ink||'#ffd34d';x.globalAlpha=.8;x.fillText(sub,w/2,86);x.globalAlpha=1;",
    'billboard sub line shrink to fit')

# ---- 8. more records to get through, so turn the board a little faster
rep("if(LM.devBill&&now-devT>4200)","if(LM.devBill&&now-devT>3200)",'billboard turn interval')

io.open(P,'w',encoding='utf-8').write(s)
print('page_pre_p19.html: %d edits applied'%n)
