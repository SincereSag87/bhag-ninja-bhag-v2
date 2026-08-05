export function canJump(jumpsUsed: number, maxJumps: number): boolean {
  return jumpsUsed < maxJumps;
}

export function jumpVelocity(jumpsUsed: number, primaryVelocity: number, doubleVelocity: number): number {
  return jumpsUsed === 0 ? primaryVelocity : doubleVelocity;
}
