# Sales history, 2013 to 2018
`build.py` packs the county assessor's yearly sales files (Lincoln open data) by parcel number: sale month,
price and an improved or vacant flag. The files hold no buyer or seller names. Repeats across yearly files are
removed by matching parcel, day and price. Outputs `data/sales-2013-2018.json` and a yearly median table.
