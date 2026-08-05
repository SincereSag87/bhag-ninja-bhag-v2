import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig.ts';

export interface TouchControlCallbacks {
  onJump: () => void;
  onSlide: () => void;
  onPause: () => void;
}

const BUTTON_RADIUS = 44;
const PAUSE_BUTTON_SIZE = 36;

export class TouchControls {
  private readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, callbacks: TouchControlCallbacks) {
    const slideButton = this.createCircleButton(scene, GAME_WIDTH * 0.15, GAME_HEIGHT - 90, 'SLIDE', callbacks.onSlide);
    const jumpButton = this.createCircleButton(scene, GAME_WIDTH * 0.85, GAME_HEIGHT - 90, 'JUMP', callbacks.onJump);

    const pauseBg = scene.add
      .rectangle(GAME_WIDTH - 36, 36, PAUSE_BUTTON_SIZE, PAUSE_BUTTON_SIZE, 0x000000, 0.35)
      .setStrokeStyle(2, 0xffffff, 0.5)
      .setInteractive({ useHandCursor: true });
    const pauseLabel = scene.add
      .text(GAME_WIDTH - 36, 36, '❘❘', { fontFamily: 'sans-serif', fontSize: '16px', color: '#ffffff' })
      .setOrigin(0.5);
    pauseBg.on('pointerdown', () => callbacks.onPause());

    this.container = scene.add.container(0, 0, [...slideButton, ...jumpButton, pauseBg, pauseLabel]);
    this.container.setDepth(1000);
  }

  private createCircleButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onPress: () => void,
  ): Phaser.GameObjects.GameObject[] {
    const circle = scene.add.circle(x, y, BUTTON_RADIUS, 0xffffff, 0.15).setStrokeStyle(2, 0xffffff, 0.4);
    const text = scene.add
      .text(x, y, label, { fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff' })
      .setOrigin(0.5);
    circle.setInteractive({ useHandCursor: true }).on('pointerdown', onPress);
    return [circle, text];
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
