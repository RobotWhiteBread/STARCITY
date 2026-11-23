"""Builds data/safety-citywide.json and data_public/lpd_citywide_by_year.csv from citywide_raw.json.

citywide_raw.json holds counts taken from the Lincoln Police Department's yearly tables on the city's
open data portal (ArcGIS feature services), using server-side group-by statistics (see query.md).
Nothing in it identifies a person: no names, officer numbers, case numbers, addresses or free text.
"""
import json, csv, os
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..', '..', '..')
d = json.load(open(os.path.join(here, 'citywide_raw.json')))
# 2026 tables: incidents, calls, arrests, use of force and the survey run January 1 to June 30.
# Stops run to August 11, so stops are recounted to June 30 to match.
d['stops']['2026'] = {"n":19961,"warn":9987,"tcite":8839,"ccite":36,"jail":446,"none":653,"srch":410,"s_arrest":114,"s_inv":5,"s_consent":103,"s_pc":188,"r_traffic":19879,"r_crim":63,"race":[13207,2676,2340,678,152,908],"rsrch":[214,100,46,10,17,23]}
d['dispatch']['2026'] = 53949   # the portal's count-only query returns 0 for this table; a count statistic returns 53,949
# The survey tables hold more than 1,000 rows, the service's page size; these are the recounts with full paging.
Q2 = {2020:[2968,[1391,725,579,99,70],[60,75,304,1031,1330],[2647,239]],2021:[3412,[1793,809,496,90,93],[89,96,335,1099,1593],[3070,227]],
      2023:[2288,[1146,496,332,100,70],[46,65,290,656,1028],[1990,181]],2024:[4247,[2171,968,602,181,151],[101,119,463,1243,1998],[3789,333]],
      2025:[1655,[878,351,207,75,51],[52,52,171,429,812],[1429,153]]}
for y, (n, a, b, c) in Q2.items(): d['qsa'][str(y)] = {'n': n, 'q17': a, 'q9': b, 'fair': c}
# By area: crime reports 2021 to 2025 placed at the center of their block (city address points) and counted by
# police reporting district and City Council district. Domestic, sex-offense, child-abuse and stalking reports and
# every medical, mental-health, death and missing-person report are not counted here at all.
L = open(os.path.join(here, 'by_area_raw.txt')).read().split('\n')
rd = {int(a.split(':')[0]): list(map(int, a.split(':')[1].split(','))) for a in L[0][4:].split(';')}
cc = {int(a.split(':')[0]): list(map(int, a.split(':')[1].split(','))) for a in L[1][3:].split(';')}
st = {int(a.split(':')[0]): list(map(int, a.split(':')[1].split(','))) for a in L[2][5:].split(';')}
sup = lambda v: v if v >= 5 else -1
years = list(range(2013, 2027))
out = {'years': years, 'partYear': 2026, 'partLabel': 'January to June', 'asof': 'November 23, 2026'}
for k in ('inc', 'dispatch', 'arrests', 'stops', 'uoc', 'pursuits', 'qsa'):
    out[k] = {int(y): v for y, v in d[k].items()}
out['area'] = {'years': [2021, 2025], 'groups': ['violent', 'property', 'narcotics', 'disturbance'], 'rd': {k: [sup(x) for x in v] for k, v in rd.items()},
  'cc': {k: [v[i:i + 4] for i in range(0, 20, 4)] for k, v in cc.items()}, 'placed': {y: {'reports': a, 'counted': b, 'placed': c, 'inside': e} for y, (a, b, c, e) in st.items()}}
json.dump(out, open(os.path.join(root, 'data', 'safety-citywide.json'), 'w'), separators=(',', ':'))
G = {'V': 'violent', 'P': 'property', 'D': 'narcotics', 'N': 'disturbance_nuisance', 'S': 'domestic_sex_child_stalking', 'X': 'not_shown_medical_death_missing'}
S = {'lar': 'theft', 'frd': 'fraud_forgery', 'van': 'vandalism', 'bur': 'burglary', 'mvt': 'motor_vehicle_theft', 'sas': 'simple_assault', 'agg': 'aggravated_assault', 'rob': 'robbery', 'wpn': 'weapons', 'hom': 'homicide', 'nar': 'narcotics'}
with open(os.path.join(root, 'data_public', 'lpd_citywide_by_year.csv'), 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['year', 'measure', 'value', 'note'])
    for y in years:
        note = 'January to June only' if y == 2026 else ''
        i = out['inc'].get(y)
        if i:
            for k, n in G.items():
                if i['g'].get(k) is not None: w.writerow([y, 'reports_' + n, i['g'][k], note])
            for k, n in S.items():
                if k in i['s']: w.writerow([y, 'reports_' + n, i['s'][k], note])
        if out['dispatch'].get(y): w.writerow([y, 'calls_dispatched', out['dispatch'][y], note])
        a = out['arrests'].get(y)
        if a:
            for k in ('charges', 'cite', 'booked', 'tickets'): w.writerow([y, 'arrest_citation_' + k, a[k], note])
        s = out['stops'].get(y)
        if s:
            for k in ('n', 'warn', 'tcite', 'ccite', 'jail', 'none', 'srch', 's_arrest', 's_inv', 's_consent', 's_pc', 'r_traffic', 'r_crim'):
                if k in s: w.writerow([y, 'stops_' + k, s[k], note])
            for j, rn in enumerate(['white', 'black', 'hispanic', 'asian', 'native_american', 'other']):
                w.writerow([y, 'stops_driver_' + rn, s['race'][j], note]); w.writerow([y, 'stops_searched_driver_' + rn, s['rsrch'][j], note])
        u = out['uoc'].get(y)
        if u:
            for k, v in u.items():
                if k != 'old': w.writerow([y, 'force_' + k, v, note])
        p = out['pursuits'].get(y)
        if p: w.writerow([y, 'pursuits', p['n'], note]); w.writerow([y, 'pursuits_crash', p['crash'], note])
        q = out['qsa'].get(y)
        if q:
            w.writerow([y, 'survey_n', q['n'], note])
            for j in range(5): w.writerow([y, 'survey_q17_rating_%d' % (j + 1), q['q17'][j], note]); w.writerow([y, 'survey_q9_safety_%d' % (j + 1), q['q9'][j], note])
            w.writerow([y, 'survey_treated_fairly_yes', q['fair'][0], note]); w.writerow([y, 'survey_treated_fairly_no', q['fair'][1], note])
with open(os.path.join(root, 'data_public', 'lpd_reports_by_area_2021_2025.csv'), 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['area_type', 'area', 'violent', 'property', 'narcotics', 'disturbance', 'note'])
    for k in sorted(rd): w.writerow(['police_reporting_district', k] + [sup(x) for x in rd[k]] + ['2021-2025 total; -1 means fewer than 5'])
    for k in sorted(cc):
        for i, y in enumerate(range(2021, 2026)): w.writerow(['council_district_' + str(y), k] + cc[k][4 * i:4 * i + 4] + [''])
print('ok')
