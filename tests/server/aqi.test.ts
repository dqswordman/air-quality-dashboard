import request from 'supertest';
import { vi } from 'vitest';
import axios from 'axios';
import app from '../../server/src/index';

vi.mock('axios');
const mockedGet = vi.mocked(axios.get);

describe('GET /api/aqi/:uid', () => {
  mockedGet.mockResolvedValue({
    data: { status: 'ok', data: { aqi: 10, forecast: { daily: { pm25: [] } } } },
  });

  it('returns aqi data', async () => {
    const res = await request(app).get('/api/aqi/1');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.data.aqi).toBe(10);
  });
});
