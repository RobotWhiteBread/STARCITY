# STARCITY: every street address the city has on record, for the map's search box.
# Input: the city's Address Points layer (BuildingSafety/Addresses on the city map server), saved as pages of JSON.
# Output: data/addresses.json. Streets in alphabetical order; under each, house numbers with a place in map meters.
#   {"asof": "...", "n": count, "s": [[street name, [house number, x, z, house number, x, z, ...]], ...]}
#   x is meters east and z meters south of the map origin (40.77 N, 96.64 W). House numbers with a letter are kept as text.
# Kept: legal, village and "also known as" addresses inside the map square. One entry per house number and street;
# apartment and suite numbers are folded into their building. Left out: retired and proposed addresses, and the
# water, electric and billboard service points, which are not places a person would look up.
# Run: python3 tools/analysis/addresses/build.py <folder of pages> [out.json] [date read, like "November 27, 2026"]
import sys, os, json, glob, math, collections
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else 'data/addresses.json'; asof = sys.argv[3] if len(sys.argv) > 3 else ''
KX = 111320 * math.cos(math.radians(40.77)); HALF = 16400
SMALL = {'RD': 'Rd', 'ST': 'St', 'AVE': 'Ave', 'DR': 'Dr', 'BLVD': 'Blvd', 'CT': 'Ct', 'CIR': 'Cir', 'LN': 'Ln', 'PL': 'Pl', 'PKWY': 'Pkwy', 'HWY': 'Hwy', 'TER': 'Ter', 'TRL': 'Trl'}
def nice(w):
    if w in ('N', 'S', 'E', 'W', 'NW', 'NE', 'SW', 'SE', 'US', 'NE'): return w
    if w in SMALL: return SMALL[w]
    if w[:1].isdigit(): return w.lower()
    return w.capitalize() if not w.startswith('MC') or len(w) < 4 else 'Mc' + w[2:].capitalize()
S = collections.defaultdict(dict); seen = 0; kinds = collections.Counter()
for f in sorted(glob.glob(os.path.join(src, 'p*.json'))):
    for ft in json.load(open(f, encoding='utf-8-sig'))['features']:
        a, g = ft['attributes'], ft.get('geometry'); seen += 1
        if not g or a.get('AddressType') not in ('Legal', 'Village', 'Also Known As'): kinds['left out: ' + str(a.get('AddressType'))] += 1; continue
        hn = (a.get('HOUSENO') or '').strip(); nm = (a.get('STNAME') or '').strip()
        if not hn or not hn[0].isdigit() or not nm: kinds['left out: no number or street'] += 1; continue
        x = round((g['x'] + 96.64) * KX); z = round(-(g['y'] - 40.77) * 111000)
        if abs(x) > HALF or abs(z) > HALF: kinds['left out: outside the map'] += 1; continue
        parts = [(a.get(k) or '').strip() for k in ('STPRE', 'STNAME', 'STTYPE', 'STSUF')]
        st = ' '.join(nice(w) for p in parts if p for w in p.upper().split())
        d = S[st]
        if hn in d: d[hn][2] += 1; d[hn][0] += x; d[hn][1] += z
        else: d[hn] = [x, z, 1]
n = 0; rows = []
for st in sorted(S):
    flat = []
    for hn in sorted(S[st], key=lambda h: (int(''.join(c for c in h if c.isdigit())[:7] or 0), h)):
        x, z, k = S[st][hn]; flat += [int(hn) if hn.isdigit() else hn, round(x / k), round(z / k)]; n += 1
    rows.append([st, flat])
json.dump({'asof': asof, 'n': n, 's': rows}, open(out, 'w'), separators=(',', ':'))
print(seen, 'address points read;', n, 'addresses on', len(rows), 'streets;', dict(kinds), ';', os.path.getsize(out) // 1024, 'KB')
