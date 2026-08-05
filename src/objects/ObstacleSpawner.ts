import Phaser from 'phaser';
import {
  BEAM_CLEARANCE_ABOVE_GROUND,
  GAME_WIDTH,
  GROUND_Y,
  OBSTACLE_MAX_SPAWN_MS,
  OBSTACLE_MAX_SPAWN_MS_FLOOR,
  OBSTACLE_MIN_SPAWN_MS,
  OBSTACLE_MIN_SPAWN_MS_FLOOR,
  OBSTACLE_SPAWN_RAMP_PER_METER,
  RUN_SPEED_BASE,
  RUN_SPEED_MAX,
  RUN_SPEED_RAMP_PER_METER,
} from '../config/GameConfig.ts';
import { TextureKeys } from '../config/TextureKeys.ts';
import { runSpeedForDistance, spawnRangeForDistance } from '../systems/Difficulty.ts';
import { randomSpawnDelay } from '../systems/ObstacleSpawnTiming.ts';

const SPAWN_X = GAME_WIDTH + 80;
const DESPAWN_X = -120;

type ObstacleType = 'spike' | 'beam' | 'enemy';

function pickObstacleType(): ObstacleType {
  const roll = Math.random();
  if (roll < 0.4) return 'spike';
  if (roll < 0.75) return 'beam';
  return 'enemy';
}

export class ObstacleSpawner {
  readonly group: Phaser.Physics.Arcade.Group;
  private readonly scene: Phaser.Scene;
  private readonly getDistance: () => number;

  constructor(scene: Phaser.Scene, getDistance: () => number) {
    this.scene = scene;
    this.getDistance = getDistance;
    this.group = scene.physics.add.group({ allowGravity: false });
    this.scheduleNext();
  }

  update(): void {
    for (const child of this.group.getChildren()) {
      const obstacle = child as Phaser.Physics.Arcade.Sprite;
      if (obstacle.x < DESPAWN_X) {
        this.scene.tweens.killTweensOf(obstacle);
        obstacle.destroy();
      }
    }
  }

  private scheduleNext(): void {
    const range = spawnRangeForDistance(
      this.getDistance(),
      OBSTACLE_MIN_SPAWN_MS,
      OBSTACLE_MAX_SPAWN_MS,
      OBSTACLE_MIN_SPAWN_MS_FLOOR,
      OBSTACLE_MAX_SPAWN_MS_FLOOR,
      OBSTACLE_SPAWN_RAMP_PER_METER,
    );
    const delay = randomSpawnDelay(range.min, range.max);
    this.scene.time.delayedCall(delay, () => {
      this.spawnObstacle();
      this.scheduleNext();
    });
  }

  private spawnObstacle(): void {
    const type = pickObstacleType();
    const y = type === 'beam' ? GROUND_Y - BEAM_CLEARANCE_ABOVE_GROUND : GROUND_Y;
    const texture =
      type === 'spike' ? TextureKeys.Spike : type === 'beam' ? TextureKeys.Beam : TextureKeys.Enemy;

    const obstacle = this.group.create(SPAWN_X, y, texture) as Phaser.Physics.Arcade.Sprite;
    obstacle.setOrigin(0.5, 1);

    const speed = runSpeedForDistance(this.getDistance(), RUN_SPEED_BASE, RUN_SPEED_MAX, RUN_SPEED_RAMP_PER_METER);
    obstacle.setVelocityX(-speed);

    if (type === 'enemy') {
      this.scene.tweens.add({
        targets: obstacle,
        y: y - 10,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
}
