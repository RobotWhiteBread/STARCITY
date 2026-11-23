# Champion trees

**Lincoln's champions.** The Nebraska Forest Service's Champion Tree Register (https://nfs.unl.edu/registry/,
read November 23, 2026) lists 90 trees; eight stand in Lincoln. The map places each one by the place the
register gives: grounds, street corner or block. Trees on home lots are placed by block, not house number.
Positions are close, not exact. Several were last measured in 2002 and 2003.

**Points.** Trunk circumference in inches at 4.5 feet + height in feet + a quarter of the average crown
spread in feet (https://nfs.unl.edu/guidelines/). The champion models on the map are drawn at the measured
height and crown spread.

**Trees worth measuring.** `leads.py` compares every living tree in the city's Community Forestry inventory
with the state champion of its species. The city records many trunk sizes in six-inch classes (21, 27, 33,
39... inches are class midpoints), so a tree is listed only if its trunk beats the champion's even at the
low end of its class. Only trees on public ground (street, park, city golf course, median, trail) are
listed, multi-trunk trees are left out, and cultivars recorded over 45 inches across are dropped as likely
errors. These are leads to go measure, not champions: the record can be wrong, the tree can be
misidentified, and a champion needs height and crown as well.

The register was copied into `register_2026-11-23.csv` with owners' and nominators' names removed.
