import { BaseTest } from '../utils/testUtils';
import { GameEngine } from '../../src/services/GameEngine';
import { BlockSystem } from '../../src/services/BlockSystem';
import { GameBoardManager } from '../../src/services/GameBoard';
import { ScoreSystem } from '../../src/services/ScoreSystem';
import { GameState, GameMode, GameDifficulty, BlockType } from '../../src/types';
import { GameStateManager } from '../../src/store/gameState';

// 集成测试类
export class IntegrationTest extends BaseTest {

  // 运行所有测试
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Integration Tests...');
    
    this.testSystemInitialization();
    this.testGameFlow();
    this.testBlockPlacementFlow();
    this.testScoreCalculationFlow();
    this.testGameEndFlow();
    this.testPerformanceBasics();
    
    this.printResults();
  }

  // 测试系统初始化
  private testSystemInitialization(): void {
    try {
      // 初始化各个系统
      const gameState = new GameStateManager();
      const gameEngine = new GameEngine(gameState);

      const blockSystem = new BlockSystem({
        enableSpecialBlocks: false,
        gridWidth: 10,
        gridHeight: 20
      });

      const gameBoard = new GameBoardManager({
        width: 10,
        height: 20,
        enableSpecialBlocks: false
      }, blockSystem);

      const scoreSystem = new ScoreSystem({
        mode: GameMode.CLASSIC,
        difficulty: GameDifficulty.MEDIUM,
        enableCombo: true
      });

      // 验证初始化状态
      this.addTestResult('GameEngine Initialization', 
        gameState.getState() === GameState.MENU);

      this.addTestResult('BlockSystem Initialization', 
        blockSystem.getConfig && blockSystem.getConfig().gridWidth === 10);

      this.addTestResult('GameBoard Initialization', 
        gameBoard.getBoard().width === 10 && gameBoard.getBoard().height === 20);

      this.addTestResult('ScoreSystem Initialization', 
        scoreSystem.getStats().score === 0 && scoreSystem.getStats().level === 1);

      // 验证系统间兼容性
      const testBlock = blockSystem.generateBlock();
      const isValidBlock = testBlock && testBlock.type && testBlock.position;
      this.addTestResult('System Compatibility', isValidBlock);

    } catch (error) {
      this.addTestResult('System Initialization', false, `Error: ${error}`);
    }
  }

  // 测试游戏流程
  private testGameFlow(): void {
    try {
      const gameState = new GameStateManager();
      const gameEngine = new GameEngine(gameState);
      
      // 测试游戏状态转换
      this.addTestResult('Initial State', 
        gameState.getState() === GameState.MENU);

      // 模拟开始游戏
      gameEngine.start();
      gameState.startNewGame();
      this.addTestResult('Game Start', 
        gameState.getState() === GameState.PLAYING);

      // 模拟暂停游戏
      gameEngine.pause();
      gameState.pauseGame();
      this.addTestResult('Game Pause', 
        gameState.getState() === GameState.PAUSED);

      // 模拟恢复游戏
      gameEngine.resume();
      gameState.resumeGame();
      this.addTestResult('Game Resume', 
        gameState.getState() === GameState.PLAYING);

      // 模拟游戏结束
      gameState.endGame();
      this.addTestResult('Game Over', 
        gameState.getState() === GameState.GAME_OVER);

      // 测试重启
      gameState.resetGame();
      this.addTestResult('Game Restart', 
        gameState.getState() === GameState.MENU);

    } catch (error) {
      this.addTestResult('Game Flow', false, `Error: ${error}`);
    }
  }

  // 测试方块放置流程
  private testBlockPlacementFlow(): void {
    try {
      const blockSystem = new BlockSystem();
      const gameBoard = new GameBoardManager({ width: 10, height: 20 }, blockSystem);
      
      // 生成测试方块
      const block = blockSystem.createBlock(BlockType.O, { x: 4, y: 18 });
      
      // 验证方块可以放置
      const canPlace = blockSystem.canPlaceBlock(block, block.position, gameBoard.getBoard());
      this.addTestResult('Block Placement Check', canPlace);

      // 放置方块
      const lineClearResult = gameBoard.placeBlock(block);
      this.addTestResult('Block Placement', 
        lineClearResult.linesCleared >= 0);

      // 验证方块已放置
      const board = gameBoard.getBoard();
      const blockPositions = blockSystem.getBlockPositions(block);
      let blockPlaced = true;
      
      blockPositions.forEach(pos => {
        if (pos.x >= 0 && pos.x < board.width && pos.y >= 0 && pos.y < board.height) {
          if (!board.grid[pos.y][pos.x].filled) {
            blockPlaced = false;
          }
        }
      });

      this.addTestResult('Block Actually Placed', blockPlaced);

      // 测试方块移动
      const movedBlock = blockSystem.move(block, 'left');
      this.addTestResult('Block Movement', 
        movedBlock.position.x === block.position.x - 1);

      // 测试方块旋转
      const rotatedBlock = blockSystem.rotate(block);
      this.addTestResult('Block Rotation', 
        rotatedBlock.rotation.current !== block.rotation.current || 
        rotatedBlock.rotation.current === (block.rotation.current + 1) % 4);

    } catch (error) {
      this.addTestResult('Block Placement Flow', false, `Error: ${error}`);
    }
  }

  // 测试分数计算流程
  private testScoreCalculationFlow(): void {
    try {
      const scoreSystem = new ScoreSystem({
        enableCombo: true,
        enableSpecialBlocks: false
      });

      // 测试单行消除
      const singleLineEvent = scoreSystem.calculateLineScore(1);
      this.addTestResult('Single Line Score', 
        singleLineEvent.value === 100 && singleLineEvent.action === 'clear_line');

      // 获取分数后的状态
      const statsAfterSingle = scoreSystem.getStats();
      this.addTestResult('Stats Update After Single', 
        statsAfterSingle.score === 100 && statsAfterSingle.lines === 1);

      // 测试连击
      const comboLineEvent = scoreSystem.calculateLineScore(1);
      const statsAfterCombo = scoreSystem.getStats();
      
      this.addTestResult('Combo System', 
        comboLineEvent.value > singleLineEvent.value && statsAfterCombo.combo > 0);

      // 测试Tetris (四行消除)
      const tetrisEvent = scoreSystem.calculateLineScore(4);
      this.addTestResult('Tetris Score', 
        tetrisEvent.value >= 800);

      // 测试等级提升
      const levelInfo = scoreSystem.getLevelInfo();
      this.addTestResult('Level System', 
        levelInfo.level >= 1 && levelInfo.linesRequired > 0);

      // 测试高分更新
      const isNewHigh = scoreSystem.updateHighScore();
      const currentHighScore = scoreSystem.getHighScore();
      this.addTestResult('High Score Update', 
        isNewHigh && currentHighScore > 0);

    } catch (error) {
      this.addTestResult('Score Calculation Flow', false, `Error: ${error}`);
    }
  }

  // 测试游戏结束流程
  private testGameEndFlow(): void {
    try {
      const blockSystem = new BlockSystem();
      const gameBoard = new GameBoardManager({ width: 10, height: 20 }, blockSystem);
      
      // 填充顶部行模拟游戏结束
      for (let x = 0; x < 5; x++) {
        gameBoard.setCell({ x, y: 0 }, { filled: true, color: '#ff0000' });
      }

      // 检查游戏结束状态
      const isGameOver = gameBoard.isGameOver();
      this.addTestResult('Game Over Detection', isGameOver);

      // 获取最终统计
      const finalStats = {
        lines: gameBoard.getBoard().grid.flat().filter(cell => cell.filled).length,
        height: gameBoard.getCurrentHeight(),
        holes: gameBoard.getHoleCount()
      };

      this.addTestResult('Final Statistics', 
        finalStats.height > 0 && finalStats.lines >= 5);

      // 测试清空重置
      gameBoard.clear();
      const isCleared = !gameBoard.isGameOver() && gameBoard.getCurrentHeight() === 0;
      this.addTestResult('Board Clear', isCleared);

      // 测试分数系统重置
      const scoreSystem = new ScoreSystem();
      scoreSystem.calculateLineScore(2); // 添加一些分数
      
      const statsBeforeReset = scoreSystem.getStats();
      scoreSystem.reset();
      const statsAfterReset = scoreSystem.getStats();
      
      this.addTestResult('Score System Reset', 
        statsBeforeReset.score > 0 && statsAfterReset.score === 0);

    } catch (error) {
      this.addTestResult('Game End Flow', false, `Error: ${error}`);
    }
  }

  // 测试基础性能
  private testPerformanceBasics(): void {
    try {
      const startTime = performance.now();
      
      // 创建大量对象测试性能
      const iterations = 1000;
      const blockSystem = new BlockSystem();
      
      for (let i = 0; i < iterations; i++) {
        const block = blockSystem.generateBlock();
        const moved = blockSystem.move(block, 'down');
        const rotated = blockSystem.rotate(moved);
        // 简单操作验证
        if (!rotated.id) {
          throw new Error('Block creation failed');
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 1000次操作应该在合理时间内完成（比如100ms）
      this.addTestResult('Block Generation Performance', 
        duration < 100);

      // 测试游戏板性能
      const gameBoardStartTime = performance.now();
      const gameBoard = new GameBoardManager({ width: 10, height: 20 });
      
      for (let i = 0; i < 100; i++) {
        const testBlock = blockSystem.createBlock(BlockType.O, { x: i % 10, y: 19 });
        gameBoard.placeBlock(testBlock);
      }
      
      const gameBoardEndTime = performance.now();
      const gameBoardDuration = gameBoardEndTime - gameBoardStartTime;
      
      this.addTestResult('GameBoard Operations Performance', 
        gameBoardDuration < 50);

      // 测试分数计算性能
      const scoreStartTime = performance.now();
      const scoreSystem = new ScoreSystem();
      
      for (let i = 0; i < 100; i++) {
        scoreSystem.calculateLineScore(1 + (i % 4));
      }
      
      const scoreEndTime = performance.now();
      const scoreDuration = scoreEndTime - scoreStartTime;
      
      this.addTestResult('Score Calculation Performance', 
        scoreDuration < 30);

      // 内存使用基础检查
      const memoryInfo = this.getMemoryInfo();
      this.addTestResult('Memory Usage Check', 
        memoryInfo.used === undefined || memoryInfo.used < 50 * 1024 * 1024); // 50MB阈值

    } catch (error) {
      this.addTestResult('Performance Basics', false, `Error: ${error}`);
    }
  }

  // 获取内存信息
  private getMemoryInfo(): { used?: number; total?: number } {
    const memory = (performance as any).memory;
    
    if (memory) {
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
      };
    }
    return {};
  }
}

// 导出测试实例
export const integrationTest = new IntegrationTest();

// 简单的测试运行函数
export const runIntegrationTests = async (): Promise<boolean> => {
  const test = new IntegrationTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};
