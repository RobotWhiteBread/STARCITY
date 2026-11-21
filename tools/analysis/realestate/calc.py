import pickle,json,collections,statistics as st,datetime,math
from shapely.geometry import shape
from shapely.ops import transform
from shapely import STRtree
import pyproj
P,S,T=pickle.load(open('all.pkl','rb'))
tr=pyproj.Transformer.from_crs(4326,5070,always_xy=True).transform
cl=json.load(open('/mnt/user-data/uploads/STARCITY/gis/fema/citylimits.json'))
from shapely.geometry import Polygon
from shapely.ops import unary_union
polys=[]
for f in cl['features']:
    ps=[Polygon(r) for r in ((f.get('geometry') or {}).get('rings') or []) if len(r)>=4]
    ps=[x if x.is_valid else x.buffer(0) for x in ps];ps=[x for x in ps if not x.is_empty]
    if ps: polys.append(transform(tr,unary_union(ps)))
polys.sort(key=lambda g:-g.area)
city=polys[1];print('city sqmi',city.area/2589988.11, 'etj',polys[0].area/2589988.11)
from shapely.prepared import prep
pc=prep(city)
seen=set();R=[]
for a,g in P:
    if not g or a['PARCELID'] in seen: continue
    seen.add(a['PARCELID'])
    try: G=transform(tr,shape(g))
    except Exception: continue
    if not G.is_valid: G=G.buffer(0)
    if G.is_empty: continue
    rp=G.representative_point()
    if not pc.contains(rp): continue
    R.append(dict(id=a['PARCELID'],v=a['CNTASSDVAL'] or 0,cls=a['CLASSDSCRP'] or 'Unclassified',cvt=a['CVTTXCD'],nb=a['NGHBRHDCD'],ac=G.area/4046.8564,fl=a['RESFLRAREA'] or 0,hr=a['HighRise'] or 0,x=rp.x,y=rp.y))
print(len(R),sum(r['v'] for r in R))
pickle.dump(R,open('city.pkl','wb'))
