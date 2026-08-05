import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig.ts';
import { SceneKeys } from '../config/SceneKeys.ts';
import { getLeaderboard } from '../systems/LeaderboardStore.ts';

export class HighScoresScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.HighScores);
  }

  create(): void {
    const centerX = GAME_WIDTH / 2;

    this.add
      .text(centerX, 80, 'HIGH SCORES', {
        fontFamily: 'sans-serif',
        fontSize: '36px',
        color: '#ff6b35',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const leaderboard = getLeaderboard();

    if (leaderboard.length === 0) {
      this.add
        .text(centerX, GAME_HEIGHT / 2, 'No runs recorded yet', {
          fontFamily: 'sans-serif',
          fontSize: '20px',
          color: '#8888aa',
        })
        .setOrigin(0.5);
    } else {
      leaderboard.forEach((entry, index) => {
        const y = 160 + index * 44;
        this.add.text(centerX - 260, y, `#${index + 1}`, {
          fontFamily: 'sans-serif',
          fontSize: '22px',
          color: '#ffd23f',
        });
        this.add.text(centerX - 180, y, `${entry.score}`, {
          fontFamily: 'sans-serif',
          fontSize: '22px',
          color: '#ffffff',
        });
        this.add.text(centerX, y, `${Math.floor(entry.distance)}m`, {
          fontFamily: 'sans-serif',
          fontSize: '22px',
          color: '#8888aa',
        });
        this.add.text(centerX + 140, y, entry.date, {
          fontFamily: 'sans-serif',
          fontSize: '18px',
          color: '#666677',
        });
      });
    }

    this.add
      .text(centerX, GAME_HEIGHT - 60, 'ESC: Back to Menu', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#ffd23f',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ESC', () => this.scene.start(SceneKeys.Menu));
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => this.scene.start(SceneKeys.Menu));
  }
}
