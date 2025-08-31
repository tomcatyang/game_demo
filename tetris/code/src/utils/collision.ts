import { Block, GameBoard, Position } from '@/types';
import { BlockSystem } from '@/services/BlockSystem';

// 碰撞检测工具类
export class CollisionDetector {
  private blockSystem: BlockSystem;

  constructor(blockSystem: BlockSystem) {
    this.blockSystem = blockSystem;
  }

  // 检查方块是否可以移动到指定方向
  canMove(block: Block, direction: 'left' | 'right' | 'down', board: GameBoard): boolean {
    const movedBlock = this.blockSystem.move(block, direction);
    return !this.blockSystem.checkCollision(movedBlock, board).hasCollision;
  }

  // 检查方块是否可以旋转
  canRotate(block: Block, board: GameBoard, clockwise: boolean = true): boolean {
    const rotatedBlock = this.blockSystem.rotate(block, clockwise);
    return !this.blockSystem.checkCollision(rotatedBlock, board).hasCollision;
  }

  // 检查方块是否已经着地
  isLanded(block: Block, board: GameBoard): boolean {
    return !this.canMove(block, 'down', board);
  }

  // 检查游戏是否结束 (方块堆叠到顶部)
  isGameOver(board: GameBoard): boolean {
    // 检查顶部几行是否有方块
    for (let x = 0; x < board.width; x++) {
      if (board.grid[0][x].filled || board.grid[1][x].filled) {
        return true;
      }
    }
    return false;
  }

  // 获取可能的移动方向
  getPossibleMoves(block: Block, board: GameBoard): Array<'left' | 'right' | 'down'> {
    const possibleMoves: Array<'left' | 'right' | 'down'> = [];

    if (this.canMove(block, 'left', board)) {
      possibleMoves.push('left');
    }
    if (this.canMove(block, 'right', board)) {
      possibleMoves.push('right');
    }
    if (this.canMove(block, 'down', board)) {
      possibleMoves.push('down');
    }

    return possibleMoves;
  }

  // 检查指定位置是否安全 (没有碰撞)
  isPositionSafe(block: Block, position: Position, board: GameBoard): boolean {
    const testBlock = {
      ...block,
      position,
    };
    return !this.blockSystem.checkCollision(testBlock, board).hasCollision;
  }

  // 找到方块的最低可能位置 (硬降)
  findDropPosition(block: Block, board: GameBoard): Position {
    return this.blockSystem.calculateGhostPosition(block, board);
  }

  // 检查两个方块是否重叠
  areBlocksOverlapping(block1: Block, block2: Block): boolean {
    const positions1 = this.blockSystem.getBlockPositions(block1);
    const positions2 = this.blockSystem.getBlockPositions(block2);

    for (const pos1 of positions1) {
      for (const pos2 of positions2) {
        if (pos1.x === pos2.x && pos1.y === pos2.y) {
          return true;
        }
      }
    }

    return false;
  }

  // 获取方块周围的空白区域
  getSurroundingEmptySpaces(block: Block, board: GameBoard): Position[] {
    const blockPositions = this.blockSystem.getBlockPositions(block);
    const emptySpaces: Position[] = [];
    const checked = new Set<string>();

    // 检查方块周围的8个方向
    const directions = [
      { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
      { x: -1, y: 0 },                    { x: 1, y: 0 },
      { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 },
    ];

    for (const blockPos of blockPositions) {
      for (const dir of directions) {
        const checkPos = {
          x: blockPos.x + dir.x,
          y: blockPos.y + dir.y,
        };

        const key = `${checkPos.x},${checkPos.y}`;
        if (checked.has(key)) continue;
        checked.add(key);

        // 检查位置是否在边界内且为空
        if (
          checkPos.x >= 0 &&
          checkPos.x < board.width &&
          checkPos.y >= 0 &&
          checkPos.y < board.height &&
          !board.grid[checkPos.y][checkPos.x].filled
        ) {
          emptySpaces.push(checkPos);
        }
      }
    }

    return emptySpaces;
  }

  // 计算方块下落到底部需要的步数
  calculateDropSteps(block: Block, board: GameBoard): number {
    const ghostPosition = this.findDropPosition(block, board);
    return ghostPosition.y - block.position.y;
  }

  // 检查特定区域是否为空
  isAreaEmpty(topLeft: Position, bottomRight: Position, board: GameBoard): boolean {
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      for (let x = topLeft.x; x <= bottomRight.x; x++) {
        if (
          x < 0 || x >= board.width ||
          y < 0 || y >= board.height ||
          board.grid[y][x].filled
        ) {
          return false;
        }
      }
    }
    return true;
  }

  // 获取详细的碰撞信息
  getDetailedCollisionInfo(block: Block, board: GameBoard): {
    hasCollision: boolean;
    collisionPoints: Position[];
    collisionType: 'boundary' | 'block' | 'none';
    blockedDirections: Array<'left' | 'right' | 'down' | 'up'>;
  } {
    const collision = this.blockSystem.checkCollision(block, board);
    const blockedDirections: Array<'left' | 'right' | 'down' | 'up'> = [];
    const collisionPoints: Position[] = [];

    // 检查各个方向是否被阻挡
    if (!this.canMove(block, 'left', board)) {
      blockedDirections.push('left');
    }
    if (!this.canMove(block, 'right', board)) {
      blockedDirections.push('right');
    }
    if (!this.canMove(block, 'down', board)) {
      blockedDirections.push('down');
    }

    // 获取具体的碰撞点
    if (collision.hasCollision) {
      const shape = this.blockSystem.getCurrentShape(block);
      const { x, y } = block.position;

      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col] === 1) {
            const boardX = x + col;
            const boardY = y + row;

            // 检查是否与边界或方块碰撞
            if (
              boardX < 0 || boardX >= board.width ||
              boardY >= board.height ||
              (boardY >= 0 && board.grid[boardY][boardX].filled)
            ) {
              collisionPoints.push({ x: boardX, y: boardY });
            }
          }
        }
      }
    }

    return {
      hasCollision: collision.hasCollision,
      collisionPoints,
      collisionType: collision.hasCollision 
        ? (collision.collisionType === 'block' ? 'block' : 'boundary')
        : 'none',
      blockedDirections,
    };
  }
}

// 碰撞检测工具函数
export const collisionUtils = {
  // 创建碰撞检测器
  createDetector: (blockSystem: BlockSystem) => new CollisionDetector(blockSystem),

  // 快速检查位置是否有效
  isValidPosition: (position: Position, boardWidth: number, boardHeight: number): boolean => {
    return position.x >= 0 && 
           position.x < boardWidth && 
           position.y >= 0 && 
           position.y < boardHeight;
  },

  // 计算两个位置之间的距离
  getDistance: (pos1: Position, pos2: Position): number => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // 检查位置是否在矩形区域内
  isPositionInBounds: (
    position: Position, 
    topLeft: Position, 
    bottomRight: Position
  ): boolean => {
    return position.x >= topLeft.x &&
           position.x <= bottomRight.x &&
           position.y >= topLeft.y &&
           position.y <= bottomRight.y;
  },

  // 获取位置的字符串表示 (用于Set或Map的key)
  positionToString: (position: Position): string => {
    return `${position.x},${position.y}`;
  },

  // 从字符串解析位置
  stringToPosition: (str: string): Position => {
    const [x, y] = str.split(',').map(Number);
    return { x, y };
  },
};
