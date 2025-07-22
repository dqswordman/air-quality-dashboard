import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import thailand from '../assets/thailand';

export const inThailand = (lat: number, lon: number): boolean =>
  booleanPointInPolygon(point([lon, lat]), thailand as GeoJSON.Polygon);

const nameKw = [
  'Thailand',
  'ประเทศไทย',
  'กรุงเทพ',
  'เชียงใหม่',
  'สมุทร',
  'ตาก',
  'บุรี',
];

export const isThaiStation = (name: string, lat: number, lon: number): boolean =>
  nameKw.some((k) => name.includes(k)) || inThailand(lat, lon);
