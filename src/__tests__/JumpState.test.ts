import { describe, expect, it } from 'vitest';
import { canJump, jumpVelocity } from '../systems/JumpState.ts';

describe('JumpState', () => {
  it('allows jumping while jumps used is below the max', () => {
    expect(canJump(0, 2)).toBe(true);
    expect(canJump(1, 2)).toBe(true);
  });

  it('disallows jumping once the max jumps are used', () => {
    expect(canJump(2, 2)).toBe(false);
    expect(canJump(3, 2)).toBe(false);
  });

  it('uses the primary velocity for the first jump', () => {
    expect(jumpVelocity(0, -720, -620)).toBe(-720);
  });

  it('uses the double-jump velocity for subsequent jumps', () => {
    expect(jumpVelocity(1, -720, -620)).toBe(-620);
  });
});
