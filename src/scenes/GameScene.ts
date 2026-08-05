import Phaser from 'phaser';
import {
  COIN_SCORE_VALUE,
  DASH_DURATION_MS,
  DASH_SCORE_BONUS,
  ENERGY_MAX,
  ENERGY_PER_ORB,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_Y,
  HEALTH_MAX,
  HIT_INVULNERABILITY_MS,
  PLAYER_X,
  RUN_SPEED_BASE,
  RUN_SPEED_MAX,
  RUN_SPEED_RAMP_PER_METER,
} from '../config/GameConfig.ts';
import { SceneKeys } from '../config/SceneKeys.ts';
import { TextureKeys } from '../config/TextureKeys.ts';
import { Player } from '../objects/Player.ts';
import { ObstacleSpawner } from '../objects/ObstacleSpawner.ts';
import { PickupSpawner } from '../objects/PickupSpawner.ts';
import { runSpeedForDistance } from '../systems/Difficulty.ts';
import { computeScore } from '../systems/Score.ts';

export interface GameSceneResult {
  score: number;
  distance: number;
}

const HIT_TINT = 0xff4444;
const DASH_TINT = 0x3fd2ff;

export class GameScene extends Phaser.Scene {
  private score = 0;
  private distance = 0;
  private coinsCollected = 0;
  private bonusScore = 0;
  private health = HEALTH_MAX;
  private energy = 0;
  private invulnerableUntil = 0;
  private isGameOver = false;
  private isPaused = false;

  private ground!: Phaser.GameObjects.TileSprite;
  private player!: Player;
  private obstacleSpawner!: ObstacleSpawner;
  private pickupSpawner!: PickupSpawner;
  private pauseOverlay?: Phaser.GameObjects.Container;

  private statsText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private dashReadyText!: Phaser.GameObjects.Text;
  private energyBarBg!: Phaser.GameObjects.Graphics;
  private energyBarFill!: Phaser.GameObjects.Graphics;

  constructor() {
    super(SceneKeys.Game);
  }

  private get isInvulnerable(): boolean {
    return this.time.now < this.invulnerableUntil;
  }

  create(): void {
    this.score = 0;
    this.distance = 0;
    this.coinsCollected = 0;
    this.bonusScore = 0;
    this.health = HEALTH_MAX;
    this.energy = 0;
    this.invulnerableUntil = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.pauseOverlay = undefined;

    this.physics.resume();
    this.time.paused = false;
    this.tweens.resumeAll();

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GROUND_Y);

    this.ground = this.add
      .tileSprite(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y, TextureKeys.Ground)
      .setOrigin(0, 0);

    this.player = new Player(this, PLAYER_X);
    this.obstacleSpawner = new ObstacleSpawner(this, () => this.distance);
    this.pickupSpawner = new PickupSpawner(this, () => this.distance);

    this.physics.add.overlap(this.player, this.obstacleSpawner.group, (_player, hazard) =>
      this.handleHazardHit(hazard as Phaser.Physics.Arcade.Sprite),
    );
    this.physics.add.overlap(this.player, this.pickupSpawner.group, (_player, pickup) =>
      this.handlePickup(pickup as Phaser.Physics.Arcade.Sprite),
    );

    this.createHud();

    this.input.keyboard?.on('keydown-ESC', this.togglePause, this);
    this.input.keyboard?.on('keydown-R', this.handleRestartKey, this);
    this.input.keyboard?.on('keydown-M', this.handleMenuKey, this);
    this.input.keyboard?.on('keydown-SHIFT', this.handleDashInput, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this);
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const deltaSeconds = delta / 1000;
    const speed = runSpeedForDistance(this.distance, RUN_SPEED_BASE, RUN_SPEED_MAX, RUN_SPEED_RAMP_PER_METER);
    this.distance += speed * deltaSeconds;
    this.ground.tilePositionX += speed * deltaSeconds;

    this.player.update();
    this.obstacleSpawner.update();
    this.pickupSpawner.update();

    this.score = computeScore(this.distance, this.coinsCollected, COIN_SCORE_VALUE) + this.bonusScore;
    this.updateHud();
  }

  private handleHazardHit(hazard: Phaser.Physics.Arcade.Sprite): void {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    this.tweens.killTweensOf(hazard);
    hazard.destroy();

    if (this.isInvulnerable) {
      return;
    }

    this.health -= 1;
    this.cameras.main.shake(150, 0.006);

    if (this.health <= 0) {
      this.endRun();
      return;
    }

    this.grantInvulnerability(HIT_INVULNERABILITY_MS);
    this.player.playInvulnerabilityEffect(HIT_INVULNERABILITY_MS, HIT_TINT);
  }

  private handlePickup(pickup: Phaser.Physics.Arcade.Sprite): void {
    const kind = pickup.getData('kind') as 'coin' | 'energy';
    pickup.destroy();

    if (kind === 'coin') {
      this.coinsCollected += 1;
    } else {
      this.energy = Math.min(ENERGY_MAX, this.energy + ENERGY_PER_ORB);
    }
  }

  private handleDashInput(): void {
    if (this.isGameOver || this.isPaused || this.energy < ENERGY_MAX) {
      return;
    }

    this.energy = 0;
    this.bonusScore += DASH_SCORE_BONUS;
    this.grantInvulnerability(DASH_DURATION_MS);
    this.player.playInvulnerabilityEffect(DASH_DURATION_MS, DASH_TINT);
  }

  private grantInvulnerability(durationMs: number): void {
    this.invulnerableUntil = Math.max(this.invulnerableUntil, this.time.now + durationMs);
  }

  private togglePause(event?: KeyboardEvent): void {
    if (this.isGameOver || event?.repeat) {
      return;
    }

    this.isPaused = !this.isPaused;
    this.player.setPaused(this.isPaused);

    if (this.isPaused) {
      this.physics.pause();
      this.time.paused = true;
      this.tweens.pauseAll();
      this.showPauseOverlay();
    } else {
      this.physics.resume();
      this.time.paused = false;
      this.tweens.resumeAll();
      this.hidePauseOverlay();
    }
  }

  private handleRestartKey(): void {
    if (!this.isPaused) {
      return;
    }
    this.scene.start(SceneKeys.Game);
  }

  private handleMenuKey(): void {
    if (!this.isPaused) {
      return;
    }
    this.scene.start(SceneKeys.Menu);
  }

  private showPauseOverlay(): void {
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'PAUSED', {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        color: '#ff6b35',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    const help = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'ESC Resume   |   R Restart   |   M Menu', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#ffd23f',
      })
      .setOrigin(0.5);
    this.pauseOverlay = this.add.container(0, 0, [bg, title, help]);
  }

  private hidePauseOverlay(): void {
    this.pauseOverlay?.destroy(true);
    this.pauseOverlay = undefined;
  }

  private createHud(): void {
    this.statsText = this.add.text(16, 16, '', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    });

    this.healthText = this.add.text(16, 42, '', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#ff5566',
    });

    this.energyBarBg = this.add.graphics();
    this.energyBarFill = this.add.graphics();

    this.dashReadyText = this.add
      .text(GAME_WIDTH - 16, 40, 'SHIFT: DASH READY', {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#3fd2ff',
      })
      .setOrigin(1, 0)
      .setVisible(false);

    this.updateHud();
  }

  private updateHud(): void {
    this.statsText.setText(`Score: ${Math.floor(this.score)}   Distance: ${Math.floor(this.distance)}m`);

    const health = Math.max(0, this.health);
    this.healthText.setText('♥'.repeat(health) + '♡'.repeat(HEALTH_MAX - health));

    const barX = GAME_WIDTH - 176;
    const barY = 16;
    const barWidth = 160;
    const barHeight = 18;

    this.energyBarBg.clear();
    this.energyBarBg.fillStyle(0x2a2a3d, 1);
    this.energyBarBg.fillRect(barX, barY, barWidth, barHeight);

    const fillRatio = this.energy / ENERGY_MAX;
    this.energyBarFill.clear();
    this.energyBarFill.fillStyle(this.energy >= ENERGY_MAX ? DASH_TINT : 0x2a7f99, 1);
    this.energyBarFill.fillRect(barX + 2, barY + 2, (barWidth - 4) * fillRatio, barHeight - 4);

    this.dashReadyText.setVisible(this.energy >= ENERGY_MAX);
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

  private handleSceneShutdown(): void {
    this.input.keyboard?.off('keydown-ESC', this.togglePause, this);
    this.input.keyboard?.off('keydown-R', this.handleRestartKey, this);
    this.input.keyboard?.off('keydown-M', this.handleMenuKey, this);
    this.input.keyboard?.off('keydown-SHIFT', this.handleDashInput, this);
  }
}
