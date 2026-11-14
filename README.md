# STARCITY

An interactive 3D map of Lincoln, Nebraska that runs in a web browser. One HTML file, no server, no API keys.

**Open the live map: https://robotwhitebread.github.io/STARCITY/**

That link works on a phone or a computer. Nothing to install. You can also download `index.html` and open it in any modern browser.

## What is in it

- 91,313 real buildings. 88,942 of the outlines come from the City of Lincoln and Lancaster County's 2026 footprint layer. Houses get hip and gable roofs and chimneys, larger buildings get parapets, rooftop equipment and windows that light up at night.
- Tap a house for its style and the year it was built (58,862 houses, from county assessor records). No owner names, mailing addresses or property values are used anywhere.
- 132 miles of bike trails (paved, crushed rock and dirt) and 52 miles of on-street bike lanes and signed routes, color-coded. Tap one for its name, surface and length.
- Bike ride mode: ride any trail end to end, ride between any two spots, or ride everything. Ride everything covers every inch of all 184.5 miles in one trip. It turns around at dead ends, retraces to the next closest route, uses regular streets to get between routes, paints what it has ridden white, and says what it is doing as it goes. Orange dots mark the 304 dead ends. Blue lines mark the regular streets that link one bike route to the next.
- Weather layer: wind streaks that blow the way the wind is blowing, rain and snow that fall where the radar shows them, lightning when a thunderstorm is reported, and National Weather Service warnings drawn on the map with the warned area and the storm's last reported position. A preview button shows what each looks like on a calm day, clearly marked as simulated.
- Tap any building for its footprint size and county parcel number, with links to its Lancaster County property record and to Street View. The map stores only the parcel number. Owner names, values and sales stay on the county's site.
- Map controls made for a phone: the spot you grab stays under your finger, a flick keeps the map gliding, pinch or scroll zooms toward the point you are on, double tap zooms in. There is a 2D top-down view, a Find me button (a blue dot from your device's location, which never leaves the device), and Share view links that open the map at an exact view.
- A Guide button with three tabs: what the map does, fifteen things to try (each one takes you there), and where the data comes from. The Menu button and the small button at the bottom left fold the controls away for a clear view.
- Labels that stay readable: dark outlines, name pills on buildings, and text that grows as you zoom in.
- Traffic heat wave: walls of color rise along the busier roads and swell with the time of day on the slider. This is an estimate, not live traffic. See below.
- Birds overhead with their common and scientific names. On the website copy, recent local reports from iNaturalist circle the spot where each bird was seen, and species turn up in proportion to their share of local reports for the month.
- Real terrain: the ground follows about 106 m of relief across the city.
- Hand-modeled Nebraska State Capitol (tower, gold dome, the Sower) and Memorial Stadium (bowl, field to scale, press boxes).
- 46,800 street and path segments with lane lines, plus sidewalks, rail lines, creeks, lakes, parks and parking lots.
- Individually mapped trees, with more scattered inside mapped woods and parks.
- Walk mode: drop to street level and move around on foot (joystick on phones, WASD on a keyboard).
- Bridges and overpasses raised above the roads and creeks they cross.
- StarTran buses moving along their routes at their scheduled positions.
- Live layers when hosted on the web: current weather and alerts, radar, a Now button that sets the real time of day, and USGS stream gauges with current flow.
- Search for any street, address, building, park, neighborhood or trail.
- Time-of-day slider with sun, shadows, street lights and stars.
- Game day mode for the stadium, and a guided tour from the Capitol to the Devaney Center.

City life, all of it this map's own decoration: giraffes that eat lettuce falling from the sky and penguins around a pool at the Lincoln Children's Zoo, Airedale Terriers, German Shorthaired Pointers, Beagles and Pugs playing at the dog parks and dog bars, and cyclists riding the trails while the Bike ride layer is on.

Options under More: Pride (the Capitol tower in rainbow colors, the Sower as a rainbow sprinkler, and a pulsing rainbow that spreads from the Capitol lawn across every street and tree in the city, with an intensity bar) and Volleyballs (it rains and snows volleyballs).

Fan touches:

- Memorial Stadium carries its Volleyball Day in Nebraska record. On Aug 30, 2023, an announced crowd of 92,003 watched Nebraska play Omaha there, reported at the time as the world record for attendance at a women's sporting event.
- The Devaney Sports Center, aka DBK Universe, wears a rooftop sign that cycles through its names and Nebraska volleyball's crowd records: Bob Devaney Sports Center (opened 1976, named 1978), John Cook Arena (named April 11, 2025), Terry Pettit Court (dedicated Sept 6, 2013), head coach Dani Busboom Kelly, the home sellout streak, and the record crowds, each with its date. Tap the sign for the full list. The sign, the giant volleyball and the marker for the John Cook statue are this map's own additions.

## What is approximate

- Building outlines come from three sources: 88,942 from the city and county 2026 footprint layer (576 outlines the layer marks as demolished are left out), 2,047 from OpenStreetMap and 324 from Microsoft's machine-traced footprints. Tap a building to see which.
- The city draws connected structures (a mall, a hospital, downtown blocks joined by skywalks) as one outline. In 371 such cases OpenStreetMap splits the outline into separate buildings that cover it, and those 1,095 OpenStreetMap buildings are used instead, because each carries its own height and name.
- Heights: 58,498 houses use the county assessor's story count, converted to a wall height. 13,983 buildings use Microsoft's height estimates, which are modeled from aerial imagery and not surveyed. 709 use heights tagged in OpenStreetMap and 85 are set by hand. The remaining 18,038 are guessed from building type and footprint size. Tap a building to see which.
- Roof shapes, chimneys, parapets, rooftop units and penthouses are generated from each building's outline and type. They are not surveyed. A house drawn with a hip roof may really have a gable.
- Year built and house style come from Lancaster County Assessor parcel records, joined to footprints by parcel number. On a parcel with several buildings only the largest one shows them.
- Trails combine OpenStreetMap with the City of Lincoln Parks and Recreation trail layers (commuter trails, Wilderness Park trails, and park single track). 198 OpenStreetMap paths are shown as trails because the city data says they are, and 114 pieces come from the city data alone. Wilderness Park's Red, Green and Yellow trails are open to bikes according to the city; horses are allowed on Red and Green only.
- Bike ride mode is for exploring the map. It is not navigation or safety advice. The network is built from the map itself: every trail, bike lane and signed route, plus ordinary streets and paths (never freeways, private drives, tunnels or sidewalks). Bike facilities alone form 155 separate islands. The shortest street links between each island and its nearest neighbor add up to 8.0 miles. In 19 places no usable street reaches a piece of trail, and a straight dashed bridge stands in. Regular streets are chosen by street type and length only. Nobody has checked them for traffic, crossings or pavement.
- Ride everything was run start to finish as a test: 184.5 of 184.5 miles covered, zero feet missed. It takes about 370 miles of riding to do it (139 retracing, 42 on regular streets, 4 on bridges) and 513 turnarounds. One-way streets are ridden the legal way when covering a bike lane.
- Weather: observations and alerts come from the National Weather Service, radar from the Iowa Environmental Mesonet's NEXRAD mosaic. The radar part was tested against a stand-in picture, not the live service. Lightning flashes mean the airport reports a thunderstorm. They do not mark real strikes. The funnel on a tornado warning is the storm position the Weather Service last reported, moved along the motion it reported. It is not a sighting. Rain or snow is decided by the airport temperature, because radar cannot tell them apart.
- The traffic heat wave is an estimate. How busy a road is comes from its type (interstate, highway, arterial, collector) and how busy the hour is comes from a typical weekday curve. It uses no traffic counts and no live speeds. Measured counts are on the roadmap.
- Birds: without live data, flocks follow a hand-made table of which species are usually around eastern Nebraska each month. On the website copy, the "who is around" percentages are each species' share of iNaturalist bird reports near Lincoln for the month, across all years. A share of reports is not a count of birds, and common or easy to photograph birds are over-represented. The iNaturalist requests were tested against stand-in responses, not the live service. `tools/update_birds.py` can add eBird sightings and checklist frequencies for Lancaster County. It needs a free eBird key and has not been run yet.
- County property links: 90,039 of the 91,313 buildings carry a parcel number. 1,097 of those took the number of the larger city outline they were split from, and their link says "County record for this site". The link format was checked on one county record.
- The zoo animals stand on open ground inside the zoo that was picked by hand. The real giraffe and penguin exhibits are not in the data. Four dog businesses are mapped as buildings, so their dogs play on the nearest open ground beside the building. The John Cook statue marker is north of the arena, where the real statue is reported to stand, but its exact spot is a guess and the figure is drawn larger than life.
- Find me uses the browser's location service. The position is drawn on the map and is not sent anywhere.
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
5. Optional: `get_trees.ps1` downloads the city's public tree inventory, and `get_live2.ps1` checks which live city feeds a web page can read (traffic cameras, road closures, crash list, bike share) and saves samples. The pipeline does not use either yet.
6. From inside `src/`, run `extra.py` (statewide footprints and terrain grid), `gtfs.py` (bus schedule), `process.py` (merge, clean and compress everything) and `build.py` (combine `page.html` with the data). The scripts read the downloads from the folder above `src/`, or from the folder named in the `STARCITY_DATA` environment variable.
7. Copy the `index.html` that `build.py` writes to the top of the repo.

Python 3 with Pillow (for the terrain tiles). The page loads three.js from a CDN.

## Data and credits

- Map data © OpenStreetMap contributors, available under the Open Database License (ODbL). See https://www.openstreetmap.org/copyright
- Building footprints, parcel structure records (Lancaster County Assessor) and trail layers (Lincoln Parks and Recreation) from the City of Lincoln and Lancaster County GIS services. The city publishes these as public open data and states no license.
- Additional building footprints and height estimates from Microsoft US Building Footprints and Global ML Building Footprints, under the ODbL. See https://github.com/microsoft/USBuildingFootprints
- Elevation from Mapzen Terrain Tiles hosted on AWS Open Data, which in the United States derive from USGS 3DEP. See https://github.com/tilezen/joerd/blob/master/docs/attribution.md
- Bus routes and timetables from the StarTran GTFS feed
- Current weather and alerts from the National Weather Service API, and streamflow from the USGS Water Data API (both public domain)
- Radar mosaic tiles from the Iowa Environmental Mesonet, Iowa State University
- Recent bird reports and species counts from iNaturalist's public API. Observations belong to the people who made them. See https://www.inaturalist.org
- Links out, with nothing copied: Lancaster County Assessor/Register of Deeds property records, Google Street View, the BirdCast migration dashboard and eBird's Lancaster County page (both from the Cornell Lab of Ornithology and partners)
- Rendering uses three.js (MIT license)

The code in this repository is released under the MIT license. The building and map data embedded in `index.html` remain under the ODbL.
