import { clampVolume, getSettings, saveSettings, type Settings } from './SettingsStore.ts';

const MUSIC_PATTERN = [220, 262, 330, 262, 220, 196, 220, 262];
const MUSIC_STEP_SECONDS = 0.28;

class AudioSystem {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private settings: Settings = getSettings();

  unlock(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.effectiveMusicVolume();
      this.musicGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.effectiveSfxVolume();
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  refreshSettings(): void {
    this.settings = getSettings();
    if (this.musicGain) {
      this.musicGain.gain.value = this.effectiveMusicVolume();
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.effectiveSfxVolume();
    }
  }

  getSettingsSnapshot(): Settings {
    return this.settings;
  }

  setMuted(muted: boolean): void {
    this.persist({ ...this.settings, muted });
  }

  setMusicVolume(volume: number): void {
    this.persist({ ...this.settings, musicVolume: clampVolume(volume) });
  }

  setSfxVolume(volume: number): void {
    this.persist({ ...this.settings, sfxVolume: clampVolume(volume) });
  }

  private persist(next: Settings): void {
    this.settings = next;
    saveSettings(next);
    this.refreshSettings();
  }

  private effectiveMusicVolume(): number {
    return this.settings.muted ? 0 : this.settings.musicVolume;
  }

  private effectiveSfxVolume(): number {
    return this.settings.muted ? 0 : this.settings.sfxVolume;
  }

  private tone(freq: number, durationSec: number, type: OscillatorType = 'square', gainMul = 1, delaySec = 0): void {
    if (!this.ctx || !this.sfxGain) {
      return;
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;

    const now = this.ctx.currentTime + delaySec;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3 * gainMul, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  playJump(): void {
    this.tone(520, 0.12, 'square');
  }

  playDoubleJump(): void {
    this.tone(680, 0.12, 'square');
  }

  playSlide(): void {
    this.tone(220, 0.1, 'sawtooth', 0.7);
  }

  playCoin(): void {
    this.tone(880, 0.08, 'triangle');
    this.tone(1320, 0.1, 'triangle', 0.8, 0.05);
  }

  playEnergy(): void {
    this.tone(600, 0.08, 'sine');
    this.tone(900, 0.12, 'sine', 0.8, 0.05);
  }

  playHit(): void {
    this.tone(140, 0.25, 'sawtooth', 1);
  }

  playDash(): void {
    [0, 0.05, 0.1].forEach((delay, i) => this.tone(500 + i * 200, 0.1, 'square', 0.8, delay));
  }

  playGameOver(): void {
    [440, 330, 220, 110].forEach((freq, i) => this.tone(freq, 0.3, 'triangle', 0.9, i * 0.15));
  }

  playBossStart(): void {
    [220, 180, 140].forEach((freq, i) => this.tone(freq, 0.4, 'sawtooth', 1, i * 0.2));
  }

  playBossDefeat(): void {
    [440, 554, 660, 880].forEach((freq, i) => this.tone(freq, 0.25, 'triangle', 0.9, i * 0.12));
  }

  playUiSelect(): void {
    this.tone(440, 0.06, 'square', 0.5);
  }

  startMusic(): void {
    if (!this.ctx || this.musicTimer !== null) {
      return;
    }

    const scheduleStep = () => {
      if (!this.ctx || !this.musicGain) {
        return;
      }
      const freq = MUSIC_PATTERN[this.musicStep % MUSIC_PATTERN.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + MUSIC_STEP_SECONDS * 0.9);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + MUSIC_STEP_SECONDS);
      this.musicStep += 1;
    };

    scheduleStep();
    this.musicTimer = window.setInterval(scheduleStep, MUSIC_STEP_SECONDS * 1000);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audioSystem = new AudioSystem();
