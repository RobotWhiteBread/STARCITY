# STARCITY: turn each USGS 2016 LiDAR tile into a small grid of height above ground.
# For every 15 foot cell: ground = lowest ground-class return, top = highest other return,
# plus how many returns came from pulses that hit more than one thing (trees do, roofs mostly do not).
# Writes one .npz per tile next to this script. Nothing leaves this computer.
import laspy, numpy as np, glob, os, sys, time
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lidar'); OUT = os.path.dirname(os.path.abspath(__file__)); C = 15.0
budget = float(sys.argv[1]) if len(sys.argv) > 1 else 1e9; t0 = time.time(); done = 0
for f in sorted(glob.glob(os.path.join(SRC, '*.laz'))):
    name = os.path.basename(f)[:-4].split('_')[-1]; o = os.path.join(OUT, name + '.npz')
    if os.path.exists(o) or os.path.getsize(f) < 100000: continue
    if time.time() - t0 > budget: break
    try:
        with laspy.open(f) as r:
            h = r.header; x0 = np.floor(h.mins[0] / C) * C; y0 = np.floor(h.mins[1] / C) * C
            nx = int(np.ceil((h.maxs[0] - x0) / C)) + 1; ny = int(np.ceil((h.maxs[1] - y0) / C)) + 1
            g = np.full(nx * ny, np.inf, np.float32); top = np.full(nx * ny, -np.inf, np.float32); n = np.zeros(nx * ny, np.uint32); m = np.zeros(nx * ny, np.uint32)
            for c in r.chunk_iterator(3_000_000):
                x = np.asarray(c.x); y = np.asarray(c.y); z = np.asarray(c.z, dtype=np.float32); cl = np.asarray(c.classification); nr = np.asarray(c.number_of_returns)
                i = (np.floor((y - y0) / C).astype(np.int64) * nx + np.floor((x - x0) / C).astype(np.int64))
                gm = cl == 2; np.minimum.at(g, i[gm], z[gm])
                vm = cl == 1; np.maximum.at(top, i[vm], z[vm]); n += np.bincount(i[vm], minlength=nx * ny).astype(np.uint32); m += np.bincount(i[vm & (nr > 1)], minlength=nx * ny).astype(np.uint32)
        g = g.reshape(ny, nx); top = top.reshape(ny, nx)
        # fill cells with no ground return from their neighbors
        for _ in range(6):
            bad = ~np.isfinite(g)
            if not bad.any(): break
            p = np.pad(g, 1, constant_values=np.inf); nb = np.minimum.reduce([p[:-2, 1:-1], p[2:, 1:-1], p[1:-1, :-2], p[1:-1, 2:]]); g[bad] = nb[bad]
        ht = np.where(np.isfinite(top) & np.isfinite(g), top - g, 0); ht = np.clip(ht, 0, 255).astype(np.uint8)
        n2 = n.reshape(ny, nx); mf = np.where(n2 > 0, 255.0 * m.reshape(ny, nx) / np.maximum(n2, 1), 0).astype(np.uint8)
        np.savez_compressed(o, ht=ht, mf=mf, n=np.clip(n2, 0, 255).astype(np.uint8), x0=x0, y0=y0, cell=C, pts=h.point_count)
        done += 1; print(name, h.point_count, round(time.time() - t0), flush=True)
    except Exception as e:
        print(name, 'FAILED', str(e)[:120], flush=True)
print('done this run', done, 'total', len(glob.glob(os.path.join(OUT, '*.npz'))), flush=True)
