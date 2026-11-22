# Tree canopy and carbon from LiDAR (test stage)

Status on November 22, 2026: method built and tried on 22 of 316 tiles. Nothing from this is on the map or in a paper yet.

Source: USGS 3D Elevation Program, Eastern Nebraska Urban Area LiDAR, 2016. Tiles are 5,000 feet square in Nebraska State Plane feet.

1. `canopy.py` runs on the computer that holds the tiles. For each tile it writes a grid of 15 foot cells: height above ground, and the share of returns that came from pulses hitting more than one surface. About 5 seconds a tile.
2. `sample.py` calls a cell tree canopy when it is at least 8 feet tall, at least 15% of its returns are from multi-return pulses, and it is outside a mapped building footprint. It then applies the U.S. Forest Service's carbon rates for Lincoln (Nowak and others, 2013): 10.64 kg of carbon stored and 0.409 kg taken up each year per square meter of tree cover.

First test, 22 tiles on the west edge of the county (51 square kilometers, mostly rural, including Pioneers Park): 15.4% canopy, about 83,700 metric tons of carbon stored and 3,200 taken up per year. This is a test of the method on whatever tiles had arrived. It is not a figure for Lincoln.

Known problems to settle before any number is published:
- Without the building mask, about a third of tall roof cells pass the tree test, so the mask does real work. The test used OpenStreetMap footprints, which are incomplete. The full run should use the city's footprint layer.
- The flight date and whether leaves were out have not been checked. A leaf-off flight sees fewer returns in deciduous crowns and would undercount.
- The data is from 2016, before most ash removals.
- The carbon rates are averages from field plots measured in 2008 and 2009. LiDAR measures crowns, not trunks, roots or soil.
- Outside checks still to do: the Forest Service's 14.4% tree cover for Lincoln, and the city's tree inventory.
