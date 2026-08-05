import { beforeEach, describe, expect, it } from 'vitest';
import { getLeaderboard, getTopScore, submitScore } from '../systems/LeaderboardStore.ts';

const entry = (score: number, distance = score) => ({ score, distance, date: '2026-01-01' });

describe('LeaderboardStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    expect(getLeaderboard()).toEqual([]);
    expect(getTopScore()).toBe(0);
  });

  it('ranks the first score as 1', () => {
    const result = submitScore(entry(100));
    expect(result.rank).toBe(1);
    expect(result.leaderboard).toEqual([entry(100)]);
  });

  it('keeps the leaderboard sorted descending by score', () => {
    submitScore(entry(100));
    submitScore(entry(300));
    const result = submitScore(entry(200));
    expect(result.leaderboard.map((e) => e.score)).toEqual([300, 200, 100]);
    expect(result.rank).toBe(2);
  });

  it('trims the leaderboard to the configured size', () => {
    submitScore(entry(10));
    submitScore(entry(20));
    submitScore(entry(30));
    submitScore(entry(40));
    submitScore(entry(50));
    const result = submitScore(entry(5));
    expect(result.leaderboard).toHaveLength(5);
    expect(result.rank).toBeNull();
    expect(result.leaderboard.map((e) => e.score)).toEqual([50, 40, 30, 20, 10]);
  });

  it('reports the top score via getTopScore', () => {
    submitScore(entry(75));
    submitScore(entry(150));
    expect(getTopScore()).toBe(150);
  });

  it('ignores corrupted stored data', () => {
    localStorage.setItem('bhagNinjaBhag.leaderboard', 'not json');
    expect(getLeaderboard()).toEqual([]);
  });
});
