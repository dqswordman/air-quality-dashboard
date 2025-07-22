import request from 'supertest';
import { vi } from 'vitest';
import axios from 'axios';

process.env.NODE_ENV = 'test';
process.env.WAQI_TOKEN = 'bad';

vi.mock('axios');
const mockedGet = vi.mocked(axios.get);

let app: typeof import('../../server/src/index').default;

beforeEach(async () => {
  vi.resetModules();
  app = (await import('../../server/src/index')).default;
});

describe('GET /api/nearby invalid token', () => {
  mockedGet.mockResolvedValue({ data: { status: 'error', data: 'Invalid key' } });

  it('returns 502 on invalid token', async () => {
    const res = await request(app).get('/api/nearby');
    expect(res.status).toBe(502);
    expect(res.body.message).toBe('WAQI error');
  });
});
