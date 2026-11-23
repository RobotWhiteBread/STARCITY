"""Hex layers "value per acre" and "tax per acre": count stacked condominium land once.

The parcel layer draws condominium units that share a footprint as identical stacked outlines, and each
unit carries the whole lot's area. The hex grid added that area once per unit, so cells holding such
buildings showed too little value per acre.

This script rebuilds every cell's value, tax and acres from the parcel layer the same way process2.py does
(same cell assignment), checks the rebuilt value against the totals already in the data file, and then
rescales the two per-acre layers only in the cells that hold a stack, by the ratio of acres as stacked to
acres counted once. Acres here are measured from the parcel outline and the build used the assessor's
recorded area, so only the ratio is taken from here; the check below prints how closely the two agree.

Usage: python3 patch_hex.py all.pkl process2.py data2.z out.z
"""
import pickle, zlib, struct, json, math, sys, collections, base64, re, warnings
import numpy as np
from shapely.geometry import shape, Point, Polygon
import shapely
warnings.filterwarnings('ignore')
src, p2, pack, out = sys.argv[1:5]
LAT0, LON0 = 40.77, -96.64; KX = 111320 * math.cos(math.radians(LAT0)); KY = 111000.0
R = 80.0; HW = 1.5 * R; HH = math.sqrt(3) * R; HALF = 16400.0
NC = int(math.ceil(2 * HALF / HW)) + 1; NR = int(math.ceil(2 * HALF / HH)) + 1; cellA = 1.5 * math.sqrt(3) * R * R
def hex_center(c, r): return (-HALF + c * HW, -HALF + (r + (0.5 if c & 1 else 0)) * HH)
def hex_of(x, y):
    c0 = int(round((x + HALF) / HW)); best = None; bd = 1e18
    for c in (c0 - 1, c0, c0 + 1):
        if c < 0 or c >= NC: continue
        r0 = int(round((y + HALF) / HH - (0.5 if c & 1 else 0)))
        for r in (r0 - 1, r0, r0 + 1):
            if r < 0 or r >= NR: continue
            cx, cy = hex_center(c, r); d = (cx - x) ** 2 + (cy - y) ** 2
            if d < bd: bd = d; best = c * NR + r
    return best
# the levy table and rule, read from the build script so the two cannot drift apart
s2 = open(p2).read(); i = s2.index("_LEVY = '''"); j = s2.index('def rate_of'); k = s2.index('yrb = {}', j)
ns = {'re': re}; exec(s2[i:k], ns); rate_of = ns['rate_of']
P = pickle.load(open(src, 'rb'))[0]; best = {}
for a, g in P:
    if not g: continue
    o = best.get(a['PARCELID'])
    if o is None or (a.get('CNTASSDVAL') or 0) > (o[0].get('CNTASSDVAL') or 0): best[a['PARCELID']] = (a, g)
HX = collections.defaultdict(lambda: dict(v=0.0, ac=0.0, ac1=0.0, tax=0.0, tac=0.0, tac1=0.0, st=0))
seen = set(); stacks = 0
for a, g in best.values():
    s = shapely.transform(shape(g), lambda xy: np.column_stack(((xy[:, 0] - LON0) * KX, (xy[:, 1] - LAT0) * KY)))
    if not s.is_valid: s = s.buffer(0)
    if s.is_empty: continue
    parts = list(s.geoms) if s.geom_type == 'MultiPolygon' else [s]
    big = max(parts, key=lambda q: q.area); c = Polygon(big.exterior).centroid
    if abs(c.x) > HALF or abs(c.y) > HALF: continue
    cells = []
    if s.area > 1.6 * cellA:
        for pl in parts:
            x0, y0, x1, y1 = pl.bounds
            for cc in range(max(0, int((x0 + HALF) / HW) - 1), min(NC, int((x1 + HALF) / HW) + 2)):
                for r in range(max(0, int((y0 + HALF) / HH) - 1), min(NR, int((y1 + HALF) / HH) + 2)):
                    if pl.contains(Point(hex_center(cc, r))): cells.append(cc * NR + r)
    if not cells:
        h = hex_of(c.x, c.y)
        if h is None: continue
        cells = [h]
    rp = s.representative_point(); key = (round(rp.x), round(rp.y), round(s.area)); dup = key in seen; seen.add(key); stacks += dup
    v = float(a.get('CNTASSDVAL') or 0); ac = s.area / 4046.8564; rate = rate_of(a.get('CVTTXCD') or ''); n = len(cells)
    for h in cells:
        e = HX[h]; e['v'] += v / n; e['ac'] += ac / n; e['ac1'] += 0 if dup else ac / n; e['st'] += dup
        if rate: e['tax'] += v * rate / 100 / n; e['tac'] += ac / n; e['tac1'] += 0 if dup else ac / n
raw = zlib.decompress(open(pack, 'rb').read()); n = struct.unpack('<I', raw[:4])[0]; H = json.loads(raw[4:4 + n]); body = bytearray(raw[4 + n:])
def sec(k): o, m, t = H['secs'][k]; assert t == 'H'; return np.frombuffer(body, np.uint16, m, o)
hi = sec('hx_i'); vpa = sec('hx_vpa').copy(); tpa = sec('hx_tpa').copy(); tot = sec('hx_tot'); old = vpa.copy()
u16 = lambda x: int(max(0, min(65535, round(x))))
# check 1: rebuilt cell value against the file's own totals; check 2: rebuilt value per acre against the file's, in cells with no stack
dv = []; rv = []
for jx, h in enumerate(hi):
    e = HX.get(int(h))
    if not e: continue
    dv.append(abs(u16(e['v'] / 1e5) - int(tot[jx])))
    if not e['st'] and e['ac'] > .05 and old[jx] > 20: rv.append(u16(e['v'] / e['ac'] / 5000) / old[jx])
dv = np.array(dv); rv = np.array(rv)
print('cells', len(hi), 'rebuilt', len(dv), '| total value matches the file in', int((dv <= 1).sum()), 'cells, differs in', int((dv > 1).sum()))
print('value per acre, rebuilt / file, cells with no stack: median %.3f, middle 90%% %.3f to %.3f' % (np.median(rv), np.percentile(rv, 5), np.percentile(rv, 95)))
ch = []; ok = 0
for jx, h in enumerate(hi):
    e = HX.get(int(h))
    if not e or not e['st'] or e['ac1'] <= .05: continue
    # keep the build's own figure as the base and apply only the ratio of acres, stacked to counted once,
    # so the cell stays on the same area measure as its neighbors
    a0 = int(vpa[jx]); vpa[jx] = u16(a0 * e['ac'] / e['ac1'])
    if e['tac1'] > .05: tpa[jx] = u16(int(tpa[jx]) * e['tac'] / e['tac1'])
    ok += abs(u16(e['v'] / 1e5) - int(tot[jx])) <= 1
    ch.append((a0 * 5000, int(vpa[jx]) * 5000, round(e['ac'], 1), round(e['ac1'], 1), e['st']))
for kx, arr in (('hx_vpa', vpa), ('hx_tpa', tpa)):
    o, m, t = H['secs'][kx]; body[o:o + 2 * m] = arr.tobytes()
z = zlib.compress(raw[:4 + n] + bytes(body), 9); open(out, 'wb').write(z); open(re.sub(r'\.z$', '', out) + '.b64', 'w').write(base64.b64encode(z).decode())
ch.sort(key=lambda c: c[1] - c[0], reverse=True)
print('stacked units', stacks, 'cells rewritten', len(ch), 'of which the rebuilt total matches the file in', ok)
for c in ch[:6]: print('  $%s -> $%s an acre (%s acres as stacked, %s counted once, %d extra units)' % (format(c[0], ','), format(c[1], ','), c[2], c[3], c[4]))
print('largest value per acre before', int(old.max()) * 5000, 'after', int(vpa.max()) * 5000)
