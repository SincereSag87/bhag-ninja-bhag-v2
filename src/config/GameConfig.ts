export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const GROUND_Y = GAME_HEIGHT - 80;

export const RUN_SPEED_BASE = 380;
export const RUN_SPEED_MAX = 680;
export const RUN_SPEED_RAMP_PER_METER = 0.6;

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
export const OBSTACLE_MIN_SPAWN_MS_FLOOR = 500;
export const OBSTACLE_MAX_SPAWN_MS_FLOOR = 900;
export const OBSTACLE_SPAWN_RAMP_PER_METER = 0.35;

export const SPIKE_WIDTH = 40;
export const SPIKE_HEIGHT = 40;
export const BEAM_WIDTH = 70;
export const BEAM_HEIGHT = 28;
export const BEAM_CLEARANCE_ABOVE_GROUND = 40;
export const ENEMY_WIDTH = 44;
export const ENEMY_HEIGHT = 52;

export const HEALTH_MAX = 3;
export const HIT_INVULNERABILITY_MS = 1200;

export const ENERGY_MAX = 100;
export const ENERGY_PER_ORB = 20;
export const DASH_DURATION_MS = 1500;
export const DASH_SCORE_BONUS = 100;

export const COIN_SCORE_VALUE = 25;
export const PICKUP_MIN_SPAWN_MS = 700;
export const PICKUP_MAX_SPAWN_MS = 1300;
export const PICKUP_ENERGY_CHANCE = 0.25;
export const COIN_HEIGHT_ABOVE_GROUND = 90;
export const ENERGY_HEIGHT_ABOVE_GROUND = 130;

export const BOSS_TRIGGER_DISTANCE = 1200;
export const BOSS_INTERVAL_METERS = 1800;
export const BOSS_DURATION_MS = 12_000;
export const BOSS_PROJECTILE_MIN_MS = 650;
export const BOSS_PROJECTILE_MAX_MS = 1100;
export const BOSS_SCORE_BONUS = 500;
export const BOSS_WIDTH = 96;
export const BOSS_HEIGHT = 108;
export const BOSS_BOLT_SIZE = 22;
export const BOSS_GRACE_MS = 1000;

export const STORAGE_KEYS = {
  Leaderboard: 'bhagNinjaBhag.leaderboard',
  Settings: 'bhagNinjaBhag.settings',
  Unlocks: 'bhagNinjaBhag.unlocks',
} as const;

export const LEADERBOARD_SIZE = 5;

export const DEFAULT_MUSIC_VOLUME = 0.5;
export const DEFAULT_SFX_VOLUME = 0.7;
