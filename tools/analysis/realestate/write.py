# SUPERSEDED. Kept for the record only. The current generator is tools/analysis/citywide/papers.py,
# which counts stacked condominium land once. Figures written in this file are the earlier, uncorrected ones.
import pickle,collections,statistics as st,datetime,warnings
warnings.filterwarnings('ignore')
R=pickle.load(open('city2.pkl','rb'));P,S,T=pickle.load(open('all.pkl','rb'))
D=collections.defaultdict;OUT='/home/claude/starcity/tools/'
byid={r['id']:r for r in R}
FOOT="""
---

**The STARCITY papers.** [Floodplain exposure and flood loss](floodplain.html) · [Who Lincoln over-assesses](assessment.html) · [Where Lincoln's property value lives](taxbase.html) · [What sold in Lincoln](sales.html) · [Lincoln's TIF districts by the numbers](tif.html) · [The map](index.html)
"""
# ---------- TAX BASE
hrows=[]
for n in sorted(set(r['hood'] for r in R if r['hood'])):
    q=[r for r in R if r['hood']==n];ri=[r['v'] for r in q if r['cls']=='Residential Improved' and not r['hr']]
    if len(ri)>=20: hrows.append((n,len(ri),st.median(ri),sum(r['v'] for r in q),sum(r['v'] for r in q)/sum(r['ac'] for r in q)))
hrows.sort(key=lambda x:-x[2])
ht="| Neighborhood association | Homes | Median home value | All assessed value | Value per acre |\n|---|---|---|---|---|\n"+"\n".join(f"| {n} | {h:,} | ${m:,.0f} | ${t/1e6:,.0f} million | ${v/1e6:.2f} million |" for n,h,m,t,v in hrows)
tb=f"""# Where Lincoln's Property Value Lives

## Summary

Lincoln's 2026 assessment roll puts **$36.7 billion** of value on **84,726 parcels** inside the city limits. This paper asks a plain question of that roll: where is the value, and how much land does it take to hold it?

1. **Houses carry the roll.** Improved residential parcels are 85% of the parcels and **63.5% of the value**, $23.3 billion. Improved commercial property is 7% of the parcels and 34.2% of the value.
2. **Value is concentrated.** The 100 most valuable parcels hold 10.3% of all assessed value. The top 1% of parcels (847) hold 24.2%. Half the city's value sits on 15.4% of its parcels.
3. **A tenth of the land holds two fifths of the value.** Rank every acre by the value on it, and the top 10% of parcel land holds 40.3% of the city's assessed value. The bottom half holds 4.8%.
4. **Downtown is in a class of its own.** The assessor's downtown commercial district is assessed at **$6.9 million an acre**. The large commercial districts on the east and south sides run $0.77 to $0.95 million an acre.
5. **Small lots out-produce large ones.** The fifth of houses on the smallest lots are assessed at $3.8 million an acre. The fifth on the largest lots are assessed at $1.2 million an acre.

Every figure comes from the Lancaster County Assessor's published parcel layer, measured inside Lincoln's corporate limit.

## The roll by class

| Class | Parcels | Assessed value | Share of value | Parcel acres | Share of land | Value per acre |
|---|---|---|---|---|---|---|
| Residential, improved | 72,280 | $23.31 billion | 63.5% | 17,209 | 42.5% | $1.35 million |
| Commercial, improved | 6,022 | $12.54 billion | 34.2% | 9,931 | 24.5% | $1.26 million |
| Commercial, unimproved | 2,065 | $0.62 billion | 1.7% | 8,651 | 21.4% | $71,000 |
| Residential, unimproved | 4,129 | $0.22 billion | 0.6% | 3,552 | 8.8% | $62,000 |
| Agricultural | 49 | $0.01 billion | 0.03% | 910 | 2.2% | $11,000 |
| Unclassified | 180 | none | none | 252 | 0.6% | none |

Two things stand out. Improved residential and improved commercial land are assessed at nearly the same value per acre across the city as a whole, $1.35 million against $1.26 million. And **30% of the parcel land inside the city limits is unimproved**, 12,203 acres, carrying 2.3% of the value. Some of that is floodplain, some is held for development, and some is parking and yards attached to a business next door.

The median improved residential parcel is assessed at **$278,500**. The median improved commercial parcel is assessed at $639,300.

## How concentrated the value is

| Group of parcels | Assessed value | Share of the city |
|---|---|---|
| Top 10 | $1.29 billion | 3.5% |
| Top 100 | $3.76 billion | 10.3% |
| Top 1% (847) | $8.87 billion | 24.2% |
| Top 5% (4,236) | $13.22 billion | 36.0% |
| Top 10% (8,472) | $16.00 billion | 43.6% |

All ten of the most valuable parcels are improved commercial property. Six sit in the east, northeast and southeast commercial districts on sites of 10 to 44 acres. Three are downtown on sites of about two acres or less, and the tenth is in the central commercial district.

## Value per acre

Total value tells you who is big. Value per acre tells you which land is working hardest, and it is the number that matters to a city budget, because streets, pipes and fire coverage are paid for by the acre and the mile.

| Share of parcel land, ranked by value per acre | Share of assessed value held | Value per acre at the cutoff |
|---|---|---|
| Top 1% | 11.7% | $6.4 million |
| Top 5% | 27.4% | $2.8 million |
| Top 10% | 40.3% | $2.2 million |
| Top 25% | 68.0% | $1.4 million |
| Top 50% | 95.2% | $0.5 million |

Laid on an 800 metre grid, the most valuable cell in the city is the heart of downtown: **$659 million on 118 parcel acres, $5.6 million an acre**. The median cell is assessed at $1.07 million an acre. The ten most valuable cells hold 10.0% of the city's value on 2.9% of its parcel land.

### Commercial districts

The assessor groups commercial property into districts. Ranked by value per acre:

| Assessor's commercial district | Parcels | Assessed value | Acres | Value per acre |
|---|---|---|---|---|
| Downtown (DTCOM) | 451 | $1,227 million | 177 | $6.93 million |
| HHCOM | 51 | $61 million | 12 | $4.91 million |
| Haymarket (HYCOM) | 132 | $444 million | 100 | $4.46 million |
| DPCOM | 230 | $390 million | 368 | $1.06 million |
| East central (ECCOM) | 1,100 | $2,972 million | 3,133 | $0.95 million |
| South central (SCCOM) | 1,044 | $2,269 million | 2,707 | $0.84 million |
| Northeast (NECOM) | 396 | $593 million | 767 | $0.77 million |
| Southeast (SECOM) | 1,054 | $1,833 million | 2,391 | $0.77 million |
| Central (CNCOM) | 2,110 | $1,706 million | 2,483 | $0.69 million |
| North central (NCCOM) | 698 | $612 million | 1,417 | $0.43 million |
| West central (WCCOM) | 426 | $486 million | 1,515 | $0.32 million |
| Southwest (SWCOM) | 142 | $193 million | 664 | $0.29 million |
| Northwest (NWCOM) | 156 | $326 million | 1,181 | $0.28 million |

Downtown and the Haymarket together hold $1.67 billion on 277 acres. The east central district holds more in total, $2.97 billion, and needs 3,133 acres to do it. The district names in plain words are read from the assessor's codes. Two codes are left as published because the layer does not spell them out.

### Houses by lot size

Sorting the city's improved residential parcels by lot size and cutting them into five equal groups:

| Lot size group | Lot size | Median value | Total value | Acres used | Value per acre |
|---|---|---|---|---|---|
| Smallest fifth | under 0.13 acre | $243,900 | $3.67 billion | 974 | $3.77 million |
| Second | 0.13 to 0.16 | $240,550 | $3.72 billion | 2,100 | $1.77 million |
| Middle | 0.16 to 0.19 | $253,700 | $4.00 billion | 2,460 | $1.63 million |
| Fourth | 0.19 to 0.23 | $319,400 | $4.93 billion | 2,976 | $1.66 million |
| Largest fifth | over 0.23 acre | $405,800 | $6.70 billion | 5,788 | $1.16 million |

The houses on the largest lots are worth the most each, and their land is worth the least per acre. The largest-lot fifth uses six times the land of the smallest-lot fifth to hold less than twice the value. The smallest group includes townhomes and attached units on very small parcels, which is part of why its figure is so high. The pattern holds without them: every group below a quarter acre is assessed at $1.6 million an acre or more.

## By neighborhood

Lincoln's 58 neighborhood associations cover about half the city's land, mostly the older core and the established subdivisions, and 61% of its parcels. The table lists every association with at least 20 single-family homes, ranked by median home value. Value per acre counts every parcel inside the association boundary, commercial included.

{ht}

Three associations are almost entirely commercial and are left out of the table: the Haymarket ($7.9 million an acre), the Salt Creek Area ($4.5 million) and Downtown ($3.8 million).

The older core neighborhoods have modest home values and high value per acre. Everett, Near South, Malone and Irvingdale all sit above $1.7 million an acre with median homes between $175,000 and $221,000. Tight lots and mixed uses do that.

## What a median home pays

The county's own TIF layer records a consolidated levy of **$1.766448 per $100** of value for the Lincoln tax district in tax year 2024. Applied to the 2026 median improved residential value of $278,500, that is about **$4,920 a year** before the homestead exemption and state property tax credits. The 2026 levy will differ. This is a yardstick, not a bill.

## What these numbers are not

- **Not the taxable base.** The layer publishes assessed value and leaves taxable value blank. Some high-value parcels are exempt from tax, such as hospitals, churches and public property that carries an assessment. This paper measures where value sits, not who pays.
- **Not the whole city by area.** Parcels inside the corporate limit total 40,505 acres. The city covers 68,295. The rest is streets, parks, water and public land that is not on the roll as parcels.
- **Not a statement about any owner.** No owner names were used or stored. Parcels are described by class, district and size only.
- **Not a judgment about how anyone should live.** Value per acre measures what land contributes to the roll. It says nothing about whether a large yard is worth having.
- **642 parcels carry no assessed value.** They cover 2,311 acres and are counted in land totals.

## What to do with it

**If you are a realtor or appraiser.** The neighborhood table is a quick reference for where a listing sits against its association's median, and the commercial table gives a value per acre benchmark for each district.

**If you are on the council or the planning commission.** Value per acre is the missing column in most annexation and rezoning discussions. Land in the city's new edges that comes onto the roll at $1.2 million an acre has to support the same lane-miles and pipe as older land that carries $1.7 million or more.

**If you are a resident.** Your neighborhood's line in the table shows what the ground under it contributes. The older neighborhoods of the core are carrying more per acre than their home prices suggest.

## Method

Parcels are the Lancaster County Assessor's published layer with 2026 assessed values (field CNTASSDVAL), 86,989 distinct parcels countywide. A parcel is counted as in Lincoln when a point inside it falls within the corporate limit (106.7 square miles; the larger extraterritorial jurisdiction polygon in the same layer is excluded). Areas are computed in an equal-area projection (EPSG:5070), not from the published area field. Neighborhood associations are the city's published boundaries. The scripts are in the project repository under tools/analysis.
{FOOT}"""
open(OUT+'taxbase.md','w').write(tb)
# ---------- SALES
res=[s for s in S if s['PropType']=='Res' and s['SalePrice']]
hs=D(list)
for s in res:
    r=byid.get(s['PID'])
    if r and r['hood']:hs[r['hood']].append(s)
med=lambda v,k:st.median([s[k] for s in v if s[k]])
srows=sorted([(k,len(v),med(v,'SalePrice'),med(v,'SalePriceSF'),med(v,'ResYrBlt')) for k,v in hs.items() if len(v)>=20],key=lambda x:-x[2])
stt="| Neighborhood association | Sales | Median price | Median per sq ft | Median year built |\n|---|---|---|---|---|\n"+"\n".join(f"| {k} | {n} | ${m:,.0f} | ${f:.0f} | {y:.0f} |" for k,n,m,f,y in srows)
sl=f"""# What Sold in Lincoln

## Home sales, November 2025 to November 2026

## Summary

The county's sales file holds **2,858 valid residential sales** in and around Lincoln for the twelve months ending in early November 2026, worth **$1.07 billion** in total. Read as a whole they describe the market a buyer or seller walked into this year.

1. **The median home sold for $325,000**, at a median of **$249 per square foot**. The middle half of sales fell between $250,000 and $445,000.
2. **The entry level is thin.** Fewer than one sale in ten (9.3%) closed under $200,000. Almost one in five (18.0%) closed at $500,000 or more.
3. **New construction is a large share of the market.** 302 sales, more than one in ten, were homes built in 2025 or 2026, at a median of $496,490.
4. **Price per square foot is flat across size until the largest homes.** Every size group under about 1,840 square feet sold for $250 to $259 a square foot. The largest fifth sold for $219.
5. **Homes sold for more than their assessment.** 82% of sales closed above the assessed value, by a median of $25,600.

## Price bands

| Sale price | Sales | Share |
|---|---|---|
| Under $150,000 | 76 | 2.7% |
| $150,000 to $199,999 | 191 | 6.7% |
| $200,000 to $249,999 | 424 | 14.8% |
| $250,000 to $299,999 | 515 | 18.0% |
| $300,000 to $399,999 | 718 | 25.1% |
| $400,000 to $499,999 | 421 | 14.7% |
| $500,000 to $749,999 | 393 | 13.8% |
| $750,000 and over | 120 | 4.2% |

One sale in ten closed at or below $200,000 and one in ten at or above $600,000.

## Through the year

| Month | Sales | Median price | Median per sq ft |
|---|---|---|---|
| December 2025 | 199 | $306,000 | $238 |
| January 2026 | 187 | $310,000 | $225 |
| February | 203 | $330,000 | $253 |
| March | 270 | $300,000 | $240 |
| April | 285 | $330,000 | $253 |
| May | 337 | $320,879 | $253 |
| June | 356 | $335,000 | $257 |
| July | 308 | $340,000 | $255 |
| August | 263 | $335,000 | $259 |
| September | 243 | $325,000 | $251 |

Volume follows the usual curve, nearly doubling from January to a June peak. Price per square foot rose from the winter into spring and then held between $251 and $259 from April through September. November 2025 (100 sales) and October and November 2026 (107 sales) are left out of the table because the file holds only part of each month. Recent sales take weeks to be reviewed and posted.

## By type of home

| Type | Sales | Median price | Median per sq ft | Median size (sq ft) | Median year built |
|---|---|---|---|---|---|
| One story | 1,202 | $325,000 | $278 | 1,289 | 1977 |
| One story townhome, end unit | 273 | $370,000 | $275 | 1,344 | 2019 |
| Two story | 271 | $440,000 | $205 | 2,076 | 1992 |
| One and a half story | 213 | $285,000 | $193 | 1,652 | 1945 |
| Split foyer | 143 | $310,000 | $259 | 1,196 | 1979 |
| Bungalow | 137 | $200,000 | $216 | 928 | 1920 |
| Multi level | 103 | $350,000 | $252 | 1,436 | 1976 |
| Two story townhome, end unit | 100 | $299,925 | $166 | 1,739 | 2014 |
| High rise condominium | 75 | $180,000 | $174 | 946 | 1986 |

Square footage here is the assessor's above-grade floor area. A one story house with a finished basement shows a high price per square foot because the basement is in the price and not in the area. That is why ranches lead this column and two story homes trail it.

The one story townhome is the notable entry. 273 end units sold at a median of $370,000, with a median build year of 2019. It is the second most common thing sold in Lincoln.

## By age

| Built | Sales | Median price | Median per sq ft | Median size (sq ft) |
|---|---|---|---|---|
| 1900s | 91 | $200,000 | $158 | 1,272 |
| 1910s | 112 | $222,500 | $170 | 1,351 |
| 1920s | 165 | $226,000 | $200 | 1,192 |
| 1930s | 44 | $310,000 | $210 | 1,467 |
| 1940s | 76 | $248,750 | $234 | 999 |
| 1950s | 324 | $245,000 | $237 | 1,015 |
| 1960s | 253 | $280,000 | $247 | 1,107 |
| 1970s | 326 | $300,000 | $247 | 1,207 |
| 1980s | 216 | $330,000 | $235 | 1,305 |
| 1990s | 221 | $401,104 | $242 | 1,587 |
| 2000s | 270 | $402,750 | $263 | 1,652 |
| 2010s | 224 | $468,250 | $290 | 1,687 |
| 2020s | 508 | $492,221 | $317 | 1,633 |

Homes built since 2020 are the largest single group, 508 sales, and the most expensive by either measure. The affordable end of the market is the housing built before 1960: 812 sales with decade medians from $200,000 to $310,000. The 1950s alone supplied 324 sales at a median of $245,000, in houses with a median of 1,015 square feet above grade.

## By size

| Size group (above-grade sq ft) | Median price | Median per sq ft |
|---|---|---|
| Up to 1,025 | $225,000 | $256 |
| 1,025 to 1,253 | $280,000 | $250 |
| 1,253 to 1,533 | $350,000 | $257 |
| 1,533 to 1,838 | $427,750 | $259 |
| Over 1,838 | $499,900 | $219 |

## By neighborhood

Neighborhood associations with at least 20 sales in the period. About 46% of sales fell outside any association boundary, mostly in the newer subdivisions at the city's edges, which have none.

{stt}

Near South stands out at $146 a square foot, the lowest in the table by a wide margin, on a housing stock with a median build year of 1911. Its houses are large and old, and they sell for less per square foot than anything else in the city. Downtown sales are condominiums and lead the table per square foot.

## Turnover

2,833 of the sales match a parcel inside the city limits, against 72,280 improved residential parcels. That is **3.9% of the housing stock changing hands** in valid sales over the period. The file counts only sales the county validated as arm's length, so the true count of deeds recorded is higher.

## What these numbers are not

- **Not a forecast.** This describes twelve months of closed sales.
- **Not every sale.** Every record carries the county's validity code 01. Family transfers, foreclosures and other sales the county set aside are not in the file.
- **Not the listing market.** Days on market, list prices and price cuts are not public record and are not here.
- **Not a full last quarter.** Sales from October and November 2026 are still being posted.
- **Not about any one house.** No addresses or owner names were used. Sales are grouped by type, age, size and neighborhood only.

## What to do with it

**If you are buying.** The age and type tables show where the price points are. Under $250,000 the market is mostly houses built before 1960, bungalows and condominiums.

**If you are selling or listing.** Price per square foot by neighborhood and by type gives a first check on a list price. Remember that it is above-grade area.

**If you are on the council.** New construction is selling at a median near $496,000, and fewer than one sale in ten closes under $200,000. The supply of homes at entry prices is the existing older stock, which is a reason to care what happens to it.

## Method

Sales are the Lancaster County Assessor's published sales layer, 2,933 records dated November 17, 2025 through November 5, 2026, of which 2,858 are residential. Price per square foot, floor area, structure type and year built are the county's fields. Neighborhood was assigned by matching each sale's parcel number to the 2026 parcel layer and locating that parcel inside the city's neighborhood association boundaries. The assessment comparison uses the assessed value carried on each sale record. A fuller treatment of assessed value against sale price is in the companion paper on assessment equity.
{FOOT}"""
open(OUT+'sales.md','w').write(sl)
# ---------- TIF
ok=[t for t in T if t['status']=='Active'];r=0.01766448
top=sorted(ok,key=lambda t:-t['all_ev'])[:15]
import re
def nm(t):
    n=re.sub(r'\s+\d{4}$','',t['tifname'].strip());n=re.sub(r'^TIF\s*','',n).title()
    return n
tt="| Project | Type | Year on record | Base value | Excess value | Tax on the excess |\n|---|---|---|---|---|---|\n"+"\n".join(f"| {nm(t)} | {t['type']} | {t['year']} | ${t['all_bv']/1e6:,.1f} million | ${t['all_ev']/1e6:,.1f} million | ${t['all_ev']*r:,.0f} |" for t in top)
y=D(lambda:[0,0])
for t in ok:y[t['year']][0]+=1;y[t['year']][1]+=t['all_ev']
yt="| Year on record | Projects | Excess value |\n|---|---|---|\n"+"\n".join(f"| {k} | {y[k][0]} | ${y[k][1]/1e6:,.1f} million |" for k in sorted(y))
tf=f"""# Lincoln's TIF Districts by the Numbers

## Summary

Tax increment financing lets a redevelopment project keep the property tax on the value it adds, usually for 15 years, to pay for public costs tied to the project. The tax on the value that was there before, the base, keeps going to the schools, the city, the county and the other taxing bodies. The tax on the new value, the excess, goes to the project's debt.

The county publishes a table of every TIF project in Lancaster County. This paper adds it up.

1. **89 projects are marked active**, all in the Lincoln tax district.
2. **They hold $1.29 billion of excess value** on top of a $629 million base. The value inside active TIF projects has roughly tripled from where it started.
3. **About $22.9 million a year in property tax** is generated by that excess value at the 2024 levy and directed to project costs instead of the general tax rolls.
4. **Five district-wide projects hold 85% of the base value.** The other 84 are single projects that started from very little: together their excess value is more than ten times their base.
5. **It is concentrated.** The ten largest projects hold 48% of all excess value. Fourteen projects have less than $1 million of excess value each.

## The totals

| | Projects | Base value | Excess value | Tax on the excess at the 2024 levy |
|---|---|---|---|---|
| Area projects | 5 | $534.9 million | $325.1 million | $5.7 million |
| Single projects | 84 | $93.7 million | $969.9 million | $17.1 million |
| **All active** | **89** | **$628.6 million** | **$1,295.0 million** | **$22.9 million** |

For scale, $1.29 billion is about 3.5% of the $36.7 billion on Lincoln's 2026 assessment roll. The two figures are two years apart, so read that as a rough proportion.

The levy used is **$1.766448 per $100**, the rate the table itself records for every active project for tax year 2024.

## Two kinds of TIF

**Area projects** draw a boundary around a district with many existing properties. They start with a large base and collect the growth across the whole district. The five on the list are Greater Downtown, South of Downtown, West O, Airport Entryway and Historic Hawley. Together they started from $535 million and have added $325 million, a gain of 61%.

**Single projects** are one development, often on a site that was assessed at very little before. Their base is small and nearly everything built is excess. The 84 on the list started from $94 million in total and have added $970 million.

That difference matters when people argue about TIF. In a single project, almost all the tax the new building generates goes to the project for the life of the TIF. In an area project, the existing tax base keeps paying the schools and the city, and only the growth is set aside.

## The largest projects

{tt}

Names are as the county table gives them, lightly tidied. Tax on the excess is the excess value times the 2024 levy.

Four active projects record a base of zero, which usually means the site was tax exempt before redevelopment. Thirteen record less excess value than base.

## By year

The table carries a fiscal year for each project. It appears to mark when the project's TIF began, though the table does not say so.

{yt}

If those years are start dates and the standard 15-year term applies, the projects dated FY 09/10 through FY 12/13 reach the end of their term between now and 2028. They hold about $170 million of excess value. When a TIF ends, its excess value returns to the general rolls and its tax goes to the schools, city and county like any other property.

## Does the county's table match the parcel roll?

Yes, closely. Each TIF project has its own tax district code, and the 2026 parcel layer carries that code on every parcel. For the 84 active projects whose code appears on parcels inside the city, the 2026 assessed value of those parcels totals $2.03 billion. The table's base plus excess for the same projects is $1.85 billion for 2024. The typical project's parcels are assessed about 5% above its 2024 base plus excess, which is what two years of rising values would produce. That agreement is why this paper reads the table's two value columns as base and excess.

In all, 107 TIF-coded tax districts appear on parcels inside the city, covering 3,904 parcels and $2.72 billion of 2026 assessed value, 7.4% of the roll. That figure includes base value and projects not marked active.

## What these numbers are not

- **Not the cost of TIF.** Whether a project would have been built without TIF, and what it would have paid in tax if so, cannot be read from a table of values. Supporters say much of the excess would not exist without it. Critics say much of it would. This paper measures the size of the set-aside, not what caused it.
- **Not current-year tax.** Values and the levy are tax year 2024, the latest in the county's table.
- **Not all 119 rows.** Thirty rows carry no status. They hold $115 million of excess value, some at levies that belong to other towns in the county, and are left out of the totals.
- **Not what each project owes or has repaid.** Bond amounts, redevelopment agreements and payoff dates are in city records, not in this table.
- **Not project names checked against agreements.** They are the county's labels.

## What to do with it

**If you are on the council.** The single number worth knowing is $22.9 million a year. That is the stream of property tax currently committed to TIF project costs. The second is the schedule on which it comes back, which the city's own records can state exactly and this table can only suggest.

**If you are a school board member or county commissioner.** Your levy applies to the base, not the excess, for the life of each project. The by-year table is a first sketch of when that changes.

**If you are a developer or realtor.** The list shows where the city has used the tool and at what scale. The median active project carries $6.8 million of excess value.

**If you are a resident.** TIF does not raise your tax rate directly. It decides where the tax from one new building goes for 15 years.

## Method

The source is the county's published TIF table (119 rows). Rows marked Active (89) are summed. Excess value times the recorded levy gives the tax on the excess. The cross-check sums 2026 assessed value by tax district code from the Lancaster County Assessor's parcel layer for parcels inside Lincoln's corporate limit. The 15-year term is the standard under Nebraska's Community Development Law. Some projects qualify for a longer term.
{FOOT}"""
open(OUT+'tif.md','w').write(tf)
print(tt);print(yt)
import subprocess
print(subprocess.run("grep -c '—' "+OUT+"taxbase.md "+OUT+"sales.md "+OUT+"tif.md",shell=True,capture_output=True,text=True).stdout)
