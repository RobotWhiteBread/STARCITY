"""Home insurance by ZIP code for the Lincoln area, 2018 to 2022.

Source: U.S. Treasury, Federal Insurance Office, "Analyses of U.S. Homeowners Insurance Markets, 2018-2022"
(January 2025), ZIP-level supporting data collected with the National Association of Insurance Commissioners.
The figures here were read from a public copy of that data packaged for mapping
(github.com/kwstancil/FIO-home-insurance-map), not from Treasury's own spreadsheet, which this script's host
could not download. ZIP outlines are the Census Bureau's 2010 ZIP Code Tabulation Areas
(github.com/OpenDataDE/State-zip-code-GeoJSON).

Usage: python3 build.py ne_zips.json ne_zcta.json out.json out.csv
"""
import json, sys, math, csv
from shapely.geometry import shape, box
import shapely
vals, zc, out, outcsv = sys.argv[1:5]
LAT0, LON0 = 40.77, -96.64; KX = 111320 * math.cos(math.radians(LAT0)); KY = 111000.0; HALF = 16400
D = json.load(open(vals)); Y = ['2018', '2019', '2020', '2021', '2022']
F = [('prem', 'Premiums_Per_Policy'), ('nonren', 'Nonrenewal_Rate'), ('freq', 'Claim_Frequency'), ('sev', 'Claim_Severity'), ('plr', 'Paid_Loss_Ratio')]
sq = box(-HALF, -HALF, HALF, HALF); Z = []; rows = []
for f in json.load(open(zc))['features']:
    z = f['properties']['ZCTA5CE10']
    g = shapely.transform(shape(f['geometry']), lambda a: __import__('numpy').column_stack(((a[:, 0] - LON0) * KX, -(a[:, 1] - LAT0) * KY)))
    if not g.is_valid: g = g.buffer(0)
    c = g.intersection(sq)
    if c.is_empty or c.area < 0.15 * min(g.area, 4e6): continue
    c = c.simplify(25); polys = [p for p in (c.geoms if c.geom_type != 'Polygon' else [c]) if p.geom_type == 'Polygon' and p.area > 2e4]
    if not polys: continue
    p = D.get(z); rec = dict(z=z, p=[[round(v) for xy in pl.exterior.coords[:-1] for v in xy] for pl in polys], c=[round(c.representative_point().x), round(c.representative_point().y)])
    ok = bool(p) and all(p.get(y + '_Premiums_Per_Policy') not in (None, -99999) for y in Y)
    if ok:
        for k, name in F: rec[k] = [round(p[y + '_' + name], 2) for y in Y]
        rows.append([z] + [rec[k][i] for k, _ in F for i in range(5)])
    Z.append(rec)
json.dump(dict(src='U.S. Treasury Federal Insurance Office, ZIP-level homeowners insurance data, 2018 to 2022', years=[int(y) for y in Y], zips=Z), open(out, 'w'), separators=(',', ':'))
with open(outcsv, 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['zip'] + ['%s_%s' % (k, y) for k, _ in F for y in Y]); w.writerows(sorted(rows))
print('ZIP areas', len(Z), 'with data', len(rows), 'bytes', len(open(out).read()))
