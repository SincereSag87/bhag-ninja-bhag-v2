export function computeScore(distanceMeters: number, coinsCollected: number, coinValue: number): number {
  return Math.floor(distanceMeters) + coinsCollected * coinValue;
}
