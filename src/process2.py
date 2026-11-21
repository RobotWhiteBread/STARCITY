# STARCITY second data pack: property values, taxes, sales, population, traffic counts, crashes, cameras,
# local businesses, voting precincts, civic places and the other city layers. Reads the main pack (data.z)
# for the building list so everything lines up with it. Writes data2.z and data2.b64.
# Never read here: owner names, mailing addresses, buyer or seller names. The download scripts do not ask for them.
import json, glob, math, zlib, struct, base64, os, sys, re, collections, datetime
import numpy as np
D = os.environ.get('STARCITY_DATA', '/mnt/user-data/uploads/STARCITY/')
G = os.environ.get('STARCITY_GIS', '/home/claude/data/gis/')
V = os.environ.get('STARCITY_VOTES', '/home/claude/data/votes/')
LAT0, LON0 = 40.77, -96.64
KX = 111320 * math.cos(math.radians(LAT0)); KY = 111000.0
Q = 0.5; LIM = 16150.0
def P(lon, lat): return ((lon - LON0) * KX, (lat - LAT0) * KY)
def log(*a): print(*a, file=sys.stderr)

def feats(name, base=G):
    out = []
    for p in sorted(glob.glob(f'{base}{name}/*.json')):
        try: out += json.load(open(p, encoding='utf-8', errors='replace')).get('features', [])
        except Exception as e: log('bad', p, e)
    return out
def props(f): return f.get('properties') or f.get('attributes') or {}
def rings_of(g):
    """list of polygons, each a list of rings of (x,n) in meters"""
    if not g: return []
    t = g['type']; c = g['coordinates']
    polys = [c] if t == 'Polygon' else (c if t == 'MultiPolygon' else [])
    return [[[P(a[0], a[1]) for a in r] for r in poly] for poly in polys]
def lines_of(g):
    if not g: return []
    t = g['type']; c = g['coordinates']
    ls = [c] if t == 'LineString' else (c if t == 'MultiLineString' else [])
    return [[P(a[0], a[1]) for a in l] for l in ls]
def pt_of(g):
    if not g: return None
    t = g['type']; c = g['coordinates']
    if t == 'Point': return P(c[0], c[1])
    if t == 'MultiPoint' and c: return P(c[0][0], c[0][1])
    return None
def area(r):
    s = 0.0
    for i in range(len(r)):
        x1, y1 = r[i]; x2, y2 = r[(i + 1) % len(r)]; s += x1 * y2 - x2 * y1
    return s / 2
def centroid(r):
    a = area(r)
    if abs(a) < 1e-6:
        return (sum(p[0] for p in r) / len(r), sum(p[1] for p in r) / len(r))
    cx = cy = 0.0
    for i in range(len(r)):
        x1, y1 = r[i]; x2, y2 = r[(i + 1) % len(r)]; k = x1 * y2 - x2 * y1
        cx += (x1 + x2) * k; cy += (y1 + y2) * k
    return (cx / (6 * a), cy / (6 * a))
def pin(pt, r):
    x, y = pt; ins = False; n = len(r); j = n - 1
    for i in range(n):
        xi, yi = r[i]; xj, yj = r[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: ins = not ins
        j = i
    return ins
def pin_poly(pt, poly):  # rings: outer then holes
    if not pin(pt, poly[0]): return False
    for h in poly[1:]:
        if pin(pt, h): return False
    return True
def dp(pts, tol):
    if len(pts) < 3: return list(pts)
    keep = [False] * len(pts); keep[0] = keep[-1] = True; st = [(0, len(pts) - 1)]
    while st:
        a, b = st.pop(); ax, ay = pts[a]; bx, by = pts[b]; dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy) or 1e-9
        m = 0; mi = -1
        for i in range(a + 1, b):
            d = abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / L
            if d > m: m = d; mi = i
        if m > tol: keep[mi] = True; st.append((a, mi)); st.append((mi, b))
    return [p for p, k in zip(pts, keep) if k]
def simp_ring(r, tol):
    if len(r) > 1 and r[0] == r[-1]: r = r[:-1]
    if len(r) < 4: return r
    # split at the farthest point from the first so a closed ring simplifies sanely
    k = max(range(len(r)), key=lambda i: (r[i][0] - r[0][0]) ** 2 + (r[i][1] - r[0][1]) ** 2)
    a = dp(r[:k + 1], tol); b = dp(r[k:] + [r[0]], tol)
    out = a[:-1] + b[:-1]
    return out if len(out) >= 3 else r
def clampp(p): return (max(-LIM, min(LIM, p[0])), max(-LIM, min(LIM, p[1])))
def inside(p, lim=LIM): return abs(p[0]) <= lim and abs(p[1]) <= lim
def qv(v): return int(max(-32767, min(32767, round(v / Q))))
class Grid:
    def __init__(s, cell): s.c = cell; s.d = collections.defaultdict(list)
    def add_box(s, x0, y0, x1, y1, v):
        for i in range(int(x0 // s.c), int(x1 // s.c) + 1):
            for j in range(int(y0 // s.c), int(y1 // s.c) + 1): s.d[(i, j)].append(v)
    def at(s, x, y): return s.d.get((int(x // s.c), int(y // s.c)), ())
def bbox(r): return (min(p[0] for p in r), min(p[1] for p in r), max(p[0] for p in r), max(p[1] for p in r))
def med(v):
    v = sorted(v); n = len(v)
    return 0 if not n else (v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2)
def title(s):
    s = str(s if s is not None else '').strip()
    if not s: return ''
    out = []
    for w in s.split():
        lw = w.lower()
        if re.fullmatch(r'\d+(st|nd|rd|th)', lw): out.append(lw)
        elif lw in ('n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se') or (len(w) <= 3 and w.isupper() and w in ('LPS', 'UNL', 'NE', 'US', 'YMCA', 'BMX', 'II', 'III', 'IV')): out.append(w.upper())
        else: out.append(w[:1].upper() + w[1:].lower())
    return ' '.join(out)
def iso(ms):
    return (datetime.datetime(1970, 1, 1) + datetime.timedelta(milliseconds=ms)).date().isoformat() if ms else ''

# ---------------------------------------------------------------- main pack: buildings
buf = zlib.decompress(open('data.z', 'rb').read())
hl = struct.unpack('<I', buf[:4])[0]; H = json.loads(buf[4:4 + hl]); base = 4 + hl
TY = {'B': np.uint8, 'H': np.uint16, 'h': np.int16, 'I': np.uint32}
S = {k: np.frombuffer(buf, dtype=TY[t], count=n, offset=base + o) for k, (o, n, t) in H['secs'].items()}
NB = len(S['b_rings']); log('buildings', NB)
b_outer = []; b_cen = np.zeros((NB, 2)); b_area = np.zeros(NB)
ri = 0; xi = 0; xy = S['b_xy']; rs = S['b_rs']
for b in range(NB):
    outer = None
    for k in range(int(S['b_rings'][b])):
        n = int(rs[ri]); ri += 1
        r = [(float(xy[xi + 2 * j]) * Q, float(xy[xi + 2 * j + 1]) * Q) for j in range(n)]; xi += 2 * n
        if k == 0: outer = r
    b_outer.append(outer); c = centroid(outer); b_cen[b] = c; b_area[b] = abs(area(outer))
b_pid = []
for b in range(NB):
    p1 = int(S['b_p1'][b])
    b_pid.append(f"{p1:07d}{int(S['b_p2'][b]):03d}{int(S['b_p3'][b]):03d}" if p1 else '')
tags = H['tags']; b_tag = [tags[int(t)] for t in S['b_tag']]
bgrid = Grid(60.0)
for b in range(NB):
    x0, y0, x1, y1 = bbox(b_outer[b]); bgrid.add_box(x0, y0, x1, y1, b)
def building_at(pt):
    for b in bgrid.at(pt[0], pt[1]):
        if pin(pt, b_outer[b]): return b
    return -1

# ---------------------------------------------------------------- parcels: value, class, tax district, neighborhood
# Consolidated levy per $100 of value for every Lancaster County tax district, tax year 2025 (the bills paid in 2026).
# Source: Nebraska Department of Revenue, Property Assessment Division, "Taxing Unit Group Summary", Lancaster, run 11/17/2025:
# https://revenue.nebraska.gov/sites/default/files/doc/pad/research/valuation/2026/PDF's/55Lancaster_Tax_Districts.pdf
LEVY_YEAR = 2025
_LEVY = '''0001=1.666284 0003=1.442101 0004=1.420382 0005=1.370720 0007=1.375538 0027=1.282510 0028=1.200420 0029=1.207408 0030=1.225719 0031=1.194418 0032=1.201406 0033=1.216551
0034=1.246447 0035=1.196785 0037=1.264008 0038=1.507282 0040=1.147419 0041=1.125700 0043=1.445901 0055=1.107558 0056=1.114546 0059=1.115696 0060=1.122684 0062=1.138477 0063=1.145465
0065=1.129215 0068=1.137495 0070=1.103923 0071=1.108741 0072=1.585632 0073=1.543869 0074=1.539764 0075=1.391908 0077=1.200971 0078=1.218295 0079=1.260742 0080=1.239023 0081=1.244219
0082=1.251232 0084=1.300019 0085=1.307007 0089=1.601951 0090=1.461045 0093=1.469325 0094=1.437733 0096=1.445480 0097=1.440571 0098=1.922107 0099=1.902218 0101=1.532801 0102=1.044901
0103=1.163129 0105=1.224783 0114=1.365874 0129=1.300019 0130=1.437943 0146=1.080856 0150=1.085765 0156=1.196785 0159=1.103923 0160=1.108741 0161=1.137495 0165=1.380447 0166=1.572446
0167=1.505883 0168=1.277764 0169=1.216110 0170=1.211201 0171=1.374355 0174=1.107558 0181=1.374355 0182=1.107558 0183=1.107558 0191=1.144646 0196=1.105903 0197=1.137495 0208=1.469325
0210=1.440571 0212=1.129215 0214=1.666284 0219=1.631052 0220=1.631052 0226=1.656064 0227=1.631052 0229=1.635372 0230=1.636332 0231=1.610360 0236=1.643109 0238=1.196785 0239=1.596322
0240=1.603099 0242=1.595362 9300=1.902218 9301=1.902218 9501=1.391908 9502=1.391908 9503=1.391908 9504=1.391908 9505=1.391908 9506=1.391908 9601=1.445901 9707=1.585632 9809=1.507282
9811=1.507282 9813=1.507282 9815=1.507282 9817=1.507282 9819=1.507282 9821=1.507282'''
LEVY = {k: float(v) for k, v in (x.split('=') for x in _LEVY.split())}
LINC_RATE = LEVY['0001']
def rate_of(code):
    code = code or ''
    if code in LEVY: return LEVY[code]
    # every Lincoln tax-increment district on the state's list (94xx and 99xx) carries the main district's levy, so newer ones are given it too
    if re.match(r'^9[49]\d\d$', code): return LINC_RATE
    return 0.0
yrb = {}
for p in sorted(glob.glob(D + 'parcels/*.json')):
    for f in json.load(open(p)).get('features', []):
        a = f['attributes']
        if a.get('RESYRBLT'): yrb[a['PARCELID']] = int(a['RESYRBLT'])
PAR = []; pidx = {}
for f in feats('parcels2'):
    a = props(f); polys = rings_of(f.get('geometry'))
    if not polys: continue
    big = max(polys, key=lambda pl: abs(area(pl[0])))
    c = centroid(big[0])
    v = float(a.get('CNTASSDVAL') or 0); ar = float(a.get('GIS_AREA') or 0)
    rec = dict(id=a['PARCELID'], v=v, sqft=ar, ac=ar / 43560.0, nb=a.get('NGHBRHDCD') or '', cls=a.get('CLASSDSCRP') or 'Unclassified',
               tx=a.get('CVTTXCD') or '', fa=float(a.get('RESFLRAREA') or 0), hr=int(a.get('HighRise') or 0), c=c, polys=polys,
               yr=yrb.get(a['PARCELID'], 0))
    rec['rate'] = rate_of(rec['tx']); rec['tax'] = v * rec['rate'] / 100.0
    if a['PARCELID'] in pidx:
        # the county lists a few parcel numbers twice (condo regimes); keep the higher value
        o = PAR[pidx[a['PARCELID']]]
        if v > o['v']: PAR[pidx[a['PARCELID']]] = rec
        continue
    pidx[a['PARCELID']] = len(PAR); PAR.append(rec)
log('parcels', len(PAR), 'value $B', round(sum(p['v'] for p in PAR) / 1e9, 2), 'with levy', sum(1 for p in PAR if p['rate']))
# sanity: GIS_AREA should be square feet
_s = [p for p in PAR[:4000] if p['sqft'] > 0]
log('area check (geom m2*10.7639 / GIS_AREA) median', round(med([sum(abs(area(pl[0])) for pl in p['polys']) * 10.7639 / p['sqft'] for p in _s]), 3))
pgrid = Grid(120.0)
for i, p in enumerate(PAR):
    for pl in p['polys']:
        x0, y0, x1, y1 = bbox(pl[0]); pgrid.add_box(x0, y0, x1, y1, (i, pl))
def parcel_at(pt):
    best = -1; ba = 1e18
    for i, pl in pgrid.at(pt[0], pt[1]):
        if pin_poly(pt, pl):
            a = abs(area(pl[0]))
            if a < ba: ba = a; best = i
    return best
CLS = ['Unclassified', 'Residential Improved', 'Residential Unimproved', 'Commercial Improved', 'Commercial Unimproved', 'Ag Improved', 'Ag Unimproved', 'Commercial IOLL']
clsi = {c: i for i, c in enumerate(CLS)}
nbcodes = sorted({p['nb'] for p in PAR if p['nb']}); nbi = {c: i + 1 for i, c in enumerate(nbcodes)}
txcodes = sorted({p['tx'] for p in PAR if p['tx']}); txi = {c: i + 1 for i, c in enumerate(txcodes)}
b_val = np.zeros(NB, np.uint32); b_cls = np.zeros(NB, np.uint8); b_nb = np.zeros(NB, np.uint16); b_fa = np.zeros(NB, np.uint16)
b_tx = np.zeros(NB, np.uint8); b_sv = np.zeros(NB, np.uint32); b_un = np.zeros(NB, np.uint16); b_par = np.full(NB, -1, np.int32)
hit_pid = hit_pip = 0
for b in range(NB):
    i = pidx.get(b_pid[b], -1)
    if i >= 0: hit_pid += 1
    else:
        i = parcel_at((b_cen[b][0], b_cen[b][1]))
        if i >= 0: hit_pip += 1
    if i < 0: continue
    p = PAR[i]; b_par[b] = i
    b_val[b] = min(4294967295, int(round(p['v']))); b_cls[b] = clsi.get(p['cls'], 0); b_nb[b] = nbi.get(p['nb'], 0)
    b_fa[b] = min(65535, int(round(p['fa']))); b_tx[b] = min(255, txi.get(p['tx'], 0))
log('building->parcel by number', hit_pid, 'by position', hit_pip, 'none', NB - hit_pid - hit_pip)
# several parcels under one roof (condos, townhome rows): add up every parcel whose center sits inside the outline
cnt = collections.Counter(); tot = collections.Counter()
for i, p in enumerate(PAR):
    b = building_at(p['c'])
    if b >= 0: cnt[b] += 1; tot[b] += p['v']
for b, n in cnt.items():
    if n >= 2: b_un[b] = min(65535, n); b_sv[b] = min(4294967295, int(round(tot[b])))
log('buildings holding several parcels', int((b_un > 0).sum()), 'largest', int(b_un.max()))
# assessor neighborhoods: median home value, for the "how does this compare" line
nbv = collections.defaultdict(list)
for p in PAR:
    if p['cls'] == 'Residential Improved' and p['v'] > 0 and p['nb']: nbv[p['nb']].append(p['v'])
NBL = [['', 0, 0]] + [[c, int(med(nbv[c])) if c in nbv else 0, len(nbv.get(c, []))] for c in nbcodes]
TXL = [['', 0]] + [[c, round(rate_of(c), 6)] for c in txcodes]
homes = [p['v'] for p in PAR if p['cls'] == 'Residential Improved' and p['v'] > 0]
CITY = dict(parcels=len(PAR), total=int(sum(p['v'] for p in PAR)), homes=len(homes), medHome=int(med(homes)),
            byClass={c: [sum(1 for p in PAR if p['cls'] == c), int(sum(p['v'] for p in PAR if p['cls'] == c))] for c in CLS if any(p['cls'] == c for p in PAR)},
            tax=int(sum(p['tax'] for p in PAR)), taxParcels=sum(1 for p in PAR if p['rate']), rate=LINC_RATE, rateYear=LEVY_YEAR,
            county=[[a['PropType'], a['PropertyCount'], a['AssessedValue']] for a in (props(f) for f in feats('valcount'))],
            ranges=[[re.sub(r'^\d', '', a['ValueRange']), a['PropertyCount']] for a in (props(f) for f in feats('valrange'))])
log('city', json.dumps(CITY)[:600])
# slices of value and estimated tax: by property type, by home value band, by school district, by tax district
def _agg(keyf, items=None):
    d = collections.OrderedDict()
    for p in (items or PAR):
        k = keyf(p)
        if k is None: continue
        e = d.setdefault(k, [0, 0.0, 0.0, 0]); e[0] += 1; e[1] += p['v']; e[2] += p['tax']; e[3] += 1 if p['rate'] else 0
    return [[k, e[0], int(e[1]), int(e[2]), e[3]] for k, e in d.items()]
BANDS = [(0, 100000, 'under $100k'), (100000, 200000, '$100k to $200k'), (200000, 300000, '$200k to $300k'), (300000, 400000, '$300k to $400k'), (400000, 500000, '$400k to $500k'), (500000, 1e12, '$500k and up')]
def band(v):
    for i, (a, b, l) in enumerate(BANDS):
        if a <= v < b: return i
    return 5
_sch = {}
for f in feats('parcels2'):
    a = props(f); _sch[a['PARCELID']] = re.sub(r'^[\d-]+\s*', '', a.get('SCHLDSCRP') or '') or 'Not listed'
homesP = [p for p in PAR if p['cls'] == 'Residential Improved' and p['v'] > 0]
TAXS = dict(
    byClass=sorted(_agg(lambda p: p['cls']), key=lambda r: -r[2]),
    byBand=[[BANDS[k][2]] + r[1:] for k, r in ((r[0], r) for r in sorted(_agg(lambda p: band(p['v']), homesP), key=lambda r: r[0]))],
    bySchool=sorted(_agg(lambda p: _sch.get(p['id'], 'Not listed')), key=lambda r: -r[2]),
    byDistrict=sorted(_agg(lambda p: p['tx'] or 'none'), key=lambda r: -r[2])[:10],
    top=[[round(p['c'][0]), round(p['c'][1]), int(p['v']), p['cls']] for p in sorted(PAR, key=lambda p: -p['v'])[:12] if inside(p['c'])])
for r in TAXS['byDistrict']: r.append(round(rate_of(r[0]), 6))
log('tax slices', json.dumps(TAXS)[:900])
ms = sorted((props(f) for f in feats('monsale')), key=lambda m: (m['Year'], m['Month']))
CITY['monthly'] = [[m['Year'], m['Month'], int(m['MedSalePrice'] or 0), int(m['SaleCount'] or 0)] for m in ms]

# ---------------------------------------------------------------- hex grid: value, tax, homes, people, crashes
R = 80.0; HW = 1.5 * R; HH = math.sqrt(3) * R; HALF = 16400.0
NC = int(math.ceil(2 * HALF / HW)) + 1; NR = int(math.ceil(2 * HALF / HH)) + 1
HEXAC = 1.5 * math.sqrt(3) * R * R / 4046.8564
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
HX = collections.defaultdict(lambda: dict(v=0.0, ac=0.0, tax=0.0, tac=0.0, n=0, hv=[], psf=[], yr=[], pop=0.0, cr=0, biz=0))
cellA = 1.5 * math.sqrt(3) * R * R
for p in PAR:
    if not inside(p['c'], HALF): continue
    cells = []
    geoA = sum(abs(area(pl[0])) for pl in p['polys'])
    if geoA > 1.6 * cellA:
        for pl in p['polys']:
            x0, y0, x1, y1 = bbox(pl[0])
            for c in range(max(0, int((x0 + HALF) / HW) - 1), min(NC, int((x1 + HALF) / HW) + 2)):
                for r in range(max(0, int((y0 + HALF) / HH) - 1), min(NR, int((y1 + HALF) / HH) + 2)):
                    if pin_poly(hex_center(c, r), pl): cells.append(c * NR + r)
    if not cells:
        h = hex_of(*p['c'])
        if h is None: continue
        cells = [h]
    k = len(cells)
    for h in cells:
        e = HX[h]; e['v'] += p['v'] / k; e['ac'] += p['ac'] / k
        if p['rate']: e['tax'] += p['tax'] / k; e['tac'] += p['ac'] / k
    e = HX[cells[0] if k == 1 else hex_of(*p['c']) or cells[0]]; e['n'] += 1
    if p['cls'] == 'Residential Improved' and p['v'] > 0:
        e['hv'].append(p['v'])
        if p['fa'] > 200: e['psf'].append(p['v'] / p['fa'])
        if p['yr']: e['yr'].append(p['yr'])

# population: 2020 Census block counts spread over the homes in each block (by floor space), then summed per hexagon
RES = {'house', 'detached', 'apartments', 'residential', 'semidetached_house', 'terrace', 'dormitory', 'static_caravan', 'bungalow', 'Residential'}
blocks = []
for f in feats('blocks'):
    a = props(f); pop = int(a.get('P1_001N') or 0)
    if pop <= 0: continue
    for pl in rings_of(f.get('geometry')): blocks.append((pop, pl))
blgrid = Grid(200.0)
for i, (pop, pl) in enumerate(blocks):
    x0, y0, x1, y1 = bbox(pl[0]); blgrid.add_box(x0, y0, x1, y1, i)
bb = collections.defaultdict(list)
for b in range(NB):
    pt = (b_cen[b][0], b_cen[b][1])
    for i in blgrid.at(*pt):
        if pin_poly(pt, blocks[i][1]): bb[i].append(b); break
b_pop = np.zeros(NB); POPMAP = 0; lost = 0
for i, (pop, pl) in enumerate(blocks):
    bs = bb.get(i, [])
    res = [b for b in bs if b_tag[b] in RES or CLS[int(b_cls[b])].startswith('Residential')]
    use = res or bs
    if not use:
        c = centroid(pl[0])
        if inside(c, HALF):
            h = hex_of(*c)
            if h is not None: HX[h]['pop'] += pop; POPMAP += pop
        else: lost += pop
        continue
    w = [b_area[b] * max(1.0, math.floor(float(S['b_h'][b]) / 10 / 3.1)) for b in use]; sw = sum(w) or 1
    for b, wi in zip(use, w): b_pop[b] += pop * wi / sw
for b in range(NB):
    if b_pop[b] > 0:
        h = hex_of(b_cen[b][0], b_cen[b][1])
        if h is not None: HX[h]['pop'] += b_pop[b]; POPMAP += b_pop[b]
log('population placed on the map', int(POPMAP), 'outside the map', lost)

# crashes (the city's public crash layer holds calendar 2019)
CR = []
for f in feats('crashes'):
    a = props(f); pt = pt_of(f.get('geometry'))
    if not pt or not inside(pt): continue
    d = a.get('Accident_D'); mo = (datetime.datetime(1970, 1, 1) + datetime.timedelta(milliseconds=d)).month if d else 0
    CR.append((pt, mo, a.get('Pedest_In_') == 'Y', a.get('Pedal_Cycl') == 'Y', a.get('Alcohol_Re') == 'Y', a.get('Motor_Cycl') == 'Y'))
    h = hex_of(*pt)
    if h is not None: HX[h]['cr'] += 1
log('crashes on map', len(CR), 'ped', sum(1 for c in CR if c[2]), 'bike', sum(1 for c in CR if c[3]))

# ---------------------------------------------------------------- local businesses (OpenStreetMap)
NEB = {"runza": "Lincoln, 1949", "valentino's": "Lincoln, 1957", "amigos": "Lincoln, 1980", "amigos kings classic": "Lincoln, 1980", "amigos/kings classic": "Lincoln, 1980",
       "scooter's coffee": "Bellevue, 1998", "scooter's coffee shop": "Bellevue, 1998", "godfather's pizza": "Omaha, 1973", "pepperjax grill": "Omaha",
       "don & millie's": "Omaha", "davinci's": "Lincoln", "taco inn": "Lincoln"}
CHAINX = {'yogurtini', 'goodcents', '7 brew coffee', 'ace rent-to-own', 'hy-vee fast & fresh', 'phillips 66', 'shell', 'amoco', 'bp', 'sinclair', 'conoco'}
CATS = ['Restaurants', 'Coffee, bakeries and treats', 'Bars and breweries', 'Groceries and food shops', 'Shops', 'Thrift and vintage', 'Services', 'Health and care', 'Arts and fun', 'Places to stay', 'Gas and convenience', 'Banks', 'Offices']
CUIS = ['Mexican', 'Pizza and Italian', 'Burgers', 'Sandwiches and subs', 'Chicken and wings', 'Asian', 'BBQ and steak', 'American and breakfast', 'World flavors', 'Other or not listed']
CMAP = {'mexican': 0, 'tex-mex': 0, 'taco': 0, 'burrito': 0, 'pizza': 1, 'italian': 1, 'pasta': 1, 'calzone': 1, 'burger': 2, 'sandwich': 3, 'bagel': 3, 'deli': 3, 'chicken': 4, 'wings': 4,
        'chinese': 5, 'japanese': 5, 'sushi': 5, 'ramen': 5, 'vietnamese': 5, 'thai': 5, 'korean': 5, 'asian': 5, 'mongolian_grill': 5, 'filipino': 5, 'hawaiian': 5, 'noodle': 5,
        'barbecue': 6, 'steak_house': 6, 'southern': 6, 'soul_food': 6, 'american': 7, 'breakfast': 7, 'pancake': 7, 'regional': 7, 'diner': 7, 'brunch': 7,
        'indian': 8, 'mediterranean': 8, 'middle_eastern': 8, 'kebab': 8, 'persian': 8, 'afghan': 8, 'ethiopian': 8, 'cuban': 8, 'brazilian': 8, 'guatemalan': 8, 'german': 8, 'irish': 8, 'cajun': 8, 'gyros': 8, 'greek': 8, 'fusion': 8, 'french': 8, 'african': 8, 'latin_american': 8, 'salvadoran': 8, 'peruvian': 8}
SWEET = {'coffee_shop', 'ice_cream', 'donut', 'bubble_tea', 'juice', 'tea', 'coffee', 'bakery', 'baked_goods', 'frozen_yogurt', 'crepe', 'pretzel', 'popcorn', 'dessert', 'cake', 'smoothie'}
FOODSHOP = {'supermarket', 'greengrocer', 'butcher', 'deli', 'health_food', 'farm', 'seafood', 'cheese', 'spices', 'beverages', 'grocery', 'frozen_food', 'nutrition_supplements', 'water'}
TREATSHOP = {'bakery', 'pastry', 'confectionery', 'chocolate', 'coffee', 'tea', 'ice_cream'}
SERVSHOP = {'hairdresser', 'beauty', 'tattoo', 'laundry', 'dry_cleaning', 'car_repair', 'car', 'tyres', 'car_parts', 'optician', 'copyshop', 'storage_rental', 'funeral_directors', 'massage', 'travel_agency', 'rental', 'motorcycle', 'locksmith', 'tailor', 'shoe_repair', 'pet_grooming', 'money_lender', 'pawnbroker', 'hearing_aids', 'medical_supply', 'mobile_phone', 'trade', 'vacant'}
def classify(t):
    am = t.get('amenity'); sh = t.get('shop'); cu = [c.strip().lower() for c in (t.get('cuisine') or '').split(';') if c.strip()]
    if am in ('restaurant', 'fast_food', 'food_court'):
        if cu and all(c in SWEET for c in cu): return 1, -1
        g = next((CMAP[c] for c in cu if c in CMAP), 9); return 0, g
    if am in ('cafe', 'ice_cream'): return 1, -1
    if am in ('bar', 'pub', 'biergarten', 'nightclub') or t.get('craft') in ('brewery', 'winery', 'distillery') or sh in ('alcohol', 'wine'): return 2, -1
    if sh in TREATSHOP: return 1, -1
    if sh in FOODSHOP: return 3, -1
    if sh == 'convenience' or am == 'fuel' or sh == 'gas': return 10, -1
    if sh in ('second_hand', 'charity', 'antiques') or t.get('second_hand') in ('only', 'yes'): return 5, -1
    if am == 'bank': return 11, -1
    if am in ('doctors', 'dentist', 'clinic', 'pharmacy', 'veterinary', 'childcare') or sh == 'chemist' or t.get('healthcare'): return 7, -1
    if am in ('cinema', 'theatre', 'library', 'marketplace') or t.get('tourism') in ('museum', 'gallery', 'attraction') or t.get('leisure') in ('fitness_centre', 'bowling_alley', 'sports_centre', 'golf_course'): return 8, -1
    if t.get('tourism') in ('hotel', 'motel'): return 9, -1
    if am == 'car_wash' or sh in SERVSHOP or t.get('craft'): return 6, -1
    if sh: return 4, -1
    if t.get('office'): return 12, -1
    return 6, -1
BIZ = []; seen = set()
for e in json.load(open(D + 'places.json'))['elements']:
    t = e.get('tags') or {}; nm = (t.get('name') or '').strip()
    if not nm or t.get('shop') == 'vacant' or t.get('disused:shop') or t.get('abandoned'): continue
    lat = e.get('lat') or (e.get('center') or {}).get('lat'); lon = e.get('lon') or (e.get('center') or {}).get('lon')
    if lat is None: continue
    pt = P(lon, lat)
    if not inside(pt): continue
    key = (nm.lower(), round(pt[0] / 25), round(pt[1] / 25))
    if key in seen: continue
    seen.add(key)
    ln = nm.lower(); cat, cg = classify(t)
    who = 0  # 0 local or independent, 1 Nebraska-born chain, 2 chain
    if ln in NEB: who = 1
    elif t.get('brand:wikidata') or t.get('brand') or ln in CHAINX: who = 2
    fl = 0
    if t.get('takeaway') in ('yes', 'only'): fl |= 1
    if t.get('drive_through') in ('yes', 'only'): fl |= 2
    if t.get('outdoor_seating') == 'yes': fl |= 4
    if t.get('internet_access') in ('wlan', 'yes'): fl |= 8
    if t.get('delivery') == 'yes': fl |= 16
    if t.get('diet:vegetarian') in ('yes', 'only') or t.get('diet:vegan') in ('yes', 'only'): fl |= 32
    if t.get('wheelchair') == 'yes': fl |= 64
    addr = ' '.join(x for x in [t.get('addr:housenumber', ''), t.get('addr:street', '')] if x)
    web = t.get('website') or t.get('contact:website') or ''
    if web and not re.match(r'^https?://', web): web = 'https://' + web
    kind = (t.get('cuisine') or t.get('shop') or t.get('amenity') or t.get('craft') or t.get('office') or t.get('tourism') or t.get('leisure') or '').replace(';', ', ').replace('_', ' ')
    if kind == 'yes': kind = ''
    BIZ.append(dict(n=nm, x=pt[0], y=pt[1], c=cat, g=cg, w=who, f=fl, a=addr, u=web[:140], h=(t.get('opening_hours') or '')[:160], k=kind[:60],
                    o=('n' if e['type'] == 'node' else 'w' if e['type'] == 'way' else 'r') + str(e['id']), nb=NEB.get(ln, '')))
    h = hex_of(*pt)
    if h is not None: HX[h]['biz'] += 1
BIZ.sort(key=lambda b: (b['c'], b['n'].lower()))
log('businesses', len(BIZ), 'who', collections.Counter(b['w'] for b in BIZ), 'cats', collections.Counter(CATS[b['c']] for b in BIZ).most_common())

# ---------------------------------------------------------------- pack the hex grid
hk = sorted(h for h, e in HX.items() if e['n'] or e['pop'] >= 1 or e['cr'] or e['biz'])
def u16(v): return int(max(0, min(65535, round(v))))
hx = dict(i=[], vpa=[], med=[], tpa=[], psf=[], yr=[], hpa=[], pop=[], cr=[], n=[], nh=[], biz=[], tot=[])
for h in hk:
    e = HX[h]; hx['i'].append(h)
    hx['vpa'].append(u16(e['v'] / e['ac'] / 5000) if e['ac'] > 0.05 else 0)         # $5,000 per acre units
    hx['med'].append(u16(med(e['hv']) / 1000) if len(e['hv']) >= 3 else 0)            # $1,000 units
    hx['tpa'].append(u16(e['tax'] / e['tac'] / 100) if e['tac'] > 0.05 else 0)        # $100 per acre units
    hx['psf'].append(u16(med(e['psf'])) if len(e['psf']) >= 3 else 0)
    hx['yr'].append(u16(med(e['yr'])) if len(e['yr']) >= 3 else 0)
    hx['hpa'].append(u16(len(e['hv']) / HEXAC * 10))
    hx['pop'].append(u16(e['pop'] / HEXAC * 10))                                       # people per acre x10
    hx['cr'].append(u16(e['cr'])); hx['n'].append(u16(e['n'])); hx['nh'].append(u16(len(e['hv']))); hx['biz'].append(u16(e['biz']))
    hx['tot'].append(u16(e['v'] / 100000))                                             # $100,000 units, total in the cell
log('hex cells', len(hk), 'max vpa $M/ac', max(hx['vpa']) * 5000 / 1e6, 'max pop/ac', max(hx['pop']) / 10, 'max crashes', max(hx['cr']))

# ---------------------------------------------------------------- output plumbing
SECS = {}; HEAD = dict(v=2, q=Q, hex=dict(R=R, nc=NC, nr=NR, half=HALF, acres=round(HEXAC, 4)), layers=[], man=[])
def sec(name, typ, arr):
    dt = {'B': np.uint8, 'H': np.uint16, 'h': np.int16, 'I': np.uint32, 'f': np.float32}[typ]
    SECS[name] = (typ, np.asarray(arr, dtype=dt))
TODAY = '2026-11-14'
def layer(id, title, group, kind, n, src, asof, note, fields, style, live=None):
    L = dict(id=id, t=title, g=group, k=kind, n=n, src=src, asof=asof, note=note, f=fields, st=style)
    if live: L['live'] = live
    HEAD['layers'].append(L); return L
def pts_layer(id, title, group, rows, src, asof, note, fields, style):
    """rows: list of (pt, {field: value}); fields: list of (key,label,type) with type s (text), n (number), c (category)"""
    rows = [r for r in rows if r[0] and inside(r[0])]
    xy = []
    for pt, a in rows: xy += [qv(pt[0]), qv(pt[1])]
    sec(id + '_xy', 'h', xy)
    fl = pack_fields(id, [a for pt, a in rows], fields)
    layer(id, title, group, 'pt', len(rows), src, asof, note, fl, style); log(id, len(rows)); return rows
def pack_fields(id, recs, fields):
    out = []
    for key, label, typ, *rest in fields:
        unit = rest[0] if rest else ''
        if typ == 's': out.append(dict(k=key, l=label, t='s', v=[str(r.get(key) or '') for r in recs]))
        elif typ == 'c':
            d = sorted({str(r.get(key) or '') for r in recs}); ix = {v: i for i, v in enumerate(d)}
            sec(f'{id}_f_{key}', 'B' if len(d) < 256 else 'H', [ix[str(r.get(key) or '')] for r in recs]); out.append(dict(k=key, l=label, t='c', d=d, s=f'{id}_f_{key}'))
        else:
            sec(f'{id}_f_{key}', 'f', [float(r.get(key) or 0) for r in recs]); out.append(dict(k=key, l=label, t='n', u=unit, s=f'{id}_f_{key}'))
    return out
def clip_ring(r):
    r = [clampp(p) for p in r]; o = [r[0]]
    for p in r[1:]:
        if p != o[-1]: o.append(p)
    if len(o) > 1 and o[0] == o[-1]: o.pop()
    return o
def poly_layer(id, title, group, items, src, asof, note, fields, style, tol=3.0):
    """items: list of (poly rings, attrs). Polygons wholly outside the map are dropped, the rest are clamped to it."""
    rc = []; rsz = []; xy = []; recs = []
    for poly, a in items:
        if not any(inside(p) for p in poly[0]): continue
        rr = []
        for k, r in enumerate(poly):
            r = clip_ring(simp_ring(r, tol))
            if len(r) >= 3 and abs(area(r)) > 30: rr.append(r)
            elif k == 0: rr = []; break
        if not rr: continue
        rc.append(min(255, len(rr)))
        for r in rr[:255]:
            rsz.append(min(65535, len(r)))
            for p in r[:65535]: xy += [qv(p[0]), qv(p[1])]
        recs.append(a)
    sec(id + '_r', 'B', rc); sec(id + '_n', 'H', rsz); sec(id + '_xy', 'h', xy)
    fl = pack_fields(id, recs, fields)
    layer(id, title, group, 'pg', len(recs), src, asof, note, fl, style); log(id, len(recs), 'polys', len(xy) // 2, 'verts'); return recs
def line_layer(id, title, group, items, src, asof, note, fields, style, tol=2.0):
    nn = []; xy = []; recs = []
    for ln, a in items:
        seg = []; cur = []
        for p in ln:
            if inside(p): cur.append(p)
            else:
                if len(cur) > 1: seg.append(cur)
                cur = []
        if len(cur) > 1: seg.append(cur)
        for s in seg:
            s = dp(s, tol)
            if len(s) < 2: continue
            nn.append(min(65535, len(s)))
            for p in s[:65535]: xy += [qv(p[0]), qv(p[1])]
            recs.append(a)
    sec(id + '_n', 'H', nn); sec(id + '_xy', 'h', xy)
    fl = pack_fields(id, recs, fields)
    layer(id, title, group, 'ln', len(recs), src, asof, note, fl, style); log(id, len(recs), 'lines', len(xy) // 2, 'verts'); return recs
CITYGIS = 'City of Lincoln and Lancaster County GIS'

# per-building arrays
sec('b_val', 'I', b_val); sec('b_cls', 'B', b_cls); sec('b_nb', 'H', b_nb); sec('b_fa', 'H', b_fa); sec('b_tx', 'B', b_tx); sec('b_sv', 'I', b_sv); sec('b_un', 'H', b_un)
HEAD['cls'] = CLS; HEAD['nb'] = NBL; HEAD['txd'] = TXL; HEAD['city'] = CITY; HEAD['tax'] = TAXS
for k, t in (('i', 'H'), ('vpa', 'H'), ('med', 'H'), ('tpa', 'H'), ('psf', 'H'), ('yr', 'H'), ('hpa', 'H'), ('pop', 'H'), ('cr', 'H'), ('n', 'H'), ('nh', 'H'), ('biz', 'H'), ('tot', 'H')): sec('hx_' + k, t, hx[k])
HEAD['pop'] = dict(onMap=int(POPMAP))

# businesses
HEAD['biz'] = dict(cats=CATS, cuis=CUIS, n=[b['n'] for b in BIZ], a=[b['a'] for b in BIZ], u=[b['u'] for b in BIZ], h=[b['h'] for b in BIZ], k=[b['k'] for b in BIZ], o=[b['o'] for b in BIZ], nb=[b['nb'] for b in BIZ])
bx = []
for b in BIZ: bx += [qv(b['x']), qv(b['y'])]
sec('bz_xy', 'h', bx); sec('bz_c', 'B', [b['c'] for b in BIZ]); sec('bz_g', 'B', [b['g'] & 255 for b in BIZ]); sec('bz_w', 'B', [b['w'] for b in BIZ]); sec('bz_f', 'B', [b['f'] for b in BIZ])

# ---------------------------------------------------------------- neighborhoods with totals
hood_items = []
for f in feats('hoods'):
    a = props(f)
    if (a.get('ACTIVE') or 'Y') != 'Y': continue
    for pl in rings_of(f.get('geometry')):
        x0, y0, x1, y1 = bbox(pl[0]); tv = 0.0; tac = 0.0; ttax = 0.0; hv = []; n = 0
        for p in PAR:
            c = p['c']
            if x0 <= c[0] <= x1 and y0 <= c[1] <= y1 and pin_poly(c, pl):
                n += 1; tv += p['v']; tac += p['ac']; ttax += p['tax']
                if p['cls'] == 'Residential Improved' and p['v'] > 0: hv.append(p['v'])
        if n < 5: continue
        hood_items.append((pl, dict(name=title(a.get('NAME')), total=tv, parcels=n, homes=len(hv), median=med(hv), vpa=(tv / tac if tac > 0 else 0), tax=ttax)))
poly_layer('hoods', 'Neighborhood totals', 'Property and taxes', hood_items, CITYGIS + ' (neighborhood association boundaries) and Lancaster County Assessor', TODAY,
           'Each neighborhood association area is raised by the total assessed value of the parcels inside it. Associations can overlap, and parts of the city have none.',
           [('name', 'Neighborhood', 's'), ('total', 'Total assessed value', 'n', '$'), ('parcels', 'Parcels', 'n'), ('homes', 'Homes', 'n'), ('median', 'Median home value', 'n', '$'), ('vpa', 'Value per acre', 'n', '$'), ('tax', 'Estimated property tax', 'n', '$')],
           dict(h='total', c='median', ramp='value', hmax=420, a=.5, label='name'), tol=6.0)

# every parcel as a round bar, as tall as its assessed value
pv_rows = [(p['c'], dict(v=p['v'], kind=p['cls'], tx=p['tx'])) for p in PAR if p['v'] > 0]
pts_layer('pv', 'Every property as a value bar', 'Property and taxes', pv_rows, 'Lancaster County Assessor through ' + CITYGIS, TODAY,
          'One round bar on every parcel, as tall as its current assessed value and colored by value band. Tap a bar for the property behind it. Owner names are not stored.',
          [('v', 'Assessed value', 'n', '$'), ('kind', 'Property class', 'c'), ('tx', 'Tax district', 'c')],
          dict(h='v', hcap=2000000, hmax=300, g=.6, hover=6, c='v', ramp='value', tiers=[100000, 200000, 300000, 400000, 500000, 1000000], bar=1, r=.5))

# recent sales (12 months), no names
sale_rows = []
for f in feats('sales'):
    a = props(f); pt = pt_of(f.get('geometry'))
    if not pt or not a.get('SalePrice'): continue
    sale_rows.append((pt, dict(price=a['SalePrice'], date=iso(a.get('SaleDate')), kind={'Res': 'Residential', 'Com': 'Commercial', 'Ag': 'Agricultural'}.get(a.get('PropType'), 'Other'),
                               style=a.get('ResStructureType') or '', built=a.get('ResYrBlt') or 0, sqft=a.get('ResFlrArea') or 0, ppsf=a.get('SalePriceSF') or 0, assd=a.get('AssdValue') or 0)))
pts_layer('sales', 'Recent sales', 'Property and taxes', sale_rows, 'Lancaster County Assessor, property sales in the last 12 months', TODAY,
          'Each pillar is one recorded sale, as tall as its price. Sale prices are public record. Buyer and seller names are not stored.',
          [('price', 'Sale price', 'n', '$'), ('date', 'Sale date', 's'), ('kind', 'Property type', 'c'), ('style', 'House style', 's'), ('built', 'Year built', 'n'), ('sqft', 'Living area', 'n', 'sq ft'), ('ppsf', 'Price per sq ft', 'n', '$'), ('assd', 'Assessed value', 'n', '$')],
          dict(h='price', hcap=900000, hmax=260, c='price', ramp='value', r=1))

# TIF districts
tif_items = []
for f in feats('tif'):
    a = props(f)
    for pl in rings_of(f.get('geometry')):
        tif_items.append((pl, dict(name=title(re.sub(r'^TIF\s+', '', re.sub(r'\s+\d{4}$', '', a.get('tifname') or ''))), started=a.get('year') or '', base=a.get('all_bv') or 0, added=a.get('all_ev') or 0, rate=rate_of(a.get('cvttxcd') or '') or (a.get('tax_rate') or 0), status=a.get('status') or '')))
poly_layer('tif', 'TIF districts', 'Property and taxes', tif_items, CITYGIS + ' (TIF dashboard)', TODAY,
           'Tax increment financing districts. Height shows the value added since each district began, which is the part whose property tax pays for the project.',
           [('name', 'District', 's'), ('started', 'Started', 's'), ('base', 'Base value', 'n', '$'), ('added', 'Value added since', 'n', '$'), ('rate', 'Levy per $100, 2025', 'n'), ('status', 'Status', 'c')],
           dict(h='added', hcap=60000000, hmax=220, c='added', ramp='value', a=.5), tol=2.0)

# zoning
ZN = {'R': 'Residential', 'B': 'Business', 'P': 'Public use', 'O': 'Office', 'C': 'Commercial', 'I': 'Industrial', 'AG': 'Agricultural', 'AGR': 'Agricultural residential', 'H': 'Highway commercial'}
zitems = []
for f in feats('zoning'):
    a = props(f)
    for pl in rings_of(f.get('geometry')):
        zitems.append((pl, dict(zone=a.get('ZONE') or '', cat=ZN.get(a.get('MAJCAT') or '', a.get('MAJCAT') or 'Other'), overlay='' if (a.get('OVERLAY') or 'N') in ('N', ' ') else a.get('OVERLAY'), by=a.get('JURISDICTION') or '')))
poly_layer('zoning', 'Zoning', 'Property and taxes', zitems, CITYGIS + ' (Planning Department zoning districts)', TODAY,
           'What each piece of land is zoned for. Colors are the broad category, the card gives the exact district code.',
           [('zone', 'District', 's'), ('cat', 'Category', 'c'), ('overlay', 'Overlay', 's'), ('by', 'Jurisdiction', 's')],
           dict(h=14, c='cat', pal={'Residential': 0xf2d16b, 'Business': 0xe4572e, 'Public use': 0x4aa3df, 'Office': 0xb07cc6, 'Commercial': 0xf28c28, 'Industrial': 0x8a8f98, 'Agricultural': 0x7fb069, 'Agricultural residential': 0xa7c957, 'Highway commercial': 0xd1495b}, a=.42), tol=3.5)

# 1930s HOLC map
ritems = []
for f in feats('redline'):
    a = props(f)
    for pl in rings_of(f.get('geometry')):
        g = a.get('holc_grade') or ''
        ritems.append((pl, dict(grade={'A': 'A, rated "best"', 'B': 'B, rated "still desirable"', 'C': 'C, rated "definitely declining"', 'D': 'D, rated "hazardous"'}.get(g, g), area=a.get('holc_id') or '')))
poly_layer('redline', '1930s redlining map', 'People', ritems, CITYGIS + ' (Planning Department copy of the Home Owners\' Loan Corporation map)', TODAY,
           'How the federal Home Owners\' Loan Corporation graded Lincoln neighborhoods for mortgage risk in the 1930s. Grade D areas were outlined in red and were often denied loans. Shown as history.',
           [('grade', 'HOLC grade', 'c'), ('area', 'Map area', 's')],
           dict(h=18, c='grade', pal={'A, rated "best"': 0x5aa469, 'B, rated "still desirable"': 0x4a90d9, 'C, rated "definitely declining"': 0xe8c547, 'D, rated "hazardous"': 0xd64545}, a=.45), tol=3.0)

# census tracts: income and poverty (American Community Survey)
titems = []
for f in feats('tracts'):
    a = props(f)
    inc = a.get('S1901_C01_012E'); pov = a.get('S1701_C03_001E'); pop = a.get('DP05_0001E')
    try: inc = float(inc)
    except Exception: inc = 0
    try: pov = float(pov)
    except Exception: pov = 0
    if inc < 0: inc = 0
    if pov < 0: pov = 0
    for pl in rings_of(f.get('geometry')):
        titems.append((pl, dict(name='Census tract ' + str(a.get('NAME') or ''), income=inc, poverty=pov, people=float(pop or 0))))
poly_layer('tracts', 'Household income', 'People', titems, 'U.S. Census Bureau American Community Survey, by tract, as published by ' + CITYGIS, TODAY,
           'Median household income by census tract. Survey estimates carry a margin of error, larger in small tracts.',
           [('name', 'Tract', 's'), ('income', 'Median household income', 'n', '$'), ('poverty', 'People below the poverty line', 'n', '%'), ('people', 'Residents', 'n')],
           dict(h='income', hcap=160000, hmax=300, c='income', ramp='value', a=.5), tol=8.0)

# ---------------------------------------------------------------- voting
reg = {}
for f in feats('voterreg_1', V):
    a = props(f); reg[(a.get('VOTEPRECINCT') or a.get('PoliticalSubdivision') or '').strip()] = a
# past results by precinct, from OpenElections (github.com/openelections/openelections-data-ne), matched to today's precincts by name
import csv
OE = os.environ.get('STARCITY_OE', '/home/claude/ext/oe-ne/')
def pnorm(s):
    s = (s or '').strip()
    m = re.match(r'^(\d{1,2}):00\s*([AP])M$', s)          # a spreadsheet turned "1 A" into a time of day
    if m: return '%02d%s00' % (int(m.group(1)), m.group(2))
    m = re.match(r'^0*(\d{1,2})\s*([A-Za-z])\s*(?:[-~]?\s*0*(\d{1,2}))?$', s)
    if m: return '%02d%s%02d' % (int(m.group(1)), m.group(2).upper(), int(m.group(3) or 0))
    return re.sub(r'[^a-z0-9]', '', s.lower())
ELEX = [('p12', 2012, 'President', '2012/20121106__ne__general__precinct.csv', 'President', 'obama', 'romney'),
        ('g14', 2014, 'Governor', '2014/20141104__ne__general__precinct.csv', 'Governor', 'hassebrook', 'ricketts'),
        ('p16', 2016, 'President', '2016/20161108__ne__general__precinct.csv', 'President', 'clinton', 'trump'),
        ('g18', 2018, 'Governor', '2018/20181106__ne__general__precinct.csv', 'Governor', 'krist', 'ricketts'),
        ('p20', 2020, 'President', '2020/20201103__ne__general__precinct.csv', 'President', 'biden', 'trump')]
def pcands(s):
    # one 2016 file was saved through a spreadsheet that read names like 01E02 and 10E01 as numbers (both became 1.00E+02)
    m = re.match(r'^(\d)\.(\d)0E\+(\d\d)$', (s or '').strip())
    if not m: return [pnorm(s)]
    d1, d2, k = int(m.group(1)), int(m.group(2)), int(m.group(3))
    if d2: return ['%02dE%02d' % (d1 * 10 + d2, k - 1)]
    return ['%02dE%02d' % (d1, k)] + (['10E%02d' % (k - 1)] if d1 == 1 and k >= 1 else [])
HIST = {}; HISTMETA = []; AMB = {}
for key, yr, race, fn, office, dname, rname in ELEX:
    by = collections.defaultdict(lambda: [0.0, 0.0, 0.0]); tot = [0.0, 0.0, 0.0]; early = 0.0; amb = collections.defaultdict(lambda: [0.0, 0.0, 0.0])
    try: rows = list(csv.DictReader(open(OE + fn, encoding='utf-8', errors='replace')))
    except Exception as e: log('no results file', fn, e); rows = []
    for r in rows:
        if (r.get('county') or '').strip().lower() != 'lancaster' or r.get('office') != office: continue
        pn = (r.get('precinct') or '').strip()
        if pn.lower() in ('total', 'countywide', 'absentee/early vote', 'provisional', ''): continue
        try: v = float(r.get('votes') or 0)
        except Exception: continue
        c = (r.get('candidate') or '').lower(); k = 0 if dname in c else (1 if rname in c else 2)
        tot[k] += v
        if re.match(r'^(ev|absentee|early)', pn, re.I): early += v; continue
        cs = pcands(pn)
        if len(cs) == 1: by[cs[0]][k] += v
        else: amb[tuple(cs)][k] += v
    HIST[key] = by; AMB[key] = amb; HISTMETA.append([key, yr, race, int(tot[0]), int(tot[1]), int(tot[2]), 0, 0, int(early), len(amb)])
    log('results', yr, race, 'precincts', len(by), 'D', int(tot[0]), 'R', int(tot[1]), 'other', int(tot[2]))
# names the spreadsheet merged are split between the two precincts in proportion to their 2020 vote
for key, amb in AMB.items():
    for cs, v in amb.items():
        w = [sum(HIST['p20'].get(c, (0, 0, 0))) for c in cs]; sw = sum(w)
        w = [x / sw for x in w] if sw > 0 else [1.0 / len(cs)] * len(cs)
        for c, x in zip(cs, w):
            for k in range(3): HIST[key][c][k] += v[k] * x
pitems = []; polls = {}
for f in feats('polls26'):
    a = props(f); polls[(a.get('precinct_name') or '').strip()] = a
for f in feats('elections_7', V):
    a = props(f); nm = (a.get('PRECINCT') or '').strip(); r = reg.get(nm) or {}
    tot = float(r.get('GrandTotal') or 0); pop = float(a.get('TOTPOP') or 0)
    np_ = float(r.get('Nonpartisan') or 0); rep = float(r.get('Republican') or 0); dem = float(r.get('Democratic') or 0)
    oth = max(0.0, tot - np_ - rep - dem)
    for pl in rings_of(f.get('geometry')):
        rec = dict(name=nm, voters=tot, people=pop, per100=(min(100.0, 100 * tot / pop) if pop > 0 and tot > 0 else 0), rep=rep, dem=dem, non=np_, other=oth,
                   leg=float(a.get('LEGIS') or 0), council=float(a.get('COUNCIL') or 0), coboard=float(a.get('COBOARD') or 0), poll=title(a.get('PollingPlace') or ''), polladdr=title(a.get('PollingAddress') or ''))
        for key in HIST:
            h = HIST[key].get(pnorm(nm))
            rec[key + 'd'], rec[key + 'r'], rec[key + 'o'] = h if h else (0.0, 0.0, 0.0)
        pitems.append((pl, rec))
log('precincts with registration', sum(1 for p in pitems if p[1]['voters'] > 0), 'of', len(pitems))
poly_layer('precincts', 'Voter registration by precinct', 'People', pitems, 'Lancaster County Election Commissioner, through ' + CITYGIS, TODAY,
           'Each voting precinct is raised by its registered voters per 100 residents. Residents are the 2020 Census count of all ages, so this is a rough guide to how registered a precinct is, not a turnout figure.',
           [('name', 'Precinct', 's'), ('voters', 'Registered voters', 'n'), ('people', 'Residents (2020 Census, all ages)', 'n'), ('per100', 'Registered per 100 residents', 'n'),
            ('rep', 'Registered Republican', 'n'), ('dem', 'Registered Democratic', 'n'), ('non', 'Registered nonpartisan', 'n'), ('other', 'Other parties', 'n'),
            ('leg', 'Legislative district', 'n'), ('council', 'City Council district', 'n'), ('coboard', 'County Board district', 'n'), ('poll', 'Polling place', 's'), ('polladdr', 'Polling place address', 's')]
           + [(k + x, k + x, 'n') for k in HIST for x in 'dro'],
           dict(h='per100', hcap=100, hmax=260, c='per100', ramp='civic', a=.5), tol=5.0)
_seen = set()
for pl, rec in pitems:
    if rec['name'] in _seen or not any(inside(p) for p in pl[0]): continue
    _seen.add(rec['name'])
    for m in HISTMETA:
        m[6] += int(rec[m[0] + 'd'] + rec[m[0] + 'r'] + rec[m[0] + 'o']); m[7] += 1 if rec[m[0] + 'd'] + rec[m[0] + 'r'] > 0 else 0
HEAD['elex'] = HISTMETA   # [key, year, race, D, R, other countywide, votes matched to precincts on the map, precincts matched, early votes counted countywide only, merged names split]
log('election history', json.dumps(HISTMETA))
prow = []
for f in feats('polls26'):
    a = props(f); prow.append((pt_of(f.get('geometry')), dict(name=title(a.get('polling_place_name')), precinct=a.get('precinct_name') or '', addr=title(a.get('polling_place_address')), where=a.get('location_specifics') or '')))
pts_layer('polls', 'Polling places, November 2026', 'People', prow, 'Lancaster County Election Commissioner, through ' + CITYGIS, TODAY,
          'Where each precinct voted in the November 3, 2026 general election.', [('name', 'Polling place', 's'), ('precinct', 'Precinct', 's'), ('addr', 'Address', 's'), ('where', 'Room', 's')],
          dict(h=70, col=0x8e7dff, r=1))
# who represents this spot: council and legislative districts
sen = {}
for f in feats('legis'):
    a = props(f)
    try: sen[int(a.get('District_N') or a.get('DISTRICT'))] = ' '.join(reversed([s.strip() for s in (a.get('Senator') or '').split(',')])).strip()
    except Exception: pass
citems = []
for f in feats('elections_0', V):
    a = props(f)
    for pl in rings_of(f.get('geometry')):
        citems.append((pl, dict(name='City Council District ' + str(a.get('CCDIST') or ''), member=a.get('Councilor') or '', atlarge=', '.join(x for x in [a.get('AtLarge1'), a.get('AtLarge2'), a.get('AtLarge3')] if x))))
poly_layer('council', 'City Council districts', 'People', citems, CITYGIS + ' (Planning Department election boundaries)', TODAY,
           'The four City Council districts. Three more members are elected at large by the whole city.', [('name', 'District', 's'), ('member', 'Council member', 's'), ('atlarge', 'At-large members', 's')],
           dict(h=10, c='name', pal='auto', a=.34, label='name'), tol=6.0)
litems = []
for f in feats('elections_6', V):
    a = props(f)
    try: dn = int(a.get('District_N'))
    except Exception: continue
    for pl in rings_of(f.get('geometry')):
        litems.append((pl, dict(name='Legislative District ' + str(dn), senator=sen.get(dn, ''), people=float(a.get('Population') or 0))))
poly_layer('legis', 'Legislative districts', 'People', litems, CITYGIS + ' and the Nebraska OCIO political boundaries layer (senator names)', TODAY,
           'Nebraska Legislature districts in the Lincoln area, with the senator named in the state\'s own boundary layer.', [('name', 'District', 's'), ('senator', 'State senator', 's'), ('people', 'Residents', 'n')],
           dict(h=10, c='name', pal='auto', a=.34, label='name'), tol=6.0)
# the other bodies on a Lincoln ballot: county board, school board, natural resources district, regents, community college
def _dist(id, ttl, src_layer, namef, note, fields, extra=None):
    items = []
    for f in feats(src_layer, V):
        a = props(f); rec = dict(name=namef(a))
        if extra: rec.update(extra(a))
        for pl in rings_of(f.get('geometry')): items.append((pl, rec))
    poly_layer(id, ttl, 'People', items, CITYGIS + ' (Planning Department election boundaries)', TODAY, note, fields, dict(h=10, c='name', pal='auto', a=.34, label='name'), tol=8.0)
_dist('coboard', 'County Board districts', 'elections_1', lambda a: 'County Board District ' + str(a.get('CBDIST10_I') or a.get('UNIT') or ''),
      'The five districts that each elect one Lancaster County commissioner.', [('name', 'District', 's')])
_dist('lpsboard', 'School board districts (LPS)', 'elections_5', lambda a: 'LPS Board District ' + str(a.get('DISTRICTID') or ''),
      'The seven Lincoln Public Schools Board of Education districts, with the member the city lists for each.', [('name', 'District', 's'), ('member', 'Board member', 's')],
      lambda a: dict(member=(a.get('REPNAME') or '').strip()))
_dist('nrd', 'Natural resources district subdistricts', 'elections_2', lambda a: 'Lower Platte South NRD Subdistrict ' + str(a.get('SUB_DIST') or ''),
      'Subdistricts of the Lower Platte South Natural Resources District, the elected board that looks after flood control, groundwater and trails funding.', [('name', 'Subdistrict', 's')])
_dist('regents', 'NU Regent districts', 'elections_3', lambda a: 'NU Board of Regents District ' + str(a.get('District_N') or ''),
      'Districts that elect the University of Nebraska Board of Regents.', [('name', 'District', 's'), ('people', 'Residents', 'n')], lambda a: dict(people=float(a.get('Population') or 0)))
_dist('secc', 'Community college districts', 'elections_4', lambda a: 'Southeast Community College District ' + str(a.get('DISTRICT') or ''),
      'Districts that elect the Southeast Community College Board of Governors.', [('name', 'District', 's')])
# value and estimated tax by the districts people vote in: which council, legislative and school board district each parcel sits in
def _region(items, label):
    polys = []
    for pl, rec in items:
        r = simp_ring(pl[0], 15.0); polys.append((bbox(r), r, rec['name']))
    agg = collections.OrderedDict()
    for p in PAR:
        if not inside(p['c']): continue
        x, y = p['c']
        for bb, r, nm in polys:
            if bb[0] <= x <= bb[2] and bb[1] <= y <= bb[3] and pin(p['c'], r):
                e = agg.setdefault(nm, [0, 0.0, 0.0, []]); e[0] += 1; e[1] += p['v']; e[2] += p['tax']
                if p['cls'] == 'Residential Improved' and p['v'] > 0: e[3].append(p['v'])
                break
    out = [[nm, e[0], int(e[1]), int(e[2]), len(e[3]), int(med(e[3])) if e[3] else 0] for nm, e in agg.items()]
    out.sort(key=lambda r: r[0]); log(label, json.dumps(out)[:400]); return out
TAXS['byCouncil'] = _region(citems, 'by council district')
TAXS['byLegis'] = _region(litems, 'by legislative district')

# ---------------------------------------------------------------- websites: a building's own site (OpenStreetMap) and UNL's page for campus buildings
def _el_center(e):
    g = e.get('geometry'); pts = []
    if g: pts = [P(p['lon'], p['lat']) for p in g]
    else:
        for m in e.get('members', []):
            if m.get('role') in ('outer', '') and m.get('geometry'): pts += [P(p['lon'], p['lat']) for p in m['geometry']]
    if not pts:
        b = e.get('bounds')
        return P((b['minlon'] + b['maxlon']) / 2, (b['minlat'] + b['maxlat']) / 2) if b else None
    if len(pts) >= 4 and g: return centroid(pts[:-1] if pts[0] == pts[-1] else pts)
    return (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))
def _clean_url(u):
    u = (u or '').strip().split(';')[0].strip()
    if not u or ' ' in u or len(u) > 180: return ''
    if not re.match(r'^https?://', u, re.I): u = 'https://' + u
    return u if re.match(r'^https?://[A-Za-z0-9.-]+\.[A-Za-z]{2,}([/?#]|$)', u) else ''
def _near_building(c, lim=35.0):
    b = building_at(c)
    if b >= 0: return b
    best = -1; bd = lim
    for q in bgrid.at(c[0], c[1]):
        d = math.hypot(b_cen[q][0] - c[0], b_cen[q][1] - c[1])
        if d < bd: bd = d; best = q
    return best
URLS = ['']; uix = {}; b_url = np.zeros(NB, np.uint16)
def _set_url(b, u):
    if b < 0 or b_url[b] or not u: return
    if u not in uix:
        if len(URLS) >= 65535: return
        uix[u] = len(URLS); URLS.append(u)
    b_url[b] = uix[u]
_seen = set(); nweb = 0
for fnm in sorted(glob.glob(D + 'buildings_*.json')):
    for e in json.load(open(fnm))['elements']:
        k = (e['type'], e['id'])
        if k in _seen: continue
        _seen.add(k); t = e.get('tags') or {}
        u = _clean_url(t.get('website') or t.get('contact:website') or t.get('url'))
        if not u: continue
        c = _el_center(e)
        if c is None or not inside(c): continue
        b = _near_building(c)
        if b >= 0 and not b_url[b]: _set_url(b, u); nweb += 1
infos = H['infos']; b_name = [infos[int(i)] if int(i) else '' for i in S['b_info']]
HAND = {'Nebraska State Capitol': 'https://capitol.nebraska.gov/', 'Memorial Stadium': 'https://huskers.com/', 'UNL Dairy Store': 'https://dairystore.unl.edu/'}
for b in range(NB):
    if b_name[b] in HAND and not b_url[b]: _set_url(b, HAND[b_name[b]])
# UNL: the university's own page for each campus building, https://maps.unl.edu/CODE
UNL = [ln.split('|') for ln in open('unl_buildings.txt', encoding='utf-8').read().strip().split('\n')]
DROP = {'the', 'residence'}
def _nrm(s):
    s = re.sub(r'[^a-z0-9 ]+', ' ', s.lower().replace('&', ' and ')); return ' '.join(w for w in s.split() if w not in DROP)
GEN = set('hall center centre building laboratory laboratories lab complex greenhouse house north south east west apartments apartment parking garage museum library of and for at memorial facility school college university nebraska unl campus'.split())
unl_exact = {}
for code, name, campus in UNL: unl_exact.setdefault(_nrm(name), []).append((code, campus))
ALIAS = {'don love memorial library': 'LLS', 'love library': 'LLS', 'selleck hall': 'SELD', 'selleck quadrangle': 'SELD', 'military and naval science building': 'M&N', 'jorgensen hall': 'JH',
         'knoll hall': 'KNOL', 'hardin hall school of natural resources': 'HARH', 'east union': 'NEU', 'university of nebraska state museum': 'MORR', 'sheldon memorial art gallery': 'SHEL',
         'bob devaney sports center': 'DEV', 'haymarket park': 'HAYB', 'hawks field': 'HAYB', 'bowlin stadium': 'HAYS', 'whittier research center': 'WHIT', 'nebraska coliseum': 'COL',
         'campus recreation center': 'CREC', 'mary riepma ross media arts center': 'RVB', 'van brunt visitors center': 'RVB', 'ross media arts center': 'RVB', 'c y thompson library': 'DINS',
         'cather dining complex': 'WCDC', 'university health center': 'HCCN', 'osborne athletic complex': 'OLC', 'scarlet hotel': 'SCAR', 'john breslow ice hockey center': 'BIC',
         'lester f larsen tractor test and power museum': 'LTM', 'unl dairy store': 'FOOD', 'international quilt study center and museum': 'IQM', 'lied center': 'LIED',
         'kauffman center': 'KAUF', 'howard hawks hall': 'HLH', 'college of business': 'HLH', 'love north': 'LLN', 'adele hall learning commons': 'LLN', 'abel sandoz dining center': 'ASFS',
         'canfield administration building': 'ADMS', 'carolyn pope edwards hall': 'CPEH', 'east campus recreation center': 'RWC', 'veterinary diagnostic center': 'NVDC', 'mccollum hall college of law': 'LAW',
         'college of law': 'LAW', 'ruth staples child development laboratory': 'CDL', 'utility plant': None}
def _campus(c):
    x, y = c
    if -6150 <= x <= -3650 and 4800 <= y <= 7500: return 'city'
    if -2750 <= x <= -950 and 5950 <= y <= 8150: return 'east'
    return ''
UNLC = ['']; cix = {}; b_unl = np.zeros(NB, np.uint16); unl_hits = []; unl_miss = []
for b in range(NB):
    nm = b_name[b]
    if not nm or re.match(r'^\d', nm): continue
    n = _nrm(nm); camp = _campus(b_cen[b]); code = None
    if n in ALIAS:
        code = ALIAS[n]
        if code is None and n == 'utility plant': code = 'CCUP' if camp == 'city' else ('ECUP' if camp == 'east' else None)
        if code in ('LLS', 'SELD', 'M&N', 'JH', 'KNOL', 'HARH', 'NEU', 'MORR', 'SHEL', 'WHIT', 'COL', 'CREC', 'RVB', 'DINS', 'WCDC', 'HCCN', 'OLC', 'LTM', 'FOOD', 'KAUF', 'HLH', 'LLN', 'ASFS', 'ADMS', 'CPEH', 'RWC', 'NVDC', 'LAW', 'CDL', 'LIED') and not camp: code = None
    elif n in unl_exact:
        for cd, cp in unl_exact[n]:
            if cp == 'Off Campus' or (camp == 'city' and cp in ('City Campus', 'Innovation Campus')) or (camp == 'east' and cp == 'East Campus'): code = cd; break
    elif camp:
        dn = set(n.split()) - GEN
        if dn:
            cands = []
            for code2, name2, campus2 in UNL:
                if (camp == 'city') != (campus2 in ('City Campus', 'Innovation Campus')): continue
                t2 = set(_nrm(name2).split()); d2 = t2 - GEN
                if d2 and (dn <= t2 or d2 <= set(n.split())): cands.append(code2)
            if len(cands) == 1: code = cands[0]
    if code:
        if code not in cix: cix[code] = len(UNLC); UNLC.append(code)
        b_unl[b] = cix[code]; unl_hits.append(nm + ' > ' + code)
    elif camp and S['b_tag'][b] is not None and b_tag[b] in ('university', 'college', 'dormitory'): unl_miss.append(nm)
HEAD['urls'] = URLS; HEAD['unl'] = UNLC
sec('b_url', 'H', b_url); sec('b_unl', 'H', b_unl)
log('websites: buildings linked', int((b_url > 0).sum()), 'distinct sites', len(URLS) - 1, '| UNL pages', int((b_unl > 0).sum()), 'codes', len(UNLC) - 1)
log('UNL matched:', '; '.join(sorted(set(unl_hits))))
log('UNL campus buildings without a page:', '; '.join(sorted(set(unl_miss))))

# ---------------------------------------------------------------- traffic counts, crashes, cameras, projects
RT = {'080': 'I-80', '180': 'I-180', '077': 'US 77', '006': 'US 6', '034': 'US 34', '002': 'Nebraska 2'}
aitems = []
for f in feats('adt'):
    a = props(f); adt = float(a.get('ADT') or 0)
    if adt <= 0: continue
    nm = title(' '.join(x for x in [(a.get('STPRE') or '').strip(), (a.get('STNAME') or '').strip(), (a.get('STTYPE') or '').strip(), (a.get('STSUF') or '').strip()] if x))
    for ln in lines_of(f.get('geometry')): aitems.append((ln, dict(name=nm, adt=adt, year=float(a.get('ADTCntYear') or 0), speed=float(a.get('SPEEDLIM') or 0), by='City of Lincoln')))
for f in feats('ndotaadt'):
    a = props(f); adt = float(a.get('FIRST_VEH_ADT_TOT_NUM') or 0)
    if adt <= 0: continue
    rid = (a.get('FIRST_RouteID') or '').strip()
    nm = RT.get(rid) or ('Highway ' + str(int(rid)) if rid.isdigit() else rid)
    for ln in lines_of(f.get('geometry')): aitems.append((ln, dict(name=nm, adt=adt, year=float(a.get('FIRST_COUNT_YEAR') or 0), speed=0, by='Nebraska DOT', trucks=float(a.get('FIRST_TRUK_ADT_TOT_NUM') or 0))))
line_layer('adt', 'Traffic counts', 'Getting around', aitems, 'City of Lincoln Transportation and Utilities (crash app street data) and Nebraska Department of Transportation', TODAY,
           'Average daily traffic on each street segment: how many vehicles pass in a day. City figures are counts or estimates of different years. A year is shown where the city recorded one.',
           [('name', 'Street', 's'), ('adt', 'Vehicles per day', 'n'), ('year', 'Count year', 'n'), ('speed', 'Speed limit', 'n', 'mph'), ('trucks', 'Trucks per day', 'n'), ('by', 'Counted by', 'c')],
           dict(h='adt', hcap=45000, hmax=300, c='adt', ramp='heat', a=.55), tol=1.5)
crow = [(c[0], dict(month=['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][c[1]],
                    who=('Pedestrian involved' if c[2] else 'Bicyclist involved' if c[3] else 'Motorcycle involved' if c[5] else 'Vehicles only'), alcohol=('Yes' if c[4] else ''))) for c in CR]
pts_layer('crashes', 'Crash reports, 2019', 'Getting around', crow, 'City of Lincoln Transportation and Utilities crash app, which publishes calendar year 2019', TODAY,
          'Every crash report the city\'s public crash layer holds, which is the year 2019. Pedestrian and bicycle crashes are picked out in color. It is a record of one past year, not a live feed.',
          [('who', 'Involved', 'c'), ('month', 'Month', 's'), ('alcohol', 'Alcohol related', 's')],
          dict(h=38, c='who', pal={'Pedestrian involved': 0xff3b6b, 'Bicyclist involved': 0x00c2a8, 'Motorcycle involved': 0xffa62b, 'Vehicles only': 0x9aa5b1}, r=.55))
cam = []
for f in feats('citycams'):
    a = props(f); pt = pt_of(f.get('geometry'))
    u = a.get('LiveHDURL') or a.get('LiveSDURL') or ''
    if pt and u: cam.append((pt, dict(name=title(a.get('Camera_Location')), by='City of Lincoln', url=u, img=a.get('PhotoURL') or '')))
try:
    for f in json.load(open(D + 'live2/cams_ndot.json'))['features']:
        a = f['attributes']; g = f.get('geometry') or {}
        if a.get('Status') != 'In Service' or not a.get('PhotoURL') or 'x' not in g: continue
        cam.append((P(g['x'], g['y']), dict(name=(a.get('location') or a.get('name') or '').replace('Lincoln - ', ''), by='Nebraska DOT', url='', img=a['PhotoURL'])))
except Exception as e: log('ndot cams', e)
pts_layer('cams', 'Traffic cameras', 'Getting around', cam, 'City of Lincoln traffic camera layer and Nebraska DOT highway cameras', TODAY,
          'Public traffic cameras. Tap one to open its picture or live view beside the map. The pictures come straight from the city and the state, the map stores none.',
          [('name', 'Camera', 's'), ('by', 'Run by', 'c'), ('url', 'Live view', 's'), ('img', 'Picture', 's')], dict(h=60, c='by', pal={'City of Lincoln': 0x35c3ff, 'Nebraska DOT': 0xffc233}, r=1))
prj = []
for i in (0, 1, 2):
    for f in feats(f'projects{i}'):
        a = props(f)
        try: yr = int(str(a.get('Year') or '0')[:4])
        except Exception: yr = 0
        if not a.get('Publish') or yr < 2026: continue
        g = f.get('geometry'); pt = pt_of(g)
        if pt is None and g:
            if g['type'] in ('LineString', 'MultiLineString'):
                ls = lines_of(g); l = max(ls, key=len) if ls else None; pt = l[len(l) // 2] if l else None
            else:
                rr = rings_of(g); pt = centroid(rr[0][0]) if rr else None
        if not pt: continue
        prj.append((pt, dict(name=(a.get('ProjectNam') or a.get('Name') or '').strip(), kind=a.get('Utility') or 'Project', year=float(yr), note=(a.get('ConstructionNote') or a.get('ScheduleDescription') or a.get('ProjectSumm') or '')[:400].strip(), url=a.get('URL') or '')))
seenp = set(); prj2 = []
for pt, a in prj:
    k = (a['name'], round(pt[0] / 60), round(pt[1] / 60))
    if k in seenp: continue
    seenp.add(k); prj2.append((pt, a))
pts_layer('projects', 'City projects ahead', 'Getting around', prj2, 'City of Lincoln Transportation and Utilities construction projects layer', TODAY,
          'Street, water and other public works the city has scheduled for 2026 and later. Dates are the city\'s plans and can move.',
          [('name', 'Project', 's'), ('kind', 'Type', 'c'), ('year', 'Planned year', 'n'), ('note', 'Schedule', 's'), ('url', 'More', 's')], dict(h=80, c='kind', pal='auto', r=1))

# ---------------------------------------------------------------- bikes
FAC = {'Shared Lane': 0x56c271, 'Bike Lane': 0x00b3a4, 'Buffered Bike Lane': 0x0091d5, 'Bicycle Boulevard': 0xb86bff, 'Separated Bike Lane': 0xff5fa2}
bitems = []
for f in feats('bikenet'):
    a = props(f)
    for ln in lines_of(f.get('geometry')):
        bitems.append((ln, dict(name=title(a.get('Street_Nam')), frm=title(a.get('From_Str')), to=title(a.get('To_Str')), kind=a.get('Fac_Type') or 'Bike route')))
line_layer('bikenet', 'City on-street bike network', 'Getting around', bitems, CITYGIS + ' (Planning Department bike layers)', TODAY,
           'The streets the city itself counts as its on-street bike network, by type. This is the official list behind the green lines on other maps.',
           [('name', 'Street', 's'), ('frm', 'From', 's'), ('to', 'To', 's'), ('kind', 'Type', 'c')], dict(h=26, c='kind', pal=FAC, a=.75), tol=1.5)
rk = [(pt_of(f.get('geometry')), dict(name=title(props(f).get('GeneralLoc')) or 'Bike rack')) for f in feats('bikeracks')]
pts_layer('racks', 'Bike racks', 'Getting around', rk, CITYGIS + ' (Planning Department bike rack survey)', TODAY, 'Public bike racks the city has surveyed.', [('name', 'Where', 's')], dict(h=24, col=0x2bd4c4, r=.5))
tc = collections.defaultdict(list)
for f in feats('trailcnt'):
    a = props(f)
    if a.get('DailyAve') and a.get('SiteName'): tc[a['SiteName'].strip()].append((a.get('endDate') or 0, float(a['DailyAve']), float(a.get('BikeTot') or 0), float(a.get('PedTot') or 0)))
cn = []
for f in feats('counters'):
    a = props(f); nm = (a.get('SiteName') or '').strip(); rec = sorted(tc.get(nm, []))[-12:]
    if not rec: continue
    bt = sum(r[2] for r in rec); pd = sum(r[3] for r in rec)
    cn.append((pt_of(f.get('geometry')), dict(name=nm, daily=sum(r[1] for r in rec) / len(rec), bikes=(100 * bt / (bt + pd) if bt + pd else 0), upto=iso(rec[-1][0]), n=float(len(rec)))))
pts_layer('counters', 'Trail counters', 'Getting around', cn, 'Lincoln Parks and Recreation trail counters', TODAY,
          'How many people pass each trail counter on an average day, over its most recent counting periods.',
          [('name', 'Counter', 's'), ('daily', 'People per day', 'n'), ('bikes', 'Share on bikes', 'n', '%'), ('upto', 'Latest count ends', 's'), ('n', 'Counting periods used', 'n')],
          dict(h='daily', hcap=1500, hmax=300, c='daily', ramp='heat', r=1.2))

# ---------------------------------------------------------------- civic places
def simple(id, ttl, grp, name, src, note, fields, mk, style):
    rows = []
    for f in feats(name):
        a = mk(props(f))
        if a: rows.append((pt_of(f.get('geometry')), a))
    return pts_layer(id, ttl, grp, rows, src, TODAY, note, fields, style)
simple('schools', 'Schools', 'Places', 'schools', CITYGIS, 'Public and private schools, with mascots.',
       [('name', 'School', 's'), ('level', 'Level', 'c'), ('type', 'Type', 'c'), ('mascot', 'Mascot', 's'), ('colors', 'Colors', 's')],
       lambda a: dict(name=(a.get('SCHOOL') or '').strip(), level=a.get('Ed_Level') or '', type=a.get('Type') or '', mascot=(a.get('NICKNAME') or a.get('MASCOT') or '').strip(), colors=(a.get('COLORS') or '').strip()) if (a.get('Status') or 'Existing') == 'Existing' else None,
       dict(h=70, c='level', pal='auto', r=1))
simple('fire', 'Fire stations', 'Places', 'fire', CITYGIS, 'Fire stations in and around Lincoln.', [('name', 'Department', 's'), ('no', 'Station', 's')],
       lambda a: dict(name=title(a.get('NAME')) + ' Fire', no=(a.get('STATION_NO') or '').strip()), dict(h=70, col=0xff5a36, r=1))
simple('police', 'Police stations', 'Places', 'police', CITYGIS, 'Police stations and substations.', [('name', 'Station', 's'), ('team', 'Team area', 's')],
       lambda a: dict(name=title(a.get('Substation') or a.get('Community') or 'Police station'), team=title(a.get('Region'))), dict(h=70, col=0x3d7bff, r=1))
simple('libraries', 'Libraries', 'Places', 'libraries', CITYGIS, 'Lincoln City Libraries branches.', [('name', 'Library', 's')], lambda a: dict(name=title(a.get('NAME'))), dict(h=70, col=0xb980ff, r=1))
simple('medical', 'Hospitals and medical centers', 'Places', 'medical', CITYGIS, 'Hospitals and major medical facilities.', [('name', 'Facility', 's'), ('kind', 'Type', 's')],
       lambda a: dict(name=title(a.get('NAME')), kind=title(a.get('TYPE'))), dict(h=90, col=0xff4d6d, r=1.2))
simple('art', 'Public art', 'Places', 'art', 'Lincoln Parks and Recreation public art inventory', 'Sculptures, murals, fountains and memorials in the city\'s public art collection.',
       [('name', 'Title', 's'), ('artist', 'Artist', 's'), ('where', 'Where', 's'), ('kind', 'Type', 'c'), ('made', 'Material', 's')],
       lambda a: dict(name=(a.get('Title') or '').strip(), artist=(a.get('Artist') or '').strip(), where=(a.get('Location') or '').strip(), kind=a.get('Type') or '', made=(a.get('PrimaryMaterial') or '').strip()) if (a.get('LifeCycle') or 'Active') == 'Active' and (a.get('Title') or '').strip() else None,
       dict(h=60, c='kind', pal='auto', r=.9))
simple('playgrounds', 'Playgrounds', 'Places', 'playgrounds', 'Lincoln Parks and Recreation', 'City playgrounds, with which ones are built to be inclusive.',
       [('name', 'Playground', 's'), ('park', 'Park', 's'), ('inclusive', 'Inclusive design', 'c'), ('access', 'Accessible', 's'), ('year', 'Installed', 'n')],
       lambda a: dict(name=(a.get('Name') or '').strip(), park=(a.get('ParkUnit') or '').strip(), inclusive=('Inclusive' if a.get('Inclusive') == 'Yes' else 'Standard'), access=a.get('Accessible') or '', year=float(a.get('YearInstalled') or 0)) if (a.get('LifeCycle') or 'Active') == 'Active' else None,
       dict(h=50, c='inclusive', pal={'Inclusive': 0xff9f1c, 'Standard': 0x7bd389}, r=.8))
simple('restrooms', 'Park restrooms', 'Places', 'restrooms', 'Lincoln Parks and Recreation', 'Public restrooms in city parks. Many close for winter.', [('name', 'Restroom', 's'), ('park', 'Park', 's')],
       lambda a: dict(name=(a.get('Name') or 'Restroom').strip(), park=(a.get('ParkUnit') or '').strip()) if (a.get('LifeCycle') or 'Active') == 'Active' else None, dict(h=40, col=0x6ec6ff, r=.6))
simple('fountains', 'Drinking fountains', 'Places', 'fountains', 'Lincoln Parks and Recreation', 'Drinking fountains in parks and along trails. Most are off in winter.', [('park', 'Park', 's'), ('kind', 'Type', 's')],
       lambda a: dict(park=(a.get('ParkUnit') or '').strip(), kind=(a.get('Type') or '').strip()) if (a.get('LifeCycle') or 'Active') == 'Active' else None, dict(h=30, col=0x48cae4, r=.5))

# ---------------------------------------------------------------- the night sky: bright stars, their names and the constellation lines
# Star positions and names from the d3-celestial data files (github.com/ofrohn/d3-celestial), which come from the Hipparcos/HYG catalogs.
SKY = os.environ.get('STARCITY_SKY', '/home/claude/ext/sky/')
try:
    st = json.load(open(SKY + 'stars.6.json'))['features']; nm = json.load(open(SKY + 'starnames.json'))
    ln = json.load(open(SKY + 'constellations.lines.json'))['features']; cn = json.load(open(SKY + 'constellations.json'))['features']
    stars = sorted(((f['properties']['mag'], (f['geometry']['coordinates'][0] + 360) % 360, f['geometry']['coordinates'][1], str(f['id'])) for f in st if f['properties']['mag'] <= 5.0), key=lambda r: r[0])
    sra = [int(round(r[1] * 100)) % 36000 for r in stars]; sde = [int(round((r[2] + 90) * 100)) for r in stars]; smg = [int(round((r[0] + 2) * 10)) for r in stars]
    names = [[i, nm[r[3]]['name']] for i, r in enumerate(stars) if r[0] <= 3.6 and nm.get(r[3], {}).get('name')]
    lines = []
    for f in ln:
        for l in f['geometry']['coordinates']:
            lines.append([v for p in l for v in (round((p[0] + 360) % 360, 2), round(p[1], 2))])
    cons = [[f['properties']['name'], round((f['geometry']['coordinates'][0] + 360) % 360, 1), round(f['geometry']['coordinates'][1], 1)] for f in cn if f.get('geometry') and f['geometry'].get('type') == 'Point']
    sec('sky_ra', 'H', sra); sec('sky_de', 'H', sde); sec('sky_mg', 'B', smg)
    HEAD['sky'] = dict(n=names, l=lines, c=cons)
    log('sky: stars', len(stars), 'named', len(names), 'lines', len(lines), 'constellations', len(cons), 'brightest', [n[1] for n in names[:8]])
except Exception as e:
    log('sky data missing', e)

# ---------------------------------------------------------------- city trees: one record for every tree the city manages
# The Parks and Recreation (Community Forestry) inventory. Kept: kind, species, trunk diameter, where it stands, the park,
# the forestry district and the city's own tree ID. Never requested: staff names, notes, addresses, edit history.
TREEZ = os.environ.get('STARCITY_TREES', '/mnt/user-data/uploads/STARCITY/trees.zip')
try:
    import zipfile
    from collections import Counter
    zf = zipfile.ZipFile(TREEZ); life = {}; seen = set(); TR = []; listed = 0
    for nm in sorted(zf.namelist()):
        for f in json.loads(zf.read(nm)).get('features', []):
            a = f.get('attributes') or {}; g = f.get('geometry') or {}; listed += 1
            lc = (a.get('LifeCycle') or '').strip() or 'Not listed'; life[lc] = life.get(lc, 0) + 1
            if lc != 'Active' or g.get('x') is None or a.get('OBJECTID') in seen: continue
            seen.add(a.get('OBJECTID')); TR.append((P(g['x'], g['y']), a))
    active = len(TR); TR = [t for t in TR if inside(t[0])]
    def nz(v, d=''):
        v = v.strip() if isinstance(v, str) else v
        return v if v else d
    def kind_of(a):
        k = nz(a.get('TreeType'), 'Not identified')
        return 'Not identified' if k.lower() == 'not identified' else k
    kinds = sorted({kind_of(a) for p, a in TR}); kix = {k: i for i, k in enumerate(kinds)}
    name_of = lambda a: (nz(a.get('CommonName')), nz(a.get('ScientificName')), kix[kind_of(a)])
    names = [list(k) for k, _ in Counter(name_of(a) for p, a in TR).most_common()]; nix = {tuple(k): i for i, k in enumerate(names)}
    SITES = ['Not listed', 'Street', 'Park', 'Private', 'Golf Course', 'Boundary', 'Median', 'Other - Public', 'Trail']; six = {v: i for i, v in enumerate(SITES)}
    DIST = ['', 'NE', 'NW', 'SE', 'SW']
    parks = [''] + sorted({nz(a.get('ParkUnit')) for p, a in TR} - {''}); pix = {k: i for i, k in enumerate(parks)}
    # Packed small: the map is cut into 128 m cells, each tree is stored as its place inside its cell to the nearest half meter,
    # and trees are listed cell by cell. The page rebuilds every position from the count of trees in each cell.
    CELL = 128.0; TH = 16384.0; NG = int(2 * TH // CELL)
    def cell_of(p):
        x = p[0] + TH; z = -p[1] + TH
        c = int(max(0, min(NG - 1, x // CELL))); r = int(max(0, min(NG - 1, z // CELL)))
        return r * NG + c, int(max(0, min(255, round((x - c * CELL) / 0.5)))), int(max(0, min(255, round((z - r * CELL) / 0.5))))
    TR = [(cell_of(p), a) for p, a in TR]; TR.sort(key=lambda t: t[0])
    cnt = [0] * (NG * NG); lx = []; lz = []; tn = []; td = []; ts = []; tp = []; i0 = []; i1 = []; i2 = []
    for (ck, ax, az), a in TR:
        cnt[ck] += 1; lx.append(ax); lz.append(az); tn.append(nix[name_of(a)])
        d = a.get('DBH'); td.append(int(max(1, min(100, round(d)))) if isinstance(d, (int, float)) and 0 < d <= 100 else 0)
        ts.append(six.get(nz(a.get('SiteLocation'), 'Not listed'), 0) | ((DIST.index(a.get('ForestryDistrict')) if a.get('ForestryDistrict') in DIST else 0) << 4) | (128 if a.get('MultiTrunk') == 1 else 0))
        tp.append(pix[nz(a.get('ParkUnit'))])
        m = re.match(r'^T(\d+)$', str(a.get('TreeID') or '')); v = int(m.group(1)) if m and int(m.group(1)) < (1 << 24) else 0
        i0.append(v & 255); i1.append((v >> 8) & 255); i2.append(v >> 16)
    assert max(cnt) < 65536
    sec('tr_c', 'H', cnt); sec('tr_x', 'B', lx); sec('tr_z', 'B', lz); sec('tr_n', 'H', tn); sec('tr_d', 'B', td); sec('tr_s', 'B', ts); sec('tr_p', 'B' if len(parks) < 256 else 'H', tp)
    sec('tr_i0', 'B', i0); sec('tr_i1', 'B', i1); sec('tr_i2', 'B', i2)
    HEAD['trees'] = dict(n=len(TR), cell=CELL, ng=NG, half=TH, kinds=kinds, names=names, sites=SITES, dist=DIST, parks=parks, listed=listed, active=active, life=life, asof=TODAY)
    log('trees: listed', listed, 'active', active, 'on the map', len(TR), 'kinds', len(kinds), 'names', len(names), 'parks', len(parks), 'with a trunk size', sum(1 for v in td if v), 'with an id', sum(1 for a, b, c in zip(i0, i1, i2) if a or b or c), 'most in one cell', max(cnt))
    log('trees: top kinds', Counter(kind_of(a) for c, a in TR).most_common(8), 'biggest trunks', sorted(td)[-5:])
except Exception as e:
    log('tree inventory missing', repr(e))

# ---------------------------------------------------------------- bus stops for nearest-stop and next-bus answers; birds by month
try:
    bx = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bus_stops.json')))
    HEAD['busx'] = dict(stops=[[n, x, z, i] for n, x, z, i in bx['stops']], ps=bx['ps'], hd=bx['hd'], heads=bx['heads'], ver=bx['ver'])
    log('bus stops', len(bx['stops']), 'patterns', len(bx['ps']), 'feed', bx['ver'])
except Exception as e:
    log('bus stops missing', e)
try:
    rows = [l.rstrip('\n').split('|') for l in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'birds_inat.txt'), encoding='utf-8') if l.strip() and not l.startswith('#')]
    sp = [[r[0], r[1], [int(v) for v in r[2].split(',')]] for r in rows]
    tot = [sum(q[2][m] for q in sp) for m in range(12)]
    HEAD['birdyear'] = dict(asof='2026-11-14', tot=tot, sp=sp)
    log('birds by month', len(sp), 'species', tot)
except Exception as e:
    log('birds by month missing', e)
# ---------------------------------------------------------------- manifest and write
HEAD['man'] = [
    ['Buildings, streets, trails, land', 'OpenStreetMap and City of Lincoln footprints', 'get_data.ps1, get_more.ps1, get_city2.ps1', TODAY, 'when streets or buildings change'],
    ['Assessed values, taxes, sales', 'Lancaster County Assessor through city GIS', 'get_gis.ps1', TODAY, 'yearly after values are set in spring, sales monthly'],
    ['Traffic counts, crashes, cameras, projects', 'Lincoln Transportation and Utilities, Nebraska DOT', 'get_gis.ps1, get_live2.ps1', TODAY, 'twice a year, cameras read live'],
    ['Property tax levies for every tax district', 'Nebraska Department of Revenue, Taxing Unit Group Summary for Lancaster County, tax year 2025', 'typed into process2.py from the published list', '2025-11-17', 'each November, when the new levies are published'],
    ['Local businesses', 'OpenStreetMap', 'get_places.ps1', TODAY, 'monthly'],
    ['City trees: kind, species, trunk size and tree ID', 'City of Lincoln Parks and Recreation, Community Forestry tree inventory, through city GIS', 'get_trees.ps1', TODAY, 'twice a year'],
    ['Stars, star names and constellation lines', 'Hipparcos and HYG star catalogs as packaged by the d3-celestial project', 'copied from github.com/ofrohn/d3-celestial', '2000-01-01', 'never: the stars are drawn from their catalog positions and the sky is turned to the present by arithmetic'],
    ['Building websites', 'OpenStreetMap website tags and the University of Nebraska-Lincoln building list at maps.unl.edu', 'get_data.ps1 and unl_buildings.txt', TODAY, 'twice a year'],
    ['Past election results by precinct, 2012 to 2020', 'OpenElections (certified county results gathered by volunteers), matched to today\'s precincts by name', 'git clone of openelections-data-ne', '2020-11-03', 'when newer precinct results are published in an open format'],
    ['Precincts, registration, polling places', 'Lancaster County Election Commissioner through city GIS', 'get_votes.ps1, get_gis.ps1', TODAY, 'before and after each election'],
    ['Population and income', 'U.S. Census Bureau through city GIS', 'get_gis.ps1', TODAY, 'when new Census or survey figures come out'],
    ['Zoning, neighborhoods, civic places, bike network', 'City of Lincoln and Lancaster County GIS', 'get_gis.ps1', TODAY, 'twice a year'],
    ['Bus routes, stops and timetable', 'StarTran, published schedule feed (GTFS)', 'get_data.ps1', TODAY, 'whenever StarTran publishes a new schedule'],
    ['Birds near Lincoln by month of the year', 'iNaturalist, counts of public reports within 25 km of Lincoln, all years', 'read from the iNaturalist API and saved as birds_inat.txt', '2026-11-14', 'twice a year; this month\'s shares also refresh live on the website'],
    ['Weather, radar, rivers, closures, bike share, air quality, birds', 'National Weather Service, Iowa Mesonet, USGS, city GIS, BikeLNK, Open-Meteo, iNaturalist', 'read live by the page', 'live', 'every visit'],
]
parts = []; off = 0; secs = {}
for k, (t, arr) in SECS.items():
    b = arr.tobytes(); pad = (-len(b)) % 4
    secs[k] = [off, int(arr.size), t]; parts.append(b + b'\0' * pad); off += len(b) + pad
HEAD['secs'] = secs
hj = json.dumps(HEAD, separators=(',', ':'), ensure_ascii=False).encode('utf-8'); hj += b' ' * ((-len(hj)) % 4)
raw = struct.pack('<I', len(hj)) + hj + b''.join(parts)
z = zlib.compress(raw, 9); open('data2.z', 'wb').write(z); open('data2.b64', 'w').write(base64.b64encode(z).decode())
log('pack raw', len(raw), 'header', len(hj), 'zlib', len(z), 'b64', len(z) * 4 // 3, 'layers', len(HEAD['layers']))
