# Turn the StarTran GTFS schedule into a compact structure for scheduled bus positions.
import zipfile,csv,io,json,math,sys,collections
D='/mnt/user-data/uploads/STARCITY/'
LAT0,LON0=40.77,-96.64;KX=111320*math.cos(math.radians(LAT0));KY=111000.0
z=zipfile.ZipFile(D+'gtfs.zip')
def rd(n):
    if n not in z.namelist(): return []
    return list(csv.DictReader(io.TextIOWrapper(z.open(n),encoding='utf-8-sig')))
def sec(t):
    h,m,s=t.strip().split(':');return int(h)*3600+int(m)*60+int(s)
routes=rd('routes.txt');trips=rd('trips.txt');st=rd('stop_times.txt');stops={s['stop_id']:s for s in rd('stops.txt')}
shp=collections.defaultdict(list)
for r in rd('shapes.txt'): shp[r['shape_id']].append((int(r['shape_pt_sequence']),(float(r['shape_pt_lon'])-LON0)*KX,(float(r['shape_pt_lat'])-LAT0)*KY))
shapes={}
for k,v in shp.items():
    v.sort();pts=[(x,y) for _,x,y in v];cum=[0]
    for i in range(1,len(pts)): cum.append(cum[-1]+math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]))
    shapes[k]=(pts,cum)
bytrip=collections.defaultdict(list)
for r in st:
    t=r.get('departure_time') or r.get('arrival_time')
    if t and t.strip(): bytrip[r['trip_id']].append((int(r['stop_sequence']),sec(t),r['stop_id']))
rix={r['route_id']:i for i,r in enumerate(routes)}
R=[[r.get('route_short_name') or r['route_id'],r.get('route_long_name',''),(r.get('route_color') or '2f6fb3')] for r in routes]
svc=[];six={}
for c in rd('calendar.txt'):
    six[c['service_id']]=len(svc);svc.append([c['service_id'],[int(c[d]) for d in ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')],int(c['start_date']),int(c['end_date'])])
exc=[]
for c in rd('calendar_dates.txt'):
    if c['service_id'] not in six: six[c['service_id']]=len(svc);svc.append([c['service_id'],[0]*7,0,0])
    exc.append([six[c['service_id']],int(c['date']),int(c['exception_type'])])
sidx={};S=[];pats={};P=[];T=[];PS={};HD={}
for t in trips:
    sid=t.get('shape_id');seq=sorted(bytrip.get(t['trip_id'],[]))
    if sid not in shapes or len(seq)<2 or t['service_id'] not in six: continue
    pts,cum=shapes[sid];tot=cum[-1] or 1
    if sid not in sidx:
        sidx[sid]=len(S);S.append([round(v) for p in pts for v in (p[0],-p[1])]+[])
    fr=[];j=0;sq=[]
    for _,tt,stop in seq:
        s=stops.get(stop)
        if not s: continue
        x=(float(s['stop_lon'])-LON0)*KX;y=(float(s['stop_lat'])-LAT0)*KY
        best=j;bd=1e18
        for i in range(j,min(len(pts),j+400)):
            d=(pts[i][0]-x)**2+(pts[i][1]-y)**2
            if d<bd: bd,best=d,i
        j=best;fr.append((round(cum[j]/tot*1000),tt));sq.append(stop)
    if len(fr)<2: continue
    t0=fr[0][1];key=(sid,t['route_id'],tuple((f,tt-t0) for f,tt in fr))
    if key not in pats:
        pats[key]=len(P);P.append([sidx[sid],rix.get(t['route_id'],0),[f for f,_ in fr],[tt-t0 for _,tt in fr]])
    T.append([pats[key],t0,six[t['service_id']]])
    PS.setdefault(pats[key],sq);HD.setdefault(pats[key],collections.Counter())[(t.get('trip_headsign') or '').strip()]+=1
# shapes: store cumulative-friendly raw points; JS recomputes lengths
json.dump(dict(routes=R,shapes=S,pats=P,trips=T,svc=svc,exc=exc),open('bus.json','w'),separators=(',',':'))
print('routes',len(R),'shapes',len(S),'patterns',len(P),'trips',len(T),'svc',svc,'exc',len(exc),'bytes',len(open('bus.json').read()),file=sys.stderr)

# stops, and which stops each pattern calls at, for nearest-stop and next-bus answers (kept beside bus.json so the first pack does not change)
import re
CORNER={'NE':'northeast corner','NW':'northwest corner','SE':'southeast corner','SW':'southwest corner','N':'north side','S':'south side','E':'east side','W':'west side'}
def nm(n):
    n=re.sub(r'\s+',' ',n.strip());m=re.search(r',\s*(NE|NW|SE|SW|N|S|E|W)$',n)
    return (n[:m.start()]+', '+CORNER[m.group(1)]) if m else n
used=sorted({s_ for v in PS.values() for s_ in v},key=lambda q:(len(q),q));six2={q:i for i,q in enumerate(used)}
ST=[[nm(stops[q]['stop_name']),round((float(stops[q]['stop_lon'])-LON0)*KX),round(-(float(stops[q]['stop_lat'])-LAT0)*KY),q] for q in used]
heads=[];hix={}
def hd(i):
    h=HD[i].most_common(1)[0][0] if HD.get(i) else ''
    if h not in hix: hix[h]=len(heads);heads.append(h)
    return hix[h]
fi=rd('feed_info.txt');ver=(fi[0].get('feed_version') if fi else '') or ''
json.dump(dict(stops=ST,ps=[[six2[q] for q in PS[i]] for i in range(len(P))],hd=[hd(i) for i in range(len(P))],heads=heads,ver=ver),open('bus_stops.json','w'),separators=(',',':'))
assert all(len(PS[i])==len(P[i][2]) for i in range(len(P)))
print('stops used',len(ST),'of',len(stops),'heads',len(heads),'feed version',ver,'bytes',len(open('bus_stops.json').read()),file=sys.stderr)
