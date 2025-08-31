import { BlockSystem } from '../src/services/BlockSystem';
import { CollisionDetector } from '../src/utils/collision';
import { BlockType, GameBoard, GridCell } from '../src/types';
import { BaseTest } from './utils/testUtils';

// 方块系统测试类
export class BlockSystemTest extends BaseTest {

  // 运行所有测试
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Block System Tests...');
    
    this.testBlockGeneration();
    this.testBlockRotation();
    this.testBlockMovement();
    this.testCollisionDetection();
    this.testSpecialBlocks();
    this.testBlockPositioning();
    
    this.printResults();
  }

  // 测试方块生成
  private testBlockGeneration(): void {
    try {
      const blockSystem = new BlockSystem();
      
      // 测试基础方块生成
      const block = blockSystem.generateBlock();
      this.addTestResult('Generate Basic Block', 
        block !== null && Object.values(BlockType).includes(block.type));
      
      // 测试方块属性
      this.addTestResult('Block Has Required Properties', 
        block.id !== undefined && 
        block.color !== undefined && 
        block.position !== undefined &&
        block.rotation !== undefined);
      
      // 测试多个方块生成的唯一性
      const block1 = blockSystem.generateBlock();
      const block2 = blockSystem.generateBlock();
      this.addTestResult('Block IDs Are Unique', block1.id !== block2.id);
      
      // 测试特殊方块生成
      const specialBlock = blockSystem.generateSpecialBlock();
      this.addTestResult('Generate Special Block', 
        specialBlock.isSpecial && specialBlock.specialType !== undefined);
      
    } catch (error) {
      this.addTestResult('Block Generation', false, `Error: ${error}`);
    }
  }

  // 测试方块旋转
  private testBlockRotation(): void {
    try {
      const blockSystem = new BlockSystem();
      const block = blockSystem.createBlock(BlockType.T);
      
      // 测试顺时针旋转
      const rotatedBlock = blockSystem.rotate(block, true);
      this.addTestResult('Clockwise Rotation', 
        rotatedBlock.rotation.current === (block.rotation.current + 1) % 4);
      
      // 测试逆时针旋转
      const counterRotatedBlock = blockSystem.rotate(block, false);
      this.addTestResult('Counter-clockwise Rotation', 
        counterRotatedBlock.rotation.current === (block.rotation.current + 3) % 4);
      
      // 测试连续旋转回到原始状态
      let testBlock = block;
      for (let i = 0; i < 4; i++) {
        testBlock = blockSystem.rotate(testBlock, true);
      }
      this.addTestResult('Full Rotation Cycle', 
        testBlock.rotation.current === block.rotation.current);
      
      // 测试获取当前形状
      const shape = blockSystem.getCurrentShape(block);
      this.addTestResult('Get Current Shape', 
        Array.isArray(shape) && shape.length > 0);
      
    } catch (error) {
      this.addTestResult('Block Rotation', false, `Error: ${error}`);
    }
  }

  // 测试方块移动
  private testBlockMovement(): void {
    try {
      const blockSystem = new BlockSystem();
      const block = blockSystem.createBlock(BlockType.O, { x: 5, y: 10 });
      
      // 测试左移
      const leftBlock = blockSystem.move(block, 'left');
      this.addTestResult('Move Left', 
        leftBlock.position.x === block.position.x - 1 && 
        leftBlock.position.y === block.position.y);
      
      // 测试右移
      const rightBlock = blockSystem.move(block, 'right');
      this.addTestResult('Move Right', 
        rightBlock.position.x === block.position.x + 1 && 
        rightBlock.position.y === block.position.y);
      
      // 测试下移
      const downBlock = blockSystem.move(block, 'down');
      this.addTestResult('Move Down', 
        downBlock.position.x === block.position.x && 
        downBlock.position.y === block.position.y + 1);
      
      // 测试获取方块位置
      const positions = blockSystem.getBlockPositions(block);
      this.addTestResult('Get Block Positions', 
        Array.isArray(positions) && positions.length > 0);
      
    } catch (error) {
      this.addTestResult('Block Movement', false, `Error: ${error}`);
    }
  }

  // 测试碰撞检测
  private testCollisionDetection(): void {
    try {
      const blockSystem = new BlockSystem({ gridWidth: 10, gridHeight: 20 });
      const board = this.createTestBoard(10, 20);
      
      // 测试边界碰撞
      const leftBoundaryBlock = blockSystem.createBlock(BlockType.O, { x: -1, y: 10 });
      const leftCollision = blockSystem.checkCollision(leftBoundaryBlock, board);
      this.addTestResult('Left Boundary Collision', 
        leftCollision.hasCollision && leftCollision.collisionType === 'left');
      
      const rightBoundaryBlock = blockSystem.createBlock(BlockType.O, { x: 9, y: 10 });
      const rightCollision = blockSystem.checkCollision(rightBoundaryBlock, board);
      this.addTestResult('Right Boundary Collision', 
        rightCollision.hasCollision && rightCollision.collisionType === 'right');
      
      const bottomBoundaryBlock = blockSystem.createBlock(BlockType.O, { x: 5, y: 19 });
      const bottomCollision = blockSystem.checkCollision(bottomBoundaryBlock, board);
      this.addTestResult('Bottom Boundary Collision', 
        bottomCollision.hasCollision && bottomCollision.collisionType === 'bottom');
      
      // 测试正常位置无碰撞
      const normalBlock = blockSystem.createBlock(BlockType.O, { x: 4, y: 10 });
      const normalCollision = blockSystem.checkCollision(normalBlock, board);
      this.addTestResult('No Collision in Valid Position', !normalCollision.hasCollision);
      
      // 测试碰撞检测器
      const detector = new CollisionDetector(blockSystem);
      this.addTestResult('Collision Detector Creation', detector !== null);
      
      const canMoveLeft = detector.canMove(normalBlock, 'left', board);
      this.addTestResult('Can Move Detection', typeof canMoveLeft === 'boolean');
      
    } catch (error) {
      this.addTestResult('Collision Detection', false, `Error: ${error}`);
    }
  }

  // 测试特殊方块
  private testSpecialBlocks(): void {
    try {
      const blockSystem = new BlockSystem({ enableSpecialBlocks: true });
      
      // 测试炸弹方块
      const bombBlock = blockSystem.createBlock(BlockType.BOMB);
      this.addTestResult('Create Bomb Block', 
        bombBlock.isSpecial && bombBlock.specialType === 'BOMB');
      
      // 测试锁定方块
      const lockBlock = blockSystem.createBlock(BlockType.LOCK);
      this.addTestResult('Create Lock Block', 
        lockBlock.isSpecial && lockBlock.specialType === 'LOCK');
      
      // 测试特殊方块形状
      const bombShape = blockSystem.getCurrentShape(bombBlock);
      this.addTestResult('Bomb Block Shape', 
        Array.isArray(bombShape) && bombShape.length === 1);
      
      // 测试配置更新
      const originalConfig = blockSystem.getConfig();
      blockSystem.updateConfig({ enableSpecialBlocks: false });
      const updatedConfig = blockSystem.getConfig();
      this.addTestResult('Config Update', 
        originalConfig.enableSpecialBlocks !== updatedConfig.enableSpecialBlocks);
      
    } catch (error) {
      this.addTestResult('Special Blocks', false, `Error: ${error}`);
    }
  }

  // 测试方块定位
  private testBlockPositioning(): void {
    try {
      const blockSystem = new BlockSystem({ gridWidth: 10, gridHeight: 20 });
      const board = this.createTestBoard(10, 20);
      const block = blockSystem.createBlock(BlockType.I, { x: 4, y: 5 });
      
      // 测试幽灵位置计算
      const ghostPosition = blockSystem.calculateGhostPosition(block, board);
      this.addTestResult('Calculate Ghost Position', 
        ghostPosition.x === block.position.x && ghostPosition.y >= block.position.y);
      
      // 测试方块放置验证
      const canPlace = blockSystem.canPlaceBlock(block, { x: 4, y: 5 }, board);
      this.addTestResult('Can Place Block', canPlace === true);
      
      const cannotPlace = blockSystem.canPlaceBlock(block, { x: -1, y: 5 }, board);
      this.addTestResult('Cannot Place Block Out of Bounds', cannotPlace === false);
      
      // 测试旋转尝试
      const rotateResult = blockSystem.tryRotate(block, board);
      this.addTestResult('Try Rotate', rotateResult !== null);
      
      // 测试下一个方块预览
      const nextBlock = blockSystem.previewNextBlock(BlockType.T);
      this.addTestResult('Preview Next Block', 
        nextBlock.type === BlockType.T && nextBlock.shape !== undefined);
      
    } catch (error) {
      this.addTestResult('Block Positioning', false, `Error: ${error}`);
    }
  }

  // 创建测试游戏板
  private createTestBoard(width: number, height: number): GameBoard {
    const grid: GridCell[][] = [];
    
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        grid[y][x] = {
          filled: false,
          color: '',
        };
      }
    }
    
    return {
      width,
      height,
      grid,
    };
  }

  // 向测试板添加已填充的格子
  private addFilledCells(board: GameBoard, positions: Array<{ x: number; y: number }>): void {
    positions.forEach(pos => {
      if (pos.x >= 0 && pos.x < board.width && pos.y >= 0 && pos.y < board.height) {
        board.grid[pos.y][pos.x] = {
          filled: true,
          color: '#888888',
        };
      }
    });
  }
}

// 导出测试实例
export const blockSystemTest = new BlockSystemTest();

// 简单的测试运行函数
export const runBlockSystemTests = async (): Promise<boolean> => {
  const test = new BlockSystemTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};
