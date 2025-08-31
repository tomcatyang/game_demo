import { gameEngineManager } from '../src/services/GameEngineManager';
import { GameState, GameMode, GameDifficulty } from '../src/types';
import { BaseTest } from './utils/testUtils';

// 游戏引擎测试工具
export class GameEngineTest extends BaseTest {

  // 运行所有测试
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Game Engine Tests...');
    
    this.testEngineInitialization();
    this.testStateManagement();
    this.testGameLoop();
    await this.testPerformance();
    
    this.printResults();
  }

  // 测试引擎初始化
  private testEngineInitialization(): void {
    try {
      // 重置管理器
      gameEngineManager.reset();
      
      // 初始化引擎
      const engine = gameEngineManager.initialize({
        mode: GameMode.CLASSIC,
        difficulty: GameDifficulty.MEDIUM,
      });
      
      this.addTestResult('Engine Initialization', engine !== null);
      
      // 测试获取状态管理器
      const stateManager = gameEngineManager.getStateManager();
      this.addTestResult('State Manager Access', stateManager !== null);
      
      // 测试初始状态
      const initialState = stateManager.getState();
      this.addTestResult('Initial State is MENU', initialState === GameState.MENU);
      
    } catch (error) {
      this.addTestResult('Engine Initialization', false, `Error: ${error}`);
    }
  }

  // 测试状态管理
  private testStateManagement(): void {
    try {
      const stateManager = gameEngineManager.getStateManager();
      
      // 测试状态切换
      stateManager.startNewGame();
      this.addTestResult('Start New Game', stateManager.getState() === GameState.PLAYING);
      
      // 测试暂停
      stateManager.pauseGame();
      this.addTestResult('Pause Game', stateManager.getState() === GameState.PAUSED);
      
      // 测试恢复
      stateManager.resumeGame();
      this.addTestResult('Resume Game', stateManager.getState() === GameState.PLAYING);
      
      // 测试结束游戏
      stateManager.endGame();
      this.addTestResult('End Game', stateManager.getState() === GameState.GAME_OVER);
      
      // 测试重置
      stateManager.resetGame();
      this.addTestResult('Reset Game', stateManager.getState() === GameState.MENU);
      
    } catch (error) {
      this.addTestResult('State Management', false, `Error: ${error}`);
    }
  }

  // 测试游戏循环
  private testGameLoop(): void {
    try {
      const engine = gameEngineManager.getEngine();
      
      // 测试启动
      engine.start();
      const engineState = engine.getEngineState();
      this.addTestResult('Engine Start', engineState.isRunning);
      
      // 测试暂停
      engine.pause();
      const pausedState = engine.getEngineState();
      this.addTestResult('Engine Pause', !pausedState.isRunning);
      
      // 测试恢复
      engine.resume();
      const resumedState = engine.getEngineState();
      this.addTestResult('Engine Resume', resumedState.isRunning);
      
      // 测试停止
      engine.stop();
      const stoppedState = engine.getEngineState();
      this.addTestResult('Engine Stop', !stoppedState.isRunning);
      
    } catch (error) {
      this.addTestResult('Game Loop', false, `Error: ${error}`);
    }
  }

  // 测试性能
  private async testPerformance(): Promise<void> {
    try {
      const engine = gameEngineManager.getEngine();
      
      // 启动引擎并运行一段时间
      engine.start();
      
      // 等待几帧
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const performanceInfo = engine.getPerformanceInfo();
      this.addTestResult('Performance Info Available', 
        performanceInfo.targetFPS > 0 && performanceInfo.lastFrameTime >= 0);
      
      engine.stop();
      
    } catch (error) {
      this.addTestResult('Performance Test', false, `Error: ${error}`);
    }
  }


}

// 导出测试工具实例
export const gameEngineTest = new GameEngineTest();

// 简单的测试运行函数
export const runGameEngineTests = async (): Promise<boolean> => {
  const test = new GameEngineTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};
