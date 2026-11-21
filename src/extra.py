# Extract Lincoln-area Microsoft footprints + terrain grid. Outputs ms.json and terrain.json
import zipfile,re,json,math,glob,sys
from PIL import Image
D='/home/claude/wd/'
S,N,W,E=40.69,40.92,-96.81,-96.535
pat=re.compile(rb'\[(-?\d+\.\d+),(-?\d+\.\d+)\]')
out=[]
z=zipfile.ZipFile(D+'Nebraska.geojson.zip')
with z.open(z.infolist()[0]) as f:
    for line in f:
        m=pat.search(line)
        if not m: continue
        lon=float(m.group(1));lat=float(m.group(2))
        if not (W<lon<E and S<lat<N): continue
        s=line.strip().rstrip(b',')
        try: g=json.loads(s)['geometry']
        except Exception: continue
        if g['type']!='Polygon': continue
        out.append(g['coordinates'][0])
json.dump(out,open('ms.json','w'))
print('ms in bbox',len(out),file=sys.stderr)
# terrain
Z=13;tiles={}
for f in glob.glob(D+'terrain/13_*.png'):
    _,x,y=f.split('/')[-1][:-4].split('_');tiles[(int(x),int(y))]=Image.open(f).convert('RGB')
xs=sorted({k[0] for k in tiles});ys=sorted({k[1] for k in tiles});print('tiles',len(tiles),xs,ys,file=sys.stderr)
def elev(lat,lon):
    n=2**Z;fx=(lon+180)/360*n;fy=(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n
    px=fx*256-0.5;py=fy*256-0.5
    x0=math.floor(px);y0=math.floor(py);tx=px-x0;ty=py-y0
    def g(ix,iy):
        t=tiles.get((ix//256,iy//256))
        if t is None: return None
        r,gg,b=t.getpixel((ix%256,iy%256));return r*256+gg+b/256-32768
    v=[g(x0,y0),g(x0+1,y0),g(x0,y0+1),g(x0+1,y0+1)]
    if any(a is None for a in v):
        v=[a for a in v if a is not None]
        return sum(v)/len(v) if v else None
    return v[0]*(1-tx)*(1-ty)+v[1]*tx*(1-ty)+v[2]*(1-tx)*ty+v[3]*tx*ty
LAT0,LON0=40.77,-96.64;KX=111320*math.cos(math.radians(LAT0));KY=111000.0
G=641;HALF=16400.0
grid=[]
for j in range(G):          # j: north index (south->north)
    nn=-HALF+2*HALF*j/(G-1)
    for i in range(G):
        x=-HALF+2*HALF*i/(G-1)
        grid.append(elev(LAT0+nn/KY,LON0+x/KX))
good=[v for v in grid if v is not None];mn=min(good);mx=max(good)
# cells outside the downloaded tiles take the nearest covered value along the row, then the column, so the edge is flat and not a cliff
for j in range(G):
    row=grid[j*G:(j+1)*G];last=None
    for i in range(G):
        if row[i] is None: row[i]=last
        else: last=row[i]
    last=None
    for i in range(G-1,-1,-1):
        if row[i] is None: row[i]=last
        else: last=row[i]
    grid[j*G:(j+1)*G]=row
for i in range(G):
    last=None
    for j in range(G):
        if grid[j*G+i] is None: grid[j*G+i]=last
        else: last=grid[j*G+i]
    last=None
    for j in range(G-1,-1,-1):
        if grid[j*G+i] is None: grid[j*G+i]=last
        else: last=grid[j*G+i]
grid=[v if v is not None else mn for v in grid]
print('elev range',mn,mx,file=sys.stderr)
json.dump(dict(g=G,half=HALF,min=mn,max=mx,d=[int(round((v-mn)*10)) for v in grid]),open('terrain.json','w'))
