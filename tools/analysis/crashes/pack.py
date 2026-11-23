"""Turn geocode.py's output into the two published files.

  data/crashes-2024-2026.json            compact file the map loads (placed records only)
  data_public/crashes_2024_2026_placed.csv   every record, placed or not, for anyone to check

Flags in the map file: 1 pedestrian, 2 bicycle, 4 hit and run, 8 night (9 p.m. to 3 a.m.).
A time of 9999 means the time is not known (mostly parked-car hit and runs found later).
Those records are not counted as night.
"""
import json, csv, sys, datetime
src, out_json, out_csv = sys.argv[1], sys.argv[2], sys.argv[3]
R = json.load(open(src))
def hour(t):
    try: t = int(t)
    except Exception: return None
    return None if t == 9999 or t < 0 or t > 2359 else t // 100
P = [o for o in R if o['lon'] is not None]
sev = lambda t: 2 if 'FATAL' in t else 1 if t.startswith('INJ') else 0
def flags(o):
    h = hour(o['time']); t = o['type'] or ''
    return (1 if o['ped'] else 0) | (2 if o['bike'] else 0) | (4 if 'H&R' in t else 0) | (8 if h is not None and (h >= 21 or h < 3) else 0)
mon = lambda d: (int(d[:4]) - 2024) * 12 + int(d[5:7]) - 1
dates = sorted(o['date'] for o in R if o['date'])
json.dump(dict(asof=datetime.date.today().isoformat(), rows=len(R), placed=len(P), first=dates[0], last=dates[-1],
               lon=[round(o['lon'] * 1e5) for o in P], lat=[round(o['lat'] * 1e5) for o in P],
               s=[sev(o['type'] or '') for o in P], f=[flags(o) for o in P], m=[mon(o['date']) for o in P]),
          open(out_json, 'w'), separators=(',', ':'))
with open(out_csv, 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['date', 'time', 'location_text', 'type', 'action', 'vehicles', 'injured', 'pedestrian', 'bicycle', 'lon', 'lat', 'how_placed'])
    for o in R: w.writerow([o['date'], o['time'], o['loc'], o['type'], o['action'], o['veh'], o['inj'], int(o['ped']), int(o['bike']), '' if o['lon'] is None else o['lon'], '' if o['lat'] is None else o['lat'], o['how']])
night = sum(1 for o in P if flags(o) & 8); unk = sum(1 for o in R if hour(o['time']) is None)
print('rows', len(R), 'placed', len(P), 'night', night, 'time unknown', unk)
