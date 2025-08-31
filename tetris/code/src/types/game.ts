// 游戏状态枚举
export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
  SETTINGS = 'settings',
}

// 游戏模式枚举
export enum GameMode {
  CLASSIC = 'classic',
  TIME_ATTACK = 'time_attack',
  CHALLENGE = 'challenge',
}

// 游戏难度枚举
export enum GameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

// 游戏配置接口
export interface GameConfig {
  mode: GameMode;
  difficulty: GameDifficulty;
  initialSpeed: number;
  enableSpecialBlocks: boolean;
  enableCombo: boolean;
  gridWidth: number;
  gridHeight: number;
}

// 游戏统计接口
export interface GameStats {
  score: number;
  level: number;
  lines: number;
  combo: number;
  totalTime: number;
  totalGames: number;
  totalLines: number;
  highScores: Record<GameMode, number>;
}

// 游戏上下文接口
export interface GameContext {
  state: GameState;
  config: GameConfig;
  stats: GameStats;
  startTime: number;
  lastUpdateTime: number;
}

// 游戏输入接口
export interface GameInput {
  type: 'move' | 'rotate' | 'drop' | 'pause' | 'restart';
  direction?: 'left' | 'right' | 'down';
  payload?: Record<string, unknown>;
}

// 游戏事件接口
export interface GameEvent {
  type: string;
  payload?: Record<string, unknown>;
  timestamp: number;
}
