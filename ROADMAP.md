# STARCITY roadmap

The goal: the most accessible and most informative citizen map any city has. Every piece of public data about Lincoln, Nebraska in one place that runs in a browser, with every estimate labeled and nobody's privacy traded away to get there.

## Done

| Version | What it added |
|---|---|
| 0.1 | 53,941 OpenStreetMap buildings, streets, water, parks, trees, hand-modeled Capitol and Memorial Stadium, sun and shadows, tour |
| 0.2 | Search, night street lights and stars, game day mode, north-up, place links |
| 0.3 | 26,995 extra buildings from Microsoft footprints, real terrain |
| 0.4 | Walk mode, raised bridges and overpasses, automatic quality fallback on slow devices |
| 0.5 | City of Lincoln footprints as the base layer, Microsoft height estimates, scheduled StarTran buses, live weather, Now button, USGS stream gauges |
| 0.6 | Rebuilt on the city's 2026 footprints (91,313 buildings). Story counts and year built from assessor records. Generated roofs. All 184 miles of bike trails and bike streets |
| 0.7 | Bike layer rebuilt on the real street network, ride everything, weather effects and warnings |
| 0.8 | Phone-friendly controls, Guide, traffic heat wave, county property links, birds, city life, Find me, Share view |
| 0.8.x | Layer engine with hexagon and live layers, assessed values and the tax explorer, local businesses, traffic cameras, Pulse, Code view, Capitol and stadium inscriptions |
| 0.9 | Street names by zoom, new touch gestures and on-screen compass, zoom and tilt, a rebuilt Walk mode, value and tax first on every building card, the 2025 levy for every tax district, every property as a proportional bar with a running total for the area in view, the Numbers panel, 3D vote history for 2012 to 2020, every district at a spot, City Council and live planning cases, live Husker scores, weather and alerts at startup, 88,382 city trees with records, building websites, Native Lincoln, Play in Lincoln, the credits roll, Nader, and a wider cast of labeled creatures |
| 0.9.1 | Now and Reset at the top with a row of reasons to be here, bird's eye that always shows the weather and the hour's traffic, bus stops with next departures and tall route tags, the whole Lincoln bird list by month, the night sky with planets and satellites, real estate as a switch with value bands past $1 million, new sales, charts and a compare-everything table, the redlining lines as an overlay, look around to the horizon, animals asleep at night, a data console, fall color, a browser for every layer on the city's map server, larger text and high contrast, a place-based safety card, and an open invitation to contribute |

## Next

1. Rents. There is no open live feed of asking rents. Two honest routes: Zillow's Observed Rent Index by ZIP code each month, with credit to Zillow, and the Census Bureau's median rent by tract each year, which now needs a free key that only the map's owner can request.
2. Each property through the years. The county's open layer carries this year's value only. If the assessor publishes prior years, the charts will draw one property over time.
3. Planes in and out with each real arrival and departure. This needs the airport's own board in a form a web page can read, or the relay in `relay/`.
4. Trip planning on the bus: from here to there, with the walk at each end and the transfer, from the same timetable.
5. Community safety, still by place: confirm from the city code whether Lincoln has adopted a residency ordinance, add licensed child care locations, and only then draw the distances state law allows. Add a card of reporting, advocacy and prevention resources with verified contacts. No names, photos or home addresses, ever.
6. Accessibility, the rest of it: every control reachable by keyboard with a visible focus, a screen reader pass on the cards and sheets, and a check against WCAG 2.1 AA with the results published.
7. Precinct results for 2022, 2024 and 2026 as soon as they are published in an open format, and turnout alongside registration.
8. Live aircraft through the relay in `relay/`, once it is hosted.
9. A test on real phones, with timings, and a lighter drawing mode if it runs hot.
10. A Spanish version of the Guide and the cards, then the other languages Lincoln families speak most.
11. Checked versions of the most useful layers from the city data browser, moved into the map's own list with notes on what each one means.

## Then: what would make it stand out

1. Measured heights and roof shapes from the April 2022 lidar survey of Lancaster County.
2. Flood view: flood zones and the Salt Creek levees on the terrain with the live stream gauges.
3. A growth timeline: the city building itself year by year from the assessor's year-built records.
4. A budget view: where city, county and school dollars go, from their published budgets.
5. An accuracy report: every height source checked against buildings with known heights, and every total checked against the county's published figures.

## Still open

1. Confirm the reuse terms of the city layers. The city describes its open data as license-free but publishes no license text for these layers.
2. Live bus positions. StarTran's vehicle feed cannot be read by a web page, so buses are drawn from the timetable.
3. Property taxes billed and paid are not in the county's open data. The map estimates and links to the county record.
4. ESPN's scoreboard feed is not documented or promised. If it changes, scores fall back to the saved season lists.

## Later

- A statewide Nebraska edition, which needs map tiles that load as you move.
- More hand-modeled landmarks: Pinnacle Bank Arena, Haymarket Park, Sunken Gardens, Love Library, Mueller Tower, the Sheldon, the Lied Center, Lincoln Station.
- Contribute corrected heights and missing buildings back to OpenStreetMap.

## Out of scope

- Any layer that points at one private person: names, photos or home addresses of individuals.
- Photorealistic capture, which needs aerial or drone imagery this project does not have.
