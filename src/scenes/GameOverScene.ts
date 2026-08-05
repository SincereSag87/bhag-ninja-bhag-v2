import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig.ts';
import { SceneKeys } from '../config/SceneKeys.ts';
import { audioSystem } from '../systems/AudioSystem.ts';
import { getTopScore, submitScore } from '../systems/LeaderboardStore.ts';
import type { GameSceneResult } from './GameScene.ts';

export class GameOverScene extends Phaser.Scene {
  private result: GameSceneResult = { score: 0, distance: 0 };

  constructor() {
    super(SceneKeys.GameOver);
  }

  init(data: GameSceneResult): void {
    this.result = data;
  }

  create(): void {
    const centerX = GAME_WIDTH / 2;
    const previousTopScore = getTopScore();
    const { rank } = submitScore({
      score: this.result.score,
      distance: this.result.distance,
      date: new Date().toISOString().slice(0, 10),
    });
    const isNewHighScore = this.result.score > previousTopScore;

    audioSystem.playGameOver();

    this.add
      .text(centerX, GAME_HEIGHT / 2 - 130, 'GAME OVER', {
        fontFamily: 'sans-serif',
        fontSize: '44px',
        color: '#ff6b35',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, GAME_HEIGHT / 2 - 60, `Score: ${this.result.score}`, {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, GAME_HEIGHT / 2 - 26, `Distance: ${Math.floor(this.result.distance)}m`, {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const rankLabel = isNewHighScore
      ? `New High Score: ${this.result.score}!`
      : rank !== null
        ? `Leaderboard Rank #${rank}`
        : `High Score: ${previousTopScore}`;

    this.add
      .text(centerX, GAME_HEIGHT / 2 + 12, rankLabel, {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: isNewHighScore ? '#ffd23f' : '#8888aa',
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(centerX, GAME_HEIGHT / 2 + 90, 'SPACE: Restart  |  ESC: Menu  |  H: High Scores', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#ffd23f',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start(SceneKeys.Game));
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start(SceneKeys.Menu));
    this.input.keyboard?.once('keydown-H', () => this.scene.start(SceneKeys.HighScores));
  }
}
