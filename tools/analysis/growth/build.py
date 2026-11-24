"""STARCITY: when each building first appears in the city's footprint snapshots (2007 to 2026).

Input: the nine "Footprints" layers from Lincoln's open data (2007, 2010, 2013, 2016, 2018, 2020, 2022, 2024, 2026).
Method: each footprint of at least 70 square meters (smaller ones are mostly sheds and garages) is reduced to
its center. A 2026 building is "first seen" in the earliest snapshot that has a footprint center within 12 m.
A 2007 building counts as "gone" when no 2026 footprint center lies within 15 m.
This is an estimate: footprints were redrawn between snapshots, so some centers shift, and a tear-down
replaced by a new building on the same spot is not seen as new.
Output: data/growth.bin (int16 x, int16 z in 2 m steps, uint8 snapshot index; new buildings then gone ones)
and data/growth.json (counts)."""
import json, math, os, sys, struct
import numpy as np
from scipy.spatial import cKDTree
SRC = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/uploads/STARCITY/wide/city/map/'
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..', '..', '..')
YEARS = [2007, 2010, 2013, 2016, 2018, 2020, 2022, 2024, 2026]
LAT0, LON0 = 40.77, -96.64; KX = 111320 * math.cos(math.radians(LAT0)); KY = 111000.0
def centers(y):
    out = []
    for f in json.load(open(SRC + 'Footprints%d.geojson' % y))['features']:
        g = f.get('geometry')
        if not g: continue
        r = g['coordinates'][0] if g['type'] == 'Polygon' else max((p[0] for p in g['coordinates']), key=len)
        a = np.asarray(r, dtype=float)[:, :2]; x = (a[:, 0] - LON0) * KX; z = -(a[:, 1] - LAT0) * KY
        area = abs(np.dot(x[:-1], z[1:]) - np.dot(x[1:], z[:-1])) / 2
        if area >= 70: out.append((x.mean(), z.mean(), area))
    return np.array(out)
C = {y: centers(y) for y in YEARS}
for y in YEARS: print(y, len(C[y]), flush=True)
cur = C[2026]; first = np.full(len(cur), len(YEARS) - 1, dtype=np.uint8)
for i in range(len(YEARS) - 2, -1, -1):
    d, _ = cKDTree(C[YEARS[i]][:, :2]).query(cur[:, :2], distance_upper_bound=12)
    first[np.isfinite(d)] = i
# a building must also be present in every later snapshot checked? no: keep the earliest sighting.
d, _ = cKDTree(cur[:, :2]).query(C[2007][:, :2], distance_upper_bound=15); gone = C[2007][~np.isfinite(d)]
box = lambda a: (np.abs(a[:, 0]) < 30000) & (np.abs(a[:, 1]) < 30000)
new = cur[(first > 0) & box(cur)]; fy = first[(first > 0) & box(cur)]; o = np.argsort(fy, kind='stable'); new, fy = new[o], fy[o]; gone = gone[box(gone)]
with open(os.path.join(root, 'data', 'growth.bin'), 'wb') as f:
    f.write(struct.pack('<II', len(new), len(gone)))
    f.write(np.round(new[:, :2] / 2).astype('<i2').tobytes()); f.write(fy.tobytes()); f.write(np.round(gone[:, :2] / 2).astype('<i2').tobytes())
J = {'years': YEARS, 'total': {y: int(len(C[y])) for y in YEARS}, 'new': [int((fy == i).sum()) for i in range(len(YEARS))], 'new_m2': [int(new[fy == i, 2].sum()) for i in range(len(YEARS))], 'in2007': int((first == 0).sum()), 'gone': int(len(gone)), 'asof': 'November 23, 2026'}
json.dump(J, open(os.path.join(root, 'data', 'growth.json'), 'w'), separators=(',', ':')); print(J)
