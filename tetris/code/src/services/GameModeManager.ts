import { GameMode, GameDifficulty, GameConfig } from '@/types';

// 游戏模式配置接口
export interface GameModeConfig {
  id: GameMode;
  name: string;
  description: string;
  icon: string;
  color: string;
  rules: GameModeRules;
  enabled: boolean;
}

// 游戏模式规则接口
export interface GameModeRules {
  timeLimit?: number;           // 时间限制（秒）
  lineTarget?: number;          // 目标行数
  scoreTarget?: number;         // 目标分数
  speedIncrease: number;        // 速度增长倍数
  specialBlocksEnabled: boolean; // 是否启用特殊方块
  comboEnabled: boolean;        // 是否启用连击
  levelUpLines: number;         // 升级所需行数
  maxLevel: number;             // 最大等级
  initialSpeed: number;         // 初始速度（毫秒）
  gridSize: { width: number; height: number }; // 网格尺寸
  scoringMultiplier: number;    // 分数倍数
  timeBonus: boolean;           // 是否有时长奖励
  perfectClearBonus: boolean;   // 是否有完美清除奖励
  tSpinEnabled: boolean;        // 是否启用T-Spin
}

// 游戏模式预设配置
const GAME_MODE_PRESETS: Record<GameMode, GameModeConfig> = {
  [GameMode.CLASSIC]: {
    id: GameMode.CLASSIC,
    name: '经典模式',
    description: '传统的俄罗斯方块游戏，无时间限制，追求高分',
    icon: '🎮',
    color: '#3b82f6',
    enabled: true,
    rules: {
      speedIncrease: 0.9,
      specialBlocksEnabled: false,
      comboEnabled: true,
      levelUpLines: 10,
      maxLevel: 20,
      initialSpeed: 800,
      gridSize: { width: 10, height: 20 },
      scoringMultiplier: 1.0,
      timeBonus: false,
      perfectClearBonus: true,
      tSpinEnabled: true,
    },
  },
  [GameMode.TIME_ATTACK]: {
    id: GameMode.TIME_ATTACK,
    name: '限时挑战',
    description: '在限定时间内消除尽可能多的行数',
    icon: '⏰',
    color: '#ef4444',
    enabled: true,
    rules: {
      timeLimit: 120, // 2分钟
      speedIncrease: 0.95,
      specialBlocksEnabled: true,
      comboEnabled: true,
      levelUpLines: 5,
      maxLevel: 15,
      initialSpeed: 600,
      gridSize: { width: 10, height: 20 },
      scoringMultiplier: 1.2,
      timeBonus: true,
      perfectClearBonus: true,
      tSpinEnabled: true,
    },
  },
  [GameMode.CHALLENGE]: {
    id: GameMode.CHALLENGE,
    name: '挑战模式',
    description: '高难度挑战，快速升级，特殊方块',
    icon: '🔥',
    color: '#f59e0b',
    enabled: true,
    rules: {
      speedIncrease: 0.85,
      specialBlocksEnabled: true,
      comboEnabled: true,
      levelUpLines: 3,
      maxLevel: 30,
      initialSpeed: 400,
      gridSize: { width: 10, height: 20 },
      scoringMultiplier: 1.5,
      timeBonus: false,
      perfectClearBonus: true,
      tSpinEnabled: true,
    },
  },
};

// 难度配置
const DIFFICULTY_CONFIGS: Record<GameDifficulty, Partial<GameModeRules>> = {
  [GameDifficulty.EASY]: {
    speedIncrease: 0.95,
    initialSpeed: 1000,
    scoringMultiplier: 0.8,
    levelUpLines: 15,
  },
  [GameDifficulty.MEDIUM]: {
    speedIncrease: 0.9,
    initialSpeed: 800,
    scoringMultiplier: 1.0,
    levelUpLines: 10,
  },
  [GameDifficulty.HARD]: {
    speedIncrease: 0.85,
    initialSpeed: 600,
    scoringMultiplier: 1.3,
    levelUpLines: 7,
  },
  [GameDifficulty.EXPERT]: {
    speedIncrease: 0.8,
    initialSpeed: 400,
    scoringMultiplier: 1.6,
    levelUpLines: 5,
  },
};

// 游戏模式管理器类
export class GameModeManager {
  private currentMode: GameMode;
  private currentDifficulty: GameDifficulty;
  private customModes: Map<string, GameModeConfig>;
  private listeners: Map<string, (mode: GameMode, difficulty: GameDifficulty) => void>;

  constructor() {
    this.currentMode = GameMode.CLASSIC;
    this.currentDifficulty = GameDifficulty.MEDIUM;
    this.customModes = new Map();
    this.listeners = new Map();
  }

  // 获取当前游戏模式
  getCurrentMode(): GameMode {
    return this.currentMode;
  }

  // 获取当前难度
  getCurrentDifficulty(): GameDifficulty {
    return this.currentDifficulty;
  }

  // 设置游戏模式
  setMode(mode: GameMode): boolean {
    const modeConfig = this.getModeConfig(mode);
    if (!modeConfig || !modeConfig.enabled) {
      return false;
    }

    this.currentMode = mode;
    this.notifyListeners();
    return true;
  }

  // 设置游戏难度
  setDifficulty(difficulty: GameDifficulty): void {
    this.currentDifficulty = difficulty;
    this.notifyListeners();
  }

  // 获取当前模式配置
  getCurrentModeConfig(): GameModeConfig {
    return this.getModeConfig(this.currentMode)!;
  }

  // 获取模式配置
  getModeConfig(mode: GameMode): GameModeConfig | null {
    return GAME_MODE_PRESETS[mode] || this.customModes.get(mode) || null;
  }

  // 获取所有可用模式
  getAvailableModes(): GameModeConfig[] {
    return Object.values(GAME_MODE_PRESETS)
      .filter(mode => mode.enabled)
      .concat(Array.from(this.customModes.values()));
  }

  // 获取当前游戏配置
  getCurrentGameConfig(): GameConfig {
    const modeConfig = this.getCurrentModeConfig();
    const difficultyConfig = DIFFICULTY_CONFIGS[this.currentDifficulty];
    
    // 合并模式规则和难度配置
    const rules = { ...modeConfig.rules, ...difficultyConfig };
    
    return {
      mode: this.currentMode,
      difficulty: this.currentDifficulty,
      initialSpeed: rules.initialSpeed!,
      enableSpecialBlocks: rules.specialBlocksEnabled,
      enableCombo: rules.comboEnabled,
      gridWidth: rules.gridSize.width,
      gridHeight: rules.gridSize.height,
    };
  }

  // 获取当前模式规则
  getCurrentRules(): GameModeRules {
    const modeConfig = this.getCurrentModeConfig();
    const difficultyConfig = DIFFICULTY_CONFIGS[this.currentDifficulty];
    return { ...modeConfig.rules, ...difficultyConfig };
  }

  // 创建自定义模式
  createCustomMode(config: Omit<GameModeConfig, 'id'>): string {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customMode: GameModeConfig = {
      ...config,
      id: id as GameMode,
    };
    
    this.customModes.set(id, customMode);
    return id;
  }

  // 更新自定义模式
  updateCustomMode(id: string, config: Partial<GameModeConfig>): boolean {
    const existingMode = this.customModes.get(id);
    if (!existingMode) {
      return false;
    }

    const updatedMode = { ...existingMode, ...config };
    this.customModes.set(id, updatedMode);
    return true;
  }

  // 删除自定义模式
  deleteCustomMode(id: string): boolean {
    return this.customModes.delete(id);
  }

  // 启用/禁用模式
  setModeEnabled(mode: GameMode, enabled: boolean): boolean {
    const modeConfig = this.getModeConfig(mode);
    if (!modeConfig) {
      return false;
    }

    modeConfig.enabled = enabled;
    return true;
  }

  // 添加模式变化监听器
  addModeChangeListener(id: string, callback: (mode: GameMode, difficulty: GameDifficulty) => void): void {
    this.listeners.set(id, callback);
  }

  // 移除模式变化监听器
  removeModeChangeListener(id: string): void {
    this.listeners.delete(id);
  }

  // 通知监听器
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      callback(this.currentMode, this.currentDifficulty);
    });
  }

  // 重置为默认模式
  resetToDefault(): void {
    this.currentMode = GameMode.CLASSIC;
    this.currentDifficulty = GameDifficulty.MEDIUM;
    this.notifyListeners();
  }

  // 获取模式统计信息
  getModeStats(): Record<GameMode, { gamesPlayed: number; bestScore: number; totalTime: number }> {
    // 这里应该从存储中获取统计数据
    // 暂时返回空数据
    return {
      [GameMode.CLASSIC]: { gamesPlayed: 0, bestScore: 0, totalTime: 0 },
      [GameMode.TIME_ATTACK]: { gamesPlayed: 0, bestScore: 0, totalTime: 0 },
      [GameMode.CHALLENGE]: { gamesPlayed: 0, bestScore: 0, totalTime: 0 },
    };
  }

  // 验证模式配置
  validateModeConfig(config: Partial<GameModeRules>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.initialSpeed !== undefined && (config.initialSpeed < 50 || config.initialSpeed > 2000)) {
      errors.push('初始速度必须在50-2000毫秒之间');
    }

    if (config.speedIncrease !== undefined && (config.speedIncrease <= 0 || config.speedIncrease >= 1)) {
      errors.push('速度增长倍数必须在0-1之间');
    }

    if (config.levelUpLines !== undefined && (config.levelUpLines < 1 || config.levelUpLines > 50)) {
      errors.push('升级所需行数必须在1-50之间');
    }

    if (config.maxLevel !== undefined && (config.maxLevel < 1 || config.maxLevel > 100)) {
      errors.push('最大等级必须在1-100之间');
    }

    if (config.scoringMultiplier !== undefined && (config.scoringMultiplier <= 0 || config.scoringMultiplier > 5)) {
      errors.push('分数倍数必须在0-5之间');
    }

    if (config.timeLimit !== undefined && (config.timeLimit < 10 || config.timeLimit > 3600)) {
      errors.push('时间限制必须在10-3600秒之间');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // 导出模式配置
  exportModeConfig(mode: GameMode): string | null {
    const modeConfig = this.getModeConfig(mode);
    if (!modeConfig) {
      return null;
    }

    return JSON.stringify(modeConfig, null, 2);
  }

  // 导入模式配置
  importModeConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson) as GameModeConfig;
      
      // 验证配置
      const validation = this.validateModeConfig(config.rules);
      if (!validation.valid) {
        return false;
      }

      // 创建自定义模式
      this.createCustomMode(config);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// 单例实例
let gameModeManagerInstance: GameModeManager | null = null;

// 获取游戏模式管理器实例
export const getGameModeManager = (): GameModeManager => {
  if (!gameModeManagerInstance) {
    gameModeManagerInstance = new GameModeManager();
  }
  return gameModeManagerInstance;
};

// 重置游戏模式管理器实例
export const resetGameModeManager = (): void => {
  gameModeManagerInstance = null;
};

export default GameModeManager;
