# STARCITY: bare-ground elevation for the topography view, from the 2022 Lancaster County LiDAR survey.
# Input: ground_2022_10ft.bin, made by lidar_2022_ground_pack.ps1 from the county's 1 ft ground tiles.
#   Per tile: int32 easting, int32 northing of the south-west corner (county feet), then 150 x 150 uint16 values,
#   tenths of a foot above sea level (NAVD88), 10 ft cells, north row first, 0 = no data.
# Output: data/lidar-ground.png, a 2048 x 2048 picture of the map's 32.8 km square, 16 m per pixel.
#   red and green hold the elevation: feet = (red * 256 + green) / 10.   blue is 255 where LiDAR covers the pixel, 0 where it does not.
# Each pixel is the average of nine samples inside it. Where the 2022 survey has no data, an older picture can fill in.
# Run: python3 tools/lidar/build_ground_2022.py <ground_2022_10ft.bin> [out.png] [older.png]
import sys, os, math, numpy as np
from pyproj import Transformer
from PIL import Image
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else 'data/lidar-ground.png'; old = sys.argv[3] if len(sys.argv) > 3 else None
N = 2048; HALF = 16400.0; KX = 111320 * math.cos(math.radians(40.77)); px = 2 * HALF / N; TS = 1500; C = 150
CRS = '+proj=tmerc +lat_0=40.25 +lon_0=-96.68805555555556 +k=1.000054615 +x_0=50000 +y_0=0 +datum=NAD83 +units=us-ft +no_defs'  # NAD 1983 Nebraska Lancaster County, US feet
T = Transformer.from_crs(4326, CRS, always_xy=True)
rec = np.dtype([('e', '<i4'), ('n', '<i4'), ('g', '<u2', (C, C))])
t = np.fromfile(src, rec); print(len(t), 'tiles')
e0, n0 = t['e'].min(), t['n'].min(); W = (t['e'].max() - e0) // TS + 1; Hh = (t['n'].max() - n0) // TS + 1
big = np.zeros((Hh * C, W * C), np.uint16)   # row 0 = south
for r in t:
    ci = (r['e'] - e0) // TS * C; ri = (r['n'] - n0) // TS * C
    big[ri:ri + C, ci:ci + C] = r['g'][::-1]
acc = np.zeros((N, N), np.float64); cnt = np.zeros((N, N), np.uint16)
jj, ii = np.mgrid[0:N, 0:N]
for sy in (1/6, 3/6, 5/6):
    for sx in (1/6, 3/6, 5/6):
        x = -HALF + (ii + sx) * px; z = -HALF + (jj + sy) * px
        E, Nn = T.transform(x / KX - 96.64, 40.77 - z / 111000.0)
        ci = np.floor((E - e0) / 10).astype(np.int64); ri = np.floor((Nn - n0) / 10).astype(np.int64)
        m = (ci >= 0) & (ci < big.shape[1]) & (ri >= 0) & (ri < big.shape[0])
        v = np.zeros(E.shape, np.float64); v[m] = big[ri[m], ci[m]]; m &= v > 0
        acc[m] += v[m]; cnt[m] += 1
ok = cnt > 0; el = np.zeros((N, N), np.uint16); el[ok] = np.round(acc[ok] / cnt[ok]).astype(np.uint16)
print('2022 covers %.1f%% of the map square' % (100 * ok.mean()))
if old and os.path.exists(old):
    o = np.asarray(Image.open(old).convert('RGB')).astype(np.uint16); oe = o[..., 0] * 256 + o[..., 1]; f = ~ok & (o[..., 2] > 0)
    both = ok & (o[..., 2] > 0); print('where both exist, 2022 minus older: median %.2f ft' % (np.median(el[both].astype(float) - oe[both]) / 10))
    el[f] = oe[f]; ok |= f; print('older picture filled %.1f%%' % (100 * f.mean()))
img = np.zeros((N, N, 3), np.uint8); img[..., 0] = el >> 8; img[..., 1] = el & 255; img[..., 2] = np.where(ok, 255, 0)
Image.fromarray(img, 'RGB').save(out, optimize=True)
print('covered %.1f%% of the map square, %.0f to %.0f ft, %d KB' % (100 * ok.mean(), el[ok].min() / 10, el[ok].max() / 10, os.path.getsize(out) // 1024))
