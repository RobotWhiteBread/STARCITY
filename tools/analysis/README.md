# Floodplain analysis, reproducible

`flood_final.py` and `flood_derived.py` recompute every spatial figure in the
floodplain report. They expect these files, pulled from gis.lincoln.ne.gov:

    gis/fema/pct1.json       FEMAFlood layer 1, all 1,593 polygons, geojson, outSR 4326
    gis/fema/pct02_[abc].json FEMAFlood layer 0, 3 pages of 2,000, geojson, outSR 4326
    gis/fema/citylimits.json Planning/LincolnLimits layer 3, esri json, outSR 4326

and a parcel set with geometry and CNTASSDVAL under gis/parcels2/.

Two things these scripts get right that a naive pull does not:

1. The city limits layer returns 70 nested features all labelled Lincoln. The
   largest (289.8 sq mi) is the extraterritorial jurisdiction. The corporate
   limit is the next largest (106.7 sq mi). The scripts sort by area and take
   index 1.
2. These services publish in Web Mercator, which inflates area by about 75% at
   40.8 degrees north. Everything is reprojected to EPSG:5070 before any area
   is taken, and no service Shape_Area value is used.
