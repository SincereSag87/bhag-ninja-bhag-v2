export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const GROUND_Y = GAME_HEIGHT - 80;

export const RUN_SPEED = 380;

export const PLAYER_X = 160;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 64;
export const SLIDE_HEIGHT = 34;

export const MAX_JUMPS = 2;
export const JUMP_VELOCITY = -720;
export const DOUBLE_JUMP_VELOCITY = -620;
export const SLIDE_DURATION_MS = 500;

export const OBSTACLE_MIN_SPAWN_MS = 900;
export const OBSTACLE_MAX_SPAWN_MS = 1600;
export const SPIKE_WIDTH = 40;
export const SPIKE_HEIGHT = 40;
export const BEAM_WIDTH = 70;
export const BEAM_HEIGHT = 28;
export const BEAM_CLEARANCE_ABOVE_GROUND = 40;

export const STORAGE_KEYS = {
  HighScore: 'bhagNinjaBhag.highScore',
  Settings: 'bhagNinjaBhag.settings',
  Unlocks: 'bhagNinjaBhag.unlocks',
} as const;
