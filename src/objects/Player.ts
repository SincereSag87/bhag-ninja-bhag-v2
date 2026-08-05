import Phaser from 'phaser';
import {
  DOUBLE_JUMP_VELOCITY,
  GROUND_Y,
  JUMP_VELOCITY,
  MAX_JUMPS,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  SLIDE_DURATION_MS,
  SLIDE_HEIGHT,
} from '../config/GameConfig.ts';
import { TextureKeys } from '../config/TextureKeys.ts';
import { canJump, jumpVelocity } from '../systems/JumpState.ts';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private jumpsUsed = 0;
  private isSliding = false;
  private slideEndAt = 0;
  private isPaused = false;
  private readonly inputPlugin: Phaser.Input.InputPlugin;
  private readonly keyboardPlugin?: Phaser.Input.Keyboard.KeyboardPlugin;
  private readonly tweensManager: Phaser.Tweens.TweenManager;
  private readonly timeManager: Phaser.Time.Clock;

  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, GROUND_Y, TextureKeys.Player);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setCollideWorldBounds(true);
    this.setStandingHitbox();

    this.inputPlugin = scene.input;
    this.keyboardPlugin = scene.input.keyboard ?? undefined;
    this.tweensManager = scene.tweens;
    this.timeManager = scene.time;

    this.keyboardPlugin?.on('keydown-SPACE', this.handleJumpInput, this);
    this.keyboardPlugin?.on('keydown-UP', this.handleJumpInput, this);
    this.keyboardPlugin?.on('keydown-W', this.handleJumpInput, this);
    this.keyboardPlugin?.on('keydown-DOWN', this.handleSlideInput, this);
    this.keyboardPlugin?.on('keydown-S', this.handleSlideInput, this);
    this.inputPlugin.on(Phaser.Input.Events.POINTER_DOWN, this.handleJumpInput, this);
  }

  get isGrounded(): boolean {
    return (this.body as Phaser.Physics.Arcade.Body).blocked.down;
  }

  setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  playInvulnerabilityEffect(durationMs: number, tintColor: number): void {
    this.tweensManager.killTweensOf(this);
    this.setTint(tintColor);
    this.tweensManager.add({
      targets: this,
      alpha: 0.35,
      duration: 120,
      yoyo: true,
      repeat: -1,
    });
    this.timeManager.delayedCall(durationMs, () => {
      this.tweensManager.killTweensOf(this);
      this.setAlpha(1);
      this.clearTint();
    });
  }

  update(): void {
    if (this.isGrounded) {
      this.jumpsUsed = 0;
    }

    if (this.isSliding && this.timeManager.now >= this.slideEndAt) {
      this.standUp();
    }
  }

  private handleJumpInput(): void {
    if (this.isPaused || this.isSliding) {
      return;
    }
    if (!canJump(this.jumpsUsed, MAX_JUMPS)) {
      return;
    }

    const velocity = jumpVelocity(this.jumpsUsed, JUMP_VELOCITY, DOUBLE_JUMP_VELOCITY);
    this.setVelocityY(velocity);
    this.jumpsUsed += 1;
  }

  private handleSlideInput(): void {
    if (this.isPaused || !this.isGrounded || this.isSliding) {
      return;
    }

    this.isSliding = true;
    this.slideEndAt = this.timeManager.now + SLIDE_DURATION_MS;
    this.setTexture(TextureKeys.PlayerSlide);
    this.setSize(PLAYER_WIDTH + 16, SLIDE_HEIGHT);
  }

  private standUp(): void {
    this.isSliding = false;
    this.setTexture(TextureKeys.Player);
    this.setStandingHitbox();
  }

  private setStandingHitbox(): void {
    this.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  destroy(fromScene?: boolean): void {
    this.keyboardPlugin?.off('keydown-SPACE', this.handleJumpInput, this);
    this.keyboardPlugin?.off('keydown-UP', this.handleJumpInput, this);
    this.keyboardPlugin?.off('keydown-W', this.handleJumpInput, this);
    this.keyboardPlugin?.off('keydown-DOWN', this.handleSlideInput, this);
    this.keyboardPlugin?.off('keydown-S', this.handleSlideInput, this);
    this.inputPlugin.off(Phaser.Input.Events.POINTER_DOWN, this.handleJumpInput, this);
    this.tweensManager.killTweensOf(this);
    super.destroy(fromScene);
  }
}
