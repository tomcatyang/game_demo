import { GameBoard, GridCell, Position, Block } from '@/types';
import { BlockSystem } from '@/services/BlockSystem';

// 游戏板分析工具
export class GameBoardAnalyzer {
  // 分析游戏板状态
  static analyzeBoard(board: GameBoard): {
    height: number;
    holes: number;
    bumpiness: number;
    completedLines: number;
    aggregateHeight: number;
    totalBlocks: number;
  } {
    const columnHeights = this.getColumnHeights(board);
    
    return {
      height: Math.max(...columnHeights),
      holes: this.countHoles(board, columnHeights),
      bumpiness: this.calculateBumpiness(columnHeights),
      completedLines: this.countCompletedLines(board),
      aggregateHeight: columnHeights.reduce((sum, height) => sum + height, 0),
      totalBlocks: this.countTotalBlocks(board),
    };
  }

  // 获取每列的高度
  static getColumnHeights(board: GameBoard): number[] {
    const heights: number[] = [];
    
    for (let x = 0; x < board.width; x++) {
      let height = 0;
      for (let y = 0; y < board.height; y++) {
        if (board.grid[y][x].filled) {
          height = board.height - y;
          break;
        }
      }
      heights.push(height);
    }
    
    return heights;
  }

  // 计算空洞数量
  static countHoles(board: GameBoard, columnHeights?: number[]): number {
    const heights = columnHeights || this.getColumnHeights(board);
    let holes = 0;
    
    for (let x = 0; x < board.width; x++) {
      const columnHeight = heights[x];
      if (columnHeight > 0) {
        const startY = board.height - columnHeight;
        for (let y = startY; y < board.height; y++) {
          if (!board.grid[y][x].filled) {
            holes++;
          }
        }
      }
    }
    
    return holes;
  }

  // 计算表面不平整度
  static calculateBumpiness(columnHeights: number[]): number {
    let bumpiness = 0;
    
    for (let i = 0; i < columnHeights.length - 1; i++) {
      bumpiness += Math.abs(columnHeights[i] - columnHeights[i + 1]);
    }
    
    return bumpiness;
  }

  // 计算已完成的行数
  static countCompletedLines(board: GameBoard): number {
    let completedLines = 0;
    
    for (let y = 0; y < board.height; y++) {
      let isComplete = true;
      for (let x = 0; x < board.width; x++) {
        if (!board.grid[y][x].filled) {
          isComplete = false;
          break;
        }
      }
      if (isComplete) {
        completedLines++;
      }
    }
    
    return completedLines;
  }

  // 计算总方块数
  static countTotalBlocks(board: GameBoard): number {
    let totalBlocks = 0;
    
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        if (board.grid[y][x].filled) {
          totalBlocks++;
        }
      }
    }
    
    return totalBlocks;
  }

  // 查找最佳放置位置 (简单AI)
  static findBestPlacement(block: Block, board: GameBoard, blockSystem: BlockSystem): {
    position: Position;
    rotation: number;
    score: number;
  } | null {
    let bestPlacement: { position: Position; rotation: number; score: number } | null = null;
    let bestScore = -Infinity;

    // 尝试所有旋转状态
    for (let rotation = 0; rotation < 4; rotation++) {
      const rotatedBlock = { ...block };
      for (let r = 0; r < rotation; r++) {
        rotatedBlock.rotation.current = (rotatedBlock.rotation.current + 1) % 4;
      }

      // 尝试所有列
      for (let x = 0; x < board.width; x++) {
        // 找到该列的最低位置
        const testPosition = { x, y: 0 };
        const ghostPosition = blockSystem.calculateGhostPosition({
          ...rotatedBlock,
          position: testPosition,
        }, board);

        const finalBlock = {
          ...rotatedBlock,
          position: ghostPosition,
        };

        // 检查是否可以放置
        if (blockSystem.canPlaceBlock(finalBlock, ghostPosition, board)) {
          const score = this.evaluatePlacement(finalBlock, board, blockSystem);
          
          if (score > bestScore) {
            bestScore = score;
            bestPlacement = {
              position: ghostPosition,
              rotation,
              score,
            };
          }
        }
      }
    }

    return bestPlacement;
  }

  // 评估放置位置的得分
  static evaluatePlacement(block: Block, board: GameBoard, blockSystem: BlockSystem): number {
    // 创建临时游戏板
    const tempBoard = this.cloneBoard(board);
    
    // 模拟放置方块
    const positions = blockSystem.getBlockPositions(block);
    positions.forEach(pos => {
      if (pos.x >= 0 && pos.x < tempBoard.width && pos.y >= 0 && pos.y < tempBoard.height) {
        tempBoard.grid[pos.y][pos.x] = {
          filled: true,
          color: block.color,
        };
      }
    });

    // 分析放置后的状态
    const analysis = this.analyzeBoard(tempBoard);
    
    // 计算得分 (这是一个简单的评分函数)
    let score = 0;
    
    // 奖励消除行
    score += analysis.completedLines * 1000;
    
    // 惩罚高度
    score -= analysis.height * 10;
    
    // 惩罚空洞
    score -= analysis.holes * 50;
    
    // 惩罚不平整
    score -= analysis.bumpiness * 5;
    
    // 奖励放置在底部
    score += (board.height - block.position.y) * 2;

    return score;
  }

  // 克隆游戏板
  static cloneBoard(board: GameBoard): GameBoard {
    return {
      width: board.width,
      height: board.height,
      grid: board.grid.map(row => 
        row.map(cell => ({ ...cell }))
      ),
    };
  }
}

// 游戏板渲染工具
export class GameBoardRenderer {
  // 将游戏板转换为字符串表示 (用于调试)
  static boardToString(board: GameBoard, showEmpty: string = '·', showFilled: string = '█'): string {
    let result = '';
    
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        result += board.grid[y][x].filled ? showFilled : showEmpty;
      }
      result += '\n';
    }
    
    return result;
  }

  // 将游戏板转换为二维数组 (用于可视化)
  static boardToArray(board: GameBoard): number[][] {
    return board.grid.map(row => 
      row.map(cell => cell.filled ? 1 : 0)
    );
  }

  // 获取游戏板的颜色信息
  static getBoardColors(board: GameBoard): string[][] {
    return board.grid.map(row => 
      row.map(cell => cell.color || 'transparent')
    );
  }

  // 高亮显示特定位置
  static highlightPositions(board: GameBoard, positions: Position[], highlightColor: string = '#FF0000'): string[][] {
    const colors = this.getBoardColors(board);
    
    positions.forEach(pos => {
      if (pos.x >= 0 && pos.x < board.width && pos.y >= 0 && pos.y < board.height) {
        colors[pos.y][pos.x] = highlightColor;
      }
    });
    
    return colors;
  }
}

// 游戏板工具函数
export const gameBoardUtils = {
  // 创建空的游戏板
  createEmptyBoard: (width: number, height: number): GameBoard => {
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
    
    return { width, height, grid };
  },

  // 填充指定位置
  fillPositions: (board: GameBoard, positions: Position[], color: string): GameBoard => {
    const newBoard = GameBoardAnalyzer.cloneBoard(board);
    
    positions.forEach(pos => {
      if (pos.x >= 0 && pos.x < newBoard.width && pos.y >= 0 && pos.y < newBoard.height) {
        newBoard.grid[pos.y][pos.x] = {
          filled: true,
          color,
        };
      }
    });
    
    return newBoard;
  },

  // 清空指定位置
  clearPositions: (board: GameBoard, positions: Position[]): GameBoard => {
    const newBoard = GameBoardAnalyzer.cloneBoard(board);
    
    positions.forEach(pos => {
      if (pos.x >= 0 && pos.x < newBoard.width && pos.y >= 0 && pos.y < newBoard.height) {
        newBoard.grid[pos.y][pos.x] = {
          filled: false,
          color: '',
        };
      }
    });
    
    return newBoard;
  },

  // 检查位置是否在边界内
  isValidPosition: (board: GameBoard, position: Position): boolean => {
    return position.x >= 0 && 
           position.x < board.width && 
           position.y >= 0 && 
           position.y < board.height;
  },

  // 获取相邻位置
  getAdjacentPositions: (position: Position): Position[] => {
    return [
      { x: position.x - 1, y: position.y },     // 左
      { x: position.x + 1, y: position.y },     // 右
      { x: position.x, y: position.y - 1 },     // 上
      { x: position.x, y: position.y + 1 },     // 下
    ];
  },

  // 获取周围8个位置
  getSurroundingPositions: (position: Position): Position[] => {
    return [
      { x: position.x - 1, y: position.y - 1 }, // 左上
      { x: position.x, y: position.y - 1 },     // 上
      { x: position.x + 1, y: position.y - 1 }, // 右上
      { x: position.x - 1, y: position.y },     // 左
      { x: position.x + 1, y: position.y },     // 右
      { x: position.x - 1, y: position.y + 1 }, // 左下
      { x: position.x, y: position.y + 1 },     // 下
      { x: position.x + 1, y: position.y + 1 }, // 右下
    ];
  },

  // 计算两个位置之间的曼哈顿距离
  getManhattanDistance: (pos1: Position, pos2: Position): number => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  },

  // 计算欧几里得距离
  getEuclideanDistance: (pos1: Position, pos2: Position): number => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
};
