export function randomSpawnDelay(minMs: number, maxMs: number, rng: () => number = Math.random): number {
  return minMs + rng() * (maxMs - minMs);
}
