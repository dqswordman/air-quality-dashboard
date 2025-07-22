import request from 'supertest';
import { vi } from 'vitest';
import axios from 'axios';

process.env.NODE_ENV = 'test';
process.env.WAQI_TOKEN = 'bad';

vi.mock('axios');
const mockedGet = vi.mocked(axios.get);

import app from '../../server/src/index';

describe('GET /api/nearby invalid token', () => {
  mockedGet.mockResolvedValue({ data: { status: 'error', data: 'Invalid key' } });

  it('returns 502 on invalid token', async () => {
    const res = await request(app).get('/api/nearby');
    expect(res.status).toBe(502);
    expect(res.body.message).toBe('WAQI error');
  });
});
