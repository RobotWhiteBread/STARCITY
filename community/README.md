# community/

Layers added through the olive branch live here. The map reads `index.json` when it opens on the website and lists each layer under **From the community**, with the contributor's name on its card.

## Add a layer in five lines

1. Save your places as GeoJSON in this folder: points, lines or areas, in ordinary latitude and longitude (WGS84). Give each feature a few plain properties such as `name`, `note`, `website`.
2. Add one entry to `index.json`:

```json
{ "title": "Little free libraries", "file": "little-libraries.geojson", "kind": "points",
  "by": "Your organization", "source": "Where the facts come from", "asof": "2026-11-14",
  "about": "One or two sentences a neighbor would understand." }
```

3. `kind` is `points`, `lines` or `areas`. `file` is a name in this folder ending in `.geojson`.
4. Open a pull request against the `olive-branch` branch.
5. That is all. `example.geojson` is a template; it is not listed, so it is not drawn.

## Rules

- Places, not people. No names or homes of private individuals. Properties whose names look like owner, contact, phone or email are dropped by the map and should not be in the file.
- Say where the facts come from and as of when.
- Keep a file under about 2,000 features so it opens quickly on a phone.
- The map shows what the file says. It does not check it. The card says so.
