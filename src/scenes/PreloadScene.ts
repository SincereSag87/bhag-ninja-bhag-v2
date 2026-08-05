import Phaser from 'phaser';
import {
  BEAM_HEIGHT,
  BEAM_WIDTH,
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  SLIDE_HEIGHT,
  SPIKE_HEIGHT,
  SPIKE_WIDTH,
} from '../config/GameConfig.ts';
import { SceneKeys } from '../config/SceneKeys.ts';
import { TextureKeys } from '../config/TextureKeys.ts';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload);
  }

  preload(): void {
    this.createLoadingBar();
    // Real sprite sheets, spritesheets, and audio get registered here in
    // later phases. For now the scene generates its own placeholder art.
  }

  create(): void {
    this.generatePlaceholderTextures();
    this.scene.start(SceneKeys.Menu);
  }

  private createLoadingBar(): void {
    const barWidth = 320;
    const barHeight = 24;
    const x = GAME_WIDTH / 2 - barWidth / 2;
    const y = GAME_HEIGHT / 2 - barHeight / 2;

    const box = this.add.graphics();
    box.fillStyle(0x2a2a3d, 1);
    box.fillRect(x, y, barWidth, barHeight);

    const bar = this.add.graphics();

    this.load.on(Phaser.Loader.Events.PROGRESS, (value: number) => {
      bar.clear();
      bar.fillStyle(0xff6b35, 1);
      bar.fillRect(x + 4, y + 4, (barWidth - 8) * value, barHeight - 8);
    });

    this.load.on(Phaser.Loader.Events.COMPLETE, () => {
      bar.destroy();
      box.destroy();
    });
  }

  private generatePlaceholderTextures(): void {
    const graphics = this.add.graphics();

    graphics.fillStyle(0xff6b35, 1);
    graphics.fillRoundedRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT, 8);
    graphics.generateTexture(TextureKeys.Player, PLAYER_WIDTH, PLAYER_HEIGHT);

    graphics.clear();
    graphics.fillStyle(0xff6b35, 1);
    graphics.fillRoundedRect(0, 0, PLAYER_WIDTH + 16, SLIDE_HEIGHT, 8);
    graphics.generateTexture(TextureKeys.PlayerSlide, PLAYER_WIDTH + 16, SLIDE_HEIGHT);

    graphics.clear();
    graphics.fillStyle(0x3a3a4d, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.generateTexture(TextureKeys.Ground, 64, 64);

    graphics.clear();
    graphics.fillStyle(0x8b3a3a, 1);
    graphics.fillTriangle(0, SPIKE_HEIGHT, SPIKE_WIDTH / 2, 0, SPIKE_WIDTH, SPIKE_HEIGHT);
    graphics.generateTexture(TextureKeys.Spike, SPIKE_WIDTH, SPIKE_HEIGHT);

    graphics.clear();
    graphics.fillStyle(0xb35a3a, 1);
    graphics.fillRoundedRect(0, 0, BEAM_WIDTH, BEAM_HEIGHT, 4);
    graphics.generateTexture(TextureKeys.Beam, BEAM_WIDTH, BEAM_HEIGHT);

    graphics.clear();
    graphics.fillStyle(0xffd23f, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture(TextureKeys.Coin, 32, 32);

    graphics.clear();
    graphics.fillStyle(0x6b2fbf, 1);
    graphics.fillRoundedRect(0, 0, 48, 56, 6);
    graphics.generateTexture(TextureKeys.Enemy, 48, 56);

    graphics.destroy();
  }
}
