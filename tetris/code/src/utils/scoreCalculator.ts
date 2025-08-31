import { GameMode, GameDifficulty } from '@/types';
import { ScoreAction, ScoreEvent } from '@/services/ScoreSystem';

// 分数计算器工具类
export class ScoreCalculator {
  
  // 计算基础行消除分数
  static calculateBasicLineScore(lines: number): number {
    const basePoints = [0, 100, 300, 500, 800];
    return basePoints[Math.min(lines, 4)] || 1000;
  }

  // 计算T-Spin分数
  static calculateTSpinScore(lines: number, mini: boolean = false): number {
    if (mini) {
      // Mini T-Spin分数
      const miniPoints = [0, 100, 200, 400, 800];
      return miniPoints[Math.min(lines, 4)] || 0;
    }
    
    // 标准T-Spin分数
    const tSpinPoints = [0, 800, 1200, 1600, 2000];
    return tSpinPoints[Math.min(lines, 4)] || 0;
  }

  // 计算全消奖励
  static calculatePerfectClearBonus(lines: number, boardHeight: number): number {
    // 全消的基础奖励取决于消除的行数
    const baseBonus = [0, 800, 1200, 1800, 2000];
    const bonus = baseBonus[Math.min(lines, 4)] || 0;
    
    // 板面高度影响奖励 (更高的板面全消更难)
    const heightMultiplier = Math.max(1, boardHeight / 10);
    
    return Math.floor(bonus * heightMultiplier);
  }

  // 计算连击分数
  static calculateComboScore(comboCount: number, lines: number): number {
    // 连击分数公式: 基础分数 * 连击倍数
    const baseComboScore = 50 * comboCount;
    const lineMultiplier = Math.max(1, lines);
    return baseComboScore * lineMultiplier;
  }

  // 计算等级倍数
  static calculateLevelMultiplier(level: number): number {
    return 1 + (level - 1) * 0.1; // 每级增加10%
  }

  // 计算难度倍数
  static calculateDifficultyMultiplier(difficulty: GameDifficulty): number {
    const multipliers = {
      [GameDifficulty.EASY]: 0.8,
      [GameDifficulty.MEDIUM]: 1.0,
      [GameDifficulty.HARD]: 1.3,
      [GameDifficulty.EXPERT]: 1.6,
    };
    return multipliers[difficulty] || 1.0;
  }

  // 计算游戏模式倍数
  static calculateModeMultiplier(mode: GameMode): number {
    const multipliers = {
      [GameMode.CLASSIC]: 1.0,
      [GameMode.TIME_ATTACK]: 1.2,
      [GameMode.CHALLENGE]: 1.5,
    };
    return multipliers[mode] || 1.0;
  }

  // 计算软降分数
  static calculateSoftDropScore(cells: number, level: number): number {
    return cells * Math.max(1, level);
  }

  // 计算硬降分数
  static calculateHardDropScore(cells: number, level: number): number {
    return cells * 2 * Math.max(1, level);
  }

  // 计算时间奖励 (时间攻击模式)
  static calculateTimeBonus(remainingTime: number, totalTime: number): number {
    const timeRatio = remainingTime / totalTime;
    return Math.floor(timeRatio * 1000); // 最多1000分时间奖励
  }

  // 计算效率分数 (每秒分数)
  static calculateEfficiencyScore(totalScore: number, timeElapsed: number): number {
    if (timeElapsed <= 0) return 0;
    return Math.floor(totalScore / (timeElapsed / 1000));
  }

  // 预测分数变化
  static predictScoreChange(
    currentScore: number,
    action: ScoreAction,
    context: {
      lines?: number;
      level?: number;
      combo?: number;
      difficulty?: GameDifficulty;
      mode?: GameMode;
      dropHeight?: number;
      tSpin?: boolean;
      perfectClear?: boolean;
    }
  ): number {
    const {
      lines = 0,
      level = 1,
      combo = 0,
      difficulty = GameDifficulty.MEDIUM,
      mode = GameMode.CLASSIC,
      dropHeight = 0,
      tSpin = false,
      perfectClear = false,
    } = context;

    let baseScore = 0;

    switch (action) {
      case ScoreAction.CLEAR_LINE:
        baseScore = this.calculateBasicLineScore(lines);
        if (tSpin) {
          baseScore = this.calculateTSpinScore(lines);
        }
        if (perfectClear) {
          baseScore += this.calculatePerfectClearBonus(lines, 20);
        }
        if (combo > 0) {
          baseScore += this.calculateComboScore(combo, lines);
        }
        break;

      case ScoreAction.SOFT_DROP:
        baseScore = this.calculateSoftDropScore(dropHeight, level);
        break;

      case ScoreAction.HARD_DROP:
        baseScore = this.calculateHardDropScore(dropHeight, level);
        break;

      case ScoreAction.PLACE_BLOCK:
        baseScore = Math.max(1, dropHeight);
        break;

      default:
        baseScore = 0;
    }

    // 应用倍数
    const levelMultiplier = this.calculateLevelMultiplier(level);
    const difficultyMultiplier = this.calculateDifficultyMultiplier(difficulty);
    const modeMultiplier = this.calculateModeMultiplier(mode);

    const finalScore = Math.floor(baseScore * levelMultiplier * difficultyMultiplier * modeMultiplier);
    return finalScore;
  }
}

// 分数格式化工具
export class ScoreFormatter {
  
  // 格式化分数显示
  static formatScore(score: number): string {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    } else if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toString();
  }

  // 格式化分数差值
  static formatScoreDelta(delta: number): string {
    const prefix = delta > 0 ? '+' : '';
    return `${prefix}${this.formatScore(delta)}`;
  }

  // 格式化等级
  static formatLevel(level: number): string {
    return `Lv.${level}`;
  }

  // 格式化连击
  static formatCombo(combo: number): string {
    if (combo <= 0) return '';
    return `${combo} COMBO!`;
  }

  // 格式化时间
  static formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
  }

  // 格式化行数
  static formatLines(lines: number): string {
    return `${lines} Lines`;
  }

  // 格式化效率
  static formatEfficiency(score: number, time: number): string {
    const efficiency = ScoreCalculator.calculateEfficiencyScore(score, time);
    return `${efficiency} PPS`; // Points Per Second
  }

  // 格式化成就进度
  static formatAchievementProgress(current: number, required: number): string {
    const percentage = Math.floor((current / required) * 100);
    return `${current}/${required} (${percentage}%)`;
  }
}

// 分数分析工具
export class ScoreAnalyzer {
  
  // 分析分数分布
  static analyzeScoreDistribution(events: ScoreEvent[]): {
    byAction: Record<ScoreAction, { count: number; total: number; average: number }>;
    totalScore: number;
    averageScore: number;
    highestSingle: number;
  } {
    const distribution: Record<ScoreAction, { count: number; total: number; average: number }> = {} as Record<ScoreAction, { count: number; total: number; average: number }>;
    let totalScore = 0;
    let highestSingle = 0;

    // 初始化分布记录
    Object.values(ScoreAction).forEach(action => {
      distribution[action] = { count: 0, total: 0, average: 0 };
    });

    // 统计分数事件
    events.forEach(event => {
      const actionStats = distribution[event.action];
      actionStats.count++;
      actionStats.total += event.value;
      
      totalScore += event.value;
      highestSingle = Math.max(highestSingle, event.value);
    });

    // 计算平均值
    Object.values(distribution).forEach(stats => {
      stats.average = stats.count > 0 ? stats.total / stats.count : 0;
    });

    return {
      byAction: distribution,
      totalScore,
      averageScore: events.length > 0 ? totalScore / events.length : 0,
      highestSingle,
    };
  }

  // 分析游戏表现
  static analyzePerformance(events: ScoreEvent[], gameTime: number): {
    efficiency: number;
    consistency: number;
    peakPerformanceTime: number;
    scoreVelocity: number[];
  } {
    if (events.length === 0) {
      return {
        efficiency: 0,
        consistency: 0,
        peakPerformanceTime: 0,
        scoreVelocity: [],
      };
    }

    const totalScore = events.reduce((sum, event) => sum + event.value, 0);
    const efficiency = ScoreCalculator.calculateEfficiencyScore(totalScore, gameTime);

    // 计算一致性 (分数标准差)
    const averageScore = totalScore / events.length;
    const variance = events.reduce((sum, event) => {
      return sum + Math.pow(event.value - averageScore, 2);
    }, 0) / events.length;
    const consistency = Math.max(0, 100 - Math.sqrt(variance) / averageScore * 100);

    // 找到得分最高的时间段
    const timeWindow = 30000; // 30秒窗口
    let maxWindowScore = 0;
    let peakPerformanceTime = 0;

    for (let i = 0; i < events.length; i++) {
      const windowStart = events[i].timestamp;
      const windowEnd = windowStart + timeWindow;
      
      const windowScore = events
        .filter(event => event.timestamp >= windowStart && event.timestamp <= windowEnd)
        .reduce((sum, event) => sum + event.value, 0);

      if (windowScore > maxWindowScore) {
        maxWindowScore = windowScore;
        peakPerformanceTime = windowStart;
      }
    }

    // 计算分数速度 (每10秒的得分)
    const scoreVelocity: number[] = [];
    const velocityWindow = 10000; // 10秒窗口
    
    for (let time = 0; time < gameTime; time += velocityWindow) {
      const windowScore = events
        .filter(event => event.timestamp >= time && event.timestamp < time + velocityWindow)
        .reduce((sum, event) => sum + event.value, 0);
      
      scoreVelocity.push(windowScore);
    }

    return {
      efficiency,
      consistency,
      peakPerformanceTime,
      scoreVelocity,
    };
  }

  // 预测最终分数
  static predictFinalScore(
    currentScore: number,
    elapsedTime: number,
    totalGameTime: number,
    recentEvents: ScoreEvent[]
  ): number {
    if (recentEvents.length === 0 || elapsedTime >= totalGameTime) {
      return currentScore;
    }

    // 计算最近的得分速度
    const recentWindow = Math.min(30000, elapsedTime); // 最近30秒
    const recentStartTime = elapsedTime - recentWindow;
    
    const recentScore = recentEvents
      .filter(event => event.timestamp >= recentStartTime)
      .reduce((sum, event) => sum + event.value, 0);

    const scoreRate = recentScore / recentWindow; // 每毫秒得分
    const remainingTime = totalGameTime - elapsedTime;
    
    // 预测剩余时间的得分 (考虑递减因子)
    const decayFactor = 0.9; // 假设效率会逐渐下降
    const predictedScore = scoreRate * remainingTime * decayFactor;
    
    return Math.floor(currentScore + predictedScore);
  }
}

// 导出常用函数
export const scoreUtils = {
  formatScore: ScoreFormatter.formatScore,
  formatTime: ScoreFormatter.formatTime,
  calculateBasicScore: ScoreCalculator.calculateBasicLineScore,
  calculateMultiplier: (level: number, difficulty: GameDifficulty) => 
    ScoreCalculator.calculateLevelMultiplier(level) * ScoreCalculator.calculateDifficultyMultiplier(difficulty),
};
