"""STARCITY: UPLNK service requests (the city's SeeClickFix 311 system) for the map.

Privacy rules, applied here before anything leaves this script:
  * Nothing about the person who asked: no names, no comments, no photos, no request links, no assignee names.
  * No exact house addresses. Requests about public places (potholes, street lights, signals, signs, snow on
    streets, sidewalks, curbs, storm drains, trails) are snapped to a 30 m grid and kept as counts per grid cell.
  * Requests about a private property or a neighbor (tall grass, garbage in a yard, property upkeep, junk cars,
    unshoveled walks, animals, noise, health complaints, parking in front of a house, code issues, police) are
    never placed on the map. They are only counted by police reporting district and voting precinct, and any
    count under 5 is written as -1 ("fewer than 5").
  * A few categories are dropped completely (posts to neighbors, COVID gathering reports, discrimination,
    ombudsman, child care complaints).
Input: the city's UPLNK Requests layer as GeoJSON (opendata.lincoln.ne.gov), the police reporting districts and
the voting precincts. Output: data/uplnk.json and data_public/uplnk_by_area.csv.
"""
import json, math, os, sys, collections, statistics, datetime, csv
SRC = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/uploads/STARCITY/wide/city/map/'
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..', '..', '..')
STREET = ['Pothole','Street Issue - Not Pothole','Icy Street','Snow - Report unplowed street','Traffic Signal Concern / Signal Burned Out',
  'Street Light Problem (Not Traffic Signal)','Sign - Report damaged or down','Sidewalk - Request inspection / repair','Curb or Gutter - Request inspection/repair',
  'Sidewalk Obstruction','Tree Issue','Landscaping in Right of Way','Mud in Street Due to Construction','Storm Water / Drainage Issue','Water Issue',
  'Unpaved Street or Alley - Rock or Grading Request','Street Sweeping','Parks & Recreation Department - Trail Issue','Parks & Recreation Department - General',
  'StarTran Issue','Scooter Issue','Health - Animal - Dead Animal Pick Up','Health - Graffiti','Health - Sewage discharge onto street','Recycle Drop-off Site Issue']
DROP = {'Post to Neighbors','Covid-19 Public Gathering Concerns','Covid-19 General Concerns','Discrimination - Human Rights','Mayor - Ombudsman','Health - Child Care Complaint'}
# short labels and groups for the map
GROUP = {'Pothole':'Potholes','Street Issue - Not Pothole':'Street surface','Icy Street':'Snow and ice','Snow - Report unplowed street':'Snow and ice',
  'Traffic Signal Concern / Signal Burned Out':'Signals and signs','Sign - Report damaged or down':'Signals and signs','Street Light Problem (Not Traffic Signal)':'Street lights',
  'Sidewalk - Request inspection / repair':'Sidewalks and curbs','Curb or Gutter - Request inspection/repair':'Sidewalks and curbs','Sidewalk Obstruction':'Sidewalks and curbs',
  'Tree Issue':'Trees','Landscaping in Right of Way':'Trees','Storm Water / Drainage Issue':'Water and drainage','Water Issue':'Water and drainage','Health - Sewage discharge onto street':'Water and drainage',
  'Mud in Street Due to Construction':'Street surface','Unpaved Street or Alley - Rock or Grading Request':'Street surface','Street Sweeping':'Street surface',
  'Parks & Recreation Department - Trail Issue':'Parks and trails','Parks & Recreation Department - General':'Parks and trails','StarTran Issue':'Buses and scooters','Scooter Issue':'Buses and scooters',
  'Health - Animal - Dead Animal Pick Up':'Dead animals','Health - Graffiti':'Graffiti','Recycle Drop-off Site Issue':'Street surface'}
AGROUP = lambda c: ('Tall grass and weeds' if 'Weeds' in c else 'Property upkeep and junk' if any(k in c for k in ('Property','Junk','Garbage','Litter','Cardboard','Nuisance','Rodent','Pests','Bedbugs')) else
  'Unshoveled sidewalks' if 'unshoveled' in c else 'Parking' if c.startswith('Parking') else 'Animals and noise' if any(k in c for k in ('Animal','Noise','Barking')) else
  'Zoning and building codes' if 'Zoning' in c else 'Police and speeding' if c.startswith('Police') or 'Drug' in c else
  'Air, water and food' if any(k in c for k in ('Air','Food','Standing','Swimming','Sump')) else 'Other')
lat0, lon0 = 40.8136, -96.7026  # grid origin only; the map converts back to longitude and latitude
KX = 111320 * math.cos(math.radians(40.77)); KY = 111000
def pip(x, y, ring):
    c = False; j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]; xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: c = not c
        j = i
    return c
def polys(f):
    g = f['geometry']; P = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    return [(p[0], [h for h in p[1:]], min(q[0] for q in p[0]), max(q[0] for q in p[0]), min(q[1] for q in p[0]), max(q[1] for q in p[0])) for p in P]
def index(fs, key):
    out = []
    for f in fs:
        for o, holes, a, b, c, d in polys(f): out.append((f['properties'][key], o, holes, a, b, c, d))
    return out
def find(ix, x, y):
    for k, o, holes, a, b, c, d in ix:
        if a <= x <= b and c <= y <= d and pip(x, y, o) and not any(pip(x, y, h) for h in holes): return k
    return None
RD = index(json.load(open(SRC + 'Police_Reporting_Districts.geojson'))['features'], 'RD')
VPf = json.load(open(SRC + 'Voting_Precincts.geojson'))['features']; VP = index(VPf, 'PRECINCT'); VPC = {f['properties']['PRECINCT']: f['properties']['COUNCIL'] for f in VPf}
import glob
LIVE = sorted(glob.glob(SRC + '../uplnk_live/page_*.geojson'))
if LIVE:   # the live service, paged by get_uplnk_live.ps1 (only id, status, category, private flag and dates)
    F = []
    for fn in LIVE:
        try: F += json.load(open(fn))['features']
        except Exception: pass
else:      # the portal's download, which can lag the live service by months
    F = json.load(open(SRC + 'UPLNK_Requests.geojson'))['features']
cells = collections.defaultdict(lambda: [0, 0, 9999, 0, []])  # count, open, first year, last year, days to close
area = {'rd': collections.defaultdict(collections.Counter), 'vp': collections.defaultdict(collections.Counter), 'cc': collections.defaultdict(collections.Counter)}
area_y = collections.defaultdict(collections.Counter)  # citywide by group and year
stat = collections.Counter(); seen = set()
for f in F:
    p = f['properties']; c = p.get('category') or ''
    if p.get('id') in seen: stat['duplicate'] += 1; continue
    seen.add(p.get('id'))
    if str(p.get('private')) not in ('0', 'None', ''): stat['private'] += 1; continue
    if c in DROP: stat['dropped'] += 1; continue
    if not f.get('geometry'): stat['no place'] += 1; continue
    lon, lat = f['geometry']['coordinates'][:2]
    if not (-97.0 < lon < -96.4 and 40.6 < lat < 41.0): stat['outside'] += 1; continue
    def ms(v):
        if v in (None, '', 'None'): return None
        if isinstance(v, (int, float)): return v
        return datetime.datetime.fromisoformat(str(v).replace('Z', '+00:00')).timestamp() * 1000
    a, z = ms(p.get('created_at')), ms(p.get('closed_at')); y = datetime.datetime.fromtimestamp(a / 1000, datetime.timezone.utc).year if a else None; days = (z - a) / 864e5 if a and z and z >= a else None
    street = c in STREET; g = GROUP.get(c) if street else AGROUP(c)
    area_y[g][y] += 1
    rd = find(RD, lon, lat); vp = find(VP, lon, lat)
    if rd is not None: area['rd'][rd][g] += 1
    if vp is not None:
        area['vp'][vp][g] += 1
        cc = VPC.get(vp)
        if cc: area['cc'][cc][g] += 1
    if street:
        gx = round((lon - lon0) * KX / 30); gz = round((lat - lat0) * KY / 30)
        k = (gx, gz, g); e = cells[k]; e[0] += 1
        if p.get('status') in ('open', 'acknowledged', 'Open', 'Acknowledged'): e[1] += 1
        if y: e[2] = min(e[2], y); e[3] = max(e[3], y)
        if days is not None: e[4].append(days)
        stat['street'] += 1
    else: stat['area only'] += 1
SG = sorted(set(GROUP.values())); AG = sorted({AGROUP(c) for c in [p['properties'].get('category') or '' for p in F] if c not in STREET and c not in DROP})
pts = []
for (gx, gz, g), (n, op, y1, y2, ds) in cells.items():
    lon = lon0 + gx * 30 / KX; lat = lat0 + gz * 30 / KY
    pts.append([round(lon, 5), round(lat, 5), SG.index(g), n, op, y1 if y1 < 9999 else 0, y2, round(statistics.median(ds)) if ds else -1])
sup = lambda v: v if v >= 5 else -1
allg = SG + AG
outA = {k: {str(a): [sup(cnt.get(g, 0)) for g in allg] for a, cnt in area[k].items()} for k in area}
years = sorted(y for y in {y for g in area_y for y in area_y[g]} if y)
out = {'asof': 'November 23, 2026', 'source': 'live service' if LIVE else 'portal download', 'street_groups': SG, 'area_groups': AG, 'pts': pts, 'area': outA,
       'years': years, 'by_year': {g: [area_y[g].get(y, 0) for y in years] for g in allg}, 'stat': dict(stat)}
json.dump(out, open(os.path.join(root, 'data', 'uplnk.json'), 'w'), separators=(',', ':'))
with open(os.path.join(root, 'data_public', 'uplnk_by_area.csv'), 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['area_type', 'area', 'group', 'requests (-1 = fewer than 5)'])
    for k, nm in (('cc', 'council_district'), ('rd', 'police_reporting_district'), ('vp', 'voting_precinct')):
        for a in sorted(outA[k], key=str):
            for g, v in zip(allg, outA[k][a]): w.writerow([nm, a, g, v])
print(json.dumps(out['stat']), len(pts), 'cells', AG, years[0], years[-1])
