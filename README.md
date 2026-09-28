# Wobbly Turnip Observatory

An interactive San Francisco and Bay Area restaurant directory with Infatuation scores, price tiers, Google ratings and review counts, and a filterable map.

[Open the site](https://vayunalapati.github.io/wobbly-turnip-observatory/)

## Data

2,295 review entries collected from [The Infatuation SF directory](https://www.theinfatuation.com/san-francisco/reviews), with Google lookups on September 27–28, 2026. Each record includes source links and lookup timestamps. Ratings are a snapshot and do not refresh automatically. Unresolved Google matches remain flagged; approximate map locations use Infatuation coordinates. Inclusion does not establish current operating status.

Map UI: [Leaflet](https://leafletjs.com/). Map tiles and data: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## Hosting

Static HTML and JSON, with no build step or backend. GitHub Pages publishes the root of the main branch. To update the site, commit the revised index.html and JSON data file.
