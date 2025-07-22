import request from 'supertest';
import { beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

process.env.NODE_ENV = 'test';
process.env.WAQI_TOKEN = 'bad';

const mock = new MockAdapter(axios);

let app: typeof import('../../server/src/index').default;

beforeEach(async () => {
  vi.resetModules();
  app = (await import('../../server/src/index')).default;
  mock.reset();
  mock.onGet(/map\/bounds/).reply(200, { status: 'error', data: 'Invalid key' });
});

afterEach(() => {
  mock.reset();
});

describe('GET /api/nearby invalid token', () => {
  it('returns 502 on invalid token', async () => {
    const res = await request(app).get('/api/nearby');
    expect(res.status).toBe(502);
    expect(res.body.message).toBe('WAQI error');
  });
});
