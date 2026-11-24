"""STARCITY: Lincoln Fire & Rescue response times by ZIP code, 2013 to 2019, from the city's LFR apparatus tables
(the last year the open data portal publishes). raw.json holds, per year and group, [calls, median seconds,
90th percentile seconds, percent of calls reached within 4:00 of dispatch]; groups are all calls, EMS, fire and
ZIP codes ("z" = no ZIP recorded). Rules applied here: ZIP-years with fewer than 20 calls are dropped;
no address, unit or person is in the data. Output: data/fire-response.json and data_public/fire_response_by_zip_2013_2019.csv."""
import json, os, csv
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..', '..', '..')
R = json.load(open(os.path.join(here, 'raw.json')))
out = {'note': R['note'], 'years': sorted(R['data']), 'city': {}, 'ems': {}, 'fire': {}, 'zip': {}}
for y, v in R['data'].items():
    s = v['s']; out['city'][y] = s['all']; out['ems'][y] = s.get('ems'); out['fire'][y] = s.get('fire')
    for k, a in s.items():
        if k.startswith('z6') and a[0] >= 20: out['zip'].setdefault(k[1:], {})[y] = a
json.dump(out, open(os.path.join(root, 'data', 'fire-response.json'), 'w'), separators=(',', ':'))
with open(os.path.join(root, 'data_public', 'fire_response_by_zip_2013_2019.csv'), 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['year', 'area', 'calls', 'median_seconds', 'p90_seconds', 'pct_within_240s'])
    for y in out['years']:
        w.writerow([y, 'citywide'] + out['city'][y])
        for z in sorted(out['zip']):
            if y in out['zip'][z]: w.writerow([y, z] + out['zip'][z][y])
print(len(out['zip']), {y: out['city'][y] for y in out['years']})
