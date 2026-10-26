# Terrain data provenance

## Cerro Fitz Roy elevation reference

`engine/landform/reference/FitzRoyTerrain.ts` contains a compact 257 x 257
bare-earth elevation reference centered on Cerro Fitz Roy, Patagonia:

- Center: `-49.2713, -73.0432`
- Approximate source extent: 12 km x 12 km
- Source format: Mapzen Terrain Tiles, Terrarium PNG, zoom 13
- Source bucket: `s3://elevation-tiles-prod`
- Accessed: 2026-08-17
- Stored values: rounded elevation in meters, bilinearly resampled to 257 x 257

Terrarium values were decoded with the published formula:

`elevation = red * 256 + green + blue / 256 - 32768`

The game does not contact the terrain service at runtime. The resampled
reference is embedded locally and is transformed, blended with an oceanic
island domain, and supplemented with seeded procedural surface detail.

## Attribution

Elevation data: [Mapzen Terrain Tiles on AWS Open Data](https://registry.opendata.aws/terrain-tiles/),
managed by Mapzen as a Linux Foundation project. Terrain Tiles use SRTM and
other open elevation sources; the Terrarium encoding and source details are
documented by [Tilezen Joerd](https://github.com/tilezen/joerd/blob/master/docs/formats.md).

SRTM was produced by NASA and the U.S. National Geospatial-Intelligence Agency.
No imagery, place labels, or map artwork are included in the project.
