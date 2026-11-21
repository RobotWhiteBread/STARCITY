import pickle,json,collections,statistics as st,datetime,glob,re,warnings
warnings.filterwarnings('ignore')
from shapely.geometry import shape,Point,Polygon
from shapely.ops import transform,unary_union
from shapely import STRtree
import pyproj
tr=pyproj.Transformer.from_crs(4326,5070,always_xy=True).transform
R=pickle.load(open('city.pkl','rb'));P,_,T=pickle.load(open('all.pkl','rb'));S=[s for s in pickle.load(open('sales.pkl','rb')) if s['in']]
D=collections.defaultdict;C=collections.Counter;OUT='/home/claude/starcity/tools/'
hj=json.load(open(glob.glob('/home/claude/data/gis/hoods/*.json')[0]))['features'];H=[]
for f in hj:
    g=f['geometry'];a=f.get('attributes',f.get('properties'))
    G=shape(g) if 'type' in g else unary_union([Polygon(r) for r in g['rings'] if len(r)>=4])
    G=transform(tr,G);H.append((a['NAME'],G if G.is_valid else G.buffer(0)))
tree=STRtree([g for n,g in H])
def hood(x,y):
    p=Point(x,y)
    for i in tree.query(p):
        if H[i][1].contains(p):return H[i][0]
for r in R:r['hood']=hood(r['x'],r['y'])
byid={r['id']:r for r in R}
N=len(R);TV=sum(r['v'] for r in R);TA=sum(r['ac'] for r in R)
B=lambda v:f"${v/1e9:.2f} billion";M=lambda v:f"${v/1e6:,.0f} million";pc=lambda a,b:f"{100*a/b:.1f}%"
FOOT="""
---

**The STARCITY papers.** [Floodplain exposure and flood loss](floodplain.html) · [Who Lincoln over-assesses](assessment.html) · [Where Lincoln's property value lives](taxbase.html) · [What sold in Lincoln](sales.html) · [Lincoln's TIF districts by the numbers](tif.html) · [The map](index.html)
"""
# ===== TAX BASE
def cls(names):
    q=[r for r in R if r['cls'] in names];return len(q),sum(r['v'] for r in q),sum(r['ac'] for r in q),q
ri=cls(['Residential Improved']);ci=cls(['Commercial Improved','Commercial IOLL']);cu=cls(['Commercial Unimproved']);ru=cls(['Residential Unimproved']);ag=cls(['Ag Improved','Ag Unimproved']);un=cls(['Unclassified'])
assert ri[0]+ci[0]+cu[0]+ru[0]+ag[0]+un[0]==N
def crow(lab,c):
    n,v,a,_=c
    return f"| {lab} | {n:,} | {B(v) if v else 'none'} | {pc(v,TV) if v else 'none'} | {a:,.0f} | {pc(a,TA)} | {('$%.2f million'%(v/a/1e6) if v/a>=1e6 else '$%s'%format(round(v/a,-3),',.0f')) if v else 'none'} |"
ctab="\n".join(crow(l,c) for l,c in [('Residential, improved',ri),('Commercial, improved',ci),('Commercial, unimproved',cu),('Residential, unimproved',ru),('Agricultural',ag),('Unclassified',un)])
unimp_ac=cu[2]+ru[2];unimp_v=cu[1]+ru[1]
medri=st.median([r['v'] for r in ri[3]]);medci=st.median([r['v'] for r in ci[3]])
vs=sorted(R,key=lambda r:-r['v']);cum=lambda k:sum(r['v'] for r in vs[:k])
k1=int(N*.01);k5=int(N*.05);k10=int(N*.1)
half=0;i=0
while half<TV/2:half+=vs[i]['v'];i+=1
halfn=i
top10=vs[:10];assert all(r['cls'].startswith('Commercial') for r in top10)
t10nb=C(r['nb'] for r in top10);print('top10',[(r['nb'],round(r['ac'],1),r['v']) for r in top10])
q=sorted([r for r in R if r['v']>0 and r['ac']>0.01],key=lambda r:-r['v']/r['ac']);ta=sum(r['ac'] for r in q)
marks=[.01,.05,.10,.25,.5];band={};ca=cv=0;mi=0
for r in q:
    ca+=r['ac'];cv+=r['v']
    while mi<len(marks) and ca>=marks[mi]*ta:band[marks[mi]]=(cv/TV,r['v']/r['ac']);mi+=1
g=D(lambda:[0,0.0,0])
for r in R:
    m=g[(int(r['x']//800),int(r['y']//800))];m[0]+=r['v'];m[1]+=r['ac'];m[2]+=1
cells=sorted([(m[0]/m[1],k,m) for k,m in g.items() if m[1]>60],reverse=True)
inv=pyproj.Transformer.from_crs(5070,4326,always_xy=True).transform
print('top cell',inv(cells[0][1][0]*800+400,cells[0][1][1]*800+400),cells[0][2])
topc=cells[0];medcell=st.median([c[0] for c in cells]);t10c=(sum(c[2][0] for c in cells[:10])/TV,sum(c[2][1] for c in cells[:10])/TA)
cm=D(lambda:[0,0,0.0])
for r in R:
    if r['cls'].startswith('Commercial'):
        m=cm[r['nb']];m[0]+=1;m[1]+=r['v'];m[2]+=r['ac']
NAMES={'DTCOM':'Downtown (DTCOM)','HYCOM':'Haymarket (HYCOM)','ECCOM':'East central (ECCOM)','SCCOM':'South central (SCCOM)','NECOM':'Northeast (NECOM)','SECOM':'Southeast (SECOM)','CNCOM':'Central (CNCOM)','NCCOM':'North central (NCCOM)','WCCOM':'West central (WCCOM)','SWCOM':'Southwest (SWCOM)','NWCOM':'Northwest (NWCOM)'}
crows=sorted([(k,m) for k,m in cm.items() if m[1]>=150e6 or k in('HHCOM',)],key=lambda km:-km[1][1]/max(km[1][2],.1))
print('com districts',[(k,m[0],round(m[1]/1e6),round(m[2])) for k,m in sorted(cm.items(),key=lambda km:-km[1][1])[:20]])
comtab="\n".join(f"| {NAMES.get(k,k)} | {m[0]:,} | {M(m[1])} | {m[2]:,.0f} | ${m[1]/m[2]/1e6:.2f} million |" for k,m in crows)
dt=cm['DTCOM'];hy=cm['HYCOM'];ec=cm['ECCOM']
big=[m[1]/m[2]/1e6 for k,m in cm.items() if k in('ECCOM','SCCOM','SECOM')]
rs=sorted([r for r in ri[3] if r['v']>0 and r['ac']>0.01 and not r['hr']],key=lambda r:r['ac']);Q=[]
for k in range(5):
    b=rs[k*len(rs)//5:(k+1)*len(rs)//5];Q.append((b[0]['ac'],b[-1]['ac'],st.median([r['v'] for r in b]),sum(r['v'] for r in b),sum(r['ac'] for r in b)))
lab=['Smallest fifth','Second','Middle','Fourth','Largest fifth']
ltab="\n".join(f"| {lab[k]} | {('under %.2f acre'%Q[k][1]) if k==0 else ('over %.2f acre'%Q[k][0]) if k==4 else '%.2f to %.2f'%(Q[k][0],Q[k][1])} | ${Q[k][2]:,.0f} | {B(Q[k][3])} | {Q[k][4]:,.0f} | ${Q[k][3]/Q[k][4]/1e6:.2f} million |" for k in range(5))
hrows=[];comh=[]
for n in sorted(set(r['hood'] for r in R if r['hood'])):
    qq=[r for r in R if r['hood']==n];hh=[r['v'] for r in qq if r['cls']=='Residential Improved' and not r['hr']]
    tv=sum(r['v'] for r in qq);vpa=tv/sum(r['ac'] for r in qq)
    if len(hh)>=20:hrows.append((n,len(hh),st.median(hh),tv,vpa))
    elif len(qq)>=50:comh.append((n,vpa,tv))
hrows.sort(key=lambda x:-x[2]);print('nonres hoods',comh)
inh=sum(1 for r in R if r['hood'])
ht="| Neighborhood association | Homes | Median home value | All assessed value | Value per acre |\n|---|---|---|---|---|\n"+"\n".join(f"| {n} | {h:,} | ${m:,.0f} | {M(t)} | ${v/1e6:.2f} million |" for n,h,m,t,v in hrows)
core=[x for x in hrows if x[0] in('Everett','Near South','Malone','Irvingdale')];print('core',core)
zero=[r for r in R if r['v']==0]
rate=0.01766448
tb=f"""# Where Lincoln's Property Value Lives

## Summary

Lincoln's 2026 assessment roll puts **${TV/1e9:.1f} billion** of value on **{N:,} parcels** inside the city limits. This paper asks a plain question of that roll: where is the value, and how much land does it take to hold it?

1. **Houses carry the roll.** Improved residential parcels are {pc(ri[0],N)} of the parcels and **{pc(ri[1],TV)} of the value**, {B(ri[1])}. Improved commercial property is {pc(ci[0],N)} of the parcels and {pc(ci[1],TV)} of the value.
2. **Value is concentrated.** The 100 most valuable parcels hold {pc(cum(100),TV)} of all assessed value. The top 1% of parcels ({k1:,}) hold {pc(cum(k1),TV)}. Half the city's value sits on {pc(halfn,N)} of its parcels.
3. **A tenth of the land holds {100*band[.10][0]:.0f}% of the value.** Rank every acre by the value on it, and the top 10% of parcel land holds {100*band[.10][0]:.1f}% of the city's assessed value. The bottom half holds {100*(1-band[.5][0]):.1f}%.
4. **Downtown is in a class of its own.** The assessor's downtown commercial district is assessed at **${dt[1]/dt[2]/1e6:.1f} million an acre**. The large commercial districts on the east and south sides run ${min(big):.2f} to ${max(big):.2f} million an acre.
5. **Small lots out-produce large ones.** The fifth of houses on the smallest lots are assessed at ${Q[0][3]/Q[0][4]/1e6:.1f} million an acre. The fifth on the largest lots are assessed at ${Q[4][3]/Q[4][4]/1e6:.1f} million an acre.

Every figure comes from the Lancaster County Assessor's published parcel layer, measured inside Lincoln's corporate limit.

## The roll by class

| Class | Parcels | Assessed value | Share of value | Parcel acres | Share of land | Value per acre |
|---|---|---|---|---|---|---|
{ctab}

**{100*unimp_ac/TA:.0f}% of the parcel land inside the city limits is classed unimproved**, {unimp_ac:,.0f} acres, carrying {pc(unimp_v,TV)} of the value. Some of that is floodplain, some is held for development, some is airport and other public land, and some is parking and yards attached to a business next door.

The median improved residential parcel is assessed at **${medri:,.0f}**. The median improved commercial parcel is assessed at ${medci:,.0f}.

## How concentrated the value is

| Group of parcels | Assessed value | Share of the city |
|---|---|---|
| Top 10 | {B(cum(10))} | {pc(cum(10),TV)} |
| Top 100 | {B(cum(100))} | {pc(cum(100),TV)} |
| Top 1% ({k1:,}) | {B(cum(k1))} | {pc(cum(k1),TV)} |
| Top 5% ({k5:,}) | {B(cum(k5))} | {pc(cum(k5),TV)} |
| Top 10% ({k10:,}) | {B(cum(k10))} | {pc(cum(k10),TV)} |

All ten of the most valuable parcels are commercial property.

## Value per acre

Total value tells you who is big. Value per acre tells you which land is working hardest, and it is the number that matters to a city budget, because streets, pipes and fire coverage are paid for by the acre and the mile.

| Share of parcel land, ranked by value per acre | Share of assessed value held | Value per acre at the cutoff |
|---|---|---|
| Top 1% | {100*band[.01][0]:.1f}% | ${band[.01][1]/1e6:.1f} million |
| Top 5% | {100*band[.05][0]:.1f}% | ${band[.05][1]/1e6:.1f} million |
| Top 10% | {100*band[.10][0]:.1f}% | ${band[.10][1]/1e6:.1f} million |
| Top 25% | {100*band[.25][0]:.1f}% | ${band[.25][1]/1e6:.1f} million |
| Top 50% | {100*band[.5][0]:.1f}% | ${band[.5][1]/1e6:.2f} million |

Laid on an 800 metre grid, the most valuable cell in the city is the heart of downtown: **{M(topc[2][0])} on {topc[2][1]:,.0f} parcel acres, ${topc[0]/1e6:.1f} million an acre**. The median cell is assessed at ${medcell/1e6:.2f} million an acre. The ten most valuable cells hold {100*t10c[0]:.1f}% of the city's value on {100*t10c[1]:.1f}% of its parcel land.

### Commercial districts

The assessor groups commercial property into districts. The larger ones, ranked by value per acre:

| Assessor's commercial district | Parcels | Assessed value | Acres | Value per acre |
|---|---|---|---|---|
{comtab}

Downtown and the Haymarket together hold {B(dt[1]+hy[1])} on {dt[2]+hy[2]:,.0f} acres. The east central district holds more in total, {B(ec[1])}, and needs {ec[2]:,.0f} acres to do it. The district names in plain words are read from the assessor's codes. Codes the layer does not spell out are left as published.

### Houses by lot size

Sorting the city's improved residential parcels by lot size and cutting them into five equal groups:

| Lot size group | Lot size | Median value | Total value | Acres used | Value per acre |
|---|---|---|---|---|---|
{ltab}

The houses on the largest lots are worth the most each, and their land is worth the least per acre. The largest-lot fifth uses {Q[4][4]/Q[0][4]:.1f} times the land of the smallest-lot fifth to hold {Q[4][3]/Q[0][3]:.1f} times the value. The smallest group includes townhomes and attached units on very small parcels, which is part of why its figure is so high.

## By neighborhood

Lincoln's 58 neighborhood associations cover about half the city's land, mostly the older core and the established subdivisions, and {pc(inh,N)} of its parcels. The table lists every association with at least 20 single-family homes, ranked by median home value. Value per acre counts every parcel inside the association boundary, commercial included.

{ht}

## What a median home pays

The county's own TIF layer records a consolidated levy of **$1.766448 per $100** of value for the Lincoln tax district in tax year 2024. Applied to the 2026 median improved residential value of ${medri:,.0f}, that is about **${round(medri*rate,-1):,.0f} a year** before the homestead exemption and state property tax credits. The 2026 levy will differ. This is a yardstick, not a bill.

## What these numbers are not

- **Not the taxable base.** The layer publishes assessed value and leaves taxable value blank. Some high-value parcels are exempt from tax, such as hospitals, churches and public property that carries an assessment. This paper measures where value sits, not who pays.
- **Not the whole city by area.** Parcels inside the corporate limit total {TA:,.0f} acres. The city covers 68,296. The rest is streets, water and public land that is not on the roll as parcels.
- **Not a statement about any owner.** No owner names were used or stored. Parcels are described by class, district and size only.
- **Not a judgment about how anyone should live.** Value per acre measures what land contributes to the roll. It says nothing about whether a large yard is worth having.
- **{len(zero):,} parcels carry no assessed value.** They cover {sum(r['ac'] for r in zero):,.0f} acres and are counted in land totals.

## What to do with it

**If you are a realtor or appraiser.** The neighborhood table is a quick reference for where a listing sits against its association's median, and the commercial table gives a value per acre benchmark for each district.

**If you are on the council or the planning commission.** Value per acre is the missing column in most annexation and rezoning discussions. New land at the city's edge has to support the same lane-miles and pipe as older land, and the lot-size table shows how much less value per acre large lots carry.

**If you are a resident.** Your neighborhood's line in the table shows what the ground under it contributes.

## Method

Parcels are the Lancaster County Assessor's published layer with 2026 assessed values (field CNTASSDVAL), all {len(P):,} parcels in the county, pulled November 21, 2026. A parcel is counted as in Lincoln when a point inside it falls within the corporate limit (106.7 square miles; the larger extraterritorial jurisdiction polygon in the same layer is excluded). Areas are computed in an equal-area projection (EPSG:5070), not from a published area field. Neighborhood associations are the city's published boundaries. The scripts are in the project repository under tools/analysis.
{FOOT}"""
open(OUT+'taxbase.md','w').write(tb)
pickle.dump(dict(N=N,TV=TV,medri=medri),open('tb.pkl','wb'))
# ===== SALES
res=[s for s in S if s['PropType']=='Res' and s['SalePrice']]
pr=sorted(s['SalePrice'] for s in res);n=len(res);med=lambda v,k:st.median([s[k] for s in v if s[k]])
dts=lambda s:datetime.datetime.utcfromtimestamp(s['SaleDate']/1000)
d0=min(dts(s) for s in S);d1=max(dts(s) for s in S)
bands=[(0,150e3,'Under $150,000'),(150e3,200e3,'$150,000 to $199,999'),(200e3,250e3,'$200,000 to $249,999'),(250e3,300e3,'$250,000 to $299,999'),(300e3,400e3,'$300,000 to $399,999'),(400e3,500e3,'$400,000 to $499,999'),(500e3,750e3,'$500,000 to $749,999'),(750e3,1e12,'$750,000 and over')]
bt="\n".join(f"| {l} | {sum(1 for p in pr if lo<=p<hi):,} | {pc(sum(1 for p in pr if lo<=p<hi),n)} |" for lo,hi,l in bands)
u200=sum(1 for p in pr if p<200e3);o500=sum(1 for p in pr if p>=500e3)
m=D(list)
for s in res:m[(dts(s).year,dts(s).month)].append(s)
MN=['','January','February','March','April','May','June','July','August','September','October','November','December']
full=[k for k in sorted(m) if (k!=(d0.year,d0.month)) and k<(2026,10)]
mt="\n".join(f"| {MN[k[1]]}{' '+str(k[0]) if k[1] in(12,1) else ''} | {len(m[k])} | ${st.median([s['SalePrice'] for s in m[k]]):,.0f} | ${med(m[k],'SalePriceSF'):.0f} |" for k in full)
part=[k for k in sorted(m) if k not in full];print('partial months',[(k,len(m[k])) for k in part])
t=D(list)
for s in res:t[s['ResStructureType']].append(s)
TN={'1 Story':'One story','1 Story TH End Unit':'One story townhome, end unit','2 Story':'Two story','1 1/2 Story':'One and a half story','Split Foyer':'Split foyer','Bungalow':'Bungalow','Multi Level':'Multi level','2 Story TH End Unit':'Two story townhome, end unit','High Rise Condominium':'High rise condominium'}
trs=sorted([(k,v) for k,v in t.items() if k in TN and len(v)>=60],key=lambda kv:-len(kv[1]))
tt="\n".join(f"| {TN[k]} | {len(v):,} | ${med(v,'SalePrice'):,.0f} | ${med(v,'SalePriceSF'):.0f} | {med(v,'ResFlrArea'):,.0f} | {med(v,'ResYrBlt'):.0f} |" for k,v in trs)
print('types',[(k,len(v)) for k,v in sorted(t.items(),key=lambda kv:-len(kv[1]))[:12]])
th=t['1 Story TH End Unit']
dd=D(list)
for s in res:
    y=s['ResYrBlt']
    if y and y>=1900:dd[min(2020,y//10*10)].append(s)
dtab="\n".join(f"| {k}s | {len(dd[k])} | ${med(dd[k],'SalePrice'):,.0f} | ${med(dd[k],'SalePriceSF'):.0f} | {med(dd[k],'ResFlrArea'):,.0f} |" for k in sorted(dd))
pre60=[s for k in dd if k<1960 for s in dd[k]];p60m=[med(dd[k],'SalePrice') for k in dd if k<1960]
new=[s for s in res if s['ResYrBlt'] and s['ResYrBlt']>=2025]
z=sorted([s for s in res if s['ResFlrArea']],key=lambda s:s['ResFlrArea']);ZQ=[]
for k in range(5):
    b=z[k*len(z)//5:(k+1)*len(z)//5];ZQ.append((b[0]['ResFlrArea'],b[-1]['ResFlrArea'],med(b,'SalePrice'),med(b,'SalePriceSF')))
zt="\n".join(f"| {('Up to %s'%format(ZQ[k][1],',')) if k==0 else ('Over %s'%format(ZQ[k][0],',')) if k==4 else '%s to %s'%(format(ZQ[k][0],','),format(ZQ[k][1],','))} | ${ZQ[k][2]:,.0f} | ${ZQ[k][3]:.0f} |" for k in range(5))
hs=D(list);nohood=0;nomatch=0
for s in res:
    r=byid.get(s['PID'])
    if not r:
        h=hood(s['x'],s['y'])
        nomatch+=1
    else:h=r['hood']
    if h:hs[h].append(s)
    else:nohood+=1
srows=sorted([(k,len(v),med(v,'SalePrice'),med(v,'SalePriceSF'),med(v,'ResYrBlt')) for k,v in hs.items() if len(v)>=20],key=lambda x:-x[2])
stt="| Neighborhood association | Sales | Median price | Median per sq ft | Median year built |\n|---|---|---|---|---|\n"+"\n".join(f"| {k} | {nn} | ${mm:,.0f} | ${f:.0f} | {y:.0f} |" for k,nn,mm,f,y in srows)
low=min(srows,key=lambda x:x[3]);hi=max(srows,key=lambda x:x[3]);print('low/high psf',low,hi)
nri=ri[0];gap=[s['SalePrice']-s['AssdValue'] for s in res if s['AssdValue']]
sfq=[ZQ[k][3] for k in range(4)]
winter=min(med(m[k],'SalePriceSF') for k in full[:2]);apr=[med(m[k],'SalePriceSF') for k in full if k[0]==2026 and 4<=k[1]<=9]
jan=len(m[(2026,1)]);peak=max(full,key=lambda k:len(m[k]))
sl=f"""# What Sold in Lincoln

## Home sales, {MN[d0.month]} {d0.year} to {MN[d1.month]} {d1.year}

## Summary

The county's sales file holds **{n:,} valid residential sales** inside Lincoln's city limits for the twelve months ending in mid {MN[d1.month]} {d1.year}, worth **{B(sum(pr))}** in total. Read as a whole they describe the market a buyer or seller walked into this year.

1. **The median home sold for ${st.median(pr):,.0f}**, at a median of **${med(res,'SalePriceSF'):.0f} per square foot**. The middle half of sales fell between ${pr[n//4]:,.0f} and ${pr[3*n//4]:,.0f}.
2. **The entry level is thin.** {pc(u200,n)} of sales closed under $200,000. {pc(o500,n)} closed at $500,000 or more.
3. **New construction is a large share of the market.** {len(new):,} sales, {pc(len(new),n)} of the total, were homes built in 2025 or 2026, at a median of ${med(new,'SalePrice'):,.0f}.
4. **Price per square foot is flat across size until the largest homes.** Every size group under about {ZQ[4][0]:,} square feet sold for ${min(sfq):.0f} to ${max(sfq):.0f} a square foot. The largest fifth sold for ${ZQ[4][3]:.0f}.
5. **Homes sold for more than their assessment.** {100*sum(1 for x in gap if x>0)/len(gap):.0f}% of sales closed above the assessed value, by a median of ${st.median(gap):,.0f}.

## Price bands

| Sale price | Sales | Share |
|---|---|---|
{bt}

One sale in ten closed at or below ${pr[n//10]:,.0f} and one in ten at or above ${pr[9*n//10]:,.0f}.

## Through the year

| Month | Sales | Median price | Median per sq ft |
|---|---|---|---|
{mt}

Volume follows the usual curve, rising from {jan} sales in January to a peak of {len(m[peak])} in {MN[peak[1]]}. Price per square foot rose from the winter into spring and then held between ${min(apr):.0f} and ${max(apr):.0f} from April through September. {MN[d0.month]} {d0.year} and October and November 2026 ({sum(len(m[k]) for k in part)} sales together) are left out of the table because the file holds only part of each month. Recent sales take weeks to be reviewed and posted.

## By type of home

| Type | Sales | Median price | Median per sq ft | Median size (sq ft) | Median year built |
|---|---|---|---|---|---|
{tt}

Square footage here is the assessor's above-grade floor area. A one story house with a finished basement shows a high price per square foot because the basement is in the price and not in the area. That is why ranches lead this column and two story homes trail it.

The one story townhome is the notable entry. {len(th)} end units sold at a median of ${med(th,'SalePrice'):,.0f}, with a median build year of {med(th,'ResYrBlt'):.0f}.

## By age

| Built | Sales | Median price | Median per sq ft | Median size (sq ft) |
|---|---|---|---|---|
{dtab}

Homes built since 2020 are the largest single group, {len(dd[2020])} sales, and the most expensive by either measure. The affordable end of the market is the housing built before 1960: {len(pre60)} sales with decade medians from ${min(p60m):,.0f} to ${max(p60m):,.0f}. The 1950s alone supplied {len(dd[1950])} sales at a median of ${med(dd[1950],'SalePrice'):,.0f}, in houses with a median of {med(dd[1950],'ResFlrArea'):,.0f} square feet above grade.

## By size

| Size group (above-grade sq ft) | Median price | Median per sq ft |
|---|---|---|
{zt}

## By neighborhood

Neighborhood associations with at least 20 sales in the period. About {100*nohood/n:.0f}% of sales fell outside any association boundary, mostly in the newer subdivisions at the city's edges, which have none.

{stt}

{low[0]} has the lowest price per square foot in the table at ${low[3]:.0f}, on a housing stock with a median build year of {low[4]:.0f}. {hi[0]} has the highest at ${hi[3]:.0f}.

## Turnover

{n:,} valid sales against {nri:,} improved residential parcels is **{100*n/nri:.1f}% of the housing stock changing hands** over the period. The file counts only sales the county validated as arm's length, so the true count of deeds recorded is higher.

## What these numbers are not

- **Not a forecast.** This describes twelve months of closed sales.
- **Not every sale.** Every record carries the county's validity code 01. Family transfers, foreclosures and other sales the county set aside are not in the file.
- **Not the listing market.** Days on market, list prices and price cuts are not public record and are not here.
- **Not a full last quarter.** Sales from October and November 2026 are still being posted.
- **Not about any one house.** No addresses or owner names were used. Sales are grouped by type, age, size and neighborhood only.

## What to do with it

**If you are buying.** The age and type tables show where the price points are. Under $250,000 the market is mostly houses built before 1960, bungalows and condominiums.

**If you are selling or listing.** Price per square foot by neighborhood and by type gives a first check on a list price. Remember that it is above-grade area.

**If you are on the council.** New construction is selling at a median near ${round(med(new,'SalePrice'),-3):,.0f}, and {pc(u200,n)} of sales close under $200,000. The supply of homes at entry prices is the existing older stock, which is a reason to care what happens to it.

## Method

Sales are the Lancaster County Assessor's published sales layer, {len(pickle.load(open('sales.pkl','rb'))):,} records countywide dated {MN[d0.month]} {d0.day}, {d0.year} through {MN[d1.month]} {d1.day}, {d1.year}. This paper uses the {len(S):,} located inside Lincoln's corporate limit, of which {n:,} are residential. Price per square foot, floor area, structure type and year built are the county's fields. Neighborhood was assigned by matching each sale's parcel number to the 2026 parcel layer and locating that parcel inside the city's neighborhood association boundaries. The assessment comparison uses the assessed value carried on each sale record. A fuller treatment of assessed value against sale price is in the companion paper on assessment equity.
{FOOT}"""
open(OUT+'sales.md','w').write(sl)
# ===== TIF cross-check numbers
cv=D(lambda:[0,0])
for r in R:cv[r['cvt']][0]+=1;cv[r['cvt']][1]+=r['v']
ok=[t for t in T if t['status']=='Active']
cmp=[(t['all_bv']+t['all_ev'],cv[t['cvttxcd']][1]) for t in ok if t['cvttxcd'] in cv]
tp={k:v for k,v in cv.items() if k and k.startswith('9')}
print('TIF matched',len(cmp),'parcels sum',sum(c[1] for c in cmp),'table sum',sum(c[0] for c in cmp),'median ratio',st.median([c[1]/max(c[0],1) for c in cmp]))
print('TIF-coded districts',len(tp),'parcels',sum(v[0] for v in tp.values()),'value',sum(v[1] for v in tp.values()),pc(sum(v[1] for v in tp.values()),TV),'excess share',pc(1294971924,TV),'TV',TV,'N',N)
print('SUMMARY sales n',n,'median',st.median(pr),'psf',med(res,'SalePriceSF'),'u200',pc(u200,n),'new',len(new),med(new,'SalePrice'))
print('SUMMARY tb',N,TV,'top10land',band[.10][0],'dt',dt[1]/dt[2],'medri',medri,'big',big)
