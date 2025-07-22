import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchAqi, fetchStations } from '../../../client/src/services/api';

describe('api services', () => {
  const mock = new MockAdapter(axios);
  afterEach(() => {
    mock.reset();
  });

  it('builds correct url for fetchStations', async () => {
    mock.onGet('/api/nearby').reply(200, { status: 'ok', data: [] });
    const data = await fetchStations();
    expect(data).toEqual([]);
    expect(mock.history.get[0]?.url).toBe('/api/nearby');
  });

  it('builds correct url for fetchAqi and returns json', async () => {
    mock
      .onGet('/api/aqi/1')
      .reply(200, { status: 'ok', data: { aqi: 10, forecast: { daily: { pm25: [] } } } });
    const res = await fetchAqi(1);
    expect(res.status).toBe('ok');
    expect(res.data.aqi).toBe(10);
    expect(mock.history.get[0]?.url).toBe('/api/aqi/1');
  });
});
