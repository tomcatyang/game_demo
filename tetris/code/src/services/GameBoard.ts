import { 
  GameBoard, 
  GridCell, 
  Block, 
  Position, 
  SpecialBlockType 
} from '@/types';
import { BlockSystem } from './BlockSystem';
import { BLOCK_CONSTANTS } from '@/constants/blocks';

// 行消除结果接口
export interface LineClearResult {
  linesCleared: number;
  clearedLineIndices: number[];
  pointsEarned: number;
  isSpecialClear: boolean;
  specialEffects: SpecialEffect[];
}

// 特殊效果接口
export interface SpecialEffect {
  type: 'bomb' | 'lock_break' | 'chain_reaction';
  position: Position;
  affectedPositions: Position[];
  damage: number;
}

// 游戏板配置
interface GameBoardConfig {
  width: number;
  height: number;
  enableSpecialBlocks: boolean;
}

// 默认配置
const defaultConfig: GameBoardConfig = {
  width: 10,
  height: 20,
  enableSpecialBlocks: false,
};

// 游戏板类
export class GameBoardManager {
  private board: GameBoard;
  private config: GameBoardConfig;
  private blockSystem: BlockSystem;
  private lockedCells: Map<string, { unlockTime: number; originalColor: string }> = new Map();

  constructor(config?: Partial<GameBoardConfig>, blockSystem?: BlockSystem) {
    this.config = { ...defaultConfig, ...config };
    this.blockSystem = blockSystem || new BlockSystem();
    this.board = this.initializeBoard();
  }

  // 获取游戏板
  getBoard(): GameBoard {
    return {
      width: this.board.width,
      height: this.board.height,
      grid: this.board.grid.map(row => row.map(cell => ({ ...cell }))),
    };
  }

  // 放置方块
  placeBlock(block: Block): LineClearResult {
    const positions = this.blockSystem.getBlockPositions(block);
    
    // 放置方块到网格
    positions.forEach(pos => {
      if (this.isValidPosition(pos)) {
        this.board.grid[pos.y][pos.x] = {
          filled: true,
          color: block.color,
          blockType: block.type,
          isSpecial: block.isSpecial,
          specialType: block.specialType,
        };

        // 处理特殊方块效果
        if (block.isSpecial) {
          this.handleSpecialBlockPlacement(pos, block);
        }
      }
    });

    // 检查并清除行
    return this.clearLines();
  }

  // 清除行
  clearLines(): LineClearResult {
    const clearedLineIndices: number[] = [];
    const specialEffects: SpecialEffect[] = [];
    let totalPoints = 0;
    let isSpecialClear = false;

    // 从底部开始检查每一行
    for (let y = this.board.height - 1; y >= 0; y--) {
      if (this.isLineFull(y)) {
        // 检查特殊方块效果
        const lineSpecialEffects = this.processSpecialBlocksInLine(y);
        specialEffects.push(...lineSpecialEffects);
        
        if (lineSpecialEffects.length > 0) {
          isSpecialClear = true;
        }

        clearedLineIndices.push(y);
      }
    }

    // 清除标记的行
    if (clearedLineIndices.length > 0) {
      this.removeLines(clearedLineIndices);
      totalPoints = this.calculateLinePoints(clearedLineIndices.length);
    }

    // 处理特殊效果
    specialEffects.forEach(effect => {
      totalPoints += this.applySpecialEffect(effect);
    });

    return {
      linesCleared: clearedLineIndices.length,
      clearedLineIndices,
      pointsEarned: totalPoints,
      isSpecialClear,
      specialEffects,
    };
  }

  // 检查游戏是否结束
  isGameOver(): boolean {
    // 检查顶部两行是否有方块
    for (let x = 0; x < this.board.width; x++) {
      if (this.board.grid[0][x].filled || this.board.grid[1][x].filled) {
        return true;
      }
    }
    return false;
  }

  // 获取指定位置的格子
  getCell(position: Position): GridCell | null {
    if (!this.isValidPosition(position)) {
      return null;
    }
    return { ...this.board.grid[position.y][position.x] };
  }

  // 设置指定位置的格子
  setCell(position: Position, cell: GridCell): boolean {
    if (!this.isValidPosition(position)) {
      return false;
    }
    this.board.grid[position.y][position.x] = { ...cell };
    return true;
  }

  // 清空游戏板
  clear(): void {
    this.board = this.initializeBoard();
    this.lockedCells.clear();
  }

  // 获取已填充的行数
  getFilledRows(): number[] {
    const filledRows: number[] = [];
    for (let y = 0; y < this.board.height; y++) {
      if (this.isLineFull(y)) {
        filledRows.push(y);
      }
    }
    return filledRows;
  }

  // 获取空行数
  getEmptyRows(): number[] {
    const emptyRows: number[] = [];
    for (let y = 0; y < this.board.height; y++) {
      if (this.isLineEmpty(y)) {
        emptyRows.push(y);
      }
    }
    return emptyRows;
  }

  // 获取当前高度 (最高的已填充行)
  getCurrentHeight(): number {
    for (let y = 0; y < this.board.height; y++) {
      for (let x = 0; x < this.board.width; x++) {
        if (this.board.grid[y][x].filled) {
          return this.board.height - y;
        }
      }
    }
    return 0;
  }

  // 获取空洞数量 (被方块包围的空格)
  getHoleCount(): number {
    let holes = 0;
    
    for (let x = 0; x < this.board.width; x++) {
      let foundBlock = false;
      for (let y = 0; y < this.board.height; y++) {
        if (this.board.grid[y][x].filled) {
          foundBlock = true;
        } else if (foundBlock) {
          holes++;
        }
      }
    }
    
    return holes;
  }

  // 更新锁定状态
  updateLockedCells(): void {
    const currentTime = Date.now();
    const keysToRemove: string[] = [];

    this.lockedCells.forEach((lockInfo, key) => {
      if (currentTime >= lockInfo.unlockTime) {
        const [x, y] = key.split(',').map(Number);
        const position = { x, y };
        
        if (this.isValidPosition(position)) {
          // 解锁格子
          this.board.grid[y][x] = {
            filled: true,
            color: lockInfo.originalColor,
            isSpecial: false,
          };
        }
        
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => this.lockedCells.delete(key));
  }

  // 私有方法

  // 初始化游戏板
  private initializeBoard(): GameBoard {
    const grid: GridCell[][] = [];
    
    for (let y = 0; y < this.config.height; y++) {
      grid[y] = [];
      for (let x = 0; x < this.config.width; x++) {
        grid[y][x] = {
          filled: false,
          color: '',
        };
      }
    }
    
    return {
      width: this.config.width,
      height: this.config.height,
      grid,
    };
  }

  // 检查位置是否有效
  private isValidPosition(position: Position): boolean {
    return position.x >= 0 && 
           position.x < this.board.width && 
           position.y >= 0 && 
           position.y < this.board.height;
  }

  // 检查行是否已满
  private isLineFull(row: number): boolean {
    for (let x = 0; x < this.board.width; x++) {
      if (!this.board.grid[row][x].filled) {
        return false;
      }
    }
    return true;
  }

  // 检查行是否为空
  private isLineEmpty(row: number): boolean {
    for (let x = 0; x < this.board.width; x++) {
      if (this.board.grid[row][x].filled) {
        return false;
      }
    }
    return true;
  }

  // 处理特殊方块放置
  private handleSpecialBlockPlacement(position: Position, block: Block): void {
    if (!block.isSpecial || !block.specialType) return;

    switch (block.specialType) {
      case SpecialBlockType.LOCK: {
        const key = `${position.x},${position.y}`;
        this.lockedCells.set(key, {
          unlockTime: Date.now() + BLOCK_CONSTANTS.LOCK_DURATION,
          originalColor: block.color,
        });
        break;
      }
    }
  }

  // 处理行中的特殊方块
  private processSpecialBlocksInLine(row: number): SpecialEffect[] {
    const effects: SpecialEffect[] = [];

    for (let x = 0; x < this.board.width; x++) {
      const cell = this.board.grid[row][x];
      
      if (cell.isSpecial && cell.specialType) {
        switch (cell.specialType) {
          case SpecialBlockType.BOMB:
            effects.push(this.createBombEffect({ x, y: row }));
            break;
          
          case SpecialBlockType.LOCK:
            effects.push(this.createLockBreakEffect({ x, y: row }));
            break;
        }
      }
    }

    return effects;
  }

  // 创建炸弹效果
  private createBombEffect(position: Position): SpecialEffect {
    const affectedPositions: Position[] = [];
    const radius = BLOCK_CONSTANTS.BOMB_EXPLOSION_RADIUS;

    // 获取爆炸范围内的所有位置
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const targetPos = {
          x: position.x + dx,
          y: position.y + dy,
        };
        
        if (this.isValidPosition(targetPos)) {
          affectedPositions.push(targetPos);
        }
      }
    }

    return {
      type: 'bomb',
      position,
      affectedPositions,
      damage: 500, // 炸弹奖励分数
    };
  }

  // 创建锁定破坏效果
  private createLockBreakEffect(position: Position): SpecialEffect {
    return {
      type: 'lock_break',
      position,
      affectedPositions: [position],
      damage: 200, // 锁定方块破坏奖励
    };
  }

  // 应用特殊效果
  private applySpecialEffect(effect: SpecialEffect): number {
    let points = 0;

    switch (effect.type) {
      case 'bomb':
        // 清除爆炸范围内的方块
        effect.affectedPositions.forEach(pos => {
          if (this.board.grid[pos.y][pos.x].filled) {
            this.board.grid[pos.y][pos.x] = {
              filled: false,
              color: '',
            };
            points += 10; // 每个被炸掉的方块10分
          }
        });
        points += effect.damage;
        break;

      case 'lock_break': {
        // 移除锁定状态
        const key = `${effect.position.x},${effect.position.y}`;
        this.lockedCells.delete(key);
        points += effect.damage;
        break;
      }
    }

    return points;
  }

  // 移除指定的行
  private removeLines(lineIndices: number[]): void {
    // 按从上到下的顺序排序
    const sortedIndices = [...lineIndices].sort((a, b) => a - b);
    
    // 从上往下逐个删除行
    sortedIndices.forEach((lineIndex, index) => {
      const actualIndex = lineIndex - index; // 调整索引，因为前面的行已被删除
      
      // 删除该行
      this.board.grid.splice(actualIndex, 1);
      
      // 在顶部添加新的空行
      const newRow: GridCell[] = [];
      for (let x = 0; x < this.board.width; x++) {
        newRow.push({
          filled: false,
          color: '',
        });
      }
      this.board.grid.unshift(newRow);
    });
  }

  // 计算行消除分数
  private calculateLinePoints(linesCleared: number): number {
    const basePoints = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4行的基础分数
    return basePoints[Math.min(linesCleared, 4)] || 1000;
  }
}
