# STARCITY roadmap

The goal: the most detailed open 3D map of Lincoln, Nebraska that runs in a browser, built only from open data, with every approximation labeled.

## Done

| Version | What it added |
|---|---|
| 0.1 | 53,941 OpenStreetMap buildings, streets, water, parks, trees, hand-modeled Capitol and Memorial Stadium, sun and shadows, tour |
| 0.2 | Search, night street lights and stars, game day mode, north-up, place links |
| 0.3 | 26,995 extra buildings from Microsoft footprints (80,936 total), real terrain |
| 0.4 | Walk mode, raised bridges and overpasses, automatic quality fallback on slow devices |
| 0.5 | City of Lincoln footprints as the base layer, Microsoft height estimates, scheduled StarTran buses, live weather, Now button, USGS stream gauges |
| 0.5.1 | Found that the city layer used in 0.5 is the 2007 survey. Removed 832 outlines that recent sources contradict |
| 0.6 | Rebuilt on the city's 2026 footprints (91,313 buildings). Story counts and year built from assessor records. Hip and gable roofs, chimneys, parapets, penthouses. All bike trails and bike streets (184 miles) from OpenStreetMap and the city trail layers. Bike ride mode with routing between any two spots, a ride-everything trip and bridged gaps. Volleyball Day record on Memorial Stadium |

## Next

1. The city's public tree inventory in place of the scattered stand-in trees: real positions, species and trunk diameter. `get_trees.ps1` downloads it. The first attempt at this download failed, so the script now retries and reports what the server answers.
2. A growth timeline. Year built is already in the data for 58,862 houses. Color or reveal buildings by year and watch the city spread out from the Capitol.
3. A smarter ride-everything trip. The current one covers all 184 miles but rides about 380 to do it, because it always heads for the nearest stretch it has not ridden. A proper route inspection solution would cut the repeats.
4. Bridge gaps in the bike network along real streets instead of straight lines.

## Then: what would make it stand out

1. Measured heights and roof shapes from the April 2022 lidar survey of Lancaster County (quality level 1). This is the step that makes the skyline and the roofs real instead of generated.
2. Flood view: FEMA flood zones and the Salt Creek levees on the terrain, with the live stream gauges. The layers are downloaded and not yet used.
3. Aerial imagery on the ground, and roof colors sampled from it.
4. An accuracy report: every height source checked against buildings with known heights.

## Still open

1. Confirm the reuse terms of the city layers. The city describes its open data as license-free but publishes no license text for these layers.
2. Live bus positions. StarTran's GPS feed sends no cross-origin header, so a web page cannot read it. A small relay (for example a scheduled GitHub Action that copies the feed into the repo every few minutes) would make near-live positions possible.
3. Check the live layers on the hosted site. They were tested against saved samples of the real feeds, not against the feeds themselves from a browser.
4. Test on more phones. The map has been tested in desktop Chrome at phone and desktop window sizes with a software renderer.

## Later: measured heights from lidar

1. Download USGS 3DEP lidar tiles for Lancaster County (tens of GB, processed locally, not committed).
2. For each footprint, take the roof height from the lidar returns inside it minus the ground height around it.
3. Derive real roof shapes for large buildings, and a tree canopy layer from the vegetation returns.
4. Replace the 15 m terrain with a 1 to 3 m grid near creeks and downtown.

## Later: more hand-modeled landmarks

Devaney Sports Center, Pinnacle Bank Arena, Haymarket Park, Sunken Gardens, Love Library, Mueller Tower, Sheldon Museum of Art, the Lied Center, Lincoln Station, and the downtown towers.

## Later: polish and reach

1. Level of detail so far-away neighborhoods cost less on phones.
2. Layer toggles (buildings by age or type, transit, water).
3. A short screen recording and a write-up for the README.
4. Contribute corrected heights and missing buildings back to OpenStreetMap.

## Out of scope for now

Photorealistic capture (Gaussian splatting) needs aerial or drone imagery this project does not have.
