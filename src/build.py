import sys
t=open('page.html').read();d=open('data.b64').read()
cdn='{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}'
loc='{"imports":{"three":"./node_modules/three/build/three.module.js","three/addons/":"./node_modules/three/examples/jsm/"}}'
open('index.html','w').write(t.replace('/*DATA*/',d).replace('/*IMPORTMAP*/',cdn))
open('test.html','w').write(t.replace('/*DATA*/',d).replace('/*IMPORTMAP*/',loc))
print(len(t)+len(d))
