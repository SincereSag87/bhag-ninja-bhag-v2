import { describe, expect, it } from 'vitest';
import { randomSpawnDelay } from '../systems/ObstacleSpawnTiming.ts';

describe('randomSpawnDelay', () => {
  it('returns the minimum when rng produces 0', () => {
    expect(randomSpawnDelay(900, 1600, () => 0)).toBe(900);
  });

  it('returns the maximum when rng produces just under 1', () => {
    expect(randomSpawnDelay(900, 1600, () => 0.9999999)).toBeCloseTo(1600, 0);
  });

  it('stays within bounds across the rng range', () => {
    for (let i = 0; i <= 10; i++) {
      const value = randomSpawnDelay(900, 1600, () => i / 10);
      expect(value).toBeGreaterThanOrEqual(900);
      expect(value).toBeLessThanOrEqual(1600);
    }
  });
});
