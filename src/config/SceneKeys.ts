export const SceneKeys = {
  Boot: 'Boot',
  Preload: 'Preload',
  Menu: 'Menu',
  Game: 'Game',
  GameOver: 'GameOver',
  HighScores: 'HighScores',
  Settings: 'Settings',
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
