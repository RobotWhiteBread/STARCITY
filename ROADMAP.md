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
| 0.7 | Bike layer rebuilt on the real street network: routes follow regular streets between bike routes, dead ends and street links are shown, and ride everything covers every inch (tested: zero feet missed). Weather layer: wind, rain, snow, lightning, warnings, radar, with a simulated preview |
| 0.6 | Rebuilt on the city's 2026 footprints (91,313 buildings). Story counts and year built from assessor records. Hip and gable roofs, chimneys, parapets, penthouses. All bike trails and bike streets (184 miles) from OpenStreetMap and the city trail layers. Bike ride mode with routing between any two spots, a ride-everything trip and bridged gaps. Volleyball Day record on Memorial Stadium |
| 0.8 | Phone-friendly controls (grab and flick panning, zoom to the point you are on, double tap, 2D view, Find me, Share view). Labels that pop. Bolder weather effects that follow the radar at any zoom. Traffic heat wave (estimate). County property record and Street View links on every building. Birds with local iNaturalist reports and share-of-reports percentages. City life: zoo giraffes and penguins, four dog breeds, cyclists. Devaney names and crowd records. Pride wave with an intensity bar. Volleyball storm. |

## Next

1. Run `get_live2.ps1`. It saves the city and state service catalogs, the traffic camera lists, road closures, the police crash list and bike share status, and records which of them a web page is allowed to read. Cameras, closures and the city GIS lookups below depend on what it finds.
2. Traffic cameras: markers on the map and a side panel that shows the picture. The city says its camera feeds are public, and the state publishes highway cameras, but neither list has been read yet.
3. Real numbers for the traffic heat wave: the city's and the state's traffic counts in place of the road-type estimate, then closures and crashes as they are posted. There is no free live feed of traffic speeds.
4. Run `get_places.ps1`. It downloads every business and place to eat that OpenStreetMap has for Lincoln. With it: a tall see-through column that lists local businesses, and a second one for restaurants by type of food, each entry flying to its spot on the map.
5. City GIS on a tap: zoning, floodplain, historic district and council district for the spot you tapped. Flood and historic layers are already downloaded. Live lookups need the service catalog from step 1.
6. Birds from the Cornell Lab: run `tools/update_birds.py` with a free eBird key for Lancaster County sightings and checklist frequencies (the same data Merlin's likely-birds lists are built on). Then a scheduled job to refresh it. BirdCast's nightly migration numbers have no documented public feed, so that stays a link until one is found.
7. Memorial Stadium, below the volleyball record: a tracker of Nebraska football's one-score losses, with the odds of a run like that happening by chance. Needs a sourced game-by-game list first.
8. A Capitol tracker: words spoken on the floor by each senator in a session, from the Legislature's public transcripts, shown by legislative district across the state. Needs a check of how the transcripts are published, and a statewide base map.
9. A statewide Nebraska edition. One file cannot hold a state, so it needs map tiles that load as you move, a detail level for each zoom, and a place to host them.
10. A test on real phones, and a lighter drawing mode if it runs hot.
11. On-street bike routes from the city's own bike map, the city's public tree inventory (`get_trees.ps1`), a growth timeline from year built, and a shorter ride-everything trip.

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
5. Check the radar tiles on the hosted site. The radar code has only been run against a stand-in picture.

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
