# UPLNK fix-it requests
The city's UPLNK (SeeClickFix) requests, from the open data portal download or, when present, the live
service paged by `get_uplnk_live.ps1` (only id, status, category, private flag, dates and location are requested).
`build.py` applies the privacy rules described at its top: public-place requests are kept as counts in 30 m
cells; requests about a private property or a neighbor are counted only by voting precinct and police district,
with counts under 5 hidden; a few categories are dropped. Outputs: `data/uplnk.json`, `data_public/uplnk_by_area.csv`.
