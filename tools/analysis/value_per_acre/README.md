# Value per acre

Compare areas can show assessed value per acre and estimated tax per acre. This is the
measure planners use to compare how much taxable value different kinds of development
produce from the same amount of land.

- **What is divided by what.** The 2026 assessed value of taxable parcels, divided by the
  acres of those same parcels. Parcel acres come from the parcel polygon in an equal-area
  projection.
- **What is left out.** Parcels with no assessed value in the public layer: streets, parks,
  campuses, churches and other exempt land. The figure is taxable value per acre of taxable
  land, not per acre of everything inside an area.
- **Condominiums.** Units that share one footprint are stored as stacked identical polygons.
  They are merged so the land is counted once (1,536 parcels folded into 70 groups).
- **Tax.** Each parcel's value times its own tax district's 2025 rate, before credits and
  exemptions. An estimate, labeled as one.
- **Filters.** "Homes only" keeps improved residential parcels. "All property" keeps every
  taxable parcel, vacant lots included, which is why the all-property figure can sit below
  both the homes figure and the commercial figure.

`build_pack.py` writes `data/parcels-vpa.bin` (100,372 rows, $44.4 billion, 51,946 acres
inside the city limit). Source: Lancaster County Assessor parcel layer via City of Lincoln GIS.
