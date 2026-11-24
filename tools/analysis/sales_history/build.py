"""STARCITY: Lancaster County property sales 2013 to 2018 (county assessor sales files on Lincoln's open data
portal), packed by parcel number so a property sheet can show earlier sale prices.
Only the parcel number, sale month, price, property class and improved/vacant flag are kept. The files carry no
buyer or seller names. Sales under $1,000 are dropped as non-market transfers. 2018 runs to mid-October.
Output: data/sales-2013-2018.json and data_public/sales_median_by_year_2013_2018.csv."""
import json, os, sys, glob, datetime, statistics, collections, csv
SRC = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/uploads/STARCITY/wide/city/map/'
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..', '..', '..')
P = collections.defaultdict(list); med = collections.defaultdict(list); n = 0; seen = set()
for fn in sorted(glob.glob(SRC + 'Lancaster_County_Property_Sales_*.geojson')):
    for f in json.load(open(fn))['features']:
        p = f['properties']; d = p['Sale_Date']
        try:
            dt = datetime.datetime.fromtimestamp(float(d) / 1000, datetime.timezone.utc) if str(d).isdigit() else datetime.datetime.fromisoformat(str(d).replace('Z', '+00:00'))
            price = int(float(p['Sale_Price']))
        except Exception: continue
        dt -= datetime.timedelta(hours=7)   # stored as local midnight in UTC
        pid = str(p['Parcel_ID']).replace('-', ''); k = (pid, dt.date().isoformat(), price)   # the 2018 file repeats 2017 sales, so match on parcel, day and price
        if price < 1000 or len(pid) != 13 or k in seen or not 2013 <= dt.year <= 2018: continue
        seen.add(k); n += 1
        P[pid].append([dt.year * 100 + dt.month, price, 1 if p['Sale_Type'] == 'I' else 0])
        if p['Property_Class'] == 'Residential Improved' and p['Sale_Type'] == 'I': med[dt.year].append(price)
for v in P.values(): v.sort()
M = {y: [len(v), round(statistics.median(v))] for y, v in sorted(med.items())}
json.dump({'asof': 'November 23, 2026', 'median': M, 's': P}, open(os.path.join(root, 'data', 'sales-2013-2018.json'), 'w'), separators=(',', ':'))
with open(os.path.join(root, 'data_public', 'sales_median_by_year_2013_2018.csv'), 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['year', 'improved_residential_sales', 'median_price', 'note'])
    for y, (c, m) in M.items(): w.writerow([y, c, m, 'to mid-October' if y == 2018 else ''])
print(n, len(P), M, os.path.getsize(os.path.join(root, 'data', 'sales-2013-2018.json')))
