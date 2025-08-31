// 方块类型枚举
export enum BlockType {
  I = 'I',
  O = 'O',
  T = 'T',
  S = 'S',
  Z = 'Z',
  J = 'J',
  L = 'L',
  BOMB = 'BOMB',      // 炸弹方块
  LOCK = 'LOCK',      // 锁定方块
}

// 特殊方块类型枚举
export enum SpecialBlockType {
  BOMB = 'BOMB',
  LOCK = 'LOCK',
}

// 位置接口
export interface Position {
  x: number;
  y: number;
}

// 方块形状矩阵类型
export type BlockShape = number[][];

// 方块旋转状态
export interface BlockRotation {
  shapes: BlockShape[];
  current: number;
}

// 方块接口
export interface Block {
  type: BlockType;
  position: Position;
  rotation: BlockRotation;
  isSpecial: boolean;
  specialType?: SpecialBlockType;
  color: string;
  id: string;
  timestamp: number;
}

// 下一个方块预览接口
export interface NextBlock {
  type: BlockType;
  shape: BlockShape;
  color: string;
  isSpecial: boolean;
  specialType?: SpecialBlockType;
}

// 方块配置接口
export type BlockConfig = {
  [key in BlockType]: {
    shapes: BlockShape[];
    color: string;
    score: number;
  };
}

// 游戏板格子接口
export interface GridCell {
  filled: boolean;
  color: string;
  blockType?: BlockType;
  isSpecial?: boolean;
  specialType?: SpecialBlockType;
}

// 游戏板接口
export interface GameBoard {
  width: number;
  height: number;
  grid: GridCell[][];
}

// 碰撞检测结果接口
export interface CollisionResult {
  hasCollision: boolean;
  collisionType: 'bottom' | 'left' | 'right' | 'block';
  collisionPosition?: Position;
}
