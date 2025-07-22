import request from 'supertest';
import { beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

process.env.NODE_ENV = 'test';
process.env.WAQI_TOKEN = 'test';

let app: typeof import('../../server/src/index').default;
const mock = new MockAdapter(axios);

beforeEach(async () => {
  vi.resetModules();
  app = (await import('../../server/src/index')).default;
  mock.reset();
});

afterEach(() => {
  mock.reset();
});

describe('GET /api/nearby', () => {
  it('returns only Thailand stations', async () => {
    mock.onGet(/map\/bounds/).reply(200, {
      status: 'ok',
      data: [
        {
          uid: 1,
          lat: 10,
          lon: 100,
          aqi: '10',
          station: { name: 'Bangkok Thailand' },
        },
      ],
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
    mock.onGet(/map\/bounds/).reply(200, { status: 'error', data: 'Invalid key' });
    const res = await request(app).get('/api/nearby');
    expect(res.status).toBe(502);
    expect(JSON.stringify(res.body.detail)).toContain('Invalid key');
  });
});
