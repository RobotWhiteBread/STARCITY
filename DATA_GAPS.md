# Where the city's data stops

*Last updated November 21, 2026.*

STARCITY uses only data that public agencies already publish. This page lists the places where that data stops: where it is missing, out of date, or published in a form that cannot be mapped. For each one it says what the map does in the meantime and what would fill the gap. Every item is something an agency could fix, and take credit for.

## How to read this

- A gap marked Confirmed is one we hit while building the map or its papers.
- A gap marked To confirm is one we looked for and did not find. The data may exist somewhere we did not look. If you know where, tell us.
- Where the map fills a gap with an estimate, the estimate is labeled as one, with its method.
- Where a gap cannot be filled honestly, the map shows nothing. It does not show placeholders.

## The gaps

| Data | Who holds it | Where it stops | What the map does now | What would fill it | Status |
|---|---|---|---|---|---|
| City Council and County Board votes | City Clerk; County Clerk | Votes are recorded inside PDF minutes, one meeting at a time. There is no table of item, member and vote. | The map shows meeting dates, agendas and planning cases, not how anyone voted. | A table with one row per member per vote, published with each meeting's minutes. | Confirmed |
| Traffic crashes | Lincoln Police Department | Published through 2026, but with no map coordinates. Each crash is a line of text such as "S 40 at A". | STARCITY matches the street text to the map's street network and reports the share it could place. | Latitude and longitude columns, which the records system already holds. | Confirmed |
| Police incident reports | Lincoln Police Department | Published through 2026 with a block address and no coordinates. | Not on the map yet. When added, shown as counts by type and area, never as single reports at an address. | Block-level coordinates published with each record. | Confirmed |
| Fire and ambulance incidents | Lincoln Fire and Rescue | The public tables stop at 2019. | Not shown. A seven-year-old table would mislead. | The yearly tables for 2020 onward, with response times. | Confirmed |
| Ground elevation and building heights (LIDAR) | USGS 3D Elevation Program, flown with state and local partners | The newest public survey of Lincoln was flown in 2016. | Buildings put up since 2016 keep an estimated height, labeled as an estimate. | A new survey. USGS shares the cost with local partners. | Confirmed |
| Creek and lake water quality | Nebraska Department of Water, Energy and Environment | The newest Integrated Report is the 2022 edition, published June 2023. | Each creek card names that report and its date. | The next Integrated Report, and the sample results behind it as data. | Confirmed |
| What each TIF project paid for | City Urban Development Department | The county publishes each project's base and excess value. What the money bought is in separate redevelopment agreements, as PDFs. | The TIF paper totals value and tax and says it cannot show spending. | One table: project, year, amount, purpose. | Confirmed |
| Update dates and licenses on city map layers | City and County GIS | Most layers do not say when they were last updated, and the open data catalog lists no license. | Every figure carries the date STARCITY retrieved it. | A last-updated date and a license statement on every layer. | Confirmed |
| One clear city-limits boundary | City and County GIS | The city limits layer holds 70 shapes all named Lincoln, including the three-mile zoning jurisdiction. | STARCITY picks the corporate limit by area and says so in each paper. | A single labeled corporate-limit layer. | Confirmed |
| Construction year for non-residential buildings | County Assessor | Year built is published for homes. About 51,000 of the 132,822 buildings on the map have no year. | The growing-city view shows those buildings in grey for every year. | Year built for commercial, public and exempt buildings. | Confirmed |
| Taxable value and exemption status by parcel | County Assessor | The parcel layer publishes assessed value and leaves taxable value blank. | The property value paper totals assessed value and compares it with the state's taxable total. | The taxable value and exemption code on each parcel. | Confirmed |
| Residential building permits | City Building and Safety | The open data layer for residential permits did not answer when queried on November 21, 2026. | The map reads this year's permits from a different city layer. | A working, dated permits layer. | Confirmed |
| The city budget and spending as data | City Finance Department | The adopted budget is a long PDF. | Not on the map. | A table by department, fund and line, and a list of payments to vendors. | To confirm |
| Stormwater complaints and basement flooding reports | City Watershed Management | Not found in the public catalog. | The flood paper relies on federal insurance claims, which exist only where someone held a policy. | Complaint counts by block and year. | To confirm |
| Lead service line inventory | Lincoln Water System | A lead target area layer is public. A line-by-line inventory was not found. | Not on the map. | The service line inventory by block. | To confirm |
| Drinking water test results by sampling site | Lincoln Water System | Annual summary reports are public. Site-level results as data were not found. | Not on the map. | Results by site and date. | To confirm |
| Street condition ratings | City Transportation and Utilities | Not found in the public catalog. | Not on the map. | The pavement rating for each street segment, with the year rated. | To confirm |
| Rental registrations and housing code cases | City Building and Safety | Not found in the public catalog. | Not on the map. | Counts by block and year, without tenant or owner names. | To confirm |

## How to ask for it

- Ask the agency named in the table. Most of these are a records question, not a budget question.
- Bring the specific row. "Publish crash coordinates" is easier to say yes to than "more open data".
- Lincoln's City Council adopted an open data resolution on August 8, 2016, committing the city to publish machine-readable data in a central place. Each row here is a way to meet it.
- If an agency publishes one of these, report it on the project's issues page and the map will use it.

Report a filled gap or a missing row at the project's [issues page](https://github.com/RobotWhiteBread/STARCITY/issues). See also [how the papers are checked](https://starcitylincoln.org/verification.html) and the [process](PROCESS.md) behind the map.
