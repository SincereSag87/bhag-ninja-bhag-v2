import { STORAGE_KEYS } from '../config/GameConfig.ts';

export function getHighScore(): number {
  const raw = localStorage.getItem(STORAGE_KEYS.HighScore);
  const parsed = raw === null ? 0 : Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function setHighScoreIfBeaten(score: number): { highScore: number; isNewHighScore: boolean } {
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem(STORAGE_KEYS.HighScore, String(score));
    return { highScore: score, isNewHighScore: true };
  }
  return { highScore: current, isNewHighScore: false };
}
