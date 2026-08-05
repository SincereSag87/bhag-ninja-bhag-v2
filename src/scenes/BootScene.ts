import Phaser from 'phaser';
import { SceneKeys } from '../config/SceneKeys.ts';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  preload(): void {
    // Nothing to load yet — this scene only configures the engine before
    // PreloadScene brings in real assets.
  }

  create(): void {
    this.scene.start(SceneKeys.Preload);
  }
}
