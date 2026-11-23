# STARCITY: place Lincoln Police crash records (2024 to 2026) on the street network.
# The city publishes each crash with a line of street text and no coordinates. This script reads that text,
# finds the named streets in OpenStreetMap, and puts the crash at the crossing or along the block.
# Output: one row per crash with coordinates where it could be placed, and a count of what could not.
import json, glob, re, sys, os, math, collections
SRC = os.environ.get('STARCITY_CRASH', '/mnt/user-data/uploads/STARCITY/wide/safety/'); RD = os.environ.get('STARCITY_ROADS', '/home/claude/wd/')
SUF = {'STREET','ST','AVENUE','AVE','ROAD','RD','DRIVE','DR','BOULEVARD','BLVD','LANE','LN','COURT','CT','CIRCLE','CIR','PLACE','PL','PARKWAY','PKWY','HIGHWAY','HWY','WAY','TERRACE','TER','TRAIL','TRL','BAY','ROADWAY','RDWY','EXP','EXPY','EXPRESSWAY','PKY'}
DIR = {'NORTH':'N','SOUTH':'S','EAST':'E','WEST':'W','NORTHWEST':'NW','SOUTHWEST':'SW','NORTHEAST':'NE','SOUTHEAST':'SE'}
def key(s):
    t = re.sub(r'[^A-Z0-9 ]', ' ', (s or '').upper()).split()
    t = [DIR.get(x, x) for x in t]
    t = [re.sub(r'^(\d+)(ST|ND|RD|TH)$', r'\1', x) for x in t]
    while len(t) > 1 and t[-1] in SUF: t = t[:-1]
    if t[:2] == ['US', 'HIGHWAY']: t = ['HWY'] + t[2:]
    if len(t) == 2 and t[0] in ('US', 'NE', 'N', 'HIGHWAY') and t[1].isdigit() and t[0] != 'N': t = ['HWY', t[1]]
    if t and t[0] == 'INTERSTATE': t[0] = 'I'
    if len(t) > 1 and t[0] == 'ST': t[0] = 'SAINT'   # ST PAUL is Saint Paul; a trailing ST was already dropped as a suffix
    return ' '.join(t)
ways = collections.defaultdict(list); node_xy = {}
for f in sorted(glob.glob(RD + 'roads*.json')):
    for e in json.load(open(f))['elements']:
        if e.get('type') != 'way' or 'geometry' not in e: continue
        tg = e.get('tags') or {}
        if tg.get('highway') in ('footway','path','cycleway','steps','service','pedestrian','track','bridleway'): continue
        nm = [tg.get(k) for k in ('name','alt_name','old_name','ref') if tg.get(k)]
        if not nm: continue
        pts = [(g['lon'], g['lat']) for g in e['geometry']]; ids = e.get('nodes') or []
        for a, b in zip(ids, pts): node_xy[a] = b
        for n in nm:
            for part in re.split(r';', n):
                k = key(part)
                if k: ways[k].append((ids, pts))
# street addresses from OpenStreetMap buildings, for records written as a house number and a street
ADDR = collections.defaultdict(list)
for f in sorted(glob.glob(RD + 'buildings_*.json')) + sorted(glob.glob(RD + 'places.json')):
    try: els = json.load(open(f))['elements']
    except Exception: continue
    for e in els:
        tg = e.get('tags') or {}; hn = tg.get('addr:housenumber'); st = tg.get('addr:street')
        if not hn or not st or not re.match(r'^\d+', hn): continue
        if 'center' in e: p = (e['center']['lon'], e['center']['lat'])
        elif 'geometry' in e: g = e['geometry']; p = (sum(q['lon'] for q in g)/len(g), sum(q['lat'] for q in g)/len(g))
        elif 'lon' in e: p = (e['lon'], e['lat'])
        else: continue
        ADDR[key(st)].append((int(re.match(r'^\d+', hn).group(0)), p))
def addr(num, st):
    k = key(st); L = ADDR.get(k)
    if not L:
        c = [w for w in ADDR if w.split(' ', 1)[-1] == k]
        L = ADDR[c[0]] if len(c) == 1 else None
    if not L: return None
    n, p = min(L, key=lambda q: abs(q[0] - num))
    return p if abs(n - num) <= 99 and n // 100 == num // 100 else None
KX = 111320 * math.cos(math.radians(40.81)); KY = 110950
def dist(a, b): return math.hypot((a[0]-b[0])*KX, (a[1]-b[1])*KY)
def cands(k):
    if k in ways: return [k]
    out = [w for w in ways if w.split(' ', 1)[-1] == k and w.split(' ')[0] in ('N','S','E','W','NW','SW','NE','SE')] if k else []
    if not out and re.match(r'^\d+$', k or ''): out = [w for w in ways if re.match(r'^(N|S|NW|SW) ' + k + '$', w)]
    if not out and k and len(k) >= 6: out = [w for w in ways if w.startswith(k)][:6]
    if not out and k and len(k) >= 6: out = [w for w in ways if len(w.split(' ', 1)) == 2 and w.split(' ', 1)[1].startswith(k.split(' ', 1)[-1]) and w.split(' ')[0] == k.split(' ')[0]][:6]
    return out
XC = {}
def cross(a, b):
    """every point where street a meets street b"""
    if (a, b) in XC: return XC[(a, b)]
    res = []
    for ka in cands(a):
        na = {}; pa = []
        for ids, pts in ways[ka]:
            for i, p in zip(ids, pts): na[i] = p
            pa += pts
        for kb in cands(b):
            if kb == ka: continue
            hit = False
            for ids, pts in ways[kb]:
                for i, p in zip(ids, pts):
                    if i in na: res.append(p); hit = True
            if not hit:
                best = None
                for ids, pts in ways[kb]:
                    for p in pts[::max(1, len(pts)//40)] + [pts[0], pts[-1]]:
                        for q in pa[::max(1, len(pa)//400)]:
                            d = dist(p, q)
                            if d < 45 and (best is None or d < best[0]): best = (d, ((p[0]+q[0])/2, (p[1]+q[1])/2))
                if not best and (ka.startswith('I ') or kb.startswith('I ')):
                    pb = [p for ids, pts in ways[kb] for p in pts]
                    for p in pb:
                        for q in pa:
                            if abs(p[0]-q[0]) > .002 or abs(p[1]-q[1]) > .002: continue
                            d = dist(p, q)
                            if d < 120 and (best is None or d < best[0]): best = (d, ((p[0]+q[0])/2, (p[1]+q[1])/2))
                if best: res.append(best[1])
    XC[(a, b)] = res; return res
def mean(ps): return (sum(p[0] for p in ps)/len(ps), sum(p[1] for p in ps)/len(ps))
def nearest_pair(A, B):
    best = None
    for p in A:
        for q in B:
            d = dist(p, q)
            if best is None or d < best[0]: best = (d, p, q)
    return best
def place(loc):
    s = (loc or '').strip().upper()
    m = re.match(r'^(.*?) *& *(.*?) AT (.*?) *& *(.*)$', s)
    if m:
        a, b, c, d = [key(x) for x in m.groups()]; P = [p for x in (a, b) for y in (c, d) for p in cross(x, y)[:1]]
        return (mean(P), 'block') if len(P) >= 2 else (None, 'block street not found')
    m = re.match(r'^([^,]*?) *& *([^,]*?), *TO$', s)   # written as two streets and an empty 'to'
    if m:
        P = cross(key(m.group(1)), key(m.group(2))); return (P[0], 'intersection') if P else (None, 'intersection not found')
    m = re.match(r'^(.*?),(.*?) TO ?(.*)$', s)
    if m:
        a, b, c = [key(x) for x in m.groups()]
        if not a: return None, 'blank'
        A = cross(a, b) if b else []; B = cross(a, c) if c else []
        if A and B:
            d, p, q = nearest_pair(A, B)
            return (((p[0]+q[0])/2, (p[1]+q[1])/2), 'segment') if d < 2500 else (p, 'segment, far end unclear')
        if A or B: return (A or B)[0], 'segment, one end'
        # a short street whose cross streets are not on the map: the middle of the street is within a block of anywhere on it
        ks = cands(a)
        if len(ks) == 1:
            pts = [p for ids, ps in ways[ks[0]] for p in ps]; xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
            if dist((min(xs), min(ys)), (max(xs), max(ys))) < 500: return (pts[len(pts)//2], 'short street, middle')
        return None, 'segment street not found'
    m = re.match(r'^(.*?) AT (.*)$', s)
    if m:
        a, b = m.group(1).strip(), m.group(2).strip()
        ma = re.match(r'^(\d{3,}) (.+)$', a)
        if ma:
            p = addr(int(ma.group(1)), ma.group(2))
            if p: return p, 'address, same block'
            # Lincoln numbers houses by the cross street: 2906 on a named east-west street is at 29th
            k = key(ma.group(2)); blk = int(ma.group(1)) // 100
            if blk >= 1 and not re.search(r'\d', k):
                P = cross(k, str(blk))
                if len(P) == 1: return P[0], 'address, by block number'
            return None, 'address not found'
        if b in ('-', '') or 'PARKING' in b: return None, 'no street given'
        P = cross(key(a), key(b)); return (P[0], 'intersection') if P else (None, 'intersection not found')
    return None, 'blank or other'
def iso(d):
    # the 2024 table writes dates as M/D/YYYY; 2025 and 2026 write YYYY-MM-DD
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})', d or '')
    return '%s-%02d-%02d' % (m.group(3), int(m.group(1)), int(m.group(2))) if m else (d or '')[:10]
rows = []
for f in sorted(glob.glob(SRC + 'Traffic_Crashes_20*.json')):
    for x in json.load(open(f)).get('features', []): rows.append(x['attributes'])
out = []; why = collections.Counter(); miss = collections.Counter()
for r in rows:
    p, how = place(r.get('LOCAT'))
    why[how] += 1
    if p is None: miss[(r.get('LOCAT') or '').strip()] += 1
    out.append(dict(date=iso(r.get('DOA')), time=r.get('TOA'), loc=r.get('LOCAT'), type=r.get('TYPE'), action=r.get('ACTION'), veh=r.get('NUV'), inj=r.get('NOI'),
                    ped=bool(r.get('PED')), bike=bool(r.get('BIKE')), mc=bool(r.get('MC')), truck=bool(r.get('TRUCK')), lon=round(p[0], 6) if p else None, lat=round(p[1], 6) if p else None, how=how))
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else 'crashes_placed.json', 'w'))
n = len(out); ok = sum(1 for o in out if o['lon'] is not None)
print('rows', n, 'placed', ok, '%.1f%%' % (100*ok/n)); print(dict(why)); print(miss.most_common(40))
sev = lambda t: [o for o in out if (o['type'] or '').startswith(t)]
for t in ('FATAL', 'INJURY'): s = sev(t); print(t, len(s), 'placed', sum(1 for o in s if o['lon'] is not None))
