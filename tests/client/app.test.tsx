import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import * as api from '../../client/src/services/api';
import App from '../../client/src/App';

vi.spyOn(api, 'fetchStations').mockResolvedValue([]);
vi.spyOn(api, 'fetchAqi').mockResolvedValue({
  status: 'ok',
  data: { aqi: 50, forecast: { daily: { pm25: [] } } },
});

test('renders map and panel', async () => {
  render(<App />);
  expect(await screen.findByTestId('map')).toBeDefined();
  expect(screen.getByTestId('panel')).toBeDefined();
});
