# Who Lincoln Over-Assesses, and Who It Does Not

## Summary

**Scope note, November 21, 2026.** The sales in this paper come from the part of Lincoln shown on the STARCITY map, about two thirds of the city by area. Sales in the city's north and northwest edges, including the Highlands, Fallbrook and Air Park, are not yet included. A citywide update is in progress.

Lincoln's assessor passes the two headline tests its own profession sets, and fails the third. The third is the one about fairness between neighbours.

Across **2,858 valid residential sales in 2025 and 2026**, each carrying both a sale price and the assessed value in force, the assessment ratio behaves like this:

1. **The level is sound.** The median ratio is **0.919**, inside the International Association of Assessing Officers' acceptable range of 0.90 to 1.10.
2. **The consistency is sound.** The coefficient of dispersion is **13.1**, inside the IAAO standard of 15 or less for older, mixed residential areas. Most of Lincoln is assessed consistently.
3. **The equity is not.** The price-related differential is **1.040**, outside the IAAO standard of 0.98 to 1.03. A PRD above that range means the assessment is **regressive**: cheaper homes are assessed at a higher share of what they actually sell for than expensive ones.

What regressivity looks like in dollars, measured across sale price deciles:

- Homes in the **cheapest tenth** of the market, median sale price **$175,000**, are assessed at **98.9%** of what they sell for.
- Homes in the **most expensive tenth**, median sale price **$712,500**, are assessed at **85.0%**.

The tax rate is the same for both. So the owner of a $175,000 house pays property tax on essentially the whole value of their house, and the owner of a $712,500 house pays on about six sevenths of theirs.

**This is not an accusation of misconduct.** Regressivity is the most common failure mode in mass appraisal anywhere, because expensive homes are more varied and harder for a model to price than modest ones, and the error runs one way. It is still a real transfer, it is measurable, and it is fixable.

## Method

This is a standard sales ratio study, the same instrument an assessment office is measured by.

| | |
| --- | --- |
| Source | Lancaster County Assessor property sales, via Lincoln GIS |
| Records | 2,933 sales, of which 2,858 residential and 74 commercial |
| Period | 2025 and 2026 |
| Validity | every record carries SaleValidityCode 01, the county's own arm's-length flag |
| Ratio | assessed value divided by sale price, per sale |

Three measures, and what each is for:

- **Median ratio.** Is property assessed at roughly the right level overall. Nebraska requires residential property at 100% of actual value.
- **Coefficient of dispersion (COD).** Average absolute deviation from the median ratio, as a percentage of it. Measures consistency: are similar properties treated alike. Lower is better; 15 or less is the IAAO standard for older heterogeneous residential, 10 or less for newer homogeneous tracts.
- **Price-related differential (PRD).** Mean ratio divided by the value-weighted mean ratio. Measures vertical equity, meaning whether cheap and expensive property are treated alike. Above 1.03 is regressive, below 0.98 progressive.

### One caveat that governs how the level should be read

Nebraska's assessment date is 1 January. These sales happen through the following year. If the market rises during the year, later sales produce lower ratios automatically, with no error by the assessor. That means **the 0.919 level should not be read as deliberate under-assessment**, and it is why this report does not lead with it.

It does not explain the gradient. Market movement affects cheap and expensive homes in the same period alike, so it cannot produce a 14 point spread between the bottom decile and the top. The gradient is the finding; the level is confounded and is reported rather than interpreted.

## The gradient

| Sale price decile | Sales | Median sale price | Median ratio |
| --- | --- | --- | --- |
| 1, lowest | 285 | $175,000 | **0.989** |
| 2 | 285 | $220,000 | 0.933 |
| 3 | 285 | $250,000 | 0.929 |
| 4 | 285 | $276,000 | 0.925 |
| 5 | 285 | $307,500 | 0.919 |
| 6 | 285 | $343,000 | 0.931 |
| 7 | 285 | $385,000 | 0.907 |
| 8 | 285 | $442,357 | 0.912 |
| 9 | 285 | $525,000 | 0.904 |
| 10, highest | 293 | $712,500 | **0.850** |

The decline is not perfectly monotonic, deciles 6 and 8 tick up, which is what real data looks like. The direction across the range is unambiguous.

## Where it shows up on the map

Neighborhood groups with at least 20 sales, sorted by median ratio.

| Assessed furthest below sale price | Sales | Median ratio | Median sale price |
| --- | --- | --- | --- |
| NC500 | 58 | 0.787 | $483,250 |
| NC100 | 55 | 0.812 | $720,000 |
| 850 | 122 | 0.818 | $454,732 |
| CDCN | 35 | 0.864 | $253,000 |
| NC600 | 170 | 0.883 | $530,000 |

| Assessed closest to or above sale price | Sales | Median ratio | Median sale price |
| --- | --- | --- | --- |
| L43 | 42 | 0.949 | $222,500 |
| M302 | 30 | 0.955 | $245,000 |
| 856 | 46 | 0.964 | $355,000 |
| M304 | 49 | 0.988 | $238,000 |
| HR3 | 20 | **1.051** | $141,500 |

HR3, with a median sale price of $141,500, is assessed at **105.1% of what its houses actually sell for**. NC100, with a median sale price of $720,000, is assessed at **81.2%**.

That is the whole finding in two rows. The cheapest neighborhood in this table is taxed on more than its market value. The most expensive is taxed on four fifths of its.

## What this is not

A question any reader will ask is whether this follows the old redlining lines. **It does not**, and that is worth stating plainly rather than leaving implied.

| 1930s HOLC grade | Sales | Median ratio | COD | Median sale price |
| --- | --- | --- | --- | --- |
| A, Best | 310 | 0.921 | 10.1 | $263,950 |
| B, Still desirable | 305 | 0.949 | 10.4 | $225,000 |
| C, Definitely declining | 310 | 0.924 | 8.8 | $225,000 |
| D, Hazardous, redlined | 10 | 0.907 | 9.6 | $222,450 |
| Outside any graded area | 1,923 | 0.915 | 14.7 | $384,504 |

The four graded grades sit within three points of each other, and all four are assessed **more consistently** than the rest of the city, with CODs between 8.8 and 10.4 against 14.7 outside. Grade D carries only 10 sales, too few to support any claim at all, and it is shown for completeness rather than as evidence.

The regressivity lives in the newer, more expensive city, not in the historic core.

## The newest housing is the least consistently assessed

| Decade built | Sales | Median ratio | COD | Median sale price |
| --- | --- | --- | --- | --- |
| 1890 to 1909 | 92 | 0.926 | 12.3 | $201,222 |
| 1910 to 1929 | 277 | 0.917 | 11.2 | $225,000 |
| 1930 to 1949 | 120 | 0.925 | 10.1 | $255,500 |
| 1950 to 1969 | 577 | 0.928 | 8.3 | $262,600 |
| 1970 to 1989 | 542 | 0.920 | 8.2 | $310,000 |
| 1990 to 2009 | 491 | 0.931 | 6.8 | $401,104 |
| 2010 to 2029 | 732 | 0.900 | **24.0** | $484,375 |

Ratios barely move across 120 years of construction, which is a credit to the office. Consistency does, and it collapses in the newest stock. A COD of **24.0** is well outside any IAAO standard, including the most lenient. Housing built since 2010 is both the largest group in this sample and by far the least evenly assessed, and it is where the expensive homes are.

That points at a cause. Regressivity here is unlikely to be about old versus new neighborhoods. It is most likely about new construction being hard to model, and new construction being disproportionately expensive.

## Commercial property is worse

Commercial sales are thin at 74 records, so this is a signal and not a conclusion.

| | Median ratio | COD | PRD |
| --- | --- | --- | --- |
| Residential | 0.919 | 13.1 | 1.040 |
| Commercial | **0.850** | 14.5 | **1.091** |

Both measures run further from standard than residential. A PRD of 1.091 is three times outside the IAAO range.

## What these numbers are not

- **Not a claim about any individual property.** A ratio study describes a population. A single house can sit anywhere in the distribution for entirely legitimate reasons.
- **Not a measure of whether your taxes are too high.** It measures whether your share is proportionate to your neighbour's. Total levy is set by budgets, not by the assessor.
- **Not based on an assessment-date-matched sample.** See the caveat above. The level is confounded by market movement; the gradient is not.
- **Two years of sales.** Neighborhood cells run from 20 to 170 sales. The citywide figures are solid, the neighborhood rows are indicative.
- **Sales the county flagged valid.** Every record carries code 01. No independent screen for distressed or related-party transactions was applied on top.

## What to do with it

**If you are a homeowner.** Divide your assessed value by what you believe your house would sell for. If that number is meaningfully above 0.919 you are assessed above the city norm, and that is the basis of a protest to the County Board of Equalization. Nebraska's protest window is in June.

**If you are a realtor.** The ratio by neighborhood group is a pricing signal. A listing in a group assessed at 0.79 is carrying an assessed value that understates the market, and a buyer should expect the assessment to catch up. In a group assessed above 1.00 the opposite is true, and the tax line in the listing is overstated relative to value.

**If you are on the council or the board of equalization.** Three things follow. The PRD of 1.040 is a measurable failure against a professional standard and is the right question to put to the assessor's office. The COD of 24.0 on post-2010 construction names where the modelling is weakest. And commercial at a PRD of 1.091 is worse than residential on a sample thin enough that it should be measured properly rather than argued about.

None of this requires new data collection. It is the county's own sales file, measured with the county's own profession's standard.

---

A companion study, [Lincoln Floodplain Exposure and Flood Loss](floodplain.html), maps every parcel against the FEMA floodplain and the NFIP claim record. It finds that 8.53% of Lincoln's parcels and 12.19% of its assessed value sit in the mapped floodplain, and that most of the city's realized flood losses fall outside it.
