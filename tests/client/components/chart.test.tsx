import { render } from '@testing-library/react';
import Chart from '../../../client/src/components/Chart';

test('renders chart svg', () => {
  const { container } = render(<Chart history={[{ avg: 1, day: '2024-01-01' }]} />);
  expect(container.querySelector('svg')).toBeTruthy();
});
