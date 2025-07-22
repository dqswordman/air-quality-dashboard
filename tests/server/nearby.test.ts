import request from 'supertest';
import { vi } from 'vitest';
import axios from 'axios';

process.env.NODE_ENV = 'test';
process.env.WAQI_TOKEN = 'test';

beforeEach(async () => {
  vi.resetModules();
  app = (await import('../../server/src/index')).default;
});

let app: typeof import('../../server/src/index').default;

vi.mock('axios');
const mockedGet = vi.mocked(axios.get);

describe('GET /api/nearby', () => {
  it('returns only Thailand stations', async () => {
    mockedGet.mockResolvedValueOnce({
      status: 200,
      data: {
        status: 'ok',
        data: [
          { uid: 1, lat: 10, lon: 100, aqi: '10', station: { name: 'Bangkok Thailand' } },
        ],
      },
    });
    const res = await request(app).get('/api/nearby');
    expect(res.status).toBe(200);
    expect(
      res.body.data.every((s: { station: { name: string } }) =>
        s.station.name.includes('Thailand'),
      ),
    ).toBeTruthy();
  });

  it('returns 502 on error', async () => {
    await new Promise((r) => setTimeout(r, 1100));
    mockedGet.mockResolvedValueOnce({
      status: 200,
      data: { status: 'error', data: 'Invalid key' },
    });
    const res = await request(app).get('/api/nearby');
    expect(res.status).toBe(502);
    expect(res.body.detail.data).toContain('Invalid key');
  });
});
