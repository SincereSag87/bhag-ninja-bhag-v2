export const TextureKeys = {
  Player: 'tex-player',
  PlayerSlide: 'tex-player-slide',
  Ground: 'tex-ground',
  Spike: 'tex-spike',
  Beam: 'tex-beam',
  Coin: 'tex-coin',
  Energy: 'tex-energy',
  Enemy: 'tex-enemy',
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];
