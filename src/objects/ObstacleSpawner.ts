import Phaser from 'phaser';
import {
  BEAM_CLEARANCE_ABOVE_GROUND,
  GAME_WIDTH,
  GROUND_Y,
  OBSTACLE_MAX_SPAWN_MS,
  OBSTACLE_MIN_SPAWN_MS,
  RUN_SPEED,
} from '../config/GameConfig.ts';
import { TextureKeys } from '../config/TextureKeys.ts';
import { randomSpawnDelay } from '../systems/ObstacleSpawnTiming.ts';

const SPAWN_X = GAME_WIDTH + 80;
const DESPAWN_X = -120;

type ObstacleType = 'spike' | 'beam';

export class ObstacleSpawner {
  readonly group: Phaser.Physics.Arcade.Group;
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.group = scene.physics.add.group({ allowGravity: false });
    this.scheduleNext();
  }

  update(): void {
    for (const child of this.group.getChildren()) {
      const obstacle = child as Phaser.Physics.Arcade.Sprite;
      if (obstacle.x < DESPAWN_X) {
        obstacle.destroy();
      }
    }
  }

  private scheduleNext(): void {
    const delay = randomSpawnDelay(OBSTACLE_MIN_SPAWN_MS, OBSTACLE_MAX_SPAWN_MS);
    this.scene.time.delayedCall(delay, () => {
      this.spawnObstacle();
      this.scheduleNext();
    });
  }

  private spawnObstacle(): void {
    const type: ObstacleType = Math.random() < 0.5 ? 'spike' : 'beam';
    const y = type === 'spike' ? GROUND_Y : GROUND_Y - BEAM_CLEARANCE_ABOVE_GROUND;
    const texture = type === 'spike' ? TextureKeys.Spike : TextureKeys.Beam;

    const obstacle = this.group.create(SPAWN_X, y, texture) as Phaser.Physics.Arcade.Sprite;
    obstacle.setOrigin(0.5, 1);
    obstacle.setVelocityX(-RUN_SPEED);
  }
}
