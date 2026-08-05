import { describe, expect, it } from 'vitest';
import { runSpeedForDistance, spawnRangeForDistance } from '../systems/Difficulty.ts';

describe('runSpeedForDistance', () => {
  it('returns the base speed at zero distance', () => {
    expect(runSpeedForDistance(0, 380, 680, 0.6)).toBe(380);
  });

  it('ramps up linearly with distance', () => {
    expect(runSpeedForDistance(100, 380, 680, 0.6)).toBe(440);
  });

  it('clamps at the max speed', () => {
    expect(runSpeedForDistance(10_000, 380, 680, 0.6)).toBe(680);
  });
});

describe('spawnRangeForDistance', () => {
  it('returns the base range at zero distance', () => {
    expect(spawnRangeForDistance(0, 900, 1600, 500, 900, 0.35)).toEqual({ min: 900, max: 1600 });
  });

  it('shrinks the range as distance increases', () => {
    const range = spawnRangeForDistance(1000, 900, 1600, 500, 900, 0.35);
    expect(range.min).toBeLessThan(900);
    expect(range.max).toBeLessThan(1600);
  });

  it('clamps both bounds at their floor', () => {
    const range = spawnRangeForDistance(100_000, 900, 1600, 500, 900, 0.35);
    expect(range).toEqual({ min: 500, max: 900 });
  });
});
