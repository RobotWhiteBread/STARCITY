# Putting STARCITY on starcitylincoln.org, behind Cloudflare

Why: the map is a single file of about 7.7 MB over the wire after gzip. GitHub
Pages has a soft bandwidth limit of 100 GB a month, which is roughly 13,900
loads. Cloudflare caches the whole site at its edge and serves it free and
unmetered, which removes that ceiling. Cloudflare cannot proxy a `github.io`
domain, so a domain of your own is what unlocks it. The second reason is that
a real domain reads differently in an email to a council member than
`robotwhitebread.github.io` does.

## Order matters

Do not create the `CNAME` file in this repo by hand. Adding it switches
GitHub Pages to the custom domain immediately and redirects the `github.io`
address to it. If DNS is not answering yet, the site is unreachable at both
addresses until it is. GitHub's Pages settings page writes that file for you at
the right moment.

GitHub's documented order is repository setting first, then DNS, because
configuring DNS for a domain you have not claimed in the repo can let someone
else host on it. Follow that order.

## 1. Buy the domain

`starcitylincoln.org`, roughly $12 a year. Any registrar works. If you register
it at Cloudflare itself you skip step 2, because it arrives on their nameservers
already.

## 2. Put it on Cloudflare

Create a free Cloudflare account, add `starcitylincoln.org` as a site on the
Free plan, and change the nameservers at your registrar to the two Cloudflare
gives you. Propagation is usually under an hour.

## 3. Claim the domain in this repository

GitHub, this repo, Settings, Pages, Custom domain. Enter
`starcitylincoln.org` and save. This writes a `CNAME` file to the branch Pages
builds from. There will be a short window where the site is unreachable until
step 4 is done, so do them back to back.

## 4. DNS records in Cloudflare

Leave the proxy **off** for now. That is the grey cloud, not the orange one.
GitHub has to reach the domain directly to validate it and issue a certificate,
and the proxy gets in the way of that.

Four `A` records on the apex, all with the proxy off:

    A   starcitylincoln.org   185.199.108.153
    A   starcitylincoln.org   185.199.109.153
    A   starcitylincoln.org   185.199.110.153
    A   starcitylincoln.org   185.199.111.153

Four `AAAA` records, optional but worth adding, since GitHub recommends keeping
both while IPv6 adoption is uneven:

    AAAA starcitylincoln.org  2606:50c0:8000::153
    AAAA starcitylincoln.org  2606:50c0:8001::153
    AAAA starcitylincoln.org  2606:50c0:8002::153
    AAAA starcitylincoln.org  2606:50c0:8003::153

And one for `www`:

    CNAME www   robotwhitebread.github.io

## 5. Wait for the certificate

Back in GitHub, this repo, Settings, Pages. The **Enforce HTTPS** checkbox
appears once GitHub has issued a certificate for the domain. GitHub says this
can take up to 24 hours. Tick it when it appears.

Do not go to step 6 before this box is ticked.

## 6. Turn the proxy on

This is the step that actually buys you the bandwidth.

In Cloudflare, switch the four `A` records (and the `AAAA` records if you added
them) to the orange cloud. Then, and this part matters, go to SSL/TLS and set
the encryption mode to **Full** or **Full (strict)**.

If you leave it on **Flexible** you get an infinite redirect loop, because
Cloudflare talks to GitHub over HTTP while GitHub redirects everything to HTTPS.
This is the single most common way this setup fails, and GitHub's own
documentation does not cover it because it does not discuss CDNs at all.

## 7. Caching

Cloudflare does not cache HTML by default, so without a rule the 10 MB
`index.html` passes straight through to GitHub on every visit.

Caching, Cache Rules, Create rule, and pick the **Cache everything** template.
Deploy it as is. Do not set an Edge TTL: with it blank Cloudflare follows
GitHub's own `cache-control`, which is ten minutes. That still absorbs nearly
all traffic under load, and a pushed update goes live within ten minutes with
no purge.

Deploy only that one template. The page offers three, and "Bypass cache for
everything" placed after "Cache everything" overrides it, leaving nothing
cached.

Verify with the response headers: `server: cloudflare` and
`cf-cache-status: HIT` on a second load. `MISS` on the first load is expected.

Status, 21 November 2026: live. Map, both reports and the PDF all verified
`HIT` through Cloudflare on https://starcitylincoln.org.

One thing to know about pushes: GitHub wrote `CNAME` to `gh-pages` when the
domain was saved. That file now lives on every branch. Never delete it, and
never force-push a branch that lacks it, or the custom domain drops.

## 8. Afterwards

- The `github.io` address keeps working and redirects, so links already sent out
  do not break.
- The absolute URLs inside the map still point at `github.io`. They will follow
  the redirect, so nothing is broken, but they are worth switching to the new
  domain on the next release.
- `hits.sh` keys its counter on the URL. The count at the `github.io` key stops
  moving and a new one starts at the new domain. The old total is not lost, it
  is just a separate counter.

## Caveat on the Cloudflare specifics

GitHub's documentation covers the A records, the ordering and the certificate
wait. It says nothing about CDNs or proxies. Steps 6 and 7, the SSL mode and the
cache rule, come from how Cloudflare and GitHub Pages behave together rather
than from either vendor's documentation of this combination. Expect to verify
rather than assume.
