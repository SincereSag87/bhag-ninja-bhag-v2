export function runSpeedForDistance(
  distanceMeters: number,
  base: number,
  max: number,
  rampPerMeter: number,
): number {
  return Math.min(max, base + distanceMeters * rampPerMeter);
}

export interface SpawnRange {
  min: number;
  max: number;
}

export function spawnRangeForDistance(
  distanceMeters: number,
  baseMin: number,
  baseMax: number,
  floorMin: number,
  floorMax: number,
  rampPerMeter: number,
): SpawnRange {
  const reduction = distanceMeters * rampPerMeter;
  return {
    min: Math.max(floorMin, baseMin - reduction),
    max: Math.max(floorMax, baseMax - reduction),
  };
}
