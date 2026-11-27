# STARCITY: bike parking, bike and walking gap projects, and bus stop comforts, from the city's public map server.
# Input: bike_racks.json, bike_share.json, bike_gap_projects.json, sheltered_bus_stops.json as saved by the city data pull.
# Output: data/bike-bus.json in map meters (x east, z south of the map origin). Staff names in the source are left out.
# Run: python3 tools/analysis/bike_bus/build.py <folder with the four files> [out.json]
import sys, os, json, math, datetime
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else 'data/bike-bus.json'
KX = 111320 * math.cos(math.radians(40.77))
def xz(lon, lat): return [round((lon + 96.64) * KX), round(-(lat - 40.77) * 111000)]
def load(n): return json.load(open(os.path.join(src, n + '.json'), encoding='utf-8-sig'))
def clean(s): return ' '.join(str(s).split()) if s not in (None, 'None') else ''
R = load('bike_racks'); racks = []
for f in R['features']:
    a, g = f['attributes'], f.get('geometry')
    if not g or a.get('LifeCycleStatus') != 'Active' or a.get('CurrentUseStatus') != 'Active': continue
    t = clean(a.get('RackType')).replace('Bike Locker', 'Locker'); cap = a.get('Capacity_Real') or a.get('Capacity_Potential')
    racks.append({'c': xz(g['x'], g['y']), 'n': clean(a.get('GeneralLoc')) or clean(a.get('BuildingAddr')), 't': t, 'k': int(cap) if cap else 0})
S = load('bike_share'); share = [{'c': xz(f['geometry']['x'], f['geometry']['y']), 'n': clean(f['attributes']['Address']), 'k': f['attributes']['NumberOfDocks']} for f in S['features'] if f['attributes'].get('Status') == 'Active']
G = load('bike_gap_projects'); gaps = []
for f in G['features']:
    a, g = f['attributes'], f.get('geometry')
    if not g or a.get('Status') == 'Retired': continue
    st = clean(a.get('Status')); grp = 'done' if st == 'Complete' else ('planned' if st.startswith('Planned') or st == 'In Design' else 'unfunded')
    kind = clean(a.get('ProposedProj')).split(' Bike')[0].replace('Infrasturcture', 'Infrastructure').replace('Trail Access', 'Trail access')
    yr = datetime.datetime.fromtimestamp(a["CompletionDate"] / 1000, datetime.timezone.utc).year if a.get('CompletionDate') else 0
    gaps.append({'n': clean(a.get('ProjectName')) or clean(a.get('Notes')), 'k': kind, 'g': clean(a.get('GapType')), 's': st, 'grp': grp, 'y': yr, 'cost': a.get('FinalCost') or a.get('EstCost') or 0,
                 'by': clean(a.get('Funded_By')), 'd': clean(a.get('Description')), 'pri': 1 if a.get('Priority') else 0, 'l': [[v for p in path for v in xz(p[0], p[1])] for path in g['paths']]})
B = load('sheltered_bus_stops'); stops = []; yes = lambda v: clean(v).lower() == 'yes'
for f in B['features']:
    a, g = f['attributes'], f.get('geometry')
    if not g: continue
    rt = [clean(a.get(k)) for k in ('Route', 'Route2', 'Route3', 'Route4', 'Route5', 'Route6', 'Route7')]
    stops.append({'c': xz(g['x'], g['y']), 'n': clean(a.get('Intersect1')), 'r': [r for r in rt if r], 'sh': int(yes(a.get('Shelter'))), 'b': int(yes(a.get('Bench'))), 'sw': int(yes(a.get('SidewalkAc'))),
                  'pad': int(yes(a.get('ConcretePad'))), 'snow': int(clean(a.get('SnowRemoval')) in ('Contractor', 'UNL')), 'sign': int(yes(a.get('Papercast'))), 'imp': int(yes(a.get('PlannedImprovement')))})
d = datetime.date.fromisoformat(R['pulled'][:10])
j = {'asof': d.strftime('%B %-d, %Y'), 'racks': racks, 'share': share, 'gaps': gaps, 'stops': stops}
json.dump(j, open(out, 'w'), separators=(',', ':'))
print(len(racks), 'racks,', len(share), 'bike share,', len(gaps), 'gap projects,', len(stops), 'stops;', sum(s['sh'] for s in stops), 'shelters,', sum(s['b'] for s in stops), 'benches,', os.path.getsize(out) // 1024, 'KB')
