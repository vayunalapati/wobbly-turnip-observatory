# Mexico City · November 4–9, 2026

A mobile-friendly personal itinerary, including a sunrise balloon flight at Teotihuacán on Friday, November 6. Reservations are pending; times are planning estimates in Mexico City local time.

Live site: https://vayunalapati.github.io/wobbly-turnip-observatory/mexico-city/

## Run locally

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. Plain HTML, CSS, and JavaScript; no build step or package installation. The interactive map uses pinned Leaflet 1.9.4 from a CDN and OpenStreetMap tiles. Each day has a shareable URL fragment, Google Maps links, and official booking links. Print includes all six days. The full itinerary remains visible if JavaScript is disabled.

Published using GitHub Pages from the root of `main`. Destination photos and the SVG favicon are included locally. The map and Google Fonts require internet access; system font fallbacks and direct Google Maps links remain available.

Research links appear alongside the relevant activities. Balloon operator details were checked October 18, 2026. Exact-date availability, pickup times, package totals, and reservations remain unconfirmed. No private flight, accommodation, or contact information is stored here.

## Route map and research

A persistent Leaflet/OpenStreetMap map follows the selected day or shows the full trip. Numbered pins, selected-stop highlighting, optional-stop controls, and a cancellable preview connect the map to the timeline. Connecting lines show visit order, not calculated street routes or the balloon flight path. Google Maps provides actual directions. The hotel and airport are unconfirmed and have no pins.

Layout references reviewed: [Stippl Sri Lanka itinerary](https://business.stippl.io/b/farside-travel/trip/eUuzYTR7/ultimate-sri-lanka-journey), [Wanderlog travel maps](https://wanderlog.com/travel-maps), [Furkot plan controls](https://help.furkot.com/features/plan-buttons.html), and [Mappi Norway showcase](https://mappi.studio/showcase/hiking-norway-trollstigen-fjords). Used destination photography, a persistent map, numbered/day-colored stops, day filters, and an optional map preview. No live travel-time or route-optimization claims are made.

Photography credits, sources, and licenses are in `photo-credits.json` and displayed on the page. Photo assets are unchanged files displayed with CSS crops.

Run `node test.mjs` from this folder to check navigation, assets, itinerary-coordinate contracts, and restaurant coverage. Restaurant data is in `../infatuation-mexico-city-google-restaurants.json`.
