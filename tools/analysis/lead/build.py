"""Lead and galvanized service lines, from the City of Lincoln's public LeadService layer.

Source: gis.lincoln.ne.gov/public/rest/services/LTUWater/LeadService/MapServer/0 (92,545 service points),
read November 2026. Only UTILLEAD (city side), CUSTLEAD (customer side) and the point were read.
Account IDs and street addresses are not downloaded or kept.

lead_flagged.b64: gzip of uint32 n, n delta-encoded int16 (x,z) pairs in 2 m units from
LAT0=40.77, LON0=-96.64 (z = -(lat-LAT0)*111000), then n uint8 class (1 lead on either side, 2 galvanized).
by_precinct_raw.txt: precinct|lead,galvanized,unknown-or-no-record counts, city precincts only.

Writes data/lead-lines.bin (uint32 n, int16 x,z absolute, uint8 class), data/lead-lines.json and
data_public/lead_service_lines_by_precinct.csv.
"""
import base64, gzip, struct, json, os
H = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(H, '..', '..', '..')
b = gzip.decompress(base64.b64decode(open(os.path.join(H, 'lead_flagged.b64')).read()))
n = struct.unpack('<I', b[:4])[0]
d = struct.unpack('<%dh' % (2 * n), b[4:4 + 4 * n]); cls = b[4 + 4 * n:4 + 5 * n]
xz = []; x = z = 0
for i in range(n):
    x += d[2 * i]; z += d[2 * i + 1]; xz += [x, z]
out = struct.pack('<I', n) + struct.pack('<%dh' % (2 * n), *xz) + bytes(cls)
open(os.path.join(R, 'data', 'lead-lines.bin'), 'wb').write(out)
vp = {}
for e in open(os.path.join(H, 'by_precinct_raw.txt')).read().strip().split(';'):
    k, v = e.split('|'); vp[k] = list(map(int, v.split(',')))
tot = [sum(v[i] for v in vp.values()) for i in range(3)]
meta = dict(read='2026-11', points=92545, lead=sum(1 for c in cls if c == 1), galv=sum(1 for c in cls if c == 2),
            city=dict(Lead=1103, Galvanized=3293, Unknown=2998), vp=vp, vp_tot=tot,
            src='https://gis.lincoln.ne.gov/public/rest/services/LTUWater/LeadService/MapServer/0')
json.dump(meta, open(os.path.join(R, 'data', 'lead-lines.json'), 'w'), separators=(',', ':'))
with open(os.path.join(R, 'data_public', 'lead_service_lines_by_precinct.csv'), 'w') as f:
    f.write('precinct,lead_either_side,galvanized,unknown_or_no_record\n')
    for k in sorted(vp): f.write('%s,%d,%d,%d\n' % (k, *vp[k]))
print(n, meta['lead'], meta['galv'], tot, min(xz[0::2]), max(xz[0::2]), min(xz[1::2]), max(xz[1::2]))
