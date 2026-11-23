"""Hex layers "value per acre" and "tax per acre": count stacked condominium land once.

The parcel layer draws condominium units that share a footprint as identical stacked outlines, and each
unit carries the whole lot's area. The hex grid added that area once per unit, so cells holding such
buildings showed too little value per acre. This finds each stack, works out the acres counted too many
times in each cell (the same cell assignment process2.py uses), and rescales the two per-acre layers.
The cell totals, medians and counts are not touched.

Usage: python3 patch_hex.py all.pkl data2.z out.z
"""
import pickle, zlib, struct, json, math, sys, collections, base64
import numpy as np
from shapely.geometry import shape, Point
from shapely.ops import transform
import warnings; warnings.filterwarnings('ignore')
src, pack, out = sys.argv[1:4]
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
P = pickle.load(open(src, 'rb'))[0]; seen = set(); G = collections.defaultdict(list)
for a, g in P:
    if not g or a['PARCELID'] in seen: continue
    seen.add(a['PARCELID'])
    s = transform(lambda x, y, z=None: ((x - LON0) * KX, (y - LAT0) * KY), shape(g))
    if not s.is_valid: s = s.buffer(0)
    if s.is_empty: continue
    rp = s.representative_point(); G[(round(rp.x), round(rp.y), round(s.area))].append(s)
excess = collections.Counter(); units = collections.Counter(); nst = collections.Counter(); stacks = 0
for g in G.values():
    if len(g) < 2: continue
    stacks += 1; s = g[0]; big = max(s.geoms, key=lambda q: q.area) if s.geom_type == 'MultiPolygon' else s
    cells = []
    if s.area > 1.6 * cellA:
        x0, y0, x1, y1 = s.bounds
        for c in range(max(0, int((x0 + HALF) / HW) - 1), min(NC, int((x1 + HALF) / HW) + 2)):
            for r in range(max(0, int((y0 + HALF) / HH) - 1), min(NR, int((y1 + HALF) / HH) + 2)):
                if s.contains(Point(hex_center(c, r))): cells.append(c * NR + r)
    if not cells:
        h = hex_of(big.centroid.x, big.centroid.y)
        if h is None: continue
        cells = [h]
    for h in cells: excess[h] += (len(g) - 1) * s.area / 4046.8564 / len(cells); units[h] += len(g); nst[h] += 1
raw = zlib.decompress(open(pack, 'rb').read()); n = struct.unpack('<I', raw[:4])[0]; H = json.loads(raw[4:4 + n]); body = bytearray(raw[4 + n:])
def sec(k): o, m, t = H['secs'][k]; assert t == 'H'; return np.frombuffer(body, np.uint16, m, o)
hi = sec('hx_i'); vpa = sec('hx_vpa').copy(); tpa = sec('hx_tpa').copy(); tot = sec('hx_tot'); pos = {int(h): j for j, h in enumerate(hi)}
ch = []; skipped = []
for h, ex in excess.items():
    j = pos.get(h)
    if j is None or not vpa[j] or not tot[j]: continue
    v = tot[j] * 1e5; ac = v / (vpa[j] * 5000.0); new = ac - ex
    # The outline's area and the build's recorded area differ a little, and a large lot can be spread over cells
    # differently, so the excess can come out larger than what the cell holds. A cell that is all stack should keep
    # one lot per stack: never remove more than that.
    floor = ac * nst[h] / units[h]
    if new < floor: new = floor; skipped.append((round(ac, 1), round(ex, 1)))
    k = ac / new; a, b = int(vpa[j]), int(tpa[j])
    vpa[j] = min(65535, round(a * k)); tpa[j] = min(65535, round(b * k)); ch.append((a * 5000, int(vpa[j]) * 5000, round(ac, 1), round(ex, 1)))
for k, arr in (('hx_vpa', vpa), ('hx_tpa', tpa)):
    o, m, t = H['secs'][k]; body[o:o + 2 * m] = arr.tobytes()
hj = raw[4:4 + n]; z = zlib.compress(struct.pack('<I', n) + hj + bytes(body), 9); open(out, 'wb').write(z); open(out[:-2] + '.b64' if out.endswith('.z') else out + '.b64', 'w').write(base64.b64encode(z).decode())
ch.sort(key=lambda c: c[1] - c[0], reverse=True)
print('stacks', stacks, 'cells with excess', len(excess), 'cells changed', len(ch), 'excess acres', round(sum(excess.values())))
for c in ch[:8]: print('  value per acre $%s -> $%s (cell had %s acres counted, %s too many)' % (format(c[0], ','), format(c[1], ','), c[2], c[3]))
print('held at one lot per stack', len(skipped))
print('largest value per acre before', int(sec('hx_vpa').max()) * 5000, 'after', int(vpa.max()) * 5000)
