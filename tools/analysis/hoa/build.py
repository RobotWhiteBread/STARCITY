"""STARCITY: homeowners association boundaries from the City of Lincoln's Planning HOANA layer (layer 1).
Only the association name and outline were requested from the city's server (outFields=ASSOCNAME,SHORTNAME):
the contact person, phone, email and mailing address in that layer are never downloaded.
hoa_raw.txt holds the outlines in the map's local coordinates divided by 5 (5 m steps).
Dues are not in any public city or county dataset, so none are shown."""
import json, os
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..', '..', '..')
out = {}
for item in open(os.path.join(here, 'hoa_raw.txt')).read().strip().split(';'):
    name, rings = item.split('~')
    P = [[int(v) * 5 for v in r.split(',')] for r in rings.split('/')]
    e = out.setdefault(name.strip(), [])
    for p in P:
        if p not in e: e.append(p)
L = []
for n, P in sorted(out.items()):
    xs = [p[i] for p in P for i in range(0, len(p), 2)]; zs = [p[i] for p in P for i in range(1, len(p), 2)]
    L.append({'n': n, 'p': P, 'c': [round(sum(xs) / len(xs)), round(sum(zs) / len(zs))]})
json.dump({'asof': 'November 23, 2026', 'hoa': L}, open(os.path.join(root, 'data', 'hoa.json'), 'w'), separators=(',', ':'))
print(len(L), 'associations')
