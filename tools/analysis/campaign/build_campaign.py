"""Who paid for Lincoln's city campaigns. Reads the Nebraska Accountability and Disclosure Commission bulk
extracts (Contributions and Loans, Expenditures, 2022 to 2026) and writes campaign.html.
Usage: python3 build_campaign.py <folder with the *_ContributionLoanExtract.csv and *_ExpenditureExtract.csv files> <repo root>
Every candidate and every group gets the same tables. Names appear exactly as the state publishes them."""
import csv,glob,collections,re,sys,html,os
csv.field_size_limit(10**9)
D,ROOT=sys.argv[1],sys.argv[2]
JK='Jurisdiction - Office - District or Ballot Description'
def load(pat,idk):
    seen=set();out=[]
    for f in sorted(glob.glob(os.path.join(D,pat))):
        for r in csv.DictReader(open(f,encoding='utf-8-sig',errors='replace')):
            if r[idk] in seen: continue
            seen.add(r[idk]);out.append(r)
    return out
E=load('*ExpenditureExtract.csv','Expenditure ID');C=load('*ContributionLoanExtract.csv','Receipt ID')
norm=lambda s:re.sub(r'[^A-Z ]','',s.upper()).strip()
num=lambda s:float(s or 0)
city=lambda r:re.match(r'LINCOLN - (MAYOR|CITY COUNCIL)',r[JK].upper().strip())
T=lambda s:' '.join(w if w in('PAC','LLC','INC','II','III') else w.capitalize() for w in s.split())
money=lambda v:'$'+format(int(round(v)),',')
X=[r for r in E if city(r) and r['Expenditure Transaction Type']=='Independent Expenditure']
def kind(d):
    d=d.upper()
    return 'Mail and printing' if re.search(r'MAIL|POSTAGE|POSTCARD|PRINT',d) else 'TV, radio and digital ads' if re.search(r'\bTV\b|TELEVIS|RADIO|DIGITAL|CABLE|STREAMING',d) else 'Advertising, kind not stated' if re.search(r'ADVERT|\bADS?\b|MEDIA',d) else 'Other or not described'
race=lambda r:('Mayor' if 'MAYOR' in r[JK].upper() else 'City Council, '+('at large' if 'AT LARGE' in r[JK].upper() else 'District '+r[JK].strip()[-1]))
yr=lambda r:r['Expenditure Date'][-4:]
tot=sum(num(r['Expenditure Amount']) for r in X)
byk=collections.Counter();
for r in X: byk[kind(r['Description'])]+=num(r['Expenditure Amount'])
grp=collections.defaultdict(list)
for r in X: grp[r['Filer Name']].append(r)
G=sorted(grp.items(),key=lambda q:-sum(num(r['Expenditure Amount']) for r in q[1]))
esc=html.escape
# table 1: each group, each candidate, support or oppose
rows1=[]
for g,rs in G:
    c=collections.Counter()
    for r in rs: c[(yr(r),race(r),T(norm(r['Candidate Name or Ballot Issue'])),r['Support Or Oppose'].capitalize())]+=num(r['Expenditure Amount'])
    for (y,rc,cn,so),v in sorted(c.items(),key=lambda q:-q[1]): rows1.append((T(g),y,rc,cn,so,v))
# chart
W=720;bh=26;top=G[:9];mx=max(sum(num(r['Expenditure Amount']) for r in rs) for g,rs in top)
svg=[f'<svg viewBox="0 0 {W} {len(top)*(bh+10)+30}" role="img" aria-label="Outside spending in Lincoln city races by group, split into support and oppose" style="width:100%;height:auto;font:13px system-ui,sans-serif">']
for i,(g,rs) in enumerate(top):
    s=sum(num(r['Expenditure Amount']) for r in rs if r['Support Or Oppose'].upper()=='SUPPORT');o=sum(num(r['Expenditure Amount']) for r in rs if r['Support Or Oppose'].upper()=='OPPOSE');y=i*(bh+10)+4;x0=250;sc=(W-x0-90)/mx
    svg.append(f'<text x="{x0-8}" y="{y+bh*.68}" text-anchor="end" fill="currentColor">{esc(T(g)[:36])}</text><rect x="{x0}" y="{y}" width="{s*sc:.1f}" height="{bh}" fill="#2b7bba"/><rect x="{x0+s*sc:.1f}" y="{y}" width="{o*sc:.1f}" height="{bh}" fill="#d9822b"/><text x="{x0+(s+o)*sc+6:.1f}" y="{y+bh*.68}" fill="currentColor">{money(s+o)}</text>')
ly=len(top)*(bh+10)+18
svg.append(f'<rect x="250" y="{ly-11}" width="12" height="12" fill="#2b7bba"/><text x="268" y="{ly}" fill="currentColor">spent to support a candidate</text><rect x="470" y="{ly-11}" width="12" height="12" fill="#d9822b"/><text x="488" y="{ly}" fill="currentColor">spent to oppose a candidate</text></svg>')
# table 2: who funded each group
def who(r):
    n=(r['First Name']+' '+r['Contributor or Source Name (Individual Last Name)']).strip()
    if 'EACH $250 OR LESS' in n.upper(): return ('Donors of $250 or less, not named in the filing','')
    return (T(n),(T(r['City'])+', '+r['State'].upper()).strip(', '))
sec2=[]
for g,rs in G:
    rec=[r for r in C if r['Filer Name']==g and r['Receipt Transaction/Contribution Type']!='Pledge']
    sp=sum(num(r['Expenditure Amount']) for r in rs)
    if not rec:
        sec2.append(f'<h3>{esc(T(g))}</h3><p>Spent {money(sp)} in these races. <strong>The record stops here.</strong> These files hold no list of who funded this filer. It reported its spending as a business or organization, which files what it spent and not who gave to it.</p>');continue
    t=sum(num(r['Receipt Amount']) for r in rec);c=collections.Counter()
    for r in rec: c[who(r)+(r['Contributor or Transaction Source Type'].split(' (')[0],)]+=num(r['Receipt Amount'])
    ys=sorted(set(r['Receipt Date'][-4:] for r in rec))
    sec2.append(f'<h3>{esc(T(g))}</h3><p>Spent {money(sp)} in these races. Its filings list {money(t)} in receipts dated {ys[0]} to {ys[-1]}, for everything it does statewide, not only Lincoln. Its largest sources:</p><div class="tw"><table><thead><tr><th>Source</th><th>Type</th><th>From</th><th>Amount</th></tr></thead><tbody>'+''.join(f'<tr><td>{esc(n)}</td><td>{esc(ty)}</td><td>{esc(pl)}</td><td>{money(v)}</td></tr>' for (n,pl,ty),v in c.most_common(6))+'</tbody></table></div>')
# table 3: the candidates' own committees
cands=sorted(set((norm(r['Candidate Name or Ballot Issue']),race(r)) for r in X))
rows3=[];skipped=[]
for cn,rc in cands:
    rec=[r for r in C if r['Filer Type']=='Candidate Committee' and norm(r['Candidate Name'])==cn and '2022'<=r['Receipt Date'][-4:]<='2026' and r['Receipt Transaction/Contribution Type']!='Pledge']
    names=set(r['Filer Name'] for r in rec)
    if not rec or any(re.search(r'NEBRASKA|LEGISLATURE',n.upper()) and 'LINCOLN' not in n.upper() for n in names): skipped.append(T(cn));continue
    t=sum(num(r['Receipt Amount']) for r in rec);b=collections.Counter()
    for r in rec:
        a=num(r['Receipt Amount']);n=(r['First Name']+r['Contributor or Source Name (Individual Last Name)']).upper();s=r['Contributor or Transaction Source Type']
        b['small' if 'EACH $250 OR LESS' in n else 'ind' if s=='Individual' else 'self' if s.startswith('Self') else 'biz' if s.startswith('Business') else 'pol']+=a
        st=r['State'].upper().strip('. ')
        b['g_none' if ('EACH $250 OR LESS' in n or not st) else 'g_lnk' if st=='NE' and r['Zip'][:3]=='685' else 'g_ne' if st=='NE' else 'g_out']+=a
    p=lambda k:f'{100*b[k]/t:.0f}%'
    rows3.append((T(cn),rc,t,p('ind'),p('small'),p('biz'),p('pol'),p('self'),p('g_lnk'),p('g_ne'),p('g_out')))
rows3.sort(key=lambda q:-q[2])
asof='November 21, 2026'
body=f'''<main>
<h1>Who Paid for Lincoln's City Campaigns</h1>
<p class="sub">Mayor and City Council, 2023 and 2025 &#183; Published {asof}</p>
<p><em>Published {asof} by STARCITY, starcitylincoln.org, from the state's campaign finance files as they stood that day.</em></p>
<h2>Summary</h2>
<p>Candidates raise and spend their own money. Separately, parties, political committees and organizations can spend on their own to support or oppose a candidate. Nebraska calls that an independent expenditure, and it must be reported to the state. This paper adds up every independent expenditure the state has on file for Lincoln's mayor and City Council races in 2023 and 2025, shows what it bought, and follows each group back to its own reported funders as far as the public record goes.</p>
<ol>
<li><strong>{money(tot)}</strong> in independent spending is on file for these races, from {len(G)} groups.</li>
<li><strong>{money(byk['Mail and printing'])}</strong> of it was described as mail or printing, {money(byk['TV, radio and digital ads'])} as TV, radio or digital advertising, and {money(byk['Advertising, kind not stated'])} as advertising with no kind stated. The remaining {money(byk['Other or not described'])} was described another way or not at all.</li>
<li>For {sum(1 for s in sec2 if 'record stops here' in s)} of the {len(G)} groups, <strong>the public record stops at the group's name</strong>. These files show what they spent and not who funded them.</li>
</ol>
<p>This paper reports what was filed. It does not say whether any of the spending was right or wrong, and it treats every candidate and every group the same way.</p>
<h2>Who spent, for and against whom</h2>
{''.join(svg)}
<div class="tw"><table><thead><tr><th>Group</th><th>Year</th><th>Race</th><th>Candidate</th><th>Position</th><th>Amount</th></tr></thead><tbody>
{''.join(f'<tr><td>{esc(a)}</td><td>{b}</td><td>{esc(c)}</td><td>{esc(d)}</td><td>{e}</td><td>{money(v)}</td></tr>' for a,b,c,d,e,v in rows1)}
</tbody></table></div>
<h2>Who funded the groups</h2>
<p>A group's donors paid for everything the group did, across the state and across several years. No filing ties a particular donor to a particular mailer or ad. Read these lists as who stood behind each group, not as who paid for a specific message. Names are spelled as the state's files spell them, so one person can appear on two lines.</p>
{''.join(sec2)}
<h2>The candidates' own committees</h2>
<p>For comparison, here is what the candidates named in those reports raised through their own committees, from receipts dated 2022 through 2026. Loans and in-kind contributions are included. Shares may not add to 100% because of rounding.</p>
<div class="tw"><table><thead><tr><th>Candidate</th><th>Race</th><th>Receipts</th><th>Named individuals</th><th>Donors of $250 or less</th><th>Businesses and organizations</th><th>Committees and parties</th><th>Candidate's own money</th><th>From Lincoln ZIP codes</th><th>Elsewhere in Nebraska</th><th>Out of state</th></tr></thead><tbody>
{''.join('<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+money(r[2])+'</td>'+''.join(f'<td>{v}</td>' for v in r[3:])+'</tr>' for r in rows3)}
</tbody></table></div>
<p>This table covers only the {len(rows3)} candidates named in independent spending reports, because the state's files label those candidates' offices. Other candidates ran in these races and are not shown yet. {('Not shown: '+', '.join(skipped)+', whose committee on file is registered under a name for a different office.') if skipped else ''} A full table of every candidate is planned.</p>
<h2>Who paid for the mailer in your mailbox?</h2>
<ol>
<li>Find the line on the mailer that says who paid for it. Campaign material in Nebraska generally has to carry one.</li>
<li>Search that exact name in the state's <a href="https://nadc-e.nebraska.gov/PublicSite/Search.aspx" rel="noopener">campaign filing search</a>.</li>
<li>If it is a candidate's committee, its donors are listed. If it is a party or political committee, its donors are listed too, as in the section above.</li>
<li>If it is a business or nonprofit organization, the search shows what it spent and stops there. That is where disclosed money ends.</li>
</ol>
<h2>Method and limits</h2>
<ul>
<li><strong>Source.</strong> Nebraska Accountability and Disclosure Commission bulk data: Contributions and Loans, and Expenditures, for 2022 through 2026, downloaded {asof}. {len(E):,} expenditure records and {len(C):,} receipt records after removing repeated record IDs across the yearly files.</li>
<li><strong>Which races.</strong> Records whose office field reads "Lincoln - Mayor" or "Lincoln - City Council", and whose type is Independent Expenditure. The office label is the state's own.</li>
<li><strong>What it bought.</strong> Sorted by keywords in each record's description (mail, postage, print; TV, radio, digital). A record that says only "advertising" is counted as advertising with no kind stated.</li>
<li><strong>Geography.</strong> Lincoln means a Nebraska address with a ZIP code starting 685. Donors of $250 or less are reported as a lump with no address.</li>
<li><strong>Not checked against paper filings.</strong> Amended filings are included as the state's file holds them. Two pairs of records share the same date, amount and payee and were kept as filed.</li>
<li><strong>What this cannot show.</strong> Spending that was never reported, spending described as education and not as support or opposition, federal races, and the donors behind organizations that are not required to list them.</li>
<li><strong>Names.</strong> Campaign donors and filers are public record under Nebraska law. They appear here only as the state publishes them. If a record here is wrong, report it on the project's <a href="https://github.com/RobotWhiteBread/STARCITY/issues" rel="noopener">issues page</a> and it will be checked against the state's file and corrected.</li>
</ul>
<h2>Sources and where to go</h2>
<div class="tw"><table><thead><tr><th>What</th><th>Where</th></tr></thead><tbody>
<tr><td>Search any candidate, committee or donor</td><td><a href="https://nadc-e.nebraska.gov/PublicSite/Search.aspx" rel="noopener">NADC campaign filing search</a></td></tr>
<tr><td>The bulk files used here</td><td><a href="https://nadc-e.nebraska.gov/PublicSite/DataDownload.aspx" rel="noopener">NADC data download</a></td></tr>
<tr><td>Rules, forms and complaints</td><td><a href="https://nadc.nebraska.gov/" rel="noopener">Nebraska Accountability and Disclosure Commission</a>, 402-471-2522</td></tr>
<tr><td>Federal races</td><td><a href="https://www.fec.gov/data/" rel="noopener">Federal Election Commission</a></td></tr>
<tr><td>The script behind every number</td><td><a href="https://github.com/RobotWhiteBread/STARCITY" rel="noopener">github.com/RobotWhiteBread/STARCITY</a>, tools/analysis/campaign</td></tr>
</tbody></table></div>
<p>More papers are at <a href="reports.html">The STARCITY Papers</a>. The map is at <a href="index.html">starcitylincoln.org</a>.</p>
</main>'''
s=open(os.path.join(ROOT,'reports.html')).read()
a=s.index('<main>');b=s.index('</main>')+7;s=s[:a]+body+s[b:]
s=s.replace('<title>The STARCITY Papers · STARCITY</title>',"<title>Who Paid for Lincoln's City Campaigns · STARCITY</title>")
desc="Every independent expenditure on file for Lincoln's mayor and City Council races in 2023 and 2025: who spent, for and against whom, what it bought, and who funded each group, from Nebraska's public campaign filings."
s=re.sub(r'<meta name="description" content="[^"]*">',lambda m:f'<meta name="description" content="{esc(desc)}">',s,count=1)
s=re.sub(r'<meta property="og:title" content="[^"]*">',lambda m:'<meta property="og:title" content="Who Paid for Lincoln\'s City Campaigns">',s)
s=re.sub(r'<meta property="og:description" content="[^"]*">',lambda m:f'<meta property="og:description" content="{esc(desc)}">',s)
s=re.sub(r'<meta property="og:url" content="[^"]*">',lambda m:'<meta property="og:url" content="https://starcitylincoln.org/campaign.html">',s)
s=s.replace('https://robotwhitebread.github.io/STARCITY/og.jpg','https://starcitylincoln.org/og.jpg')
open(os.path.join(ROOT,'campaign.html'),'w').write(s)
print('total',money(tot),dict((k,money(v)) for k,v in byk.items()),'groups',len(G),'cands',len(rows3),'skipped',skipped)
for r in rows1[:6]:print(r)
