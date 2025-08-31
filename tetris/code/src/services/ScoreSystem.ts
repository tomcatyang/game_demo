import { 
  GameMode, 
  GameDifficulty, 
  GameStats,
  Achievement,
  AchievementType,
  AchievementStatus 
} from '@/types';

// 分数动作枚举
export enum ScoreAction {
  PLACE_BLOCK = 'place_block',
  CLEAR_LINE = 'clear_line',
  SOFT_DROP = 'soft_drop',
  HARD_DROP = 'hard_drop',
  T_SPIN = 't_spin',
  PERFECT_CLEAR = 'perfect_clear',
  COMBO = 'combo',
  SPECIAL_BLOCK = 'special_block',
}

// 分数事件接口
export interface ScoreEvent {
  action: ScoreAction;
  value: number;
  multiplier: number;
  bonus: number;
  level: number;
  combo: number;
  lines: number;
  timestamp: number;
  details?: Record<string, unknown>;
}

// 等级信息接口
export interface LevelInfo {
  level: number;
  linesRequired: number;
  linesCompleted: number;
  speed: number;
  scoreMultiplier: number;
  nextLevelAt: number;
}

// 连击信息接口
export interface ComboInfo {
  count: number;
  multiplier: number;
  lastClearTime: number;
  totalBonus: number;
  maxCombo: number;
}

// 分数系统配置
interface ScoreSystemConfig {
  mode: GameMode;
  difficulty: GameDifficulty;
  enableCombo: boolean;
  enableSpecialBlocks: boolean;
  baseLinePoints: number[];
  levelThreshold: number;
  comboTimeout: number; // 连击超时时间(ms)
  maxComboMultiplier: number;
}

// 默认配置
const defaultConfig: ScoreSystemConfig = {
  mode: GameMode.CLASSIC,
  difficulty: GameDifficulty.MEDIUM,
  enableCombo: true,
  enableSpecialBlocks: false,
  baseLinePoints: [0, 100, 300, 500, 800], // 0, 1, 2, 3, 4行分数
  levelThreshold: 10, // 每10行升一级
  comboTimeout: 3000, // 3秒连击超时
  maxComboMultiplier: 5.0,
};

// 分数系统类
export class ScoreSystem {
  private config: ScoreSystemConfig;
  private stats: GameStats;
  private levelInfo: LevelInfo;
  private comboInfo: ComboInfo;
  private achievements: Achievement[];
  private scoreHistory: ScoreEvent[] = [];

  constructor(config?: Partial<ScoreSystemConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.stats = this.initializeStats();
    this.levelInfo = this.initializeLevelInfo();
    this.comboInfo = this.initializeComboInfo();
    this.achievements = this.initializeAchievements();
  }

  // 计算行消除分数
  calculateLineScore(linesCleared: number, tSpin: boolean = false, perfectClear: boolean = false): ScoreEvent {
    if (linesCleared === 0) {
      return this.createScoreEvent(ScoreAction.CLEAR_LINE, 0, 1, 0);
    }

    // 基础分数
    const baseScore = this.config.baseLinePoints[Math.min(linesCleared, 4)] || 1000;
    
    // 等级倍数
    const levelMultiplier = this.getLevelMultiplier();
    
    // 难度倍数
    const difficultyMultiplier = this.getDifficultyMultiplier();
    
    // T-Spin奖励
    const tSpinMultiplier = tSpin ? this.getTSpinMultiplier(linesCleared) : 1;
    
    // 全消奖励
    const perfectClearBonus = perfectClear ? this.getPerfectClearBonus(linesCleared) : 0;
    
    // 连击奖励
    const comboMultiplier = this.config.enableCombo ? this.updateCombo() : 1;
    
    // 总倍数
    const totalMultiplier = levelMultiplier * difficultyMultiplier * tSpinMultiplier * comboMultiplier;
    
    // 最终分数
    const finalScore = Math.floor(baseScore * totalMultiplier) + perfectClearBonus;
    
    // 更新统计
    this.updateStats(finalScore, linesCleared);
    
    // 检查升级
    this.checkLevelUp(linesCleared);
    
    // 检查成就
    this.checkAchievements(ScoreAction.CLEAR_LINE, { linesCleared, tSpin, perfectClear });

    return this.createScoreEvent(
      ScoreAction.CLEAR_LINE, 
      finalScore, 
      totalMultiplier, 
      perfectClearBonus,
      { linesCleared, tSpin, perfectClear }
    );
  }

  // 计算方块放置分数
  calculatePlaceBlockScore(dropHeight: number, hardDrop: boolean = false): ScoreEvent {
    const action = hardDrop ? ScoreAction.HARD_DROP : ScoreAction.PLACE_BLOCK;
    const baseScore = hardDrop ? dropHeight * 2 : Math.max(1, dropHeight);
    const levelMultiplier = this.getLevelMultiplier();
    const finalScore = Math.floor(baseScore * levelMultiplier);
    
    this.updateStats(finalScore, 0);
    
    return this.createScoreEvent(action, finalScore, levelMultiplier, 0, { dropHeight, hardDrop });
  }

  // 计算软降分数
  calculateSoftDropScore(cells: number): ScoreEvent {
    const baseScore = cells;
    const finalScore = Math.floor(baseScore * this.getLevelMultiplier());
    
    this.updateStats(finalScore, 0);
    
    return this.createScoreEvent(ScoreAction.SOFT_DROP, finalScore, this.getLevelMultiplier(), 0, { cells });
  }

  // 计算特殊方块分数
  calculateSpecialBlockScore(specialType: string, affectedCells: number): ScoreEvent {
    const baseScore = this.getSpecialBlockBaseScore(specialType, affectedCells);
    const levelMultiplier = this.getLevelMultiplier();
    const finalScore = Math.floor(baseScore * levelMultiplier);
    
    this.updateStats(finalScore, 0);
    this.checkAchievements(ScoreAction.SPECIAL_BLOCK, { specialType, affectedCells });
    
    return this.createScoreEvent(
      ScoreAction.SPECIAL_BLOCK, 
      finalScore, 
      levelMultiplier, 
      0, 
      { specialType, affectedCells }
    );
  }

  // 重置连击
  resetCombo(): void {
    if (this.config.enableCombo) {
      this.comboInfo.count = 0;
      this.comboInfo.multiplier = 1;
      this.comboInfo.lastClearTime = 0;
    }
  }

  // 检查连击超时
  checkComboTimeout(): void {
    if (this.config.enableCombo && this.comboInfo.count > 0) {
      const now = Date.now();
      if (now - this.comboInfo.lastClearTime > this.config.comboTimeout) {
        this.resetCombo();
      }
    }
  }

  // 获取当前统计
  getStats(): GameStats {
    return { ...this.stats };
  }

  // 获取等级信息
  getLevelInfo(): LevelInfo {
    return { ...this.levelInfo };
  }

  // 获取连击信息
  getComboInfo(): ComboInfo {
    return { ...this.comboInfo };
  }

  // 获取成就列表
  getAchievements(): Achievement[] {
    return this.achievements.map(a => ({ ...a }));
  }

  // 获取分数历史
  getScoreHistory(limit?: number): ScoreEvent[] {
    const history = [...this.scoreHistory];
    return limit ? history.slice(-limit) : history;
  }

  // 获取高分记录
  getHighScore(mode?: GameMode): number {
    if (mode) {
      return this.stats.highScores[mode] || 0;
    }
    return Math.max(...Object.values(this.stats.highScores));
  }

  // 更新高分记录
  updateHighScore(): boolean {
    const currentScore = this.stats.score;
    const previousHigh = this.stats.highScores[this.config.mode] || 0;
    
    if (currentScore > previousHigh) {
      this.stats.highScores[this.config.mode] = currentScore;
      this.checkAchievements(ScoreAction.CLEAR_LINE, { newHighScore: true });
      return true;
    }
    
    return false;
  }

  // 重置统计
  reset(): void {
    this.stats = this.initializeStats();
    this.levelInfo = this.initializeLevelInfo();
    this.comboInfo = this.initializeComboInfo();
    this.scoreHistory = [];
  }

  // 更新配置
  updateConfig(newConfig: Partial<ScoreSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 获取配置
  getConfig(): ScoreSystemConfig {
    return { ...this.config };
  }

  // 私有方法

  // 初始化统计
  private initializeStats(): GameStats {
    return {
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
  }

  // 初始化等级信息
  private initializeLevelInfo(): LevelInfo {
    return {
      level: 1,
      linesRequired: this.config.levelThreshold,
      linesCompleted: 0,
      speed: this.getInitialSpeed(),
      scoreMultiplier: 1.0,
      nextLevelAt: this.config.levelThreshold,
    };
  }

  // 初始化连击信息
  private initializeComboInfo(): ComboInfo {
    return {
      count: 0,
      multiplier: 1,
      lastClearTime: 0,
      totalBonus: 0,
      maxCombo: 0,
    };
  }

  // 初始化成就
  private initializeAchievements(): Achievement[] {
    return [
      {
        id: 'first_line',
        name: '初次消行',
        description: '消除第一行方块',
        type: AchievementType.LINES,
        requirement: 1,
        progress: 0,
        status: AchievementStatus.LOCKED,
        icon: '🎯',
      },
      {
        id: 'hundred_lines',
        name: '百行达人',
        description: '累计消除100行',
        type: AchievementType.LINES,
        requirement: 100,
        progress: 0,
        status: AchievementStatus.LOCKED,
        icon: '💯',
      },
      {
        id: 'first_tetris',
        name: '四消高手',
        description: '完成第一次Tetris(四行消除)',
        type: AchievementType.SPECIAL,
        requirement: 1,
        progress: 0,
        status: AchievementStatus.LOCKED,
        icon: '🔥',
      },
      {
        id: 'combo_master',
        name: '连击大师',
        description: '达成10连击',
        type: AchievementType.COMBO,
        requirement: 10,
        progress: 0,
        status: AchievementStatus.LOCKED,
        icon: '⚡',
      },
      {
        id: 'score_10k',
        name: '万分选手',
        description: '单局得分超过10000',
        type: AchievementType.SCORE,
        requirement: 10000,
        progress: 0,
        status: AchievementStatus.LOCKED,
        icon: '🏆',
      },
    ];
  }

  // 创建分数事件
  private createScoreEvent(
    action: ScoreAction, 
    value: number, 
    multiplier: number, 
    bonus: number,
    details?: Record<string, unknown>
  ): ScoreEvent {
    const event: ScoreEvent = {
      action,
      value,
      multiplier,
      bonus,
      level: this.stats.level,
      combo: this.comboInfo.count,
      lines: this.stats.lines,
      timestamp: Date.now(),
      details,
    };
    
    this.scoreHistory.push(event);
    return event;
  }

  // 更新统计
  private updateStats(score: number, lines: number): void {
    this.stats.score += score;
    this.stats.lines += lines;
    this.stats.totalLines += lines;
    this.stats.combo = this.comboInfo.count;
  }

  // 更新连击
  private updateCombo(): number {
    if (!this.config.enableCombo) return 1;
    
    const now = Date.now();
    
    // 检查连击超时
    if (this.comboInfo.count > 0 && now - this.comboInfo.lastClearTime > this.config.comboTimeout) {
      this.resetCombo();
    }
    
    // 增加连击
    this.comboInfo.count++;
    this.comboInfo.lastClearTime = now;
    this.comboInfo.maxCombo = Math.max(this.comboInfo.maxCombo, this.comboInfo.count);
    
    // 计算连击倍数 (1.0 + 0.5 * (combo - 1), 最大5.0)
    this.comboInfo.multiplier = Math.min(
      1.0 + 0.5 * (this.comboInfo.count - 1),
      this.config.maxComboMultiplier
    );
    
    // 连击奖励分数
    const comboBonus = this.comboInfo.count * 50;
    this.comboInfo.totalBonus += comboBonus;
    
    return this.comboInfo.multiplier;
  }

  // 检查升级
  private checkLevelUp(lines: number): void {
    this.levelInfo.linesCompleted += lines;
    
    while (this.levelInfo.linesCompleted >= this.levelInfo.nextLevelAt) {
      this.levelInfo.level++;
      this.stats.level = this.levelInfo.level;
      this.levelInfo.linesCompleted -= this.levelInfo.linesRequired;
      this.levelInfo.nextLevelAt = this.levelInfo.linesRequired;
      
      // 更新游戏速度和分数倍数
      this.levelInfo.speed = this.calculateSpeed(this.levelInfo.level);
      this.levelInfo.scoreMultiplier = this.calculateScoreMultiplier(this.levelInfo.level);
      
      // 升级成就检查
      this.checkAchievements(ScoreAction.CLEAR_LINE, { levelUp: true, level: this.levelInfo.level });
    }
  }

  // 检查成就
  private checkAchievements(action: ScoreAction, context: Record<string, unknown>): void {
    this.achievements.forEach(achievement => {
      if (achievement.status === AchievementStatus.UNLOCKED) return;
      
      let progress = achievement.progress;
      
      switch (achievement.id) {
        case 'first_line':
          if (action === ScoreAction.CLEAR_LINE && this.stats.lines >= 1) {
            progress = Math.min(1, this.stats.lines);
          }
          break;
          
        case 'hundred_lines':
          if (action === ScoreAction.CLEAR_LINE) {
            progress = Math.min(100, this.stats.totalLines);
          }
          break;
          
        case 'first_tetris':
          if (action === ScoreAction.CLEAR_LINE && context.linesCleared === 4) {
            progress = 1;
          }
          break;
          
        case 'combo_master':
          if (action === ScoreAction.CLEAR_LINE) {
            progress = Math.min(10, this.comboInfo.maxCombo);
          }
          break;
          
        case 'score_10k':
          progress = Math.min(10000, this.stats.score);
          break;
      }
      
      achievement.progress = progress;
      
      if (progress >= achievement.requirement && achievement.status === AchievementStatus.LOCKED) {
        achievement.status = AchievementStatus.UNLOCKED;
        achievement.unlockedAt = new Date();
      } else if (progress > 0 && achievement.status === AchievementStatus.LOCKED) {
        achievement.status = AchievementStatus.IN_PROGRESS;
      }
    });
  }

  // 获取等级倍数
  private getLevelMultiplier(): number {
    return 1 + (this.stats.level - 1) * 0.1; // 每级增加10%
  }

  // 获取难度倍数
  private getDifficultyMultiplier(): number {
    switch (this.config.difficulty) {
      case GameDifficulty.EASY: return 0.8;
      case GameDifficulty.MEDIUM: return 1.0;
      case GameDifficulty.HARD: return 1.3;
      case GameDifficulty.EXPERT: return 1.6;
      default: return 1.0;
    }
  }

  // 获取T-Spin倍数
  private getTSpinMultiplier(lines: number): number {
    const baseMultiplier = [0, 3, 5, 8, 12]; // T-Spin倍数
    return baseMultiplier[Math.min(lines, 4)] || 1;
  }

  // 获取全消奖励
  private getPerfectClearBonus(lines: number): number {
    const bonus = [0, 800, 1200, 1800, 2000]; // 全消奖励
    return bonus[Math.min(lines, 4)] || 0;
  }

  // 获取特殊方块基础分数
  private getSpecialBlockBaseScore(specialType: string, affectedCells: number): number {
    switch (specialType) {
      case 'bomb': return 500 + affectedCells * 10;
      case 'lock': return 200;
      default: return 100;
    }
  }

  // 获取初始速度
  private getInitialSpeed(): number {
    switch (this.config.difficulty) {
      case GameDifficulty.EASY: return 1000;
      case GameDifficulty.MEDIUM: return 800;
      case GameDifficulty.HARD: return 600;
      case GameDifficulty.EXPERT: return 400;
      default: return 800;
    }
  }

  // 计算游戏速度
  private calculateSpeed(level: number): number {
    const initialSpeed = this.getInitialSpeed();
    return Math.max(50, initialSpeed - (level - 1) * 50); // 每级加快50ms，最快50ms
  }

  // 计算分数倍数
  private calculateScoreMultiplier(level: number): number {
    return 1 + (level - 1) * 0.05; // 每级增加5%
  }
}
