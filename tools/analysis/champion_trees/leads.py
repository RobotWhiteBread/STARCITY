import zipfile,json,collections,math,re,csv,sys
REG=[l for l in csv.reader(open('/tmp/reg.csv'))][1:]
def key(s):
    s=(s or '').lower().replace('×','x').replace(' x ',' ').strip(); s=re.sub(r"'[^']*'|\bvar\.? .*|\bssp\.? .*|\bcv\.? .*",'',s); w=s.split()
    if not w: return ''
    g=w[0].replace('liridendron','liriodendron').replace('pseudotsugo','pseudotsuga'); sp=w[1] if len(w)>1 else ''
    sp={'illinoensis':'illinoinensis','japonica':'japonica'}.get(sp,sp)
    if g=='sophora': g='styphnolobium'
    if sp in('spp','spp.','sp','sp.'): sp='spp'
    return g+' '+sp
champ={}
for r in REG:
    for sn in r[1].split(';'):
        k=key(sn if ' ' in sn.strip() else r[1].split()[0]+' '+sn.strip().split()[-1])
        try: c=float(r[2])*12
        except: continue
        pts=float(r[5]); 
        if k not in champ or pts>champ[k][1]: champ[k]=(r[0],pts,c,float(r[3]),float(r[4]),r[6])
champ['morus alba']=champ.get('morus alba') or champ.get('m. alba')
zf=zipfile.ZipFile('/mnt/user-data/uploads/STARCITY/trees.zip'); T=[]; seen=set()
for nm in sorted(zf.namelist()):
    for f in json.loads(zf.read(nm)).get('features',[]):
        a=f.get('attributes') or {}; g=f.get('geometry') or {}
        if (a.get('LifeCycle') or '').strip()!='Active' or g.get('x') is None or a.get('OBJECTID') in seen: continue
        seen.add(a['OBJECTID']); T.append((g,a))
out=[]; unmatched=collections.Counter(); big_unreg=collections.defaultdict(list)
for g,a in T:
    d=a.get('DBH'); 
    if not isinstance(d,(int,float)) or d<=0 or d>90: continue
    k=key(a.get('ScientificName')); c=d*math.pi
    gk=k.split()[0]+' spp' if k else ''
    ch=champ.get(k) or (champ.get(gk) if gk in('malus spp','crataegus spp','larix spp') else None)
    if ch:
        if c>=0.9*ch[2]: out.append((c/ch[2],a,g,ch,c))
    elif k: big_unreg[k].append((d,a,g))
out.sort(key=lambda t:-t[0])
print('register species keys',len(champ),'inventory trees checked',len(T))
for r,a,g,ch,c in out[:0]:
    print('%5.2f  %-28s DBH %4.0f in -> circ %5.0f in vs champ %5.0f in (%s, %.0f pts at %s) | %s %s multi=%s park=%s id=%s %.5f,%.5f'%(r,a.get('CommonName'),a['DBH'],c,ch[2],ch[0],ch[1],ch[5][:30],a.get('SiteLocation'),a.get('ScientificName'),a.get('MultiTrunk'),a.get('ParkUnit'),a.get('TreeID'),g['y'],g['x']))
print('---- species in the inventory with no register entry, biggest trunk')
L=sorted(((max(t[0] for t in v),k,len(v),max(v,key=lambda t:t[0])[1].get('CommonName')) for k,v in big_unreg.items()),reverse=True)
for x in L[:45]: print(x)
json.dump([dict(ratio=r,common=a.get('CommonName'),sci=a.get('ScientificName'),dbh=a['DBH'],circ=c,champ=ch[0],champ_circ=ch[2],champ_pts=ch[1],champ_h=ch[3],champ_sp=ch[4],champ_loc=ch[5],site=a.get('SiteLocation'),park=a.get('ParkUnit'),multi=a.get('MultiTrunk'),tid=a.get('TreeID'),lat=g['y'],lon=g['x']) for r,a,g,ch,c in out],open('/tmp/champ_candidates.json','w'))
json.dump({k:[ (d,a.get('CommonName'),a.get('SiteLocation'),a.get('ParkUnit'),a.get('TreeID'),g['y'],g['x'],a.get('MultiTrunk')) for d,a,g in sorted(v,key=lambda t:-t[0])[:3]] for k,v in big_unreg.items()},open('/tmp/unreg.json','w'))
