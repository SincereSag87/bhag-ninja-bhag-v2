export const TextureKeys = {
  Player: 'tex-player',
  Ground: 'tex-ground',
  Obstacle: 'tex-obstacle',
  Coin: 'tex-coin',
  Enemy: 'tex-enemy',
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];
