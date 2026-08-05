import { describe, expect, it } from 'vitest';
import { computeScore } from '../systems/Score.ts';

describe('computeScore', () => {
  it('scores distance alone when no coins are collected', () => {
    expect(computeScore(342.9, 0, 25)).toBe(342);
  });

  it('adds a flat bonus per coin collected', () => {
    expect(computeScore(100, 4, 25)).toBe(200);
  });

  it('floors fractional distance before adding coin value', () => {
    expect(computeScore(99.99, 1, 25)).toBe(124);
  });
});
