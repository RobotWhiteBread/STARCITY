// STARCITY live aircraft relay (Cloudflare Worker). Not deployed. See README.md in this folder.
// It asks one public feed for aircraft near Lincoln Airport and passes back only what the map draws.
const ALLOWED = 'https://robotwhitebread.github.io';                 // the only page allowed to ask
const FEED = 'https://api.adsb.lol/v2/point/40.851/-96.759/30';      // 30 nautical miles around LNK
const KEEP_SECONDS = 10;

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const headers = { 'Access-Control-Allow-Origin': ALLOWED, 'Vary': 'Origin', 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=' + KEEP_SECONDS };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'GET' || (origin && origin !== ALLOWED)) return new Response('{"error":"not allowed"}', { status: 403, headers });
    const cache = caches.default, key = new Request('https://relay.invalid/lnk');
    let hit = await cache.match(key);
    if (hit) return hit;
    let out = { at: Date.now(), ac: [] };
    try {
      const r = await fetch(FEED, { headers: { 'User-Agent': 'STARCITY-map relay' } });
      const j = await r.json();
      out.ac = (j.ac || []).filter(a => a.lat != null && a.lon != null).map(a => ({
        lat: a.lat, lon: a.lon, alt: a.alt_baro === 'ground' ? 0 : (a.alt_baro || 0), track: a.track || 0, gs: a.gs || 0,
        flight: (a.flight || '').trim(), type: a.t || ''
      }));
    } catch (e) { out.error = 'feed did not answer'; }
    const res = new Response(JSON.stringify(out), { headers });
    ctx.waitUntil(cache.put(key, res.clone()));
    return res;
  }
};
