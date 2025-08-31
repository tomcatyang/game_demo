import { GameMode } from './game';

// 主题类型枚举
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  ORANGE = 'orange',
}

// 音频设置接口
export interface AudioSettings {
  backgroundMusic: boolean;
  soundEffects: boolean;
  volume: number; // 0-1
}

// 触摸控制设置接口
export interface TouchSettings {
  sensitivity: number; // 0-1
  swipeThreshold: number;
  tapDelay: number;
}

// 游戏设置接口
export interface GameSettings {
  theme: ThemeType;
  audio: AudioSettings;
  touch: TouchSettings;
  autoSave: boolean;
  showGrid: boolean;
  showGhost: boolean; // 显示方块投影
  fullscreen: boolean;
}

// 用户统计接口
export interface UserStats {
  totalGames: number;
  totalPlayTime: number; // 毫秒
  totalLines: number;
  totalScore: number;
  highScores: Record<GameMode, number>;
  averageScore: number;
  gamesPerDay: number;
  longestSession: number; // 毫秒
  favoriteMode: GameMode;
}

// 成就类型枚举
export enum AchievementType {
  SCORE = 'score',
  LINES = 'lines',
  TIME = 'time',
  COMBO = 'combo',
  SPECIAL = 'special',
}

// 成就状态枚举
export enum AchievementStatus {
  LOCKED = 'locked',
  IN_PROGRESS = 'in_progress',
  UNLOCKED = 'unlocked',
}

// 成就接口
export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  requirement: number;
  progress: number;
  status: AchievementStatus;
  unlockedAt?: Date;
  icon: string;
  reward?: string;
}

// 用户数据接口
export interface UserData {
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt: Date;
  settings: GameSettings;
  stats: UserStats;
  achievements: Achievement[];
  preferences: UserPreferences;
}

// 用户偏好设置接口
export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: boolean;
  dataCollection: boolean;
  autoBackup: boolean;
}

// 用户会话接口
export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  achievements: string[]; // 本次会话获得的成就ID
}
