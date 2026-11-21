# Addendum

## What this is

**Scope note, November 21, 2026.** The parcel counts and assessed values in this paper cover the part of Lincoln shown on the STARCITY map: about two thirds of the city by area (72 of 107 square miles). The city's north and northwest edges, including the Highlands, Fallbrook, Air Park and the airport area, are not yet counted, so citywide totals will be higher than the figures here. A citywide update is in progress.

Every change made to the floodplain report since the copy you have. The first item is a correction to the spatial scope that moves most of the numbers, several of them by more than a factor of two, and it reverses the direction of two findings. Read that section before anything else in the report.

## The correction that matters: the analysis was never scoped to Lincoln

The first release pulled flood polygons with a latitude and longitude envelope and reported figures derived from whatever that box returned.

An ArcGIS envelope filter returns **whole features** that intersect the box. So a floodplain polygon running for miles along Salt Creek, clipping the corner of the box, contributed its entire area to a figure described as Lincoln's. At the same time, 868 of the layer's 1,593 polygons never touched the box and were dropped. The reported 28,051 acres was therefore neither the city's floodplain nor the county's. It was an artifact of the query.

Separately, the parcel join ran against a much smaller extent than the acreage implied, so exposure came out low while area came out high. The two errors pushed in opposite directions and the result looked plausible.

Every spatial figure has been recomputed, clipped to the City of Lincoln corporate limit, in an equal-area projection, against the complete layers.

### The headline numbers

| | first release | corrected | |
| --- | --- | --- | --- |
| 1% floodplain, acres | 28,051 | 11,457 | overstated 2.4x |
| 1% floodplain, parcels | 1,775 | 5,296 | understated 3.0x |
| 1% floodplain, assessed value | $1,116.5M | $3,548.6M | understated 3.2x |
| 0.2% band, acres | 2,322 | 3,115 | |
| 0.2% band, assessed value | $1,199.9M | $2,948.9M | |
| Combined parcels | 2,917 | 7,224 | understated 2.5x |
| Combined assessed value | $1.92B | $4.47B | understated 2.3x |
| Wholly inside either band | 731 | 4,457 | understated 6.1x |
| Share of city assessed value | 5.1% | 12.19% | |

One dollar in eight of Lincoln's assessed value sits in the mapped floodplain. The first release put it at one in twenty.

### Two findings reverse

**The floodplain is not mostly open farmland.** The first release said 95.2% of the floodplain parcel acreage was farm, park or vacant, and described Lincoln's floodplain as "overwhelmingly a working agricultural and open-space corridor." That was a county figure presented as a city one. Inside the corporate limit, agricultural land is **597 acres, 5.0% of the parcel acreage, holding 0.2% of the value**, against 23,415 acres and $170.1 million as published. Commercial Improved property is 31.7% of the acreage and carries **69.8% of the value**. Lincoln's floodplain is a commercial corridor.

**Base flood elevations are not missing across half the SFHA.** The first release said 42.7% of the SFHA was Zone A, with no base flood elevation determined. Inside the city it is **140 acres of 11,457, or 1.2%**. The 42.7% was again a county-weighted figure. Countywide, Zone A really is 56% of the layer. Lincoln's own floodplain is almost entirely studied in detail. This correction runs in the city's favour.

### One finding weakens

The first release said the 0.2% band holds assessed value comparable to the SFHA on a twelfth of the land, a 13 to 1 ratio on value per acre, and said the finding survived a strict lower-bound test.

Corrected, the land ratio is 3.7 to 1 and the value-per-acre ratio is **3.06 to 1**. On the strict wholly-inside test it **reverses to 0.91**, meaning the band carries slightly less value per mapped acre than the SFHA. The cause is visible in the parcel geometry: 55.8% of SFHA parcels lie wholly inside it against only 18.4% for the band, so the loose measure credits the band with the full value of properties that are mostly outside it. The report now states both measures and says plainly that the strong version does not hold.

### A trap worth passing on

`Planning/LincolnLimits/MapServer/3` returns 70 nested features, every one labelled `Lincoln`. The largest, 289.8 square miles, is the extraterritorial jurisdiction, which reaches three miles past the corporate limit. The city itself is the next one down at 106.7 square miles. Taking the largest, or unioning all 70, silently substitutes the ETJ for the city.

Related: these layers publish in Web Mercator, which inflates area by roughly three quarters at Lincoln's latitude. Any `Shape_Area` sum taken at face value is wrong by that much, and the `MinimumCorridor` layer carries no area field at all.

## Withdrawn pending recomputation

Three passages rested on parcel fields not present in the corrected extract and are marked in the report rather than silently revised.

- The pre-FIRM housing count, previously 466 of 973 residential structures, or 47.9%. The claim-side comparison in that section is unaffected and stands.
- The minimum flood corridor overlay, previously 366 corridors and about 1,221 acres falling entirely outside the floodplain.
- Land use detail by use code, including the public-use and floodway structure counts.

## What is unchanged and reverified

- The NFIP claim record: 275 claims, 138 paid, $2,630,621, with 165 coded rainfall accumulation and 47 stream overflow. The central finding that Lincoln's realized losses are mostly rainfall-driven is untouched by the spatial correction.
- 81 of 275 claims from outside the SFHA against 109 of 929 policies.
- 107 claims on 6 and 7 May 2015; 2015 carries 87% of all dollars ever paid.
- 7 multiple-loss properties, 1 severe repetitive loss, 21 losses, none mitigated, 4 insured.
- Levee drainage structures re-queried 21 November 2026: 7 Unacceptable, 45 Minimally Acceptable, 15 unrated, 67 total, and **no structure carries an Acceptable rating**. The value does not occur in the dataset.
- Minimum flood corridor: 832 corridors, recomputed to about 3,500 acres against 3,372 published, a 3.4% difference attributable to simplification in the original pull.

## Earlier corrections, carried forward

- **The query envelope was stated wrong.** The Method section named a box that was not the one used. Both boxes are now moot, since the analysis is clipped to the corporate limit.
- **The levee asset counts were a subset.** Was 111 top-of-bank segments, 163 right-of-way lines and 47 drainage structures; corrected to 123 segments covering 33.9 miles, 226 right-of-way lines and 67 drainage structures.
- **The 1950 flood figures could not be sourced.** Specifics of 11 inches in 6 hours, 20,000 acres and 9 deaths were removed and replaced with the National Weather Service account: four major floods across south central and southeast Nebraska between May and July 1950, together taking 25 lives and causing $65 million in damage, roughly $1 billion in 2013 dollars.
- **The vintage figures were wrong.** A reported median year built of 1914 and a pre-1920 share of 61.9% contradicted the decade histogram published beside them. Recomputed to a median of 1972 and a pre-1920 share of 30.0%. All vintage claims were then capped at the pre and post-1971 split, because the year-built field is heavily defaulted to round years.
- **A duplicate byline.** The page shell and the markdown both emitted it, in two different date formats, so no check caught it. Fixed.
