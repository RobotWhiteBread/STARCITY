# One parcel, several buildings

The assessor values parcels, not buildings. Until November 22, 2026 the map gave every building on a
parcel the parcel's whole value. That was right for a card about one building and wrong for anything
that counts or adds: a campus parcel with 30 buildings was counted 30 times, and a detached garage
counted as a second home.

What was wrong, measured:

| | Before | After | Check |
|---|---|---|---|
| Sum of all building values | $171.5 billion | $44.8 billion | Parcels with a building, each counted once: $42.5 billion, plus $2.3 billion of condominium parcels that sit under a shared roof |
| Commercial buildings, median | $2,776,300 | $267,000 | |
| "Homes" counted | 112,718 | 86,393 | The difference is detached garages, sheds and other second buildings on home lots |
| Homes, median value | $274,400 | $279,800 | |

The rule now:

- 28,355 parcels hold more than one building (71,162 buildings).
- **Home and farm lots (23,748 parcels):** the largest building carries the parcel's value. The others carry none.
  Exception: if the second building is nearly as big (80% of the largest for a pair, 50% for three or more),
  the value is split, because that is a twin home or a cluster, not a house and a shed.
- **Everything else (4,607 parcels):** the value is split among the buildings by size, footprint times height.
- A building's own card still shows the whole parcel's value, because that is the assessor's figure, and
  says how many buildings share it.
- Value bars, the property finder, Compare areas and the neighborhood sheet use the share.

Size is a stand-in. The assessor does not publish a value per building, so the split inside a campus or
an apartment complex is an estimate. Totals and counts are not estimates: each parcel is counted once.

`patch_pack.py` matches every building to its parcel (130,197 by parcel number, 2,417 by position, 208 not
matched) and checks the match against the values already in the map: 132,599 of 132,614 agree to the dollar,
and the other 15 are buildings the map had no value for. It then adds two columns to the data file:
`b_sh` (the share, 0 to 65535) and `b_pn` (buildings on the parcel). The same rule is in `src/process2.py`
for the next full rebuild.
