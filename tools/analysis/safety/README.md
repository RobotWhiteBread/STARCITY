# Public safety figures (Lincoln Police Department open data)

Source: the department's yearly tables on the City of Lincoln open data portal (incident reports, calls for
service, arrests and citations, traffic stops, use of control, pursuits, and the quality service audit),
2013 to June 30, 2026.

## How the numbers were taken
Counts were taken from the city's own ArcGIS feature services on November 23, 2026, mostly with server-side
group-by statistics (counts by offense code, by stop outcome, by search, and so on), so no record about a
person was copied. `citywide_raw.json` holds the results; `build.py` turns them into `data/safety-citywide.json`
and `data_public/lpd_citywide_by_year.csv`.

* Offense groups: 2013 to 2020 use the FBI summary codes in `TYPE_CODE`; 2021 on use the department's incident
  codes in `INC1` (first offense only). The two code books were matched by hand (see the ranges in build.py's
  notes and in the safety sheet). Expect a small step at 2021 from the change itself.
* Traffic stops: outcome, search and reason codes from the department's code table. 2022 has no outcome field.
* Use of force: incidents are distinct case numbers; reports are rows. Before 2017 the form was different.
* Pursuits: the 2019 table repeats 35 pursuits from 2020, so 2020 and 2021 come from the 2020-2021 table only.
  The `REASON` field is free text and sometimes carries people's names, so it is never shown; only counts are kept.
* Survey: the service pages at 1,000 rows; survey years were recounted with full paging.
* 2026 runs January 1 to June 30 (stops were recounted to June 30 to match).

## By area
Incident reports 2021 to 2025 in the violent, property, narcotics and disturbance groups were placed at the
average position of the city's address points on their block (the department publishes block addresses only),
then counted by police reporting district and City Council district. About 84% could be placed; most of the
rest were written as "City of Lincoln", "internet" or "unknown". Counts under 5 are written as -1.

## What is never shown
Names of anyone, including officers; officer ID numbers; case numbers; free text; exact addresses; suicide,
mental health, medical, death and missing-person reports; hate-crime records. Race, sex and age appear only
as citywide totals. Domestic violence, sex offenses, child abuse and stalking appear only as citywide totals.
