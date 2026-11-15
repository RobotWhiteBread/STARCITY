# Live aircraft relay

STARCITY shows example planes at Lincoln Airport because no free aircraft feed allows a web page to read it. Each one refuses requests that come from a browser page on another site. A relay fixes that: a very small program on a server asks the feed on the page's behalf and passes the answer back with a header that lets the page read it.

This folder holds that relay, written as a Cloudflare Worker. It is not running anywhere. Nobody has to host it for the map to work.

## What it does

- Accepts a request from the STARCITY page only (it checks where the request came from).
- Asks one public feed for aircraft within 30 nautical miles of Lincoln Airport.
- Keeps the answer for 10 seconds, so many visitors cost one request.
- Returns only what the map draws: position, altitude, heading, speed, callsign and aircraft type.

It stores nothing and logs nothing.

## To turn it on

1. Create a free Cloudflare account and a new Worker. This is the step only the repository owner can do.
2. Paste in `worker.js`. Set `ALLOWED` to the address of your copy of the map.
3. Copy the Worker's address into `FLIGHT_FEED` in `src/layers_g.js`, rebuild, and publish.
4. Read the feed's terms first. `adsb.lol` publishes its data under the Open Database License and asks for credit. Other feeds have other terms.

The page side of live flights is not written yet. `FLIGHT_FEED` is the switch it will use.
