# How STARCITY is made

*Last updated November 21, 2026.*

**Code for a more open and better informed society, starting in Lincoln, Nebraska.** Public information that arrives as a PDF or a flat chart gets rebuilt so people can see it in 3D, interact with it, find their own place in it, and view it in new ways. Every feature is held to three questions: Is it on the ground? Is it yours? Does it show something the PDF could not?

This is the working process behind the map and its papers, written so that someone else can check it, repeat it, or run it for another city.

## 1. Find the public source

- Use only data a public agency publishes. Nothing behind a login.
- Name the fields wanted in each request. Property owner names, mailing addresses, and buyer and seller names are never requested.
- Record the address of the source and the date it was read. See [DATA_PLAN.md](DATA_PLAN.md) for every source.

## 2. Pull it

- Small sources are read by scripts in this repository.
- Some city and state servers refuse connections from cloud tools. Those are pulled with the PowerShell scripts in this repository (`get_*.ps1`, `wide/`), run on an ordinary PC.
- Large tables are paged. The scripts say how many rows they expected and how many they got.

## 3. Shape it

- Scope every figure to a boundary a reader can check, normally Lincoln's corporate limit.
- Compute areas in an equal-area projection. Do not trust area fields published in web map coordinates.
- Use true overlaps between shapes, not center points.
- Remove repeated records when files overlap from year to year, and say so.

## 4. Join it

The findings come from putting two public datasets side by side: flood claims against the flood map, sale prices against assessed values, campaign spending against campaign receipts. Each join is described in the paper that uses it.

## 5. Check it

Before a figure is published:

1. Find the same quantity measured by someone else, usually a state agency.
2. If the two differ, find out why and print both.
3. Look for independent reporting on the same records.
4. If no outside figure exists, say so in the paper.

Results are logged at [verification.html](https://starcitylincoln.org/verification.html).

## 6. Label it

- **Real**: read from a public record, with its date.
- **Estimated**: computed from records by a stated method, and labeled as an estimate wherever it appears.
- **For fun**: decoration, labeled that way.

Each estimate names what data would replace it. See [DATA_GAPS.md](DATA_GAPS.md).

## 7. Publish it

- Each paper opens with its date and ends with its sources and where to go next.
- The scripts that produced the numbers are in `tools/analysis/`.
- Names of people appear only where a public body lists them: elected officials, and campaign donors and committees exactly as the state's campaign finance files publish them.

## 8. Correct it

- Errors are reported on the [issues page](https://github.com/RobotWhiteBread/STARCITY/issues).
- A confirmed error is fixed in the paper and added to the corrections log with its date.
- A correction is never made silently.

## 9. Keep it current

Meeting dates and agendas weekly. Sales, permits and planning cases monthly. Campaign filings after each deadline. The assessment roll, levy rates, the TIF report and the state ratio study yearly. Each refresh repeats step 5 for the papers it touches.

## The role of AI

The map and papers are built with AI assistance, directed and checked by the author. AI makes pulling and adding up data fast. It does not make a result correct, and it cannot know about a benchmark nobody has pointed it to. Steps 5 and 8 exist for that reason, and outside review is the part of this process that is still missing.

## Doing this for another city

The state and federal files used here cover every Nebraska city in the same format: assessment ratio studies, TIF reports, campaign finance, flood insurance claims. Start with one paper, check it against one outside figure, and publish the method with the result.
