# STARCITY

An interactive 3D map of Lincoln, Nebraska that runs in a web browser. One HTML file, no server, no API keys.

Open `index.html` in any modern browser, or host the repo with GitHub Pages.

## What is in it

- 91,313 real buildings. 88,942 of the outlines come from the City of Lincoln and Lancaster County's 2026 footprint layer. Houses get hip and gable roofs and chimneys, larger buildings get parapets, rooftop equipment and windows that light up at night.
- Tap a house for its style and the year it was built (58,862 houses, from county assessor records). No owner names, mailing addresses or property values are used anywhere.
- 131 miles of bike trails (paved, crushed rock and dirt) and 52 miles of on-street bike lanes and signed routes, color-coded. Tap one for its name, surface and length.
- Bike ride mode: ride any trail end to end, ride between any two spots on the network, or ride everything in one trip. Where the network does not connect, the ride bridges the gap and the bridge is drawn as a dashed arc.
- Real terrain: the ground follows about 106 m of relief across the city.
- Hand-modeled Nebraska State Capitol (tower, gold dome, the Sower) and Memorial Stadium (bowl, field to scale, press boxes).
- 46,800 street and path segments with lane lines, plus sidewalks, rail lines, creeks, lakes, parks and parking lots.
- Individually mapped trees, with more scattered inside mapped woods and parks.
- Walk mode: drop to street level and move around on foot (joystick on phones, WASD on a keyboard).
- Bridges and overpasses raised above the roads and creeks they cross.
- StarTran buses moving along their routes at their scheduled positions.
- Live layers when hosted on the web: current weather at Lincoln Airport, a Now button that sets the real time of day, and USGS stream gauges with current flow.
- Search for any street, address, building, park, neighborhood or trail.
- Time-of-day slider with sun, shadows, street lights and stars.
- Game day mode for the stadium, and a guided tour from the Capitol to the Devaney Center.

Two fan touches:

- Memorial Stadium carries its Volleyball Day in Nebraska record. On Aug 30, 2023, an announced crowd of 92,003 watched Nebraska play Omaha there, reported at the time as the world record for attendance at a women's sporting event.
- The Devaney Sports Center wears a rooftop sign reading "Center of the Volleyball Universe". The sign is this map's own addition. There is no such sign on the real building.

## What is approximate

- Building outlines come from three sources: 88,942 from the city and county 2026 footprint layer (576 outlines the layer marks as demolished are left out), 2,047 from OpenStreetMap and 324 from Microsoft's machine-traced footprints. Tap a building to see which.
- The city draws connected structures (a mall, a hospital, downtown blocks joined by skywalks) as one outline. In 371 such cases OpenStreetMap splits the outline into separate buildings that cover it, and those 1,095 OpenStreetMap buildings are used instead, because each carries its own height and name.
- Heights: 58,498 houses use the county assessor's story count, converted to a wall height. 13,983 buildings use Microsoft's height estimates, which are modeled from aerial imagery and not surveyed. 709 use heights tagged in OpenStreetMap and 85 are set by hand. The remaining 18,038 are guessed from building type and footprint size. Tap a building to see which.
- Roof shapes, chimneys, parapets, rooftop units and penthouses are generated from each building's outline and type. They are not surveyed. A house drawn with a hip roof may really have a gable.
- Year built and house style come from Lancaster County Assessor parcel records, joined to footprints by parcel number. On a parcel with several buildings only the largest one shows them.
- Trails combine OpenStreetMap with the City of Lincoln Parks and Recreation trail layers (commuter trails, Wilderness Park trails, and park single track). 198 OpenStreetMap paths are shown as trails because the city data says they are, and 114 pieces come from the city data alone. Wilderness Park's Red, Green and Yellow trails are open to bikes according to the city; horses are allowed on Red and Green only.
- Bike ride mode is for exploring the map. It is not navigation advice. Lines are joined where they touch or cross at street level. The network's 43 separate pieces are joined by 42 straight bridges, and 116 shorter gaps are bridged the same way. A bridge may cross private land or a road with no safe crossing.
- Bus positions are computed from the published timetable. StarTran's live GPS feed cannot be read from a web page, so these are where each bus is scheduled to be, not where it is.
- Weather and stream gauges load only when the page is served from a website. Opened as a local file, the map still works without them. USGS gauge readings are provisional.
- Terrain comes from roughly 15 m elevation tiles, so small features like creek banks and road cuts are smoothed out.
- Trees inside woods and parks are placed procedurally. Only the 6,201 individually mapped trees are at surveyed positions.
- Bridges are raised by a fixed rule, not to their real clearance.

See `ROADMAP.md` for what is planned next.

## Rebuilding from source

1. Run `get_data.ps1` in PowerShell. It downloads OpenStreetMap data for the Lincoln area in 12 pieces from the Overpass API.
2. Run `get_more.ps1`. It downloads Microsoft's Nebraska building footprints and 25 terrain tiles.
3. Run `get_city.ps1`. It downloads Microsoft's global footprints with height estimates, the StarTran schedule, and samples of the live feeds.
4. Run `get_city2.ps1`. It downloads the city's 2026 building footprints, structure type and year built per parcel, and the city trail layers.
5. Optional: `get_trees.ps1` downloads the city's public tree inventory. The pipeline does not use it yet.
6. From inside `src/`, run `extra.py` (statewide footprints and terrain grid), `gtfs.py` (bus schedule), `process.py` (merge, clean and compress everything) and `build.py` (combine `page.html` with the data). The scripts read the downloads from the folder above `src/`, or from the folder named in the `STARCITY_DATA` environment variable.
7. Copy the `index.html` that `build.py` writes to the top of the repo.

Python 3 with Pillow (for the terrain tiles). The page loads three.js from a CDN.

## Data and credits

- Map data © OpenStreetMap contributors, available under the Open Database License (ODbL). See https://www.openstreetmap.org/copyright
- Building footprints, parcel structure records (Lancaster County Assessor) and trail layers (Lincoln Parks and Recreation) from the City of Lincoln and Lancaster County GIS services. The city publishes these as public open data and states no license.
- Additional building footprints and height estimates from Microsoft US Building Footprints and Global ML Building Footprints, under the ODbL. See https://github.com/microsoft/USBuildingFootprints
- Elevation from Mapzen Terrain Tiles hosted on AWS Open Data, which in the United States derive from USGS 3DEP. See https://github.com/tilezen/joerd/blob/master/docs/attribution.md
- Bus routes and timetables from the StarTran GTFS feed
- Current weather from the National Weather Service API, and streamflow from the USGS Water Data API (both public domain)
- Rendering uses three.js (MIT license)

The code in this repository is released under the MIT license. The building and map data embedded in `index.html` remain under the ODbL.
