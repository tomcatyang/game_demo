import { 
  GameState, 
  GameMode, 
  GameDifficulty, 
  GameConfig, 
  GameStats, 
  GameContext 
} from '@/types';

// 默认游戏配置
export const defaultGameConfig: GameConfig = {
  mode: GameMode.CLASSIC,
  difficulty: GameDifficulty.MEDIUM,
  initialSpeed: 500, // 毫秒
  enableSpecialBlocks: false,
  enableCombo: true,
  gridWidth: 10,
  gridHeight: 20,
};

// 默认游戏统计
export const defaultGameStats: GameStats = {
  score: 0,
  level: 1,
  lines: 0,
  combo: 0,
  totalTime: 0,
  totalGames: 0,
  totalLines: 0,
  highScores: {
    [GameMode.CLASSIC]: 0,
    [GameMode.TIME_ATTACK]: 0,
    [GameMode.CHALLENGE]: 0,
  },
};

// 游戏状态类
export class GameStateManager {
  private context: GameContext;
  private listeners: Set<(context: GameContext) => void> = new Set();

  constructor(config?: Partial<GameConfig>) {
    this.context = {
      state: GameState.MENU,
      config: { ...defaultGameConfig, ...config },
      stats: { ...defaultGameStats },
      startTime: 0,
      lastUpdateTime: 0,
    };
  }

  // 获取当前游戏上下文
  getContext(): GameContext {
    return { ...this.context };
  }

  // 获取当前游戏状态
  getState(): GameState {
    return this.context.state;
  }

  // 设置游戏状态
  setState(newState: GameState): void {
    if (this.context.state !== newState) {
      this.context.state = newState;
      this.context.lastUpdateTime = Date.now();
      
      // 特殊状态处理
      if (newState === GameState.PLAYING && this.context.startTime === 0) {
        this.context.startTime = Date.now();
      }
      
      this.notifyListeners();
    }
  }

  // 更新游戏配置
  updateConfig(config: Partial<GameConfig>): void {
    this.context.config = { ...this.context.config, ...config };
    this.notifyListeners();
  }

  // 更新游戏统计
  updateStats(stats: Partial<GameStats>): void {
    this.context.stats = { ...this.context.stats, ...stats };
    this.notifyListeners();
  }

  // 重置游戏
  resetGame(): void {
    const config = this.context.config;
    this.context = {
      state: GameState.MENU,
      config,
      stats: { ...defaultGameStats },
      startTime: 0,
      lastUpdateTime: Date.now(),
    };
    this.notifyListeners();
  }

  // 开始新游戏
  startNewGame(): void {
    this.context.stats = { ...defaultGameStats };
    this.context.startTime = Date.now();
    this.context.lastUpdateTime = Date.now();
    this.setState(GameState.PLAYING);
  }

  // 暂停游戏
  pauseGame(): void {
    if (this.context.state === GameState.PLAYING) {
      this.setState(GameState.PAUSED);
    }
  }

  // 恢复游戏
  resumeGame(): void {
    if (this.context.state === GameState.PAUSED) {
      this.setState(GameState.PLAYING);
    }
  }

  // 结束游戏
  endGame(): void {
    this.context.stats.totalGames += 1;
    this.context.stats.totalTime += Date.now() - this.context.startTime;
    
    // 更新最高分
    const currentMode = this.context.config.mode;
    if (this.context.stats.score > this.context.stats.highScores[currentMode]) {
      this.context.stats.highScores[currentMode] = this.context.stats.score;
    }
    
    this.setState(GameState.GAME_OVER);
  }

  // 添加状态监听器
  addListener(listener: (context: GameContext) => void): void {
    this.listeners.add(listener);
  }

  // 移除状态监听器
  removeListener(listener: (context: GameContext) => void): void {
    this.listeners.delete(listener);
  }

  // 通知所有监听器
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getContext()));
  }

  // 计算当前等级
  calculateLevel(): number {
    return Math.floor(this.context.stats.lines / 10) + 1;
  }

  // 计算当前速度
  calculateSpeed(): number {
    const level = this.calculateLevel();
    const baseSpeed = this.context.config.initialSpeed;
    return Math.max(50, baseSpeed - (level - 1) * 50);
  }

  // 添加分数
  addScore(points: number, linesCleared: number = 0): void {
    this.context.stats.score += points;
    
    if (linesCleared > 0) {
      this.context.stats.lines += linesCleared;
      this.context.stats.totalLines += linesCleared;
      
      // 更新等级
      this.context.stats.level = this.calculateLevel();
      
      // 处理连击
      if (this.context.config.enableCombo) {
        this.context.stats.combo += 1;
      }
    } else {
      // 重置连击
      this.context.stats.combo = 0;
    }
    
    this.notifyListeners();
  }
}
