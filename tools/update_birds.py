"""Write birds.json for the map from eBird (Cornell Lab of Ornithology).

Needs a free eBird API key: https://ebird.org/api/keygen
Run:  EBIRD_API_KEY=yourkey python3 tools/update_birds.py
Not yet run against the live service: written from the eBird API 2.0 documentation.
Keep the key out of the repository. On GitHub, store it as an Actions secret.

birds.json holds two things the map reads when it sits next to index.html:
  obs:  recent sightings in Lancaster County, each at the spot it was reported
  freq: the share of recent checklists that reported each species ("who is around")
"""
import json, os, sys, time, urllib.request, datetime

KEY = os.environ.get("EBIRD_API_KEY")
REGION = "US-NE-109"          # Lancaster County, Nebraska
API = "https://api.ebird.org/v2/"
if not KEY:
    sys.exit("Set EBIRD_API_KEY first.")

def get(path):
    req = urllib.request.Request(API + path, headers={"X-eBirdApiToken": KEY})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

recent = get(f"data/obs/{REGION}/recent?back=14")
obs = [{"c": o.get("comName"), "s": o.get("sciName"), "lat": o.get("lat"), "lng": o.get("lng"),
        "d": (o.get("obsDt") or "")[:10], "n": o.get("howMany")} for o in recent if not o.get("locationPrivate")]
names = {o["speciesCode"]: (o.get("comName"), o.get("sciName")) for o in recent}

lists = get(f"product/lists/{REGION}?maxResults=100")
seen, n = {}, 0
for cl in lists:
    try:
        view = get("product/checklist/view/" + cl["subId"])
    except Exception:
        continue
    n += 1
    for code in {o["speciesCode"] for o in view.get("obs", [])}:
        seen[code] = seen.get(code, 0) + 1
    time.sleep(0.2)
missing = [c for c in seen if c not in names]
for i in range(0, len(missing), 50):
    for t in get("ref/taxonomy/ebird?fmt=json&species=" + ",".join(missing[i:i + 50])):
        names[t["speciesCode"]] = (t.get("comName"), t.get("sciName"))
freq = sorted(({"c": names[c][0], "s": names[c][1], "p": round(k / n, 4)} for c, k in seen.items() if c in names and n),
              key=lambda q: -q["p"])
out = {"source": "eBird", "region": REGION, "updated": datetime.datetime.utcnow().isoformat() + "Z",
       "checklists": n, "obs": obs, "freq": freq}
json.dump(out, open("birds.json", "w"), separators=(",", ":"))
print(f"birds.json: {len(obs)} recent sightings, {len(freq)} species across {n} checklists")
