# Addendum

## What this is

Every change made to *Lincoln Floodplain Exposure and Flood Loss* since the copy you have. One correction affects how the work is reproduced and should be read first. No finding has been withdrawn.

## The correction that matters: the query envelope was stated wrong

The Method section named the wrong bounding box.

It said the flood polygons were pulled with an envelope of roughly -96.73 to -96.55 longitude and 40.70 to 40.84 latitude. The analysis actually ran against -96.745 to -96.535 longitude and 40.69 to 40.85 latitude.

Those two boxes return different amounts of floodplain. The box as stated returns **525** polygons from the 1% layer and **1,653** from the 0.2% layer. The box actually used returns **725** and **2,430**, and those are the counts every figure in the report rests on. Anyone reproducing the work from the stated method would have got smaller numbers and reasonably concluded the report was wrong.

The cause: this project pulls data two ways, a PowerShell download for the files kept on disk and a browser query for the analysis, and the two use different boxes. The Method section described the first while the analysis used the second.

**What it changes in the findings: nothing.** Every acreage, parcel count and dollar figure came from the correct pull. Only the description of how it was done was wrong. The section now also states the two counts that box returns, so the provenance can be checked in a single query against the service.

## Corrected figures

### The levee asset counts were a subset

Was 111 top-of-bank segments, 163 right-of-way lines and 47 drainage structures. It is 123 top-of-bank segments covering 33.9 miles, 226 right-of-way lines and 67 drainage structures. The earlier counts came from a bounding-box-limited pull; the service holds the whole system.

### The 1950 flood figures could not be sourced

Was 11 inches in 6 hours, roughly 20,000 acres flooded and 9 deaths. Those specifics could not be traced to a source and were removed rather than left standing.

It now uses the National Weather Service account: four major floods across south central and southeast Nebraska between May and July 1950, together taking 25 lives and causing $65 million in damage, roughly $1 billion in 2013 dollars. Also noted, since you would ask: **no digitized 1950 inundation footprint appears in the city or county GIS**, so a Lincoln-specific extent would have to be rebuilt from the USGS flood report.

### One claim was too strong

Was "pluvial and stormwater exposure is unmapped." It is now "no model of where rainfall pools." See the new section below.

### The paging defect was described imprecisely

It was framed as a record count disagreeing with a paged total. The real defect is that the service returns at most 2,000 records per reply and gives no sign that more exist, so a single query against an area holding 2,430 returns 2,000 and looks like it worked.

## New material

### What Lincoln already maps that FEMA does not

Lincoln regulates a minimum flood corridor under Municipal Code 27.53.020: a buffer centered on the channel, 90 feet wide where 40 to 100 acres of land drain into the stream, widening as the drainage area grows. It covers **832 corridors and about 3,372 acres across 13 watersheds**, on creeks far below the size FEMA studies.

Run against the 1% floodplain, **366 of those corridors, about 1,221 acres, fall entirely outside it.** A corridor that merely clips the floodplain counts as inside, so 1,221 acres is a floor rather than an estimate. Stevens Creek alone carries 349 corridors and 1,095 acres.

This is the most consequential addition, and it is what forced the correction above. The rainfall gap is narrower than first stated. It is not that nothing is mapped beyond the FEMA floodplain; it is that what is mapped is a fixed-width buffer on small streams rather than a model of where water goes.

### Condition ratings for the levee drainage structures

All 67 carry a station, length, barrel size, material, gate type, status and an inspection score in the city's own layer.

62 are listed active and 5 inactive. 34 are corrugated metal pipe, 18 reinforced concrete and 15 box culverts, and 34 carry a flap gate. On condition, 45 carry an MA grade at high, medium or low, 7 are rated **Unacceptable**, and 15 are unrated. **None of the 67 is rated Acceptable.** Inspection scores run from 0 to 79 with a median of 29.

### The levee critical area, with dimensions

1,451 acres, reaching 500 feet landside and 300 feet streamside.

### Corroboration for the 2015 event

The National Weather Service office in Omaha records that the 7 May 2015 flooding was largely contained within the levee system inside Lincoln, with parks and low-lying areas taking the water. That is the levee working in a storm well short of the 1% event.

## What did not change

The five summary findings stand as written: 165 of 275 claims coded as rainfall or snowmelt accumulation against 47 coded as stream overflow; 81 claims (29.5%) rated outside the SFHA against 109 of 929 policies (11.7%); the 0.2% band holding assessed value comparable to the SFHA on about a twelfth of the land; 2015 carrying 87% of all dollars ever paid; and 7 multiple-loss properties with none mitigated.

The exposure brackets are unchanged, $249.6 million to $1,116.5 million for the 1% floodplain and $308 million to $1.92 billion for both bands combined.

The limits are unchanged and worth restating. This is an exposure inventory, not a risk assessment. There are no first-floor elevations and no depth grid, so nothing here says which structures take water. 42.7% of the SFHA acreage is Zone A with no base flood elevation determined. And the levee mapping treatment is still unconfirmed against the Flood Insurance Study hydraulics narrative, which remains the single question that most changes how the rest should be read.

## Sources added

The National Weather Service pages for significant Nebraska floods and for the 7 May 2015 event, both linked in the report's Sources section.
