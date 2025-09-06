import { GameBoardManager } from '../src/services/GameBoard';
import { BlockSystem } from '../src/services/BlockSystem';
import { GameBoardAnalyzer, gameBoardUtils } from '../src/utils/gameBoard';
import { BlockType, GameBoard, GridCell } from '../src/types';
import { BaseTest } from './utils/testUtils';

// 游戏板测试类
export class GameBoardTest extends BaseTest {

  // 运行所有测试
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Game Board Tests...');
    
    this.testBoardInitialization();
    this.testBlockPlacement();
    this.testLineClear();
    this.testSpecialBlocks();
    this.testGameOver();
    this.testBoardAnalysis();
    this.testBoardUtils();
    
    this.printResults();
  }

  // 测试游戏板初始化
  private testBoardInitialization(): void {
    try {
      const gameBoard = new GameBoardManager({ width: 10, height: 20 });
      const board = gameBoard.getBoard();
      
      // 测试游戏板尺寸
      this.addTestResult('Board Dimensions', 
        board.width === 10 && board.height === 20);
      
      // 测试初始状态为空
      let isEmpty = true;
      for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
          if (board.grid[y][x].filled) {
            isEmpty = false;
            break;
          }
        }
        if (!isEmpty) break;
      }
      this.addTestResult('Initial Board Empty', isEmpty);
      
      // 测试游戏未结束
      this.addTestResult('Game Not Over Initially', !gameBoard.isGameOver());
      
      // 测试当前高度为0
      this.addTestResult('Initial Height Zero', gameBoard.getCurrentHeight() === 0);
      
      // 测试无空洞
      this.addTestResult('No Initial Holes', gameBoard.getHoleCount() === 0);
      
    } catch (error) {
      this.addTestResult('Board Initialization', false, `Error: ${error}`);
    }
  }

  // 测试方块放置
  private testBlockPlacement(): void {
    try {
      const blockSystem = new BlockSystem();
      const gameBoard = new GameBoardManager({ width: 10, height: 20 }, blockSystem);
      
      // 创建测试方块
      const block = blockSystem.createBlock(BlockType.O, { x: 4, y: 18 });
      
      // 放置方块
      const result = gameBoard.placeBlock(block);
      
      // 测试放置结果
      this.addTestResult('Block Placement', 
        result.linesCleared >= 0 && result.pointsEarned >= 0);
      
      // 检查方块是否正确放置
      const positions = blockSystem.getBlockPositions(block);
      let allPlaced = true;
      const boardAfterPlacement = gameBoard.getBoard();
      
      positions.forEach(pos => {
        if (pos.x >= 0 && pos.x < boardAfterPlacement.width && pos.y >= 0 && pos.y < boardAfterPlacement.height) {
          if (!boardAfterPlacement.grid[pos.y][pos.x].filled) {
            allPlaced = false;
          }
        }
      });
      
      this.addTestResult('Block Correctly Placed', allPlaced);
      
      // 测试获取和设置格子
      const cell = gameBoard.getCell({ x: 4, y: 18 });
      this.addTestResult('Get Cell', cell !== null && cell.filled);
      
      const newCell: GridCell = { filled: true, color: '#FF0000' };
      const setCellResult = gameBoard.setCell({ x: 0, y: 19 }, newCell);
      this.addTestResult('Set Cell', setCellResult);
      
    } catch (error) {
      this.addTestResult('Block Placement', false, `Error: ${error}`);
    }
  }

  // 测试行消除
  private testLineClear(): void {
    try {
      const blockSystem = new BlockSystem();
      const gameBoard = new GameBoardManager({ width: 10, height: 20 }, blockSystem);
      
      // 手动填充底部一行
      for (let x = 0; x < 10; x++) {
        gameBoard.setCell({ x, y: 19 }, { filled: true, color: '#888888' });
      }
      
      // 现在放置一个方块来触发行清除（不需要实际放置，因为行已经满了）
      const result = gameBoard.clearLines();
      
      // 测试行消除
      this.addTestResult('Line Clear Detected', result.linesCleared > 0);
      this.addTestResult('Points Earned', result.pointsEarned > 0);
      
      // 测试行消除后的状态
      const newBoard = gameBoard.getBoard();
      let bottomRowEmpty = true;
      for (let x = 0; x < newBoard.width; x++) {
        if (newBoard.grid[19][x].filled) {
          bottomRowEmpty = false;
          break;
        }
      }
      
      this.addTestResult('Bottom Row Cleared', bottomRowEmpty, 
        bottomRowEmpty ? 'Bottom row was cleared successfully' : 'Bottom row was not cleared as expected');
      
      // 测试获取已填充行
      const filledRows = gameBoard.getFilledRows();
      this.addTestResult('Get Filled Rows', Array.isArray(filledRows));
      
      // 测试获取空行
      const emptyRows = gameBoard.getEmptyRows();
      this.addTestResult('Get Empty Rows', Array.isArray(emptyRows) && emptyRows.length > 0);
      
    } catch (error) {
      this.addTestResult('Line Clear', false, `Error: ${error}`);
    }
  }

  // 测试特殊方块
  private testSpecialBlocks(): void {
    try {
      const blockSystem = new BlockSystem({ enableSpecialBlocks: true });
      const gameBoard = new GameBoardManager({ width: 10, height: 20, enableSpecialBlocks: true }, blockSystem);
      
      // 测试炸弹方块
      const bombBlock = blockSystem.createBlock(BlockType.BOMB, { x: 4, y: 18 });
      
      // 先填充一些普通方块
      for (let x = 0; x < 10; x++) {
        if (x !== 4) { // 为炸弹方块留出位置
          gameBoard.setCell({ x, y: 19 }, { filled: true, color: '#888888' });
        }
      }
      
      // 放置炸弹方块触发爆炸
      const bombResult = gameBoard.placeBlock(bombBlock);
      
      this.addTestResult('Bomb Block Placement', 
        bombResult.isSpecialClear && bombResult.specialEffects.length > 0,
        bombResult.isSpecialClear && bombResult.specialEffects.length > 0 
          ? 'Bomb block exploded and cleared cells' 
          : 'Bomb block did not explode or clear cells as expected');
      
      // 测试锁定方块
      const lockBlock = blockSystem.createBlock(BlockType.LOCK, { x: 2, y: 18 });
      const lockResult = gameBoard.placeBlock(lockBlock);
      this.addTestResult('Lock Block Placement', lockResult !== null);
      
      // 测试更新锁定状态
      gameBoard.updateLockedCells();
      this.addTestResult('Update Locked Cells', true); // 只要不抛异常就算通过
      
    } catch (error) {
      this.addTestResult('Special Blocks', false, `Error: ${error}`);
    }
  }

  // 测试游戏结束
  private testGameOver(): void {
    try {
      const blockSystem = new BlockSystem();
      const gameBoard = new GameBoardManager({ width: 10, height: 20 }, blockSystem);
      
      // 填充顶部行来触发游戏结束
      for (let x = 0; x < 5; x++) {
        gameBoard.setCell({ x, y: 0 }, { filled: true, color: '#FF0000' });
      }
      
      // 测试游戏结束检测
      this.addTestResult('Game Over Detection', gameBoard.isGameOver());
      
      // 清空游戏板
      gameBoard.clear();
      
      // 测试清空后状态
      this.addTestResult('Board Clear', !gameBoard.isGameOver());
      this.addTestResult('Height After Clear', gameBoard.getCurrentHeight() === 0);
      
    } catch (error) {
      this.addTestResult('Game Over', false, `Error: ${error}`);
    }
  }

  // 测试游戏板分析
  private testBoardAnalysis(): void {
    try {
      const board = this.createTestBoard();
      
      // 测试分析功能
      const analysis = GameBoardAnalyzer.analyzeBoard(board);
      this.addTestResult('Board Analysis', 
        typeof analysis.height === 'number' &&
        typeof analysis.holes === 'number' &&
        typeof analysis.bumpiness === 'number');
      
      // 测试列高度计算
      const columnHeights = GameBoardAnalyzer.getColumnHeights(board);
      this.addTestResult('Column Heights', 
        Array.isArray(columnHeights) && columnHeights.length === board.width);
      
      // 测试空洞计算
      const holes = GameBoardAnalyzer.countHoles(board);
      this.addTestResult('Hole Count', typeof holes === 'number' && holes >= 0);
      
      // 测试完成行计算
      const completedLines = GameBoardAnalyzer.countCompletedLines(board);
      this.addTestResult('Completed Lines', typeof completedLines === 'number' && completedLines >= 0);
      
      // 测试最佳放置位置查找
      const blockSystem = new BlockSystem();
      const testBlock = blockSystem.createBlock(BlockType.I);
      const bestPlacement = GameBoardAnalyzer.findBestPlacement(testBlock, board, blockSystem);
      this.addTestResult('Best Placement', 
        bestPlacement === null || (bestPlacement.position && typeof bestPlacement.score === 'number'));
      
    } catch (error) {
      this.addTestResult('Board Analysis', false, `Error: ${error}`);
    }
  }

  // 测试游戏板工具函数
  private testBoardUtils(): void {
    try {
      // 测试创建空游戏板
      const emptyBoard = gameBoardUtils.createEmptyBoard(8, 15);
      this.addTestResult('Create Empty Board', 
        emptyBoard.width === 8 && emptyBoard.height === 15);
      
      // 测试位置验证
      const isValid = gameBoardUtils.isValidPosition(emptyBoard, { x: 4, y: 10 });
      const isInvalid = gameBoardUtils.isValidPosition(emptyBoard, { x: 10, y: 5 });
      this.addTestResult('Position Validation', isValid && !isInvalid);
      
      // 测试填充位置
      const positions = [{ x: 2, y: 5 }, { x: 3, y: 5 }];
      const filledBoard = gameBoardUtils.fillPositions(emptyBoard, positions, '#FF0000');
      this.addTestResult('Fill Positions', 
        filledBoard.grid[5][2].filled && filledBoard.grid[5][3].filled);
      
      // 测试清空位置
      const clearedBoard = gameBoardUtils.clearPositions(filledBoard, positions);
      this.addTestResult('Clear Positions', 
        !clearedBoard.grid[5][2].filled && !clearedBoard.grid[5][3].filled);
      
      // 测试相邻位置
      const adjacent = gameBoardUtils.getAdjacentPositions({ x: 5, y: 5 });
      this.addTestResult('Adjacent Positions', adjacent.length === 4);
      
      // 测试周围位置
      const surrounding = gameBoardUtils.getSurroundingPositions({ x: 5, y: 5 });
      this.addTestResult('Surrounding Positions', surrounding.length === 8);
      
      // 测试距离计算
      const manhattanDist = gameBoardUtils.getManhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
      const euclideanDist = gameBoardUtils.getEuclideanDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
      this.addTestResult('Distance Calculation', 
        manhattanDist === 7 && euclideanDist === 5);
      
    } catch (error) {
      this.addTestResult('Board Utils', false, `Error: ${error}`);
    }
  }

  // 创建测试游戏板
  private createTestBoard(): GameBoard {
    const board = gameBoardUtils.createEmptyBoard(10, 20);
    
    // 添加一些测试数据
    // 底部几行有一些方块
    const testPositions = [
      { x: 0, y: 19 }, { x: 1, y: 19 }, { x: 2, y: 19 }, { x: 4, y: 19 },
      { x: 0, y: 18 }, { x: 2, y: 18 }, { x: 3, y: 18 },
      { x: 1, y: 17 }, { x: 3, y: 17 },
    ];
    
    return gameBoardUtils.fillPositions(board, testPositions, '#888888');
  }
}

// 导出测试实例
export const gameBoardTest = new GameBoardTest();

// 简单的测试运行函数
export const runGameBoardTests = async (): Promise<boolean> => {
  const test = new GameBoardTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};
