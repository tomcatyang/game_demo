import { GameState, GameInput, GameEvent } from '@/types';
import { GameStateManager } from '@/store/gameState';

// 游戏引擎配置
interface GameEngineConfig {
  targetFPS: number;
  maxDeltaTime: number;
}

// 默认配置
const defaultConfig: GameEngineConfig = {
  targetFPS: 60,
  maxDeltaTime: 1000 / 30, // 最大delta时间，防止大的跳跃
};

// 游戏引擎类
export class GameEngine {
  private gameState: GameStateManager;
  private config: GameEngineConfig;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private lastGameUpdateTime: number = 0;
  private inputQueue: GameInput[] = [];
  private eventListeners: Map<string, Set<(event: GameEvent) => void>> = new Map();

  constructor(gameState: GameStateManager, config?: Partial<GameEngineConfig>) {
    this.gameState = gameState;
    this.config = { ...defaultConfig, ...config };
    
    // 监听游戏状态变化
    this.gameState.addListener(this.onGameStateChange.bind(this));
  }

  // 启动游戏引擎
  start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.lastGameUpdateTime = this.lastFrameTime;
      this.gameLoop();
      this.emitEvent('engine:started', {});
    }
  }

  // 暂停游戏引擎
  pause(): void {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.gameState.pauseGame();
      this.emitEvent('engine:paused', {});
    }
  }

  // 恢复游戏引擎
  resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.gameState.resumeGame();
      this.gameLoop();
      this.emitEvent('engine:resumed', {});
    }
  }

  // 停止游戏引擎
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.inputQueue = [];
    this.emitEvent('engine:stopped', {});
  }

  // 处理输入
  handleInput(input: GameInput): void {
    // 将输入添加到队列中，在下一帧处理
    this.inputQueue.push({
      ...input,
      timestamp: performance.now(),
    } as GameInput & { timestamp: number });
  }

  // 游戏主循环
  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastFrameTime, this.config.maxDeltaTime);
    
    // 处理输入
    this.processInputs();
    
    // 更新游戏逻辑
    this.update(deltaTime);
    
    this.lastFrameTime = currentTime;
    
    // 请求下一帧
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  // 处理输入队列
  private processInputs(): void {
    while (this.inputQueue.length > 0) {
      const input = this.inputQueue.shift();
      if (input) {
        this.processInput(input);
      }
    }
  }

  // 处理单个输入
  private processInput(input: GameInput): void {
    const currentState = this.gameState.getState();
    
    switch (input.type) {
      case 'pause':
        if (currentState === GameState.PLAYING) {
          this.pause();
        } else if (currentState === GameState.PAUSED) {
          this.resume();
        }
        break;
        
      case 'restart':
        this.restart();
        break;
        
      default:
        // 其他输入事件，传递给具体的游戏逻辑处理
        this.emitEvent('input:processed', { input });
        break;
    }
  }

  // 更新游戏逻辑
  private update(deltaTime: number): void {
    const currentState = this.gameState.getState();
    
    // 只在游戏进行中更新游戏逻辑
    if (currentState === GameState.PLAYING) {
      const currentTime = performance.now();
      const gameSpeed = this.gameState.calculateSpeed();
      
      // 检查是否需要进行游戏逻辑更新
      if (currentTime - this.lastGameUpdateTime >= gameSpeed) {
        this.updateGameLogic(deltaTime);
        this.lastGameUpdateTime = currentTime;
      }
    }
    
    // 发出更新事件
    this.emitEvent('engine:update', { 
      deltaTime, 
      state: currentState,
      timestamp: performance.now(),
    });
  }

  // 更新具体的游戏逻辑
  private updateGameLogic(deltaTime: number): void {
    // 这里将在后续任务中实现具体的游戏逻辑
    // 例如：方块下落、碰撞检测、行消除等
    this.emitEvent('game:update', { deltaTime });
  }

  // 重启游戏
  private restart(): void {
    this.gameState.resetGame();
    this.gameState.startNewGame();
    this.emitEvent('game:restarted', {});
  }

  // 游戏状态变化处理
  private onGameStateChange(context: ReturnType<GameStateManager['getContext']>): void {
    this.emitEvent('state:changed', { context });
    
    // 根据状态自动调整引擎行为
    switch (context.state) {
      case GameState.GAME_OVER:
        // 游戏结束时停止引擎
        this.stop();
        break;
        
      case GameState.MENU:
        // 在菜单状态时暂停引擎
        if (this.isRunning) {
          this.pause();
        }
        break;
    }
  }

  // 添加事件监听器
  addEventListener(eventType: string, listener: (event: GameEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  // 移除事件监听器
  removeEventListener(eventType: string, listener: (event: GameEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // 发出事件
  private emitEvent(type: string, payload: Record<string, unknown>): void {
    const event: GameEvent = {
      type,
      payload,
      timestamp: performance.now(),
    };
    
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
    }
  }

  // 获取引擎状态
  getEngineState(): {
    isRunning: boolean;
    fps: number;
    gameState: GameState;
  } {
    return {
      isRunning: this.isRunning,
      fps: this.config.targetFPS,
      gameState: this.gameState.getState(),
    };
  }

  // 获取性能信息
  getPerformanceInfo(): {
    targetFPS: number;
    lastFrameTime: number;
    isRunning: boolean;
  } {
    return {
      targetFPS: this.config.targetFPS,
      lastFrameTime: this.lastFrameTime,
      isRunning: this.isRunning,
    };
  }
}
