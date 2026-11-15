# STARCITY 0.9.6: a way to say this is wrong, an About card, and a louder line around the jokes.
# Run after patch22.py. Every replacement is asserted.
P='/home/claude/work/page.html'
s=open(P,encoding='utf-8').read()
assert 'id="cflag"' not in s, 'patch23 already applied'
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:80],s.count(a))
    s=s.replace(a,b)

# ---- markup: a flag beside the close button, and a chip for anything that is a joke
rep('<div id="card"><button id="cx" aria-label="Close">×</button><h3 id="ch"></h3>',
    '<div id="card"><button id="cflag" aria-label="Report something wrong on this card" title="Something here is wrong">⚑</button>'
    '<button id="cx" aria-label="Close">×</button><span id="cfun">FOR FUN</span><h3 id="ch"></h3>')

rep('#cride,#cspd{display:none;',
    '#cflag{position:absolute;right:34px;top:7px;background:none;border:0;color:var(--dim);font-size:15px;line-height:1;cursor:pointer;padding:3px 6px;border-radius:7px}\n'
    '#cflag:hover,#cflag:focus-visible{color:#ffb4a8;background:rgba(255,255,255,.08)}\n'
    '#cfun{display:none;margin:0 0 5px;font-size:9.5px;letter-spacing:.16em;font-weight:800;color:#1b1608;background:#8fb07a;border-radius:5px;padding:2px 7px}\n'
    '#card.fun #cfun{display:inline-block}\n'
    '#cride,#cspd{display:none;')

# ---- a card that describes something invented says so in a chip, not only in the prose
rep("cardLast=[title,body,way,act,link,null];cardAt=performance.now();",
    "$('card').classList.toggle('fun',/\\bfor fun\\b/i.test(String(body||'')));"
    "cardLast=[title,body,way,act,link,null];cardAt=performance.now();")

# ---- the flag: a prefilled correction, carrying what was on screen and a link back to this view
rep("$('cx').onclick=()=>{const was=cardTag;",
    "$('cflag').onclick=()=>{const t=$('ch').textContent||'the map',b=($('cp').textContent||'').slice(0,300);\n"
    "  let view='';try{view=location.href.split('#')[0]+viewHash()}catch(e){}\n"
    "  const u='https://github.com/RobotWhiteBread/STARCITY/issues/new?template=1-something-is-wrong.yml'\n"
    "    +'&title='+encodeURIComponent('Fix: '+t)\n"
    "    +'&what='+encodeURIComponent('The card \"'+t+'\" says:\\n\\n'+b+'\\n\\nWhat it should say:\\n')\n"
    "    +'&where='+encodeURIComponent(view||t);\n"
    "  window.open(u,'_blank','noopener,noreferrer');lastInput=performance.now()};\n"
    "$('cx').onclick=()=>{const was=cardTag;")

# ---- About, reachable from the guide's front tab
rep("<h4>What this is</h4>${COUNTH}",
    "<h4>What this is</h4>${COUNTH}<p><button class=\"btn go\" data-go=\"about\">About this map, and who made it<small>Who built it, why, what it is not, and how to tell us something is wrong.</small></button></p>")
rep("click:e=>{const b=e.target.closest('.go');if(!b)return;closeSheet();lastInput=performance.now();TRY[+b.dataset.go][2]()}};",
    "click:e=>{const b=e.target.closest('.go');if(!b)return;closeSheet();lastInput=performance.now();if(b.dataset.go==='about'){aboutCard();return}TRY[+b.dataset.go][2]()}};")
open(P,'w',encoding='utf-8').write(s)
print('patch23 ok', len(s))
