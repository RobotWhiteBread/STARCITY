"""Parcel pack for value per acre in Compare areas.

Input: the county parcel layer (every parcel, 2026 assessed value, class, tax
district, year built), cut to parcels whose inside point is within the Lincoln
city limit (city.pkl, made by calc.py from the public parcel service).
Output: data/parcels-vpa.bin, one row per piece of taxable land.

Rules
- Only parcels with an assessed value above zero. Exempt land (campus, parks,
  streets, churches) carries no value in the public layer and is left out, so
  this is taxable value per acre of taxable land, the usual convention.
- Acres are the parcel polygon's area (equal-area projection, EPSG:5070).
- Condominium units that share one footprint are drawn as stacked identical
  polygons. They are merged into one row (values summed, land counted once)
  so the land is not counted once per unit.
"""
import pickle, struct, json, sys, collections
import numpy as np, pyproj
src, allp, out = sys.argv[1], sys.argv[2], sys.argv[3]
LAT0, LON0 = 40.77, -96.64
KX, KY = 111320*np.cos(np.radians(40.77)), 111000
R = pickle.load(open(src, 'rb'))
yr = {a['PARCELID']: (a.get('RESYRBLT') or 0) for a, g in pickle.load(open(allp, 'rb'))[0]}
inv = pyproj.Transformer.from_crs(5070, 4326, always_xy=True).transform
CL = {'Residential Improved': 0, 'Residential Unimproved': 1, 'Commercial Improved': 2, 'Commercial Unimproved': 3}
G = collections.OrderedDict()
for r in R:
    if r['v'] <= 0 or r['ac'] <= 0: continue
    k = (round(r['x']), round(r['y']), round(r['ac'], 3))
    g = G.get(k)
    if g: g['v'] += r['v']; g['n'] += 1; g['fl'] += r['fl']
    else: G[k] = dict(r, n=1)
rows = list(G.values())
codes = sorted({r['cvt'] or '' for r in rows})
ci = {c: i for i, c in enumerate(codes)}
n = len(rows)
lon, lat = inv(np.array([r['x'] for r in rows]), np.array([r['y'] for r in rows]))
x = np.round((lon-LON0)*KX).astype('<i2'); z = np.round(-(lat-LAT0)*KY).astype('<i2')
v = np.array([min(r['v'], 2**32-1) for r in rows], '<u4')
ac = np.array([r['ac'] for r in rows], '<f4')
cls = np.array([CL.get(r['cls'], 4) for r in rows], 'u1')
cd = np.array([ci[r['cvt'] or ''] for r in rows], '<u2')
y = np.array([yr.get(r['id'], 0) if r['n'] == 1 else 0 for r in rows], '<u2')
fl = np.array([min(r['fl'] or 0, 2**32-1) for r in rows], '<u4')
head = json.dumps(dict(n=n, codes=codes, merged=sum(r['n'] for r in rows)-n)).encode()
head += b' '*((4-len(head) % 4) % 4)
with open(out, 'wb') as f:
    f.write(struct.pack('<II', n, len(head))); f.write(head)
    for a in (x, z, v, ac, fl, cd, y, cls): f.write(a.tobytes())
print(n, 'rows from', sum(r['n'] for r in rows), 'parcels;', len(codes), 'tax districts; value', v.astype(float).sum()/1e9, 'acres', ac.sum(), 'range', x.min(), x.max(), z.min(), z.max())
m = [r for r in rows if r['n'] > 1]; print('merged groups', len(m), 'largest', max(r['n'] for r in m) if m else 0)
