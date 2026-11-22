# Lincoln Floodplain Exposure and Flood Loss

*Published November 21, 2026 by STARCITY, starcitylincoln.org. Data retrieved November 21, 2026 unless a section says otherwise.*

## Summary

Lincoln's realized flood losses are mostly rainfall-driven and fall disproportionately outside the regulated floodplain, while the regulatory and insurance apparatus is riverine and SFHA-centric. Five findings support that, each reproducible from the queries in the Method section.

1. **Most paid claims are not riverine.** Of 275 NFIP claims on record for the City of Lincoln, 165 (60%) carry cause-of-damage code 4, accumulation of rainfall or snowmelt. Only 47 (17%) are coded 2, overflow of a stream, river or lake. The effective FIRM maps riverine Salt Creek flooding.
2. **Nearly a third of claims came from outside the SFHA, and policies have not followed.** 81 of 275 claims (29.5%) were rated in Zone X, B or C, accounting for $304,549 of payments. Yet only 109 of 929 in-force policies (11.7%) are rated outside the SFHA. Claims outside the mapped floodplain run at roughly 2.5 times the share of policies covering it.
3. **The 0.2% band carries almost as much assessed value as the SFHA on a quarter of the land.** Inside the city limits the 1% floodplain covers 11,457 acres and touches $4.45 billion in assessed value. The 0.2% band covers 3,115 acres and touches $3.81 billion. Per mapped acre that is $1,221,837 against $388,268, a ratio of 3.1 to 1. Neither figure is a damage estimate and both are upper bounds. The ratio does not survive the strict wholly-inside test, which is set out in full below rather than left out.
4. **One two-day event is nearly the entire loss history.** 107 of the 275 claims fall on 6 and 7 May 2015, and 2015 accounts for $2.28 million of the $2.63 million ever paid in Lincoln, or 87%. Any trend analysis on this record is really an analysis of one storm.
5. **No repetitive-loss property has been mitigated.** FEMA lists 7 multiple-loss properties in Lincoln, including 1 severe repetitive loss, with 21 losses between them. The mitigated count is zero, and only 4 currently carry insurance. Two of the 7 sit outside the SFHA.

The practical implication is that mapped-floodplain acreage is a weak proxy for where Lincoln actually takes flood damage. Mitigation and outreach targeted on the SFHA line will miss a large share of the loss history.

## Checked against an outside figure

The claim, policy and repeat-loss counts in this report are direct counts from FEMA's own files, so there is no second official source to check them against. The city's own pages confirm its Class 5 rating in FEMA's Community Rating System. How every paper was checked is on the [verification page](verification.html).

## Method and provenance

NFIP claim, policy and repetitive-loss figures come from live queries run on 16 November 2026. Every spatial figure, meaning all acreages, parcel counts and assessed values, comes from queries run on 21 November 2026 against the extent described below. No figure is carried from memory or from a secondary summary.

| Source | Layer or dataset | Records used | Role |
| --- | --- | --- | --- |
| City of Lincoln GIS | `LTUWatershed/FEMAFlood/MapServer/1` (FEMA Floodplain, zones A and AE) | all 1,593 polygons, 462 clipped to the city | 1% annual chance extent |
| City of Lincoln GIS | `LTUWatershed/FEMAFlood/MapServer/0` (0.2 PCT ANNUAL CHANCE FLOOD HAZARD) | all 4,060 polygons, 982 clipped to the city | 0.2% annual chance band |
| City of Lincoln GIS | `Planning/LincolnLimits/MapServer/3` (Lincoln City Limits) | 70 features, 1 used | Jurisdictional clip |
| City of Lincoln GIS | `Assessor/TaxParcels/MapServer/0` (Parcels) | 102,702 in the city, 6,046 and 4,466 matched | Parcel value, area, land use, year built |
| OpenFEMA | `NfipClaims` v3, community 315273 | 275 claims | Realized loss record |
| OpenFEMA | `NfipPolicies` v3, community 315273 | 889 records in force | Insurance penetration |
| OpenFEMA | `NfipMultipleLossProperties` v1, community 315273 | 7 properties | Repetitive loss |
| OpenFEMA | `NfipCommunityStatusBook` / FEMA CIS | Lincoln row, CID 315273 | FIRM and CRS dates |

### Spatial join semantics

The parcel join is a true polygon-on-polygon overlap, not a centroid test and not a ZIP code crosswalk. All 122,748 parcels in the county layer were downloaded with their geometry, and each parcel inside the corporate limit was intersected with the dissolved floodplain in an equal-area projection (EPSG:5070). A parcel counts as overlapping when more than one square metre of it lies in the floodplain.

The same join also identifies parcels lying wholly inside the floodplain, meaning at least 99.9% of the parcel's area is covered. That second measure is what brackets the exposure figures, and it is the control that most parcel-count floodplain summaries omit.

### Extent: the City of Lincoln corporate limit

Every figure in this report is scoped to the City of Lincoln's corporate limit and clipped to it. That boundary is a jurisdiction a reader can check, which a latitude and longitude rectangle is not.

One trap is worth flagging, because anyone reproducing this will hit it. `Planning/LincolnLimits/MapServer/3` returns 70 nested features, every one labelled `Lincoln`. The largest, at 289.8 square miles, is the extraterritorial jurisdiction, which reaches three miles beyond the corporate limit. The corporate limit is the next largest at 106.7 square miles, consistent with the census land area of about 100 square miles. Taking the largest feature, or unioning all 70, silently substitutes the ETJ for the city and inflates every downstream figure.

Flood polygons are clipped to that boundary rather than counted whole when their centroid falls inside it. An ArcGIS envelope or centroid filter returns whole features, so a polygon running miles out along Salt Creek would otherwise contribute its entire area to a figure described as Lincoln's.

The difference is not small. The full published 1% layer is 69,225 acres across 1,593 polygons. Clipped to the corporate limit it is **11,457 acres**. Any figure quoted for Lincoln that is not clipped is describing Lancaster County.

### Area computation

Geometry is reprojected to EPSG:5070, NAD83 Conus Albers, an equal-area projection, and areas are taken there with interior rings subtracted.

Service-reported areas are not used, for a reason worth stating. These layers publish in Web Mercator (EPSG:3857). Web Mercator inflates area by roughly 1/cos squared of the latitude, which at Lincoln's 40.8 degrees north is a factor of about 1.75. A `Shape_Area` sum taken at face value therefore overstates by about three quarters. The `MinimumCorridor` layer has no `Shape_Area` field at all, so any acreage quoted for it is necessarily computed.

Two further error modes to watch for in any donut-shaped flood polygon set: summing absolute ring areas without subtracting interior rings overstates, and counting whole polygons that merely intersect a filter overstates again.

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
| Mapped area in the city, acres | 11,457 | 3,115 |
| Polygons clipped to the city | 462 | 982 |
| Parcels overlapping | 6,046 | 4,466 |
| Distinct footprints | 5,942 | 4,369 |
| Assessed value overlapping | $4,448.2M | $3,806.4M |
| Parcels wholly inside | 3,140 (51.9%) | 827 (18.5%) |
| Assessed value wholly inside | $1,237.1M | $335.2M |
| Value per mapped acre, upper bound | $388,268 | $1,221,837 |
| Value per mapped acre, lower bound | $107,981 | $107,613 |

On the upper bound the 0.2% band carries **3.15 times** the assessed value per mapped acre, on 3.7 times less land. That is the finding.

**It does not survive the strict test, and that is stated here rather than omitted.** Using only parcels wholly inside each zone, the ratio falls to **1.00**, meaning the 0.2% band carries the same value per mapped acre as the SFHA and no more. The reason is visible in the table: 51.9% of SFHA parcels lie wholly inside it, against only 18.5% for the 0.2% band. The band is a narrow ribbon that parcels straddle constantly, so the loose measure credits it with the full value of properties that are mostly outside it.

The honest reading is that the 0.2% band holds a large amount of value at its edges and comparatively little squarely within it. That is a planning problem in its own right, because a property straddling the line is a property that floods at its low corner. It is not evidence that the band is denser in value than the SFHA once the straddling is controlled for.

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

Taking both bands together and removing the 2,202 parcels that overlap both, **8,310 distinct parcels are affected, 8.09% of the 102,702 parcels inside Lincoln's corporate limit.** Those sit on 8,135 distinct footprints; the gap is condominium units, which are separate assessment records stacked on one building.

Assessed value overlapping either band is **$5.64 billion, 12.71% of the city's $44.38 billion.** The wholly-inside subset is 4,957 parcels and $2.22 billion. The defensible combined range is therefore $2.22 billion to $5.64 billion, and the Limits section explains why even the lower figure is not a damage estimate.

One dollar in eight of Lincoln's assessed value sits in the mapped floodplain.

## What is actually in Lincoln's floodplain

&#91;embedded content: Lancaster County Assessor parcels joined to the FEMA 1% floodplain clipped to the Lincoln corporate limit · 6,046 parcels, 19,712 parcel acres, queried 21 November 2026\]

Inside the city, the 1% floodplain is a commercial corridor with a large unimproved margin. It is not a farm corridor.

| Assessor class | Parcels | Parcel acres | Share of acres | Share of value |
| --- | --- | --- | --- | --- |
| Commercial Unimproved | 978 | 9,330 | 47.3% | 9.2% |
| Commercial Improved | 1,424 | 6,544 | 33.2% | 70.2% |
| Residential Unimproved | 391 | 1,430 | 7.3% | 0.4% |
| Residential Improved | 3,150 | 793 | 4.0% | 19.8% |
| Ag Improved | 9 | 339 | 1.7% | 0.1% |
| Ag Unimproved | 26 | 1,068 | 5.4% | 0.1% |
| None on record | 68 | 207 | 1.1% | 0.0% |

Two things stand out.

**Unimproved land is 60% of the acreage and 9.7% of the value.** The floodplain still has a large undeveloped margin, which is the outcome floodplain management aims for, and a reader scanning only for dollars at risk would pass over it.

**Commercial Improved property is 33.2% of the acreage and 70.2% of the value.** Just 1,424 parcels carry roughly seven dollars in ten of Lincoln's floodplain exposure. If mitigation money follows value, it follows those parcels.

### Why the agricultural share is so small

Agricultural land in the 1% floodplain amounts to **1,407 acres, 7.1% of the parcel acreage, holding $11.7 million, or 0.3% of the value.** The large agricultural parcels along Salt Creek lie outside the corporate limit and belong to a county analysis rather than a city one. Inside Lincoln the floodplain is substantially developed, and 90.1% of the value on floodplain parcels sits on improved land.

## Pre-FIRM housing, and why the claim record hides it

Lincoln's initial FIRM identified date is **27 April 1971**, taken from FEMA's Community Information System row for CID 315273. The column mapping was verified against two control communities before the date was used: Omaha, which shows a blank initial FHBM and an initial FIRM of 08 May 1971, and Alda, which carries all three dates. Lincoln's row shows a blank initial FHBM, initial FIRM 04/27/71, current effective map 04/16/13, regular emergency date 04/23/71, CRS entry 10/01/91, and current CRS class 5 at a 25% discount.

Against that date, **1,793 of the 3,151 floodplain parcels carrying a residential year built predate the first flood map, or 56.9%.** The median year built across them is 1964, seven years before the regulatory boundary. Those 1,793 parcels carry $369.8 million in assessed value against $516.7 million for the 1,358 post-FIRM parcels.

### The record and the stock disagree sharply

| Construction era | SFHA claims | Outside SFHA | Total | Share |
| --- | --- | --- | --- | --- |
| Post-FIRM | 164 ($2,108k) | 77 ($288k) | 241 | 87.6% |
| Pre-FIRM | 30 ($218k) | 4 ($17k) | 34 | 12.4% |

Pre-FIRM structures make up 56.9% of the floodplain's dated residential stock but only 12.4% of its claimants. That is a discrepancy of more than four-fold and it points one way.

The most likely explanation is insurance visibility rather than physical risk. Mandatory purchase attaches to federally backed mortgages, and the oldest housing is the most likely to be owned outright, so pre-FIRM structures are systematically under-represented in any NFIP-derived dataset. Their losses are absorbed privately, through disaster assistance, or not at all, and they never enter the claims file.

This matters for mitigation targeting. A program scoped from claims data will concentrate on post-FIRM construction, which is elevated to the standard in force when it was built, and will systematically skip the pre-FIRM stock that has no elevation requirement behind it. The 466 pre-FIRM structures identified here are a candidate list that the claim record will never surface.

Two honest caveats. The policy extract pulled for this report carries no pre-FIRM flag, so the under-insurance step is an inference from the mandatory purchase rule and not a measured penetration rate; confirming it needs the pre-FIRM field from the policy file. And the 56.9% covers residential structures only, for reasons the next section sets out.

## Data defects worth knowing about

Anyone rebuilding this analysis from the same sources will hit these. Several are not documented anywhere obvious.

| Defect | Effect | Workaround |
| --- | --- | --- |
| Assessor `RESYRBLT` is heavily defaulted to round years | In the floodplain parcels, 1900 appears 370 times, 1910 164 times and 1920 144 times. Round decade years are 1,055 of 3,151 records, 33.5% | Use the field only for a pre-FIRM or post-FIRM split, never for a median, a decade histogram, or a depreciation curve |
| `USEDSCRP` comes back empty | The Assessor parcel service lists a land use description field in its schema and returns null on every record, so a land use breakdown by use code is not available from it | Use `CLASSDSCRP`, which is populated, or join the use code from a different Assessor service |
| `RESYRBLT` is residential-only | 2,958 of the 6,109 floodplain parcels carry no year at all, 48.4%. Some are genuinely unimproved, but every improved commercial, public and institutional parcel is also blank, because the field only ever describes residential structures | Join building-level records, or treat all non-residential vintage as unknown rather than absent |
| `reportedCity` is redacted in `NfipClaims` | Every Lancaster County record returns the literal string `Currently Unavailable`, so a city-name filter silently returns zero rows rather than an error | Filter on `nfipRatedCommunityNumber eq '315273'` or `countyCode eq '31109'` |
| `FimaNfipClaims` no longer exists | The OpenFEMA v2 endpoint returns HTTP 404 | The dataset is `NfipClaims` v3; enumerate current names from `api/open/v1/DataSets` |
| Sentinel construction dates | `originalConstructionDate` in the Lincoln claims file ranges from 1492 to 2013 | Screen the lower tail before computing any age statistic |
| Elevation fields are nearly empty | Only 18 of 275 claims carry `elevationDifference`. Of those 18, 11 sit below base flood elevation, median -3 feet | Treat elevation analysis as unavailable at this scale; the 18 records are not a sample worth generalizing |
| The 0.2% layer is incremental | Layer 0 is `0.2 PCT ANNUAL CHANCE FLOOD HAZARD`, FEMA's shaded Zone X band between the 1% and 0.2% lines, not a cumulative 0.2% extent | Never nest or sum the two layers; the 3,115 in-city acres sit beside the 11,457, not inside them |
| A full page of results is not a complete result | The service returns at most 2,000 records per reply and gives no sign that more exist, so one query against a layer holding 4,060 returns 2,000 and looks like it worked. Separately, a page that times out returns empty, and a pager that treats empty as the end of the data truncates silently | Page with `resultOffset` until a short page arrives, compare the total against `returnCountOnly` every time, and retry an empty page before believing it |

### One residual inconsistency, disclosed

The join runs against a single dissolved union of the clipped flood polygons, so there is no chunk boundary for a parcel to straddle and no parcel is wrongly excluded from the wholly-inside count for sitting across two polygons.

A parcel counts as overlapping when its intersection with the floodplain exceeds one square metre. That threshold excludes parcels which merely share a boundary line with a flood polygon, a common situation where mapping followed parcel lines. It removed 103 of 8,413 candidates.

## What these numbers are not

This is an exposure inventory, not a risk assessment. Risk requires depth and a vulnerability function, and neither is present here. The distinction is not pedantic: it is the difference between a figure that can support a benefit-cost analysis and one that cannot.

### Boundary-clip bias runs one way

The overlap join counts a parcel at full assessed value however little of it lies inside the floodplain. Clipping to the city limits removed most of the mechanism, because the very large agricultural parcels along Salt Creek that drove it are outside the corporate limit. What remains is the 0.2% band, where only 18.5% of overlapping parcels lie wholly inside, against 51.9% for the SFHA. Value attributed to the 0.2% band is therefore substantially more clip-inflated than value attributed to the SFHA, which is why the two bands cannot be compared on the loose measure alone.

That is why every value in this report is given as a bracket. For the 1% floodplain the bracket is **$1,237.1 million to $4,448.2 million**, a factor of 3.6. For the 0.2% band it is $335.2 million to $3,806.4 million, a factor of 11.4, and that wider spread is itself the finding about the band's geometry. The true area-weighted figure sits inside each bracket and would need an area-apportioned valuation, which assessed value does not support.

### Assessed value is the wrong unit, in two directions

Assessed value includes land, and floods do not destroy land. FEMA benefit-cost analysis uses structure replacement cost plus contents, which is a different and usually larger number for a developed parcel and a far smaller one for a farm field.

The assessment basis also distorts across classes. Nebraska assesses most real property at 100% of actual value but [agricultural and horticultural land at 75%](https://www.law.cornell.edu/regulations/nebraska/350-Neb-Admin-Code-ch-10-SS-003). Inside the corporate limit that barely matters, because agricultural land accounts for $11.7 million of the $4.45 billion, or 0.3%. It would matter a great deal in any county-wide version of this analysis. Separate and lower percentages apply for certain school district tax computations, so any dollar figure should state which basis it uses.

### Parcel is not structure

Nothing here counts buildings. A parcel may hold none, one, or many, and the gap runs both ways. Condominium units are the clearest case: 8,310 floodplain parcel records sit on 8,135 distinct building footprints, so a single building can carry many separate assessment records. In the other direction, a large unimproved commercial parcel is one record and no structure at all, and unimproved land is 60% of the floodplain acreage. Parcel counts in this report are counts of assessment records, not of buildings or of households.

### No elevations, and nearly half the SFHA has no base flood elevation at all

There are no first-floor elevations in this analysis and no depth grid, so nothing here identifies which structures take water in a 1% event. A house with three feet of freeboard and one three feet below BFE are counted identically.

On base flood elevations the picture inside the city is better than the county figure suggests, and the distinction matters. Of Lincoln's 11,457 SFHA acres, **only 140 acres, or 1.2%, are Zone A**, the approximate study type with no base flood elevation determined. The rest is Zone AE: 8,223 acres of AE and 3,094 acres of AE floodway, all carrying base flood elevations.

Across the full published layer the ratio inverts. Countywide, Zone A is **38,669 of 69,225 acres, or 56%**. Lincoln's own floodplain is almost entirely studied in detail; Lancaster County's, outside the city, largely is not. A county-weighted Zone A share does not describe conditions inside the city and should not be quoted as if it did.

### Map vintage

The current effective map dates to 16 April 2013 for the city and 27 June 2014 for the county. The hydrology behind it may be considerably older, and upstream watershed development since the study period is not reflected. A mapped 1% discharge is a snapshot of the watershed as modeled, not as it now drains.

## The levee question, and what would close the gaps

The Salt Creek levee system is not FEMA-accredited. It was built to a roughly 50-year, or 2% annual chance, design standard, is maintained by the Lower Platte South NRD, and appears as non-accredited in the [National Levee Database](https://levees.sec.usace.army.mil/). A 2% design standard sits well below the 1% event the FIRM maps, so the system does not provide base-flood protection and cannot be credited as doing so.

**This is the one interpretive question that has to be resolved before any figure in this report is read as a protection statement.** For a non-accredited levee FEMA maps the landward area without levee credit, which would mean the 11,457 acres already include the area behind the embankment. That is the expected treatment, but it has not been confirmed against the Flood Insurance Study hydraulics narrative for this reach, and the alternative treatments produce materially different interpretations of the same polygon. Until the FIS is read, these numbers describe mapped hazard, not residual risk behind a structure.

### An asset inventory that is not in the public conversation

The city's levee layers carry more detail than the accreditation discussion usually reaches: 123 top-of-bank segments covering 33.9 miles, 226 right-of-way lines labeled ROW-1969, a mapped critical area of 1,451 acres reaching 500 feet landside and 300 feet streamside, and **67 drainage structures penetrating the embankment**, each with its station location, length, material, barrel size, gate type, status and an inspection score. One record, for instance, is a 951-foot, 78-inch reinforced concrete pipe.

Penetrations are a standard levee failure mode, and an inventory of 67 of them with gate types, status and condition ratings is the kind of data that supports an interior drainage and closure-reliability review. Mapping these against the 1950 floods would give the non-accreditation discussion something concrete to stand on. The National Weather Service records four major floods across south central and southeast Nebraska between May and July 1950 that together took 25 lives and caused $65 million in damage, roughly $1 billion in 2013 dollars. No digitized inundation footprint for that event appears in the city or county GIS, so a Lincoln-specific extent would have to be rebuilt from the USGS flood report.

The condition field is the part worth reading closely. Sixty-two of the 67 structures are listed active and five inactive. Thirty-four are corrugated metal pipe, 18 reinforced concrete and 15 box culverts, and 34 carry a flap gate.

On condition, 45 carry an MA grade at high, medium or low, 7 are rated **Unacceptable**, and 15 are unrated. **None of the 67 is rated Acceptable.** Inspection scores run from 0 to 79 with a median of 29. Set against a levee that is already non-accredited, seven Unacceptable penetrations is the most specific and most fundable thing in this report.

### What Lincoln already maps that FEMA does not

Lincoln regulates a minimum flood corridor under Municipal Code 27.53.020: a buffer centered on the channel, 90 feet wide where 40 to 100 acres of land drain into the stream, and wider as the drainage area grows. It covers **832 corridors and about 3,500 acres across 13 watersheds**, on creeks far below the size FEMA studies. The acreage is computed rather than read, because the layer carries no area field at all.

Running those corridors against the 1% floodplain shows how much new ground they cover. **294 of the 832 corridors, about 868 acres, fall entirely outside the mapped floodplain**, with no part of them touching it. The largest shares sit on Salt Creek tributaries at 225 acres, Stevens Creek at 123, Oak Creek at 116 and Middle Creek at 85. A corridor that merely clips the floodplain is counted as inside, so 868 acres is a floor rather than an estimate.

That sharpens how the rainfall gap should be stated. It is not that Lincoln maps nothing beyond the FEMA floodplain. It is that what Lincoln maps is a fixed-width buffer on small streams, not a model of where water goes. Stevens Creek alone carries 349 corridors and 1,095 acres. A buffer protects a channel; it does not say which streets pond, which culverts surcharge, or which basements take water, and that is what 60% of the claim record is about.

### What would strengthen this analysis

| Gap | Why it matters | Source | Effort |
| --- | --- | --- | --- |
| No model of where rainfall pools | 60% of claims are rainfall accumulation, which the FIRM does not model. The minimum flood corridor covers small streams, but nothing maps sheet flow or storm sewer capacity. This is the largest blind spot in the picture | City stormwater model, 2D rain-on-grid study | High |
| Clip to the LPSNRD boundary as a second cut | Every figure here is clipped to the city's corporate limit, which reconciles against a city figure. The district boundary would reconcile against the NRD's | LPSNRD boundary polygon | Low |
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

- **Extend local floodplain standards into the 0.2% band.** $3.81 billion of assessed value overlaps 3,115 acres of shaded Zone X inside the city, where federal rules impose no mandatory insurance purchase, no substantial improvement trigger and no floodway standard. Most of that value straddles the line rather than sitting squarely inside it, which is an argument for a standard that applies at the edge. Communities may adopt stricter local standards there, and the CRS program gives credit for doing so.
- **Fund a rainfall flood study.** Sixty percent of paid claims are rainfall or snowmelt accumulation, a mechanism the FIRM does not model anywhere. Until that water is mapped, no capital project or ordinance can be aimed at the cause of most of Lincoln's flood damage. The minimum flood corridor is the nearest existing tool, and a fixed-width buffer is not a model of where water goes.
- **Mitigate the seven repetitive-loss properties.** Seven properties, one of them severe repetitive loss, have produced 21 losses between them and none has been mitigated. FEMA's Flood Mitigation Assistance program prioritizes exactly these. Seven is a fundable number.
- **Decide the levee posture deliberately.** The Salt Creek system is non-accredited at a 50-year design standard. The realistic options are pursuing accreditation, which is expensive, or formally communicating residual risk to the people living behind it, which is not. Doing neither is also a decision.
- **Protect the CRS Class 5 standing.** Lincoln has held a CRS classification since October 1991 and is currently Class 5, which discounts SFHA premiums by 25%. The city's 929 in-force policies carry $759,921 in annual premium, and that rating is re-verified periodically.

### For city staff

These are operational and affect day-to-day administration.

- **Reconcile floodplain acreage to a jurisdictional boundary.** Acreage computed on a coordinate rectangle, as here, will not match any figure the city, county or LPSNRD publishes. Agreeing on one boundary makes every future number comparable.
- **Do not use the assessor year-built field for substantial improvement work.** Round decade years make up 33.5% of floodplain records carrying a date, and 1900 alone appears 370 times. Construction date drives substantial improvement and substantial damage determinations, and this field cannot carry that weight.
- **Close the non-residential construction-date gap.** Roughly 270 improved non-residential parcels in the SFHA carry no construction date at all, including 137 Service and 136 Public Use records. Building-level records are needed before those parcels can be administered consistently.
- **Recognize that Zone A permitting has no elevation to work against.** 11,976 acres, 42.7% of the mapped SFHA, is approximate study with no base flood elevation determined. Staff issuing permits there have no published BFE to apply.
- **Build an elevation certificate repository.** Only 18 of 275 claims carry an elevation difference against BFE. Every certificate captured at permit time compounds in value, supports future mitigation applications, and earns CRS credit.
- **Inspect the 67 levee drainage penetrations, starting with the seven rated Unacceptable.** All 67 already carry a station, length, barrel size, material, gate type, status and an inspection score in the city's own GIS layer, and none of them is rated Acceptable. Penetrations and their closures are a standard levee failure mode, and the inventory exists today.

### For residents

- **Being outside the floodplain is not the same as being safe.** Nearly 30% of Lincoln's flood claims came from Zones X, B and C, outside the mapped floodplain, while only 12% of flood policies cover those zones.
- **Most flood damage here is rainfall, not Salt Creek.** Sixty percent of claims are rainfall or snowmelt accumulation: water that pools, backs up and cannot drain, rather than a creek leaving its banks. A property can take that damage without being near a channel.
- **Homeowners insurance does not cover flood.** Flood coverage is a separate NFIP or private policy. Outside the SFHA it is usually inexpensive, and that is where the coverage gap is widest.
- **In the floodplain, the city's CRS rating cuts premiums by 25%.** That discount exists because of floodplain management work the city does, and it applies to NFIP policies written in Lincoln.
- **Know your zone, and know your home's age.** A house built before April 1971 predates Lincoln's first flood map and has no elevation requirement behind it. More than half the floodplain's residential structures with a recorded date fall in that group.
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

- **Area method.** Areas are taken in EPSG:5070, an equal-area projection, with interior rings subtracted. Service `Shape_Area` values are not used: these layers publish in Web Mercator, which overstates area at this latitude by roughly three quarters.
- **FEMA date provenance.** The Community Information System column order was verified against two controls before Lincoln's row was read: Omaha, with a blank initial FHBM and an initial FIRM of 08 May 1971, and Alda, carrying all three dates.
- **Join reproducibility.** The parcel join was run twice, once counting any geometric intersection and once requiring more than one square metre of overlap. The two differed by 103 parcels out of 8,413, which is the set that shares a boundary line with a flood polygon without overlapping it. The stricter result is the one reported.
- **Pagination integrity.** Paged record totals were checked against the server's own `returnCountOnly` figure for each layer. The parcel layer reported 122,748 records and 122,748 were received.

### Checks that constrained the findings

- **Year-built distribution.** Round decade years account for 33.5% of floodplain records carrying a construction date, with 1900 appearing 370 times. Vintage claims are capped at a pre-FIRM or post-FIRM split and go no finer.
- **Containment test.** 3,140 of 6,046 parcels lie wholly inside the 1% floodplain and 827 of 4,466 inside the 0.2% band, so every dollar figure is reported as a bracket rather than a point estimate.
- **Elevation coverage.** Just 18 of 275 claims carry an elevation difference against base flood elevation, so no elevation or depth analysis was attempted at any scale.

### As of this report

NFIP figures rest on live queries run on 16 November 2026; spatial figures on queries run 21 November 2026. The 0.2% band reflects all 4,060 of the service's polygons, of which 982 fall within the corporate limit after clipping.

Assessed values follow the current county assessment roll and are revised annually. The claims and policy extracts are point-in-time pulls from OpenFEMA and will shift as FEMA refreshes them.

## Where to go from here

| If you want to | Go to |
| --- | --- |
| Look up the flood zone for an address | [FEMA Flood Map Service Center](https://msc.fema.gov/portal/home) |
| Ask about floodplain permits, the local flood standards or the Community Rating System | City of Lincoln Watershed Management, through [lincoln.ne.gov](https://www.lincoln.ne.gov/) |
| Ask about the Salt Creek levee | [Lower Platte South Natural Resources District](https://www.lpsnrd.org/) |
| Check a property's assessment record | [Lancaster County property records](https://orion.lancaster.ne.gov/) |
| Buy or ask about flood insurance | [FloodSmart, the National Flood Insurance Program](https://www.floodsmart.gov/) |
| Download the same data | The Sources table above lists every service used |
| See it on the map | [starcitylincoln.org](index.html) |

---

A companion study, [Who Lincoln Over-Assesses, and Who It Does Not](assessment.html), measures the county assessor against the standards its own profession sets, using 3,340 arm's-length sales. It finds the level and the consistency sound and the vertical equity outside standard.
