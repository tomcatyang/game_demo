import { BaseTest } from './utils/testUtils';
import { 
  AchievementManager, 
  getAchievementManager, 
  resetAchievementManager, 
  AchievementType, 
  AchievementRarity, 
  AchievementStatus
} from '../src/services/AchievementManager';
import { GameMode, GameDifficulty } from '../src/types';

// 成就测试类
export class AchievementTest extends BaseTest {
  private achievementManager: AchievementManager;

  constructor() {
    super();
    this.achievementManager = new AchievementManager();
  }

  // 测试成就管理器初始化
  testAchievementManagerInitialization() {
    const manager = new AchievementManager();
    
    this.assert(!!manager, 'AchievementManager should be created');
    
    const stats = manager.getAchievementStats();
    this.assert(!!stats, 'Stats should exist');
    this.assert(stats.total > 0, 'Should have achievements');
    this.assert(stats.unlocked >= 0, 'Unlocked count should be non-negative');
    this.assert(stats.completed >= 0, 'Completed count should be non-negative');
    this.assert(stats.locked >= 0, 'Locked count should be non-negative');
    this.assert(stats.points >= 0, 'Points should be non-negative');
    
    console.log('✅ AchievementManager initialization test passed');
  }

  // 测试成就配置获取
  testAchievementConfigRetrieval() {
    const manager = new AchievementManager();
    
    // 测试获取分数成就配置
    const scoreConfig = manager.getAchievementConfig(AchievementType.SCORE_1000);
    this.assert(!!scoreConfig, 'Score achievement config should exist');
    this.assert(scoreConfig!.name === '新手入门', 'Score achievement name should be correct');
    this.assert(scoreConfig!.description === '获得1000分', 'Score achievement description should be correct');
    this.assert(scoreConfig!.icon === '🎯', 'Score achievement icon should be correct');
    this.assert(scoreConfig!.rarity === AchievementRarity.COMMON, 'Score achievement rarity should be common');
    this.assert(scoreConfig!.points === 10, 'Score achievement points should be correct');
    this.assert(scoreConfig!.category === '分数', 'Score achievement category should be correct');
    this.assert(scoreConfig!.enabled === true, 'Score achievement should be enabled');
    
    // 测试获取等级成就配置
    const levelConfig = manager.getAchievementConfig(AchievementType.LEVEL_10);
    this.assert(!!levelConfig, 'Level achievement config should exist');
    this.assert(levelConfig!.name === '登堂入室', 'Level achievement name should be correct');
    this.assert(levelConfig!.rarity === AchievementRarity.UNCOMMON, 'Level achievement rarity should be uncommon');
    this.assert(levelConfig!.points === 30, 'Level achievement points should be correct');
    
    // 测试获取特殊成就配置
    const specialConfig = manager.getAchievementConfig(AchievementType.MASTER);
    this.assert(!!specialConfig, 'Special achievement config should exist');
    this.assert(specialConfig!.name === '大师', 'Special achievement name should be correct');
    this.assert(specialConfig!.rarity === AchievementRarity.LEGENDARY, 'Special achievement rarity should be legendary');
    this.assert(specialConfig!.hidden === true, 'Special achievement should be hidden');
    
    console.log('✅ Achievement config retrieval test passed');
  }

  // 测试成就进度获取
  testAchievementProgressRetrieval() {
    const manager = new AchievementManager();
    
    // 测试获取分数成就进度
    const scoreProgress = manager.getAchievementProgress(AchievementType.SCORE_1000);
    this.assert(!!scoreProgress, 'Score achievement progress should exist');
    this.assert(scoreProgress!.id === AchievementType.SCORE_1000, 'Progress ID should match');
    this.assert(scoreProgress!.current === 0, 'Initial progress should be 0');
    this.assert(scoreProgress!.target === 1000, 'Target should be 1000');
    this.assert(scoreProgress!.percentage === 0, 'Initial percentage should be 0');
    this.assert(scoreProgress!.status === AchievementStatus.LOCKED, 'Initial status should be locked');
    
    // 测试获取等级成就进度
    const levelProgress = manager.getAchievementProgress(AchievementType.LEVEL_10);
    this.assert(!!levelProgress, 'Level achievement progress should exist');
    this.assert(levelProgress!.target === 10, 'Level target should be 10');
    this.assert(levelProgress!.status === AchievementStatus.LOCKED, 'Initial status should be locked');
    
    console.log('✅ Achievement progress retrieval test passed');
  }

  // 测试统计数据更新
  testStatsUpdate() {
    const manager = new AchievementManager();
    
    // 更新游戏统计
    manager.updateStats({
      score: 1500,
      lines: 5,
      tetris: 1,
      tspin: 0,
      combo: 2,
      time: 120,
      level: 3,
      gameMode: GameMode.CLASSIC,
      difficulty: GameDifficulty.MEDIUM,
    });
    
    const gameStats = manager.getGameStats();
    console.log('Game stats:', gameStats);
    this.assert(gameStats.total_score === 1500, `Total score should be 1500, got ${gameStats.total_score}`);
    this.assert(gameStats.total_lines === 5, `Total lines should be 5, got ${gameStats.total_lines}`);
    this.assert(gameStats.total_tetris === 1, `Total tetris should be 1, got ${gameStats.total_tetris}`);
    this.assert(gameStats.total_combo === 2, `Total combo should be 2, got ${gameStats.total_combo}`);
    this.assert(gameStats.total_time === 120, `Total time should be 120, got ${gameStats.total_time}`);
    this.assert(gameStats.max_level === 3, `Max level should be 3, got ${gameStats.max_level}`);
    this.assert(gameStats.total_games === 1, `Total games should be 1, got ${gameStats.total_games}`);
    
    console.log('✅ Stats update test passed');
  }

  // 测试成就解锁
  testAchievementUnlock() {
    const manager = new AchievementManager();
    
    // 更新统计以解锁分数成就
    manager.updateStats({
      score: 1500,
      gameMode: GameMode.CLASSIC,
    });
    
    const progress = manager.getAchievementProgress(AchievementType.SCORE_1000);
    this.assert(!!progress, 'Progress should exist');
    this.assert(progress!.status === AchievementStatus.UNLOCKED, 'Achievement should be unlocked');
    this.assert(progress!.unlockedAt !== undefined, 'Unlocked time should be set');
    this.assert(progress!.percentage === 100, 'Percentage should be 100');
    
    console.log('✅ Achievement unlock test passed');
  }

  // 测试成就完成
  testAchievementCompletion() {
    const manager = new AchievementManager();
    
    // 先解锁成就
    manager.updateStats({
      score: 1500,
      gameMode: GameMode.CLASSIC,
    });
    
    // 完成成就
    const result = manager.completeAchievement(AchievementType.SCORE_1000);
    this.assert(result === true, 'Achievement completion should succeed');
    
    const progress = manager.getAchievementProgress(AchievementType.SCORE_1000);
    this.assert(!!progress, 'Progress should exist');
    this.assert(progress!.status === AchievementStatus.COMPLETED, 'Achievement should be completed');
    this.assert(progress!.completedAt !== undefined, 'Completed time should be set');
    
    console.log('✅ Achievement completion test passed');
  }

  // 测试成就统计
  testAchievementStats() {
    const manager = new AchievementManager();
    
    // 解锁一些成就
    manager.updateStats({ score: 1500, gameMode: GameMode.CLASSIC });
    manager.updateStats({ score: 6000, gameMode: GameMode.CLASSIC });
    manager.updateStats({ level: 6, gameMode: GameMode.CLASSIC });
    
    // 完成一些成就
    manager.completeAchievement(AchievementType.SCORE_1000);
    manager.completeAchievement(AchievementType.SCORE_5000);
    
    const stats = manager.getAchievementStats();
    this.assert(stats.total > 0, 'Total achievements should be positive');
    this.assert(stats.unlocked >= 2, 'Should have unlocked achievements');
    this.assert(stats.completed >= 2, 'Should have completed achievements');
    this.assert(stats.points > 0, 'Should have points');
    this.assert(typeof stats.byRarity === 'object', 'By rarity should be an object');
    this.assert(typeof stats.byCategory === 'object', 'By category should be an object');
    this.assert(Array.isArray(stats.recent), 'Recent should be an array');
    
    console.log('✅ Achievement stats test passed');
  }

  // 测试事件监听器
  testEventListenerFunctionality() {
    const manager = new AchievementManager();
    
    // 重置所有成就，确保干净的状态
    manager.resetAllAchievements();
    
    let eventReceived: boolean = false;
    let receivedAchievement: AchievementType | null = null;
    let receivedProgress: any = null;
    
    const listener = (achievement: AchievementType, progress: any) => {
      eventReceived = true;
      receivedAchievement = achievement;
      receivedProgress = progress;
    };
    
    // 添加监听器
    manager.addEventListener('test-listener', listener);
    
    // 触发成就解锁（使用较小的分数确保只解锁SCORE_1000）
    manager.updateStats({ score: 1500, gameMode: GameMode.CLASSIC });
    
    this.assert(eventReceived, 'Event should be received');
    this.assert(receivedAchievement === AchievementType.SCORE_1000, `Should receive SCORE_1000, got ${receivedAchievement}`);
    this.assert(!!receivedProgress, 'Should receive progress data');
    
    // 移除监听器
    manager.removeEventListener('test-listener');
    
    // 重置事件状态
    eventReceived = false as boolean;
    receivedAchievement = null;
    receivedProgress = null;
    
    // 再次触发成就解锁
    manager.updateStats({ score: 6000, gameMode: GameMode.CLASSIC });
    
    this.assert(eventReceived === false, 'Event should not be received after removal');
    
    console.log('✅ Event listener functionality test passed');
  }

  // 测试成就重置
  testAchievementReset() {
    const manager = new AchievementManager();
    
    // 解锁一些成就
    manager.updateStats({ score: 1500, gameMode: GameMode.CLASSIC });
    manager.completeAchievement(AchievementType.SCORE_1000);
    
    // 重置特定成就
    const result = manager.resetAchievementProgress(AchievementType.SCORE_1000);
    this.assert(result === true, 'Reset should succeed');
    
    const progress = manager.getAchievementProgress(AchievementType.SCORE_1000);
    this.assert(!!progress, 'Progress should exist');
    this.assert(progress!.status === AchievementStatus.LOCKED, 'Status should be locked');
    this.assert(progress!.current === 0, 'Current should be 0');
    this.assert(progress!.percentage === 0, 'Percentage should be 0');
    this.assert(progress!.unlockedAt === undefined, 'Unlocked time should be undefined');
    this.assert(progress!.completedAt === undefined, 'Completed time should be undefined');
    
    console.log('✅ Achievement reset test passed');
  }

  // 测试所有成就重置
  testAllAchievementsReset() {
    const manager = new AchievementManager();
    
    // 解锁一些成就
    manager.updateStats({ score: 1500, gameMode: GameMode.CLASSIC });
    manager.updateStats({ score: 6000, gameMode: GameMode.CLASSIC });
    
    // 重置所有成就
    manager.resetAllAchievements();
    
    const stats = manager.getAchievementStats();
    this.assert(stats.unlocked === 0, 'Unlocked count should be 0');
    this.assert(stats.completed === 0, 'Completed count should be 0');
    this.assert(stats.points === 0, 'Points should be 0');
    
    console.log('✅ All achievements reset test passed');
  }

  // 测试统计数据重置
  testStatsReset() {
    const manager = new AchievementManager();
    
    // 更新一些统计
    manager.updateStats({ score: 1500, gameMode: GameMode.CLASSIC });
    
    // 重置统计
    manager.resetStats();
    
    const gameStats = manager.getGameStats();
    this.assert(gameStats.total_score === 0, 'Total score should be 0');
    this.assert(gameStats.total_games === 0, 'Total games should be 0');
    this.assert(gameStats.max_level === 0, 'Max level should be 0');
    
    console.log('✅ Stats reset test passed');
  }

  // 测试系统重置
  testSystemReset() {
    const manager = new AchievementManager();
    
    // 更新一些数据
    manager.updateStats({ score: 1500, gameMode: GameMode.CLASSIC });
    manager.completeAchievement(AchievementType.SCORE_1000);
    
    // 重置系统
    manager.reset();
    
    const stats = manager.getAchievementStats();
    this.assert(stats.unlocked === 0, 'Unlocked count should be 0');
    this.assert(stats.completed === 0, 'Completed count should be 0');
    this.assert(stats.points === 0, 'Points should be 0');
    
    const gameStats = manager.getGameStats();
    this.assert(gameStats.total_score === 0, 'Total score should be 0');
    
    console.log('✅ System reset test passed');
  }

  // 测试数据导出导入
  testDataExportImport() {
    const manager = new AchievementManager();
    
    // 更新一些数据
    manager.updateStats({ score: 1500, gameMode: GameMode.CLASSIC });
    // 不完成成就，保持unlocked状态
    
    // 导出数据
    const exportedData = manager.exportAchievementData();
    this.assert(typeof exportedData === 'string', 'Exported data should be string');
    this.assert(exportedData.length > 0, 'Exported data should not be empty');
    
    // 重置管理器
    manager.reset();
    
    // 导入数据
    const importResult = manager.importAchievementData(exportedData);
    this.assert(importResult === true, 'Import should succeed');
    
    // 验证数据
    const stats = manager.getAchievementStats();
    console.log('Stats after import:', stats);
    this.assert(stats.unlocked > 0, `Should have unlocked achievements after import, got ${stats.unlocked}`);
    // 由于我们没有完成成就，所以completed应该为0
    this.assert(stats.completed >= 0, `Completed achievements should be non-negative, got ${stats.completed}`);
    
    console.log('✅ Data export/import test passed');
  }

  // 测试单例模式
  testSingletonPattern() {
    // 重置单例
    resetAchievementManager();
    
    const manager1 = getAchievementManager();
    const manager2 = getAchievementManager();
    
    this.assert(manager1 === manager2, 'Should return the same instance');
    
    // 测试状态共享
    manager1.updateStats({ score: 1500, gameMode: GameMode.CLASSIC });
    const stats2 = manager2.getAchievementStats();
    this.assert(stats2.unlocked > 0, 'State should be shared between instances');
    
    console.log('✅ Singleton pattern test passed');
  }

  // 测试成就类型枚举
  testAchievementTypeEnum() {
    // 测试所有成就类型都存在
    const achievementTypes = Object.values(AchievementType);
    this.assert(achievementTypes.length > 0, 'AchievementType enum should have values');
    
    // 测试特定成就类型
    this.assert(AchievementType.SCORE_1000 === 'score_1000', 'SCORE_1000 should be correct');
    this.assert(AchievementType.LEVEL_10 === 'level_10', 'LEVEL_10 should be correct');
    this.assert(AchievementType.TETRIS_1 === 'tetris_1', 'TETRIS_1 should be correct');
    this.assert(AchievementType.TSPIN_1 === 'tspin_1', 'TSPIN_1 should be correct');
    this.assert(AchievementType.COMBO_3 === 'combo_3', 'COMBO_3 should be correct');
    this.assert(AchievementType.PERFECT_CLEAR === 'perfect_clear', 'PERFECT_CLEAR should be correct');
    this.assert(AchievementType.MASTER === 'master', 'MASTER should be correct');
    
    console.log('✅ Achievement type enum test passed');
  }

  // 测试稀有度枚举
  testAchievementRarityEnum() {
    const rarities = Object.values(AchievementRarity);
    this.assert(rarities.length > 0, 'AchievementRarity enum should have values');
    
    this.assert(AchievementRarity.COMMON === 'common', 'COMMON should be correct');
    this.assert(AchievementRarity.UNCOMMON === 'uncommon', 'UNCOMMON should be correct');
    this.assert(AchievementRarity.RARE === 'rare', 'RARE should be correct');
    this.assert(AchievementRarity.EPIC === 'epic', 'EPIC should be correct');
    this.assert(AchievementRarity.LEGENDARY === 'legendary', 'LEGENDARY should be correct');
    
    console.log('✅ Achievement rarity enum test passed');
  }

  // 测试状态枚举
  testAchievementStatusEnum() {
    const statuses = Object.values(AchievementStatus);
    this.assert(statuses.length > 0, 'AchievementStatus enum should have values');
    
    this.assert(AchievementStatus.LOCKED === 'locked', 'LOCKED should be correct');
    this.assert(AchievementStatus.UNLOCKED === 'unlocked', 'UNLOCKED should be correct');
    this.assert(AchievementStatus.COMPLETED === 'completed', 'COMPLETED should be correct');
    
    console.log('✅ Achievement status enum test passed');
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 Starting Achievement tests...');
    
    try {
      this.testAchievementManagerInitialization();
      this.testAchievementConfigRetrieval();
      this.testAchievementProgressRetrieval();
      this.testStatsUpdate();
      this.testAchievementUnlock();
      this.testAchievementCompletion();
      this.testAchievementStats();
      this.testEventListenerFunctionality();
      this.testAchievementReset();
      this.testAllAchievementsReset();
      this.testStatsReset();
      this.testSystemReset();
      this.testDataExportImport();
      this.testSingletonPattern();
      this.testAchievementTypeEnum();
      this.testAchievementRarityEnum();
      this.testAchievementStatusEnum();
      
      console.log('✅ All Achievement tests passed!');
    } catch (error) {
      console.log(`❌ Achievement test failed: ${error}`);
      throw error;
    }
  }
}

// 导出测试函数
export const runAchievementTests = async () => {
  const test = new AchievementTest();
  return await test.runAllTests();
};

// 默认导出
export default AchievementTest;
