import pickle,zlib,struct,json,numpy as np,collections,sys,math
src=open('process2.py').read().split('\n')
end=next(i for i,l in enumerate(src) if l.startswith('tags = H['))
g={}; exec(compile('\n'.join(src[:end]),'p2head','exec'),g)
S=g['S']; NB=g['NB']; b_cen=g['b_cen']; b_area=g['b_area']; b_pid=g['b_pid']; KX=g['KX']; KY=g['KY']
raw=zlib.decompress(open('data2.z','rb').read()); n=struct.unpack('<I',raw[:4])[0]; H2=json.loads(raw[4:4+n]); body=raw[4+n:]
DT={'B':np.uint8,'H':np.uint16,'h':np.int16,'I':np.uint32,'f':np.float32}
sec=lambda k:np.frombuffer(body,DT[H2['secs'][k][2]],H2['secs'][k][1],H2['secs'][k][0])
b_val=sec('b_val'); b_un=sec('b_un'); b_sv=sec('b_sv'); b_cls=sec('b_cls'); b_fa=sec('b_fa')
P,_,_=pickle.load(open('analysis/cw/all.pkl','rb'))
from shapely.geometry import shape,Point
from shapely.strtree import STRtree
pid={}; geoms=[]; vals=[]
for i,(a,gm) in enumerate(P):
    pid.setdefault(a['PARCELID'],i); geoms.append(shape(gm) if gm else Point(0,0).buffer(1e-9)); vals.append(a.get('CNTASSDVAL') or 0)
tree=STRtree(geoms)
par=np.full(NB,-1,np.int64); how=collections.Counter()
for b in range(NB):
    i=pid.get(b_pid[b],-1)
    if i>=0: par[b]=i; how['pid']+=1; continue
    x,y=b_cen[b]; pt=Point(g['LON0']+x/KX, g['LAT0']+y/KY)
    c=[j for j in tree.query(pt) if geoms[j].contains(pt)]
    if c: par[b]=min(c,key=lambda j:geoms[j].area); how['pip']+=1
    else: how['none']+=1
print(how)
have=par>=0; pv=np.array([vals[i] if i>=0 else 0 for i in par])
same=(pv==b_val)&have; print('buildings',NB,'assigned',have.sum(),'value equals pack',same.sum(),'pack has value',(b_val>0).sum(),'pack value but unassigned',((b_val>0)&~have).sum(),'assigned differs',(have&(pv!=b_val)).sum())
d=have&(pv!=b_val); print('differs: pack zero',(d&(b_val==0)).sum(),'ratio median',np.median(pv[d&(b_val>0)]/b_val[d&(b_val>0)]) if (d&(b_val>0)).any() else None)
np.save('b_par.npy',par); 

# ---- effective value per building
CLS=H2['cls']; h=np.maximum(S['b_h'].astype(float)/10,3.0); vol=b_area*h
grp=collections.defaultdict(list)
for b in range(NB):
    if par[b]>=0 and b_un[b]==0 and b_val[b]>0: grp[int(par[b])].append(b)
ev=np.where(b_un>0,b_sv,b_val).astype(np.float64); pn=np.ones(NB,np.uint16); pn[b_val==0]=0
kinds=collections.Counter()
for i,bs in grp.items():
    if len(bs)<2: continue
    v=float(b_val[bs[0]]); w=vol[bs]; o=np.argsort(-w); res=CLS[b_cls[bs[0]]].startswith(('Res','Ag'))
    for b in bs: pn[b]=min(65535,len(bs))
    if res and w[o[1]]<(.8 if len(bs)==2 else .5)*w[o[0]]:
        for b in bs: ev[b]=0
        ev[bs[o[0]]]=v; kinds['main building']+=1
    else:
        sh=w/w.sum()
        for b,s in zip(bs,sh): ev[b]=max(1,round(v*s))
        kinds['split by size']+=1
ev=np.minimum(ev,4294967295).astype(np.uint32)
print(kinds,'buildings on shared parcels',int((pn>1).sum()))
old=np.where(b_sv>0,b_sv,b_val).astype(float)
pv_once=sum(vals[i] for i in set(int(x) for x in par[(par>=0)&(b_val>0)]))
print('old sum $B',old.sum()/1e9,'new sum',ev.astype(float).sum()/1e9,'parcels with buildings, each once',pv_once/1e9,'county all parcels',sum(vals)/1e9)
isres=np.array([CLS[c].startswith('Res') for c in b_cls]); home=isres&(b_fa>200)
print('homes old: n',int((home&(old>0)).sum()),'median',np.median(old[home&(old>0)]),'sum',old[home].sum()/1e9,'| new: n',int((home&(ev>0)).sum()),'median',np.median(ev[home&(ev>0)]),'sum',ev[home].astype(float).sum()/1e9)
com=np.array([CLS[c].startswith('Com') for c in b_cls])
print('commercial old n',int((com&(old>0)).sum()),'median',np.median(old[com&(old>0)]),'sum',old[com].sum()/1e9,'| new n',int((com&(ev>0)).sum()),'median',np.median(ev[com&(ev>0)]),'sum',ev[com].astype(float).sum()/1e9)
# write patched pack
def add(name,t,arr):
    global body
    b=np.asarray(arr,DT[t]).tobytes(); pad=(-len(b))%4; H2['secs'][name]=[len(body),int(len(arr)),t]; body=body+b+b'\0'*pad
assert len(body)%4==0
base_v=np.where(b_un>0,b_sv,b_val).astype(np.float64)
sh=np.where(base_v>0,np.round(ev/np.maximum(base_v,1)*65535),0).astype(np.uint16)
back=np.round(base_v*sh/65535); print('share encoding: max abs error $',float(np.abs(back-ev).max()),'sum error $',float(back.sum()-ev.astype(float).sum()))
add('b_sh','H',sh); add('b_pn','H',pn)
hj=json.dumps(H2,separators=(',',':'),ensure_ascii=False).encode('utf-8'); hj+=b' '*((-len(hj))%4)
out=struct.pack('<I',len(hj))+hj+body
import base64
z=zlib.compress(out,9); open('data2.patched.z','wb').write(z); open('data2.patched.b64','w').write(base64.b64encode(z).decode()); print('patched',len(z))
