import { render } from '@testing-library/react';
import Gauge from '../../../client/src/components/Gauge';

test('renders gauge svg', () => {
  const { container } = render(<Gauge aqi={42} />);
  expect(container.querySelector('svg')).toBeTruthy();
});
