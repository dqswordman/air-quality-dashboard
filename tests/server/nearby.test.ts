import request from 'supertest';
import { vi } from 'vitest';
import axios from 'axios';
import app from '../../server/src/index';

vi.mock('axios');
const mockedGet = vi.mocked(axios.get);

describe('GET /api/nearby', () => {
  mockedGet.mockResolvedValue({
    data: {
      status: 'ok',
      data: [
        { uid: 1, lat: 10, lon: 100, aqi: '10', station: { name: 'Bangkok Thailand' } },
      ],
    },
  });

  it('returns only Thailand stations', async () => {
    const res = await request(app).get('/api/nearby');
    expect(res.status).toBe(200);
    expect(
      res.body.data.every((s: { station: { name: string } }) =>
        s.station.name.includes('Thailand'),
      ),
    ).toBeTruthy();
  });
});
