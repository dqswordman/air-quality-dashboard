import { render } from '@testing-library/react';
import App from '../../client/src/App';

test('renders map and panel', () => {
  const { getByTestId } = render(<App />);
  expect(getByTestId('map')).toBeDefined();
  expect(getByTestId('panel')).toBeDefined();
});
