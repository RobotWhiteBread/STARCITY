# Builds index.html (three.js from the CDN) and test.html (three.js from node_modules) from page.html,
# the two data packs and the layer source files.
import sys, os
t = open('page.html', encoding='utf-8').read()
d = open('data.b64').read(); d2 = open('data2.b64').read()
LAY = 'abcdefghijklmnopq'
layers = ''
for c in LAY:
    try: layers += open('layers_%s.js' % c, encoding='utf-8').read() + '\n'
    except FileNotFoundError: pass
for m in ('/*DATA*/', '/*DATA2*/', '/*LAYERS*/', '/*IMPORTMAP*/'):
    assert t.count(m) == 1, m
cdn = '{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}'
loc = '{"imports":{"three":"./node_modules/three/build/three.module.js","three/addons/":"./node_modules/three/examples/jsm/"}}'
body = t.replace('/*LAYERS*/', layers)
open('index.html', 'w', encoding='utf-8').write(body.replace('/*DATA*/', d).replace('/*DATA2*/', d2).replace('/*IMPORTMAP*/', cdn))
open('test.html', 'w', encoding='utf-8').write(body.replace('/*DATA*/', d).replace('/*DATA2*/', d2).replace('/*IMPORTMAP*/', loc))
# the module script on its own, for syntax and reference checks
i = body.index('<script type="module">') + len('<script type="module">'); j = body.index('</script>', i)
if os.environ.get('STARCITY_MODULE'): open(os.environ['STARCITY_MODULE'], 'w', encoding='utf-8').write(body[i:j])
print('index.html', len(body) + len(d) + len(d2), 'module', j - i)
