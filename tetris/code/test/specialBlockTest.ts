import { BaseTest } from './utils/testUtils';
import { SpecialBlockSystem, getSpecialBlockSystem, resetSpecialBlockSystem } from '../src/services/SpecialBlockSystem';
import { GameBoardManager } from '../src/services/GameBoard';
import { BlockType } from '../src/types';

// 特殊方块测试类
export class SpecialBlockTest extends BaseTest {
  private specialBlockSystem: SpecialBlockSystem;
  private gameBoard: GameBoardManager;

  constructor() {
    super();
    this.specialBlockSystem = new SpecialBlockSystem();
    this.gameBoard = new GameBoardManager();
    this.specialBlockSystem.setGameBoard(this.gameBoard);
  }

  // 测试特殊方块系统初始化
  testSpecialBlockSystemInitialization() {
    const system = new SpecialBlockSystem();
    
    this.assert(!!system, 'SpecialBlockSystem should be created');
    this.assert(system.getConfig().enabled === true, 'Default enabled should be true');
    this.assert(system.getConfig().bombProbability === 0.1, 'Default bomb probability should be 0.1');
    this.assert(system.getConfig().lockProbability === 0.05, 'Default lock probability should be 0.05');
    this.assert(system.getConfig().bombRadius === 1, 'Default bomb radius should be 1');
    this.assert(system.getConfig().lockDuration === 3000, 'Default lock duration should be 3000ms');
    
    console.log('✅ SpecialBlockSystem initialization test passed');
  }

  // 测试配置更新
  testConfigUpdate() {
    const system = new SpecialBlockSystem();
    
    const newConfig = {
      enabled: false,
      bombProbability: 0.2,
      lockProbability: 0.1,
      bombRadius: 2,
      lockDuration: 5000,
      bombScore: 1000,
      lockScore: 500,
      clearScore: 200,
    };
    
    system.updateConfig(newConfig);
    const updatedConfig = system.getConfig();
    
    this.assert(updatedConfig.enabled === false, 'Enabled should be updated');
    this.assert(updatedConfig.bombProbability === 0.2, 'Bomb probability should be updated');
    this.assert(updatedConfig.lockProbability === 0.1, 'Lock probability should be updated');
    this.assert(updatedConfig.bombRadius === 2, 'Bomb radius should be updated');
    this.assert(updatedConfig.lockDuration === 5000, 'Lock duration should be updated');
    this.assert(updatedConfig.bombScore === 1000, 'Bomb score should be updated');
    this.assert(updatedConfig.lockScore === 500, 'Lock score should be updated');
    this.assert(updatedConfig.clearScore === 200, 'Clear score should be updated');
    
    console.log('✅ Config update test passed');
  }

  // 测试特殊方块生成
  testSpecialBlockGeneration() {
    const system = new SpecialBlockSystem();
    system.setGameBoard(this.gameBoard);
    
    // 测试禁用状态
    system.updateConfig({ enabled: false });
    this.assert(system.shouldGenerateSpecialBlock() === false, 'Should not generate special blocks when disabled');
    this.assert(system.generateSpecialBlockType() === BlockType.I, 'Should return I block when disabled');
    
    // 测试启用状态
    system.updateConfig({ enabled: true, bombProbability: 1.0, lockProbability: 0 });
    this.assert(system.shouldGenerateSpecialBlock() === true, 'Should generate special blocks when enabled');
    
    // 测试炸弹方块生成
    system.updateConfig({ bombProbability: 1.0, lockProbability: 0 });
    const bombType = system.generateSpecialBlockType();
    this.assert(bombType === BlockType.BOMB, 'Should generate bomb block when bomb probability is 1.0');
    
    // 测试锁定方块生成
    system.updateConfig({ bombProbability: 0, lockProbability: 1.0 });
    const lockType = system.generateSpecialBlockType();
    this.assert(lockType === BlockType.LOCK, 'Should generate lock block when lock probability is 1.0');
    
    console.log('✅ Special block generation test passed');
  }

  // 测试炸弹爆炸效果
  testBombExplosion() {
    const system = new SpecialBlockSystem();
    system.setGameBoard(this.gameBoard);
    
    // 清空游戏板
    this.gameBoard.clear();
    
    // 设置一些方块
    this.gameBoard.setCell({ x: 4, y: 15 }, {
      filled: true,
      color: '#00FFFF',
      blockType: BlockType.I,
      isSpecial: false,
      specialType: undefined,
    });
    this.gameBoard.setCell({ x: 5, y: 15 }, {
      filled: true,
      color: '#FFFF00',
      blockType: BlockType.O,
      isSpecial: false,
      specialType: undefined,
    });
    this.gameBoard.setCell({ x: 3, y: 15 }, {
      filled: true,
      color: '#800080',
      blockType: BlockType.T,
      isSpecial: false,
      specialType: undefined,
    });
    this.gameBoard.setCell({ x: 4, y: 16 }, {
      filled: true,
      color: '#00FF00',
      blockType: BlockType.S,
      isSpecial: false,
      specialType: undefined,
    });
    
    // 在中心放置炸弹方块
    this.gameBoard.setCell({ x: 4, y: 15 }, {
      filled: true,
      color: '#FF1493',
      blockType: BlockType.BOMB,
      isSpecial: true,
      specialType: 'bomb',
    });
    
    // 触发爆炸
    const explosionEvent = system.handleBombExplosion({ x: 4, y: 15 });
    
    this.assert(explosionEvent.type === 'explosion', 'Event type should be explosion');
    this.assert(explosionEvent.position.x === 4, 'Event position x should be 4');
    this.assert(explosionEvent.position.y === 15, 'Event position y should be 15');
    this.assert(explosionEvent.affectedPositions.length > 0, 'Should have affected positions');
    this.assert(explosionEvent.score > 0, 'Should have positive score');
    
    
    // 检查爆炸范围内的方块是否被清除
    const centerCell = this.gameBoard.getCell({ x: 4, y: 15 });
    const rightCell = this.gameBoard.getCell({ x: 5, y: 15 });
    const leftCell = this.gameBoard.getCell({ x: 3, y: 15 });
    const bottomCell = this.gameBoard.getCell({ x: 4, y: 16 });
    
    this.assert(!centerCell || !centerCell.filled, 'Center cell should be cleared');
    this.assert(!rightCell || !rightCell.filled, 'Right cell should be cleared');
    this.assert(!leftCell || !leftCell.filled, 'Left cell should be cleared');
    this.assert(!bottomCell || !bottomCell.filled, 'Bottom cell should be cleared');
    
    console.log('✅ Bomb explosion test passed');
  }

  // 测试锁定方块
  testLockBlock() {
    const system = new SpecialBlockSystem();
    system.setGameBoard(this.gameBoard);
    
    // 清空游戏板
    this.gameBoard.clear();
    
    // 设置一个方块
    this.gameBoard.setCell({ x: 5, y: 15 }, {
      filled: true,
      color: '#00FFFF',
      blockType: BlockType.I,
      isSpecial: false,
      specialType: undefined,
    });
    
    // 处理锁定方块
    const lockEvent = system.handleLockBlock({ x: 5, y: 15 });
    
    this.assert(lockEvent.type === 'lock', 'Event type should be lock');
    this.assert(lockEvent.position.x === 5, 'Event position x should be 5');
    this.assert(lockEvent.position.y === 15, 'Event position y should be 15');
    
    // 检查位置是否被锁定
    this.assert(system.isPositionLocked({ x: 5, y: 15 }) === true, 'Position should be locked');
    this.assert(system.canClearPosition({ x: 5, y: 15 }) === false, 'Locked position should not be clearable');
    
    // 测试解锁
    system.unlockPosition({ x: 5, y: 15 });
    this.assert(system.isPositionLocked({ x: 5, y: 15 }) === false, 'Position should be unlocked');
    this.assert(system.canClearPosition({ x: 5, y: 15 }) === true, 'Unlocked position should be clearable');
    
    console.log('✅ Lock block test passed');
  }

  // 测试行消除时的特殊方块效果
  testLineClearEffects() {
    const system = new SpecialBlockSystem();
    system.setGameBoard(this.gameBoard);
    
    // 清空游戏板
    this.gameBoard.clear();
    
    // 设置一行包含特殊方块，确保锁定方块不在炸弹爆炸范围内
    const blockTypes = [BlockType.I, BlockType.O, BlockType.BOMB, BlockType.T, BlockType.S, BlockType.Z, BlockType.J, BlockType.L, BlockType.I, BlockType.LOCK];
    const colors = ['#00FFFF', '#FFFF00', '#FF1493', '#800080', '#00FF00', '#FF0000', '#0000FF', '#FFA500', '#00FFFF', '#696969'];
    
    for (let x = 0; x < 10; x++) {
      this.gameBoard.setCell({ x, y: 15 }, {
        filled: true,
        color: colors[x],
        blockType: blockTypes[x],
        isSpecial: blockTypes[x] === BlockType.BOMB || blockTypes[x] === BlockType.LOCK,
        specialType: blockTypes[x] === BlockType.BOMB ? 'bomb' : blockTypes[x] === BlockType.LOCK ? 'lock' : undefined,
      });
    }
    
    // 模拟行消除
    const events = system.handleLineClear([15]);
    
    this.assert(events.length > 0, 'Should have events from line clear');
    
    // 检查是否有爆炸事件
    const explosionEvent = events.find(e => e.type === 'explosion');
    this.assert(!!explosionEvent, 'Should have explosion event');
    
    // 检查是否有清除事件
    const clearEvent = events.find(e => e.type === 'clear');
    this.assert(!!clearEvent, 'Should have clear event');
    
    console.log('✅ Line clear effects test passed');
  }

  // 测试重力效果
  testGravityEffect() {
    const system = new SpecialBlockSystem();
    system.setGameBoard(this.gameBoard);
    
    // 清空游戏板
    this.gameBoard.clear();
    
    // 设置悬空的方块
    this.gameBoard.setCell({ x: 3, y: 10 }, {
      filled: true,
      color: '#00FFFF',
      blockType: BlockType.I,
      isSpecial: false,
      specialType: undefined,
    });
    this.gameBoard.setCell({ x: 4, y: 10 }, {
      filled: true,
      color: '#FFFF00',
      blockType: BlockType.O,
      isSpecial: false,
      specialType: undefined,
    });
    this.gameBoard.setCell({ x: 5, y: 10 }, {
      filled: true,
      color: '#800080',
      blockType: BlockType.T,
      isSpecial: false,
      specialType: undefined,
    });
    
    // 触发重力效果
    const gravityEvents = system.handleGravityEffect();
    
    this.assert(gravityEvents.length > 0, 'Should have gravity events');
    
    // 检查方块是否下落
    const topCell = this.gameBoard.getCell({ x: 3, y: 10 });
    const middleCell = this.gameBoard.getCell({ x: 4, y: 10 });
    const bottomCell = this.gameBoard.getCell({ x: 5, y: 10 });
    
    this.assert(!topCell || !topCell.filled, 'Top cell should be empty');
    this.assert(!middleCell || !middleCell.filled, 'Middle cell should be empty');
    this.assert(!bottomCell || !bottomCell.filled, 'Bottom cell should be empty');
    
    // 检查方块是否落到底部
    const bottomI = this.gameBoard.getCell({ x: 3, y: 19 });
    const bottomO = this.gameBoard.getCell({ x: 4, y: 19 });
    const bottomT = this.gameBoard.getCell({ x: 5, y: 19 });
    
    this.assert(bottomI && bottomI.filled && bottomI.blockType === BlockType.I, 'I block should be at bottom');
    this.assert(bottomO && bottomO.filled && bottomO.blockType === BlockType.O, 'O block should be at bottom');
    this.assert(bottomT && bottomT.filled && bottomT.blockType === BlockType.T, 'T block should be at bottom');
    
    console.log('✅ Gravity effect test passed');
  }

  // 测试事件监听器
  testEventListeners() {
    const system = new SpecialBlockSystem();
    system.setGameBoard(this.gameBoard);
    
    let eventReceived = false;
    let receivedEvent: any = null;
    
    const listener = (event: any) => {
      eventReceived = true;
      receivedEvent = event;
    };
    
    // 添加监听器
    system.addEventListener('test-listener', listener);
    
    // 触发事件
    system.handleBombExplosion({ x: 5, y: 15 });
    
    this.assert(eventReceived, 'Listener should be called');
    this.assert(receivedEvent.type === 'explosion', 'Should receive explosion event');
    
    // 移除监听器
    system.removeEventListener('test-listener');
    eventReceived = false;
    receivedEvent = null;
    
    // 再次触发事件
    system.handleBombExplosion({ x: 6, y: 15 });
    
    this.assert(eventReceived === false, 'Listener should not be called after removal');
    
    console.log('✅ Event listeners test passed');
  }

  // 测试统计信息
  testStats() {
    const system = new SpecialBlockSystem();
    system.setGameBoard(this.gameBoard);
    
    const stats = system.getStats();
    
    this.assert(typeof stats.totalBombs === 'number', 'Total bombs should be a number');
    this.assert(typeof stats.totalLocks === 'number', 'Total locks should be a number');
    this.assert(typeof stats.activeLocks === 'number', 'Active locks should be a number');
    this.assert(typeof stats.totalScore === 'number', 'Total score should be a number');
    this.assert(stats.activeLocks === 0, 'Active locks should be 0 initially');
    
    console.log('✅ Stats test passed');
  }

  // 测试单例模式
  testSingletonPattern() {
    // 重置单例
    resetSpecialBlockSystem();
    
    const system1 = getSpecialBlockSystem();
    const system2 = getSpecialBlockSystem();
    
    this.assert(system1 === system2, 'Should return the same instance');
    
    // 测试状态共享
    system1.updateConfig({ enabled: false });
    this.assert(system2.getConfig().enabled === false, 'State should be shared between instances');
    
    console.log('✅ Singleton pattern test passed');
  }

  // 测试系统重置
  testSystemReset() {
    const system = new SpecialBlockSystem();
    system.setGameBoard(this.gameBoard);
    
    // 添加一些锁定位置
    system.handleLockBlock({ x: 3, y: 15 });
    system.handleLockBlock({ x: 4, y: 15 });
    
    // 添加监听器
    let eventReceived = false;
    system.addEventListener('test', () => { eventReceived = true; });
    
    // 重置系统
    system.reset();
    
    // 检查锁定位置是否被清除
    this.assert(system.getLockedPositions().length === 0, 'Locked positions should be cleared');
    
    // 检查监听器是否被清除
    system.handleBombExplosion({ x: 5, y: 15 });
    this.assert(eventReceived === false, 'Event listener should be cleared');
    
    console.log('✅ System reset test passed');
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 Starting SpecialBlock tests...');
    
    try {
      this.testSpecialBlockSystemInitialization();
      this.testConfigUpdate();
      this.testSpecialBlockGeneration();
      this.testBombExplosion();
      this.testLockBlock();
      this.testLineClearEffects();
      this.testGravityEffect();
      this.testEventListeners();
      this.testStats();
      this.testSingletonPattern();
      this.testSystemReset();
      
      console.log('✅ All SpecialBlock tests passed!');
    } catch (error) {
      console.log(`❌ SpecialBlock test failed: ${error}`);
      throw error;
    }
  }
}

// 导出测试函数
export const runSpecialBlockTests = async () => {
  const test = new SpecialBlockTest();
  return await test.runAllTests();
};

// 默认导出
export default SpecialBlockTest;
