import Phaser from 'phaser';
import {
  COIN_HEIGHT_ABOVE_GROUND,
  ENERGY_HEIGHT_ABOVE_GROUND,
  GAME_WIDTH,
  GROUND_Y,
  PICKUP_ENERGY_CHANCE,
  PICKUP_MAX_SPAWN_MS,
  PICKUP_MIN_SPAWN_MS,
  RUN_SPEED_BASE,
  RUN_SPEED_MAX,
  RUN_SPEED_RAMP_PER_METER,
} from '../config/GameConfig.ts';
import { TextureKeys } from '../config/TextureKeys.ts';
import { runSpeedForDistance } from '../systems/Difficulty.ts';
import { randomSpawnDelay } from '../systems/ObstacleSpawnTiming.ts';

const SPAWN_X = GAME_WIDTH + 80;
const DESPAWN_X = -80;

export type PickupKind = 'coin' | 'energy';

export class PickupSpawner {
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
      const pickup = child as Phaser.Physics.Arcade.Sprite;
      if (pickup.x < DESPAWN_X) {
        pickup.destroy();
      }
    }
  }

  private scheduleNext(): void {
    const delay = randomSpawnDelay(PICKUP_MIN_SPAWN_MS, PICKUP_MAX_SPAWN_MS);
    this.scene.time.delayedCall(delay, () => {
      this.spawnPickup();
      this.scheduleNext();
    });
  }

  private spawnPickup(): void {
    const kind: PickupKind = Math.random() < PICKUP_ENERGY_CHANCE ? 'energy' : 'coin';
    const heightAboveGround = kind === 'coin' ? COIN_HEIGHT_ABOVE_GROUND : ENERGY_HEIGHT_ABOVE_GROUND;
    const texture = kind === 'coin' ? TextureKeys.Coin : TextureKeys.Energy;

    const pickup = this.group.create(SPAWN_X, GROUND_Y - heightAboveGround, texture) as Phaser.Physics.Arcade.Sprite;
    pickup.setData('kind', kind);

    const speed = runSpeedForDistance(this.getDistance(), RUN_SPEED_BASE, RUN_SPEED_MAX, RUN_SPEED_RAMP_PER_METER);
    pickup.setVelocityX(-speed);
  }
}
