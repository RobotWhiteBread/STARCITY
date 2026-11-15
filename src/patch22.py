# STARCITY 0.9.4: the phone screen. Run after patch21.py. Every replacement is asserted.
P='/home/claude/work/page.html'
s=open(P,encoding='utf-8').read()
assert 'id="tbar"' in s, 'run patch20/21 first'
assert '--- phone ---' not in s, 'patch22 already applied'
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:80],s.count(a))
    s=s.replace(a,b)

# the title folds to one line until it is tapped
rep('<div id="title"><b>STAR<i>CITY</i></b>','<div id="title" role="button" tabindex="0" aria-label="Lincoln, Nebraska. Tap for the live line"><b>STAR<i>CITY</i></b>')

PHONE = """
/* --- phone --- one screen, one thing at a time */
@media (max-width:700px){
  /* every control is a thumb target */
  .btn{padding:11px 13px;font-size:12.5px;min-height:42px;display:inline-flex;align-items:center}
  #sugg .btn{min-height:38px;padding:9px 12px}
  #chips .btn,#bBar{min-height:36px}
  #cx,#gx{padding:6px 10px;font-size:26px}

  /* the title says where you are; the rest waits for a tap */
  #title{padding:7px 11px;max-width:62vw}
  #title b{font-size:13.5px;letter-spacing:.26em}
  #title span,#title #wx{display:none}
  #title.open span,#title.open #wx{display:block}
  #title::after{content:'\\25be';position:absolute;right:7px;top:7px;font-size:9px;color:var(--dim)}
  #title.open::after{content:'\\25b4'}
  #title{position:relative}

  /* a card is never more than a third of the screen, and its choices run in one scrolling row */
  #card{bottom:calc(96px + env(safe-area-inset-bottom));max-width:none;padding:10px 12px}
  #card h3{font-size:14px}
  #cp{max-height:19vh;overflow-y:auto;-webkit-overflow-scrolling:touch}

  /* the button grid reaches 39 buttons with More open, which is taller than a phone
     and taller still inside an in-app browser. Cap it to the screen and let it scroll
     rather than running off the bottom with no way to reach the rest. */
  #tools{max-height:calc(100vh - 112px);max-height:calc(100dvh - 112px);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;padding-bottom:4px}
  #tools.shut{max-height:none;overflow:visible}
  #bMenu{position:sticky;top:0;z-index:2}
  #clinks{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;margin-top:8px;scrollbar-width:none}
  #clinks::-webkit-scrollbar{display:none}
  #clinks .btn{flex:none;white-space:nowrap}

  /* the key, the clock and the places start folded away */
  #bottom.shut #row0{margin-bottom:2px}
  #legend{max-height:30px;overflow:hidden;flex-wrap:nowrap}
  #legend.open{max-height:none;flex-wrap:wrap}
  #attr{font-size:8.5px;max-width:52vw}

  /* a layer's sliders are behind its own info button */
  .dls{display:none}
  .dlg.open .dls{display:flex}

  /* the running total folds to two lines, and steps aside while a card is up */
  #rv{font-size:11px;line-height:1.35;max-height:2.7em;overflow:hidden;padding:7px 10px;max-width:calc(100vw - 24px);box-sizing:border-box;white-space:normal;text-align:left;
      -webkit-mask-image:linear-gradient(#000 60%,transparent);mask-image:linear-gradient(#000 60%,transparent)}
  #rv.open{max-height:none;-webkit-mask-image:none;mask-image:none}
  body.carded #rv{display:none!important}

  /* a row that scrolls says so, by fading at the edge */
  #sugg,#chips,#clinks{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 26px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 26px),transparent)}

  /* the way back to the card sits opposite the key, never on top of it */
  #cback{left:auto;right:12px;bottom:calc(10px + env(safe-area-inset-bottom));min-height:38px}

  /* nothing floats in the middle of the map but the map */
  #hint{max-width:88vw;font-size:11.5px}
}
"""
rep('</style>', PHONE+'</style>')

# on a phone the bottom stack starts folded, and the title opens on a tap
rep("$('bBar').onclick=()=>{",
    "if(mobile){$('bottom').classList.add('shut');$('bBar').textContent='\\u25b4 Key, time and places';$('bBar').setAttribute('aria-expanded','false');"
    "const t=$('title'),tog=e=>{if(e.target.closest('a,button'))return;t.classList.toggle('open');layoutCard();dirty=true};"
    "t.addEventListener('click',tog);t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tog(e)}});}\n"
    "$('bBar').onclick=()=>{")
# the running total and a layer's sliders open on a tap
# one thing at a time: the page knows when a card is up
rep("rideWay=(way===undefined?-1:way);cardAct=act||null;",
    "document.body.classList.add('carded');rideWay=(way===undefined?-1:way);cardAct=act||null;")
rep("function hideCard(){$('card').style.display='none';",
    "function hideCard(){document.body.classList.remove('carded');$('card').style.display='none';")
rep("$('bBar').onclick=()=>{",
    "if(mobile){const rv=$('rv');if(rv)rv.addEventListener('click',()=>{rv.classList.toggle('open');layoutCard();dirty=true});"
    "const dg=$('dlg');if(dg)dg.addEventListener('click',e=>{if(e.target.closest('input,a'))return;if(e.target.closest('[data-s]'))return;dg.classList.toggle('open');dirty=true});}\n"
    "$('bBar').onclick=()=>{")
open(P,'w',encoding='utf-8').write(s)
print('patch22 ok', len(s))
