import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig.ts';
import { SceneKeys } from '../config/SceneKeys.ts';
import { getHighScore } from '../systems/HighScoreStore.ts';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    const centerX = GAME_WIDTH / 2;

    this.add
      .text(centerX, GAME_HEIGHT / 2 - 100, 'BHAG NINJA BHAG', {
        fontFamily: 'sans-serif',
        fontSize: '48px',
        color: '#ff6b35',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, GAME_HEIGHT / 2 - 40, `High Score: ${getHighScore()}`, {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(centerX, GAME_HEIGHT / 2 + 40, 'Press SPACE or Tap to Start', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: '#ffd23f',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => this.startGame());
  }

  private startGame(): void {
    this.scene.start(SceneKeys.Game);
  }
}
