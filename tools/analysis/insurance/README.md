# Home insurance by ZIP code

What homeowners in each Lincoln-area ZIP code paid for insurance from 2018 to 2022, how often claims were
paid, what they cost, and how many policies insurers chose not to renew.

- **Source.** U.S. Treasury, Federal Insurance Office, "Analyses of U.S. Homeowners Insurance Markets,
  2018-2022" (January 2025), with ZIP-level data gathered by state regulators through the National
  Association of Insurance Commissioners from more than 330 insurers.
- **How it got here.** Read from a public copy of the Treasury data packaged for mapping
  (github.com/kwstancil/FIO-home-insurance-map). It has **not yet been compared line by line with the
  Treasury's own spreadsheet**, which could not be downloaded when this was built.
- **Outlines.** Census Bureau 2010 ZIP Code Tabulation Areas, clipped to the map.
- **What each figure is.** An average over every policy in the ZIP code for that year: premium per policy,
  paid claims per 100 policies, average paid claim, claims paid per premium dollar, and the share of
  policies the insurer did not renew.
- **What it is not.** A quote for any house. Later than 2022. Complete: the Treasury leaves out ZIP codes
  with fewer than 50 policies or fewer than 10 insurers (68514, 68531 and two rural ZIPs here).

`build.py` writes `data/insurance-zips.json` for the map and `data_public/home_insurance_by_zip_2018_2022.csv`
with every figure. 39 ZIP areas, 35 with data.
