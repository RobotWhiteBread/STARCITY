# The University of Chicago's assessment method, run on Lincoln's sales

The Center for Municipal Finance at the University of Chicago publishes `cmfproperty`, an open R package
for grading how evenly a place assesses property: https://github.com/cmf-uchicago/cmfproperty

On November 22, 2026 the 3,340 residential sales used in the assessment paper (inside Lincoln, November 2025
to November 2026, each with its 2026 assessed value) were run through the package as it ships.

- `run.R` reads `sales.csv` (parcel number, sale price, assessed value, year built, class, inside the city or
  not; no names), runs the package's outlier rule and statistics, and prints the price groups.
- `noise.R` runs the package's simulation of how much random noise in sale prices would produce the same
  statistics with perfectly even assessments.

Results are in the paper, in the section "The same sales through the University of Chicago's method".
The three headline statistics were also recomputed independently in Python and matched the package.

R 4.x with dplyr, ggplot2 and the package's other dependencies is needed. `stargazer` and `cmfproperty`
were installed from their GitHub sources.
