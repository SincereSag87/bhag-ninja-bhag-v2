import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y, RUN_SPEED } from '../config/GameConfig.ts';
import { SceneKeys } from '../config/SceneKeys.ts';
import { TextureKeys } from '../config/TextureKeys.ts';
import { Player } from '../objects/Player.ts';
import { ObstacleSpawner } from '../objects/ObstacleSpawner.ts';

export interface GameSceneResult {
  score: number;
  distance: number;
}

export class GameScene extends Phaser.Scene {
  private score = 0;
  private distance = 0;
  private isGameOver = false;
  private hudText!: Phaser.GameObjects.Text;
  private ground!: Phaser.GameObjects.TileSprite;
  private player!: Player;
  private obstacleSpawner!: ObstacleSpawner;

  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    this.score = 0;
    this.distance = 0;
    this.isGameOver = false;

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GROUND_Y);

    this.ground = this.add
      .tileSprite(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y, TextureKeys.Ground)
      .setOrigin(0, 0);

    this.player = new Player(this, 160);
    this.obstacleSpawner = new ObstacleSpawner(this);

    this.physics.add.overlap(
      this.player,
      this.obstacleSpawner.group,
      () => this.endRun(),
      undefined,
      this,
    );

    this.hudText = this.add.text(16, 16, '', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    });
    this.updateHud();

    this.input.keyboard?.once('keydown-ESC', () => this.endRun());
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) {
      return;
    }

    const deltaSeconds = delta / 1000;
    this.distance += RUN_SPEED * deltaSeconds;
    this.ground.tilePositionX += RUN_SPEED * deltaSeconds;

    this.player.update();
    this.obstacleSpawner.update();
    this.updateHud();
  }

  private updateHud(): void {
    this.hudText.setText(`Score: ${this.score}   Distance: ${Math.floor(this.distance)}m`);
  }

  private endRun(): void {
    if (this.isGameOver) {
      return;
    }
    this.isGameOver = true;
    this.physics.pause();

    const result: GameSceneResult = { score: this.score, distance: this.distance };
    this.time.delayedCall(200, () => this.scene.start(SceneKeys.GameOver, result));
  }
}
