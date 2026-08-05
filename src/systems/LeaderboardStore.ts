import { LEADERBOARD_SIZE, STORAGE_KEYS } from '../config/GameConfig.ts';

export interface ScoreEntry {
  score: number;
  distance: number;
  date: string;
}

export interface SubmitScoreResult {
  leaderboard: ScoreEntry[];
  rank: number | null;
}

function isValidEntry(entry: unknown): entry is ScoreEntry {
  if (typeof entry !== 'object' || entry === null) {
    return false;
  }
  const candidate = entry as Record<string, unknown>;
  return (
    typeof candidate.score === 'number' &&
    typeof candidate.distance === 'number' &&
    typeof candidate.date === 'string'
  );
}

export function getLeaderboard(): ScoreEntry[] {
  const raw = localStorage.getItem(STORAGE_KEYS.Leaderboard);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidEntry) : [];
  } catch {
    return [];
  }
}

export function getTopScore(): number {
  return getLeaderboard()[0]?.score ?? 0;
}

export function submitScore(entry: ScoreEntry): SubmitScoreResult {
  const combined = [...getLeaderboard(), entry].sort((a, b) => b.score - a.score);
  const trimmed = combined.slice(0, LEADERBOARD_SIZE);
  localStorage.setItem(STORAGE_KEYS.Leaderboard, JSON.stringify(trimmed));

  const index = trimmed.indexOf(entry);
  return { leaderboard: trimmed, rank: index === -1 ? null : index + 1 };
}
