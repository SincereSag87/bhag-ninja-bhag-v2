import { beforeEach, describe, expect, it } from 'vitest';
import { getHighScore, setHighScoreIfBeaten } from '../systems/HighScoreStore.ts';

describe('HighScoreStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to 0 when nothing is stored', () => {
    expect(getHighScore()).toBe(0);
  });

  it('stores a new high score when the score beats the current one', () => {
    const result = setHighScoreIfBeaten(150);
    expect(result).toEqual({ highScore: 150, isNewHighScore: true });
    expect(getHighScore()).toBe(150);
  });

  it('keeps the existing high score when the new score is lower', () => {
    setHighScoreIfBeaten(300);
    const result = setHighScoreIfBeaten(100);
    expect(result).toEqual({ highScore: 300, isNewHighScore: false });
    expect(getHighScore()).toBe(300);
  });

  it('keeps the existing high score on a tie', () => {
    setHighScoreIfBeaten(200);
    const result = setHighScoreIfBeaten(200);
    expect(result.isNewHighScore).toBe(false);
    expect(getHighScore()).toBe(200);
  });
});
