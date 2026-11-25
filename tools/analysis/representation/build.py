"""Which districts each Lincoln voting precinct sits in: Legislature, County Board, City Council.
From the Lancaster County Election Commissioner's Elections Districts and Voting Precincts layer on the city's open data portal,
read November 2026 (fields PRECINCT, LEGIS, COBOARD, COUNCIL for city precincts). A precinct drawn in more than one piece can
fall in two districts; those are marked 'split' so the map says to check the official lookup."""
import json, os
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, '..', '..', '..')
vp = {}
for e in open(os.path.join(H, 'raw.txt')).read().strip().split(';'):
    k, v = e.split(':'); v = list(map(int, v.split(',')))
    if k in vp and vp[k][:3] != v: vp[k] = vp[k][:3] + ['split']
    elif k not in vp: vp[k] = v
json.dump({'read': '2026-11', 'vp': vp}, open(os.path.join(R, 'data', 'representation.json'), 'w'), separators=(',', ':'))
print(len(vp), sum(1 for v in vp.values() if len(v) > 3))
