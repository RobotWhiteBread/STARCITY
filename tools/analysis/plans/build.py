"""STARCITY: city planning layers from Lincoln's open data, packed for the map as data/plans.json.

Layers: road and transit projects (TIP), planning applications since 2020, approved subdivisions with homes
still to build, the 2050 future land use plan, 2050 growth tiers, annexations by decade, airport noise
contours, historic districts and sites.
Left out on purpose: staff names (planner assigned, created by, edited by) and, for zoning appeals,
waivers and administrative amendments, the project name, because those are often a household's name.
Coordinates are local meters from 40.77 N, 96.64 W (x east, z south), the same as data/areas.json.
"""
import re, json, math, os, sys, collections
import numpy as np, shapely
from shapely.geometry import shape
from shapely.ops import unary_union
SRC = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/uploads/STARCITY/wide/city/map/'
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..', '..', '..')
LAT0, LON0 = 40.77, -96.64; KX = 111320 * math.cos(math.radians(LAT0)); KY = 111000.0
BOX = shapely.box(-20000, -20000, 20000, 20000)
L = lambda n: json.load(open(SRC + n + '.geojson'))['features']
def loc(g): return shapely.transform(g, lambda a: np.column_stack(((a[:, 0] - LON0) * KX, -(a[:, 1] - LAT0) * KY)))
def G(f):
    try: return loc(shape(f['geometry']))
    except Exception: return None
def rings(g, tol, amin=1500):
    g = g.buffer(0).intersection(BOX).simplify(tol)
    out = []
    for p in (g.geoms if hasattr(g, 'geoms') else [g]):
        if p.geom_type != 'Polygon' or p.area < amin: continue
        out.append([[round(v) for xy in r.coords for v in xy] for r in [p.exterior] + [h for h in p.interiors if shapely.Polygon(h).area > amin]])
    return out
def line(g, tol=6):
    g = g.simplify(tol); return [[round(v) for xy in l.coords for v in xy] for l in (g.geoms if hasattr(g, 'geoms') else [g])]
def pt(g): c = g.representative_point() if g.geom_type != 'Point' else g; return [round(c.x), round(c.y)]
S = lambda v: '' if v in (None, 'None', 'NULL') else str(v).strip()
out = {'asof': 'November 23, 2026'}
# --- transportation improvement program: active, site-specific projects
tip = []
for nm in ('TIP_Project_Lines', 'TIP_Project_Points'):
    for f in L(nm):
        p = f['properties']; g = G(f)
        if g is None or p['LIFECYCLESTATUS'] != 'Active' or S(p['LOCATION_DESC']) not in ('Site Specific', ''): continue
        if not BOX.contains(g.representative_point() if g.geom_type != 'Point' else g): continue
        e = {'n': S(p['PROJECT_NAME']), 'w': S(p['LOCATION']), 'o': S(p['PROJECT_OWNER']), 'y': S(p['TIP_PROGRAM_YEAR']), 's': S(p['APPROVAL_STATUS'])}
        if g.geom_type == 'Point': e['c'] = pt(g)
        else: e['l'] = line(g)
        tip.append(e)
seen = {}; 
for e in sorted(tip, key=lambda e: e['y']): seen[(e['n'], e['w'], 'l' in e)] = e   # keep the newest program year of a repeated project
out['tip'] = list(seen.values())
# --- planning applications since 2020
HIDE = ('Board of Zoning Appeals', 'Administrative Amendments', 'Waiver', 'County Administrative Subdivision', 'Urban Design Record', 'Comp Plan Conformance')
# Project names are kept only when they read as a development or business. Names that look like a person or household,
# and small household requests (accessory units, garages, residences), show the file number only; the full record is in PATS.
KW = re.compile(r"\b(addition|subdivision|pud|planned|development|center|park|plaza|street|road|drive|avenue|lane|court|place|estates?|village|commons?|station|church|school|college|university|hospital|clinic|apartments?|townhomes?|condominiums?|lofts?|square|crossing|ridge|hills?|heights|meadows?|creek|lake|pointe?|trail|gardens?|farms?|acres|woods?|grove|terrace|manor|landing|market|retail|office|industrial|business|hotel|storage|bank|annexation|amendment|vacation|lincoln|lancaster|county|city|downtown|haymarket|phase|outlot|replat|plat|campus|facility|llc|inc|company|corp|partners|properties|investments|holdings|association|trust|foundation|community|neighborhood|redevelopment|senior|living|medical|dental|cemetery|wireless|tower)\b", re.I)
HH = re.compile(r"\b(adu|garage|residence|house|accessory|dwelling|home|family)\b", re.I)
def pname(s):
    s = S(s).title()
    return s if s and KW.search(s) and not HH.search(s) else ''
apps = []; cnt = collections.Counter()
for f in L('Planning_Applications'):
    p = f['properties']; d = S(p['SUBMITTAL_DATE']) or S(p['EFFECTIVE_DATE'])
    if d[:4] < '2020': continue
    g = G(f)
    if g is None or not BOX.contains(g.representative_point()): continue
    t = S(p['SUBTYPE']); cnt[t] += 1
    apps.append({'c': pt(g), 't': t, 'a': S(p['APPNUM']), 's': S(p['STATUS']).title(), 'y': int(d[:4]), 'n': '' if t in HIDE else pname(p['PROJECT_NAME']),
                 'u': int(float(p['NUMBER_OF_DUS'])) if S(p['NUMBER_OF_DUS']).replace('.', '').isdigit() else 0})
out['apps'] = apps; out['apps_through'] = max(S(f['properties']['SUBMITTAL_DATE'])[:10] for f in L('Planning_Applications'))
# --- approved subdivisions with homes still to be built (A approved, E existing, R remaining; A - E = R in the city's table)
dev = []
for f in L('Development_Approval_Tracking_System'):
    p = f['properties']; r = int(p.get('ps_RResSum') or 0)
    if r < 10 or S(p.get('ps_City')) != 'Lincoln': continue
    g = G(f)
    if g is None: continue
    rr = rings(g, 10)
    if rr: dev.append({'n': S(p['de_Description']), 'p': rr, 'c': pt(g), 'ap': int(p['ps_AResSum'] or 0), 'ex': int(p['ps_EResSum'] or 0), 'rem': r, 'tier': S(p['ps_growthTier'])})
out['dev'] = dev
# --- 2050 future land use (built categories and green space), dissolved by category
cats = collections.defaultdict(list)
for f in L('Future_Land_Use_2050'):
    c = S(f['properties']['SHORTCAT'])
    if c in ('RES-URBAN', 'RES-LOW', 'COM', 'IND', 'L-IND', 'PUB/SEMI-P', 'GREEN', 'ENV'):
        g = G(f)
        if g is not None: cats[c].append(g.buffer(0))
out['flu'] = {c: rings(unary_union(v), 25, 20000) for c, v in cats.items()}
# --- growth tiers
tiers = collections.defaultdict(list)
for f in L('Urban_Growth_Tiers_2050'):
    t = S(f['properties']['Tier'])
    if t: tiers[t].append(G(f).buffer(0))
out['tiers'] = {t: rings(unary_union(v), 25, 20000) for t, v in tiers.items()}
# --- annexations by decade (City of Lincoln)
dec = collections.defaultdict(list); acres = collections.Counter()
for f in L('Annexations_Lincoln'):
    p = f['properties']
    if p['CITY'] != 'Lincoln': continue
    y = int(p['ANNEXYR'] or 0); d = (y // 10 * 10) if y >= 1950 else 1940
    g = G(f)
    if g is None: continue
    dec[d].append(g.buffer(0)); acres[d] += float(p['ACRES'] or 0)
out['annex'] = {str(d): rings(unary_union(v).buffer(4).buffer(-4), 15, 8000) for d, v in sorted(dec.items())}
out['annex_acres'] = {str(d): round(a) for d, a in sorted(acres.items())}
# --- airport noise contours, historic districts and sites
out['noise'] = [{'dnl': int(f['properties']['DNL']), 'l': line(G(f), 10)} for f in L('Airport_Noise_Contours')]
TY = {'LL': 'Local landmark district', 'NR': 'National Register district', 'LL/NR': 'Local landmark and National Register district'}
out['hd'] = [{'n': S(f['properties']['NAME']), 't': TY.get(f['properties']['TYPE'], 'Historic district'), 'y': S(f['properties']['YEAR']), 'p': rings(G(f), 4, 300), 'c': pt(G(f))} for f in L('Historic_Districts')]
out['hs'] = [{'n': S(p['Name']), 't': S(p['D_TYPE']), 'ar': S(p['Architect']), 'b': S(p['Yr_Built']), 'd': S(p['YR_Designated']), 's': S(p['ShortDescription']), 'c': pt(G(f))}
             for f in L('Historic_Preservation_Sites') for p in [f['properties']] if p['HP_Type'] == 'Historic Site' and f.get('geometry')]
fn = os.path.join(root, 'data', 'plans.json'); json.dump(out, open(fn, 'w'), separators=(',', ':'))
print(os.path.getsize(fn), {k: (len(v) if hasattr(v, '__len__') else v) for k, v in out.items()}, cnt.most_common(12), out['annex_acres'])
print({k: len(json.dumps(v)) for k, v in out.items()})
