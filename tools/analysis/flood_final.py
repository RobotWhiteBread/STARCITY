"""Lincoln floodplain exposure, corrected. 21 Nov 2026.

City boundary: Planning/LincolnLimits layer 3 holds 70 nested annexation snapshots,
all labelled Lincoln. The largest (289.8 sq mi) is the extraterritorial jurisdiction,
which reaches three miles past the corporate limit; the corporate limit is the next
largest at 106.7 sq mi, consistent with the census land area of about 100 sq mi.
Areas in EPSG:5070 (NAD83 Conus Albers, equal area).
"""
import json, glob, warnings
warnings.filterwarnings('ignore')
from shapely.geometry import shape, Polygon
from shapely.ops import unary_union, transform
from shapely import STRtree
from pyproj import Transformer
U='/mnt/user-data/uploads/STARCITY/gis/fema/'; P='/home/claude/data/gis/parcels2/'
T=Transformer.from_crs('EPSG:4326','EPSG:5070',always_xy=True).transform
ACRE=4046.8564224; SQMI=2589988.110336
p=lambda *a: print(*a, flush=True)

pieces=[]
for f in json.load(open(U+'citylimits.json'))['features']:
    rings=(f.get('geometry') or {}).get('rings') or []
    ps=[Polygon(r) for r in rings if len(r)>=4]
    ps=[x if x.is_valid else x.buffer(0) for x in ps]
    ps=[x for x in ps if not x.is_empty]
    if ps: pieces.append(transform(T,unary_union(ps)))
pieces.sort(key=lambda g:-g.area)
CITY=pieces[1]          # drop the ETJ, keep the corporate limit
p('city boundary: %.1f sq mi (%.0f acres); ETJ dropped was %.1f sq mi'
  %(CITY.area/SQMI, CITY.area/ACRE, pieces[0].area/SQMI))

def gj(path):
    out=[]
    for f in json.load(open(path)).get('features',[]):
        g=f.get('geometry')
        if not g: continue
        s=shape(g)
        if not s.is_valid: s=s.buffer(0)
        if not s.is_empty: out.append((transform(T,s), f.get('properties') or {}))
    return out

p1=gj(U+'pct1.json')
p02=[]; seen=set()
for part in 'abc':
    for g,pr in gj(U+'pct02_%s.json'%part):
        k=(round(g.centroid.x,3),round(g.centroid.y,3),round(g.area,2))
        if k not in seen: seen.add(k); p02.append((g,pr))

def split(items):
    i=[(g,pr) for g,pr in items if CITY.intersects(g)]
    return i
c1=[(g.intersection(CITY),pr) for g,pr in p1 if CITY.intersects(g)]
c1=[(g,pr) for g,pr in c1 if not g.is_empty and g.area>0]
c02=[(g.intersection(CITY),pr) for g,pr in p02 if CITY.intersects(g)]
c02=[(g,pr) for g,pr in c02 if not g.is_empty and g.area>0]
p('1%%: %d polygons clipped to the city, %.0f acres'%(len(c1),sum(g.area for g,_ in c1)/ACRE))
p('0.2%%: %d polygons clipped to the city, %.0f acres'%(len(c02),sum(g.area for g,_ in c02)/ACRE))

zones={}
for g,pr in c1:
    z=(pr.get('FLD_ZONE') or '?').strip(); fw=(pr.get('FLOODWAY') or '').strip()
    k=z+(' / floodway' if fw and fw.lower()!='null' else '')
    a,n=zones.get(k,(0.0,0)); zones[k]=(a+g.area/ACRE,n+1)
p('zones:', {k:(round(v[0]),v[1]) for k,v in sorted(zones.items(),key=lambda x:-x[1][0])})

U1=unary_union([g for g,_ in c1]); U02=unary_union([g for g,_ in c02])
UANY=unary_union([U1,U02])
p('unions: 1%% %.0f ac, 0.2%% %.0f ac, either %.0f ac'%(U1.area/ACRE,U02.area/ACRE,UANY.area/ACRE))

par=[]; vals=[]
for fn in sorted(glob.glob(P+'parcels2_*.json')):
    for f in json.load(open(fn)).get('features',[]):
        g=f.get('geometry')
        if not g: continue
        s=shape(g)
        if not s.is_valid: s=s.buffer(0)
        if s.is_empty: continue
        par.append(transform(T,s)); vals.append(f.get('properties') or {})
p('parcels loaded: %d'%len(par))
tree=STRtree(par)
inCity=set(i for i,g in enumerate(par) if CITY.contains(g.centroid))
TOTP=len(inCity); TOTV=sum(vals[i].get('CNTASSDVAL') or 0 for i in inCity)
p('parcels inside the corporate limit: %d, assessed $%s'%(TOTP,format(TOTV,',')))

def foot(ix):
    "distinct building footprints, since condo units stack many records on one"
    s=set()
    for i in ix:
        c=par[i].centroid; s.add((round(c.x,1),round(c.y,1)))
    return len(s)

res={}
for name,poly in (('1% SFHA',U1),('0.2% band',U02),('either',UANY)):
    cand=[int(i) for i in tree.query(poly,predicate='intersects')]
    over=[];whole=[]
    for i in cand:
        if i not in inCity: continue
        inter=par[i].intersection(poly)
        if inter.is_empty or inter.area<=1.0: continue
        over.append(i)
        if inter.area>=par[i].area*0.999: whole.append(i)
    m=lambda ix: sum(vals[i].get('CNTASSDVAL') or 0 for i in ix)
    res[name]=dict(acres=round(poly.area/ACRE), parcels=len(over), value=m(over),
                   footprints=foot(over), wholly=len(whole), whollyValue=m(whole),
                   pctParcels=round(100*len(over)/TOTP,2), pctValue=round(100*m(over)/TOTV,2))
    p('\n%s  %.0f acres'%(name,poly.area/ACRE))
    p('  overlapping   : %d parcels on %d distinct footprints, $%s'%(len(over),foot(over),format(m(over),',')))
    p('  wholly inside : %d parcels, $%s'%(len(whole),format(m(whole),',')))
    p('  share         : %.2f%% of city parcels, %.2f%% of city assessed value'
      %(100*len(over)/TOTP,100*m(over)/TOTV))
res['_city']=dict(sqmi=round(CITY.area/SQMI,1),parcels=TOTP,assessed=TOTV)
res['_zonesInCity']={k:{'acres':round(v[0]),'polys':v[1]} for k,v in zones.items()}
json.dump(res,open('/home/claude/work/analysis/flood_final.json','w'),indent=1)
p('\nwritten')
