# Crashes, 2024 to June 2026

Source: City of Lincoln open data, tables Traffic_Crashes_2024, Traffic_Crashes_2025 and Traffic_Crashes_2026_, downloaded November 22, 2026. 18,273 records. The 2026 table ends June 30, 2026.

Each record has a date, time, severity, kind of collision, vehicle and injury counts, flags for pedestrian, bicycle, motorcycle, truck and bus, and a line of street text. There are no coordinates.

`geocode.py` places each record on OpenStreetMap streets:

| How the location is written | Example | Where it is placed | Records |
|---|---|---|---|
| Street between two cross streets | `N 12,O to P` | Midpoint of the two crossings | 8,913 |
| Street with one cross street found | `CORNHUSKER,N 84 to CITY LIMITS` | The crossing that was found | 1,210 |
| Two streets | `N 27 at CORNHUSKER` | The crossing | 5,389 |
| House number and street | `4700 N 27 at -` | Nearest mapped address on the same block | 1,393 |
| House number on a named street, no mapped address | `5055 A at -` | The crossing with the numbered street for that block (50th) | 23 |
| Block bounded by four streets | `S 16 & S 17 at F & G` | Center of the block | 46 |
| Short street, cross streets not on the map | | Middle of the street (streets under 500 m only) | 10 |

Placed: 16,984 of 18,273, 92.9%. Not placed: 1,289, of which 316 give no usable street (for example `UNKNOWN at -`) and the rest name a street or address this script could not match. Of 43 fatal crashes, 38 are placed. The five that are not: `W 84 at W HOLDREGE`, `FOLSOM CONNECTOR,S FOLSOM to W VAN DORN`, `2906 PLYMOUTH at -`, `WHISPERING WIND,WILDFIRE to LARGES CT` and `HWY 77 at FLETCHER`. They are left off the map rather than placed by guess.

Every record, placed or not, is in `data_public/crashes_2024_2026_placed.csv` with a column saying how it was placed. `pack.py` writes that file and the compact file the map loads.

## Checked against published figures (November 22, 2026)

| What | This file | Published | Reading |
|---|---|---|---|
| Fatal crashes, January to June 2026 | 7, two before late May and five after | Lincoln Journal Star: seven fatal crashes in 2026, five since late May | Match |
| Fatal crash records, 2024 | 15 | Lincoln Police told the Omaha World-Herald there were 12 traffic fatalities in 2024 | Consistent once the city limit is applied. Of the 15 records, 12 are placed inside the city limit. One is placed 141 m outside it (`S 27,BARNARD RD to SALTILLO`) and two could not be placed (`W 84 at W HOLDREGE`, a rural crossing, and `FOLSOM CONNECTOR,S FOLSOM to W VAN DORN`). The police figure counts deaths and this file counts crashes, so the match is a strong sign, not proof. |
| Share of crashes with an injury or death | 22.7% to 23.3% a year | City crash study: 9,278 of 42,552 over five years, 21.8% | Consistent |
| 14th and Superior, 2025 | 28 at the intersection, 42 counting the approach blocks | State figure reported by the Journal Star: 37 | Same range. The state counts reportable crashes and draws the intersection its own way. |
| Yearly total | 7,265 (2024), 7,574 (2025) | City crash study: 8,510 a year on average, for an earlier five-year period | Lower, different years. No published total for 2024 or 2025 was found to compare directly. |

## Corrected November 22, 2026

Records with a time of `9999` have no known time. The first version of the map file counted them as night crashes, which roughly doubled the "Night" view. They are no longer counted as night. 1,976 records have no known time.

Limits: a crash on a block is drawn at the middle of the block. Street names in the source are abbreviated and sometimes cut short, and matching is by name, so a small share may sit on the wrong crossing of two long streets. Matching is by street name, so the checks above test totals and severity, not each dot.
