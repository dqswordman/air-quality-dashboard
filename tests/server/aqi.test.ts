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
  mock.onGet(/feed/).reply(200, {
    status: 'ok',
    data: { aqi: 10, forecast: { daily: { pm25: [] } } },
  });
});
afterEach(() => {
  mock.reset();
});

describe('GET /api/aqi/:uid', () => {

  it('returns aqi data', async () => {
    const res = await request(app).get('/api/aqi/1');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.data.aqi).toBe(10);
  });

  it('returns 502 on invalid token', async () => {
    mock.onGet(/feed/).reply(200, { status: 'error', data: 'Invalid key' });
    const res = await request(app).get('/api/aqi/1');
    expect(res.status).toBe(502);
    expect(JSON.stringify(res.body.detail)).toContain('Invalid key');
  });
});
