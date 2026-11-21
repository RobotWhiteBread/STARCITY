import json,glob,warnings,collections,statistics as st
warnings.filterwarnings('ignore')
from shapely.geometry import shape,Polygon
from shapely.ops import unary_union,transform
from shapely import STRtree
from pyproj import Transformer
U='/mnt/user-data/uploads/STARCITY/gis/fema/'; P3='/mnt/user-data/uploads/STARCITY/gis/parcels_all/'
T=Transformer.from_crs('EPSG:4326','EPSG:5070',always_xy=True).transform
ACRE=4046.8564224; SQMI=2589988.110336
p=lambda *a: print(*a,flush=True)

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
        if not s.is_empty: out.append((transform(T,s), f.get('properties') or {}))
    return out

c1=[(g.intersection(CITY),pr) for g,pr in gj(U+'pct1.json') if CITY.intersects(g)]
c1=[(g,pr) for g,pr in c1 if not g.is_empty and g.area>0]
U1=unary_union([g for g,_ in c1])
p('1%% union clipped to city: %.0f acres'%(U1.area/ACRE))

# ---------- 1. the minimum flood corridor against the SFHA ----------
COR=gj(U+'corridor.json')
p('corridors: %d, %.0f acres total'%(len(COR),sum(g.area for g,_ in COR)/ACRE))
FULL=unary_union([g for g,_ in gj(U+'pct1.json')])     # whole county layer, not clipped
outN=outA=inN=inA=0; byws=collections.Counter()
for g,pr in COR:
    a=g.area/ACRE
    if g.intersects(FULL): inN+=1; inA+=a
    else:
        outN+=1; outA+=a; byws[(pr.get('Watershed') or '?')]+=a
p('\n=== corridor vs the 1%% floodplain (whole published layer) ===')
p('entirely outside the floodplain : %d corridors, %.0f acres'%(outN,outA))
p('touching or inside              : %d corridors, %.0f acres'%(inN,inA))
p('top watersheds outside: %s'%', '.join('%s %.0f ac'%(k,v) for k,v in byws.most_common(4)))
corCity=[(g,pr) for g,pr in COR if CITY.intersects(g)]
p('corridors intersecting the city limits: %d'%len(corCity))

# ---------- 2. pre-FIRM residential stock in the floodplain ----------
par=[];vals=[]
for fn in sorted(glob.glob(P3+'parcels_all_*.json')):
    for f in json.load(open(fn)).get('features',[]):
        g=f.get('geometry')
        if not g: continue
        s=shape(g)
        if not s.is_valid: s=s.buffer(0)
        if s.is_empty: continue
        par.append(transform(T,s)); vals.append(f.get('properties') or {})
p('\nparcels3 loaded: %d'%len(par))
tree=STRtree(par)
cand=[int(i) for i in tree.query(U1,predicate='intersects')]
over=[]
for i in cand:
    it=par[i].intersection(U1)
    if not it.is_empty and it.area>1.0: over.append(i)
p('parcels overlapping the 1%% floodplain: %d'%len(over))
yb=[(i,vals[i].get('RESYRBLT')) for i in over]
withyr=[(i,y) for i,y in yb if isinstance(y,(int,float)) and 1800<y<2030]
p('of those, carrying a residential year built: %d'%len(withyr))
pre=[(i,y) for i,y in withyr if y<1971]
post=[(i,y) for i,y in withyr if y>=1971]
p('\n=== pre-FIRM residential stock in the 1%% floodplain ===')
p('initial FIRM 27 April 1971')
p('pre-FIRM  : %d  (%.1f%%)'%(len(pre),100*len(pre)/len(withyr)))
p('post-FIRM : %d  (%.1f%%)'%(len(post),100*len(post)/len(withyr)))
ys=[y for _,y in withyr]
p('median year built: %d'%st.median(ys))
rd=collections.Counter(y for y in ys if y%10==0)
p('round decade years: %d of %d (%.1f%%)'%(sum(rd.values()),len(ys),100*sum(rd.values())/len(ys)))
p('most common single years: %s'%collections.Counter(ys).most_common(5))
m=lambda ix: sum(vals[i].get('CNTASSDVAL') or 0 for i in ix)
p('pre-FIRM assessed value : $%s'%format(m([i for i,_ in pre]),','))
p('post-FIRM assessed value: $%s'%format(m([i for i,_ in post]),','))
noyr=len(over)-len(withyr)
p('parcels with no year on record: %d (%.1f%% of floodplain parcels)'%(noyr,100*noyr/len(over)))
json.dump({'corOut':outN,'corOutAcres':round(outA),'corIn':inN,'corInAcres':round(inA),
  'corTotal':len(COR),'corTotalAcres':round(sum(g.area for g,_ in COR)/ACRE),
  'preFIRM':len(pre),'postFIRM':len(post),'withYear':len(withyr),
  'preShare':round(100*len(pre)/len(withyr),1),'medianYear':int(st.median(ys)),
  'roundDecadeShare':round(100*sum(rd.values())/len(ys),1),'noYear':noyr,
  'floodParcels':len(over)},open('/home/claude/work/analysis/cw/finish.json','w'),indent=1)
p('\nwritten')
