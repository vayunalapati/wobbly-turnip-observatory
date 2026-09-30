# Wobbly Turnip Observatory

Interactive restaurant directories for San Francisco and New York City, with Infatuation scores, price tiers, Google ratings and review counts, and a filterable map.

[San Francisco](https://vayunalapati.github.io/wobbly-turnip-observatory/) · [New York City](https://vayunalapati.github.io/wobbly-turnip-observatory/nyc.html)

## Data

- SF: 2,295 unique review entries across 92 pages of [The Infatuation SF directory](https://www.theinfatuation.com/san-francisco/reviews), with Google lookups on September 27–28, 2026.
- NYC: 4,737 unique review entries across 190 pages of [The Infatuation New York directory](https://www.theinfatuation.com/new-york/reviews), including 1,785 scored reviews. Google searches include every directory entry. NYC defaults to the five boroughs; the entire directory also includes nearby and other locations.

Each record includes source links and Google lookup timestamps. Ratings are a snapshot and do not refresh automatically. Unresolved Google matches remain flagged; approximate map locations use Infatuation coordinates. A matched listing without an available rating or review count keeps that field blank. Inclusion does not establish current operating status. Separate reviewed branches remain separate entries.

NYC boroughs use source ZIP codes and city labels, with four source-linked corrections. Restaurant names, addresses, scores, and prices come from The Infatuation. Google matches use name and address or nearby coordinates; individually verified exceptions include their evidence links.

Map UI: [Leaflet](https://leafletjs.com/). Map tiles and data: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## Hosting

Static HTML and JSON, with no build step or backend. GitHub Pages publishes the root of the main branch. To update the site, commit the revised city HTML and corresponding JSON data files.
