import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './GameConfig.ts';
import { BootScene } from '../scenes/BootScene.ts';
import { PreloadScene } from '../scenes/PreloadScene.ts';
import { MenuScene } from '../scenes/MenuScene.ts';
import { GameScene } from '../scenes/GameScene.ts';
import { GameOverScene } from '../scenes/GameOverScene.ts';
import { HighScoresScene } from '../scenes/HighScoresScene.ts';
import { SettingsScene } from '../scenes/SettingsScene.ts';

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#10101c',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1600 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, GameOverScene, HighScoresScene, SettingsScene],
};
