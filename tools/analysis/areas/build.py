"""STARCITY: boundaries used to show sensitive data as totals only.
Police reporting districts, City Council districts and voting precincts from the City of Lincoln's open data,
converted to the map's local meters and lightly simplified. Output: data/areas.json."""
import json, math, os, sys
import numpy as np, shapely
from shapely.geometry import shape
SRC = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/uploads/STARCITY/wide/city/map/'
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..', '..', '..')
LAT0, LON0 = 40.77, -96.64; KX = 111320 * math.cos(math.radians(LAT0)); KY = 111000.0
def conv(f, tol):
    g = shapely.transform(shape(f['geometry']), lambda a: np.column_stack(((a[:, 0] - LON0) * KX, -(a[:, 1] - LAT0) * KY))).buffer(0).simplify(tol)
    ps = [p for p in (g.geoms if g.geom_type == 'MultiPolygon' else [g]) if p.geom_type == 'Polygon' and p.area > 2000]
    c = g.representative_point()
    return [[round(v) for xy in p.exterior.coords for v in xy] for p in ps], [round(c.x), round(c.y)], round(g.area / 1e6, 3)
out = {}
rd = json.load(open(SRC + 'Police_Reporting_Districts.geojson'))['features']
out['rd'] = [dict(zip(('p', 'c', 'km2'), conv(f, 8)), id=f['properties']['RD'], team=f['properties']['TEAMNAME']) for f in rd]
cc = json.load(open(SRC + 'City_Council_Districts.geojson'))['features']
out['cc'] = [dict(zip(('p', 'c', 'km2'), conv(f, 15)), id=f['properties']['CCDIST'], member=f['properties'].get('Councilor')) for f in cc if f['properties']['CCDIST']]
vp = json.load(open(SRC + 'Voting_Precincts.geojson'))['features']
out['vp'] = [dict(zip(('p', 'c', 'km2'), conv(f, 8)), id=f['properties']['PRECINCT'], cc=f['properties']['COUNCIL']) for f in vp if f['properties']['CITY']]
json.dump(out, open(os.path.join(root, 'data', 'areas.json'), 'w'), separators=(',', ':'))
print({k: len(v) for k, v in out.items()}, os.path.getsize(os.path.join(root, 'data', 'areas.json')))
