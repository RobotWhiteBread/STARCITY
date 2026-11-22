"""Lancaster County as a whole: Lincoln against the rest of the county. Uses the same parcel, sales and levy data as the city papers.
Usage: python3 county.py all.pkl citylimits.json process2.py   (all.pkl is built by ../citywide/load.py)"""
import pickle,json,sys,re,collections,statistics as st
from shapely.geometry import shape,Polygon
from shapely.ops import transform,unary_union
from shapely.prepared import prep
import pyproj
P,S,T=pickle.load(open(sys.argv[1],'rb'))
tr=pyproj.Transformer.from_crs(4326,5070,always_xy=True).transform
polys=[]
for f in json.load(open(sys.argv[2]))['features']:
    ps=[Polygon(r) for r in ((f.get('geometry') or {}).get('rings') or []) if len(r)>=4]
    ps=[x if x.is_valid else x.buffer(0) for x in ps];ps=[x for x in ps if not x.is_empty]
    if ps: polys.append(transform(tr,unary_union(ps)))
polys.sort(key=lambda g:-g.area);city=prep(polys[1])
LEVY={k:float(v) for k,v in re.findall(r'(\d{4})=([\d.]+)',open(sys.argv[3]).read().split("_LEVY = '''")[1].split("'''")[0])}
seen=set();R=[];incity={}
for a,g in P:
    if not g or a['PARCELID'] in seen: continue
    seen.add(a['PARCELID'])
    try: G=transform(tr,shape(g))
    except Exception: continue
    if not G.is_valid: G=G.buffer(0)
    if G.is_empty: continue
    ins=city.contains(G.representative_point());incity[a['PARCELID']]=ins
    R.append(dict(v=a['CNTASSDVAL'] or 0,cls=a['CLASSDSCRP'] or 'Unclassified',tx=(a['CVTTXCD'] or '').zfill(4),ac=G.area/4046.8564,ins=ins,sch=a['SCHLDSCRP'] or ''))
out={}
for nm,sel in (('Lincoln',lambda r:r['ins']),('Rest of county',lambda r:not r['ins']),('Whole county',lambda r:True)):
    X=[r for r in R if sel(r)];tv=sum(r['v'] for r in X);ac=sum(r['ac'] for r in X)
    bc=collections.defaultdict(lambda:[0,0,0.0])
    for r in X:
        c=r['cls'];k='Homes' if c.startswith('Res') and 'Un' not in c else 'Commercial' if c.startswith('Com') and 'Un' not in c else 'Farm land' if c.startswith('Ag') else 'Land without buildings' if 'Un' in c and c!='Unclassified' else 'Other'
        bc[k][0]+=1;bc[k][1]+=r['v'];bc[k][2]+=r['ac']
    homes=sorted(r['v'] for r in X if r['cls']=='Residential Improved' and r['v']>0)
    rates=sorted(LEVY[r['tx']] for r in X if r['tx'] in LEVY and r['cls']=='Residential Improved')
    tax=sum(r['v']*LEVY[r['tx']]/100 for r in X if r['tx'] in LEVY);ntx=sum(1 for r in X if r['tx'] in LEVY)
    out[nm]=dict(n=len(X),v=tv,ac=ac,vpa=tv/ac,by={k:v for k,v in bc.items()},medhome=st.median(homes),nhomes=len(homes),medrate=st.median(rates),p10=rates[len(rates)//10],p90=rates[len(rates)*9//10],tax=tax,ntx=ntx,ndist=len(set(r['tx'] for r in X if r['tx'] in LEVY)),nsch=len(set(r['sch'] for r in X if r['sch'])))
# sales ratio inside and outside
def ratio(rows):
    r=sorted(x['AssdValue']/x['SalePrice'] for x in rows);m=st.median(r);cod=100*sum(abs(q-m) for q in r)/len(r)/m
    prd=(sum(r)/len(r))/(sum(x['AssdValue'] for x in rows)/sum(x['SalePrice'] for x in rows));return dict(n=len(r),med=m,cod=cod,prd=prd,price=st.median(x['SalePrice'] for x in rows))
ok=[s for s in S if s['PropType']=='Res' and s['SaleValidityCode']=='01' and (s['SalePrice'] or 0)>10000 and (s['AssdValue'] or 0)>0 and s['PID'] in incity]
sal={'Lincoln':ratio([s for s in ok if incity[s['PID']]]),'Rest of county':ratio([s for s in ok if not incity[s['PID']]]),'Whole county':ratio(ok)}
# top tax districts outside Lincoln by homes
od=collections.Counter(r['tx'] for r in R if not r['ins'] and r['cls']=='Residential Improved' and r['tx'] in LEVY)
sch=collections.defaultdict(list)
for r in R:
    if r['cls']=='Residential Improved' and r['tx'] in LEVY and r['sch']: sch[r['sch']].append((LEVY[r['tx']],r['v']))
schrows=sorted(((k,len(v),st.median(a for a,_ in v),st.median(b for _,b in v)) for k,v in sch.items() if len(v)>=150),key=lambda q:-q[1])
json.dump(dict(out=out,sal=sal,sch=schrows),open('county.json','w'),default=str)
for k,v in out.items(): print(k,{a:(round(b,4) if isinstance(b,float) else b) for a,b in v.items() if a!='by'});print('   ',{a:[b[0],round(b[1]/1e9,3),round(b[2])] for a,b in v['by'].items()})
print(sal);
for r in schrows: print(r)
