# citywide: assessment ratio study + shared sales prep
import json,glob,pickle,statistics as st,collections,warnings,datetime
warnings.filterwarnings('ignore')
from shapely.geometry import shape,Point,Polygon
from shapely.ops import transform,unary_union
from shapely.prepared import prep
from shapely import STRtree
import pyproj
tr=pyproj.Transformer.from_crs(4326,5070,always_xy=True).transform
cl=json.load(open('/mnt/user-data/uploads/STARCITY/gis/fema/citylimits.json'));polys=[]
for f in cl['features']:
    ps=[Polygon(r) for r in ((f.get('geometry') or {}).get('rings') or []) if len(r)>=4]
    ps=[x if x.is_valid else x.buffer(0) for x in ps];ps=[x for x in ps if not x.is_empty]
    if ps: polys.append(transform(tr,unary_union(ps)))
polys.sort(key=lambda g:-g.area);city=prep(polys[1])
S=[]
for f in sorted(glob.glob('/mnt/user-data/uploads/STARCITY/gis/sales_all/*.json')):
    for ft in json.load(open(f))['features']:
        a=ft['properties'];g=ft.get('geometry')
        if not g: a['in']=False
        else:
            p=transform(tr,shape(g));a['in']=city.contains(p);a['x']=p.x;a['y']=p.y
        S.append(a)
print('sales',len(S),'in city',sum(1 for s in S if s['in']))
pickle.dump(S,open('sales.pkl','wb'))
def study(q,label):
    r=[s['AssdValue']/s['SalePrice'] for s in q];m=st.median(r)
    cod=100*st.mean([abs(x-m) for x in r])/m
    prd=st.mean(r)/(sum(s['AssdValue'] for s in q)/sum(s['SalePrice'] for s in q))
    print(f"{label}: n={len(q)} median={m:.3f} COD={cod:.1f} PRD={prd:.3f}");return m,cod,prd
for scope,flt in [('ALL(county file)',lambda s:True),('IN CITY',lambda s:s['in'])]:
    res=[s for s in S if flt(s) and s['PropType']=='Res' and s['SalePrice'] and s['AssdValue']]
    print('==',scope);study(res,'residential')
    z=sorted(res,key=lambda s:s['SalePrice'])
    for k in range(10):
        b=z[k*len(z)//10:(k+1)*len(z)//10];print(' decile',k+1,'median price',st.median([s['SalePrice'] for s in b]),'ratio',round(st.median([s['AssdValue']/s['SalePrice'] for s in b]),3))
    g=collections.defaultdict(list)
    for s in res:g[s['NBHGroup']].append(s)
    rows=[(k,len(v),st.median([s['AssdValue']/s['SalePrice'] for s in v]),st.median([s['SalePrice'] for s in v])) for k,v in g.items() if len(v)>=20]
    rows.sort(key=lambda x:-x[2]);print(' groups n>=20:',len(rows));print(' top',[(k,n,round(r,3),p) for k,n,r,p in rows[:6]]);print(' bottom',[(k,n,round(r,3),p) for k,n,r,p in rows[-6:]])
    for lab,f2 in [('pre-1950',lambda y:y<1950),('1950-1979',lambda y:1950<=y<1980),('1980-2009',lambda y:1980<=y<2010),('2010+',lambda y:y>=2010)]:
        q=[s for s in res if s['ResYrBlt'] and f2(s['ResYrBlt'])]
        if q: study(q,'  built '+lab)
    com=[s for s in S if flt(s) and s['PropType']=='Com' and s['SalePrice'] and s['AssdValue']]
    study(com,'commercial')
