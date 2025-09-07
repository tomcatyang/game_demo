import { BaseTest } from './utils/testUtils';
import { GameModeManager, getGameModeManager, resetGameModeManager } from '../src/services/GameModeManager';
import { GameMode, GameDifficulty } from '../src/types';

// 游戏模式测试类
export class GameModeTest extends BaseTest {
  private gameModeManager: GameModeManager;

  constructor() {
    super();
    this.gameModeManager = new GameModeManager();
  }

  // 测试游戏模式管理器初始化
  testGameModeManagerInitialization() {
    const manager = new GameModeManager();
    
    this.assert(!!manager, 'GameModeManager should be created');
    this.assert(manager.getCurrentMode() === GameMode.CLASSIC, 'Default mode should be CLASSIC');
    this.assert(manager.getCurrentDifficulty() === GameDifficulty.MEDIUM, 'Default difficulty should be MEDIUM');
    
    console.log('✅ GameModeManager initialization test passed');
  }

  // 测试模式切换
  testModeSwitching() {
    const manager = new GameModeManager();
    
    // 测试切换到限时挑战模式
    const result1 = manager.setMode(GameMode.TIME_ATTACK);
    this.assert(result1 === true, 'Should successfully switch to TIME_ATTACK mode');
    this.assert(manager.getCurrentMode() === GameMode.TIME_ATTACK, 'Current mode should be TIME_ATTACK');
    
    // 测试切换到挑战模式
    const result2 = manager.setMode(GameMode.CHALLENGE);
    this.assert(result2 === true, 'Should successfully switch to CHALLENGE mode');
    this.assert(manager.getCurrentMode() === GameMode.CHALLENGE, 'Current mode should be CHALLENGE');
    
    // 测试切换回经典模式
    const result3 = manager.setMode(GameMode.CLASSIC);
    this.assert(result3 === true, 'Should successfully switch back to CLASSIC mode');
    this.assert(manager.getCurrentMode() === GameMode.CLASSIC, 'Current mode should be CLASSIC');
    
    console.log('✅ Mode switching test passed');
  }

  // 测试难度切换
  testDifficultySwitching() {
    const manager = new GameModeManager();
    
    // 测试切换到简单难度
    manager.setDifficulty(GameDifficulty.EASY);
    this.assert(manager.getCurrentDifficulty() === GameDifficulty.EASY, 'Current difficulty should be EASY');
    
    // 测试切换到困难难度
    manager.setDifficulty(GameDifficulty.HARD);
    this.assert(manager.getCurrentDifficulty() === GameDifficulty.HARD, 'Current difficulty should be HARD');
    
    // 测试切换到专家难度
    manager.setDifficulty(GameDifficulty.EXPERT);
    this.assert(manager.getCurrentDifficulty() === GameDifficulty.EXPERT, 'Current difficulty should be EXPERT');
    
    console.log('✅ Difficulty switching test passed');
  }

  // 测试模式配置获取
  testModeConfigRetrieval() {
    const manager = new GameModeManager();
    
    // 测试获取经典模式配置
    const classicConfig = manager.getModeConfig(GameMode.CLASSIC);
    this.assert(!!classicConfig, 'Classic mode config should exist');
    this.assert(classicConfig!.name === '经典模式', 'Classic mode name should be correct');
    this.assert(classicConfig!.rules.specialBlocksEnabled === false, 'Classic mode should not have special blocks');
    
    // 测试获取限时挑战模式配置
    const timeAttackConfig = manager.getModeConfig(GameMode.TIME_ATTACK);
    this.assert(!!timeAttackConfig, 'Time attack mode config should exist');
    this.assert(timeAttackConfig!.name === '限时挑战', 'Time attack mode name should be correct');
    this.assert(timeAttackConfig!.rules.timeLimit === 120, 'Time attack mode should have 120s time limit');
    this.assert(timeAttackConfig!.rules.specialBlocksEnabled === true, 'Time attack mode should have special blocks');
    
    // 测试获取挑战模式配置
    const challengeConfig = manager.getModeConfig(GameMode.CHALLENGE);
    this.assert(!!challengeConfig, 'Challenge mode config should exist');
    this.assert(challengeConfig!.name === '挑战模式', 'Challenge mode name should be correct');
    this.assert(challengeConfig!.rules.speedIncrease === 0.85, 'Challenge mode speed increase should be 0.85');
    this.assert(challengeConfig!.rules.scoringMultiplier === 1.5, 'Challenge mode scoring multiplier should be 1.5');
    
    console.log('✅ Mode config retrieval test passed');
  }

  // 测试游戏配置生成
  testGameConfigGeneration() {
    const manager = new GameModeManager();
    
    // 测试经典模式 + 普通难度
    manager.setMode(GameMode.CLASSIC);
    manager.setDifficulty(GameDifficulty.MEDIUM);
    const classicConfig = manager.getCurrentGameConfig();
    
    this.assert(classicConfig.mode === GameMode.CLASSIC, 'Config mode should be CLASSIC');
    this.assert(classicConfig.difficulty === GameDifficulty.MEDIUM, 'Config difficulty should be MEDIUM');
    this.assert(classicConfig.enableSpecialBlocks === false, 'Classic mode should not enable special blocks');
    this.assert(classicConfig.enableCombo === true, 'Classic mode should enable combo');
    this.assert(classicConfig.gridWidth === 10, 'Grid width should be 10');
    this.assert(classicConfig.gridHeight === 20, 'Grid height should be 20');
    
    // 测试限时挑战模式 + 困难难度
    manager.setMode(GameMode.TIME_ATTACK);
    manager.setDifficulty(GameDifficulty.HARD);
    const timeAttackConfig = manager.getCurrentGameConfig();
    
    this.assert(timeAttackConfig.mode === GameMode.TIME_ATTACK, 'Config mode should be TIME_ATTACK');
    this.assert(timeAttackConfig.difficulty === GameDifficulty.HARD, 'Config difficulty should be HARD');
    this.assert(timeAttackConfig.enableSpecialBlocks === true, 'Time attack mode should enable special blocks');
    this.assert(timeAttackConfig.enableCombo === true, 'Time attack mode should enable combo');
    
    console.log('✅ Game config generation test passed');
  }

  // 测试可用模式获取
  testAvailableModesRetrieval() {
    const manager = new GameModeManager();
    const availableModes = manager.getAvailableModes();
    
    this.assert(Array.isArray(availableModes), 'Available modes should be an array');
    this.assert(availableModes.length >= 3, 'Should have at least 3 available modes');
    
    const modeIds = availableModes.map(mode => mode.id);
    this.assert(modeIds.includes(GameMode.CLASSIC), 'Should include CLASSIC mode');
    this.assert(modeIds.includes(GameMode.TIME_ATTACK), 'Should include TIME_ATTACK mode');
    this.assert(modeIds.includes(GameMode.CHALLENGE), 'Should include CHALLENGE mode');
    
    console.log('✅ Available modes retrieval test passed');
  }

  // 测试自定义模式创建
  testCustomModeCreation() {
    const manager = new GameModeManager();
    
    const customModeConfig = {
      name: '自定义模式',
      description: '这是一个自定义的游戏模式',
      icon: '🎯',
      color: '#8b5cf6',
      enabled: true,
      rules: {
        speedIncrease: 0.9,
        specialBlocksEnabled: true,
        comboEnabled: true,
        levelUpLines: 8,
        maxLevel: 25,
        initialSpeed: 700,
        gridSize: { width: 10, height: 20 },
        scoringMultiplier: 1.2,
        timeBonus: false,
        perfectClearBonus: true,
        tSpinEnabled: true,
      },
    };
    
    const customModeId = manager.createCustomMode(customModeConfig);
    this.assert(!!customModeId, 'Custom mode should be created with an ID');
    this.assert(customModeId.startsWith('custom_'), 'Custom mode ID should start with "custom_"');
    
    const retrievedMode = manager.getModeConfig(customModeId as GameMode);
    this.assert(!!retrievedMode, 'Custom mode should be retrievable');
    this.assert(retrievedMode!.name === '自定义模式', 'Custom mode name should be correct');
    this.assert(retrievedMode!.rules.levelUpLines === 8, 'Custom mode rules should be correct');
    
    console.log('✅ Custom mode creation test passed');
  }

  // 测试模式配置验证
  testModeConfigValidation() {
    const manager = new GameModeManager();
    
    // 测试有效配置
    const validConfig = {
      initialSpeed: 800,
      speedIncrease: 0.9,
      levelUpLines: 10,
      maxLevel: 20,
      scoringMultiplier: 1.0,
    };
    
    const validResult = manager.validateModeConfig(validConfig);
    this.assert(validResult.valid === true, 'Valid config should pass validation');
    this.assert(validResult.errors.length === 0, 'Valid config should have no errors');
    
    // 测试无效配置
    const invalidConfig = {
      initialSpeed: 3000, // 超出范围
      speedIncrease: 1.5, // 超出范围
      levelUpLines: 0, // 超出范围
      maxLevel: 200, // 超出范围
      scoringMultiplier: -1, // 超出范围
    };
    
    const invalidResult = manager.validateModeConfig(invalidConfig);
    this.assert(invalidResult.valid === false, 'Invalid config should fail validation');
    this.assert(invalidResult.errors.length > 0, 'Invalid config should have errors');
    
    console.log('✅ Mode config validation test passed');
  }

  // 测试单例模式
  testSingletonPattern() {
    // 重置单例
    resetGameModeManager();
    
    const manager1 = getGameModeManager();
    const manager2 = getGameModeManager();
    
    this.assert(manager1 === manager2, 'Should return the same instance');
    
    // 测试状态共享
    manager1.setMode(GameMode.TIME_ATTACK);
    this.assert(manager2.getCurrentMode() === GameMode.TIME_ATTACK, 'State should be shared between instances');
    
    console.log('✅ Singleton pattern test passed');
  }

  // 测试监听器功能
  testListenerFunctionality() {
    const manager = new GameModeManager();
    let listenerCalled = false;
    let lastMode: GameMode | null = null;
    let lastDifficulty: GameDifficulty | null = null;
    
    const listener = (mode: GameMode, difficulty: GameDifficulty) => {
      listenerCalled = true;
      lastMode = mode;
      lastDifficulty = difficulty;
    };
    
    manager.addModeChangeListener('test-listener', listener);
    
    // 测试模式变化触发监听器
    manager.setMode(GameMode.TIME_ATTACK);
    this.assert(listenerCalled, 'Listener should be called on mode change');
    this.assert(lastMode === GameMode.TIME_ATTACK, 'Listener should receive correct mode');
    this.assert(lastDifficulty === GameDifficulty.MEDIUM, 'Listener should receive correct difficulty');
    
    // 重置状态
    listenerCalled = false;
    lastMode = null;
    lastDifficulty = null;
    
    // 测试难度变化触发监听器
    manager.setDifficulty(GameDifficulty.HARD);
    this.assert(listenerCalled, 'Listener should be called on difficulty change');
    this.assert(lastMode === GameMode.TIME_ATTACK, 'Listener should receive current mode');
    this.assert(lastDifficulty === GameDifficulty.HARD, 'Listener should receive correct difficulty');
    
    // 测试移除监听器
    manager.removeModeChangeListener('test-listener');
    listenerCalled = false;
    
    manager.setMode(GameMode.CLASSIC);
    this.assert(listenerCalled === false, 'Listener should not be called after removal');
    
    console.log('✅ Listener functionality test passed');
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 Starting GameMode tests...');
    
    try {
      this.testGameModeManagerInitialization();
      this.testModeSwitching();
      this.testDifficultySwitching();
      this.testModeConfigRetrieval();
      this.testGameConfigGeneration();
      this.testAvailableModesRetrieval();
      this.testCustomModeCreation();
      this.testModeConfigValidation();
      this.testSingletonPattern();
      this.testListenerFunctionality();
      
      console.log('✅ All GameMode tests passed!');
    } catch (error) {
      console.log(`❌ GameMode test failed: ${error}`);
      throw error;
    }
  }
}

// 导出测试函数
export const runGameModeTests = async () => {
  const test = new GameModeTest();
  return await test.runAllTests();
};

// 默认导出
export default GameModeTest;
