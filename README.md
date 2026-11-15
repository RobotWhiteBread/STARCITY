# STARCITY

[![Times opened](https://hits.sh/robotwhitebread.github.io/STARCITY.svg?style=flat-square&label=times%20opened&color=e9b949&labelColor=1b1f26)](https://robotwhitebread.github.io/STARCITY/)
[![Cities built](https://hits.sh/robotwhitebread.github.io/STARCITY-anycity.svg?style=flat-square&label=cities%20built&color=4c9a6a&labelColor=1b1f26)](https://robotwhitebread.github.io/STARCITY/anycity/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

An interactive 3D map of Lincoln, Nebraska that runs in a web browser. One HTML file, no server, no API keys, no account. It is built only from public data, and every estimate and every decoration is labeled as one.

### **[Open the map](https://robotwhitebread.github.io/STARCITY/)**

Works on a phone or a computer. Nothing to install, nothing to sign up for.

### **[See your own city](https://robotwhitebread.github.io/STARCITY/anycity/)**

Type any place, ZIP code or GPS point and it is built in your browser from OpenStreetMap. The code is free to copy.

You can also download `index.html` and open it in any browser, though the live feeds load only from the website copy.

This is release 0.9.8. `CONTRIBUTING.md` is an open invitation to add to it. `DATA_PLAN.md` lists every source, what is kept from it, when it was last pulled and how it is refreshed. `ROADMAP.md` says what is next.

## What is in it

### New in 0.9.8

- **A correction to the correction.** 0.9.7 changed the 92,003 at Volleyball Day in Nebraska from a world record to an American record. That was wrong, and it is back. ESPN, the NCAA, NCAA.com and Nebraska Athletics all record it as the world record for attendance at a women's sporting event: it broke the 91,648 at Barcelona against Wolfsburg in the 2022 Champions League, which was the recognised mark. The board now carries that progression instead, along with the 90,185 American record it also passed at the 1999 World Cup final at the Rose Bowl.
- **Two more records on the board**, which is now seventeen: the 91,585 who watched Nebraska beat Miami at football in 2014, this stadium's record before Volleyball Day, and the 17,675 at Creighton in 2025, the NCAA regular season indoor record.

### New in 0.9.7

- **Every stadium record on the roof board.** The board under the Devaney signs now turns through all fifteen crowd and venue records instead of three, reading from the same list the records card reads, so the board and the card can never disagree. New on it: the 15,405 against Creighton at Pinnacle Bank Arena on Sept 16 2026, the largest indoor home crowd in program history; the 13,870 against UCLA in 2009 it passed; the 10,497 that reopened the renovated John Cook Arena on Sept 10 2026; the reseat from 8,309 seats to more than 10,000; the 91,585 Memorial Stadium record from 2014; and the 15,038 for basketball in 1981, still the most for anything in that building.
- **A correction that was itself wrong**, and is reversed in 0.9.8 above. Left here on purpose, because a changelog that quietly deletes its mistakes is not worth reading.

### New in 0.9.6

- **Tell us it's wrong, from the card itself.** Every card has a flag beside its close button. It opens a correction already filled in with what the card said and a link back to the exact view, so nobody has to explain where they were. This is the shortest path from "that number is off" to a fix.
- **An About card inside the map**, not only in this file: who built it, that it is not official and not affiliated with the city, the county, the state or the university, what counts as an estimate, and what is collected about you, which is nothing.
- **The invented things say so louder.** Anything that is a joke rather than a record now carries a green FOR FUN tag at the top of its card instead of a sentence buried at the end.

### New in 0.9.5

- **Every name the Devaney Center carries, on its roof at once.** Three signs stacked: Bob Devaney Sports Center at the bottom with the year it opened and the year it was named, John Cook Arena above it, and DBK Universe on top, which is this map's own name for the era and says so on the sign. Readable from either side.
- **A live board under them.** The season record, sets won and lost, the current winning streak, the last result, the next match, the sellout streak and the 92,003 at Memorial Stadium, turning over every few seconds. On the website copy the record and the scores are read live from ESPN as the matches are played.
- **Sasquatch has a nervous system.** He roams the big woods, parks and cemeteries, nine of them now rather than six. Come within about a hundred yards and he bolts for the nearest tree and is gone within three seconds. Reappears somewhere else a few seconds later. Tap him before he runs and he stops, turns to face you, waves, and then leaves anyway.

### New in 0.9.4

- **The phone screen shows the city, not the furniture.** The title folds to one line until tapped. The key, the clock and the place chips start folded. A card's choices run in one scrolling row instead of five stacked ones, and a card is capped at about a third of the screen. The running total steps aside while a card is up and returns when the card does. A layer's height and see-through sliders sit behind its own info button. Every control is at least 42 pixels tall.

### New in 0.9.3

- **The Sower has a wardrobe.** The figure on the Capitol dome can be dressed six ways: as cast in bronze, Husker scarlet with the N on his chest, a cowboy hat and a bandana, a sequin gown and a tiara, a number 1 volleyball jersey with a ball in his raised hand, or a winter coat and earmuffs. Your choice is kept on your own device. It is a costume on the map's own simple figure, not on Lee Lawrie's statue, and the card says so.
- **Info boxes get out of the way.** A card introduces what you just turned on, then hides itself as soon as you start moving the map, so the 3D data is never behind a box. A small **ⓘ What is this** button brings it back.

### New in 0.9.2

- **The City Council, in depth.** Five tabs: who sits on it and what voters changed on November 3, 2026; the next meetings from the city's own calendar, with the recordings read live from LNKTV; how an ordinance becomes law in three Mondays and how a resolution differs; how to speak, sign up and get five minutes; and where every open planning request stands, read live from the Planning Department and placed on the ground where it would happen.
- **Closing a box takes you back.** Pick a reason for being here, open one of its views, close it, and the list of options is there again with the map still showing what you turned on.
- **Reset clears everything.** Nothing stays marked as chosen. What belongs to the base map comes back quietly, with a check mark rather than a gold button, so gold only ever means you chose it.
- **One way out of every close-up view.** The night sky, walking and looking around all carry the same **Back to the map** button, and it returns you to the exact view you left, with your settings. There is also **Stay here, from above** for coming up where you are standing.
- **Data heights fit the screen.** When a layer is switched on, the tallest bar is sized against the view you are in, so a new layer never arrives as a wall or a smear. The height slider still overrides it.
- **Minor streets at night.** Residential streets carry a lamp every 62 m and service streets and alleys one every 130 m, so the whole block grid reads in the dark.
- **This map for your city.** `anycity/` builds a 3D view of any place, ZIP code or GPS point in the browser from OpenStreetMap, and the guide hands you the code to copy.

<details>
<summary><b>New in 0.9.1</b></summary>


- **Now and Reset at the top of the screen**, with a row of reasons you may be here under them. What is live or timely comes first: a game in progress, a weather warning, the next bus, tonight's sky. Then nine ways in: my home and block, getting around, happening now, City Hall and votes, values and taxes, birds, trees and sky, history and culture, safety, and all city data. The ones you use most move to the front, on your own device only.
- **Bus stops and times.** Every StarTran stop is on the map. Tap one for its next departures, tap a bus for where it is headed and the nearest place to catch that route, or ask for the nearest stop with a bus still to come. A table lists every route with its first and last run and how often it comes. StarTran's own live arrival board is one tap from every stop.
- **Birds of Lincoln.** All 321 species reported near Lincoln, each with its year drawn as twelve months, and who is here this month grouped by what they are doing: around all year, here for the cold months, here for the warm months, or passing through. A flock is only drawn for a bird with at least 0.4% of this month's reports.
- **The night sky over Lincoln.** 1,627 catalog stars with names and constellation lines, the Moon and the planets, and on the website the bright satellites and space stations above the horizon, at this minute or any hour you step to.
- **The names on the Devaney Center**, DBK Universe on top, with searchlights, roses and fireworks, and a link to this season's roster.
- **Fall color.** From late September into early December the leafy trees take a touch of the color their kind turns.
- **All city data.** Browse the public map server the city runs and draw any layer it publishes. Fields that could name or reach a person are never requested.
- **Reading comfort.** Larger text, high contrast, a plain-words description of the view, and less motion on devices that ask for it.
- **Safety, by place and not by person.** The map plots no one. It points to the State Patrol's registry and says what state law allows.
- **Bird's eye is always right now.** Zoomed out to the whole city, the map shows the weather as it is and traffic as it usually runs at this hour, with street closures read live on the website. Zoom in and they step aside unless you switched them on yourself.
- **What you switched on stays in sight.** On a phone the button grid folds away after a choice and leaves a short list of what is on, each with an x, and Menu to add more. Choosing a topic turns the top row into that topic, so its other views stay one tap away and its layers stack. When several things show at once, each turns more see-through so the others show.
- **Real estate is a switch, off until you choose it.** On, building cards lead with assessed value and a tax estimate, and the rest is one tap away: value bars with bands at $500,000, $1 million, $2 million, $5 million and $10 million and beyond, the newest sales and where they are happening, charts with a spike for every property by value and by tax, and county sale prices by month since 2018.
- **Compare everything.** One circle, read against every dataset on the map and set beside the whole city. Any two hexagon measures can be drawn at once, one as height and one as color, with how closely they track. The 1930s redlining lines can be laid over any of it as outlines.
- **Look around.** From wherever the camera is, hold and drag to look up to the horizon and all the way round.
- **Night.** When the map's clock says dark, the birds roost in the trees, only the night birds fly, and the zoo, the dog bar, the lake and the woods each get their sleepers a warm bed.
- **A data console.** Every stream the map reads, when it was last read and whether it answered, and what the map holds behind each view, in the code view's own type.
- **Buses carry tall tags** with their number and route, and every route is drawn in its own color.
- **An olive branch.** `CONTRIBUTING.md` invites the city, the county, the university, StarTran, the airport, Realtors, businesses and neighbors to add to the map, and `community/` is where their layers go.
- The credits roll now reads the set scores of every volleyball match, and a suspended match is no longer counted as a loss. Volleyballs no longer fly at the camera.

</details>

### The city

- 91,313 buildings on real terrain. 88,942 of the outlines come from the City of Lincoln and Lancaster County's 2026 footprint layer. Houses get hip and gable roofs and chimneys, larger buildings get parapets, rooftop equipment and windows that light up at night.
- 46,800 street and path segments, with sidewalks, rail lines, creeks, lakes, parks and parking lots. Street names are written along the streets and come in by size: main roads from the whole-city view, every street as you move in close.
- 88,382 city trees, each one a record. The city's own tree inventory (Parks and Recreation, Community Forestry) is drawn where each tree stands and sized by its trunk. Tap a tree for its kind, species, trunk diameter, the street or park it stands on and the city's tree ID. A button reads the rest of the city's record for that one tree.
- 132 miles of bike trails and 52 miles of on-street bike lanes and signed routes. Bike ride mode rides any trail, the shortest way between any two spots (or the way that keeps to trails), or every inch of all 184.5 miles. While it rides you can zoom down to street level and swing the camera around the rider.
- Hand-modeled Nebraska State Capitol and Memorial Stadium, a rooftop sign on the Devaney Center, StarTran buses at their scheduled positions, a time-of-day slider with sun, shadows, street lights and stars.

### Property, taxes and the numbers

- Tap any building. The card leads with its assessed value for 2026 and an estimate of its yearly property tax, then what the building is, with links to the county's property record, its own website where one is known, the University of Nebraska page for campus buildings, the businesses mapped inside it, and Street View.
- 86,989 parcels assessed at $38.03 billion. Every parcel can stand as a round bar in straight proportion to its value, with a gold box that totals whatever part of the city is in view.
- Numbers: count, total, median, quartiles, spread and estimated tax for the area in view, the whole map, each of 38 neighborhood associations and each council, legislative and school district. Sale price trends for the county by month since 2018, and how assessments compare with sale prices.
- Who pays and where the tax goes: by kind of property, by value band, by school district and by tax district, with the 2025 levy for each of the 138 tax districts on the map.
- A real estate tour in eight steps, from total value by neighborhood down to every property as a bar.

### How Lincoln governs itself

- Vote history: five elections from 2012 to 2020 and today's voter registration, as a stack of votes on every precinct. Press play to run the years. Tap a precinct for its own numbers.
- Every district at one spot: tap anywhere and a wall rises around each district that spot votes in, from the precinct up to the Board of Regents, with who holds the seat where the city lists it.
- The City Council, in five tabs:
  - **Who.** The four district seats and the three at-large seats, with the member the city's own district map names, the chair and vice chair, terms, pay, the mayor's veto and the five votes it takes to override it, and what voters changed on November 3, 2026.
  - **Meetings.** The next seven meeting dates from the city's own calendar, which Monday starts at 5:30 instead of 3, the room, the parking, and the recordings of past meetings read live from LNKTV.
  - **How a law is made.** First reading, the public hearing at second reading, the vote at third reading, the mayor. How a resolution differs. Where a bill comes from and how a zone change travels. What the council decides.
  - **Speak up.** Where to sign up, what to say first, the five minutes and the light that ends them, the open microphone on the second and last Mondays, how to write in, and how to ask for an accommodation.
  - **In the works.** Every open planning request, counted once, grouped by how far it has come, read live from the Planning Department. Tap a stage to draw those requests on the map. Tap a request to fly to the ground where it would happen.

### 62 layers

Property and taxes, people, getting around, places, environment and City Hall: values, sales, zoning, tax increment districts, 1930s redlining maps, census tracts, precincts and polling places, every elected district, measured traffic counts, crashes, traffic cameras, street projects, the city bike network, schools, fire and police stations, libraries, public art, playgrounds, restrooms and drinking fountains, floodplains, saline wetlands, road closures, snow plowing, street sweeping, bike share, city trees and more. Fifteen of them are read live from the city's own servers when you switch them on. Three more options color every building by assessed value, property class or year built. Numeric layers rise about a quarter mile into the sky and fade out at the top, and they follow your zoom so the picture holds as you move in and out.

### Live, on the website copy

- Weather and National Weather Service alerts load on their own when the page opens. Tap the weather line for alerts and the forecast. The Weather button adds wind, rain and snow where the radar shows them, lightning, and warned areas.
- Husker scores for volleyball, football, men's and women's basketball and baseball, as they are played, with team stats where the feed carries them. A scarlet chip appears under the title while a game is on.
- Stream gauges, bird reports, bike share, air quality, road closures and the other city feeds.

### Getting around

- Drag to move, pinch or scroll to zoom to the point you are on, twist two fingers to turn, slide two fingers to tilt. A compass, zoom and tilt buttons are always on screen.
- Walk mode: a joystick, tap a spot to walk there, tap a building for its card, walls you cannot pass through, and the name of the street you are on.
- Search any street, address, building, park, neighborhood or trail. Find me puts a blue dot where you are, and the position never leaves your device.
- Reset, at the top of the screen, puts every switch, filter and panel back and returns to the whole city. Now sets the map to this moment and says what is going on.

### Any city, not just this one

`anycity/` is the open version: type a place, a ZIP code or a GPS point and it builds that square in 3D in your browser from OpenStreetMap. Buildings, streets, water, parks and mapped trees, with a sun you can move. Where a building has no height mapped, it is estimated from what kind of building it is and the card says so. Lincoln's own layers are not in it, because those come from Lincoln's records; `DATA_PLAN.md` lists the kinds of public source every city tends to have, so you can add your own.

### Native Lincoln

The whole map is Otoe-Missouria homeland, marked with a gold line around its edge. The places in the city that carry Native names and history are marked, the streets named for Native nations are lit, and the Capitol card explains the thunderbird mosaics that circle the tower.

### For fun, and labeled that way

Giraffes and penguins at the zoo, dogs at the dog parks, cyclists on the trails, a volleyball storm that grows with the week's wins and blows with the day's wind, lake monsters and jumping fish, Sasquatch in the woods, cattle and a combine on East Campus, a giant cone on the Dairy Store, falcons and hawks over the Capitol, example planes at the airport, a credits roll of records that scrolls out of the Devaney Center and Memorial Stadium, searchlights, roses and fireworks over the Devaney Center, a touch of fall color on the trees, and Nader, the tornado who talks. On a real warning Nader says what the Weather Service says. In the preview he says he is a preview.

## Real, estimated, or for fun

Real data: buildings, streets, trails, terrain, trees on the city's list, assessed values, sales, election results, registration, district lines, traffic counts, crashes, city records, weather, alerts and scores.

Estimates, each labeled where it appears:

- Property tax is each parcel's assessed value times the 2025 levy for its tax district, from the Nebraska Department of Revenue. It leaves out credits and exemptions. It is not what anyone was billed or paid. The county's open data does not include bills or payments, so each building links to the county record that does.
- Past election results are drawn on today's precinct lines and matched by precinct name. A precinct redrawn since may cover a slightly different area. In 2012 and 2016 the county counted early ballots countywide and not by precinct, so those stacks show votes cast at the polls. Results after 2020 are not yet published by precinct in an open format.
- Heights: 58,498 houses use the county assessor's story count. 13,983 buildings use Microsoft's height estimates from aerial imagery. 709 use OpenStreetMap tags and 85 are set by hand. The remaining 18,038 are guessed from type and size. Tap a building to see which.
- Roof shapes, chimneys, parapets and rooftop equipment are generated from each outline. A house drawn with a hip roof may really have a gable.
- Trees are drawn at the size their trunk diameter suggests. The city does not record heights. Trees inside woods that the city does not inventory are placed procedurally.
- The traffic heat wave stands on measured daily counts from the city and the state. How it rises and falls through the day is a typical weekday curve, not a live reading.
- Population density spreads census counts across homes. Bus positions come from the published timetable, not GPS.
- Statistics in the Numbers panel are worked out by the map from the county assessor's public records. They are not county figures.

For fun: everything in the section above. Each card says so.

What the map cannot show yet:

- Live aircraft. Every free aircraft feed refuses to answer a web page. A small relay would fix that, and one is written and waiting in `relay/`.
- Taxes actually billed or paid, and precinct results after 2020, for the reasons above.
- Asking rents. There is no open live feed. The Census Bureau's data service now needs a free key, and Zillow's rent index is monthly by ZIP code. Neither is on the map yet; the Rents card says so.
- Value and tax history for one property. The assessor publishes the current year, so the charts show the spread across the city rather than one address over time.
- Live arrivals and departures at Lincoln Airport. The planes are examples until an airport feed or a relay exists.
- Anything live inside a file on your computer. Live feeds load only from the website copy.

## Privacy

- No accounts, no cookies, no analytics, no advertising and no profile of anyone. Find me draws your position on your own screen and sends it nowhere.
- **The one count.** A plain visit counter from [hits.sh](https://hits.sh) is shown in the guide and on this page. It is a single image request per page open, with no cookie, no account and nothing about who you are beyond what any web request carries. It exists so the project can tell whether it is reaching anyone. To remove it, delete the `COUNTSVG` line in `src/layers_q.js` and the badges at the top of this file.
- Owner names and owners' mailing addresses are never stored in the map or in this repository. The Show owner button reads the county's own public record for the one parcel you tapped, at the moment you tap it.
- The city data browser never requests a field that could name or reach a person, and it does not list layers about people. The map does not plot anyone on any registry.
- The download scripts name the fields they want. They never request owner names, mailing addresses, buyer or seller names, staff names or notes.

## Rebuilding from source

The download scripts are PowerShell and run on Windows. The build scripts are Python 3 (with numpy and Pillow).

1. `get_data.ps1`, `get_more.ps1`, `get_city.ps1`, `get_city2.ps1`: OpenStreetMap, Microsoft footprints, terrain tiles, the bus schedule, the city's 2026 footprints, assessor structure records and the city trail layers.
2. `get_places.ps1`, `get_values.ps1`, `get_votes.ps1`, `get_gis.ps1`, `get_trees.ps1`: local businesses, assessed values, election layers, the city, county and state map layers, and the city tree inventory.
3. `git clone https://github.com/openelections/openelections-data-ne` for precinct results from 2012 to 2020.
4. From inside `src/`: `extra.py`, `gtfs.py` (the timetable, and the bus stops it writes beside it), `process.py` (the base map), `process2.py` (values, taxes, layers, elections, trees, bus stops, and the bird table in `birds_inat.txt`), then `build.py`, which combines `page.html`, the two data packs and the `layers_a.js` through `layers_q.js` files into `index.html`.
5. Copy that `index.html` to the top of the repository.

`anycity/index.html` is standalone and needs none of this: it is one file that reads OpenStreetMap live.

`DATA_PLAN.md` has the full list of sources, fields and refresh steps.

## Data and credits

- Map data © OpenStreetMap contributors, under the Open Database License (ODbL). See https://www.openstreetmap.org/copyright
- Building footprints, parcels and assessed values (Lancaster County Assessor), trail layers and the tree inventory (Lincoln Parks and Recreation), traffic counts and crashes (Lincoln Transportation and Utilities), planning cases and permits (Lincoln and Lancaster County Planning Department), election districts, precincts and registration (Lancaster County Election Commissioner), all from the City of Lincoln and Lancaster County GIS services. The city publishes these as public open data and states no license.
- Property tax levies from the Nebraska Department of Revenue, Property Assessment Division.
- Precinct election results from OpenElections, gathered by volunteers from certified county results.
- Additional building footprints and height estimates from Microsoft US Building Footprints and Global ML Building Footprints, under the ODbL.
- Elevation from Mapzen Terrain Tiles on AWS Open Data, which in the United States derive from USGS 3DEP.
- Bus routes and timetables from the StarTran GTFS feed. Traffic counts on state highways from the Nebraska Department of Transportation.
- Weather, alerts and forecasts from the National Weather Service. Streamflow from the USGS. Radar tiles from the Iowa Environmental Mesonet.
- Scores from ESPN's public scoreboard feed, which ESPN does not document or promise.
- Bird reports from iNaturalist. Observations belong to the people who made them.
- Star positions from the Hipparcos and HYG catalogs as packaged by the d3-celestial project.
- Satellite orbits from CelesTrak, worked forward with the satellite.js library (SGP4). Planet and Moon positions use Paul Schlyter's published low-precision formulas.
- Links out, with nothing copied: county property records, Google Street View, the University of Nebraska building pages, city and state election pages.
- The any-city build reads OpenStreetMap through the Overpass API and looks up place names through Nominatim, both run by volunteers. Please be gentle with them.
- The visit count comes from hits.sh.
- Rendering uses three.js (MIT license).

The code in this repository is released under the MIT license. The map data embedded in `index.html` remains under the licenses of its sources, including the ODbL for OpenStreetMap data.

STARCITY is an independent project. It is not affiliated with the City of Lincoln, Lancaster County, the State of Nebraska, the University of Nebraska or any team, and nothing in it is an official record.
