import { BlockType, Position } from '../types';
import { GameBoardManager } from './GameBoard';

// 特殊方块效果接口
export interface SpecialBlockEffect {
  type: 'bomb' | 'lock' | 'clear' | 'gravity';
  position: Position;
  radius?: number; // 爆炸半径
  duration?: number; // 持续时间（毫秒）
  power?: number; // 效果强度
}

// 特殊方块事件接口
export interface SpecialBlockEvent {
  type: 'explosion' | 'lock' | 'unlock' | 'clear' | 'gravity';
  position: Position;
  affectedPositions: Position[];
  score: number;
  timestamp: number;
}

// 特殊方块配置接口
export interface SpecialBlockConfig {
  enabled: boolean;
  bombProbability: number; // 炸弹方块生成概率 (0-1)
  lockProbability: number; // 锁定方块生成概率 (0-1)
  bombRadius: number; // 爆炸半径
  lockDuration: number; // 锁定持续时间（毫秒）
  bombScore: number; // 炸弹爆炸分数
  lockScore: number; // 锁定破坏分数
  clearScore: number; // 清除效果分数
}

// 默认特殊方块配置
const DEFAULT_SPECIAL_CONFIG: SpecialBlockConfig = {
  enabled: true,
  bombProbability: 0.1, // 10% 概率生成炸弹方块
  lockProbability: 0.05, // 5% 概率生成锁定方块
  bombRadius: 1, // 1格爆炸半径
  lockDuration: 3000, // 3秒锁定时间
  bombScore: 500, // 炸弹爆炸500分
  lockScore: 200, // 锁定破坏200分
  clearScore: 100, // 清除效果100分
};

// 特殊方块系统类
export class SpecialBlockSystem {
  private config: SpecialBlockConfig;
  private gameBoard: GameBoardManager | null;
  private lockedPositions: Set<string>; // 锁定的位置
  private lockTimers: Map<string, number>; // 锁定计时器
  private eventListeners: Map<string, (event: SpecialBlockEvent) => void>;
  private isEnabled: boolean;

  constructor(config: Partial<SpecialBlockConfig> = {}) {
    this.config = { ...DEFAULT_SPECIAL_CONFIG, ...config };
    this.gameBoard = null;
    this.lockedPositions = new Set();
    this.lockTimers = new Map();
    this.eventListeners = new Map();
    this.isEnabled = this.config.enabled;
  }

  // 设置游戏板引用
  setGameBoard(gameBoard: GameBoardManager): void {
    this.gameBoard = gameBoard;
  }

  // 更新配置
  updateConfig(newConfig: Partial<SpecialBlockConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.isEnabled = this.config.enabled;
  }

  // 获取当前配置
  getConfig(): SpecialBlockConfig {
    return { ...this.config };
  }

  // 检查是否应该生成特殊方块
  shouldGenerateSpecialBlock(): boolean {
    if (!this.isEnabled || !this.gameBoard) return false;
    
    const random = Math.random();
    return random < (this.config.bombProbability + this.config.lockProbability);
  }

  // 生成特殊方块类型
  generateSpecialBlockType(): BlockType {
    if (!this.isEnabled) return BlockType.I;
    
    const random = Math.random();
    const bombThreshold = this.config.bombProbability;
    const lockThreshold = bombThreshold + this.config.lockProbability;
    
    if (random < bombThreshold) {
      return BlockType.BOMB;
    } else if (random < lockThreshold) {
      return BlockType.LOCK;
    }
    
    return BlockType.I; // 默认返回普通方块
  }

  // 处理炸弹方块爆炸
  handleBombExplosion(position: Position): SpecialBlockEvent {
    if (!this.gameBoard) {
      throw new Error('GameBoard not set');
    }

    const affectedPositions: Position[] = [];
    const { x, y } = position;
    const radius = this.config.bombRadius;
    
    // 计算爆炸范围内的所有位置
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const newX = x + dx;
        const newY = y + dy;
        
        // 检查是否在爆炸范围内（十字形爆炸）
        if ((dx === 0 || dy === 0) && 
            newX >= 0 && newX < 10 && 
            newY >= 0 && newY < 20) {
          
          const cellPos = { x: newX, y: newY };
          const cell = this.gameBoard.getCell(cellPos);
          
          if (cell && cell.filled) {
            // 检查位置是否被锁定
            if (!this.isPositionLocked(cellPos)) {
              // 清除方块
              this.gameBoard.setCell(cellPos, {
                filled: false,
                color: '',
                blockType: BlockType.I,
                isSpecial: false,
                specialType: undefined,
              });
              affectedPositions.push(cellPos);
            }
          }
        }
      }
    }

    const event: SpecialBlockEvent = {
      type: 'explosion',
      position,
      affectedPositions,
      score: this.config.bombScore + (affectedPositions.length * 10),
      timestamp: Date.now(),
    };

    this.notifyListeners(event);
    return event;
  }

  // 处理锁定方块
  handleLockBlock(position: Position): SpecialBlockEvent {
    if (!this.gameBoard) {
      throw new Error('GameBoard not set');
    }

    const { x, y } = position;
    const positionKey = `${x},${y}`;
    
    // 添加锁定位置
    this.lockedPositions.add(positionKey);
    
    // 设置锁定计时器
    const timerId = setTimeout(() => {
      this.unlockPosition(position);
    }, this.config.lockDuration);
    
    this.lockTimers.set(positionKey, timerId);

    const event: SpecialBlockEvent = {
      type: 'lock',
      position,
      affectedPositions: [position],
      score: 0,
      timestamp: Date.now(),
    };

    this.notifyListeners(event);
    return event;
  }

  // 解锁位置
  unlockPosition(position: Position): void {
    const { x, y } = position;
    const positionKey = `${x},${y}`;
    
    if (this.lockedPositions.has(positionKey)) {
      this.lockedPositions.delete(positionKey);
      
      // 清除计时器
      const timerId = this.lockTimers.get(positionKey);
      if (timerId) {
        clearTimeout(timerId);
        this.lockTimers.delete(positionKey);
      }

      const event: SpecialBlockEvent = {
        type: 'unlock',
        position,
        affectedPositions: [position],
        score: 0,
        timestamp: Date.now(),
      };

      this.notifyListeners(event);
    }
  }

  // 检查位置是否被锁定
  isPositionLocked(position: Position): boolean {
    const { x, y } = position;
    const positionKey = `${x},${y}`;
    return this.lockedPositions.has(positionKey);
  }

  // 检查位置是否可以被清除（行消除时）
  canClearPosition(position: Position): boolean {
    return !this.isPositionLocked(position);
  }

  // 处理行消除时的特殊方块效果
  handleLineClear(clearedRows: number[]): SpecialBlockEvent[] {
    if (!this.gameBoard) {
      throw new Error('GameBoard not set');
    }

    const events: SpecialBlockEvent[] = [];
    
    for (const row of clearedRows) {
      for (let x = 0; x < 10; x++) {
        const position = { x, y: row };
        const cell = this.gameBoard.getCell(position);
        
        if (cell && cell.filled) {
          if (cell.blockType === BlockType.BOMB) {
            // 炸弹方块爆炸
            const bombEvent = this.handleBombExplosion(position);
            events.push(bombEvent);
          } else if (cell.blockType === BlockType.LOCK) {
            // 锁定方块被破坏
            this.unlockPosition(position);
            const lockEvent: SpecialBlockEvent = {
              type: 'clear',
              position,
              affectedPositions: [position],
              score: this.config.lockScore,
              timestamp: Date.now(),
            };
            events.push(lockEvent);
          }
        }
      }
    }

    return events;
  }

  // 处理重力效果（方块下落）
  handleGravityEffect(): SpecialBlockEvent[] {
    if (!this.gameBoard) {
      throw new Error('GameBoard not set');
    }

    const events: SpecialBlockEvent[] = [];
    const affectedPositions: Position[] = [];
    
    // 从底部向上扫描，处理悬空的方块
    for (let y = 18; y >= 0; y--) {
      for (let x = 0; x < 10; x++) {
        const position = { x, y };
        const cell = this.gameBoard.getCell(position);
        
        if (cell && cell.filled && !this.isPositionLocked(position)) {
          // 检查下方是否有支撑
          let hasSupport = false;
          for (let checkY = y + 1; checkY < 20; checkY++) {
            const checkCell = this.gameBoard.getCell({ x, y: checkY });
            if (checkCell && checkCell.filled) {
              hasSupport = true;
              break;
            }
          }
          
          if (!hasSupport) {
            // 方块悬空，需要下落
            let newY = y;
            while (newY < 19) {
              const belowCell = this.gameBoard.getCell({ x, y: newY + 1 });
              if (belowCell && belowCell.filled) {
                break;
              }
              newY++;
            }
            
            if (newY !== y) {
              // 移动方块
              this.gameBoard.setCell({ x, y: newY }, cell);
              this.gameBoard.setCell(position, {
                filled: false,
                color: '',
                blockType: BlockType.I,
                isSpecial: false,
                specialType: undefined,
              });
              affectedPositions.push({ x, y: newY });
            }
          }
        }
      }
    }

    if (affectedPositions.length > 0) {
      const gravityEvent: SpecialBlockEvent = {
        type: 'gravity',
        position: { x: 0, y: 0 },
        affectedPositions,
        score: this.config.clearScore * affectedPositions.length,
        timestamp: Date.now(),
      };
      events.push(gravityEvent);
      this.notifyListeners(gravityEvent);
    }

    return events;
  }

  // 获取所有锁定位置
  getLockedPositions(): Position[] {
    return Array.from(this.lockedPositions).map(key => {
      const [x, y] = key.split(',').map(Number);
      return { x, y };
    });
  }

  // 清除所有锁定
  clearAllLocks(): void {
    // 清除所有计时器
    this.lockTimers.forEach(timerId => clearTimeout(timerId));
    this.lockTimers.clear();
    
    // 清除锁定位置
    this.lockedPositions.clear();
  }

  // 添加事件监听器
  addEventListener(id: string, callback: (event: SpecialBlockEvent) => void): void {
    this.eventListeners.set(id, callback);
  }

  // 移除事件监听器
  removeEventListener(id: string): void {
    this.eventListeners.delete(id);
  }

  // 通知所有监听器
  private notifyListeners(event: SpecialBlockEvent): void {
    this.eventListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in special block event listener:', error);
      }
    });
  }

  // 获取特殊方块统计信息
  getStats(): {
    totalBombs: number;
    totalLocks: number;
    activeLocks: number;
    totalScore: number;
  } {
    // 这里应该从游戏统计中获取数据
    // 暂时返回模拟数据
    return {
      totalBombs: 0,
      totalLocks: 0,
      activeLocks: this.lockedPositions.size,
      totalScore: 0,
    };
  }

  // 重置系统
  reset(): void {
    this.clearAllLocks();
    this.eventListeners.clear();
  }

  // 销毁系统
  destroy(): void {
    this.reset();
    this.gameBoard = null;
  }
}

// 单例实例
let specialBlockSystemInstance: SpecialBlockSystem | null = null;

// 获取特殊方块系统实例
export const getSpecialBlockSystem = (): SpecialBlockSystem => {
  if (!specialBlockSystemInstance) {
    specialBlockSystemInstance = new SpecialBlockSystem();
  }
  return specialBlockSystemInstance;
};

// 重置特殊方块系统实例
export const resetSpecialBlockSystem = (): void => {
  if (specialBlockSystemInstance) {
    specialBlockSystemInstance.destroy();
    specialBlockSystemInstance = null;
  }
};

export default SpecialBlockSystem;
