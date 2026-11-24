# Builds index.html (three.js from the CDN) and test.html (three.js from node_modules) from page.html,
# the two data packs and the layer source files.
import sys, os
t = open('page.html', encoding='utf-8').read()
d = open('data.b64').read(); d2 = open('data2.b64').read()
LAY = 'abcdefghijklmnopqrst'
layers = ''
for c in LAY:
    try: layers += open('layers_%s.js' % c, encoding='utf-8').read() + '\n'
    except FileNotFoundError: pass
for m in ('/*DATA*/', '/*DATA2*/', '/*LAYERS*/', '/*IMPORTMAP*/', '/*PRELOAD*/'):
    assert t.count(m) == 1, m
cdn = '{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}'
loc = '{"imports":{"three":"./node_modules/three/build/three.module.js","three/addons/":"./node_modules/three/examples/jsm/"}}'
body = t.replace('/*LAYERS*/', layers)
# The two data packs ship as their own files, named by their content, so a browser keeps them when only the code changes.
import base64, hashlib, glob
os.makedirs('data', exist_ok=True)
def pack(tag, b64):
    raw = base64.b64decode(b64); name = 'data/%s-%s.bin' % (tag, hashlib.sha256(raw).hexdigest()[:10])
    for old in glob.glob('data/%s-*.bin' % tag):
        if old != name: os.remove(old)
    if not os.path.exists(name): open(name, 'wb').write(raw)
    return name
n1, n2 = pack('d', d), pack('d2', d2)
assert body.count('<script type="application/octet-stream" id="d">/*DATA*/</script>') == 1
body = body.replace('<script type="application/octet-stream" id="d">/*DATA*/</script>', '<script type="application/octet-stream" id="d" data-src="%s"></script>' % n1).replace('<script type="application/octet-stream" id="d2">/*DATA2*/</script>', '<script type="application/octet-stream" id="d2" data-src="%s"></script>' % n2).replace('/*PRELOAD*/', '<link rel="preload" as="fetch" crossorigin href="%s"><link rel="preload" as="fetch" crossorigin href="%s">' % (n1, n2))
d = d2 = ''
open('index.html', 'w', encoding='utf-8').write(body.replace('/*IMPORTMAP*/', cdn))
open('test.html', 'w', encoding='utf-8').write(body.replace('/*IMPORTMAP*/', loc))
# the module script on its own, for syntax and reference checks
i = body.index('<script type="module">') + len('<script type="module">'); j = body.index('</script>', i)
if os.environ.get('STARCITY_MODULE'): open(os.environ['STARCITY_MODULE'], 'w', encoding='utf-8').write(body[i:j])
print('index.html', len(body) + len(d) + len(d2), 'module', j - i)
