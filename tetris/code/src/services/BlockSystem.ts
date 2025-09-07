import { 
  Block, 
  BlockType, 
  SpecialBlockType, 
  Position, 
  NextBlock,
  GameBoard,
  CollisionResult 
} from '../types';
import { 
  BLOCK_CONFIG, 
  BASIC_BLOCK_TYPES, 
  SPECIAL_BLOCK_TYPES, 
  BLOCK_WEIGHTS,
  BLOCK_CONSTANTS 
} from '../constants/blocks';

// 方块系统配置
interface BlockSystemConfig {
  enableSpecialBlocks: boolean;
  specialBlockChance: number;
  gridWidth: number;
  gridHeight: number;
}

// 默认配置
const defaultConfig: BlockSystemConfig = {
  enableSpecialBlocks: false,
  specialBlockChance: BLOCK_CONSTANTS.SPECIAL_BLOCK_CHANCE,
  gridWidth: 10,
  gridHeight: 20,
};

// 方块系统类
export class BlockSystem {
  private config: BlockSystemConfig;
  private blockIdCounter: number = 0;

  constructor(config?: Partial<BlockSystemConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // 生成随机方块
  generateBlock(): Block {
    const blockType = this.getRandomBlockType();
    return this.createBlock(blockType);
  }

  // 生成特殊方块
  generateSpecialBlock(): Block {
    const specialType = this.getRandomSpecialBlockType();
    return this.createBlock(specialType);
  }

  // 创建方块
  createBlock(type: BlockType, position?: Position): Block {
    const config = BLOCK_CONFIG[type];
    const startPosition = position || this.getStartPosition();
    
    const block: Block = {
      type,
      position: startPosition,
      rotation: {
        shapes: config.shapes,
        current: 0,
      },
      isSpecial: SPECIAL_BLOCK_TYPES.includes(type),
      specialType: SPECIAL_BLOCK_TYPES.includes(type) ? this.getSpecialType(type) : undefined,
      color: config.color,
      id: this.generateBlockId(),
      timestamp: Date.now(),
    };

    return block;
  }

  // 旋转方块
  rotate(block: Block, clockwise: boolean = true): Block {
    const newRotation = clockwise 
      ? (block.rotation.current + 1) % BLOCK_CONSTANTS.ROTATION_STATES
      : (block.rotation.current - 1 + BLOCK_CONSTANTS.ROTATION_STATES) % BLOCK_CONSTANTS.ROTATION_STATES;

    return {
      ...block,
      rotation: {
        ...block.rotation,
        current: newRotation,
      },
    };
  }

  // 移动方块
  move(block: Block, direction: 'left' | 'right' | 'down'): Block {
    let deltaX = 0;
    let deltaY = 0;

    switch (direction) {
      case 'left':
        deltaX = -1;
        break;
      case 'right':
        deltaX = 1;
        break;
      case 'down':
        deltaY = 1;
        break;
    }

    return {
      ...block,
      position: {
        x: block.position.x + deltaX,
        y: block.position.y + deltaY,
      },
    };
  }

  // 检查碰撞
  checkCollision(block: Block, board: GameBoard): CollisionResult {
    const shape = this.getCurrentShape(block);
    const { x, y } = block.position;

    // 检查边界碰撞
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          const boardX = x + col;
          const boardY = y + row;

          // 检查左右边界
          if (boardX < 0) {
            return {
              hasCollision: true,
              collisionType: 'left',
              collisionPosition: { x: boardX, y: boardY },
            };
          }
          if (boardX >= board.width) {
            return {
              hasCollision: true,
              collisionType: 'right',
              collisionPosition: { x: boardX, y: boardY },
            };
          }

          // 检查底部边界
          if (boardY >= board.height) {
            return {
              hasCollision: true,
              collisionType: 'bottom',
              collisionPosition: { x: boardX, y: boardY },
            };
          }

          // 检查与已有方块的碰撞
          if (boardY >= 0 && board.grid[boardY][boardX].filled) {
            return {
              hasCollision: true,
              collisionType: 'block',
              collisionPosition: { x: boardX, y: boardY },
            };
          }
        }
      }
    }

    return { hasCollision: false, collisionType: 'bottom' };
  }

  // 获取当前形状
  getCurrentShape(block: Block): number[][] {
    return block.rotation.shapes[block.rotation.current];
  }

  // 获取方块占用的位置
  getBlockPositions(block: Block): Position[] {
    const shape = this.getCurrentShape(block);
    const positions: Position[] = [];
    const { x, y } = block.position;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          positions.push({
            x: x + col,
            y: y + row,
          });
        }
      }
    }

    return positions;
  }

  // 预览下一个方块
  previewNextBlock(type?: BlockType): NextBlock {
    const blockType = type || this.getRandomBlockType();
    const config = BLOCK_CONFIG[blockType];

    return {
      type: blockType,
      shape: config.shapes[0], // 默认显示第一个旋转状态
      color: config.color,
      isSpecial: SPECIAL_BLOCK_TYPES.includes(blockType),
      specialType: SPECIAL_BLOCK_TYPES.includes(blockType) ? this.getSpecialType(blockType) : undefined,
    };
  }

  // 计算投影位置 (幽灵方块)
  calculateGhostPosition(block: Block, board: GameBoard): Position {
    let ghostBlock = { ...block };
    
    // 向下移动直到碰撞
    while (!this.checkCollision(ghostBlock, board).hasCollision) {
      ghostBlock = this.move(ghostBlock, 'down');
    }
    
    // 回退一步到最后一个有效位置
    return {
      x: ghostBlock.position.x,
      y: ghostBlock.position.y - 1,
    };
  }

  // 验证方块是否可以放置在指定位置
  canPlaceBlock(block: Block, position: Position, board: GameBoard): boolean {
    const testBlock = {
      ...block,
      position,
    };
    
    return !this.checkCollision(testBlock, board).hasCollision;
  }

  // 尝试旋转 (包含踢墙判定)
  tryRotate(block: Block, board: GameBoard, clockwise: boolean = true): Block | null {
    const rotatedBlock = this.rotate(block, clockwise);
    
    // 直接检查是否可以旋转
    if (!this.checkCollision(rotatedBlock, board).hasCollision) {
      return rotatedBlock;
    }

    // 尝试踢墙 (简单的左右偏移)
    const kickOffsets = [
      { x: -1, y: 0 },  // 左踢
      { x: 1, y: 0 },   // 右踢
      { x: 0, y: -1 },  // 上踢
      { x: -2, y: 0 },  // 左踢2格
      { x: 2, y: 0 },   // 右踢2格
    ];

    for (const offset of kickOffsets) {
      const kickedBlock = {
        ...rotatedBlock,
        position: {
          x: rotatedBlock.position.x + offset.x,
          y: rotatedBlock.position.y + offset.y,
        },
      };

      if (!this.checkCollision(kickedBlock, board).hasCollision) {
        return kickedBlock;
      }
    }

    // 无法旋转
    return null;
  }

  // 更新配置
  updateConfig(newConfig: Partial<BlockSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 获取配置
  getConfig(): BlockSystemConfig {
    return { ...this.config };
  }

  // 私有方法

  // 获取随机方块类型
  private getRandomBlockType(): BlockType {
    const availableTypes = this.config.enableSpecialBlocks 
      ? [...BASIC_BLOCK_TYPES, ...SPECIAL_BLOCK_TYPES]
      : BASIC_BLOCK_TYPES;

    // 检查是否生成特殊方块
    if (this.config.enableSpecialBlocks && Math.random() < this.config.specialBlockChance) {
      return this.getRandomSpecialBlockType();
    }

    // 基于权重的随机选择
    return this.weightedRandomChoice(availableTypes);
  }

  // 获取随机特殊方块类型
  private getRandomSpecialBlockType(): BlockType {
    return SPECIAL_BLOCK_TYPES[Math.floor(Math.random() * SPECIAL_BLOCK_TYPES.length)];
  }

  // 基于权重的随机选择
  private weightedRandomChoice(types: BlockType[]): BlockType {
    const totalWeight = types.reduce((sum, type) => sum + BLOCK_WEIGHTS[type], 0);
    let random = Math.random() * totalWeight;

    for (const type of types) {
      random -= BLOCK_WEIGHTS[type];
      if (random <= 0) {
        return type;
      }
    }

    return types[0]; // 备用返回
  }

  // 获取起始位置
  private getStartPosition(): Position {
    return {
      x: Math.floor(this.config.gridWidth / 2) - 1,
      y: 0,
    };
  }

  // 获取特殊方块类型
  private getSpecialType(blockType: BlockType): SpecialBlockType | undefined {
    switch (blockType) {
      case BlockType.BOMB:
        return SpecialBlockType.BOMB;
      case BlockType.LOCK:
        return SpecialBlockType.LOCK;
      default:
        return undefined;
    }
  }

  // 生成方块ID
  private generateBlockId(): string {
    return `block_${++this.blockIdCounter}_${Date.now()}`;
  }
}
