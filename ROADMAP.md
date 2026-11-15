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

## Next

1. The night sky from Lincoln: stars by name, constellations, planets, the Moon, the space station and bright satellites, in a view that swings around. The star catalog and the sky arithmetic are already in the repository.
2. Community safety, place-based and not person-based: one tap from any address to the State Patrol's own registry search, the distances state law lets a city protect around schools and child care, and a card of reporting, advocacy and prevention resources. No names, photos or home addresses.
3. A city data browser: list every public layer on the city's map server and let a visitor turn any of them on, with people's names filtered out. This is the step toward all of Lincoln's public data in one place.
4. Accessibility pass: full keyboard control of the map, a text list of what is in view for screen readers, larger text and high contrast settings, reduced motion, and a check against WCAG 2.1 AA.
5. Precinct results for 2022, 2024 and 2026 as soon as they are published in an open format, and turnout alongside registration.
6. Live aircraft through the relay in `relay/`, once it is hosted.
7. A test on real phones, with timings, and a lighter drawing mode if it runs hot.
8. A Spanish version of the Guide and the cards, then the other languages Lincoln families speak most.

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
