import json,glob,pickle,statistics as st,collections,warnings
warnings.filterwarnings('ignore')
from shapely.geometry import shape,Point,Polygon
from shapely.ops import transform,unary_union
from shapely import STRtree
import pyproj
tr=pyproj.Transformer.from_crs(4326,5070,always_xy=True).transform
S=[s for s in pickle.load(open('sales.pkl','rb')) if s['in']]
res=[s for s in S if s['PropType']=='Res' and s['SalePrice'] and s['AssdValue']]
com=[s for s in S if s['PropType']=='Com' and s['SalePrice'] and s['AssdValue']]
R=lambda s:s['AssdValue']/s['SalePrice']
def study(q):
    r=[R(s) for s in q];m=st.median(r);cod=100*st.mean([abs(x-m) for x in r])/m
    prd=st.mean(r)/(sum(s['AssdValue'] for s in q)/sum(s['SalePrice'] for s in q));return m,cod,prd
print('counts all in-city',len(S),'res',len([s for s in S if s['PropType']=='Res']),'res usable',len(res),'com',len(com),'other',len([s for s in S if s['PropType'] not in('Res','Com')]))
print('res',study(res),'com',study(com))
z=sorted(res,key=lambda s:s['SalePrice'])
print('DECILES')
for k in range(10):
    b=z[k*len(z)//10:(k+1)*len(z)//10];print(f"| {k+1} | {len(b)} | ${st.median([s['SalePrice'] for s in b]):,.0f} | {st.median([R(s) for s in b]):.3f} |")
g=collections.defaultdict(list)
for s in res:g[s['NBHGroup']].append(s)
rows=sorted([(k,len(v),st.median([R(s) for s in v]),st.median([s['SalePrice'] for s in v])) for k,v in g.items() if len(v)>=20],key=lambda x:x[2])
print('GROUPS',len(rows),'range',rows[0][1],rows[-1][1], 'n range',min(r[1] for r in rows),max(r[1] for r in rows))
for k,n,r,p in rows[:5]:print(f"| {k} | {n} | {r:.3f} | ${p:,.0f} |")
print('--')
for k,n,r,p in rows[-5:]:print(f"| {k} | {n} | {r:.3f} | ${p:,.0f} |")
# HOLC
rj=json.load(open(glob.glob('/home/claude/data/gis/redline/*.json')[0]))['features'];H=[]
for f in rj:
    a=f.get('attributes',f.get('properties'));gm=f['geometry']
    G=shape(gm) if 'type' in gm else unary_union([Polygon(r) for r in gm['rings'] if len(r)>=4])
    G=transform(tr,G);H.append((a['holc_grade'],G if G.is_valid else G.buffer(0)))
print('holc bounds lat check', len(H))
tree=STRtree([g for _,g in H])
def grade(s):
    p=Point(s['x'],s['y'])
    for i in tree.query(p):
        if H[i][1].contains(p):return H[i][0]
    return None
hg=collections.defaultdict(list)
for s in res:hg[grade(s)].append(s)
print('HOLC')
for k in ['A','B','C','D',None]:
    v=hg[k]
    if v:m,c,_=study(v);print(f"| {k} | {len(v):,} | {m:.3f} | {c:.1f} | ${st.median([s['SalePrice'] for s in v]):,.0f} |")
print('DECADES')
for lo,hi in [(1890,1909),(1910,1929),(1930,1949),(1950,1969),(1970,1989),(1990,2009),(2010,2029)]:
    v=[s for s in res if s['ResYrBlt'] and lo<=s['ResYrBlt']<=hi]
    m,c,_=study(v);print(f"| {lo} to {hi} | {len(v)} | {m:.3f} | {c:.1f} | ${st.median([s['SalePrice'] for s in v]):,.0f} |")
print('pre1890 or none',len([s for s in res if not s['ResYrBlt'] or s['ResYrBlt']<1890]))
import datetime
d=[datetime.datetime.utcfromtimestamp(s['SaleDate']/1000) for s in S];print(min(d),max(d))
