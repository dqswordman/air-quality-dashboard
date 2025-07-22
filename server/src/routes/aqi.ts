import { Router } from 'express';
import axios from 'axios';
import cache from '../cache';
import { isThaiStation } from '../utils/isThailand';

const router = Router();
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

router.get('/nearby', async (_req, res) => {
  const url = `https://api.waqi.info/map/bounds/?latlng=5.613,97.343,20.465,105.637&token=${TOKEN}`;
  try {
    const json = await cacheWrap('nearby', async () => (await axios.get(url)).data);
    if (json.status !== 'ok') {
      // eslint-disable-next-line no-console
      console.error(json);
      return res.status(502).json({ message: 'WAQI error', detail: json });
    }
    const list = (json.data as BoundsStation[]).filter((s) =>
      isThaiStation(s.station.name, s.lat, s.lon),
    );
    return res.json({ status: 'ok', data: list });
  } catch (err: unknown) {
    const detail = axios.isAxiosError(err)
      ? err.response?.data ?? err.message
      : (err as Error).message;
    // eslint-disable-next-line no-console
    console.error(detail);
    return res.status(502).json({
      message: 'WAQI error',
      detail,
    });
  }
});

router.get('/aqi/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params;
    const url = `https://api.waqi.info/feed/@${uid}/?token=${TOKEN}`;
    const data = await cacheWrap(`aqi-${uid}`, async () => (await axios.get(url)).data);
    if (data.status !== 'ok') {
      // eslint-disable-next-line no-console
      console.error(data);
      return res.status(502).json({ message: 'WAQI error', detail: data });
    }
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

export default router;
