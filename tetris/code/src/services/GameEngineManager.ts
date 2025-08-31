import { GameEngine } from './GameEngine';
import { GameStateManager } from '@/store/gameState';
import { GameConfig } from '@/types';

// 游戏引擎管理器
export class GameEngineManager {
  private static instance: GameEngineManager | null = null;
  private gameEngine: GameEngine | null = null;
  private gameStateManager: GameStateManager | null = null;

  private constructor() {}

  // 单例模式
  static getInstance(): GameEngineManager {
    if (!GameEngineManager.instance) {
      GameEngineManager.instance = new GameEngineManager();
    }
    return GameEngineManager.instance;
  }

  // 初始化游戏引擎
  initialize(config?: Partial<GameConfig>): GameEngine {
    if (this.gameEngine) {
      throw new Error('Game engine already initialized');
    }

    // 创建游戏状态管理器
    this.gameStateManager = new GameStateManager(config);
    
    // 创建游戏引擎
    this.gameEngine = new GameEngine(this.gameStateManager);
    
    // 设置事件监听
    this.setupEventListeners();
    
    return this.gameEngine;
  }

  // 获取游戏引擎实例
  getEngine(): GameEngine {
    if (!this.gameEngine) {
      throw new Error('Game engine not initialized. Call initialize() first.');
    }
    return this.gameEngine;
  }

  // 获取游戏状态管理器
  getStateManager(): GameStateManager {
    if (!this.gameStateManager) {
      throw new Error('Game engine not initialized. Call initialize() first.');
    }
    return this.gameStateManager;
  }

  // 销毁游戏引擎
  destroy(): void {
    if (this.gameEngine) {
      this.gameEngine.stop();
      this.gameEngine = null;
    }
    
    if (this.gameStateManager) {
      this.gameStateManager = null;
    }
  }

  // 重置管理器
  reset(): void {
    this.destroy();
    GameEngineManager.instance = null;
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    if (!this.gameEngine) return;

    // 监听引擎事件
    this.gameEngine.addEventListener('engine:started', () => {
      console.log('Game engine started');
    });

    this.gameEngine.addEventListener('engine:stopped', () => {
      console.log('Game engine stopped');
    });

    this.gameEngine.addEventListener('engine:paused', () => {
      console.log('Game engine paused');
    });

    this.gameEngine.addEventListener('engine:resumed', () => {
      console.log('Game engine resumed');
    });

    // 监听游戏事件
    this.gameEngine.addEventListener('game:restarted', () => {
      console.log('Game restarted');
    });

    // 监听状态变化
    this.gameEngine.addEventListener('state:changed', (event) => {
      const context = event.payload?.context;
      console.log('Game state changed:', context);
    });
  }

  // 快速启动方法
  quickStart(config?: Partial<GameConfig>): GameEngine {
    const engine = this.initialize(config);
    engine.start();
    this.getStateManager().startNewGame();
    return engine;
  }
}

// 导出单例实例
export const gameEngineManager = GameEngineManager.getInstance();
