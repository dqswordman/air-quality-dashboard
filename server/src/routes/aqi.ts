import { Router } from 'express';
import axios from 'axios';
import { cache } from '../cache';
import { isThaiStation } from '../utils/isThailand';

const router = Router();
const TOKEN = (process.env.WAQI_TOKEN ?? '').trim();

interface BoundsStation {
  uid: number;
  lat: number;
  lon: number;
  aqi: string;
  station: { name: string };
}

router.get('/nearby', async (_req, res) => {
  const url =
    'https://api.waqi.info/map/bounds/?latlng=5.613,97.343,20.465,105.637&token=' +
    encodeURIComponent(TOKEN);
  try {
    const { data } = await axios.get(url, { timeout: 8000 });
    if (data.status !== 'ok') {
      // eslint-disable-next-line no-console
      console.error(data);
      return res.status(502).json({ message: 'WAQI error', detail: data });
    }
    cache.set('nearby', data);
    const list = (data.data as BoundsStation[]).filter((s) =>
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
    const cacheKey = `aqi-${uid}`;
    const cached = cache.get<unknown>(cacheKey) as { status?: string } | undefined;
    if (cached && cached.status === 'ok') {
      return res.json(cached);
    }
    const url =
      `https://api.waqi.info/feed/@${uid}/?token=` + encodeURIComponent(TOKEN);
    const { data } = await axios.get(url);
    if (data.status !== 'ok') {
      // eslint-disable-next-line no-console
      console.error(data);
      return res.status(502).json({ message: 'WAQI error', detail: data });
    }
    cache.set(cacheKey, data);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

export default router;
