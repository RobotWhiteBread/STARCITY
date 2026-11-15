import io,sys
P='/home/claude/work/page.html'
s=io.open(P,encoding='utf-8').read();n=0
def rep(a,b,why):
    global s,n
    if s.count(a)!=1: print('MISS/AMBIG (%d):'%s.count(a),why,file=sys.stderr);sys.exit(1)
    s=s.replace(a,b);n+=1

# Labels were clamped top and bottom but not left and right, so at an edge they drew as
# half words: "of the State is Watchfulness", "t Mary's Catholic School". One that would
# hang off the side is nudged back in. One too wide for the screen is dropped, because a
# fragment reads as clutter rather than information. Street names are left where they are:
# they run along their own street and moving them would point at the wrong road.
rep("    const x0=c.sx+ox-bw/2,y0=c.sy+oy-bh/2;\n    if(y0<54||y0>h-bottomH-12)continue;",
    "    let cx=c.sx;\n"
    "    if(bw>w-14)continue;\n"
    "    if(!rot){if(cx-bw/2<7)cx=7+bw/2;else if(cx+bw/2>w-7)cx=w-7-bw/2}\n"
    "    const x0=cx+ox-bw/2,y0=c.sy+oy-bh/2;\n"
    "    if(y0<54||y0>h-bottomH-12)continue;",'horizontal clamp')

# one label per name on screen: the same school was being drawn twice
rep("cand.sort((a,b)=>b.s-a.s);const placed=[];let pi=0;",
    "cand.sort((a,b)=>b.s-a.s);const placed=[],seen=new Set();let pi=0;\n"
    "  // The on-screen controls are obstacles like any other label: seed them into the\n"
    "  // collision list so a place name never hides behind the title or a button. Labels\n"
    "  // already avoid each other, so this costs nothing but the boxes.\n"
    "  for(const id of ['title','tools','nav','tbar','bBar','knobs','wx']){const el=document.getElementById(id);\n"
    "    if(!el||el.hidden)continue;const r=el.getBoundingClientRect();\n"
    "    if(r.width>2&&r.height>2&&r.bottom>0&&r.top<h)placed.push([r.left-5,r.top-5,r.width+10,r.height+10])}",'seen set')
rep("    if(!ok)continue;placed.push([x0,y0,bw,bh]);",
    "    if(!ok||seen.has(c.l.t))continue;seen.add(c.l.t);placed.push([x0,y0,bw,bh]);",'dedupe')
rep("e.d.style.transform=`translate(${Math.round(c.sx)}px,${Math.round(c.sy)}px) translate(-50%,-50%)`",
    "e.d.style.transform=`translate(${Math.round(cx)}px,${Math.round(c.sy)}px) translate(-50%,-50%)`",'draw at clamped x')

io.open(P,'w',encoding='utf-8').write(s);print('patch27 ok, %d edits'%n)
