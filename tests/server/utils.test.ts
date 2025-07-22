import { describe, it, expect } from 'vitest';
import { inThailand, isThaiStation } from '../../server/src/utils/isThailand';

describe('isThailand utils', () => {
  it('detects coordinates in Thailand', () => {
    expect(inThailand(13, 100)).toBe(true);
    expect(inThailand(0, 0)).toBe(false);
  });

  it('detects station name keywords', () => {
    expect(isThaiStation('Bangkok Thailand', 0, 0)).toBe(true);
    expect(isThaiStation('Somewhere', 13, 100)).toBe(true);
    expect(isThaiStation('Somewhere', 0, 0)).toBe(false);
  });
});
