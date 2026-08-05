import Phaser from 'phaser';
import './style.css';
import { phaserConfig } from './config/PhaserConfig.ts';

const game = new Phaser.Game(phaserConfig);

if (import.meta.env.DEV) {
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
