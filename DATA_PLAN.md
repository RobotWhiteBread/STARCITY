# STARCITY data plan

Every source the map uses, what is kept from it, what is deliberately not requested, when it was last pulled, and how to refresh it. Written for release 0.9 (data pulled November 14, 2026 unless noted).

The same list, with the dates, is inside the map itself: Guide, then The data.

## Rules that apply to every source

1. Public sources only. Nothing behind a login, nothing scraped past a challenge page.
2. Each download names the fields it wants. Owner names, owners' mailing addresses, buyer and seller names, staff names, notes and edit histories are never requested and never stored.
3. A person's name appears in the map only where a public body lists an elected office holder (council member, school board member, state senator).
4. Anything read live is read by the visitor's own browser, straight from the public source, at the moment they ask. STARCITY has no server and keeps no logs.
5. Every estimate is labeled as an estimate where it appears. Every decoration is labeled as one.

## Base addresses

| Short name | Address |
|---|---|
| city | `https://gis.lincoln.ne.gov/public/rest/services` |
| hosted | `https://gis.lincoln.ne.gov/hosted/rest/services/Hosted` |
| ndot | `https://giscat.ne.gov/dot/rest/services` |
| state | `https://giscat.ne.gov/enterprise/rest/services` |

## Saved with the map

These are downloaded by a script, processed, and packed into `index.html`. They change only when the map is rebuilt.

| What | Source | Kept | Script | As of | Refresh |
|---|---|---|---|---|---|
| Streets, trails, land, water, places, named buildings, building websites | OpenStreetMap through the Overpass API | geometry, names, surface, website tags | `get_data.ps1` | 2026-11-14 | when streets or buildings change |
| Building outlines | city: 2026 building footprint layer | outline, demolished flag | `get_city2.ps1` | 2026-11-14 | yearly |
| Story count, year built, house style | Lancaster County Assessor structure records through city GIS | parcel number, stories, year, style | `get_city2.ps1` | 2026-11-14 | yearly |
| Extra footprints and height estimates | Microsoft US and Global ML Building Footprints | outline, height | `get_more.ps1`, `get_city.ps1` | 2026-08-13 release | when Microsoft publishes a new set |
| Terrain | Mapzen Terrain Tiles on AWS (USGS 3DEP) | elevation | `get_more.ps1` | static | not needed |
| Bus routes and timetable | StarTran GTFS feed | routes, stops, times | `get_city.ps1` | 2026-11-14 | each service change |
| Trails by name and surface | city: Parks trail layers | name, surface, class | `get_city2.ps1` | 2026-11-14 | yearly |
| Assessed value per parcel | city: `Assessor/TaxParcels/MapServer/0` | parcel number, assessed value, property class, tax district, school district, neighborhood code, living area | `get_values.ps1`, `get_gis.ps1` | 2026-11-14 | each spring after values are set |
| Property sales, last 12 months | city: `Assessor/PropertySales/MapServer/0` | price, date, sale type, structure type, year built, floor area, assessed value | `get_gis.ps1` | 2026-11-14 | monthly |
| County value and sale summaries | city: `Assessor/PublicAnalytics/MapServer/5` to `8` | value ranges, counts, average and monthly sale figures | `get_gis.ps1` | 2026-11-14 | monthly |
| Property tax levies | Nebraska Department of Revenue, Taxing Unit Group Summary, Lancaster County, tax year 2025 | total levy per tax district | typed into `src/process2.py` from the published list | 2025-11-17 | each November |
| Tax increment districts | hosted: `TIF_Dasboard_Districts/FeatureServer/0` | name, dates, base and excess value, status | `get_gis.ps1` | 2026-11-14 | twice a year |
| Neighborhood associations | city: `UrbanDevelopment/NeighborhoodAssociations/MapServer/0` | name, outline | `get_gis.ps1` | 2026-11-14 | yearly |
| Zoning | city: `Planning/Zoning/MapServer/0` | zone, overlay, category | `get_gis.ps1` | 2026-11-14 | twice a year |
| 1930s redlining grades | city: `Planning/CompPlan2050/MapServer/5` | grade, outline | `get_gis.ps1` | 2026-11-14 | static |
| Census tracts and blocks | city: `Planning/Census/MapServer/0` and `2` | population, income, outline | `get_gis.ps1` | 2026-11-14 | when new Census figures come out |
| Precincts, registration, polling places | Lancaster County Election Commissioner through city GIS (`ElectionCommission` services and hosted `Nov2026_Polling_Places`) | precinct name, registered voters by party, polling place name and address | `get_votes.ps1`, `get_gis.ps1` | 2026-11-14 | before and after each election |
| Council, County Board, school board, NRD, regent and community college districts | city: election boundary layers | district, office holder where the city lists one | `get_votes.ps1` | 2026-11-14 | after each election and each redistricting |
| Legislative and congressional districts | state: `PoliticalBoundaries_2021/MapServer/4` and `1` | district, senator, population | `get_gis.ps1` | 2026-11-14 | after each election |
| Precinct election results, 2012 to 2020 | OpenElections, `openelections-data-ne` (certified county results gathered by volunteers) | votes by candidate and precinct | `git clone` | 2020-11-03 | when newer precinct results are published openly |
| Traffic counts | city: `LTUTraffic/CrashApp/MapServer/2`; ndot: `AnnualAverageDailyTrafficSegmentsOnSystemDOT/MapServer/0` | street name, daily count, count year, speed limit, truck count | `get_gis.ps1` | 2026-11-14 | twice a year |
| Crashes, 2019 | city: `LTUTraffic/CrashApp/MapServer/0` | date, severity, light, surface, pedestrian and cyclist flags | `get_gis.ps1` | 2026-11-14 | when the city posts a newer year |
| Traffic camera locations | city: `LTUTraffic/TrafficCameras/MapServer/0` | location, picture address | `get_gis.ps1` | 2026-11-14 | twice a year |
| Street projects | city: `LTUEngineeringServices/ConstructionProjects/MapServer/0` to `2` | name, summary, dates | `get_gis.ps1` | 2026-11-14 | twice a year |
| City bike network, bike racks, trail counters | city: `Planning/BikeLayers/MapServer/0`, `4`, `5`; `Parks/TrailCounts/MapServer/0`, `1` | street, type, rack capacity, counter site | `get_gis.ps1` | 2026-11-14 | yearly |
| Schools, fire and police stations, libraries, medical facilities | city: `CityCounty/Schools`, `Fire/FireStations`, `Police/PoliceStations`, `Planning/CommunityFacilities`, `Planning/MedicalFacilities` | name, type | `get_gis.ps1` | 2026-11-14 | yearly |
| Public art, playgrounds, restrooms, drinking fountains | city: `Parks/ParkAmenities/MapServer/4`, `6`, `7`, `8` | title, artist, park, type, year | `get_gis.ps1` | 2026-11-14 | yearly |
| City trees | city: `Parks/Trees/MapServer/0` (Parks and Recreation, Community Forestry) | kind, common and scientific name, trunk diameter, site, forestry district, park, city tree ID, life cycle | `get_trees.ps1` | 2026-11-14 | twice a year |
| Local businesses | OpenStreetMap through the Overpass API | name, kind, cuisine, hours, website | `get_places.ps1` | 2026-11-14 | monthly |
| University building pages | University of Nebraska-Lincoln building list at maps.unl.edu | building code and name | `src/unl_buildings.txt` | 2026-11-14 | twice a year |
| Star catalog | Hipparcos and HYG catalogs as packaged by d3-celestial | position, brightness, names, constellation lines | copied from the d3-celestial repository | epoch 2000 | never |
| Volleyball and football results for the current season | ESPN's public scoreboard | date, opponent, score | typed into the layer files as a fallback | 2026-11-14 | the website copy reads them live |

Counts in release 0.9: 91,313 buildings, 86,989 parcels with a value ($38.03 billion), 2,750 sales, 172 precincts, 88,382 city trees on the map out of 121,289 the city lists as living, 1,710 businesses, 11,789 street segments with a traffic count, 6,788 crashes.

Not kept from the tree inventory: the address the city files each tree under, staff names, notes and edit history. The address is read from the city only when a visitor asks for one tree's record.

## Read live by the visitor's browser

Nothing here is stored. Each feed was checked from the public website address to confirm that a web page is allowed to read it.

| What | Source | When it is read |
|---|---|---|
| Current weather | National Weather Service, `api.weather.gov` (station KLNK) | when the page opens, then every 3 minutes |
| Weather alerts | National Weather Service alerts for Lincoln | when the page opens, then every 3 minutes |
| Forecast | National Weather Service grid forecast (OAX 56,40) | when the weather line is tapped |
| Radar | Iowa Environmental Mesonet NEXRAD tiles | when Weather is on |
| Stream gauges | USGS Water Data | when the page opens |
| Husker scores | ESPN public scoreboard (`site.api.espn.com`), team 158 | a few seconds after the page opens, every 20 seconds while a game is on |
| Road closures, snow plowing, street sweepers | city GIS services | when the layer is turned on |
| Floodplains, saline wetlands, tiger beetle habitat, native grasslands, wellhead areas | city GIS services | when the layer is turned on |
| Planning cases and building permits | city: `Planning/DevRevAPPLICATIONS/MapServer/1`, `Planning/Commercial_New_Construction_Permits/MapServer/2` | when the layer is turned on |
| Owner of one parcel | city: `Assessor/TaxParcels/MapServer/0`, one parcel at a time | only when Show owner is pressed |
| One tree's full record | city: `Parks/Trees/MapServer/0`, one tree at a time | only when Read the city's record is pressed |
| Bike share | BikeLNK GBFS feed | when the layer is turned on |
| Air quality | Open-Meteo | when Pulse is opened |
| Bird reports | iNaturalist | when the page opens |
| School districts | Nebraska state GIS | when the layer is turned on |

ESPN does not document or promise its feed. If it stops answering, the scores panel says so and the saved season lists remain.

## Worked out by the map

| Figure | How |
|---|---|
| Property tax per parcel | assessed value times the 2025 levy of the parcel's tax district, divided by 100. Before credits and exemptions. Not a bill. |
| Totals, medians, quartiles, Gini index, top-tenth share | from the parcels inside the area named in the panel |
| Assessment to sale ratio and coefficient of dispersion | assessed value divided by sale price for each sale in the last 12 months; the median, and the average distance from the median as a percent of it |
| Value, tax, homes and population per acre | summed into hexagons 160 m across (about 4.1 acres each) |
| Population density | census block counts spread across the homes in each block |
| Election results on today's precincts | matched by precinct name; names merged in a source file are split in proportion to the 2020 vote |
| Tree size on screen | height from trunk diameter by a fixed rule. The city records no heights. |
| Traffic through the day | the measured daily count times a typical weekday curve |

## What is not available as open data

- Property taxes billed and paid. The county's parcel layer carries those fields empty. Each building links to the county record that has them.
- Precinct results for 2022, 2024 and 2026. The county's results site sits behind a challenge page that this project does not go around, and OpenElections has not posted them yet.
- Live aircraft positions. The free feeds do not allow a web page to read them. `relay/` holds a small relay that would, if someone hosts it.
- Live bus positions. StarTran's vehicle feed does not allow a web page to read it either.

## How to refresh everything

1. On a Windows computer, run the `get_*.ps1` scripts from the repository folder. `run_downloads.cmd` and `run_trees.cmd` run them and write a log.
2. Update `openelections-data-ne` with `git pull`.
3. From `src/`, run `process.py`, then `process2.py`, then `build.py`.
4. Open `test.html` locally and check the Guide's data table, the Numbers panel and a few building cards against the county's site.
5. Copy `index.html` to the top of the repository and publish.

The levy table is the one hand step: each November the Department of Revenue posts the new Taxing Unit Group Summary, and the `LEVY` table in `process2.py` is updated from it.
