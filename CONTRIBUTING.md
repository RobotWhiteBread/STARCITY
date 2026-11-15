# An olive branch: add to STARCITY

STARCITY is a map of Lincoln built from public records by one resident. It gets better every time someone who knows a piece of the city adds what they know. This page is an open invitation to do that, and a promise about how it will be handled.

It is written for the City of Lincoln and Lancaster County, the University of Nebraska-Lincoln, Lincoln Public Schools, StarTran, the Lincoln Airport, neighborhood associations, Realtors, businesses, nonprofits, reporters, students and anyone else who lives or works here.

## What you can add

| You are | Things that would help |
|---|---|
| City or county staff | A public layer or feed the map does not use yet. A correction to how the map reads one of yours. Word on what is about to change. |
| The university | Building names and uses, event venues, campus routes, research data about Lincoln that is already public. |
| StarTran | A way for a web page to read live bus positions. Today the map draws buses from the timetable. |
| Lincoln Airport | An arrivals and departures feed a web page can read. Today the planes on the map are examples. |
| Realtors and builders | Corrections to how sales, values and neighborhoods are shown. Open house and new subdivision layers, clearly dated. |
| Businesses | Your hours, website and what you are, corrected at the source (see below). A layer for a district or an event. |
| Neighborhoods and nonprofits | Places, history, gardens, little libraries, murals, routes, anything worth finding. |
| Anyone | Something that is wrong, missing, out of date or hard to use. |

## Three ways in, easiest first

1. **Tell us.** Open an issue on GitHub and pick the form that fits: something is wrong, add data, or work together. No code needed. A GitHub account is free.
2. **Point to it.** If the data already sits on a public server, give its address. Most city layers can be wired in the same day.
3. **Add it yourself.** Put a GeoJSON file in `community/`, list it in `community/index.json`, and open a pull request against the `olive-branch` branch. `community/README.md` shows the format in five lines. Your layer appears in the map under From the community, with your name on it.

For a business listing, the best fix is at the source: the map reads businesses from OpenStreetMap, so a correction there fixes this map and every other map that uses it.

## What happens next

- Every issue and pull request gets a reply.
- Additions are checked for three things only: is it about Lincoln, is it public, and does it say where it came from.
- What is accepted is credited by name in the map, on the layer's own card, and in the README.
- Pull requests collect on the `olive-branch` branch and are merged into the map at the next release.
- If something cannot be added, you will be told why, in plain words.

## The ground rules

These protect the people who use the map and the people who add to it.

- **Facts, with a source and a date.** Every layer says where it came from and as of when. Estimates are labeled as estimates.
- **Places, not people.** Nothing that names or locates a private person: no owner names, tenants, customers, students, patients or home addresses of individuals. The map does not plot anyone on any registry.
- **No paid placement.** Nobody can buy a better spot, a bigger label or the removal of a fact. A business that adds its own details is shown the same way as one that does not.
- **Public and reusable.** Only add what you have the right to publish. By adding it you agree it can be shown in the map and kept in this repository under the same terms as the rest of the project.
- **Corrections welcome from anyone, about anything**, including about the map's own mistakes. Being wrong in public is how this gets right.
- **Kindness.** Disagree about data, not about people. Unkind messages are closed without a reply.

## Privacy for contributors

Issues and pull requests on GitHub are public. Do not put a phone number, a home address or anything private in them. The project keeps no mailing list and no contact file.

## For developers

- The map is one HTML file. The source is in `src/`: `page.html`, the `layers_*.js` files, and the Python scripts that build the two data packs. `README.md` has the rebuild steps.
- Keep changes small and say in the pull request what you tested and on what device.
- New data needs a line in `DATA_PLAN.md`: source, fields kept, date, and how to refresh it.
