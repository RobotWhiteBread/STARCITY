# Lincoln Floodplain Exposure and Flood Loss

## Summary

Lincoln's realized flood losses are mostly rainfall-driven and fall disproportionately outside the regulated floodplain, while the regulatory and insurance apparatus is riverine and SFHA-centric. Five findings support that, each reproducible from the queries in the Method section.

1. **Most paid claims are not riverine.** Of 275 NFIP claims on record for the City of Lincoln, 165 (60%) carry cause-of-damage code 4, accumulation of rainfall or snowmelt. Only 47 (17%) are coded 2, overflow of a stream, river or lake. The effective FIRM maps riverine Salt Creek flooding.
2. **Nearly a third of claims came from outside the SFHA, and policies have not followed.** 81 of 275 claims (29.5%) were rated in Zone X, B or C, accounting for $304,549 of payments. Yet only 109 of 929 in-force policies (11.7%) are rated outside the SFHA. Claims outside the mapped floodplain run at roughly 2.5 times the share of policies covering it.
3. **The 0.2% band carries assessed value comparable to the SFHA on a twelfth of the land.** Within the study extent, the 1% floodplain covers 28,051 acres and touches $1.12 billion in assessed value. The 0.2% band covers 2,322 acres and touches $1.20 billion. Neither figure is a damage estimate, and both are upper bounds, but the contrast survives a strict lower-bound test.
4. **One two-day event is nearly the entire loss history.** 107 of the 275 claims fall on 6 and 7 May 2015, and 2015 accounts for $2.28 million of the $2.63 million ever paid in Lincoln, or 87%. Any trend analysis on this record is really an analysis of one storm.
5. **No repetitive-loss property has been mitigated.** FEMA lists 7 multiple-loss properties in Lincoln, including 1 severe repetitive loss, with 21 losses between them. The mitigated count is zero, and only 4 currently carry insurance. Two of the 7 sit outside the SFHA.

The practical implication is that mapped-floodplain acreage is a weak proxy for where Lincoln actually takes flood damage. Mitigation and outreach targeted on the SFHA line will miss a large share of the loss history.

## Method and provenance

Every figure below comes from a live query run on 16 November 2026 against the sources in this table. No figure is carried from memory or from a secondary summary.

| Source | Layer or dataset | Records used | Role |
| --- | --- | --- | --- |
| City of Lincoln GIS | `LTUWatershed/FEMAFlood/MapServer/1` (FEMA Floodplain, zones A and AE) | 725 of 1,593 polygons | 1% annual chance extent |
| City of Lincoln GIS | `LTUWatershed/FEMAFlood/MapServer/0` (0.2 PCT ANNUAL CHANCE FLOOD HAZARD) | 2,430 of 4,060 polygons | 0.2% annual chance band |
| City of Lincoln GIS | `Assessor/TaxParcels/MapServer/0` (Parcels) | 1,775 and 1,604 matched | Parcel value, area, land use, year built |
| OpenFEMA | `NfipClaims` v3, community 315273 | 275 claims | Realized loss record |
| OpenFEMA | `NfipPolicies` v3, community 315273 | 889 records in force | Insurance penetration |
| OpenFEMA | `NfipMultipleLossProperties` v1, community 315273 | 7 properties | Repetitive loss |
| OpenFEMA | `NfipCommunityStatusBook` / FEMA CIS | Lincoln row, CID 315273 | FIRM and CRS dates |

### Spatial join semantics

The parcel join is a true server-side polygon intersection, not a centroid test and not a ZIP code crosswalk. The 1% polygons' rings were merged into one multi-ring `esriGeometryPolygon` and posted as a spatial filter with `spatialRel=esriSpatialRelIntersects`. Every parcel returned therefore touches the floodplain somewhere, by any amount.

The same join was then re-run with `spatialRel=esriSpatialRelContains` to identify parcels lying wholly inside the floodplain. That second pass is what brackets the exposure figures, and it is the control that most parcel-count floodplain summaries omit.

### Extent, and why it is not a jurisdiction

The flood polygons were pulled with an envelope filter of -96.745 to -96.535 longitude and 40.69 to 40.85 latitude. That box returns 725 polygons from the 1% layer and 2,430 from the 0.2% layer, which are the counts used throughout this report, so every figure here can be checked against the service directly. An ArcGIS envelope filter returns whole features that intersect the envelope, so the geometry actually retrieved spans -96.9066 to -96.5020 and 40.5379 to 40.8975, well past the nominal box.

Two consequences follow, and both cut toward overstatement. The acreage reported is the full area of every polygon that touches the envelope, not the area clipped to it. And the extent is a latitude and longitude rectangle, not the city limits, the county, or the LPSNRD boundary, so none of these acreages will reconcile with a figure any of those agencies publishes. Re-clipping to a jurisdictional boundary is the first item in the gap list.

### Area computation

Polygon areas use a signed shoelace sum per feature with interior rings subtracted, projected with a cosine-of-latitude correction at each ring's mean latitude. The 1% total of 28,051 acres agrees with an independent `Shape_Area` sum to within 35 acres, or 0.1%. Summing absolute ring areas without subtracting interior rings overstates the 0.2% band by 14%, returning 2,653 acres against a correct 2,322. That is the error mode to watch for in any donut-shaped flood polygon set.

## What has actually flooded

&#91;embedded content: OpenFEMA NfipClaims v3, community 315273 · 275 claims, 1979 to 2026, queried 16 November 2026\]

FEMA's own data dictionary for `causeOfDamage` defines code 4 as accumulation of rainfall or snowmelt and code 2 as stream, river or lake overflow. Lincoln's 275 claims split 165 to code 4 and 47 to code 2, with 63 coded other or left uncoded. Every Lincoln record carries a single code, so none of this is an artifact of the multiple-code combinations the field permits.

That is the central tension in this report. The effective FIRM is a riverine product: it maps Salt Creek and its tributaries at the 1% and 0.2% annual chance discharges. The dominant cause of Lincoln's paid claims is water that never reached a mapped channel.

### The loss record is one storm

Total paid across all 275 claims is $2,630,621, of which $1,885,301 is building and $745,320 contents. Increased Cost of Compliance payments are zero. Only 138 of the 275 claims resulted in any payment at all.

Of that total, $2,284,520, or 87%, falls in 2015, and 107 of the year's 117 claims landed on 6 and 7 May. A 48-year record in which one two-day event carries 87% of the dollars will not support a trend, a return-period fit, or an average annual loss figure. It supports one statement: Lincoln's insured flood losses are driven by short, intense rainfall.

The National Weather Service's own account of that event records that the flooding was largely contained within the levee system inside Lincoln, with parks and low-lying areas taking the water. That is the levee working in a storm well short of the 1% event, and it is part of why the claims that did arrive cluster where the levee offers nothing.

### Repetitive loss, and the absence of mitigation

FEMA lists 7 multiple-loss properties in Lincoln, 7 flagged repetitive loss and 1 severe repetitive loss, with 21 losses between them. Five are in Zone AE and two are outside the SFHA, in Zones C and X.

**None has been mitigated, and only 4 still carry flood insurance.** Seven properties is a small enough number that each could be addressed individually, and the zero in the mitigated column is the most actionable single figure in this analysis.

### One data oddity, noted

Seven claims between 1981 and 1986 are coded 1, tidal water overflow, in a landlocked state roughly 1,000 miles from tidal water. These are almost certainly a coding convention from that era rather than a physical event, and they are left in the other-or-uncoded group above rather than silently deleted.

## The 0.2% band is where the value sits, and where the policies are not

The 0.2% annual chance band holds assessed value comparable to the full Special Flood Hazard Area while occupying about a twelfth of the land. This is the finding most likely to be new to a reader who works from SFHA parcel counts.

| Measure | 1% SFHA | 0.2% band |
| --- | --- | --- |
| Mapped area, acres | 28,051 | 2,322 |
| Polygons in extent | 725 | 2,430 |
| Parcels touching | 1,775 | 1,604 |
| Assessed value touching | $1,116.5M | $1,199.9M |
| Parcels wholly inside | 517 (29.1%) | 214 (13.3%) |
| Assessed value wholly inside | $249.6M | $58.1M |
| Value per mapped acre, upper bound | $39,802 | $516,763 |
| Value per mapped acre, lower bound | $8,897 | $25,034 |

The upper-bound ratio of 13 to 1 overstates the gap, because the 0.2% band is a narrow ribbon that parcels straddle constantly, so its boundary-clip bias is worse than the SFHA's. Only 13.3% of its parcels lie wholly inside, against 29.1% for the SFHA. The lower-bound row is the bias-resistant comparison: using only parcels wholly inside each zone, the 0.2% band still carries 2.8 times the assessed value per mapped acre. The direction of the finding survives the most conservative test available without structure-level data.

### The regulatory consequence

The 0.2% band is Zone X shaded. It carries no mandatory insurance purchase requirement, no substantial improvement or substantial damage trigger, and no floodway encroachment standard. The value concentrated there is therefore accumulating under materially weaker floodplain management than the SFHA, which holds less value per acre.

### The insurance mismatch

The loss record and the policy base disagree about where the risk is.

| Zone group | Share of 275 claims | Share of 929 in-force policies |
| --- | --- | --- |
| SFHA (A, AE, numbered A zones) | 194 (70.5%) | 820 (88.3%) |
| Outside SFHA (X, B, C) | 81 (29.5%) | 109 (11.7%) |

Claims from outside the mapped floodplain arrive at about 2.5 times the rate at which policies cover it. The 109 non-SFHA policies in force are the thinnest part of the book against a loss history that assigns 29.5% of its claims there.

### Combined footprint

Taking both bands together and removing the 462 parcels that touch both, 2,917 distinct parcels are affected, 3.4% of Lincoln's 86,989 parcels. Assessed value touching either band is $1.92 billion, 5.1% of the city's $38.03 billion. The wholly-inside subset is 731 parcels and $307.7 million. The defensible combined range is therefore $308 million to $1.92 billion, and the Limits section explains why even the lower figure is not a damage estimate.

## The floodplain itself is mostly open land

&#91;embedded content: Lancaster County Assessor parcels joined to FEMA 1% floodplain · 1,775 parcels, 30,667 parcel acres, queried 16 November 2026\]

**95.2% of the parcel acreage touching the 1% floodplain is farm, park or vacant land.** That is 29,204 of 30,667 acres, and it holds 32.1% of the assessed value. The remaining 4.8% of the land carries 67.9% of the value.

This reframes what the floodplain is. Lincoln's 1% floodplain is not primarily a developed area at risk. It is overwhelmingly a working agricultural and open-space corridor along Salt Creek, with a comparatively small built fringe where nearly all the value sits.

### Parks are doing real work here

Public Use parcels account for 136 records and 4,526 acres inside the floodplain, 14.8% of the total. Floodplain land held as public open space is the outcome floodplain management aims for, and it shows up in this dataset as a large acreage with a low value density. A reader scanning only for dollars at risk would pass straight over it.

The floodway tells the same story more sharply: 35 parcels, of which only 2 carry an improved home. Lincoln's regulatory floodway is close to empty of structures, which is what a floodway is supposed to look like.

### Where the agricultural figure comes from

Agricultural parcels contribute 318 records, $170.1 million and 23,415 acres, and **not one of them lies wholly inside the floodplain.** Every one is a large parcel clipped at its edge. Their acreage dominates the open-land share above, and their assessed value is the single largest source of the boundary-clip bias described in the Limits section. The 95.2% figure is robust because it is a ratio of acres to acres and both sides carry the same bias; the dollar shares are not, and should be read with the bracket.

## Pre-FIRM housing, and why the claim record hides it

Lincoln's initial FIRM identified date is **27 April 1971**, taken from FEMA's Community Information System row for CID 315273. The column mapping was verified against two control communities before the date was used: Omaha, which shows a blank initial FHBM and an initial FIRM of 08 May 1971, and Alda, which carries all three dates. Lincoln's row shows a blank initial FHBM, initial FIRM 04/27/71, current effective map 04/16/13, regular emergency date 04/23/71, CRS entry 10/01/91, and current CRS class 5 at a 25% discount.

Against that date, **466 of the 973 residential structures with a recorded year built in the 1% floodplain predate the first flood map, or 47.9%.** The median year built across those 973 is 1972, which places the stock almost exactly astride the regulatory boundary.

### The record and the stock disagree sharply

| Construction era | SFHA claims | Outside SFHA | Total | Share |
| --- | --- | --- | --- | --- |
| Post-FIRM | 164 ($2,108k) | 77 ($288k) | 241 | 87.6% |
| Pre-FIRM | 30 ($218k) | 4 ($17k) | 34 | 12.4% |

Pre-FIRM structures make up roughly 48% of the floodplain's residential stock but only 12% of its claimants. That is a four-fold discrepancy and it points one way.

The most likely explanation is insurance visibility rather than physical risk. Mandatory purchase attaches to federally backed mortgages, and the oldest housing is the most likely to be owned outright, so pre-FIRM structures are systematically under-represented in any NFIP-derived dataset. Their losses are absorbed privately, through disaster assistance, or not at all, and they never enter the claims file.

This matters for mitigation targeting. A program scoped from claims data will concentrate on post-FIRM construction, which is elevated to the standard in force when it was built, and will systematically skip the pre-FIRM stock that has no elevation requirement behind it. The 466 pre-FIRM structures identified here are a candidate list that the claim record will never surface.

Two honest caveats. The policy extract pulled for this report carries no pre-FIRM flag, so the under-insurance step is an inference from the mandatory purchase rule and not a measured penetration rate; confirming it needs the pre-FIRM field from the policy file. And the 47.9% figure covers residential structures only, for reasons the next section sets out.

## Data defects worth knowing about

Anyone rebuilding this analysis from the same sources will hit these. Several are not documented anywhere obvious.

| Defect | Effect | Workaround |
| --- | --- | --- |
| Assessor `RESYRBLT` is heavily defaulted to round years | 1900 appears 137 times against only 18 records across 1901 to 1909; 1910 appears 63 times, 1915 38 times. Round decade years are 301 of 973 records, 30.9% | Use the field only for a pre-FIRM or post-FIRM split, never for a median, a decade histogram, or a depreciation curve |
| `RESYRBLT` is residential-only | 802 of 1,775 parcels carry no year. About 328 are genuinely unimproved, but 54 Single Family, 11 Townhouse and 9 Multi-Family parcels are improved with no date, and roughly 270 improved non-residential parcels (Service 137, Public Use 136, commercial, Church 7, School 1) have no construction date at all | Join building-level records, or treat all non-residential vintage as unknown rather than absent |
| `reportedCity` is redacted in `NfipClaims` | Every Lancaster County record returns the literal string `Currently Unavailable`, so a city-name filter silently returns zero rows rather than an error | Filter on `nfipRatedCommunityNumber eq '315273'` or `countyCode eq '31109'` |
| `FimaNfipClaims` no longer exists | The OpenFEMA v2 endpoint returns HTTP 404 | The dataset is `NfipClaims` v3; enumerate current names from `api/open/v1/DataSets` |
| Sentinel construction dates | `originalConstructionDate` in the Lincoln claims file ranges from 1492 to 2013 | Screen the lower tail before computing any age statistic |
| Elevation fields are nearly empty | Only 18 of 275 claims carry `elevationDifference`. Of those 18, 11 sit below base flood elevation, median -3 feet | Treat elevation analysis as unavailable at this scale; the 18 records are not a sample worth generalizing |
| The 0.2% layer is incremental | Layer 0 is `0.2 PCT ANNUAL CHANCE FLOOD HAZARD`, FEMA's shaded Zone X band between the 1% and 0.2% lines, not a cumulative 0.2% extent | Never nest or sum the two layers; the 2,322 acres sit beside the 28,051, not inside them |
| A full page of results is not a complete result | The service returns at most 2,000 records per reply and gives no sign that more exist, so one query against an area holding 2,430 returns 2,000 and looks like it worked. Separately, a page that times out returns empty, and a pager that treats empty as the end of the data truncates silently; one earlier pull returned 1,000 of 1,653 records that way | Page with `resultOffset` until a short page arrives, compare the total against `returnCountOnly` every time, and retry an empty page before believing it |

### One residual inconsistency, disclosed

The containment pass was evaluated against merged chunks of flood polygons rather than the full union, so a parcel contained by the whole floodplain but straddling two chunks is not counted as wholly inside. The 517 figure is therefore a slight under-count, which makes the lower bound conservative rather than optimistic.

The two passes also disagreed on one parcel out of 517, which was returned as contained but not as intersecting. That is a geometry tolerance artifact at the 0.1% scale and it is reported rather than quietly dropped.

## What these numbers are not

This is an exposure inventory, not a risk assessment. Risk requires depth and a vulnerability function, and neither is present here. The distinction is not pedantic: it is the difference between a figure that can support a benefit-cost analysis and one that cannot.

### Boundary-clip bias runs one way

The intersects join counts a parcel at full assessed value if it touches the floodplain by one corner. Agricultural land shows the mechanism at its starkest: 318 parcels, $170.1 million, 23,415 acres, and **not one of them lies wholly inside the floodplain**. Every agricultural dollar in the headline figure is there because a large parcel was clipped at its edge.

That is why every value in this report is given as a bracket. For the 1% floodplain the bracket is $249.6 million to $1,116.5 million, a factor of 4.5. The true area-weighted figure sits between them and cannot be computed without a polygon clip, which the REST endpoint does not perform.

### Assessed value is the wrong unit, in two directions

Assessed value includes land, and floods do not destroy land. FEMA benefit-cost analysis uses structure replacement cost plus contents, which is a different and usually larger number for a developed parcel and a far smaller one for a farm field.

The assessment basis also distorts across classes. Nebraska assesses most real property at 100% of actual value but [agricultural and horticultural land at 75%](https://www.law.cornell.edu/regulations/nebraska/350-Neb-Admin-Code-ch-10-SS-003). The $170.1 million agricultural figure therefore understates market value by roughly a third, pulling against the boundary-clip overstatement rather than compounding it. Separate and lower percentages apply for certain school district tax computations, so any dollar figure should state which basis it uses.

### Parcel is not structure

Nothing here counts buildings. A parcel may hold none, one, or many: the 41 High Rise Condos parcels in the floodplain could represent several hundred dwelling units, and the 136 Public Use parcels are largely unbuilt. The floodway illustrates the gap, with 35 parcels but only 2 improved homes.

### No elevations, and nearly half the SFHA has no base flood elevation at all

There are no first-floor elevations in this analysis and no depth grid, so nothing here identifies which structures take water in a 1% event. A house with three feet of freeboard and one three feet below BFE are counted identically.

Worse, **11,976 of the 28,051 SFHA acres, or 42.7%, are Zone A**, which is approximate study with no base flood elevation determined. That acreage comes from just 6 polygons. Any elevation-based analysis is impossible across nearly half the mapped area until a detailed study replaces it.

### Map vintage

The current effective map dates to 16 April 2013 for the city and 27 June 2014 for the county. The hydrology behind it may be considerably older, and upstream watershed development since the study period is not reflected. A mapped 1% discharge is a snapshot of the watershed as modeled, not as it now drains.

## The levee question, and what would close the gaps

The Salt Creek levee system is not FEMA-accredited. It was built to a roughly 50-year, or 2% annual chance, design standard, is maintained by the Lower Platte South NRD, and appears as non-accredited in the [National Levee Database](https://levees.sec.usace.army.mil/). A 2% design standard sits well below the 1% event the FIRM maps, so the system does not provide base-flood protection and cannot be credited as doing so.

**This is the one interpretive question that has to be resolved before any figure in this report is read as a protection statement.** For a non-accredited levee FEMA maps the landward area without levee credit, which would mean the 28,051 acres already include the area behind the embankment. That is the expected treatment, but it has not been confirmed against the Flood Insurance Study hydraulics narrative for this reach, and the alternative treatments produce materially different interpretations of the same polygon. Until the FIS is read, these numbers describe mapped hazard, not residual risk behind a structure.

### An asset inventory that is not in the public conversation

The city's levee layers carry more detail than the accreditation discussion usually reaches: 123 top-of-bank segments covering 33.9 miles, 226 right-of-way lines labeled ROW-1969, a mapped critical area of 1,451 acres reaching 500 feet landside and 300 feet streamside, and **67 drainage structures penetrating the embankment**, each with its station location, length, material, barrel size, gate type, status and an inspection score. One record, for instance, is a 951-foot, 78-inch reinforced concrete pipe.

Penetrations are a standard levee failure mode, and an inventory of 67 of them with gate types, status and condition ratings is the kind of data that supports an interior drainage and closure-reliability review. Mapping these against the 1950 floods would give the non-accreditation discussion something concrete to stand on. The National Weather Service records four major floods across south central and southeast Nebraska between May and July 1950 that together took 25 lives and caused $65 million in damage, roughly $1 billion in 2013 dollars. No digitized inundation footprint for that event appears in the city or county GIS, so a Lincoln-specific extent would have to be rebuilt from the USGS flood report.

The condition field is the part worth reading closely. Sixty-two of the 67 structures are listed active and five inactive. Thirty-four are corrugated metal pipe, 18 reinforced concrete and 15 box culverts, and 34 carry a flap gate.

On condition, 45 carry an MA grade at high, medium or low, 7 are rated **Unacceptable**, and 15 are unrated. **None of the 67 is rated Acceptable.** Inspection scores run from 0 to 79 with a median of 29. Set against a levee that is already non-accredited, seven Unacceptable penetrations is the most specific and most fundable thing in this report.

### What Lincoln already maps that FEMA does not

Lincoln regulates a minimum flood corridor under Municipal Code 27.53.020: a buffer centered on the channel, 90 feet wide where 40 to 100 acres of land drain into the stream, and wider as the drainage area grows. It covers **832 corridors and about 3,372 acres across 13 watersheds**, on creeks far below the size FEMA studies.

Running those corridors against the 1% floodplain shows how much new ground they cover. **366 of the 832 corridors, about 1,221 acres, fall entirely outside the mapped floodplain.** A corridor that merely clips the floodplain is counted as inside, so 1,221 acres is a floor rather than an estimate.

That sharpens how the rainfall gap should be stated. It is not that Lincoln maps nothing beyond the FEMA floodplain. It is that what Lincoln maps is a fixed-width buffer on small streams, not a model of where water goes. Stevens Creek alone carries 349 corridors and 1,095 acres. A buffer protects a channel; it does not say which streets pond, which culverts surcharge, or which basements take water, and that is what 60% of the claim record is about.

### What would strengthen this analysis

| Gap | Why it matters | Source | Effort |
| --- | --- | --- | --- |
| No model of where rainfall pools | 60% of claims are rainfall accumulation, which the FIRM does not model. The minimum flood corridor covers small streams, but nothing maps sheet flow or storm sewer capacity. This is the largest blind spot in the picture | City stormwater model, 2D rain-on-grid study | High |
| Re-clip to a jurisdictional boundary | No acreage here will reconcile with a city, county or NRD figure until it does | City limits or LPSNRD boundary polygon | Low |
| Confirm the levee mapping treatment | Decides whether these polygons describe residual risk or mapped hazard | FIS hydraulics narrative for the Salt Creek reach | Low |
| Structure-level join with first-floor elevations | Converts exposure into something a benefit-cost analysis can use | Building footprints plus elevation certificates | High |
| Pre-FIRM flag from the policy file | Turns the under-insurance inference into a measured penetration rate | `NfipPolicies` v3 pre-FIRM field | Low |
| Area-weighted parcel clip | Replaces the 4.5x bracket with a point estimate | Local geometry clip outside the REST API | Medium |
| Detailed study for Zone A | 42.7% of SFHA acreage has no base flood elevation | FEMA map revision | Beyond local scope |

The first row is the recommendation. Lincoln's regulatory floodplain describes riverine Salt Creek flooding, its CRS Class 5 standing is among the best in the state, and its levee carries a known and disclosed 2% design limit. None of that addresses the mechanism behind most of its paid claims.

## What to focus on

The findings above point to different actions depending on who is holding them. This section sorts them by who can act.

### For City Council

These are the items that need a policy choice or a budget line.

- **Extend local floodplain standards into the 0.2% band.** $1.20 billion of assessed value sits on 2,322 acres of shaded Zone X, where federal rules impose no mandatory insurance purchase, no substantial improvement trigger and no floodway standard. Communities may adopt stricter local standards there, and the CRS program gives credit for doing so.
- **Fund a rainfall flood study.** Sixty percent of paid claims are rainfall or snowmelt accumulation, a mechanism the FIRM does not model anywhere. Until that water is mapped, no capital project or ordinance can be aimed at the cause of most of Lincoln's flood damage. The minimum flood corridor is the nearest existing tool, and a fixed-width buffer is not a model of where water goes.
- **Mitigate the seven repetitive-loss properties.** Seven properties, one of them severe repetitive loss, have produced 21 losses between them and none has been mitigated. FEMA's Flood Mitigation Assistance program prioritizes exactly these. Seven is a fundable number.
- **Decide the levee posture deliberately.** The Salt Creek system is non-accredited at a 50-year design standard. The realistic options are pursuing accreditation, which is expensive, or formally communicating residual risk to the people living behind it, which is not. Doing neither is also a decision.
- **Protect the CRS Class 5 standing.** Lincoln has held a CRS classification since October 1991 and is currently Class 5, which discounts SFHA premiums by 25%. The city's 929 in-force policies carry $759,921 in annual premium, and that rating is re-verified periodically.

### For city staff

These are operational and affect day-to-day administration.

- **Reconcile floodplain acreage to a jurisdictional boundary.** Acreage computed on a coordinate rectangle, as here, will not match any figure the city, county or LPSNRD publishes. Agreeing on one boundary makes every future number comparable.
- **Do not use the assessor year-built field for substantial improvement work.** Round decade years make up 30.9% of records carrying a date, and 1900 alone appears 137 times. Construction date drives substantial improvement and substantial damage determinations, and this field cannot carry that weight.
- **Close the non-residential construction-date gap.** Roughly 270 improved non-residential parcels in the SFHA carry no construction date at all, including 137 Service and 136 Public Use records. Building-level records are needed before those parcels can be administered consistently.
- **Recognize that Zone A permitting has no elevation to work against.** 11,976 acres, 42.7% of the mapped SFHA, is approximate study with no base flood elevation determined. Staff issuing permits there have no published BFE to apply.
- **Build an elevation certificate repository.** Only 18 of 275 claims carry an elevation difference against BFE. Every certificate captured at permit time compounds in value, supports future mitigation applications, and earns CRS credit.
- **Inspect the 67 levee drainage penetrations, starting with the seven rated Unacceptable.** All 67 already carry a station, length, barrel size, material, gate type, status and an inspection score in the city's own GIS layer, and none of them is rated Acceptable. Penetrations and their closures are a standard levee failure mode, and the inventory exists today.

### For residents

- **Being outside the floodplain is not the same as being safe.** Nearly 30% of Lincoln's flood claims came from Zones X, B and C, outside the mapped floodplain, while only 12% of flood policies cover those zones.
- **Most flood damage here is rainfall, not Salt Creek.** Sixty percent of claims are rainfall or snowmelt accumulation: water that pools, backs up and cannot drain, rather than a creek leaving its banks. A property can take that damage without being near a channel.
- **Homeowners insurance does not cover flood.** Flood coverage is a separate NFIP or private policy. Outside the SFHA it is usually inexpensive, and that is where the coverage gap is widest.
- **In the floodplain, the city's CRS rating cuts premiums by 25%.** That discount exists because of floodplain management work the city does, and it applies to NFIP policies written in Lincoln.
- **Know your zone, and know your home's age.** A house built before April 1971 predates Lincoln's first flood map and has no elevation requirement behind it. Roughly half the floodplain's residential structures with a recorded date fall in that group.
- **One storm can be the whole story.** 107 of Lincoln's 275 recorded flood claims landed on two days, 6 and 7 May 2015. Flood risk here is not a steady drip; it arrives all at once and then is quiet for years.

## Sources and verification log

### Sources

| Source | Link |
| --- | --- |
| City of Lincoln and Lancaster County GIS REST services | [gis.lincoln.ne.gov](https://gis.lincoln.ne.gov/public/rest/services) |
| OpenFEMA dataset catalog | [api/open/v1/DataSets](https://www.fema.gov/api/open/v1/DataSets) |
| FEMA Community Information System, Nebraska | [fema.gov/cis/NE.html](https://www.fema.gov/cis/NE.html) |
| USACE National Levee Database | [levees.sec.usace.army.mil](https://levees.sec.usace.army.mil/) |
| Nebraska assessment levels, 350 NAC ch. 10 | [Neb. Admin. Code ch. 10 § 003](https://www.law.cornell.edu/regulations/nebraska/350-Neb-Admin-Code-ch-10-SS-003) |
| National Weather Service, significant Nebraska floods | [weather.gov/safety/flood-states-ne](https://www.weather.gov/safety/flood-states-ne) |
| NWS Omaha, 7 May 2015 event archive | [weather.gov/oax/event_archive_20150507](https://www.weather.gov/oax/event_archive_20150507) |

### Checks that passed

- **Area method.** Signed ring areas with holes subtracted total 28,051 acres against an independent `Shape_Area` sum, agreeing to 35 acres or 0.1%.
- **FEMA date provenance.** The Community Information System column order was verified against two controls before Lincoln's row was read: Omaha, with a blank initial FHBM and an initial FIRM of 08 May 1971, and Alda, carrying all three dates.
- **Join reproducibility.** The flood pull and parcel join were re-run from scratch after browser state was lost mid-analysis. Both runs returned 725 polygons, 1,775 parcels and $1,116,490,300, matching to the dollar.
- **Pagination integrity.** Paged record totals were checked against `returnCountOnly` for each layer. An earlier pull that had silently returned 1,000 of 1,653 records was found this way and corrected.

### Checks that constrained the findings

- **Year-built distribution.** Round decade years account for 30.9% of records carrying a construction date, with 1900 appearing 137 times against 18 records across all of 1901 to 1909. Vintage claims are capped at a pre-FIRM or post-FIRM split and go no finer.
- **Containment test.** Only 517 of 1,775 parcels lie wholly inside the 1% floodplain, so every dollar figure is reported as a bracket rather than a point estimate.
- **Elevation coverage.** Just 18 of 275 claims carry an elevation difference against base flood elevation, so no elevation or depth analysis was attempted at any scale.

### As of this report

All figures rest on live queries run on 16 November 2026. The 0.2% band reflects 2,430 of the service's 4,060 polygons, being those that intersect the study envelope.

Assessed values follow the current county assessment roll and are revised annually. The claims and policy extracts are point-in-time pulls from OpenFEMA and will shift as FEMA refreshes them.
