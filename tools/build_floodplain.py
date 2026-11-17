#!/usr/bin/env python3
"""Build floodplain.html for the STARCITY site from the exported report markdown.

Usage: python3 tools/build_floodplain.py <report.md> <out.html>
Charts are emitted as static inline SVG so the page has no runtime dependencies.
"""
import html
import re
import sys

THEMES = {
    "dark":  dict(text="#e9e4d6", dim="#a8a294", accent="#ffd34d",
                  muted="#7d7768", grid="#242a33", axis="#4a5160"),
    "light": dict(text="#1a1d23", dim="#5c6270", accent="#2563a8",
                  muted="#9aa0a8", grid="#e4e7ec", axis="#aab0b8"),
}
C_TEXT = C_DIM = C_ACCENT = C_MUTED = C_GRID = C_AXIS = ""


def apply_theme(name):
    """Set the chart palette. Charts read these at call time."""
    global C_TEXT, C_DIM, C_ACCENT, C_MUTED, C_GRID, C_AXIS
    t = THEMES[name]
    C_TEXT, C_DIM, C_ACCENT = t["text"], t["dim"], t["accent"]
    C_MUTED, C_GRID, C_AXIS = t["muted"], t["grid"], t["axis"]


apply_theme("dark")

# ---------------------------------------------------------------- chart one

CLAIMS = [
    (1979, 1, 0, 0), (1981, 0, 0, 1), (1982, 1, 0, 0), (1983, 0, 0, 3),
    (1984, 0, 0, 2), (1986, 0, 1, 1), (1989, 3, 0, 0), (1990, 0, 1, 0),
    (1993, 8, 10, 1), (1995, 3, 0, 0), (1996, 2, 2, 0), (1998, 1, 1, 0),
    (2000, 1, 0, 0), (2001, 1, 0, 0), (2002, 7, 0, 0), (2003, 4, 0, 1),
    (2005, 1, 0, 0), (2007, 5, 0, 1), (2008, 7, 2, 0), (2010, 11, 2, 4),
    (2011, 3, 0, 0), (2013, 2, 1, 3), (2014, 20, 1, 10), (2015, 66, 22, 29),
    (2016, 6, 0, 2), (2018, 1, 0, 1), (2019, 0, 0, 1), (2020, 1, 0, 0),
    (2021, 2, 0, 0), (2023, 0, 0, 1), (2024, 1, 0, 0), (2026, 7, 4, 2),
]
def series():
    """Resolved at call time so a theme switch reaches the bars."""
    return [
        ("Rainfall or snowmelt", C_ACCENT, 1.0),
        ("Stream or lake overflow", C_MUTED, 1.0),
        ("Other or uncoded", C_MUTED, 0.45),
    ]


def chart_claims():
    lo, hi = 1979, 2026
    left, right, base, y0, ymax, bw = 52, 718, 330, 95, 120, 10
    span = (right - left) / (hi - lo)
    px = lambda yr: left + (yr - lo) * span
    hv = lambda n: n / ymax * (base - y0)
    rain = sum(r[1] for r in CLAIMS)
    total = sum(r[1] + r[2] + r[3] for r in CLAIMS)

    o = [
        "<svg viewBox='0 0 760 395' role='img' "
        "aria-label='Rainfall, not stream overflow, drives most Lincoln flood claims' "
        "font-size='12' xmlns='http://www.w3.org/2000/svg'>",
        f"<text x='52' y='28' font-size='17' fill='{C_TEXT}' font-weight='600'>"
        "Rainfall, not stream overflow, drives most Lincoln flood claims</text>",
        f"<text x='52' y='49' fill='{C_DIM}'>{rain} of {total} NFIP claims coded as "
        f"rainfall or snowmelt accumulation, {lo} to {hi}</text>",
        f"<text x='736' y='76' text-anchor='end' font-size='11' fill='{C_DIM}'>"
        "6 and 7 May 2015 alone: 107 claims and 87% of all dollars ever paid</text>",
        f"<line x1='{px(2015)+bw/2:.1f}' y1='82' x2='{px(2015)+bw/2:.1f}' y2='98' "
        f"stroke='{C_AXIS}' stroke-width='1'/>",
        "<g>",
    ]
    for t in (0, 30, 60, 90, 120):
        y = base - hv(t)
        o.append(f"<line x1='{left}' y1='{y:.1f}' x2='{right}' y2='{y:.1f}' "
                 f"stroke='{C_GRID}' stroke-width='1'/>")
        o.append(f"<text x='44' y='{y+4:.1f}' text-anchor='end' font-size='11' "
                 f"fill='{C_DIM}'>{t}</text>")
    o.append("</g>")

    for idx, (name, colour, op) in enumerate(series()):
        o.append(f"<g data-series='{html.escape(name)}'>")
        for row in CLAIMS:
            yr = row[0]
            below = sum(row[1:1 + idx])
            n = row[1 + idx]
            if n == 0:
                continue
            y = base - hv(below + n)
            o.append(
                f"<rect x='{px(yr):.1f}' y='{y:.1f}' width='{bw}' "
                f"height='{hv(n):.1f}' fill='{colour}' fill-opacity='{op}'>"
                f"<title>{yr} · {html.escape(name)}: {n} "
                f"claim{'s' if n != 1 else ''}</title></rect>")
        o.append("</g>")

    o.append(f"<line x1='{left}' y1='{base}' x2='{right}' y2='{base}' "
             f"stroke='{C_AXIS}' stroke-width='1'/>")
    for t in range(1980, 2026, 5):
        o.append(f"<text x='{px(t)+bw/2:.1f}' y='348' text-anchor='middle' "
                 f"font-size='11' fill='{C_DIM}'>{t}</text>")
    for i, (name, colour, op) in enumerate(series()):
        x = left + (0, 145, 305)[i]
        o.append(f"<rect x='{x}' y='364' width='10' height='10' fill='{colour}' "
                 f"fill-opacity='{op}'/>")
        o.append(f"<text x='{x+15}' y='373' font-size='11' fill='{C_DIM}'>"
                 f"{html.escape(name)}</text>")
    o.append("</svg>")
    return "".join(o)


# ---------------------------------------------------------------- chart two

LAND = [
    ("Farm and acreage", 78.6, 18.0, "24,119 acres", "$200.7M"),
    ("Parks and public open space", 14.8, 10.8, "4,526 acres", "$120.3M"),
    ("Commercial and institutional", 2.6, 37.7, "783 acres", "$421.0M"),
    ("Vacant land", 1.8, 3.3, "559 acres", "$37.3M"),
    ("Single family homes", 1.8, 21.7, "544 acres", "$242.4M"),
    ("Other housing", 0.4, 8.5, "137 acres", "$94.7M"),
]
DEV = {"Commercial and institutional", "Single family homes", "Other housing"}


def chart_land():
    left, right, y0, rowh, barh, maxp = 200, 690, 96, 46, 16, 80
    bx = lambda p: p / maxp * (right - left)
    dev_v = sum(r[2] for r in LAND if r[0] in DEV)
    dev_a = sum(r[1] for r in LAND if r[0] in DEV)
    o = [
        "<svg viewBox='0 0 760 380' role='img' "
        "aria-label='Two thirds of the floodplain value sits on 5% of its land' "
        "font-size='12' xmlns='http://www.w3.org/2000/svg'>",
        f"<text x='18' y='28' font-size='17' fill='{C_TEXT}' font-weight='600'>"
        "Two thirds of the floodplain&#8217;s value sits on 5% of its land</text>",
        f"<text x='18' y='49' fill='{C_DIM}'>{dev_v:.1f}% of assessed value sits on "
        f"{dev_a:.1f}% of the mapped 1% floodplain</text>",
    ]
    for i, (label, colour) in enumerate(
            (("Share of floodplain acreage", C_MUTED),
             ("Share of assessed value", C_ACCENT))):
        x = 18 + i * 200
        o.append(f"<rect x='{x}' y='65' width='10' height='10' fill='{colour}'/>")
        o.append(f"<text x='{x+15}' y='74' font-size='11' fill='{C_DIM}'>{label}</text>")
    o.append(f"<line x1='{left}' y1='{y0}' x2='{left}' y2='{y0+5*rowh+36}' "
             f"stroke='{C_AXIS}' stroke-width='1'/>")
    for i, (name, acp, vp, adisp, vdisp) in enumerate(LAND):
        ytop = y0 + i * rowh
        o.append(f"<text x='190' y='{ytop+22}' text-anchor='end' font-size='12' "
                 f"fill='{C_TEXT}'>{html.escape(name)}</text>")
        for j, (pct, colour, disp, sname) in enumerate(
                ((acp, C_MUTED, adisp, "Share of floodplain acreage"),
                 (vp, C_ACCENT, vdisp, "Share of assessed value"))):
            by = ytop + j * 20
            o.append(
                f"<rect x='{left}' y='{by}' width='{bx(pct):.1f}' height='{barh}' "
                f"fill='{colour}'><title>{html.escape(name)} · {sname}: "
                f"{pct:.1f}% ({disp})</title></rect>")
            o.append(f"<text x='{left+bx(pct)+6:.1f}' y='{by+12}' font-size='11' "
                     f"fill='{C_DIM}'>{pct:.1f}%</text>")
    o.append("</svg>")
    return "".join(o)


# ---------------------------------------------------------------- markdown

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\*([^*\n]+)\*", r"<em>\1</em>", s)
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)",
               r'<a href="\2" rel="noopener">\1</a>', s)
    return s


def convert(md, charts):
    lines = md.split("\n")
    out, i, n = [], 0, len(lines)
    chart_i = 0
    while i < n:
        ln = lines[i]
        if not ln.strip():
            i += 1
            continue
        if ln.startswith("&#91;embedded content:"):
            cap = ln[len("&#91;embedded content:"):].rstrip("\\]").strip()
            out.append('<figure class="chart">' + charts[chart_i]
                       + '<figcaption>' + inline(cap) + '</figcaption></figure>')
            chart_i += 1
            i += 1
            continue
        if ln.startswith("### "):
            out.append("<h3>" + inline(ln[4:]) + "</h3>")
            i += 1
            continue
        if ln.startswith("## "):
            out.append("<h2>" + inline(ln[3:]) + "</h2>")
            i += 1
            continue
        if ln.startswith("# "):
            i += 1
            continue
        if ln.startswith("|"):
            rows = []
            while i < n and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                rows.append(cells)
                i += 1
            if len(rows) >= 2 and all(set(c) <= set("-: ") for c in rows[1]):
                head, body = rows[0], rows[2:]
            else:
                head, body = None, rows
            t = ["<div class='tw'><table>"]
            if head:
                t.append("<thead><tr>"
                         + "".join("<th>" + inline(c) + "</th>" for c in head)
                         + "</tr></thead>")
            t.append("<tbody>")
            for r in body:
                t.append("<tr>" + "".join("<td>" + inline(c) + "</td>" for c in r)
                         + "</tr>")
            t.append("</tbody></table></div>")
            out.append("".join(t))
            continue
        m = re.match(r"^(\d+)\.\s+(.*)$", ln)
        if m:
            items = []
            while i < n:
                m2 = re.match(r"^(\d+)\.\s+(.*)$", lines[i])
                if not m2:
                    break
                items.append(m2.group(2))
                i += 1
            out.append("<ol>" + "".join("<li>" + inline(x) + "</li>" for x in items)
                       + "</ol>")
            continue
        if ln.startswith("- "):
            items = []
            while i < n and lines[i].startswith("- "):
                items.append(lines[i][2:])
                i += 1
            out.append("<ul>" + "".join("<li>" + inline(x) + "</li>" for x in items)
                       + "</ul>")
            continue
        para = [ln]
        i += 1
        while i < n and lines[i].strip() and not re.match(
                r"^(#|\||-\s|\d+\.\s|&#91;embedded)", lines[i]):
            para.append(lines[i])
            i += 1
        out.append("<p>" + inline(" ".join(para)) + "</p>")
    return "\n".join(out)


SHELL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lincoln Floodplain Exposure and Flood Loss · STARCITY</title>
<meta name="description" content="Where Lincoln, Nebraska actually takes flood damage: 275 NFIP claims, the 1% and 0.2% floodplains joined to every parcel, and what city council, city staff and residents should focus on. Built from City of Lincoln GIS and OpenFEMA data.">
<meta property="og:type" content="article">
<meta property="og:title" content="Lincoln Floodplain Exposure and Flood Loss">
<meta property="og:description" content="Most of Lincoln's flood claims are rainfall, not Salt Creek, and nearly a third come from outside the mapped floodplain. A technical report built from public data.">
<meta property="og:url" content="https://robotwhitebread.github.io/STARCITY/floodplain.html">
<meta property="og:image" content="https://robotwhitebread.github.io/STARCITY/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#0d0f14;color:#e9e4d6;
 font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
 font-size:17px;line-height:1.62;-webkit-text-size-adjust:100%}
a{color:#ffd34d}
a:hover{color:#ffe9a8}
.bar{border-bottom:1px solid #242a33;background:#090c11;position:sticky;top:0;z-index:5}
.bar div{max-width:860px;margin:0 auto;padding:11px 22px;display:flex;gap:14px;
 align-items:baseline;font-size:14px}
.bar a{text-decoration:none;font-weight:600;letter-spacing:.06em}
.bar span{color:#8c8676}
main{max-width:860px;margin:0 auto;padding:30px 22px 90px}
h1{font-size:2.05rem;line-height:1.2;margin:.4em 0 .15em;letter-spacing:-.01em}
.sub{color:#a8a294;font-size:1rem;margin:0 0 2.2em}
h2{font-size:1.42rem;line-height:1.28;margin:2.3em 0 .55em;
 padding-top:1.1em;border-top:1px solid #242a33;letter-spacing:-.005em}
h3{font-size:1.08rem;margin:1.9em 0 .4em;color:#ffe9a8;font-weight:600}
p,li{color:#d9d4c8}
strong{color:#fff4d6;font-weight:600}
code{background:#161b22;border:1px solid #242a33;border-radius:4px;
 padding:.08em .36em;font-size:.86em;color:#ffe9a8;
 font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-word}
ul,ol{padding-left:1.3em}
li{margin:.42em 0}
.tw{overflow-x:auto;margin:1.3em 0;border:1px solid #242a33;border-radius:8px}
table{border-collapse:collapse;width:100%;font-size:.88rem;min-width:460px}
th,td{text-align:left;padding:9px 13px;border-bottom:1px solid #1c222b;
 vertical-align:top}
th{background:#131820;color:#ffe9a8;font-weight:600;white-space:nowrap}
tbody tr:last-child td{border-bottom:0}
tbody tr:nth-child(even){background:#10141a}
.chart{margin:1.7em 0;padding:0}
.chart svg{width:100%;height:auto;display:block}
figcaption{color:#8c8676;font-size:.8rem;margin-top:.5em;line-height:1.45}
footer{max-width:860px;margin:0 auto;padding:24px 22px 70px;color:#8c8676;
 font-size:.84rem;border-top:1px solid #242a33}
@media(max-width:620px){
 body{font-size:16px}
 h1{font-size:1.6rem}
 h2{font-size:1.22rem}
 main{padding:22px 16px 70px}
 .bar div{padding:10px 16px}
}
</style>
</head>
<body>
<nav class="bar"><div><a href="./">&#8592; STARCITY</a><span>Lincoln, Nebraska in 3D</span></div></nav>
<main>
<h1>Lincoln Floodplain Exposure and Flood Loss</h1>
<p class="sub">Salt Creek watershed, Lancaster County, Nebraska &#183; November 16, 2026</p>
__BODY__
</main>
<footer>
Built from public data: City of Lincoln and Lancaster County GIS, and OpenFEMA.
Part of <a href="./">STARCITY</a>, an open-source 3D map of Lincoln.
Source and data scripts at <a href="https://github.com/RobotWhiteBread/STARCITY" rel="noopener">github.com/RobotWhiteBread/STARCITY</a>.
</footer>
</body>
</html>
"""

LIGHT_CSS = """
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:#1a1d23;
 font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
 font-size:11.5pt;line-height:1.55}
a{color:#1a4f8a}
nav.bar{display:none}
main{max-width:none;margin:0;padding:0}
h1{font-size:21pt;line-height:1.2;margin:0 0 .12em;letter-spacing:-.01em}
.sub{color:#5c6270;font-size:11pt;margin:0 0 1.6em}
h2{font-size:14.5pt;line-height:1.28;margin:1.7em 0 .5em;padding-top:.8em;
 border-top:1px solid #d8dce2;break-after:avoid;page-break-after:avoid}
h3{font-size:11.8pt;margin:1.4em 0 .35em;color:#1a4f8a;font-weight:600;
 break-after:avoid;page-break-after:avoid}
p,li{color:#24282f}
strong{color:#000;font-weight:600}
code{background:#f2f4f7;border:1px solid #dde1e7;border-radius:3px;
 padding:.05em .3em;font-size:.85em;color:#2d3340;
 font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-word}
ul,ol{padding-left:1.2em}
li{margin:.3em 0}
.tw{margin:1em 0;border:1px solid #dde1e7;border-radius:5px;overflow:hidden;
 break-inside:avoid;page-break-inside:avoid}
table{border-collapse:collapse;width:100%;font-size:9.5pt}
th,td{text-align:left;padding:6px 9px;border-bottom:1px solid #e8ebef;vertical-align:top}
th{background:#f2f4f7;color:#1a1d23;font-weight:600}
tbody tr:last-child td{border-bottom:0}
.chart{margin:1.2em 0;break-inside:avoid;page-break-inside:avoid}
.chart svg{width:100%;height:auto;display:block}
figcaption{color:#6b7280;font-size:8.5pt;margin-top:.4em;line-height:1.4}
footer{margin-top:1.8em;padding-top:.8em;color:#6b7280;font-size:8.5pt;
 border-top:1px solid #d8dce2}
@page{margin:16mm 15mm}
"""

if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    with open(src, encoding="utf-8") as f:
        md = f.read()
    flags = set(sys.argv[3].split("+")) if len(sys.argv) > 3 else set()
    if "light" in flags:
        apply_theme("light")
    charts = [] if "nocharts" in flags else [chart_claims(), chart_land()]
    body = convert(md, charts)
    title = sys.argv[4] if len(sys.argv) > 4 else "Lincoln Floodplain Exposure and Flood Loss"
    sub = sys.argv[5] if len(sys.argv) > 5 else "Salt Creek watershed, Lancaster County, Nebraska &#183; November 16, 2026"
    shell = SHELL
    if "light" in flags:
        shell = re.sub(r"<style>.*?</style>", "<style>" + LIGHT_CSS + "</style>",
                       shell, flags=re.S)
    shell = (shell.replace("Lincoln Floodplain Exposure and Flood Loss", title)
                  .replace("Salt Creek watershed, Lancaster County, Nebraska &#183; November 16, 2026", sub))
    page = shell.replace("__BODY__", body)
    with open(dst, "w", encoding="utf-8") as f:
        f.write(page)
    print(f"wrote {dst}")
