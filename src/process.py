import os,re
import json,glob,math,struct,zlib,sys,array,collections,base64
D=os.environ.get('STARCITY_DATA','../')   # folder that holds the downloads
LAT0,LON0=40.77,-96.64
KX=111320*math.cos(math.radians(LAT0));KY=111000.0
Q=0.25;LIM=32000
def proj(p): return ((p['lon']-LON0)*KX,(p['lat']-LAT0)*KY)
def q(v): return int(round(v/Q))
def load(pat):
    seen=set();out=[]
    for f in sorted(glob.glob(D+pat)):
        for e in json.load(open(f))['elements']:
            k=(e['type'],e['id'])
            if k in seen: continue
            seen.add(k);out.append(e)
    return out
def area(r):
    a=0
    for i in range(len(r)):
        x0,y0=r[i];x1,y1=r[(i+1)%len(r)];a+=x0*y1-x1*y0
    return a/2
def centroid(r):
    a=0;cx=cy=0
    for i in range(len(r)):
        x0,y0=r[i];x1,y1=r[(i+1)%len(r)];c=x0*y1-x1*y0;a+=c;cx+=(x0+x1)*c;cy+=(y0+y1)*c
    if abs(a)<1e-9: return (sum(p[0] for p in r)/len(r),sum(p[1] for p in r)/len(r))
    return (cx/(3*a),cy/(3*a))
def clean(r):
    o=[]
    for p in r:
        if not o or (q(p[0]),q(p[1]))!=(q(o[-1][0]),q(o[-1][1])): o.append(p)
    while len(o)>1 and (q(o[0][0]),q(o[0][1]))==(q(o[-1][0]),q(o[-1][1])): o.pop()
    return o
def dp(pts,tol):
    if len(pts)<3: return pts
    keep=[False]*len(pts);keep[0]=keep[-1]=True;st=[(0,len(pts)-1)]
    while st:
        a,b=st.pop()
        ax,ay=pts[a];bx,by=pts[b];dx,dy=bx-ax,by-ay;L=math.hypot(dx,dy) or 1e-9
        md=0;mi=-1
        for i in range(a+1,b):
            d=abs((pts[i][0]-ax)*dy-(pts[i][1]-ay)*dx)/L
            if d>md: md,mi=d,i
        if md>tol: keep[mi]=True;st.append((a,mi));st.append((mi,b))
    return [p for p,k in zip(pts,keep) if k]
def dpr(r,tol):
    """simplify closed ring given without repeated endpoint"""
    if len(r)<5: return r
    x0,y0=r[0];k=max(range(len(r)),key=lambda i:(r[i][0]-x0)**2+(r[i][1]-y0)**2)
    a=dp(r[:k+1],tol);b=dp(r[k:]+[r[0]],tol)
    return a[:-1]+b[:-1]
def rings_of(e):
    """returns list of (outer,[holes]) in projected coords"""
    if e['type']=='way':
        g=e.get('geometry')
        if not g or len(g)<4: return []
        if (g[0]['lat'],g[0]['lon'])!=(g[-1]['lat'],g[-1]['lon']): return []
        return [(clean([proj(p) for p in g]),[])]
    outs=[];ins=[]
    for role,dst in (('outer',outs),('inner',ins)):
        segs=[[ (p['lat'],p['lon']) for p in m['geometry']] for m in e.get('members',[]) if m.get('type')=='way' and m.get('role',role if role=='outer' else '')==role and m.get('geometry')]
        if role=='outer':
            segs=[[ (p['lat'],p['lon']) for p in m['geometry']] for m in e.get('members',[]) if m.get('type')=='way' and m.get('role') in ('outer','') and m.get('geometry')]
        while segs:
            cur=segs.pop(0)
            changed=True
            while cur[0]!=cur[-1] and changed:
                changed=False
                for i,s in enumerate(segs):
                    if s[0]==cur[-1]: cur+=s[1:];segs.pop(i);changed=True;break
                    if s[-1]==cur[-1]: cur+=s[-2::-1];segs.pop(i);changed=True;break
                    if s[-1]==cur[0]: cur=s[:-1]+cur;segs.pop(i);changed=True;break
                    if s[0]==cur[0]: cur=s[:0:-1]+cur;segs.pop(i);changed=True;break
            if cur[0]==cur[-1] and len(cur)>=4:
                dst.append(clean([((lo-LON0)*KX,(la-LAT0)*KY) for la,lo in cur]))
    res=[(o,[]) for o in outs if len(o)>=3]
    def inside(pt,r):
        x,y=pt;c=False
        for i in range(len(r)):
            x0,y0=r[i];x1,y1=r[(i+1)%len(r)]
            if (y0>y)!=(y1>y) and x<(x1-x0)*(y-y0)/(y1-y0)+x0: c=not c
        return c
    for h in ins:
        if len(h)<3: continue
        for o,hs in res:
            if inside(h[0],o): hs.append(h);break
    return res
def orient(o,hs):
    if area(o)<0: o=o[::-1]
    hs=[h[::-1] if area(h)>0 else h for h in hs]
    return o,hs
def obb(r):
    best=None
    for i in range(len(r)):
        x0,y0=r[i];x1,y1=r[(i+1)%len(r)];L=math.hypot(x1-x0,y1-y0)
        if L<0.5: continue
        ux,uy=(x1-x0)/L,(y1-y0)/L
        us=[p[0]*ux+p[1]*uy for p in r];vs=[-p[0]*uy+p[1]*ux for p in r]
        w,h=max(us)-min(us),max(vs)-min(vs)
        if best is None or w*h<best[0]:
            cu,cv=(max(us)+min(us))/2,(max(vs)+min(vs))/2
            best=(w*h,math.atan2(uy,ux),w,h,cu*ux-cv*uy,cu*uy+cv*ux)
    return best
def inb(r,lim=LIM): return all(abs(q(p[0]))<lim and abs(q(p[1]))<lim for p in r)

# ---------------- buildings
HOUSE={'house','detached','semidetached_house','residential','terrace','bungalow','cabin','farm','duplex','townhouse'}
SMALL={'garage','shed','garages','carport','hut','greenhouse'}
APT={'apartments','dormitory','hotel'}
COM={'retail','commercial','office','supermarket','kiosk'}
IND={'industrial','warehouse','manufacture','hangar','barn','farm_auxiliary','storage_tank','silo'}
CIV={'university','school','college','hospital','public','government','civic','kindergarten','fire_station','library','museum','train_station','transportation'}
REL={'church','chapel','cathedral','religious','mosque','synagogue','temple'}
CUR={ # curated approximate heights in metres (estimates)
 'Devaney Sports Center':26,'Pinnacle Bank Arena':36,'Hawks Championship Center':21,'Cook Pavilion':18,'NU Coliseum':22,
 'Osborne Legacy Center':20,'Haymarket Park':14,'John Breslow Ice Hockey Center':15,'The Icebox':14,
 'U.S. Bank':76,'Lied Place':75,'The Lincoln Marriott Cornhusker Hotel':42,'Graduate':52,'Sharp Building':66,
 'Wells Fargo':60,'Terminal Building':42,'Georgian Place':36,'Abel Residence Hall':46,'Sandoz':32,'Oldfather Hall':46,
 'Embassy Suites':34,'Hyatt Place':24,'Union Bank Place':46,'Windstream':30,'Gold\'s Building':26,'The 50/50':30,
 'Latitude':24,'8N Lofts':26,'LivRed':24,'Aspen':24,'Academy Lincoln':22,'Harper Hall':34,'Schramm Hall':34,'Smith Hall':34,
 'Drury Plaza Hotel':30,'Holiday Inn':24,'Knoll Residence Hall':28,'University Suites':22,'Eastside Suites':22,
 'Lied Center for Performing Arts':26,'Don Love Memorial Library':18,'Nebraska Union':14,'Morrill Hall':18,
 'Canopy':22,'Hudl':28,'Telegraph':18,'Assurity Life':22,'Nebraska State Office Building':26,'Denney Federal Building':24,
 'Parkhaus Tower':48,'University Towers':60,'Smithfield':16,'Lincoln Post Office':10,'Selleck':16,'Kiewit Hall':28,
 'Saint Paul United Methodist Church':24,'Saint Mary':26,'First-Plymouth':30,'Cathedral of the Risen Christ':24,
 'Bryan':30,'St. Elizabeth':30,'CHI Health':30,'Farmers Mutual':24,'Burnham Yates':40,'Pioneer House':36,'Skypark Manor':40,
 'Capitol View Tower':40,'Crossroads House':36,'Mahoney Manor':30,'Burke Plaza':30,
}
bl=load('buildings_*.json')
B=[];tagvals=[];tagidx={};infos=[''];infoidx={'':0}
special={}
blabels=[]
for e in bl:
    t=e.get('tags',{});name=t.get('name','')
    rr=rings_of(e)
    if not rr: continue
    seed=((e['id']*2654435761)&0xffff)/65535.0
    for o,hs in rr:
        if len(o)<3 or not inb(o): continue
        o,hs=orient(o,hs);hs=[h for h in hs if len(h)>=3 and inb(h)]
        a=area(o)-sum(abs(area(h)) for h in hs)
        if a<5: continue
        c=centroid(o);bt=t.get('building','yes')
        if name=='Nebraska State Capitol':
            ob=obb(o);special['capitol']=dict(x=c[0],n=c[1],ang=ob[1],w=ob[2],h=ob[3]);continue
        if name=='Memorial Stadium' and a>20000:
            ob=obb(o);special['stadium']=dict(x=ob[4],n=ob[5],ang=ob[1],w=ob[2],h=ob[3]);continue
        # type code
        if bt in HOUSE: tc=1
        elif bt in SMALL: tc=2
        elif bt in APT: tc=3
        elif bt in COM: tc=4
        elif bt in IND: tc=5
        elif bt in CIV: tc=6
        elif bt in REL: tc=7
        elif bt in ('roof','canopy'): tc=8
        elif bt in ('stadium','grandstand','sports_centre','sports_hall'): tc=9
        elif bt=='static_caravan': tc=10
        else: tc=0
        if tc==0:
            if t.get('amenity')=='place_of_worship': tc=7
            elif t.get('amenity') in ('school','university','college','hospital','library'): tc=6
            elif t.get('shop') or t.get('amenity') in ('restaurant','fast_food','bank','fuel','cafe','pharmacy'): tc=4
        core=(-5950<c[0]<-4850 and 4380<c[1]<5160)
        src=0;minh=0.0;h=None
        try:
            if 'height' in t:
                s=t['height'].replace('m','').strip()
                h=float(s.split("'")[0])*0.3048 if "'" in s else float(s);src=1
            elif 'building:levels' in t:
                lv=float(t['building:levels'].split(';')[0]);h=lv*3.4+1.2 if lv>2 else lv*3.0+1.0;src=1
        except: h=None
        for k,v in CUR.items():
            if k in name and (src==0 or (h or 0)<v*0.6): h=v;src=2;break
        if h is None:
            if 'Garage' in name or 'Parking' in name or t.get('amenity')=='parking' or bt=='parking': h=14+4*seed
            elif tc==1: h=3.4+1.2*seed+(2.6 if a>135 and seed>0.45 else 0)
            elif tc==2: h=2.5+0.6*seed
            elif tc==3: h=9.5+4*seed if a>250 else 6.5
            elif tc==4: h=5.0+2.0*seed+(2 if a>4000 else 0)
            elif tc==5: h=7+3*seed
            elif tc==6: h=9+5*seed
            elif tc==7: h=9+4*seed
            elif tc==8: h=5.0
            elif tc==9: h=12
            elif tc==10: h=2.9
            else:
                if a<45: h=2.6+0.5*seed
                elif a<330: h=3.4+1.2*seed+(2.6 if a>135 and seed>0.45 else 0)
                elif a<1200: h=5.5+3*seed
                else: h=7+4*seed
                if core and a>250: h=11+14*seed*seed+(8 if a>1500 else 0)
        if tc==8 or t.get('building')=='roof': minh=max(0,h-0.6)
        if 'min_height' in t:
            try: minh=float(t['min_height'])
            except: pass
        h=max(2.2,min(h,130))
        # roof code
        roof=0
        if not hs and len(o)<=14:
            if tc in (1,) or (tc==0 and 45<=a<330 and not core) : roof=1
            elif tc==2 or (tc==0 and a<45): roof=1
            elif tc==7 and a<1500: roof=1
        if name in ('Devaney Sports Center','Pinnacle Bank Arena','Hawks Championship Center','Cook Pavilion','NU Coliseum'): roof=3
        info=name
        if not info and t.get('addr:housenumber') and t.get('addr:street'): info=t['addr:housenumber']+' '+t['addr:street']
        if info not in infoidx:
            if len(infos)<65000: infoidx[info]=len(infos);infos.append(info)
            else: info=''
        if bt not in tagidx:
            if len(tagvals)<250: tagidx[bt]=len(tagvals);tagvals.append(bt)
        B.append(dict(o=o,hs=hs,h=h,minh=minh,tc=tc,roof=roof,src=src,info=infoidx[info],tag=tagidx.get(bt,0),a=a))
        if name and (a>1400 or name in CUR): blabels.append((name,c[0],c[1],a,h))
def pin(pt,r):
    x,y=pt;c=False
    for i in range(len(r)):
        x0,y0=r[i];x1,y1=r[(i+1)%len(r)]
        if (y0>y)!=(y1>y) and x<(x1-x0)*(y-y0)/(y1-y0)+x0: c=not c
    return c
CELL=40.0
def mkgrid(lst):
    g=collections.defaultdict(list)
    for i,b in enumerate(lst):
        xs=[p_[0] for p_ in b['o']];ys=[p_[1] for p_ in b['o']]
        for gx in range(int(min(xs)//CELL),int(max(xs)//CELL)+1):
            for gy in range(int(min(ys)//CELL),int(max(ys)//CELL)+1): g[(gx,gy)].append(i)
    return g
def near(g,o):
    xs=[p_[0] for p_ in o];ys=[p_[1] for p_ in o];seen=set()
    for gx in range(int(min(xs)//CELL),int(max(xs)//CELL)+1):
        for gy in range(int(min(ys)//CELL),int(max(ys)//CELL)+1):
            for i in g.get((gx,gy),()):
                if i not in seen: seen.add(i);yield i
for b in B: b['org']=0;b['c']=centroid(b['o'])
# ---- City of Lincoln / Lancaster County building footprints (2026 layer) are the base layer.
# Assessor parcel records add structure type and year built. Owner names, mailing addresses and
# valuations are never requested or used.
def story_h(s):
    """eave height in metres from the assessor's structure type"""
    if not s: return None
    s=s.lower()
    if 'high rise' in s: return None
    if s.startswith('3 story'): h=8.6
    elif s.startswith('2 1/2'): h=6.9
    elif s.startswith('2 story'): h=5.7
    elif s.startswith('1 1/2'): h=4.1
    elif s.startswith('multi'): h=4.6
    elif s.startswith(('split foyer','raised ranch','garden level')): h=4.0
    elif s.startswith(('1 story','bungalow')): h=3.0
    elif s.startswith(('earth','basement')): h=2.4
    else: return None
    w=s.replace('/',' ').split()
    if 'fa' in w or 'ua' in w: h+=0.4
    return h
USEKIND={'Single Family':'House','Townhouse':'Townhouse','Duplex/Triplex':'Duplex or triplex','Acreage':'House on an acreage','Mobile Home':'Mobile home',
 'Multi-Family':'Apartments','High Rise Condos':'Condominiums','Condo Base Account':'Condominiums','Conversion-Apt':'House converted to apartments',
 'Church':'Church','School':'School','Public Use':'Public building','Office':'Office','Retail':'Retail','Store Front':'Storefront',
 'Fast Food Restaurant':'Restaurant','Convenience Store':'Convenience store','Service':'Service building','Other - Commercial':'Commercial',
 'Multi-Use':'Mixed use','Central Assessed':'Utility or railroad building','Hotel/Motel':'Hotel','Industrial':'Industrial',
 'Agricultural':'Farm building','Mobile Home Court':'Mobile home'}
RES_USE={'Single Family','Townhouse','Duplex/Triplex','Acreage','Mobile Home'}
stypes=[''];stidx={'':0}
cfiles=sorted(glob.glob(D+'city26/city26_*.json'))
if cfiles:
    PA={}
    for f in sorted(glob.glob(D+'parcels/parcels_*.json')):
        for ft in json.load(open(f)).get('features',[]):
            a_=ft['attributes'];pid=a_.get('PARCELID')
            if pid: PA[pid]=(a_.get('RESYRBLT'),a_.get('RESSTRTYP'),a_.get('PRIMEUSE'))
    OS=B;og=mkgrid(OS);covered=[False]*len(OS);demo_hit=[False]*len(OS);B=[]
    F=[];seenf=set();ndemo=0
    for f in cfiles:
        for ft in json.load(open(f))['features']:
            g=ft.get('geometry') or {};p=ft.get('properties') or {}
            polys=[g['coordinates']] if g.get('type')=='Polygon' else (g.get('coordinates') or [] if g.get('type')=='MultiPolygon' else [])
            for rings in polys:
                o=clean([((lo-LON0)*KX,(la-LAT0)*KY) for lo,la in rings[0]])
                if len(o)<3 or not inb(o): continue
                o=dpr(o,0.25)
                hs=[]
                for r in rings[1:]:
                    h_=dpr(clean([((lo-LON0)*KX,(la-LAT0)*KY) for lo,la in r]),0.25)
                    if len(h_)>=3 and abs(area(h_))>6: hs.append(h_)
                if len(o)<3: continue
                o,hs=orient(o,hs);a=area(o)-sum(abs(area(h_)) for h_ in hs)
                if a<6: continue
                c=centroid(o);key=(round(c[0],1),round(c[1],1),round(a))
                if key in seenf: continue
                seenf.add(key)
                F.append(dict(o=o,hs=hs,a=a,c=c,pid=(p.get('PID') or '').strip(),pc=(p.get('PROP_CLASS') or '').strip()[:1],st=(p.get('status') or '').strip()))
    main={}
    for i,f_ in enumerate(F):
        if f_['st']=='demolished' or not f_['pid']: continue
        if f_['pid'] not in main or F[main[f_['pid']]]['a']<f_['a']: main[f_['pid']]=i
    nstory=nyear=nspecial=nsub=nsubb=ntower=0;forced=set()
    for k,f_ in enumerate(F):
        o=f_['o'];hs=f_['hs'];a=f_['a'];c=f_['c']
        # the Capitol and Memorial Stadium are modeled by hand; an outline that contains one of them is left out
        # (and does not hide the OpenStreetMap buildings around it)
        if any(pin((sp_['x'],sp_['n']),o) for sp_ in special.values()): nspecial+=1;continue
        # The city draws connected structures (a mall, a hospital, downtown blocks joined by skywalks) as one
        # outline. Where OpenStreetMap splits such an outline into separate buildings that cover it, the
        # OpenStreetMap buildings are used instead, because each carries its own height and name.
        if f_['st']!='demolished' and a>=600:
            ins=[i for i in near(og,o) if OS[i]['a']>=60 and pin(OS[i]['c'],o)]
            if len(ins)>=2 and sum(OS[i]['a'] for i in ins)>=0.8*a:
                forced.update(ins);nsub+=1;nsubb+=len(ins)
                if f_['pid']:
                    for i in ins: OS[i].setdefault('pid',f_['pid']);OS[i]['pidi']=1
                continue
        best=None;mt=[]
        for i in near(og,o):
            ob=OS[i]
            if pin(c,ob['o']) or pin(ob['c'],o):
                if f_['st']=='demolished': demo_hit[i]=True;continue
                covered[i]=True;mt.append(i)
                sc=(2 if ob['info'] else 0)+(1 if ob['src'] else 0)+(1 if ob['tc'] else 0)+(2 if ob['a']>=0.5*a else 0)
                if best is None or sc>best[0]: best=(sc,ob)
        if f_['st']=='demolished': ndemo+=1;continue
        # a tall tagged tower standing on a much larger city outline stays as its own building on top of it
        for i in mt:
            if OS[i]['src'] in (1,2) and OS[i]['h']>=20 and 150<=OS[i]['a']<0.5*a:
                forced.add(i);ntower+=1
                if f_['pid']: OS[i].setdefault('pid',f_['pid']);OS[i]['pidi']=1
        yr,stt,use=PA.get(f_['pid'],(None,None,None))
        ismain=main.get(f_['pid'])==k
        seed=((k*2654435761+777)&0xffff)/65535.0
        core=(-5950<c[0]<-4850 and 4380<c[1]<5160)
        pc=f_['pc']
        if use in ('Vacant Land','Vacant land with IOLL/Common Area/Assemblage'): use=None
        kind=USEKIND.get(use)
        if use in RES_USE or (use is None and pc=='R'):
            if use=='Mobile Home': tc=10
            elif ismain and a>=38: tc=1;kind=kind or 'House'
            elif a<150: tc=2;kind='Garage or shed'
            else: tc=1;kind='Residential building'
        elif use in ('Multi-Family','High Rise Condos','Condo Base Account'):
            if a<60: tc=2;kind='Garage or shed'
            else: tc=3
        elif use=='Conversion-Apt':
            if not ismain and a<120: tc=2;kind='Garage or shed'
            else: tc=1 if a<420 else 3
        elif use=='Church':
            if ismain or a>=200: tc=7
            else: tc=2 if a<70 else 0;kind='Church outbuilding'
        elif use=='School': tc=6 if a>=120 else 0
        elif use=='Public Use': tc=6 if a>=150 else 0
        elif use=='Hotel/Motel': tc=3 if a>=120 else 0
        elif use=='Industrial': tc=5 if a>=80 else 0
        elif use=='Agricultural':
            if ismain and stt: tc=1;kind='Farmhouse'
            else: tc=5 if a>=150 else 2
        elif use=='Mobile Home Court': tc=10 if a<140 else 4
        elif use is not None: tc=4 if a>=60 else 0
        elif pc=='C': tc=4 if a>=150 else 0;kind='Commercial'
        elif pc=='A': tc=5 if a>=150 else 2;kind='Farm building'
        else: tc=2 if a<70 else 0;kind='Building'
        kind=kind or 'Building'
        if kind not in tagidx: tagidx[kind]=len(tagvals);tagvals.append(kind)
        info=0;tag=tagidx[kind];src=0;minh=0.0;h=None;roof3=False
        if best:
            ob=best[1]
            if ob['info']: info=ob['info']
            if ob['tc'] and not (ob['tc']==8 and a>150) and not (ob['tc']==2 and tc==1 and a>=70): tc=ob['tc']
            if tagvals[ob['tag']]!='yes': tag=ob['tag']
            if ob['src'] in (1,2) and (ob['a']>=0.5*a or a<600): h=ob['h'];src=ob['src']
            if ob['minh'] and ob['tc']==8: minh=ob['minh'];h=ob['h']
            roof3=ob['roof']==3 and ob['a']>=0.5*a
        sti=0
        if stt and tc in (1,3) and (ismain or use=='Conversion-Apt'):
            if stt not in stidx: stidx[stt]=len(stypes);stypes.append(stt)
            sti=stidx[stt]
            if h is None:
                sh=story_h(stt)
                if sh: h=sh+0.5*(seed-0.5);src=5;nstory+=1
        if h is None:
            if tc==1: h=3.4+1.2*seed+(2.6 if a>135 and seed>0.45 else 0)
            elif tc==2: h=2.5+0.6*seed
            elif tc==3: h=9.5+4*seed
            elif tc==4: h=5.0+2.0*seed+(2 if a>4000 else 0)
            elif tc==5: h=7+3*seed
            elif tc==6: h=9+5*seed
            elif tc==7: h=9+4*seed
            elif tc==8: h=5.0;minh=4.4
            elif tc==9: h=12
            elif tc==10: h=2.9
            else:
                if a<45: h=2.6+0.5*seed
                elif a<330: h=3.4+1.2*seed+(2.6 if a>135 and seed>0.45 else 0)
                elif a<1200: h=5.5+3*seed
                else: h=7+4*seed
            if core and a>250 and tc not in (1,2): h=11+14*seed*seed+(8 if a>1500 else 0)
        roof=0
        if roof3: roof=3
        elif not hs and len(o)<=28 and (tc in (1,2) or (tc==0 and a<330 and not core) or (tc==7 and a<1500) or (tc==3 and a<1700 and not core)): roof=1
        y=0
        try:
            if yr and ismain and tc in (1,3) and 1850<=int(yr)<=2026: y=int(yr);nyear+=1
        except Exception: y=0
        B.append(dict(o=o,hs=hs,h=max(2.2,min(h,130)),minh=minh,tc=tc,roof=roof,src=src,info=info,tag=tag,a=a,org=1,c=c,yr=y,st=sti,new=1 if f_['st']=='new' else 0,pid=f_['pid']))
    ncity=len(B)
    cg=mkgrid(B);kept=0;ddemo=0;dover=[];keptA=collections.Counter();big_osm=[]
    for i,ob in enumerate(OS):
        if i in forced: B.append(ob);kept+=1;continue
        if covered[i]: continue
        o=ob['o'];hit=False
        for j in near(cg,o):
            bo=B[j]['o']
            if pin(ob['c'],bo) or pin(B[j]['c'],o) or any(pin(q_,o) for q_ in bo[::2]) or any(pin(q_,bo) for q_ in o[::2]): hit=True;break
        if hit:
            # a named OpenStreetMap building that overlaps city outlines without a centroid match still names them
            if ob['info'] and not infos[ob['info']][:1].isdigit():
                tg=[j for j in near(cg,o) if B[j]['info']==0 and B[j]['a']>=40 and (pin(B[j]['c'],o) or sum(1 for q_ in B[j]['o'] if pin(q_,o))*2>=len(B[j]['o']))]
                if not tg:
                    cand=[j for j in near(cg,o) if B[j]['info']==0 and any(pin(q_,B[j]['o']) for q_ in o)]
                    tg=sorted(cand,key=lambda j:-B[j]['a'])[:1]
                for j in tg:
                    B[j]['info']=ob['info']
                    if tagvals[ob['tag']]!='yes': B[j]['tag']=ob['tag']
                    if ob['tc'] and ob['tc']!=8: B[j]['tc']=ob['tc']
                    if ob['src'] in (1,2) and B[j]['src'] not in (1,2): B[j]['h']=ob['h'];B[j]['src']=ob['src']
                dover.append(infos[ob['info']]+('' if tg else ' (lost)'))
            continue
        if demo_hit[i]: ddemo+=1;continue
        if ob['a']>=150: big_osm.append((round(ob['a']),infos[ob['info']],tagvals[ob['tag']],round(ob['c'][0]),round(ob['c'][1])))
        B.append(ob);kept+=1;keptA['<30' if ob['a']<30 else ('30-150' if ob['a']<150 else ('150-1000' if ob['a']<1000 else '>1000'))]+=1
    print('city 2026 footprints read',len(F),'| demolished skipped',ndemo,'| landmark outlines skipped',nspecial,'| merged outlines replaced by',nsub,'->',nsubb,'osm buildings | towers kept on podiums',ntower,'| kept',ncity,'| story heights',nstory,'| year built',nyear,file=sys.stderr)
    print('big osm-only:',sorted(big_osm,reverse=True),file=sys.stderr)
    print('osm-only kept',kept,dict(keptA),'| osm dropped: only matched a demolished outline',ddemo,'| named osm dropped for overlap',len(dover),sorted(set(dover))[:60],file=sys.stderr)
# ---- Microsoft footprints fill the gaps OpenStreetMap leaves
import os
n_osm=len(B)
if os.path.exists('ms.json'):
    gridm=mkgrid(B)
    sp=[(special[k]['x'],special[k]['n']) for k in special]
    added=0;msA=collections.Counter();ms_drop=0
    if 'yes' not in tagidx: tagidx['yes']=len(tagvals);tagvals.append('yes')
    for k,ring in enumerate(json.load(open('ms.json'))):
        o=clean([((lo-LON0)*KX,(la-LAT0)*KY) for lo,la in ring])
        if len(o)<3 or not inb(o): continue
        o=dpr(o,0.3)
        if len(o)<3: continue
        if area(o)<0: o=o[::-1]
        a=area(o)
        if a<12: continue
        c=centroid(o)
        if any(abs(c[0]-sx)<140 and abs(c[1]-sy)<140 for sx,sy in sp): continue
        xs=[p_[0] for p_ in o];ys=[p_[1] for p_ in o];hit=False;seen=set()
        for gx in range(int(min(xs)//CELL),int(max(xs)//CELL)+1):
            for gy in range(int(min(ys)//CELL),int(max(ys)//CELL)+1):
                for i in gridm.get((gx,gy),()):
                    if i in seen: continue
                    seen.add(i);ob=B[i]['o']
                    if pin(c,ob) or pin(centroid(ob),o) or any(pin(q_,o) for q_ in ob[::2]) or any(pin(q_,ob) for q_ in o): hit=True;break
                if hit: break
            if hit: break
        if hit: continue
        if a>=150 and cfiles and -96.73<LON0+c[0]/KX<-96.55 and 40.70<LAT0+c[1]/KY<40.84: ms_drop+=1;continue
        seed=((k*2654435761+12345)&0xffff)/65535.0
        core=(-5950<c[0]<-4850 and 4380<c[1]<5160)
        if a<45: h=2.6+0.5*seed
        elif a<330: h=3.4+1.2*seed+(2.6 if a>135 and seed>0.45 else 0)
        elif a<1200: h=5.5+3*seed
        else: h=7+4*seed
        if core and a>250: h=11+10*seed*seed
        roof=1 if (len(o)<=14 and a<330 and not core) else 0
        B.append(dict(o=o,hs=[],h=h,minh=0,tc=0,roof=roof,src=0,info=0,tag=tagidx['yes'],a=a,org=2,c=c));added+=1;msA['<30' if a<30 else ('30-150' if a<150 else ('150-1000' if a<1000 else '>1000'))]+=1
    print('ms added',added,dict(msA),'| large ms-only outlines not in the city layer, dropped',ms_drop,file=sys.stderr)
# ---- height estimates from Microsoft's global footprints
import gzip
gfiles=glob.glob(D+'ms_global_*.csv.gz')
if gfiles:
    HG=[]
    for f in gfiles:
        with gzip.open(f,'rt') as fh:
            for line in fh:
                try: ft=json.loads(line)
                except Exception: continue
                hh=(ft.get('properties') or {}).get('height',-1)
                if not hh or hh<=0: continue
                r=ft['geometry']['coordinates'][0]
                if not (-96.74<r[0][0]<-96.54 and 40.69<r[0][1]<40.85): continue
                o=[((lo-LON0)*KX,(la-LAT0)*KY) for lo,la in r[:-1]]
                if len(o)>=3: HG.append(dict(o=o,c=centroid(o),h=hh))
    hg=mkgrid(HG);nh=0;diff=[];diff5=[]
    for bld in B:
        m=None
        for j in near(hg,bld['o']):
            g_=HG[j]
            if pin(bld['c'],g_['o']) or pin(g_['c'],bld['o']):
                if m is None or g_['h']>m: m=g_['h']
        if m is None: continue
        if bld['src'] in (1,2): diff.append((bld['h'],m));continue
        if bld['src']==5: diff5.append((bld['h'],m));continue
        if bld['minh']: continue
        if bld['roof']==1: m=m-(1.1 if bld['tc']!=3 else 1.6)   # the estimate is to the roof, the model wants the eave
        bld['h']=max(2.4,min(m,130));bld['src']=4;nh+=1
    print('ms-global with height in area',len(HG),'assigned',nh,'of',len(B),file=sys.stderr)
    if diff:
        import statistics
        print('tagged/curated vs MS estimate: n',len(diff),'median abs diff',round(statistics.median(abs(a_-b_) for a_,b_ in diff),1),file=sys.stderr)
    if diff5:
        import statistics
        print('assessor story eave vs MS estimate: n',len(diff5),'median diff (MS minus eave)',round(statistics.median(b_-a_ for a_,b_ in diff5),1),file=sys.stderr)
for b_ in B:
    if b_['roof']==1 and b_['tc']==3 and b_['h']>11.5: b_['roof']=0   # mid-rise apartments get flat roofs
bl2={}
for b_ in B:
    if b_['info'] and not infos[b_['info']][:1].isdigit():
        nm=infos[b_['info']]
        if nm not in bl2 or bl2[nm][3]<b_['a']: bl2[nm]=(nm,b_['c'][0],b_['c'][1],b_['a'],b_['h'])
blabels=[v for v in bl2.values() if v[3]>1400 or any(k_ in v[0] for k_ in CUR)]
print('buildings',len(B),'infos',len(infos),'special',special,file=sys.stderr)

# ---------------- roads
rd=load('roads.json')
RC={'motorway':0,'trunk':1,'primary':2,'secondary':3,'tertiary':4,'residential':5,'unclassified':5,'living_street':5,'road':5,
    'service':6,'footway':7,'path':7,'pedestrian':7,'steps':7,'bridleway':7,'cycleway':8,'track':11,
    'motorway_link':10,'trunk_link':10,'primary_link':10,'secondary_link':10,'tertiary_link':10,'construction':6}
R=[];snames=collections.defaultdict(list)
# ---- bike trails and on-street bike facilities, classified from OpenStreetMap tags
# classes: 0 paved trail, 1 crushed-rock trail, 2 dirt trail, 3 on-street bike lane, 4 signed on-street bike route
ROCK_S={'gravel','fine_gravel','stone_dust','crushed limestone','crushed_limestone','compacted','unpaved','pebblestone','limestone','rock'}
DIRT_S={'dirt','ground','earth','grass','mud','sand','woodchips','wood_chips','soil'}
TFIX={'Mopac Trail':'MoPac Trail','Old Cheney Rd Trail':'Old Cheney Road Trail','Salt Creek LeveeTrail':'Salt Creek Levee Trail','Salt Creek Level Trail':'Salt Creek Levee Trail','Salt Creek Level Trail (original)':'Salt Creek Levee Trail (original)'}
STREETS={'residential','tertiary','secondary','primary','unclassified','living_street','service','trunk','tertiary_link','secondary_link','primary_link','road'}
def trail_class(t):
    h=t.get('highway');b=t.get('bicycle')
    if not h or b in ('no','private','dismount','use_sidepath') or t.get('access') in ('private','no'): return None
    s=(t.get('surface') or '').lower()
    off=False
    if h=='cycleway': off=True
    elif h in ('path','track','bridleway','pedestrian'): off=b in ('designated','yes','permissive')
    elif h=='footway':
        if t.get('footway') in ('access_aisle','link','traffic_island'): off=False
        elif t.get('footway')=='crossing': off=b in ('designated','yes')
        else: off=(b=='designated') or (b in ('yes','permissive') and bool(t.get('name')))
    if off: return 2 if s in DIRT_S else (1 if s in ROCK_S else 0)
    if h in STREETS:
        vals=[t.get(k) for k in ('cycleway','cycleway:left','cycleway:right','cycleway:both','cycleway:center')]
        if any(v in ('lane','track','opposite_lane','opposite_track','buffered_lane','exclusive') for v in vals) or t.get('cycleway:lane'): return 3
        if b=='designated' or t.get('bicycle_road')=='yes' or t.get('cyclestreet')=='yes' or any(v=='shared_lane' for v in vals): return 4
    return None
tnames=[];tnidx={};tlen=collections.Counter();tclen=collections.Counter();tsegs=collections.defaultdict(list);tcls_of=collections.defaultdict(collections.Counter)
def split_inb(pts):
    cur=[]
    for p in pts:
        if abs(q(p[0]))<LIM and abs(q(p[1]))<LIM: cur.append(p)
        else:
            if len(cur)>1: yield cur
            cur=[]
    if len(cur)>1: yield cur
# Points shared by two or more ways are junctions. They are kept through simplification so that
# the page can rebuild the true street and trail network (who connects to whom) from the geometry.
cntn=collections.Counter()
for e in rd:
    g=e.get('geometry')
    if not g or len(g)<2: continue
    for k_ in {(p_['lat'],p_['lon']) for p_ in g}: cntn[k_]+=1
def simp_keep(seg,kf,tol):
    if seg[0]==seg[-1] and len(seg)>3 and not any(kf[1:-1]): return (lambda r:r+[r[0]])(dpr(seg[:-1],tol))
    out=[seg[0]];a=0
    for i in range(1,len(seg)):
        if kf[i] or i==len(seg)-1: out+=dp(seg[a:i+1],tol)[1:];a=i
    o=[out[0]]
    for p_ in out[1:]:
        if (q(p_[0]),q(p_[1]))!=(q(o[-1][0]),q(o[-1][1])): o.append(p_)
    return o
def split_inb2(pts,kf):
    cur=[];ck=[]
    for p_,k_ in zip(pts,kf):
        if abs(q(p_[0]))<LIM and abs(q(p_[1]))<LIM: cur.append(p_);ck.append(k_)
        else:
            if len(cur)>1: yield cur,ck
            cur=[];ck=[]
    if len(cur)>1: yield cur,ck
snl=[];snidx={}
XC=[]
for e in rd:
    t=e.get('tags',{});g=e.get('geometry')
    if not g or len(g)<2: continue
    if t.get('railway')=='rail': c=9
    else:
        c=RC.get(t.get('highway'))
        if c is None: continue
    tcls=trail_class(t) if c!=9 else None
    istun=t.get('tunnel') in ('yes','building_passage')
    if t.get('area')=='yes' or (istun and tcls is None): continue
    isx=(c==7 and t.get('footway')=='crossing' and tcls is None)
    tn=None
    if tcls is not None and t.get('name'):
        nm=' / '.join(TFIX.get(x.strip(),x.strip()) for x in t['name'].split(';') if x.strip())
        if nm not in tnidx: tnidx[nm]=len(tnames);tnames.append(nm)
        tn=tnidx[nm]
    pts=[proj(p) for p in g]
    kfl=[cntn[(p['lat'],p['lon'])]>1 for p in g]
    tol=0.35 if c<7 else 0.6
    promo=c in (7,8,11) and tcls is None and t.get('access') not in ('private','no') and t.get('highway')!='steps'
    # not a way to send a bike down, unless it is itself a mapped bike facility
    nobike=(t.get('access') in ('private','no') or t.get('bicycle')=='no' or t.get('service')=='driveway' or t.get('motorroad')=='yes'
            or t.get('highway') in ('motorway','trunk','motorway_link','trunk_link','steps','construction'))
    sn=None
    if c!=9 and t.get('name'):
        nm_=t['name'].split(';')[0].strip()
        if nm_ not in snidx and len(snl)<65000: snidx[nm_]=len(snl);snl.append(nm_)
        sn=snidx.get(nm_)
    for seg,ck in split_inb2(pts,kfl):
        seg=simp_keep(seg,ck,tol)
        if len(seg)<2: continue
        fl=(1 if t.get('bridge') and t.get('bridge')!='no' else 0)|(2 if t.get('oneway')=='yes' else 0)|(4 if c==7 and t.get('footway')=='sidewalk' else 0)|(8 if istun else 0)|(16 if nobike else 0)
        #      class flags points trail-class trail-name trail-source has-surface-tag promotable street-name
        ent=[c,fl,seg,tcls,tn,0,bool(t.get('surface')),promo,sn]
        if isx: XC.append(ent);continue
        R.append(ent)
        if c<=5 and t.get('name'):
            L=sum(math.hypot(seg[i+1][0]-seg[i][0],seg[i+1][1]-seg[i][1]) for i in range(len(seg)-1))
            snames[(t['name'],c)].append((L,seg))
print('roads',len(R),file=sys.stderr)
# ---- City of Lincoln trail layers: names, surfaces, and the pieces OpenStreetMap is missing.
# Layer 2 = commuter trail units, layer 3 = Wilderness Park trails, layer 4 = park trails (single track only).
def seglen(seg): return sum(math.hypot(seg[i+1][0]-seg[i][0],seg[i+1][1]-seg[i][1]) for i in range(len(seg)-1))
def dens(seg,step):
    out=[seg[0]]
    for i in range(len(seg)-1):
        ax,ay=seg[i];bx,by=seg[i+1];L=math.hypot(bx-ax,by-ay);n=max(1,int(math.ceil(L/step)))
        for j in range(1,n+1): out.append((ax+(bx-ax)*j/n,ay+(by-ay)*j/n))
    return out
CT=[]
for lay in (2,3,4):
    for f in sorted(glob.glob(D+'trails_%d/*.json'%lay)):
        for ft in json.load(open(f)).get('features',[]):
            p=ft.get('properties') or {};g=ft.get('geometry') or {}
            if p.get('LifeCycle') not in (None,'Active'): continue
            if 'closed for construction' in (p.get('Notes') or '').lower(): continue
            typ=p.get('Type') or '';sub=p.get('Subtype');sub=None if sub in (None,'<Null>','') else sub
            unit=p.get('TrailUnit');unit=None if unit in (None,'<Null>','') else unit.strip()
            surf=p.get('SurfaceMaterial') or ''
            if lay==2: name=unit;cls=1 if surf=='Crushed Rock' else (2 if surf=='Bare Earth' else 0);wild=False
            elif lay==3:
                if typ.startswith('Commuter') or sub not in ('Red','Yellow','Green','Green and Red','Green and Yellow'): continue
                name='Wilderness Park '+sub+' Trail';cls=2;wild=True
            else:
                if sub!='Single Track': continue
                name=((p.get('ParkUnit') or '').strip()+' Single Track').strip();cls=2;wild=True
            lines=[g['coordinates']] if g.get('type')=='LineString' else (g.get('coordinates') or [] if g.get('type')=='MultiLineString' else [])
            for ln in lines:
                # keep only the part inside the area the rest of the map covers
                cur=[]
                for pt_ in list(ln)+[None]:
                    lo,la=(pt_[0],pt_[1]) if pt_ is not None else (None,None)
                    ok=lo is not None and -96.73<=lo<=-96.55 and 40.70<=la<=40.84
                    if ok: cur.append(((lo-LON0)*KX,(la-LAT0)*KY));continue
                    for seg in split_inb(cur):
                        if len(seg)>1: CT.append(dict(seg=seg,name=name,cls=cls,wild=wild,d=dens(seg,6.0)))
                    cur=[]
if CT:
    GC=16.0;cgrid=collections.defaultdict(list)
    for ci,ct in enumerate(CT):
        for (x,y) in ct['d']: cgrid[(int(x//GC),int(y//GC))].append((x,y,ci))
    def near_city(x,y,thr):
        gx,gy=int(x//GC),int(y//GC);best=None;bd=thr*thr
        for ax in (gx-1,gx,gx+1):
            for ay in (gy-1,gy,gy+1):
                for (px,py,ci) in cgrid.get((ax,ay),()):
                    d2=(px-x)**2+(py-y)**2
                    if d2<bd: bd=d2;best=ci
        return best
    def cover(seg,thr=14.0):
        pts=dens(seg,6.0);cnt=collections.Counter()
        for (x,y) in pts:
            ci=near_city(x,y,thr)
            if ci is not None: cnt[ci]+=1
        return len(pts),cnt
    # which OpenStreetMap name goes with which city trail unit
    pair=collections.defaultdict(collections.Counter);cov_cache={}
    for i,r in enumerate(R+XC):
        if r[0] not in (7,8,11) and r[3] is None: continue
        if r[3] is not None and r[3]>2: continue
        n,cnt=cover(r[2])
        if not cnt: continue
        cov_cache[i]=(n,cnt)
        if r[3] is not None and r[4] is not None and sum(cnt.values())>=0.6*n:
            nm=collections.Counter()
            for ci,k in cnt.items(): nm[CT[ci]['name']]+=k
            u=nm.most_common(1)[0][0]
            if u: pair[u][tnames[r[4]]]+=seglen(r[2])
    canon={}
    for u,c_ in pair.items():
        top,L=c_.most_common(1)[0]
        words=[w_ for w_ in re.sub(r'[^a-z0-9]+',' ',u.lower()).split() if len(w_)>2 and w_!='street']
        tw=re.sub(r'[^a-z0-9]+',' ',top.lower()).split()
        if ' / ' not in top and L>=0.35*sum(c_.values()) and not u.startswith('Wilderness Park') and words and all(w_ in tw for w_ in words): canon[u]=top
    def cname(u):
        if not u: return None
        if u in canon: return canon[u]
        if u.startswith('S '): u='South '+u[2:]
        return u if u.endswith(('Trail','Track','Connector')) else u+' Trail'
    def tni(nm):
        if nm is None: return None
        if nm not in tnidx: tnidx[nm]=len(tnames);tnames.append(nm)
        return tnidx[nm]
    print('city trail unit -> name:',{u:cname(u) for u in sorted({c['name'] for c in CT if c['name']})},file=sys.stderr)
    nnamed=nsurf=nprom=0;promL=0.0;ALL=R+XC;nR=len(R)
    for i,(n,cnt) in cov_cache.items():
        r=ALL[i];m=sum(cnt.values())
        nm=collections.Counter();cl=collections.Counter();wl=0
        for ci,k in cnt.items(): nm[CT[ci]['name']]+=k;cl[CT[ci]['cls']]+=k;wl+=k if CT[ci]['wild'] else 0
        u=nm.most_common(1)[0][0];ccls=cl.most_common(1)[0][0]
        if r[3] is not None:
            if m<0.6*n: continue
            ch=False
            if u and (r[4] is None or (u.startswith('Wilderness Park') and tnames[r[4]]=='Wilderness Park Trail')): r[4]=tni(cname(u));nnamed+=1;ch=True
            if not r[6] and ccls!=r[3]: r[3]=ccls;nsurf+=1;ch=True
            if ch: r[5]=2
        elif r[7] and m>=0.75*n and (seglen(r[2])>=6 or i>=nR):
            r[3]=ccls;r[4]=tni(cname(u));r[5]=2;nprom+=1;promL+=seglen(r[2])
            if i>=nR: R.append(r)
    # city pieces with no OpenStreetMap trail nearby are added as their own lines
    GT=20.0;tgrid=collections.defaultdict(list)
    for r in R:
        if r[3] is None or r[3]>2: continue
        for (x,y) in dens(r[2],6.0): tgrid[(int(x//GT),int(y//GT))].append((x,y))
    def near_trail(x,y,thr=20.0):
        gx,gy=int(x//GT),int(y//GT);t2=thr*thr
        for ax in (gx-1,gx,gx+1):
            for ay in (gy-1,gy,gy+1):
                for (px,py) in tgrid.get((ax,ay),()):
                    if (px-x)**2+(py-y)**2<t2: return True
        return False
    # A city-only piece shares no points with the OpenStreetMap ways around it, so each end is tied to the
    # nearest way: to an existing point if one is close, otherwise to a new point added on the nearest stretch.
    AC=40.0;avg=collections.defaultdict(list);asg=collections.defaultdict(list)
    def usable(r): return r[3] is not None or (r[0] not in (0,1,9) and not (r[1]&24) and not (r[0]==7 and r[1]&4))
    def index_way(ri):
        sg=R[ri][2]
        for k_ in range(len(sg)):
            avg[(int(sg[k_][0]//AC),int(sg[k_][1]//AC))].append(sg[k_])
            if k_+1<len(sg):
                a_,b_=sg[k_],sg[k_+1]
                for gx in range(int(min(a_[0],b_[0])//AC),int(max(a_[0],b_[0])//AC)+1):
                    for gy in range(int(min(a_[1],b_[1])//AC),int(max(a_[1],b_[1])//AC)+1): asg[(gx,gy)].append((ri,a_,b_))
    for ri in range(len(R)):
        if usable(R[ri]): index_way(ri)
    ntie=[0,0,0]
    def tie(P):
        gx,gy=int(P[0]//AC),int(P[1]//AC);bv=None;bvd=35.0**2;bs=None;bsd=35.0**2
        for ax in (gx-1,gx,gx+1):
            for ay in (gy-1,gy,gy+1):
                for v_ in avg.get((ax,ay),()):
                    d2=(v_[0]-P[0])**2+(v_[1]-P[1])**2
                    if d2<bvd: bvd=d2;bv=v_
                for (ri,a_,b_) in asg.get((ax,ay),()):
                    vx,vy=b_[0]-a_[0],b_[1]-a_[1];L2=vx*vx+vy*vy or 1e-9
                    u_=max(0.0,min(1.0,((P[0]-a_[0])*vx+(P[1]-a_[1])*vy)/L2));J=(a_[0]+vx*u_,a_[1]+vy*u_)
                    d2=(J[0]-P[0])**2+(J[1]-P[1])**2
                    if d2<bsd: bsd=d2;bs=(ri,a_,b_,J)
        if bv is not None and (bs is None or math.sqrt(bvd)<=math.sqrt(bsd)+3.0): ntie[0]+=1;return bv
        if bs is not None:
            ri,a_,b_,J=bs
            if (q(J[0]),q(J[1])) in ((q(a_[0]),q(a_[1])),(q(b_[0]),q(b_[1]))): ntie[0]+=1;return a_ if (q(J[0]),q(J[1]))==(q(a_[0]),q(a_[1])) else b_
            sg=R[ri][2]
            for k_ in range(len(sg)-1):
                if sg[k_] is a_ and sg[k_+1] is b_:
                    sg.insert(k_+1,J);asg[(gx,gy)].append((ri,a_,J));asg[(gx,gy)].append((ri,J,b_));avg[(int(J[0]//AC),int(J[1]//AC))].append(J);ntie[1]+=1;return J
        ntie[2]+=1;return None
    nadd=0;addL=collections.Counter()
    for ct in CT:
        run=[]
        for pt_ in ct['d']+[None]:
            if pt_ is not None and not near_trail(pt_[0],pt_[1]): run.append(pt_);continue
            if len(run)>1 and seglen(run)>=50:
                seg=clean(dp(run,0.6))
                if len(seg)>1:
                    a_=tie(seg[0]);b_=tie(seg[-1])
                    if a_ is not None and (q(a_[0]),q(a_[1]))!=(q(seg[0][0]),q(seg[0][1])): seg=[a_]+seg
                    if b_ is not None and (q(b_[0]),q(b_[1]))!=(q(seg[-1][0]),q(seg[-1][1])): seg=seg+[b_]
                    R.append([8 if ct['cls']<2 else 7,0,seg,ct['cls'],tni(cname(ct['name'])),1,True,False,None]);nadd+=1;addL[ct['cls']]+=seglen(seg)
                    index_way(len(R)-1)
            run=[]
    print('city-only piece ends tied: to an existing point',ntie[0],'| to a new point on a way',ntie[1],'| nothing within reach',ntie[2],file=sys.stderr)
    print('city trail lines',len(CT),'| osm trails named from city',nnamed,'| surface from city',nsurf,'| osm paths promoted to trail',nprom,'(%.1f mi)'%(promL/1609.344),'| city-only pieces added',nadd,{k:round(v/1609.344,1) for k,v in addL.items()},file=sys.stderr)
for r in R:
    tcls,tn,seg=r[3],r[4],r[2]
    if tcls is None: continue
    L=seglen(seg);tclen[tcls]+=L
    if tn is not None:
        tlen[tn]+=L;tcls_of[tn][tcls]+=L
        if tcls<3: tsegs[tn].append((L,seg))
tlabels=[]
for tn_,lst in tsegs.items():
    placed=[]
    for L,seg in sorted(lst,key=lambda s:-s[0]):
        if L<40: continue
        acc=0;half=L/2;mp=seg[0]
        for i in range(len(seg)-1):
            d=math.hypot(seg[i+1][0]-seg[i][0],seg[i+1][1]-seg[i][1])
            if acc+d>=half:
                f=(half-acc)/(d or 1);mp=(seg[i][0]+(seg[i+1][0]-seg[i][0])*f,seg[i][1]+(seg[i+1][1]-seg[i][1])*f);break
            acc+=d
        if all(math.hypot(mp[0]-p_[0],mp[1]-p_[1])>1300 for p_ in placed):
            placed.append(mp);tlabels.append((tn_,mp[0],mp[1]))
MI=1609.344
print('trail classes (miles): paved %.1f, crushed rock %.1f, dirt %.1f, bike lane %.1f, signed route %.1f'%tuple(tclen[k]/MI for k in range(5)),'| names',len(tnames),'| labels',len(tlabels),file=sys.stderr)
for tn_,L in sorted(((k,v) for k,v in tlen.items() if max(tcls_of[k],key=tcls_of[k].get)<3),key=lambda kv:-kv[1])[:45]:
    print('   %5.1f mi  %-44s %s'%(L/MI,tnames[tn_],dict((k,round(v/MI,1)) for k,v in tcls_of[tn_].items())),file=sys.stderr)
slabels=[]
for (nm,c),lst in snames.items():
    placed=[]
    gap=1500 if c<=3 else (900 if c==4 else 450)
    for L,seg in sorted(lst,key=lambda s:-s[0]):
        if L<25: continue
        # midpoint
        acc=0;half=L/2;mp=seg[0];ang=0
        for i in range(len(seg)-1):
            d=math.hypot(seg[i+1][0]-seg[i][0],seg[i+1][1]-seg[i][1])
            if acc+d>=half:
                f=(half-acc)/(d or 1);mp=(seg[i][0]+(seg[i+1][0]-seg[i][0])*f,seg[i][1]+(seg[i+1][1]-seg[i][1])*f);break
            acc+=d
        if all(math.hypot(mp[0]-p[0],mp[1]-p[1])>gap for p in placed):
            placed.append(mp);slabels.append((nm,mp[0],mp[1],c))
print('street labels',len(slabels),file=sys.stderr)

# ---------------- land
ld=load('land.json')
# layer order index = class id
LC=['farmland','meadow','residential','commercial','industrial','institutional','grass','park','golf','cemetery','wood','scrub','wetland','sand','parking','pitch','track','playground','water','pool','construction','garden']
LI={n:i for i,n in enumerate(LC)}
def lclass(t):
    n=t.get('natural');l=t.get('leisure');u=t.get('landuse');a=t.get('amenity')
    if n=='water' or u in ('reservoir','basin'): return 'water'
    if l=='swimming_pool': return 'pool'
    if l=='pitch': return 'pitch'
    if l=='track': return 'track'
    if l=='playground': return 'playground'
    if a=='parking': return 'parking' if t.get('parking','surface') in ('surface','street_side','lane') else None
    if n in ('sand','beach'): return 'sand'
    if n=='wood' or u=='forest': return 'wood'
    if n in ('scrub','heath'): return 'scrub'
    if n=='wetland': return 'wetland'
    if l=='golf_course': return 'golf'
    if l=='garden': return 'garden'
    if l in ('park','nature_reserve','dog_park','recreation_ground') or u in ('recreation_ground','village_green'): return 'park'
    if u=='cemetery': return 'cemetery'
    if u in ('grass','greenfield') or n=='grassland': return 'grass'
    if u in ('farmland','farmyard','orchard','vineyard'): return 'farmland'
    if u=='meadow': return 'meadow'
    if u=='residential': return 'residential'
    if u in ('commercial','retail'): return 'commercial'
    if u in ('industrial','railway','quarry','landfill'): return 'industrial'
    if u in ('religious','education','institutional','military'): return 'institutional'
    if u in ('construction','brownfield'): return 'construction'
    return None
WC={'river':0,'stream':1,'canal':1,'drain':2,'ditch':2}
Lp=[];W=[];plabels=[];special_pts={}
def clampr(r): return clean([(max(-8150,min(8150,p[0])),max(-8150,min(8150,p[1]))) for p in r])
for e in ld:
    t=e.get('tags',{})
    if 'waterway' in t and e['type']=='way' and t['waterway'] in WC:
        if t.get('tunnel') in ('yes','culvert'): continue
        pts=[proj(p) for p in e['geometry']]
        for seg in split_inb(pts):
            seg=dp(seg,0.5)
            if len(seg)>1: W.append((WC[t['waterway']],seg))
        continue
    c=lclass(t)
    if c is None: continue
    for o,hs in rings_of(e):
        o=clampr(dpr(o,0.6))
        if len(o)<3: continue
        hs2=[]
        for h in hs:
            h=clampr(dpr(h,0.6))
            if len(h)>=3 and abs(area(h))>4: hs2.append(h)
        if abs(area(o))<6: continue
        o,hs2=orient(o,hs2)
        Lp.append((LI[c],o,hs2))
        nm=t.get('name')
        if nm:
            a=abs(area(o));cc=centroid(o)
            if abs(cc[0])<7900 and abs(cc[1])<7900:
                if c in ('park','golf','water','cemetery','wood','garden') and a>12000: plabels.append((nm,cc[0],cc[1],a,c))
                special_pts[nm]=(cc[0],cc[1],a) if nm not in special_pts or special_pts[nm][2]<a else special_pts[nm]
Lp.sort(key=lambda r:(r[0],-abs(area(r[1]))))
print('land',len(Lp),'waterways',len(W),file=sys.stderr)

# ---------------- dog parks (for the map's animated dogs) and the zoo paddock (for its giraffes)
DOGS=[]
for e in ld+bl:
    t=e.get('tags',{})
    if t.get('leisure')!='dog_park': continue
    for o,hs in rings_of(e):
        if len(o)<3: continue
        xs=[p_[0] for p_ in o];ys=[p_[1] for p_ in o];c_=centroid(o)
        if abs(c_[0])>7900 or abs(c_[1])>7900: continue
        DOGS.append([round(c_[0],1),round(c_[1],1),round(max(6.0,min(60.0,0.42*min(max(xs)-min(xs),max(ys)-min(ys)))),1),t.get('name','')])
# A dog park drawn as a building (an indoor dog bar) would hide its dogs inside the walls,
# so the play area moves to the nearest open spot beside the building.
_dg=mkgrid(B)
def _clear(x,y,rad):
    box=[(x-rad-1,y-rad-1),(x+rad+1,y+rad+1)]
    pts=[(x,y)]+[(x+rad*math.cos(k*math.pi/4),y+rad*math.sin(k*math.pi/4)) for k in range(8)]
    for i in near(_dg,box):
        o=B[i]['o']
        if any(pin(q_,o) for q_ in pts): return False
        if any((q_[0]-x)**2+(q_[1]-y)**2<rad*rad for q_ in o): return False
    return True
def _segd(px,py,a_,b_):
    dx=b_[0]-a_[0];dy=b_[1]-a_[1];L=dx*dx+dy*dy
    t_=0 if L==0 else max(0,min(1,((px-a_[0])*dx+(py-a_[1])*dy)/L))
    return math.hypot(px-a_[0]-t_*dx,py-a_[1]-t_*dy)
def _roads_near(x,y,rad):
    out=[]
    for r in R:
        if r[0] in (7,8,11): continue
        sg=r[2]
        for i in range(len(sg)-1):
            a_=sg[i];b_=sg[i+1]
            if min(a_[0],b_[0])>x+rad or max(a_[0],b_[0])<x-rad or min(a_[1],b_[1])>y+rad or max(a_[1],b_[1])<y-rad: continue
            out.append((a_,b_,7.0 if r[0]==6 else 12.0))
    return out
nmoved=0
for d_ in DOGS:
    if _clear(d_[0],d_[1],min(d_[2],7.0)): continue
    best=None;segs=_roads_near(d_[0],d_[1],130)
    for rr in range(8,96,4):
        for k in range(24):
            x=d_[0]+rr*math.cos(k*math.pi/12);y=d_[1]+rr*math.sin(k*math.pi/12)
            if _clear(x,y,7.0) and all(_segd(x,y,a_,b_)>=m_ for a_,b_,m_ in segs): best=(x,y);break
        if best: break
    if best: d_[0]=round(best[0],1);d_[1]=round(best[1],1);d_[2]=7.0;d_.append(1);nmoved+=1
print('dog parks',len(DOGS),[d[3] for d in DOGS if d[3]],'moved beside a building',nmoved,file=sys.stderr)
# open lawn inside the Lincoln Children's Zoo grounds, picked by hand from the map; the real giraffe yard is not in the data
ZOO=[-3428.0,3395.0,15.0]
# ---------------- points
pt=load('points.json')
T=[];places=[];SG=[]
for e in pt:
    t=e.get('tags',{});x,y=proj(e)
    if abs(q(x))>=LIM or abs(q(y))>=LIM: continue
    if t.get('natural')=='tree': T.append((x,y))
    elif t.get('highway')=='traffic_signals': SG.append((x,y))
    elif t.get('place') in ('neighbourhood','suburb','quarter') and t.get('name'): places.append((t['name'],x,y,t['place']))
    elif t.get('place')=='city' and t.get('name'): places.append((t['name'],x,y,'city'))
print('trees',len(T),'places',len(places),file=sys.stderr)

# ---------------- pack
secs={};blob=bytearray()
def add(name,typ,vals):
    global blob
    a=array.array(typ,vals);b=a.tobytes()
    while len(blob)%4: blob.append(0)
    secs[name]=[len(blob),len(vals),typ];blob+=b
def clampq(v): return max(-32767,min(32767,q(v)))
add('b_rings','B',[1+len(b['hs']) for b in B])
rs=[];xy=[]
for b in B:
    for r in [b['o']]+b['hs']:
        rs.append(len(r))
        for p in r: xy+=[clampq(p[0]),clampq(p[1])]
add('b_rs','H',rs);add('b_xy','h',xy)
add('b_h','H',[int(round(b['h']*10)) for b in B]);add('b_minh','H',[int(round(b['minh']*10)) for b in B])
add('b_tc','B',[b['tc'] for b in B]);add('b_roof','B',[b['roof'] for b in B]);add('b_src','B',[b['src'] for b in B])
add('b_info','H',[b['info'] for b in B]);add('b_tag','B',[b['tag'] for b in B]);add('b_org','B',[b.get('org',0) for b in B])
add('b_yr','H',[b.get('yr',0) for b in B]);add('b_st','B',[b.get('st',0) for b in B]);add('b_fl','B',[b.get('new',0)|(2 if b.get('pidi') else 0) for b in B])
def pidparts(b):
    p_=b.get('pid') or ''
    return (int(p_[:7]),int(p_[7:10]),int(p_[10:13])) if re.fullmatch(r'\d{13}',p_) and int(p_[:7])>0 else (0,0,0)
PP=[pidparts(b) for b in B]
add('b_p1','I',[p_[0] for p_ in PP]);add('b_p2','H',[p_[1] for p_ in PP]);add('b_p3','H',[p_[2] for p_ in PP])
print('buildings with a county parcel number',sum(1 for p_ in PP if p_[0]),'of',len(B),'inherited',sum(1 for b in B if b.get('pidi') and b.get('pid')),file=sys.stderr)
add('r_n','H',[len(r[2]) for r in R]);add('r_c','B',[r[0] for r in R]);add('r_f','B',[r[1] for r in R])
add('r_tc','B',[255 if r[3] is None else r[3] for r in R]);add('r_tn','H',[65535 if r[4] is None else r[4] for r in R]);add('r_ts','B',[r[5] for r in R]);add('r_sn','H',[65535 if r[8] is None else r[8] for r in R])
xy=[]
for r in R:
    for p in r[2]: xy+=[clampq(p[0]),clampq(p[1])]
add('r_xy','h',xy)
add('l_rings','B',[min(255,1+len(l[2])) for l in Lp]);add('l_c','B',[l[0] for l in Lp])
rs=[];xy=[]
for l in Lp:
    for r in ([l[1]]+l[2])[:255]:
        rs.append(len(r))
        for p in r: xy+=[clampq(p[0]),clampq(p[1])]
add('l_rs','H',rs);add('l_xy','h',xy)
add('w_n','H',[len(w[1]) for w in W]);add('w_c','B',[w[0] for w in W])
xy=[]
for w in W:
    for p in w[1]: xy+=[clampq(p[0]),clampq(p[1])]
add('w_xy','h',xy)
xy=[]
for p in T: xy+=[clampq(p[0]),clampq(p[1])]
add('t_xy','h',xy)
xy=[]
for p_ in SG: xy+=[clampq(p_[0]),clampq(p_[1])]
add('s_xy','h',xy)
terr=None
if os.path.exists('terrain.json'):
    tj=json.load(open('terrain.json'));add('e_h','H',tj['d']);terr=dict(g=tj['g'],half=tj['half'],min=round(tj['min'],1),max=round(tj['max'],1))
bus=json.load(open('bus.json')) if os.path.exists('bus.json') else None
sites=json.load(open('sites.json')) if os.path.exists('sites.json') else {}
R1=lambda v:round(v,1)
def tidy_st(t):
    """assessor structure type as a short readable phrase"""
    t=t.replace('*','').replace('W/ ','with ').replace('With ','with ')
    t=t.replace('2 1/2','2\u00bd').replace('1 1/2','1\u00bd')
    t=re.sub(r'\bTH\b','townhouse,',t);t=re.sub(r'\bFA\b','finished attic',t);t=re.sub(r'\bUA\b','unfinished attic',t)
    t=t.replace('Multi-Level','Multi level').replace(' ,',',').strip().lower()
    t=re.sub(r',\s*$','',t).replace('townhouse, with','townhouse with')
    return t
head=dict(secs=secs,q=Q,lat0=LAT0,lon0=LON0,infos=infos,tags=tagvals,snl=snl,dogparks=DOGS,zoo=ZOO,stypes=[tidy_st(t) for t in stypes],landc=LC,special=special,
  blabels=[[n,R1(x),R1(y),round(a),R1(h)] for n,x,y,a,h in sorted(blabels,key=lambda b:-b[3])],
  slabels=[[n,R1(x),R1(y),c] for n,x,y,c in slabels],
  tnames=tnames,tlen=[round(tlen[i]) for i in range(len(tnames))],tlabels=[[i,R1(x),R1(y)] for i,x,y in tlabels],tmeters=[round(tclen[k]) for k in range(5)],
  plabels=[[n,R1(x),R1(y),round(a),c] for n,x,y,a,c in sorted(plabels,key=lambda b:-b[3])],
  places=[[n,R1(x),R1(y),k] for n,x,y,k in places],
  terrain=terr,bus=bus,sites=sites,counts=dict(osm=n_osm,buildings=len(B),org=[sum(1 for b in B if b.get('org',0)==k) for k in (0,1,2)],hsrc=[sum(1 for b in B if b['src']==k) for k in range(6)],years=sum(1 for b in B if b.get('yr')),roads=len(R),land=len(Lp),trees=len(T),water=len(W)))
hj=json.dumps(head,separators=(',',':'),ensure_ascii=False).encode()
raw=struct.pack('<I',len(hj))+hj
while len(raw)%4: raw+=b' '
# fix: header length includes padding
hj2=raw[4:];raw=struct.pack('<I',len(hj2))+hj2+bytes(blob)
z=zlib.compress(raw,9)
open('data.z','wb').write(z);open('data.b64','w').write(base64.b64encode(z).decode())
print('raw',len(raw),'z',len(z),'head',len(hj),file=sys.stderr)
json.dump(dict(special=special,sp={k:v for k,v in special_pts.items() if v[2]>30000},bl=head['blabels'][:60]),open('dbg.json','w'),indent=0)
