export default {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [97.343, 5.613],
        [105.637, 5.613],
        [105.637, 20.465],
        [97.343, 20.465],
        [97.343, 5.613],
      ],
    ],
  },
} as const satisfies GeoJSON.Feature<GeoJSON.Polygon>;
