import pickle,json,collections,statistics as st,datetime,math,warnings
warnings.filterwarnings('ignore')
R=pickle.load(open('city.pkl','rb'));P,S,T=pickle.load(open('all.pkl','rb'))
C=collections.Counter;D=collections.defaultdict
TV=sum(r['v'] for r in R);TA=sum(r['ac'] for r in R);N=len(R)
print('N',N,'TV',TV,'acres',round(TA),'v/ac',round(TV/TA))
print('\n== class');
for c in sorted(set(r['cls'] for r in R),key=lambda c:-sum(r['v'] for r in R if r['cls']==c)):
    q=[r for r in R if r['cls']==c];v=sum(r['v'] for r in q);a=sum(r['ac'] for r in q)
    print(f"{c:26s} n={len(q):6d} {100*len(q)/N:5.1f}% v={v:>15,} {100*v/TV:5.1f}% ac={a:9.0f} {100*a/TA:5.1f}% v/ac={v/a:>12,.0f} med={st.median([r['v'] for r in q]):,.0f}")
z=[r for r in R if r['v']==0];print('zero value',len(z),round(sum(r['ac'] for r in z)),C(r['cls'] for r in z))
print('\n== concentration')
vs=sorted((r['v'] for r in R),reverse=True)
for k in [10,100,int(N*.01),int(N*.05),int(N*.1)]:print(k,sum(vs[:k]),round(100*sum(vs[:k])/TV,1))
half=0;i=0
while half<TV/2:half+=vs[i];i+=1
print('parcels to half',i,round(100*i/N,1))
print('top10',[(r['id'][-6:],r['cls'],r['v'],round(r['ac'],1),r['nb']) for r in sorted(R,key=lambda r:-r['v'])[:10]])
print('\n== value per acre bands (taxable parcels v>0)')
q=[r for r in R if r['v']>0 and r['ac']>0.01]
q.sort(key=lambda r:-r['v']/r['ac'])
# share of value from top X% of land
ca=0;cv=0;ta=sum(r['ac'] for r in q);marks=[.01,.05,.10,.25,.5]
for r in q:
    ca+=r['ac'];cv+=r['v']
    while marks and ca>=marks[0]*ta:print('top',marks[0],'of land area holds',round(100*cv/TV,1),'% value; threshold v/ac',round(r['v']/r['ac']));marks.pop(0)
print('median v/ac res improved',round(st.median([r['v']/r['ac'] for r in q if r['cls']=='Residential Improved'])),'com improved',round(st.median([r['v']/r['ac'] for r in q if r['cls']=='Commercial Improved'])))
# lot size effect for residential improved single (not highrise)
ri=[r for r in q if r['cls']=='Residential Improved' and not r['hr']]
ri.sort(key=lambda r:r['ac'])
print('\n== res improved by lot size quintile')
for k in range(5):
    b=ri[k*len(ri)//5:(k+1)*len(ri)//5];print(k+1,f"lot {b[0]['ac']:.3f}-{b[-1]['ac']:.3f} ac medV {st.median([r['v'] for r in b]):,.0f} v/ac {sum(r['v'] for r in b)/sum(r['ac'] for r in b):,.0f} acres {sum(r['ac'] for r in b):,.0f} value {sum(r['v'] for r in b)/1e9:.2f}B")
hr=[r for r in R if r['hr']];print('highrise',len(hr),sum(r['v'] for r in hr),round(sum(r['ac'] for r in hr),1))
# commercial by district code
print('\n== commercial nbh codes')
cm=D(lambda:[0,0,0])
for r in R:
    if r['cls'].startswith('Commercial'):
        m=cm[r['nb']];m[0]+=1;m[1]+=r['v'];m[2]+=r['ac']
for k,m in sorted(cm.items(),key=lambda kv:-kv[1][1])[:14]:print(k,m[0],f"{m[1]:,}",round(m[2]),f"{m[1]/max(m[2],.1):,.0f}")
# 1km grid value per acre
print('\n== grid 800m')
g=D(lambda:[0,0.0,0])
for r in R:
    k=(int(r['x']//800),int(r['y']//800));m=g[k];m[0]+=r['v'];m[1]+=r['ac'];m[2]+=1
cells=[(m[0]/m[1],k,m) for k,m in g.items() if m[1]>60]
cells.sort(reverse=True)
import pyproj
inv=pyproj.Transformer.from_crs(5070,4326,always_xy=True).transform
for vpa,k,m in cells[:8]:print(round(vpa),[round(c,4) for c in inv(k[0]*800+400,k[1]*800+400)][::-1],m[2],f"{m[0]:,}",round(m[1]))
print('median cell',round(st.median([c[0] for c in cells])),'n',len(cells),'bottom q',round(cells[int(len(cells)*.75)][0]))
print('top 10 cells share',round(100*sum(c[2][0] for c in cells[:10])/TV,1),'land',round(100*sum(c[2][1] for c in cells[:10])/TA,1))
# tax district
print('\n== tax districts');cv=D(lambda:[0,0])
for r in R:cv[r['cvt']][0]+=1;cv[r['cvt']][1]+=r['v']
tifp={k:m for k,m in cv.items() if k and k.startswith('9')}
print('districts',len(cv),'tif-coded',len(tifp),sum(m[0] for m in tifp.values()),sum(m[1] for m in tifp.values()),round(100*sum(m[1] for m in tifp.values())/TV,2))
print('\n== TIF table')
ok=[t for t in T if t['status']=='Active']
print('active',len(ok),'ev',sum(t['all_ev'] for t in ok),'bv',sum(t['all_bv'] for t in ok),'rates',C(t['tax_rate'] for t in ok).most_common(5))
blank=[t for t in T if t['status']!='Active'];print('blank',len(blank),[ (t['tifname'],t['all_ev'],t['all_bv']) for t in blank[:6]])
cmp=[]
for t in ok:
    m=cv.get(t['cvttxcd']);
    if m: cmp.append((t['tifname'][:38],t['cvttxcd'],t['all_bv'],t['all_ev'],m[1],m[0]))
print('matched',len(cmp))
for c in sorted(cmp,key=lambda c:-c[3])[:22]:print(c, 'ratio parcels/(ev)',round(c[4]/max(c[3],1),2),'/(ev+bv)',round(c[4]/max(c[3]+c[2],1),2))
import statistics
print('median parcels/ev',statistics.median([c[4]/max(c[3],1) for c in cmp]),'median parcels/(ev+bv)',statistics.median([c[4]/max(c[3]+c[2],1) for c in cmp]))
print('sum parcels',sum(c[4] for c in cmp),'sum ev',sum(c[3] for c in cmp),'sum bv',sum(c[2] for c in cmp))
