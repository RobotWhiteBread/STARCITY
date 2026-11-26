# STARCITY: bare-ground elevation for the topography view, from the USGS 2016 LiDAR survey of Lincoln.
# Input: the per-tile grids made by canopy_run.py (15 ft cells, ground in tenths of a foot, Nebraska State Plane feet).
# Output: data/lidar-ground.png, a 2048 x 2048 picture of the map's 32.8 km square, 16 m per pixel.
#   red and green hold the elevation: feet = (red * 256 + green) / 10.   blue is 255 where LiDAR covers the pixel, 0 where it does not.
# Each pixel is the average of nine samples inside it. Run: python3 tools/lidar/build_ground.py <folder of .npz> [out.png]
import sys, glob, os, math, numpy as np
from pyproj import Transformer
from PIL import Image
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else 'data/lidar-ground.png'
N = 2048; HALF = 16400.0; KX = 111320 * math.cos(math.radians(40.77)); px = 2 * HALF / N
T = Transformer.from_crs(4326, 'EPSG:6880', always_xy=True)   # NAD83(2011) Nebraska State Plane, US feet
tiles = {}
for f in glob.glob(os.path.join(src, '*.npz')):
    d = np.load(f)
    if 'gd' in d.files: tiles[(float(d['x0']), float(d['y0']))] = (d['gd'], float(d['cell']))
print(len(tiles), 'tiles with ground')
acc = np.zeros((N, N), np.float64); cnt = np.zeros((N, N), np.uint16)
jj, ii = np.mgrid[0:N, 0:N]
for sy in (1/6, 3/6, 5/6):
    for sx in (1/6, 3/6, 5/6):
        x = -HALF + (ii + sx) * px; z = -HALF + (jj + sy) * px
        E, Nn = T.transform(x / KX - 96.64, 40.77 - z / 111000.0)
        for (x0, y0), (gd, c) in tiles.items():
            ny, nx = gd.shape
            ci = np.floor((E - x0) / c).astype(np.int64); ri = np.floor((Nn - y0) / c).astype(np.int64)
            m = (ci >= 0) & (ci < nx) & (ri >= 0) & (ri < ny)
            if not m.any(): continue
            v = np.zeros(E.shape, np.float64); v[m] = gd[ri[m], ci[m]]; m &= v > 0
            acc[m] += v[m]; cnt[m] += 1
ok = cnt > 0; el = np.zeros((N, N), np.uint16); el[ok] = np.round(acc[ok] / cnt[ok]).astype(np.uint16)
img = np.zeros((N, N, 3), np.uint8); img[..., 0] = el >> 8; img[..., 1] = el & 255; img[..., 2] = np.where(ok, 255, 0)
Image.fromarray(img, 'RGB').save(out, optimize=True)
print('covered %.1f%% of the map square, %.0f to %.0f ft, %d KB' % (100 * ok.mean(), el[ok].min() / 10, el[ok].max() / 10, os.path.getsize(out) // 1024))
