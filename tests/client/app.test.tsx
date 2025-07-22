import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../client/src/components/Map', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ onSelect }: { onSelect: (id: number) => void }) => (
      <div data-testid="map">
        <button data-testid="marker" onClick={() => onSelect(1)}></button>
      </div>
    ),
  };
});

import * as api from '../../client/src/services/api';
import App from '../../client/src/App';

const fetchStations = vi
  .spyOn(api, 'fetchStations')
  .mockResolvedValue([]);
const fetchAqi = vi.spyOn(api, 'fetchAqi').mockResolvedValue({
  status: 'ok',
  data: { aqi: 50, forecast: { daily: { pm25: [] } } },
});

test('renders map and panel', async () => {
  render(<App />);
  expect(await screen.findByTestId('map')).toBeDefined();
  expect(screen.getByTestId('panel')).toBeDefined();
});

test('clicking bubble updates panel', async () => {
  fetchStations.mockResolvedValueOnce([
    { uid: 1, lat: 0, lon: 0, aqi: '10', station: { name: 'Bangkok Thailand' } },
  ]);
  render(<App />);
  const marker = await screen.findByTestId('marker');
  fireEvent.click(marker);
  await waitFor(() => {
    expect(fetchAqi).toHaveBeenCalledWith(1);
  });
});
