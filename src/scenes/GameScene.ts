import Phaser from 'phaser';
import {
  BOSS_GRACE_MS,
  BOSS_INTERVAL_METERS,
  BOSS_SCORE_BONUS,
  BOSS_TRIGGER_DISTANCE,
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
import { BossEncounter } from '../objects/BossEncounter.ts';
import { TouchControls } from '../objects/TouchControls.ts';
import { audioSystem } from '../systems/AudioSystem.ts';
import { runSpeedForDistance } from '../systems/Difficulty.ts';
import { computeScore } from '../systems/Score.ts';

export interface GameSceneResult {
  score: number;
  distance: number;
}

const HIT_TINT = 0xff4444;
const DASH_TINT = 0x3fd2ff;
const COIN_TINT = 0xffd23f;

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
  private fxEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private boss?: BossEncounter;
  private nextBossDistance = BOSS_TRIGGER_DISTANCE;
  private bossLabelText?: Phaser.GameObjects.Text;
  private bossBarBg?: Phaser.GameObjects.Graphics;
  private bossBarFill?: Phaser.GameObjects.Graphics;

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
    this.boss = undefined;
    this.nextBossDistance = BOSS_TRIGGER_DISTANCE;
    this.bossLabelText = undefined;
    this.bossBarBg = undefined;
    this.bossBarFill = undefined;

    this.physics.resume();
    this.time.paused = false;
    this.tweens.resumeAll();

    audioSystem.unlock();

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GROUND_Y);

    this.ground = this.add
      .tileSprite(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y, TextureKeys.Ground)
      .setOrigin(0, 0);

    this.fxEmitter = this.add.particles(0, 0, TextureKeys.Spark, {
      lifespan: 400,
      speed: { min: 80, max: 220 },
      scale: { start: 1, end: 0 },
      tint: 0xffffff,
      emitting: false,
    });
    this.fxEmitter.setDepth(500);

    this.dustEmitter = this.add.particles(0, 0, TextureKeys.Spark, {
      lifespan: 260,
      speed: { min: 20, max: 70 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.5, end: 0 },
      tint: 0x777788,
      frequency: 70,
      emitting: false,
    });

    const isTouch = this.sys.game.device.input.touch;
    this.player = new Player(this, PLAYER_X, { enablePointerJump: !isTouch });
    this.obstacleSpawner = new ObstacleSpawner(this, () => this.distance);
    this.pickupSpawner = new PickupSpawner(this, () => this.distance);

    if (isTouch) {
      new TouchControls(this, {
        onJump: () => this.player.jump(),
        onSlide: () => this.player.slide(),
        onPause: () => this.togglePause(),
      });
    }

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

    this.dustEmitter.setPosition(this.player.x - 10, GROUND_Y - 2);
    this.dustEmitter.emitting = this.player.isGrounded;

    if (!this.boss && this.distance >= this.nextBossDistance) {
      this.startBossEncounter();
    }

    if (this.boss) {
      this.boss.update(delta);
      this.updateBossHud();
      if (this.boss.isComplete) {
        this.finishBossEncounter();
      }
    }

    this.score = computeScore(this.distance, this.coinsCollected, COIN_SCORE_VALUE) + this.bonusScore;
    this.updateHud();
  }

  private burst(x: number, y: number, tint: number, count = 10): void {
    this.fxEmitter.setParticleTint(tint);
    this.fxEmitter.explode(count, x, y);
  }

  private popAndDestroy(target: Phaser.Physics.Arcade.Sprite, tint: number, count = 10): void {
    this.tweens.killTweensOf(target);
    target.disableBody(true, false);
    this.burst(target.x, target.y, tint, count);
    this.tweens.add({
      targets: target,
      scale: target.scale * 1.6,
      alpha: 0,
      duration: 180,
      ease: 'Cubic.easeOut',
      onComplete: () => target.destroy(),
    });
  }

  private handleHazardHit(hazard: Phaser.Physics.Arcade.Sprite): void {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const wasInvulnerable = this.isInvulnerable;
    this.popAndDestroy(hazard, wasInvulnerable ? DASH_TINT : HIT_TINT);

    if (wasInvulnerable) {
      return;
    }

    audioSystem.playHit();
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
    this.popAndDestroy(pickup, kind === 'coin' ? COIN_TINT : DASH_TINT, 8);

    if (kind === 'coin') {
      this.coinsCollected += 1;
      audioSystem.playCoin();
    } else {
      this.energy = Math.min(ENERGY_MAX, this.energy + ENERGY_PER_ORB);
      audioSystem.playEnergy();
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
    audioSystem.playDash();
    this.burst(this.player.x, this.player.y - 30, DASH_TINT, 14);
  }

  private grantInvulnerability(durationMs: number): void {
    this.invulnerableUntil = Math.max(this.invulnerableUntil, this.time.now + durationMs);
  }

  private startBossEncounter(): void {
    this.obstacleSpawner.setEnabled(false);
    this.pickupSpawner.setEnabled(false);
    this.boss = new BossEncounter(this, this.obstacleSpawner.group);
    audioSystem.playBossStart();
    this.showBossHud();
  }

  private finishBossEncounter(): void {
    this.boss?.finish();
    this.boss = undefined;
    this.bonusScore += BOSS_SCORE_BONUS;
    this.nextBossDistance = this.distance + BOSS_INTERVAL_METERS;
    this.obstacleSpawner.setEnabled(true);
    this.pickupSpawner.setEnabled(true);
    this.hideBossHud();
    this.grantInvulnerability(BOSS_GRACE_MS);
    this.player.playInvulnerabilityEffect(BOSS_GRACE_MS, COIN_TINT);
    audioSystem.playBossDefeat();
    this.burst(this.player.x, this.player.y - 40, COIN_TINT, 24);
  }

  private showBossHud(): void {
    this.bossLabelText = this.add
      .text(GAME_WIDTH / 2, 60, 'BOSS: SURVIVE!', {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#ff4444',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.bossBarBg = this.add.graphics();
    this.bossBarFill = this.add.graphics();
  }

  private updateBossHud(): void {
    if (!this.boss || !this.bossBarBg || !this.bossBarFill) {
      return;
    }

    const barWidth = 400;
    const barHeight = 16;
    const x = GAME_WIDTH / 2 - barWidth / 2;
    const y = 88;

    this.bossBarBg.clear();
    this.bossBarBg.fillStyle(0x2a2a3d, 1);
    this.bossBarBg.fillRect(x, y, barWidth, barHeight);

    this.bossBarFill.clear();
    this.bossBarFill.fillStyle(0xff4444, 1);
    this.bossBarFill.fillRect(x + 2, y + 2, (barWidth - 4) * this.boss.progress, barHeight - 4);
  }

  private hideBossHud(): void {
    this.bossLabelText?.destroy();
    this.bossBarBg?.destroy();
    this.bossBarFill?.destroy();
    this.bossLabelText = undefined;
    this.bossBarBg = undefined;
    this.bossBarFill = undefined;
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
