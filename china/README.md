# China · November 13–24, 2026

An itinerary and route map in the existing GitHub Pages site. No restaurant directory.

- `itinerary.json` contains the user-supplied schedule, approximate WGS84 landmark pins, overview hubs and schematic transport legs. `itinerary-data.js` is the same data loaded without a fetch request.
- `index.html` contains the readable schedule and links; it remains usable without JavaScript. `app.js` handles day navigation and the Hong Kong city/hike choice. `map.js` uses Leaflet 1.9.4 and OpenStreetMap tiles for the whole trip or selected day, marker/timeline selection, and camera preview.
- Hotel locations, airports, flight numbers, exact train services and raft piers are unconfirmed. No invented departure route is plotted. Dashed lines show connections or visit order, never navigable geometry. Suzhou is a return day trip.
- `photos/` and `photo-credits.json` contain Wikimedia Commons images and attribution. Credits are also visible on the page. Photos are displayed with CSS cropping.
- External map tiles, Leaflet CDN and Google Fonts require a network connection. If Leaflet fails, the schedule and place links remain usable.

Serve the repository root with `python3 -m http.server 8766` and open `/china/`. Run `node china/test.mjs` for data/HTML checks. Publishing is handled by the existing GitHub Pages deployment from `main`.
