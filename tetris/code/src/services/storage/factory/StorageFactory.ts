import { StorageType } from '@/types';
import { 
  IStorageFactory, 
  IStorageAdapter, 
  IStorageConfig,
  StorageException 
} from '../interfaces/StorageInterface';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import { IndexedDBAdapter } from '../adapters/IndexedDBAdapter';
import { MemoryStorageAdapter } from '../adapters/MemoryStorageAdapter';

// 存储适配器构造函数类型
type StorageAdapterConstructor = new (config?: Record<string, unknown>) => IStorageAdapter;

// 默认存储配置
const DEFAULT_CONFIG: IStorageConfig = {
  defaultType: StorageType.LOCAL_STORAGE,
  fallbackTypes: [StorageType.INDEXED_DB, StorageType.MEMORY],
  compression: false,
  encryption: false,
  maxSize: 10 * 1024 * 1024, // 10MB
  prefix: 'tetris_',
  version: 1,
};

// 存储工厂类
export class StorageFactory implements IStorageFactory {
  private readonly adapters = new Map<StorageType, StorageAdapterConstructor>();
  private readonly instances = new Map<string, IStorageAdapter>();
  private config: IStorageConfig;

  constructor(config?: Partial<IStorageConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.registerDefaultAdapters();
  }

  // 注册默认适配器
  private registerDefaultAdapters(): void {
    this.adapters.set(StorageType.LOCAL_STORAGE, LocalStorageAdapter);
    this.adapters.set(StorageType.INDEXED_DB, IndexedDBAdapter);
    this.adapters.set(StorageType.MEMORY, MemoryStorageAdapter);
  }

  // 注册存储适配器
  registerAdapter(type: StorageType, adapter: StorageAdapterConstructor): void {
    this.adapters.set(type, adapter);
  }

  // 生成实例键
  private getInstanceKey(type: StorageType, config?: Record<string, unknown>): string {
    const configHash = config ? JSON.stringify(config) : '';
    return `${type}_${configHash}`;
  }

  // 创建存储实例
  async create(
    type: StorageType, 
    config?: Record<string, unknown>
  ): Promise<IStorageAdapter> {
    const instanceKey = this.getInstanceKey(type, config);
    
    // 返回已存在的实例
    if (this.instances.has(instanceKey)) {
      return this.instances.get(instanceKey)!;
    }

    const AdapterClass = this.adapters.get(type);
    if (!AdapterClass) {
      throw StorageException.notAvailable(type);
    }

    try {
      // 合并配置
      const adapterConfig = {
        ...this.getAdapterConfig(type),
        ...config,
      };

      const adapter = new AdapterClass(adapterConfig);
      
      // 检查适配器是否可用
      if (!adapter.isAvailable()) {
        throw StorageException.notAvailable(type);
      }

      // 缓存实例
      this.instances.set(instanceKey, adapter);
      
      return adapter;
    } catch (error) {
      if (error instanceof StorageException) {
        throw error;
      }
      throw StorageException.unknownError(error as Error, type);
    }
  }

  // 获取适配器专用配置
  private getAdapterConfig(type: StorageType): Record<string, unknown> {
    const baseConfig = {
      prefix: this.config.prefix,
      maxSize: this.config.maxSize,
      version: this.config.version,
    };

    switch (type) {
      case StorageType.LOCAL_STORAGE:
        return {
          ...baseConfig,
          prefix: this.config.prefix,
        };

      case StorageType.INDEXED_DB:
        return {
          ...baseConfig,
          dbName: `${this.config.prefix}GameDB`,
          storeName: 'gameData',
        };

      case StorageType.MEMORY:
        return {
          ...baseConfig,
          defaultTTL: this.config.ttl,
          cleanupInterval: 60000, // 1分钟清理一次
        };

      default:
        return baseConfig;
    }
  }

  // 获取默认存储
  async getDefault(): Promise<IStorageAdapter> {
    const types = [this.config.defaultType, ...this.config.fallbackTypes];
    
    for (const type of types) {
      try {
        const adapter = await this.create(type);
        return adapter;
      } catch (error) {
        // 如果当前类型不可用，尝试下一个
        console.warn(`Storage type ${type} is not available:`, error);
        continue;
      }
    }

    // 所有存储类型都不可用
    throw StorageException.notAvailable(this.config.defaultType);
  }

  // 获取可用的存储类型
  getAvailableTypes(): StorageType[] {
    const availableTypes: StorageType[] = [];
    
    for (const type of this.adapters.keys()) {
      try {
        const AdapterClass = this.adapters.get(type)!;
        const tempAdapter = new AdapterClass();
        
        if (tempAdapter.isAvailable()) {
          availableTypes.push(type);
        }
      } catch {
        // 忽略不可用的适配器
      }
    }
    
    return availableTypes;
  }

  // 检查存储类型是否支持
  isSupported(type: StorageType): boolean {
    return this.adapters.has(type);
  }

  // 创建带自动切换的存储
  async createWithFallback(
    preferredTypes: StorageType[] = [this.config.defaultType],
    config?: Record<string, unknown>
  ): Promise<IStorageAdapter> {
    const types = [...preferredTypes, ...this.config.fallbackTypes];
    const uniqueTypes = Array.from(new Set(types));
    
    for (const type of uniqueTypes) {
      try {
        return await this.create(type, config);
      } catch (error) {
        console.warn(`Failed to create ${type} storage:`, error);
        continue;
      }
    }
    
    throw new Error('No available storage adapters');
  }

  // 获取存储能力信息
  async getCapabilities(): Promise<Record<StorageType, {
    available: boolean;
    maxSize?: number;
    features: string[];
    performance: 'high' | 'medium' | 'low';
  }>> {
    const capabilities = {} as Record<StorageType, {
      available: boolean;
      maxSize?: number;
      features: string[];
      performance: 'high' | 'medium' | 'low';
    }>;
    
    for (const type of Object.values(StorageType)) {
      try {
        const adapter = await this.create(type);
        const capacity = await adapter.getCapacity();
        
        capabilities[type] = {
          available: true,
          maxSize: capacity.total,
          features: this.getStorageFeatures(type),
          performance: this.getStoragePerformance(type),
        };
      } catch {
        capabilities[type] = {
          available: false,
          features: [],
          performance: 'low' as const,
        };
      }
    }
    
    return capabilities;
  }

  // 获取存储特性
  private getStorageFeatures(type: StorageType): string[] {
    const features: Record<StorageType, string[]> = {
      [StorageType.LOCAL_STORAGE]: ['persistent', 'synchronous', 'limited_size'],
      [StorageType.INDEXED_DB]: ['persistent', 'asynchronous', 'large_size', 'transactions', 'indexes'],
      [StorageType.MEMORY]: ['fast', 'temporary', 'ttl_support'],
      [StorageType.CACHE]: ['fast', 'temporary', 'size_limited'],
    };
    
    return features[type] || [];
  }

  // 获取存储性能等级
  private getStoragePerformance(type: StorageType): 'high' | 'medium' | 'low' {
    const performance: Record<StorageType, 'high' | 'medium' | 'low'> = {
      [StorageType.MEMORY]: 'high',
      [StorageType.LOCAL_STORAGE]: 'medium',
      [StorageType.INDEXED_DB]: 'medium',
      [StorageType.CACHE]: 'high',
    };
    
    return performance[type] || 'low';
  }

  // 清理所有实例
  async cleanup(): Promise<void> {
    for (const adapter of this.instances.values()) {
      try {
        await adapter.cleanup();
      } catch (error) {
        console.warn('Failed to cleanup storage adapter:', error);
      }
    }
  }

  // 销毁工厂
  async destroy(): Promise<void> {
    await this.cleanup();
    
    // 销毁内存存储适配器
    for (const adapter of this.instances.values()) {
      if (adapter.type === StorageType.MEMORY && 'destroy' in adapter) {
        (adapter as { destroy(): void }).destroy();
      }
    }
    
    this.instances.clear();
  }

  // 获取实例统计
  getInstanceStats(): {
    totalInstances: number;
    instancesByType: Record<StorageType, number>;
    memoryUsage: number;
  } {
    const stats = {
      totalInstances: this.instances.size,
      instancesByType: {} as Record<StorageType, number>,
      memoryUsage: 0,
    };

    // 统计各类型实例数量
    for (const type of Object.values(StorageType)) {
      stats.instancesByType[type] = 0;
    }

    for (const adapter of this.instances.values()) {
      stats.instancesByType[adapter.type] = (stats.instancesByType[adapter.type] || 0) + 1;
    }

    return stats;
  }

  // 更新配置
  updateConfig(newConfig: Partial<IStorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 获取配置
  getConfig(): IStorageConfig {
    return { ...this.config };
  }
}

// 导出默认工厂实例
export const storageFactory = new StorageFactory();
