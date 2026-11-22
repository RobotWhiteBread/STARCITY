# Crashes, 2024 to June 2026

Source: City of Lincoln open data, tables Traffic_Crashes_2024, Traffic_Crashes_2025 and Traffic_Crashes_2026_, downloaded November 22, 2026. 18,273 records. The 2026 table ends June 30, 2026.

Each record has a date, time, severity, kind of collision, vehicle and injury counts, flags for pedestrian, bicycle, motorcycle, truck and bus, and a line of street text. There are no coordinates.

`geocode.py` places each record on OpenStreetMap streets:

| How the location is written | Example | Where it is placed | Records |
|---|---|---|---|
| Street between two cross streets | `N 12,O to P` | Midpoint of the two crossings | 8,870 |
| Street with one cross street found | `CORNHUSKER,N 84 to CITY LIMITS` | The crossing that was found | 1,233 |
| Two streets | `N 27 at CORNHUSKER` | The crossing | 5,370 |
| House number and street | `4700 N 27 at -` | Nearest mapped address on the same block | 1,393 |
| Block bounded by four streets | `S 16 & S 17 at F & G` | Center of the block | 46 |

Placed: 16,912 of 18,273, 92.6%. Not placed: 1,361, of which 564 give no usable street (for example `UNKNOWN at -`) and the rest name a street or address this script could not match. Of 43 fatal crashes, 35 are placed.

Every record, placed or not, is in `data_public/crashes_2024_2026_placed.csv` with a column saying how it was placed.

Limits: a crash on a block is drawn at the middle of the block. Street names in the source are abbreviated and sometimes cut short, and matching is by name, so a small share may sit on the wrong crossing of two long streets. Yearly totals (7,265 in 2024 and 7,574 in 2025) have not yet been checked against a published city or state figure. The 2024 table writes dates as M/D/YYYY and the others as YYYY-MM-DD; the script converts both.
