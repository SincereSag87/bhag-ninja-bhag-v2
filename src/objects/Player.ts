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
import { audioSystem } from '../systems/AudioSystem.ts';
import { canJump, jumpVelocity } from '../systems/JumpState.ts';

export interface PlayerOptions {
  enablePointerJump?: boolean;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private jumpsUsed = 0;
  private isSliding = false;
  private slideEndAt = 0;
  private isPaused = false;
  private wasGrounded = true;
  private isPunching = false;
  private readonly inputPlugin: Phaser.Input.InputPlugin;
  private readonly keyboardPlugin?: Phaser.Input.Keyboard.KeyboardPlugin;
  private readonly tweensManager: Phaser.Tweens.TweenManager;
  private readonly timeManager: Phaser.Time.Clock;
  private readonly pointerJumpEnabled: boolean;
  private invulnTween?: Phaser.Tweens.Tween;
  private punchTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, options: PlayerOptions = {}) {
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
    this.pointerJumpEnabled = options.enablePointerJump ?? true;

    this.keyboardPlugin?.on('keydown-SPACE', this.jump, this);
    this.keyboardPlugin?.on('keydown-UP', this.jump, this);
    this.keyboardPlugin?.on('keydown-W', this.jump, this);
    this.keyboardPlugin?.on('keydown-DOWN', this.slide, this);
    this.keyboardPlugin?.on('keydown-S', this.slide, this);
    if (this.pointerJumpEnabled) {
      this.inputPlugin.on(Phaser.Input.Events.POINTER_DOWN, this.jump, this);
    }
  }

  get isGrounded(): boolean {
    return (this.body as Phaser.Physics.Arcade.Body).blocked.down;
  }

  setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  jump(): void {
    if (this.isPaused || this.isSliding) {
      return;
    }
    if (!canJump(this.jumpsUsed, MAX_JUMPS)) {
      return;
    }

    const velocity = jumpVelocity(this.jumpsUsed, JUMP_VELOCITY, DOUBLE_JUMP_VELOCITY);
    this.setVelocityY(velocity);
    if (this.jumpsUsed === 0) {
      audioSystem.playJump();
    } else {
      audioSystem.playDoubleJump();
    }
    this.jumpsUsed += 1;
    this.playSquashStretch(0.8, 1.25, 180);
  }

  slide(): void {
    if (this.isPaused || !this.isGrounded || this.isSliding) {
      return;
    }

    this.isSliding = true;
    this.slideEndAt = this.timeManager.now + SLIDE_DURATION_MS;
    this.setTexture(TextureKeys.PlayerSlide);
    this.setStandingScale();
    this.setSize(PLAYER_WIDTH + 16, SLIDE_HEIGHT);
    audioSystem.playSlide();
    this.playSquashStretch(1.3, 0.7, 120);
  }

  playInvulnerabilityEffect(durationMs: number, tintColor: number): void {
    this.invulnTween?.stop();
    this.setTint(tintColor);
    this.invulnTween = this.tweensManager.add({
      targets: this,
      alpha: 0.35,
      duration: 120,
      yoyo: true,
      repeat: -1,
    });
    this.timeManager.delayedCall(durationMs, () => {
      this.invulnTween?.stop();
      this.setAlpha(1);
      this.clearTint();
    });
  }

  update(): void {
    const grounded = this.isGrounded;
    if (grounded && !this.wasGrounded) {
      this.playSquashStretch(1.25, 0.75, 140);
    }
    this.wasGrounded = grounded;

    if (grounded) {
      this.jumpsUsed = 0;
    }

    if (this.isSliding && this.timeManager.now >= this.slideEndAt) {
      this.standUp();
    }

    this.applyRunCycle(grounded);
  }

  private applyRunCycle(grounded: boolean): void {
    if (this.isPunching || this.isSliding || !grounded) {
      return;
    }
    const wobble = Math.sin(this.timeManager.now / 90) * 0.04;
    this.setScale(1 - wobble, 1 + wobble);
  }

  private playSquashStretch(scaleX: number, scaleY: number, duration: number): void {
    this.punchTween?.stop();
    this.isPunching = true;
    this.setScale(scaleX, scaleY);
    this.punchTween = this.tweensManager.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.isPunching = false;
      },
    });
  }

  private standUp(): void {
    this.isSliding = false;
    this.setTexture(TextureKeys.Player);
    this.setStandingHitbox();
    this.playSquashStretch(1.15, 0.9, 120);
  }

  private setStandingHitbox(): void {
    this.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  private setStandingScale(): void {
    this.setScale(1, 1);
  }

  destroy(fromScene?: boolean): void {
    this.keyboardPlugin?.off('keydown-SPACE', this.jump, this);
    this.keyboardPlugin?.off('keydown-UP', this.jump, this);
    this.keyboardPlugin?.off('keydown-W', this.jump, this);
    this.keyboardPlugin?.off('keydown-DOWN', this.slide, this);
    this.keyboardPlugin?.off('keydown-S', this.slide, this);
    if (this.pointerJumpEnabled) {
      this.inputPlugin.off(Phaser.Input.Events.POINTER_DOWN, this.jump, this);
    }
    this.tweensManager.killTweensOf(this);
    super.destroy(fromScene);
  }
}
