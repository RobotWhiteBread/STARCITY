import io,sys
def edit(path,pairs):
    s=io.open(path,encoding='utf-8').read();n=0
    for a,b,why in pairs:
        if a not in s: print('MISS:',path,why,file=sys.stderr);sys.exit(1)
        if s.count(a)!=1: print('AMBIGUOUS:',path,why,file=sys.stderr);sys.exit(1)
        s=s.replace(a,b);n+=1
    io.open(path,'w',encoding='utf-8').write(s);print('%s: %d edits'%(path.split('/')[-1],n))

# ---- the rooftop board now cycles every record the records panel holds, so the two can never disagree
edit('/home/claude/work/layers_r.js',[(
  "  out.push(['STRAIGHT SELLOUTS SINCE 2001','350+','#7d0a1d','#fff4d6']);\n"
  "  out.push(['VOLLEYBALL DAY IN NEBRASKA, AUG 30 2023','92,003','#0d0f14','#ffd34d']);\n"
  "  out.push(['NEBRASKA VOLLEYBALL','CENTER OF THE VOLLEYBALL UNIVERSE','#7d0a1d','#fff4d6']);\n",
  "  // every crowd and venue record, read from the same list the records panel reads, so the board and the\n"
  "  // card can never disagree. VBMSG.slice(6) is the crowds; the colors alternate so the board visibly turns.\n"
  "  try{VBMSG.slice(6).forEach((m,k)=>out.push([m[0],m[1],k%2?'#7d0a1d':'#0d0f14',k%2?'#fff4d6':'#ffd34d']))}catch(e){}\n"
  "  out.push(['NEBRASKA VOLLEYBALL','CENTER OF THE VOLLEYBALL UNIVERSE','#7d0a1d','#fff4d6']);\n",
  'billboard cycles all records')])

# ---- the topic page blurb
edit('/home/claude/work/layers_i.js',[(
  "In 2023 the team drew 92,003 to Memorial Stadium, the largest crowd ever recorded for a women's sporting event.",
  "In 2023 the team drew 92,003 to Memorial Stadium, the largest crowd ever recorded at a women's sporting event in the United States. In 2026 the reseated John Cook Arena drew a building record 10,497, and a Creighton match at Pinnacle Bank Arena drew 15,405, the largest indoor home crowd in program history.",
  'Devaney topic blurb')])

# ---- the football panel's Volleyball Day line
edit('/home/claude/work/layers_k.js',[(
  "T('The largest announced crowd ever for a women\\'s sporting event, in a football stadium.');",
  "T('The largest crowd ever recorded at a women\\'s sporting event in the United States, in a football stadium. Only the 1971 World Cup final in Mexico City, estimated at about 110,000, is reported larger anywhere.');",
  'football panel Volleyball Day line')])
