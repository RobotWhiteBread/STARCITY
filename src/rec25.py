import io,sys
P='/home/claude/work/page_pre_p19.html'
s=io.open(P,encoding='utf-8').read();n=0
def rep(a,b,why):
    global s,n
    if s.count(a)!=1: print('MISS/AMBIG (%d):'%s.count(a),why,file=sys.stderr);sys.exit(1)
    s=s.replace(a,b);n+=1

# ---- the record set, corrected. 92,003 is the world record: it broke the 91,648 that the
#      record keepers recognised, and the map now carries that progression instead of a
#      disputed 1971 estimate that never held the mark.
OLD=s[s.index('const VBMSG=['):s.index('\n',s.index('const VBMSG=['))]
NEW=("const VBMSG=[['CENTER OF THE','VOLLEYBALL UNIVERSE'],"
 "['DEVANEY CENTER · ALSO KNOWN AS','DBK UNIVERSE ★'],"
 "['OPENED 1976 · NAMED FOR BOB DEVANEY IN 1978','BOB DEVANEY SPORTS CENTER'],"
 "['THE ARENA · NAMED APRIL 11, 2025','JOHN COOK ARENA'],"
 "['THE COURT · DEDICATED SEPT 6, 2013','TERRY PETTIT COURT'],"
 "['COACH DANI BUSBOOM KELLY · SINCE 2025','THE DBK UNIVERSE'],"
 "['EVERY HOME MATCH SINCE 2001','350+ STRAIGHT SELLOUTS'],"
 "['WORLD RECORD CROWD · AUG 30, 2023','92,003'],"
 "['THE WORLD RECORD IT BROKE · BARCELONA 2022','91,648'],"
 "['THE AMERICAN RECORD IT BROKE · ROSE BOWL 1999','90,185'],"
 "['MEMORIAL STADIUM BEFORE IT · FOOTBALL VS MIAMI 2014','91,585'],"
 "['LARGEST INDOOR HOME CROWD · SEPT 16, 2026','15,405'],"
 "['INDOOR HOME RECORD BEFORE IT · 2009','13,870'],"
 "['JOHN COOK ARENA RECORD · SEPT 10, 2026','10,497'],"
 "['ARENA SEATS AFTER THE 2026 RESEAT','10,000+'],"
 "['ARENA SEATS BEFORE IT','8,309'],"
 "['NCAA ATTENDANCE LEADER · AS OF 2025','11 YEARS RUNNING'],"
 "['REGULAR SEASON INDOOR RECORD · AT CREIGHTON 2025','17,675'],"
 "['2021 NCAA FINAL · A RECORD THEN','18,755'],"
 "['2022 AT CREIGHTON · A RECORD THEN','15,797'],"
 "['2025 AT UCLA · PAULEY PAVILION RECORD','10,498'],"
 "['OF THE 9 BIGGEST NCAA CROWDS · AS OF 2023','NEBRASKA PLAYED IN 8'],"
 "['THIS BUILDING ALL-TIME · BASKETBALL, FEB 7 1981','15,038']];")
rep(OLD,NEW,'VBMSG')

old=s[s.index('const VBREC=TAG+'):s.index('\n',s.index('const VBREC=TAG+'))]
new=('const VBREC=TAG+". Crowd records, each with the date it was true. More than 350 straight sellouts, '
 "every home match since 2001, the longest streak in NCAA women's sports (the 350th was Nov 20, 2025). "
 'Led the NCAA in attendance 11 years running as of 2025. 92,003 at Memorial Stadium on Aug 30, 2023, '
 "the world record for a women's sporting event: it broke the 91,648 at Barcelona against Wolfsburg in "
 'the 2022 Champions League, and the American mark of 90,185 at the 1999 World Cup final at the Rose Bowl. '
 "It is this stadium's record too, past the 91,585 who watched Nebraska beat Miami at football in 2014. "
 '15,405 at Pinnacle Bank Arena against Creighton on Sept 16, 2026, the largest indoor home crowd in '
 'program history, past 13,870 against UCLA at the Devaney Center in 2009. 10,497 on Sept 10, 2026 for the '
 'reopening of the renovated John Cook Arena, a building record for volleyball, with the reseat taking the '
 'arena from 8,309 seats to more than 10,000. 17,675 at Creighton in 2025, the NCAA regular season indoor '
 'record. 18,755 at the 2021 NCAA final and 15,797 at Creighton in 2022, both records at the time. 10,498 '
 'at UCLA in 2025, the most ever for volleyball at Pauley Pavilion. Played in 8 of the 9 biggest crowds in '
 'NCAA volleyball history as of 2023. The most for anything in this building is 15,038, for basketball '
 'against Oklahoma State on Feb 7, 1981. The rooftop sign and the giant volleyball are this map\\u2019s own additions.";')
rep(old,new,'VBREC')

rep("s.userData.info=['Memorial Stadium',`American record holder: on Volleyball Day in Nebraska (Aug 30, 2023), ${RECORD.toLocaleString('en-US')} fans watched Nebraska sweep Omaha here, the largest crowd ever recorded at a women's sporting event in the United States, and the second largest anywhere after the 1971 World Cup final in Mexico City. It passed this stadium's own record of 91,585, set against Miami in 2014.",
    "s.userData.info=['Memorial Stadium',`World record holder: on Volleyball Day in Nebraska (Aug 30, 2023), ${RECORD.toLocaleString('en-US')} fans watched Nebraska sweep Omaha here, the largest crowd ever recorded at a women's sporting event. It broke the 91,648 at Barcelona against Wolfsburg in 2022, and the American mark of 90,185 at the 1999 World Cup final at the Rose Bowl. It is this stadium's record too, past the 91,585 who watched Nebraska beat Miami at football in 2014.",
    'stadium card')
rep("labels[labels.length-1].sub=`American record crowd:","labels[labels.length-1].sub=`World record crowd:",'label')
rep("['Record crowd','Memorial Stadium on game day","['World record crowd','Memorial Stadium on game day",'chip')
rep("c.fillText('AMERICAN RECORD CROWD',640,54)","c.fillText('WORLD RECORD CROWD',640,54)",'videoboard')
io.open(P,'w',encoding='utf-8').write(s);print('page_pre_p19.html: %d edits'%n)

def edit(path,pairs):
    t=io.open(path,encoding='utf-8').read();k=0
    for a,b,why in pairs:
        if t.count(a)!=1: print('MISS/AMBIG:',path,why,file=sys.stderr);sys.exit(1)
        t=t.replace(a,b);k+=1
    io.open(path,'w',encoding='utf-8').write(t);print('%s: %d edits'%(path.split('/')[-1],k))

edit('/home/claude/work/layers_i.js',[(
 "In 2023 the team drew 92,003 to Memorial Stadium, the largest crowd ever recorded at a women's sporting event in the United States.",
 "In 2023 the team drew 92,003 to Memorial Stadium, the largest crowd ever recorded at a women's sporting event anywhere.",'blurb')])

edit('/home/claude/work/layers_k.js',[(
 "T('The largest crowd ever recorded at a women\\'s sporting event in the United States, in a football stadium. Only the 1971 World Cup final in Mexico City, estimated at about 110,000, is reported larger anywhere.');",
 "T('The largest crowd ever recorded at a women\\'s sporting event, in a football stadium. It broke the 91,648 at Barcelona in 2022 and this stadium\\'s own record of 91,585 against Miami in 2014.');",'football panel')])
