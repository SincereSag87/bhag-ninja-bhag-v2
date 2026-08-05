import { beforeEach, describe, expect, it } from 'vitest';
import { clampVolume, getSettings, saveSettings } from '../systems/SettingsStore.ts';

describe('SettingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when nothing is stored', () => {
    expect(getSettings()).toEqual({ musicVolume: 0.5, sfxVolume: 0.7, muted: false });
  });

  it('round-trips saved settings', () => {
    saveSettings({ musicVolume: 0.2, sfxVolume: 0.9, muted: true });
    expect(getSettings()).toEqual({ musicVolume: 0.2, sfxVolume: 0.9, muted: true });
  });

  it('falls back to defaults on corrupt stored data', () => {
    localStorage.setItem('bhagNinjaBhag.settings', 'not json');
    expect(getSettings()).toEqual({ musicVolume: 0.5, sfxVolume: 0.7, muted: false });
  });
});

describe('clampVolume', () => {
  it('clamps below zero up to zero', () => {
    expect(clampVolume(-0.5)).toBe(0);
  });

  it('clamps above one down to one', () => {
    expect(clampVolume(1.5)).toBe(1);
  });

  it('passes through in-range values', () => {
    expect(clampVolume(0.42)).toBe(0.42);
  });
});
