"""Everything the report derives from the parcel join, recomputed."""
import json, glob, warnings, collections
warnings.filterwarnings('ignore')
from shapely.geometry import shape, Polygon
from shapely.ops import unary_union, transform
from shapely import STRtree
from pyproj import Transformer
U='/mnt/user-data/uploads/STARCITY/gis/fema/'; P='/mnt/user-data/uploads/STARCITY/gis/parcels_all/'
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
pieces.sort(key=lambda g:-g.area); CITY=pieces[1]

def gj(path):
    out=[]
    for f in json.load(open(path)).get('features',[]):
        g=f.get('geometry')
        if not g: continue
        s=shape(g)
        if not s.is_valid: s=s.buffer(0)
        if not s.is_empty: out.append(transform(T,s))
    return out
c1=[g.intersection(CITY) for g in gj(U+'pct1.json') if CITY.intersects(g)]
c1=[g for g in c1 if not g.is_empty and g.area>0]
seen=set(); c02=[]
for part in 'abc':
    for g in gj(U+'pct02_%s.json'%part):
        k=(round(g.centroid.x,3),round(g.centroid.y,3),round(g.area,2))
        if k in seen: continue
        seen.add(k)
        if CITY.intersects(g):
            h=g.intersection(CITY)
            if not h.is_empty and h.area>0: c02.append(h)
U1=unary_union(c1); U02=unary_union(c02); UANY=unary_union([U1,U02])
A1,A02,AANY=U1.area/ACRE,U02.area/ACRE,UANY.area/ACRE

par=[]; vals=[]
for fn in sorted(glob.glob(P+'parcels_all_*.json')):
    for f in json.load(open(fn)).get('features',[]):
        g=f.get('geometry')
        if not g: continue
        s=shape(g)
        if not s.is_valid: s=s.buffer(0)
        if s.is_empty: continue
        par.append(transform(T,s)); vals.append(f.get('properties') or {})
tree=STRtree(par)
inCity=set(i for i,g in enumerate(par) if CITY.contains(g.centroid))
TOTP=len(inCity); TOTV=sum(vals[i].get('CNTASSDVAL') or 0 for i in inCity)

def sel(poly):
    over=[];whole=[]
    for i in [int(x) for x in tree.query(poly,predicate='intersects')]:
        if i not in inCity: continue
        it=par[i].intersection(poly)
        if it.is_empty or it.area<=1.0: continue
        over.append(i)
        if it.area>=par[i].area*0.999: whole.append(i)
    return over,whole
o1,w1=sel(U1); o02,w02=sel(U02); oA,wA=sel(UANY)
m=lambda ix: sum(vals[i].get('CNTASSDVAL') or 0 for i in ix)
pac=lambda ix: sum(par[i].area for i in ix)/ACRE

p('CITY %.1f sq mi | parcels %d | assessed $%s'%(CITY.area/SQMI,TOTP,format(TOTV,',')))
p('acres: 1%% %.0f | 0.2%% %.0f | either %.0f'%(A1,A02,AANY))
p('\n--- value density, the table the report builds on')
for nm,ac,o,w in (('1% SFHA',A1,o1,w1),('0.2% band',A02,o02,w02)):
    p('%-10s acres %7.0f | touching %5d $%15s | wholly %5d $%15s'%(nm,ac,len(o),format(m(o),','),len(w),format(m(w),',')))
    p('%-10s  upper bound $%s/acre   lower bound $%s/acre   wholly share %.1f%%'
      %('',format(round(m(o)/ac),','),format(round(m(w)/ac),','),100*len(w)/len(o)))
r_up=(m(o02)/A02)/(m(o1)/A1); r_lo=(m(w02)/A02)/(m(w1)/A1)
p('ratio 0.2%% to 1%%: upper %.2fx  lower %.2fx'%(r_up,r_lo))
p('land ratio: 1%% is %.1fx the 0.2%% acreage'%(A1/A02))

p('\n--- combined footprint')
both=len(set(o1)&set(o02))
p('overlap parcels %d | distinct %d (%.2f%% of city) | value $%s (%.2f%%)'
  %(both,len(oA),100*len(oA)/TOTP,format(m(oA),','),100*m(oA)/TOTV))
p('wholly inside either: %d, $%s'%(len(wA),format(m(wA),',')))

p('\n--- land use inside the 1%% floodplain (parcels touching)')
cls=collections.Counter(); clsA=collections.Counter(); clsV=collections.Counter()
use=collections.Counter(); useA=collections.Counter(); useV=collections.Counter()
for i in o1:
    v=vals[i]; a=par[i].area/ACRE; val=v.get('CNTASSDVAL') or 0
    c=(v.get('CLASSDSCRP') or 'None on record').strip()
    u=(v.get('USEDSCRP') or 'None on record').strip()
    cls[c]+=1; clsA[c]+=a; clsV[c]+=val
    use[u]+=1; useA[u]+=a; useV[u]+=val
TA=sum(clsA.values()); TV=sum(clsV.values())
p('total parcel acreage touching: %.0f | assessed $%s'%(TA,format(TV,',')))
p('%-26s %6s %10s %8s %8s'%('class','n','acres','%acres','%value'))
for c,_ in clsA.most_common(8):
    p('%-26s %6d %10.0f %7.1f%% %7.1f%% $%d'%(c[:26],cls[c],clsA[c],100*clsA[c]/TA,100*clsV[c]/TV,clsV[c]))
p('\ntop uses by acreage:')
for u,_ in useA.most_common(10):
    p('  %-34s %5d parcels %9.0f ac  %6.1f%% ac  %6.1f%% val'%(u[:34],use[u],useA[u],100*useA[u]/TA,100*useV[u]/TV))
OPEN={'Agricultural','Agriculture'}
openac=sum(clsA[c] for c in clsA if c.startswith('Ag')) 
p('\nagricultural class: %.0f acres (%.1f%%), $%s (%.1f%%)'
  %(openac,100*openac/TA,format(sum(clsV[c] for c in clsV if c.startswith('Ag')),','),
    100*sum(clsV[c] for c in clsV if c.startswith('Ag'))/TV))
json.dump({'A1':A1,'A02':A02,'AANY':AANY,'TOTP':TOTP,'TOTV':TOTV,
 'o1':len(o1),'v1':m(o1),'w1':len(w1),'wv1':m(w1),
 'o02':len(o02),'v02':m(o02),'w02':len(w02),'wv02':m(w02),
 'oA':len(oA),'vA':m(oA),'wA':len(wA),'wvA':m(wA),'both':both,
 'parcelAcres1':TA,'ratio_up':r_up,'ratio_lo':r_lo},
 open('/home/claude/work/analysis/cw/derived.json','w'),indent=1)
p('\nwritten')
