import Phaser from 'phaser';
import {
  BOSS_DURATION_MS,
  BOSS_HEIGHT,
  BOSS_PROJECTILE_MAX_MS,
  BOSS_PROJECTILE_MIN_MS,
  GAME_WIDTH,
  GROUND_Y,
  RUN_SPEED_MAX,
} from '../config/GameConfig.ts';
import { TextureKeys } from '../config/TextureKeys.ts';
import { randomSpawnDelay } from '../systems/ObstacleSpawnTiming.ts';

const HOVER_X = GAME_WIDTH - 160;
const HOVER_Y = GROUND_Y - BOSS_HEIGHT / 2 - 40;
const PROJECTILE_SPEED = RUN_SPEED_MAX + 140;

export class BossEncounter {
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly scene: Phaser.Scene;
  private readonly hazardGroup: Phaser.Physics.Arcade.Group;
  private elapsedMs = 0;
  private nextProjectileInMs: number;
  private active = true;

  constructor(scene: Phaser.Scene, hazardGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.hazardGroup = hazardGroup;

    this.sprite = scene.add.sprite(GAME_WIDTH + 100, HOVER_Y, TextureKeys.Boss).setOrigin(0.5);
    scene.tweens.add({ targets: this.sprite, x: HOVER_X, duration: 900, ease: 'Back.easeOut' });
    scene.tweens.add({
      targets: this.sprite,
      y: HOVER_Y - 14,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 900,
    });

    this.nextProjectileInMs = randomSpawnDelay(BOSS_PROJECTILE_MIN_MS, BOSS_PROJECTILE_MAX_MS) + 900;
  }

  get progress(): number {
    return Phaser.Math.Clamp(this.elapsedMs / BOSS_DURATION_MS, 0, 1);
  }

  get isComplete(): boolean {
    return this.elapsedMs >= BOSS_DURATION_MS;
  }

  update(deltaMs: number): void {
    if (!this.active) {
      return;
    }

    this.elapsedMs += deltaMs;
    this.nextProjectileInMs -= deltaMs;

    if (this.nextProjectileInMs <= 0) {
      this.fireProjectile();
      this.nextProjectileInMs = randomSpawnDelay(BOSS_PROJECTILE_MIN_MS, BOSS_PROJECTILE_MAX_MS);
    }
  }

  private fireProjectile(): void {
    const high = Math.random() < 0.5;
    const y = high ? HOVER_Y + 10 : GROUND_Y;

    const projectile = this.hazardGroup.create(
      this.sprite.x - 20,
      y,
      TextureKeys.BossBolt,
    ) as Phaser.Physics.Arcade.Sprite;
    projectile.setOrigin(0.5, high ? 0.5 : 1);
    projectile.setVelocityX(-PROJECTILE_SPEED);
  }

  finish(): void {
    this.active = false;
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.sprite.x + 240,
      alpha: 0,
      duration: 500,
      onComplete: () => this.sprite.destroy(),
    });
  }
}
