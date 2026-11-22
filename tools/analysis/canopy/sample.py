# STARCITY: tree canopy and a carbon estimate from the LiDAR height grids made by canopy.py.
# A cell counts as tree canopy when it stands at least 8 feet above ground, at least 15% of its returns came from
# pulses that hit more than one surface, and it is not inside a mapped building footprint.
# Carbon uses the U.S. Forest Service's rates for Lincoln (Nowak and others, 2013): 10.64 kg of carbon stored and
# 0.409 kg taken up per year for each square meter of tree cover. Those rates carry their own uncertainty.
import numpy as np, json, glob, os, sys
from pyproj import Transformer
from shapely.geometry import Polygon
from shapely import contains_xy
G = os.environ.get('STARCITY_CANOPY', '/mnt/user-data/uploads/STARCITY/lidar_out/'); B = os.environ.get('STARCITY_ROADS', '/home/claude/wd/')
T = Transformer.from_crs('EPSG:6880', 'EPSG:4326', always_xy=True); Ti = Transformer.from_crs('EPSG:4326', 'EPSG:6880', always_xy=True); C = 15.0; M2 = (C * 0.3048006) ** 2
blds = []
for f in glob.glob(B + 'buildings_*.json'):
    for e in json.load(open(f))['elements']:
        g = e.get('geometry')
        if g and len(g) >= 4: blds.append(g)
bx = np.array([[q[0]['lon'], q[0]['lat']] for q in blds])
rows = []
for f in sorted(glob.glob(G + '*.npz')):
    d = np.load(f); ht = d['ht'].astype(np.float32)[:333, :333]; mf = d['mf'][:333, :333]; x0, y0 = float(d['x0']), float(d['y0']); ny, nx = ht.shape
    lo0, la0 = T.transform(x0, y0); lo1, la1 = T.transform(x0 + nx * C, y0 + ny * C); bm = np.zeros(ht.shape, bool); nb = 0
    for k in np.where((bx[:, 0] > lo0) & (bx[:, 0] < lo1) & (bx[:, 1] > la0) & (bx[:, 1] < la1))[0]:
        g = blds[k]; xs, ys = Ti.transform([q['lon'] for q in g], [q['lat'] for q in g]); P = Polygon(zip(xs, ys))
        if not P.is_valid or P.area < 200: continue
        a, b, c, dd = P.bounds; i0, i1 = max(0, int((a - x0) / C)), min(nx - 1, int((c - x0) / C)); j0, j1 = max(0, int((b - y0) / C)), min(ny - 1, int((dd - y0) / C))
        if i1 < i0 or j1 < j0: continue
        X, Y = np.meshgrid(x0 + (np.arange(i0, i1 + 1) + .5) * C, y0 + (np.arange(j0, j1 + 1) + .5) * C); bm[j0:j1 + 1, i0:i1 + 1] |= contains_xy(P, X, Y); nb += 1
    tree = (ht >= 8) & (mf >= 38) & ~bm; lon, lat = T.transform(x0 + 2500, y0 + 2500); area = ht.size * M2
    rows.append(dict(tile=os.path.basename(f)[:-4], lat=round(lat, 4), lon=round(lon, 4), buildings=nb, cover=float(tree.mean()), tree_m2=float(tree.sum() * M2), area_m2=area,
                     med_ht_ft=float(np.median(ht[tree])) if tree.any() else 0, p90_ht_ft=float(np.percentile(ht[tree], 90)) if tree.any() else 0, roof=float(bm.mean())))
tm2 = sum(r['tree_m2'] for r in rows); am2 = sum(r['area_m2'] for r in rows)
out = dict(tiles=len(rows), area_km2=am2 / 1e6, cover=tm2 / am2, tree_km2=tm2 / 1e6, carbon_stored_t=tm2 * 10.64 / 1000, carbon_per_year_t=tm2 * 0.409 / 1000, rows=rows)
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else 'sample.json', 'w'))
print({k: (round(v, 3) if isinstance(v, float) else v) for k, v in out.items() if k != 'rows'})
for r in sorted(rows, key=lambda r: -r['cover'])[:6] + sorted(rows, key=lambda r: r['cover'])[:3]: print(r['tile'], r['lat'], r['lon'], 'cover %.1f%%' % (100 * r['cover']), 'bldgs', r['buildings'], 'median ht', r['med_ht_ft'], 'p90', r['p90_ht_ft'])
