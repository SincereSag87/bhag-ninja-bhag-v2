import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from '../config/GameConfig.ts';
import { SceneKeys } from '../config/SceneKeys.ts';
import { TextureKeys } from '../config/TextureKeys.ts';

export interface GameSceneResult {
  score: number;
  distance: number;
}

export class GameScene extends Phaser.Scene {
  private score = 0;
  private distance = 0;
  private hudText!: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    this.score = 0;
    this.distance = 0;

    this.add
      .tileSprite(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y, TextureKeys.Ground)
      .setOrigin(0, 0);

    this.add.image(120, GROUND_Y - 32, TextureKeys.Player);

    this.hudText = this.add.text(16, 16, '', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    });
    this.updateHud();

    this.add.text(GAME_WIDTH / 2, 16, 'Foundation build — press ESC to end the run', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#8888aa',
    }).setOrigin(0.5, 0);

    this.input.keyboard?.once('keydown-ESC', () => this.endRun());
  }

  private updateHud(): void {
    this.hudText.setText(`Score: ${this.score}   Distance: ${Math.floor(this.distance)}m`);
  }

  private endRun(): void {
    const result: GameSceneResult = { score: this.score, distance: this.distance };
    this.scene.start(SceneKeys.GameOver, result);
  }
}
