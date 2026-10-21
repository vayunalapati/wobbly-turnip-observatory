# China · November 13–24, 2026

A shareable itinerary and route map in the existing GitHub Pages site.

- Four stays: Hong Kong (Nov 13–16), Yangshuo (Nov 16–18), Wulingyuan (Nov 18–21), Shanghai (Nov 21–24). Three nights in the same Wulingyuan hotel; Tianmen on the departure morning, Nov 21. Yu Garden stays on Sunday Nov 22 because it normally closes Mondays.
- `itinerary.json` is the editable source for days, approximate WGS84 place pins, stays and schematic transport legs. Run `python3 china/build.py` from the repository root to regenerate `index.html` and `itinerary-data.js` together.
- `app.js` handles date navigation, direct day links, printing, and copying a public sharing link. It always uses the canonical deployed URL, including during local preview; a manual-copy field is available if clipboard access fails.
- `map.js` uses Leaflet 1.9.4 and OpenStreetMap tiles for four overnight bases, transfer points, numbered daily stops and camera preview. Small transit dots do not represent extra hotel stays.
- Exact flights, trains, hotels and entry slots remain unconfirmed. Tianmen currently operates Route C during the main-cableway renovation: recheck the linked operator notice. Lines show connection or visit order, not navigable geometry.
- `photos/` and `photo-credits.json` contain Wikimedia Commons images and attribution. Credits are also visible on the page. Sharing previews use the existing Zhangjiajie photo.
- The schedule and place links work without JavaScript. External map tiles, Leaflet CDN and Google Fonts require a network connection; a Leaflet failure leaves the itinerary usable.

Serve the repository root with `python3 -m http.server 8766` and open `/china/`. Run `node china/test.mjs` for data, navigation, sharing and fallback checks. Publishing uses the existing GitHub Pages deployment from `main`.
