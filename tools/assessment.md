# Who Lincoln Over-Assesses, and Who It Does Not

*Published November 21, 2026 by STARCITY, starcitylincoln.org. Data retrieved November 21, 2026 unless a section says otherwise.*

## Summary

On sales made after the 2026 values were set, Lincoln's assessments pass two of the profession's three headline tests and miss the third, the one about fairness between cheaper and more expensive homes. A second check on November 22, 2026 found that the miss comes from newly built homes, and that with them set aside all three pass. **The state's official study, which uses earlier sales, finds all three within the standard.** Both results are set out below, and readers should weigh them together.

Across **3,340 valid residential sales inside the city limits in 2025 and 2026**, each carrying both a sale price and the assessed value in force, the assessment ratio behaves like this:

1. **The level is sound.** The median ratio is **0.920**, inside the International Association of Assessing Officers' acceptable range of 0.90 to 1.10.
2. **The consistency is sound.** The coefficient of dispersion is **12.6**, inside the IAAO standard of 15 or less for older, mixed residential areas. Most of Lincoln is assessed consistently.
3. **The equity result depends on new construction.** Across all 3,340 sales the price-related differential is **1.037**, outside the IAAO standard of 0.98 to 1.03. A PRD above that range means the assessment is **regressive**: cheaper homes are assessed at a higher share of what they actually sell for than expensive ones. Most of that comes from homes built in 2024 or later, many of them on the roll at an unfinished value. With those set aside the PRD is **1.012**, inside the standard, and a small tilt remains at the two ends of the market. The section on the University of Chicago's method below has the detail.

What regressivity looks like in dollars, measured across sale price deciles:

- Homes in the **cheapest tenth** of the market, median sale price **$172,000**, are assessed at **98.9%** of what they sell for.
- Homes in the **most expensive tenth**, median sale price **$665,368**, are assessed at **85.6%**.

The tax rate is the same for both. So the owner of a $172,000 house pays property tax on essentially the whole value of their house, and the owner of a $665,000 house pays on about six sevenths of theirs. **Newly built homes account for much of that gap.** They are mostly expensive, and many were assessed before they were finished. Leaving out the sales the University of Chicago's method treats as outliers, the cheapest tenth is at 97.6% and the most expensive tenth at 89.9%: a gap of about eight points, not thirteen.

**This is not an accusation of misconduct.** Regressivity is the most common failure mode in mass appraisal anywhere, because expensive homes are more varied and harder for a model to price than modest ones, and the error runs one way. What remains once new construction is set aside is small. It is measurable, and it is a reason to repeat the test each year.

## How this compares with the state's official study

The Nebraska Department of Revenue measures every county assessor each year. Its [2026 Reports and Opinions for Lancaster County](https://revenue.nebraska.gov/sites/default/files/doc/pad/research/statewide_equalization/counties/2026/55Lancaster.pdf) tested 2026 residential values against 8,360 sales made from October 1, 2023 to September 30, 2025.

| Measure | State's official study | This paper | Standard |
| --- | --- | --- | --- |
| Sales used | 8,360, countywide, October 2023 to September 2025 | 3,340, inside Lincoln, November 2025 to November 2026 | |
| Median ratio | 0.970 | 0.920 | 0.90 to 1.10 (Nebraska requires 0.92 to 1.00) |
| Coefficient of dispersion | 4.97 | 12.6 | 15 or less |
| Price-related differential | 1.006 | 1.037 | 0.98 to 1.03 |

The two studies answer different questions. The state tests values against the sales that were available when the values were set. This paper tests the same values against sales that happened afterward, which the assessor could not have seen.

The state's own table by price range shows a gradient in the same direction, but much smaller: a median ratio of 1.019 for homes sold at $100,000 to $149,999, and 0.963 for homes sold at $500,000 to $999,999.

A wider gap on later sales can have more than one cause. Prices may have risen faster for expensive homes during 2026. A valuation model fits the sales it was built on more closely than the sales that come later. The mix of homes sold differs between the two periods, and the state's figures cover the whole county. This paper cannot tell these apart, and it is not evidence of any wrongdoing. It is a reason to repeat the test each year.

## The same sales through the University of Chicago's method

The Center for Municipal Finance at the University of Chicago publishes an open R package, [cmfproperty](https://github.com/cmf-uchicago/cmfproperty), that it uses to grade assessment fairness in counties across the country. On November 22, 2026 the 3,340 sales in this paper were run through it unchanged.

The package first removes outliers: any sale whose ratio sits more than one and a half times the interquartile range outside the middle half of all ratios. Here that removes 334 sales, 10% of the total. Their median ratio is 0.31, and 228 of them are homes built in 2024 or later. A new home is often on the roll on January 1 at the value of a lot or a partly built house, and sells finished months later. This paper counted those sales. The package, like most ratio studies, does not.

| Measure | All 3,340 sales, as in this paper | Chicago method, 3,006 sales | Homes built before 2024, 2,868 sales, nothing else removed | State's official study | Standard |
| --- | --- | --- | --- | --- | --- |
| Median ratio | 0.920 | 0.927 | 0.926 | 0.970 | 0.90 to 1.10 |
| Coefficient of dispersion | 12.6 | 7.1 | 7.8 | 4.97 | 15 or less |
| Price-related differential | 1.037 | 1.008 | 1.012 | 1.006 | 0.98 to 1.03 |
| Price-related bias | not run | -0.013 | not run | not published | -0.05 to 0.05 |

Four things follow.

1. **With unfinished new construction out, Lincoln passes all three standards.** It does so whether the outliers are removed by the package's rule or simply by leaving out homes built in 2024 or later.
2. **The failure in this paper lives in new homes.** The 435 sales of homes built in 2024 or later have a median ratio of 0.607 and a coefficient of dispersion of 49.7. That measures when those values were set more than how well. It is the same place the section on the newest housing, further down, already points to.
3. **A small tilt remains at the two ends of the market.** After the package's outlier rule, the cheapest tenth of homes, median sale price $175,000, are assessed at 97.6% of what they sold for. The most expensive tenth, median $635,000, are at 89.9%. The eight groups between them run from 91.6% to 93.3%. Six of the package's seven regression tests call that regressive. It is real enough to detect and small enough to pass the standards.
4. **Part of that tilt is an artifact of sorting by sale price.** A home that sells for more than it is worth lands in a higher price group with a lower ratio, with no error by the assessor. The package's own simulation shows that random noise of 8 to 9% in sale prices, on top of perfectly even assessments, would produce the same three statistics. Ranked by the average of sale price and assessed value instead, the two ends come to 94.7% and 91.4%. The true tilt is somewhere between none and what the price ranking shows.

The gradient and the maps in the rest of this paper use all 3,340 sales, new construction included, so they show a steeper slope than the figures here. Read them with this section in mind.

## Method

This is a standard sales ratio study, the same instrument an assessment office is measured by.

| | |
| --- | --- |
| Source | Lancaster County Assessor property sales, via Lincoln GIS |
| Records | 3,430 sales inside Lincoln's corporate limit, of which 3,340 residential and 90 commercial |
| Period | 2025 and 2026 |
| Validity | every record carries SaleValidityCode 01, the county's own arm's-length flag |
| Ratio | assessed value divided by sale price, per sale |

Three measures, and what each is for:

- **Median ratio.** Is property assessed at roughly the right level overall. Nebraska requires residential property at 100% of actual value.
- **Coefficient of dispersion (COD).** Average absolute deviation from the median ratio, as a percentage of it. Measures consistency: are similar properties treated alike. Lower is better; 15 or less is the IAAO standard for older heterogeneous residential, 10 or less for newer homogeneous tracts.
- **Price-related differential (PRD).** Mean ratio divided by the value-weighted mean ratio. Measures vertical equity, meaning whether cheap and expensive property are treated alike. Above 1.03 is regressive, below 0.98 progressive.

### One caveat that governs how the level should be read

Nebraska's assessment date is 1 January. These sales happen through the following year. If the market rises during the year, later sales produce lower ratios automatically, with no error by the assessor. That means **the 0.920 level should not be read as deliberate under-assessment**, and it is why this report does not lead with it.

It does not explain the gradient. Market movement affects cheap and expensive homes in the same period alike, so it cannot produce a 13 point spread between the bottom decile and the top. The gradient is the finding; the level is confounded and is reported rather than interpreted.

## The gradient

| Sale price decile | Sales | Median sale price | Median ratio |
| --- | --- | --- | --- |
| 1, lowest | 334 | $172,000 | **0.989** |
| 2 | 334 | $220,000 | 0.930 |
| 3 | 334 | $250,000 | 0.925 |
| 4 | 334 | $275,000 | 0.923 |
| 5 | 334 | $305,000 | 0.924 |
| 6 | 334 | $337,000 | 0.914 |
| 7 | 334 | $375,000 | 0.912 |
| 8 | 334 | $425,000 | 0.909 |
| 9 | 334 | $500,000 | 0.904 |
| 10, highest | 334 | $665,368 | **0.856** |

The decline is not perfectly monotonic, decile 5 ticks up by a hair, which is what real data looks like. The direction across the range is unambiguous.

## Where it shows up on the map

Neighborhood groups with at least 20 sales, sorted by median ratio.

| Assessed furthest below sale price | Sales | Median ratio | Median sale price |
| --- | --- | --- | --- |
| NC500 | 58 | 0.787 | $483,250 |
| NC100 | 55 | 0.812 | $720,000 |
| 850 | 125 | 0.845 | $468,000 |
| CDCN | 33 | 0.859 | $272,000 |
| L33 | 34 | 0.886 | $267,500 |

| Assessed closest to or above sale price | Sales | Median ratio | Median sale price |
| --- | --- | --- | --- |
| L43 | 60 | 0.963 | $206,250 |
| 856 | 46 | 0.964 | $355,000 |
| HR2 | 29 | 0.980 | $130,000 |
| M304 | 49 | 0.988 | $238,000 |
| HR3 | 21 | **1.045** | $144,000 |

HR3, with a median sale price of $144,000, is assessed at **104.5% of what its houses actually sell for**. NC100, with a median sale price of $720,000, is assessed at **81.2%**.

That is the whole finding in two rows. One of the cheapest neighborhoods in this table is taxed on more than its market value. The most expensive is taxed on four fifths of its.

## What this is not

A question any reader will ask is whether this follows the old redlining lines. **It does not**, and that is worth stating plainly rather than leaving implied.

| 1930s HOLC grade | Sales | Median ratio | COD | Median sale price |
| --- | --- | --- | --- | --- |
| A, Best | 297 | 0.920 | 10.0 | $267,000 |
| B, Still desirable | 312 | 0.948 | 10.5 | $225,000 |
| C, Definitely declining | 371 | 0.925 | 8.8 | $230,000 |
| D, Hazardous, redlined | 10 | 0.907 | 9.6 | $222,450 |
| Outside any graded area | 2,350 | 0.916 | 13.8 | $369,000 |

The four graded grades sit within about four points of each other, and all four are assessed **more consistently** than the rest of the city, with CODs between 8.8 and 10.5 against 13.8 outside. Grade D carries only 10 sales, too few to support any claim at all, and it is shown for completeness rather than as evidence.

The regressivity lives in the newer, more expensive city, not in the historic core.

## The newest housing is the least consistently assessed

| Decade built | Sales | Median ratio | COD | Median sale price |
| --- | --- | --- | --- | --- |
| 1890 to 1909 | 93 | 0.928 | 12.1 | $200,000 |
| 1910 to 1929 | 285 | 0.920 | 11.6 | $225,000 |
| 1930 to 1949 | 118 | 0.921 | 10.2 | $256,500 |
| 1950 to 1969 | 607 | 0.927 | 8.5 | $260,000 |
| 1970 to 1989 | 582 | 0.920 | 7.8 | $305,000 |
| 1990 to 2009 | 742 | 0.928 | 6.3 | $350,000 |
| 2010 to 2029 | 875 | 0.905 | **22.1** | $449,000 |

Ratios barely move across 120 years of construction, which is a credit to the office. Consistency does, and it collapses in the newest stock. A COD of **22.1** is well outside any IAAO standard, including the most lenient. Housing built since 2010 is both the largest group in this sample and by far the least evenly assessed, and it is where the expensive homes are.

That points at a cause. Regressivity here is unlikely to be about old versus new neighborhoods. It is most likely about new construction being hard to model, and new construction being disproportionately expensive.

## Commercial property is worse

Commercial sales are thin at 90 records, so this is a signal and not a conclusion.

| | Median ratio | COD | PRD |
| --- | --- | --- | --- |
| Residential | 0.920 | 12.6 | 1.037 |
| Commercial | **0.853** | 16.0 | **1.261** |

Both measures run further from standard than residential. A PRD of 1.261 is far outside the IAAO range, though with 90 sales a handful of large transactions can move it a long way.

## What these numbers are not

- **Not a claim about any individual property.** A ratio study describes a population. A single house can sit anywhere in the distribution for entirely legitimate reasons.
- **Not a measure of whether your taxes are too high.** It measures whether your share is proportionate to your neighbour's. Total levy is set by budgets, not by the assessor.
- **Not based on an assessment-date-matched sample.** See the caveat above. The level is confounded by market movement; the gradient is not.
- **Two years of sales.** Neighborhood cells run from 20 to 180 sales. The citywide figures are solid, the neighborhood rows are indicative.
- **Sales the county flagged valid.** Every record carries code 01. No independent screen for distressed or related-party transactions was applied on top.

## What to do with it

**If you are a homeowner.** Divide your assessed value by what you believe your house would sell for. If that number is meaningfully above 0.920 you are assessed above the city norm, and that is the basis of a protest to the County Board of Equalization. Nebraska's protest window is in June.

**If you are a realtor.** The ratio by neighborhood group is a pricing signal. A listing in a group assessed at 0.79 is carrying an assessed value that understates the market, and a buyer should expect the assessment to catch up. In a group assessed above 1.00 the opposite is true, and the tax line in the listing is overstated relative to value.

**If you are on the council or the board of equalization.** Three things follow. The PRD of 1.037 fails a professional standard when every sale is counted and passes at 1.012 when homes built in 2024 or later are set aside, so the question to put to the assessor's office is how a newly built home is valued in its first year on the roll. The COD of 22.1 on post-2010 construction names where the modelling is weakest. And commercial at a PRD of 1.261 is worse than residential on a sample thin enough that it should be measured properly rather than argued about.

None of this requires new data collection. It is the county's own sales file, measured with the county's own profession's standard.

## Corrected November 22, 2026

The first version of this paper said assessments fail the equity standard. Running the same sales through the University of Chicago's open method showed that result depends on homes built in 2024 or later, many assessed before they were finished. With those set aside the standard is met. The summary, the comparison section and the advice to the council were rewritten to say so. The figures for all 3,340 sales are unchanged and still shown.

## Sources

Retrieved November 21, 2026.

| Source | What was used | Link |
| --- | --- | --- |
| Lancaster County Assessor, published by City of Lincoln and Lancaster County GIS | Property sales layer (`Assessor/PropertySales/MapServer/0`): sale price, sale date, validity code, assessed value, structure type, year built, neighborhood group | [gis.lincoln.ne.gov](https://gis.lincoln.ne.gov/public/rest/services) |
| City of Lincoln GIS | City limits (`Planning/LincolnLimits/MapServer/3`), used to keep sales inside the corporate limit | [gis.lincoln.ne.gov](https://gis.lincoln.ne.gov/public/rest/services) |
| City of Lincoln GIS | 1930s Home Owners' Loan Corporation grade areas (`Planning/CompPlan2050/MapServer/5`) | [gis.lincoln.ne.gov](https://gis.lincoln.ne.gov/public/rest/services) |
| International Association of Assessing Officers | Standard on Ratio Studies: the acceptable ranges for level, COD and PRD | [iaao.org](https://www.iaao.org/) |

## Where to go from here

| If you want to | Go to |
| --- | --- |
| Look up your own assessed value | [Lancaster County property records](https://orion.lancaster.ne.gov/) |
| Protest a valuation | Lancaster County Board of Equalization, through the County Clerk at [lancaster.ne.gov](https://www.lancaster.ne.gov/). Nebraska's protest window is in June |
| Ask how values are set | Lancaster County Assessor/Register of Deeds, through [lancaster.ne.gov](https://www.lancaster.ne.gov/) |
| See the state's own measurement of the county | Nebraska Department of Revenue, Property Assessment Division, Reports and Opinions, at [revenue.nebraska.gov](https://revenue.nebraska.gov/PAD) |
| Rerun this study | The scripts are in the project repository under tools/analysis |

---

A companion study, [Lincoln Floodplain Exposure and Flood Loss](floodplain.html), maps every parcel against the FEMA floodplain and the NFIP claim record. It finds that 8.09% of Lincoln's parcels and 12.71% of its assessed value sit in the mapped floodplain, and that most of the city's realized flood losses fall outside it.
