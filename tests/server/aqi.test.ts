import request from 'supertest';
import { vi } from 'vitest';
import axios from 'axios';

process.env.NODE_ENV = 'test';
process.env.WAQI_TOKEN = 'test';

let app: typeof import('../../server/src/index').default;

beforeEach(async () => {
  vi.resetModules();
  app = (await import('../../server/src/index')).default;
});

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

  it('returns 502 on invalid token', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { status: 'error', data: 'Invalid key' },
    });
    const res = await request(app).get('/api/aqi/1');
    expect(res.status).toBe(502);
    expect(res.body.detail.data).toContain('Invalid key');
  });
});
