import pickle,json,collections,statistics as st,datetime,glob,warnings
warnings.filterwarnings('ignore')
from shapely.geometry import shape,Point
from shapely.ops import transform
from shapely import STRtree
import pyproj
tr=pyproj.Transformer.from_crs(4326,5070,always_xy=True).transform
R=pickle.load(open('city.pkl','rb'));P,S,T=pickle.load(open('all.pkl','rb'))
C=collections.Counter;D=collections.defaultdict
hj=json.load(open(glob.glob('/home/claude/data/gis/hoods/*.json')[0]))['features']
H=[];
for f in hj:
    g=f.get('geometry')
    a=f.get('attributes',f.get('properties'))
    try:
        G=shape(g) if 'type' in g else None
    except Exception: G=None
    if G is None:
        from shapely.geometry import Polygon
        from shapely.ops import unary_union
        G=unary_union([Polygon(r) for r in g['rings'] if len(r)>=4])
    G=transform(tr,G);G=G if G.is_valid else G.buffer(0);H.append((a['NAME'],G))
print('hoods',len(H),'area sqmi',sum(g.area for n,g in H)/2589988)
tree=STRtree([g for n,g in H])
def hood(x,y):
    p=Point(x,y)
    for i in tree.query(p):
        if H[i][1].contains(p): return H[i][0]
    return None
byid={r['id']:r for r in R}
for r in R: r['hood']=hood(r['x'],r['y'])
inh=[r for r in R if r['hood']];print('parcels in a hood',len(inh),round(100*len(inh)/len(R),1),'value share',round(100*sum(r['v'] for r in inh)/sum(r['v'] for r in R),1))
print('\n== hood tax base (res improved median, total, v/ac)')
rows=[]
for n,g in H:
    q=[r for r in R if r['hood']==n]
    if len(q)<50: continue
    ri=[r['v'] for r in q if r['cls']=='Residential Improved' and not r['hr']]
    rows.append((n,len(q),sum(r['v'] for r in q),sum(r['ac'] for r in q),st.median(ri) if len(ri)>=20 else None,len(ri)))
for x in sorted(rows,key=lambda x:-(x[2]/x[3])):print(f"{x[0][:34]:34s} n={x[1]:5d} total={x[2]/1e6:8.1f}M v/ac={x[2]/x[3]:>11,.0f} medhome={x[4] and format(x[4],',.0f')} homes={x[5]}")
pickle.dump(R,open('city2.pkl','wb'))
# SALES
print('\n== SALES')
res=[s for s in S if s['PropType']=='Res' and s['SalePrice'] and s['SalePrice']>0]
pr=[s['SalePrice'] for s in res];print('n',len(res),'median',st.median(pr),'mean',round(st.mean(pr)),'total',sum(pr),'p10',sorted(pr)[len(pr)//10],'p25',sorted(pr)[len(pr)//4],'p75',sorted(pr)[3*len(pr)//4],'p90',sorted(pr)[9*len(pr)//10])
sf=[s['SalePriceSF'] for s in res if s['SalePriceSF']];print('median $/sf',st.median(sf),len(sf))
print('bands',[(lo,sum(1 for p in pr if lo<=p<hi),round(100*sum(1 for p in pr if lo<=p<hi)/len(pr),1)) for lo,hi in [(0,150e3),(150e3,200e3),(200e3,250e3),(250e3,300e3),(300e3,400e3),(400e3,500e3),(500e3,750e3),(750e3,1e9)]])
dt=lambda s:datetime.datetime.utcfromtimestamp(s['SaleDate']/1000)
m=D(list)
for s in res:m[(dt(s).year,dt(s).month)].append(s)
for k in sorted(m):print(k,len(m[k]),st.median([s['SalePrice'] for s in m[k]]),round(st.median([s['SalePriceSF'] for s in m[k] if s['SalePriceSF']]),1))
print('-- type')
t=D(list)
for s in res:t[s['ResStructureType']].append(s)
for k,v in sorted(t.items(),key=lambda kv:-len(kv[1])):
    if len(v)>=20:print(k,len(v),st.median([s['SalePrice'] for s in v]),round(st.median([s['SalePriceSF'] for s in v if s['SalePriceSF']] or [0]),1),st.median([s['ResFlrArea'] for s in v if s['ResFlrArea']] or [0]),st.median([s['ResYrBlt'] for s in v if s['ResYrBlt']] or [0]))
print('-- decade')
d=D(list)
for s in res:
    y=s['ResYrBlt']
    if y and y>1800:d[min(2020,max(1890,y//10*10)) if y>=1900 else 1890].append(s)
for k in sorted(d):v=d[k];print(k,len(v),st.median([s['SalePrice'] for s in v]),round(st.median([s['SalePriceSF'] for s in v if s['SalePriceSF']]),1),st.median([s['ResFlrArea'] for s in v if s['ResFlrArea']]),round(st.median([s['AssdValue']/s['SalePrice'] for s in v if s['AssdValue']]),3))
new=[s for s in res if s['ResYrBlt'] and s['ResYrBlt']>=2025];print('new 2025+',len(new),st.median([s['SalePrice'] for s in new]) if new else None)
print('-- size')
z=sorted([s for s in res if s['ResFlrArea']],key=lambda s:s['ResFlrArea'])
for k in range(5):b=z[k*len(z)//5:(k+1)*len(z)//5];print(b[0]['ResFlrArea'],b[-1]['ResFlrArea'],st.median([s['SalePrice'] for s in b]),round(st.median([s['SalePriceSF'] for s in b if s['SalePriceSF']]),1))
print('-- hood sales')
hs=D(list);miss=0;out=0
for s in res:
    r=byid.get(s['PID'])
    if not r: miss+=1;continue
    if r['hood']:hs[r['hood']].append(s)
    else: out+=1
print('unmatched pid',miss,'no hood',out)
for k,v in sorted(hs.items(),key=lambda kv:-st.median([s['SalePrice'] for s in kv[1]])):
    if len(v)>=15:print(f"{k[:34]:34s} n={len(v):4d} med={st.median([s['SalePrice'] for s in v]):>9,.0f} $/sf={st.median([s['SalePriceSF'] for s in v if s['SalePriceSF']]):6.1f} yr={st.median([s['ResYrBlt'] for s in v if s['ResYrBlt']]):.0f} ratio={st.median([s['AssdValue']/s['SalePrice'] for s in v if s['AssdValue']]):.3f}")
# turnover: sales / res improved parcels in city
ri=sum(1 for r in R if r['cls']=='Residential Improved');inc=sum(1 for s in res if s['PID'] in byid)
print('res improved parcels',ri,'sales in city',inc,round(100*inc/ri,2))
# sale vs assessed gap dollars
gap=[s['SalePrice']-s['AssdValue'] for s in res if s['AssdValue']];print('median gap',st.median(gap),'share sold above assessed',round(100*sum(1 for g in gap if g>0)/len(gap),1))
com=[s for s in S if s['PropType']=='Com'];print('com',len(com),st.median([s['SalePrice'] for s in com]),sum(s['SalePrice'] for s in com))
