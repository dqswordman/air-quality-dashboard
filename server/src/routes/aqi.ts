import { Router } from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';
import { isThaiStation } from '../utils/isThailand';

const router = Router();
const cache = new NodeCache({ stdTTL: 600 });
const TOKEN = process.env.WAQI_TOKEN ?? '';

interface BoundsStation {
  uid: number;
  lat: number;
  lon: number;
  aqi: string;
  station: { name: string };
}

const cacheWrap = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  const cached = cache.get<T>(key);
  if (cached) return cached;
  const val = await fn();
  cache.set(key, val);
  return val;
};

router.get('/nearby', async (_req, res, next) => {
  try {
    const url = `https://api.waqi.info/map/bounds/?latlng=5.6,97.3,20.5,105.64&token=${TOKEN}`;
    const raw = await cacheWrap('nearby', async () => (await axios.get(url)).data as { status: string; data: BoundsStation[] });
    if (raw.status !== 'ok') {
      return res.status(502).json({ message: 'WAQI error' });
    }
    const list = raw.data.filter((s) => isThaiStation(s.station.name, s.lat, s.lon));
    return res.json({ status: 'ok', data: list });
  } catch (err) {
    return next(err);
  }
});

router.get('/aqi/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params;
    const url = `https://api.waqi.info/feed/@${uid}/?token=${TOKEN}`;
    const data = await cacheWrap(`aqi-${uid}`, async () => (await axios.get(url)).data);
    if (data.status !== 'ok') {
      return res.status(502).json({ message: 'WAQI error' });
    }
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

export default router;
