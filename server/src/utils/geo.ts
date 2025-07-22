import { point } from '@turf/helpers';

export const toPoint = (lat: number, lon: number) => point([lon, lat]);
