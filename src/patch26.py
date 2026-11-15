import io,sys
P='/home/claude/work/page.html'
s=io.open(P,encoding='utf-8').read();n=0
def rep(a,b,why):
    global s,n
    if s.count(a)!=1: print('MISS/AMBIG (%d):'%s.count(a),why,file=sys.stderr);sys.exit(1)
    s=s.replace(a,b);n+=1

# ---- a knob button in the nav cluster, and the panel it opens
rep('<button class="btn" id="bLook" aria-label="Look around from here.',
    '<button class="btn" id="bKnob" aria-pressed="false" aria-label="View knobs. Sliders for exact tilt and turn, usable from the keyboard">▤</button>'
    '<button class="btn" id="bLook" aria-label="Look around from here.','knob button')

rep('<div id="nav">','<div id="knobs" hidden><label for="kTilt">Tilt <b id="kTiltV">45°</b></label>'
    '<input id="kTilt" type="range" min="4" max="89" step="1" value="45" aria-label="Tilt the view, 4 degrees is flat on, 89 degrees is straight down">'
    '<label for="kTurn">Turn <b id="kTurnV">N 0°</b></label>'
    '<input id="kTurn" type="range" min="0" max="359" step="1" value="0" aria-label="Turn the map, 0 is north up">'
    '<button class="btn" id="kNorth">North up</button><button class="btn" id="kFlat">Straight down</button></div><div id="nav">','knob panel')

# ---- styles. Inserted before patch22's phone block, which has to stay last.
CSS = """
#knobs{position:fixed;right:calc(12px + env(safe-area-inset-right));bottom:calc(132px + env(safe-area-inset-bottom));z-index:7;
 background:rgba(13,15,20,.92);border:1px solid rgba(255,211,77,.35);border-radius:12px;padding:10px 12px 12px;
 display:flex;flex-direction:column;gap:4px;width:200px;box-shadow:0 6px 24px rgba(0,0,0,.45);backdrop-filter:blur(6px)}
#knobs[hidden]{display:none}
#knobs label{font:600 calc(11px*var(--uz,1))/1.3 system-ui,sans-serif;color:#cfd4dc;letter-spacing:.02em;display:flex;justify-content:space-between;align-items:baseline}
#knobs label b{color:#ffd34d;font-variant-numeric:tabular-nums;font-weight:700}
#knobs input[type=range]{width:100%;margin:0 0 6px;accent-color:#ffd34d;height:26px}
#knobs .btn{width:100%;margin-top:2px;min-height:38px}
body.hc #knobs{background:#000;border-color:#fff}
body.hc #knobs label{color:#fff}
body.hc #knobs label b{color:#fff}
/* every control shows where the keyboard is, not just the few that did */
:focus-visible{outline:3px solid #ffd34d;outline-offset:2px;border-radius:4px}
body.hc :focus-visible{outline-color:#fff}
"""
# patch22 adds the phone block at </style>; put these before it so that block still wins
rep('</style>',CSS+'</style>','styles')

io.open(P,'w',encoding='utf-8').write(s);print('patch26 ok %d edits, %d bytes'%(n,len(s)))
