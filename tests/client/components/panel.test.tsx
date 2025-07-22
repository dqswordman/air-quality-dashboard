import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import * as api from '../../../client/src/services/api';
import Panel from '../../../client/src/components/Panel';

vi.spyOn(api, 'fetchAqi').mockResolvedValue({
  status: 'ok',
  data: { aqi: 10, forecast: { daily: { pm25: [] } } },
});

test('renders refresh button', () => {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <Panel uid={1} />
    </QueryClientProvider>,
  );
  expect(screen.getByRole('button', { name: /refresh/i })).toBeDefined();
});
