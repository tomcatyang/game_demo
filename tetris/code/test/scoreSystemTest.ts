import { ScoreSystem, ScoreAction } from '../src/services/ScoreSystem';
import { ScoreCalculator, ScoreFormatter, ScoreAnalyzer } from '../src/utils/scoreCalculator';
import { GameMode, GameDifficulty } from '../src/types';
import { BaseTest } from './utils/testUtils';

// 分数系统测试类
export class ScoreSystemTest extends BaseTest {

  // 运行所有测试
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Score System Tests...');
    
    this.testScoreSystemInitialization();
    this.testLineScoreCalculation();
    await this.testComboSystem();
    this.testLevelSystem();
    this.testAchievementSystem();
    this.testScoreCalculator();
    this.testScoreFormatter();
    this.testScoreAnalyzer();
    this.testSpecialScores();
    this.testHighScoreTracking();
    
    this.printResults();
  }

  // 测试分数系统初始化
  private testScoreSystemInitialization(): void {
    try {
      const scoreSystem = new ScoreSystem();
      const stats = scoreSystem.getStats();
      const levelInfo = scoreSystem.getLevelInfo();
      const comboInfo = scoreSystem.getComboInfo();
      
      // 测试初始状态
      this.addTestResult('Initial Score Zero', stats.score === 0);
      this.addTestResult('Initial Level One', stats.level === 1);
      this.addTestResult('Initial Lines Zero', stats.lines === 0);
      this.addTestResult('Initial Combo Zero', stats.combo === 0);
      
      // 测试等级信息
      this.addTestResult('Level Info Valid', 
        levelInfo.level === 1 && levelInfo.linesRequired > 0);
      
      // 测试连击信息
      this.addTestResult('Combo Info Valid', 
        comboInfo.count === 0 && comboInfo.multiplier === 1);
      
      // 测试成就系统
      const achievements = scoreSystem.getAchievements();
      this.addTestResult('Achievements Initialized', achievements.length > 0);
      
    } catch (error) {
      this.addTestResult('Score System Initialization', false, `Error: ${error}`);
    }
  }

  // 测试行消除分数计算
  private testLineScoreCalculation(): void {
    try {
      const scoreSystem = new ScoreSystem({
        difficulty: GameDifficulty.MEDIUM,
        enableCombo: false, // 暂时禁用连击以测试基础分数
      });
      
      // 测试单行消除
      const singleLineEvent = scoreSystem.calculateLineScore(1);
      this.addTestResult('Single Line Score', 
        singleLineEvent.value === 100 && singleLineEvent.action === ScoreAction.CLEAR_LINE);
      
      // 测试双行消除
      const doubleLineEvent = scoreSystem.calculateLineScore(2);
      this.addTestResult('Double Line Score', 
        doubleLineEvent.value === 300);
      
      // 测试Tetris(四行消除)
      const tetrisEvent = scoreSystem.calculateLineScore(4);
      this.addTestResult('Tetris Score', 
        tetrisEvent.value === 800);
      
      // 测试T-Spin
      const tSpinEvent = scoreSystem.calculateLineScore(1, true);
      this.addTestResult('T-Spin Score', 
        tSpinEvent.value > singleLineEvent.value);
      
      // 测试全消奖励
      const perfectClearEvent = scoreSystem.calculateLineScore(1, false, true);
      this.addTestResult('Perfect Clear Bonus', 
        perfectClearEvent.value > singleLineEvent.value);
      
    } catch (error) {
      this.addTestResult('Line Score Calculation', false, `Error: ${error}`);
    }
  }

  // 测试连击系统
  private async testComboSystem(): Promise<void> {
    try {
      const scoreSystem = new ScoreSystem({
        enableCombo: true,
        comboTimeout: 1000, // 1秒超时便于测试
      });
      
      // 第一次消行建立连击
      const firstClear = scoreSystem.calculateLineScore(1);
      let comboInfo = scoreSystem.getComboInfo();
      this.addTestResult('First Combo Established', comboInfo.count === 1);
      
      // 第二次消行增加连击
      const secondClear = scoreSystem.calculateLineScore(1);
      comboInfo = scoreSystem.getComboInfo();
      this.addTestResult('Combo Increased', 
        comboInfo.count === 2 && secondClear.value > firstClear.value);
      
      // 测试连击超时
      scoreSystem.checkComboTimeout(); // 应该还未超时
      comboInfo = scoreSystem.getComboInfo();
      this.addTestResult('Combo Not Timed Out', comboInfo.count === 2);
      
      // 手动超时测试
      await this.sleep(1100); // 等待超过超时时间
      scoreSystem.checkComboTimeout();
      comboInfo = scoreSystem.getComboInfo();
      this.addTestResult('Combo Timed Out', comboInfo.count === 0);
      
      // 测试连击重置
      scoreSystem.calculateLineScore(1);
      scoreSystem.resetCombo();
      comboInfo = scoreSystem.getComboInfo();
      this.addTestResult('Combo Reset', comboInfo.count === 0);
      
    } catch (error) {
      this.addTestResult('Combo System', false, `Error: ${error}`);
    }
  }

  // 测试等级系统
  private testLevelSystem(): void {
    try {
      const scoreSystem = new ScoreSystem({
        levelThreshold: 5, // 5行升一级便于测试
      });
      
      let levelInfo = scoreSystem.getLevelInfo();
      const initialLevel = levelInfo.level;
      this.addTestResult('Initial Level', initialLevel === 1);
      
      // 消除4行，不应该升级
      scoreSystem.calculateLineScore(4);
      levelInfo = scoreSystem.getLevelInfo();
      this.addTestResult('Level Not Increased', levelInfo.level === initialLevel);
      
      // 再消除2行，应该升级
      scoreSystem.calculateLineScore(2);
      levelInfo = scoreSystem.getLevelInfo();
      const stats = scoreSystem.getStats();
      this.addTestResult('Level Increased', 
        levelInfo.level === initialLevel + 1 && stats.level === levelInfo.level);
      
      // 测试等级对分数的影响
      const scoreSystem2 = new ScoreSystem({ enableCombo: false });
      scoreSystem2.calculateLineScore(10); // 快速升级
      const highLevelEvent = scoreSystem2.calculateLineScore(1);
      
      const scoreSystem3 = new ScoreSystem({ enableCombo: false });
      const lowLevelEvent = scoreSystem3.calculateLineScore(1);
      
      this.addTestResult('Level Affects Score', 
        highLevelEvent.value > lowLevelEvent.value);
      
    } catch (error) {
      this.addTestResult('Level System', false, `Error: ${error}`);
    }
  }

  // 测试成就系统
  private testAchievementSystem(): void {
    try {
      const scoreSystem = new ScoreSystem();
      
      // 测试初始成就状态
      let achievements = scoreSystem.getAchievements();
      const firstLineAchievement = achievements.find(a => a.id === 'first_line');
      this.addTestResult('Initial Achievement Locked', 
        firstLineAchievement?.status === 'locked');
      
      // 消除一行解锁成就
      scoreSystem.calculateLineScore(1);
      achievements = scoreSystem.getAchievements();
      const updatedAchievement = achievements.find(a => a.id === 'first_line');
      this.addTestResult('Achievement Unlocked', 
        updatedAchievement?.status === 'unlocked');
      
      // 测试Tetris成就
      scoreSystem.calculateLineScore(4);
      achievements = scoreSystem.getAchievements();
      const tetrisAchievement = achievements.find(a => a.id === 'first_tetris');
      this.addTestResult('Tetris Achievement', 
        tetrisAchievement?.status === 'unlocked');
      
      // 测试分数成就进度
      const scoreAchievement = achievements.find(a => a.id === 'score_10k');
      const currentScore = scoreSystem.getStats().score;
      this.addTestResult('Score Achievement Progress', 
        scoreAchievement && scoreAchievement.progress === Math.min(10000, currentScore));
      
    } catch (error) {
      this.addTestResult('Achievement System', false, `Error: ${error}`);
    }
  }

  // 测试分数计算器
  private testScoreCalculator(): void {
    try {
      // 测试基础分数计算
      const singleLineScore = ScoreCalculator.calculateBasicLineScore(1);
      this.addTestResult('Basic Line Score', singleLineScore === 100);
      
      const tetrisScore = ScoreCalculator.calculateBasicLineScore(4);
      this.addTestResult('Basic Tetris Score', tetrisScore === 800);
      
      // 测试T-Spin分数
      const tSpinSingle = ScoreCalculator.calculateTSpinScore(1);
      this.addTestResult('T-Spin Single', tSpinSingle === 800);
      
      // 测试等级倍数
      const level1Multiplier = ScoreCalculator.calculateLevelMultiplier(1);
      const level5Multiplier = ScoreCalculator.calculateLevelMultiplier(5);
      this.addTestResult('Level Multiplier', 
        level1Multiplier === 1.0 && level5Multiplier === 1.4);
      
      // 测试难度倍数
      const easyMultiplier = ScoreCalculator.calculateDifficultyMultiplier(GameDifficulty.EASY);
      const hardMultiplier = ScoreCalculator.calculateDifficultyMultiplier(GameDifficulty.HARD);
      this.addTestResult('Difficulty Multiplier', 
        easyMultiplier === 0.8 && hardMultiplier === 1.3);
      
      // 测试软降分数
      const softDropScore = ScoreCalculator.calculateSoftDropScore(5, 2);
      this.addTestResult('Soft Drop Score', softDropScore === 10);
      
      // 测试硬降分数
      const hardDropScore = ScoreCalculator.calculateHardDropScore(5, 2);
      this.addTestResult('Hard Drop Score', hardDropScore === 20);
      
    } catch (error) {
      this.addTestResult('Score Calculator', false, `Error: ${error}`);
    }
  }

  // 测试分数格式化
  private testScoreFormatter(): void {
    try {
      // 测试分数格式化
      this.addTestResult('Format Small Score', 
        ScoreFormatter.formatScore(999) === '999');
      this.addTestResult('Format K Score', 
        ScoreFormatter.formatScore(1500) === '1.5K');
      this.addTestResult('Format M Score', 
        ScoreFormatter.formatScore(2500000) === '2.5M');
      
      // 测试分数差值格式化
      this.addTestResult('Format Positive Delta', 
        ScoreFormatter.formatScoreDelta(1500) === '+1.5K');
      this.addTestResult('Format Negative Delta', 
        ScoreFormatter.formatScoreDelta(-500) === '-500');
      
      // 测试等级格式化
      this.addTestResult('Format Level', 
        ScoreFormatter.formatLevel(5) === 'Lv.5');
      
      // 测试连击格式化
      this.addTestResult('Format Combo', 
        ScoreFormatter.formatCombo(3) === '3 COMBO!');
      this.addTestResult('Format No Combo', 
        ScoreFormatter.formatCombo(0) === '');
      
      // 测试时间格式化
      this.addTestResult('Format Time Seconds', 
        ScoreFormatter.formatTime(45000) === '0:45');
      this.addTestResult('Format Time Minutes', 
        ScoreFormatter.formatTime(125000) === '2:05');
      
    } catch (error) {
      this.addTestResult('Score Formatter', false, `Error: ${error}`);
    }
  }

  // 测试分数分析器
  private testScoreAnalyzer(): void {
    try {
      // 创建测试事件
      const testEvents = [
        {
          action: ScoreAction.CLEAR_LINE,
          value: 100,
          multiplier: 1,
          bonus: 0,
          level: 1,
          combo: 0,
          lines: 1,
          timestamp: 1000,
        },
        {
          action: ScoreAction.CLEAR_LINE,
          value: 300,
          multiplier: 1,
          bonus: 0,
          level: 1,
          combo: 1,
          lines: 2,
          timestamp: 2000,
        },
        {
          action: ScoreAction.HARD_DROP,
          value: 20,
          multiplier: 1,
          bonus: 0,
          level: 1,
          combo: 0,
          lines: 0,
          timestamp: 3000,
        },
      ];
      
      // 测试分数分布分析
      const distribution = ScoreAnalyzer.analyzeScoreDistribution(testEvents);
      this.addTestResult('Score Distribution Analysis', 
        distribution.totalScore === 420 && 
        distribution.byAction[ScoreAction.CLEAR_LINE].count === 2);
      
      // 测试游戏表现分析
      const performance = ScoreAnalyzer.analyzePerformance(testEvents, 5000);
      this.addTestResult('Performance Analysis', 
        performance.efficiency > 0 && 
        Array.isArray(performance.scoreVelocity));
      
      // 测试分数预测
      const predictedScore = ScoreAnalyzer.predictFinalScore(420, 3000, 10000, testEvents);
      this.addTestResult('Score Prediction', 
        predictedScore > 420); // 应该预测更高的分数
      
    } catch (error) {
      this.addTestResult('Score Analyzer', false, `Error: ${error}`);
    }
  }

  // 测试特殊分数
  private testSpecialScores(): void {
    try {
      const scoreSystem = new ScoreSystem({
        enableSpecialBlocks: true,
      });
      
      // 测试方块放置分数
      const placeEvent = scoreSystem.calculatePlaceBlockScore(5, false);
      this.addTestResult('Place Block Score', 
        placeEvent.action === ScoreAction.PLACE_BLOCK && placeEvent.value > 0);
      
      // 测试硬降分数
      const hardDropEvent = scoreSystem.calculatePlaceBlockScore(10, true);
      this.addTestResult('Hard Drop Score', 
        hardDropEvent.action === ScoreAction.HARD_DROP && 
        hardDropEvent.value > placeEvent.value);
      
      // 测试软降分数
      const softDropEvent = scoreSystem.calculateSoftDropScore(3);
      this.addTestResult('Soft Drop Score', 
        softDropEvent.action === ScoreAction.SOFT_DROP && softDropEvent.value > 0);
      
      // 测试特殊方块分数
      const specialEvent = scoreSystem.calculateSpecialBlockScore('bomb', 5);
      this.addTestResult('Special Block Score', 
        specialEvent.action === ScoreAction.SPECIAL_BLOCK && specialEvent.value > 0);
      
    } catch (error) {
      this.addTestResult('Special Scores', false, `Error: ${error}`);
    }
  }

  // 测试高分记录
  private testHighScoreTracking(): void {
    try {
      const scoreSystem = new ScoreSystem({
        mode: GameMode.CLASSIC,
      });
      
      // 初始高分应该为0
      const initialHigh = scoreSystem.getHighScore(GameMode.CLASSIC);
      this.addTestResult('Initial High Score', initialHigh === 0);
      
      // 获得一些分数
      scoreSystem.calculateLineScore(4); // Tetris
      const currentScore = scoreSystem.getStats().score;
      
      // 更新高分
      const isNewHigh = scoreSystem.updateHighScore();
      this.addTestResult('New High Score', isNewHigh);
      
      // 验证高分更新
      const newHigh = scoreSystem.getHighScore(GameMode.CLASSIC);
      this.addTestResult('High Score Updated', newHigh === currentScore);
      
      // 测试非新高分情况
      const isNotNewHigh = scoreSystem.updateHighScore();
      this.addTestResult('Not New High Score', !isNotNewHigh);
      
      // 测试分数历史
      const history = scoreSystem.getScoreHistory();
      this.addTestResult('Score History', history.length > 0);
      
      // 测试重置
      scoreSystem.reset();
      const resetStats = scoreSystem.getStats();
      this.addTestResult('System Reset', 
        resetStats.score === 0 && resetStats.level === 1);
      
    } catch (error) {
      this.addTestResult('High Score Tracking', false, `Error: ${error}`);
    }
  }

  // 辅助方法：等待指定时间
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出测试实例
export const scoreSystemTest = new ScoreSystemTest();

// 简单的测试运行函数
export const runScoreSystemTests = async (): Promise<boolean> => {
  const test = new ScoreSystemTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};
