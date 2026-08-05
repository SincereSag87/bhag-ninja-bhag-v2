import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig.ts';
import { SceneKeys } from '../config/SceneKeys.ts';
import { audioSystem } from '../systems/AudioSystem.ts';

const VOLUME_STEP = 0.1;

export class SettingsScene extends Phaser.Scene {
  private returnScene: string = SceneKeys.Menu;
  private musicText!: Phaser.GameObjects.Text;
  private sfxText!: Phaser.GameObjects.Text;
  private muteText!: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKeys.Settings);
  }

  init(data: { returnScene?: string }): void {
    this.returnScene = data?.returnScene ?? SceneKeys.Menu;
  }

  create(): void {
    audioSystem.unlock();
    const centerX = GAME_WIDTH / 2;

    this.add
      .text(centerX, 90, 'SETTINGS', {
        fontFamily: 'sans-serif',
        fontSize: '36px',
        color: '#ff6b35',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.musicText = this.createRow(200, 'Music');
    this.sfxText = this.createRow(260, 'SFX');
    this.muteText = this.createToggleRow(320, 'Mute');

    this.add
      .text(centerX, GAME_HEIGHT - 60, 'ESC: Back', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#ffd23f',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ESC', () => this.goBack());
    this.updateLabels();
  }

  private createRow(y: number, label: string): Phaser.GameObjects.Text {
    const centerX = GAME_WIDTH / 2;

    const minus = this.add
      .text(centerX - 140, y, '−', { fontFamily: 'sans-serif', fontSize: '28px', color: '#ffd23f' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const plus = this.add
      .text(centerX + 140, y, '+', { fontFamily: 'sans-serif', fontSize: '28px', color: '#ffd23f' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const valueText = this.add
      .text(centerX, y, '', { fontFamily: 'sans-serif', fontSize: '22px', color: '#ffffff' })
      .setOrigin(0.5)
      .setData('label', label);

    const step = label === 'Music' ? this.adjustMusic : this.adjustSfx;
    minus.on('pointerdown', () => step.call(this, -VOLUME_STEP));
    plus.on('pointerdown', () => step.call(this, VOLUME_STEP));

    return valueText;
  }

  private createToggleRow(y: number, label: string): Phaser.GameObjects.Text {
    const centerX = GAME_WIDTH / 2;
    const valueText = this.add
      .text(centerX, y, '', { fontFamily: 'sans-serif', fontSize: '22px', color: '#ffffff' })
      .setOrigin(0.5)
      .setData('label', label)
      .setInteractive({ useHandCursor: true });

    valueText.on('pointerdown', () => {
      audioSystem.setMuted(!audioSystem.getSettingsSnapshot().muted);
      audioSystem.playUiSelect();
      this.updateLabels();
    });

    return valueText;
  }

  private adjustMusic(delta: number): void {
    const current = audioSystem.getSettingsSnapshot().musicVolume;
    audioSystem.setMusicVolume(current + delta);
    audioSystem.playUiSelect();
    this.updateLabels();
  }

  private adjustSfx(delta: number): void {
    const current = audioSystem.getSettingsSnapshot().sfxVolume;
    audioSystem.setSfxVolume(current + delta);
    audioSystem.playUiSelect();
    this.updateLabels();
  }

  private updateLabels(): void {
    const settings = audioSystem.getSettingsSnapshot();
    this.musicText.setText(`Music Volume: ${Math.round(settings.musicVolume * 100)}%`);
    this.sfxText.setText(`SFX Volume: ${Math.round(settings.sfxVolume * 100)}%`);
    this.muteText.setText(`Mute: ${settings.muted ? 'ON' : 'OFF'}`);
  }

  private goBack(): void {
    this.scene.start(this.returnScene);
  }
}
