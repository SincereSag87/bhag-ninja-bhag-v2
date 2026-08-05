import { DEFAULT_MUSIC_VOLUME, DEFAULT_SFX_VOLUME, STORAGE_KEYS } from '../config/GameConfig.ts';

export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  musicVolume: DEFAULT_MUSIC_VOLUME,
  sfxVolume: DEFAULT_SFX_VOLUME,
  muted: false,
};

export function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function getSettings(): Settings {
  const raw = localStorage.getItem(STORAGE_KEYS.Settings);
  if (!raw) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      musicVolume: clampVolume(Number(parsed.musicVolume ?? DEFAULT_SETTINGS.musicVolume)),
      sfxVolume: clampVolume(Number(parsed.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume)),
      muted: Boolean(parsed.muted ?? DEFAULT_SETTINGS.muted),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.Settings, JSON.stringify(settings));
}
