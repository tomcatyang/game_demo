// 存储系统统一导出

// 接口层
export type {
  IStorage,
  IStorageAdapter,
  IStorageFactory,
  IStorageConfig,
  IStorageEvent,
  IStorageListener,
  IStorageManager,
} from './interfaces/StorageInterface';

export { StorageException } from './interfaces/StorageInterface';

// 适配器层
export { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
export { IndexedDBAdapter } from './adapters/IndexedDBAdapter';
export { MemoryStorageAdapter } from './adapters/MemoryStorageAdapter';

// 工厂层
export { StorageFactory, storageFactory } from './factory/StorageFactory';

// 使用示例导出
export const StorageExamples = {
  // 基本使用
  async basicUsage() {
    const storage = await storageFactory.getDefault();
    await storage.set('key', 'value');
    const value = await storage.get('key');
    return value;
  },

  // 指定存储类型
  async useSpecificStorage() {
    const { StorageType } = await import('@/types');
    const storage = await storageFactory.create(StorageType.INDEXED_DB);
    return storage;
  },

  // 批量操作
  async batchOperations() {
    const storage = await storageFactory.getDefault();
    await storage.batch([
      { type: 'set', key: 'key1', value: 'value1' },
      { type: 'set', key: 'key2', value: 'value2' },
      { type: 'remove', key: 'oldKey' }
    ]);
  },

  // 导出导入数据
  async exportImportData() {
    const storage = await storageFactory.getDefault();
    const data = await storage.export();
    await storage.clear();
    await storage.import(data);
  },

  // 检查存储能力
  async checkCapabilities() {
    const capabilities = await storageFactory.getCapabilities();
    return capabilities;
  }
};

// 存储系统配置
export const StorageConfig = {
  // 默认配置
  default: {
    defaultType: 'LOCAL_STORAGE' as const,
    fallbackTypes: ['INDEXED_DB', 'MEMORY'] as const,
    compression: false,
    encryption: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    prefix: 'tetris_',
    version: 1,
  },

  // 高性能配置（优先内存存储）
  highPerformance: {
    defaultType: 'MEMORY' as const,
    fallbackTypes: ['LOCAL_STORAGE', 'INDEXED_DB'] as const,
    compression: false,
    encryption: false,
    maxSize: 50 * 1024 * 1024, // 50MB
    prefix: 'tetris_hp_',
    version: 1,
  },

  // 持久化配置（优先IndexedDB）
  persistent: {
    defaultType: 'INDEXED_DB' as const,
    fallbackTypes: ['LOCAL_STORAGE', 'MEMORY'] as const,
    compression: true,
    encryption: false,
    maxSize: 100 * 1024 * 1024, // 100MB
    prefix: 'tetris_persist_',
    version: 1,
  },

  // 移动端配置
  mobile: {
    defaultType: 'LOCAL_STORAGE' as const,
    fallbackTypes: ['MEMORY'] as const,
    compression: true,
    encryption: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    prefix: 'tetris_mobile_',
    version: 1,
  }
};

// 存储系统工具函数
export const StorageUtils = {
  // 格式化存储大小
  formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  },

  // 检查存储可用性
  async checkAvailability(): Promise<Record<string, boolean>> {
    const { StorageType } = await import('@/types');
    const availability: Record<string, boolean> = {};
    
    for (const type of Object.values(StorageType)) {
      try {
        const storage = await storageFactory.create(type);
        availability[type] = storage.isAvailable();
      } catch {
        availability[type] = false;
      }
    }
    
    return availability;
  },

  // 估算存储使用量
  async estimateUsage(): Promise<{
    total: number;
    used: number;
    available: number;
    percentage: number;
  }> {
    try {
      const storage = await storageFactory.getDefault();
      const capacity = await storage.getCapacity();
      
      return {
        total: capacity.total,
        used: capacity.used,
        available: capacity.available,
        percentage: (capacity.used / capacity.total) * 100
      };
    } catch (error) {
      console.error('Failed to estimate storage usage:', error);
      return { total: 0, used: 0, available: 0, percentage: 0 };
    }
  },

  // 清理过期数据
  async cleanup(): Promise<void> {
    try {
      const storage = await storageFactory.getDefault();
      await storage.cleanup();
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
    }
  },

  // 验证数据完整性
  validateData(data: unknown): boolean {
    try {
      if (data === null || data === undefined) {
        return true; // 空数据是有效的
      }
      
      // 检查是否可序列化
      JSON.stringify(data);
      return true;
    } catch {
      return false;
    }
  },

  // 生成存储键
  generateKey(namespace: string, identifier: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${namespace}_${identifier}_${timestamp}_${random}`;
  },

  // 解析存储键
  parseKey(key: string): {
    namespace?: string;
    identifier?: string;
    timestamp?: number;
    random?: string;
  } {
    const parts = key.split('_');
    if (parts.length >= 4) {
      return {
        namespace: parts[0],
        identifier: parts[1],
        timestamp: parseInt(parts[2]),
        random: parts[3]
      };
    }
    return {};
  }
};

// 存储系统监控
export const StorageMonitor = {
  // 监控存储使用情况
  async monitor(interval = 60000): Promise<() => void> {
    const check = async () => {
      try {
        const usage = await StorageUtils.estimateUsage();
        const availability = await StorageUtils.checkAvailability();
        
        console.log('Storage Monitor:', {
          usage: StorageUtils.formatSize(usage.used),
          percentage: `${usage.percentage.toFixed(1)}%`,
          availability
        });
        
        // 警告存储空间不足
        if (usage.percentage > 90) {
          console.warn('Storage space is running low:', usage);
        }
      } catch (error) {
        console.error('Storage monitoring failed:', error);
      }
    };
    
    // 立即执行一次
    await check();
    
    // 定期监控
    const intervalId = setInterval(check, interval);
    
    // 返回清理函数
    return () => clearInterval(intervalId);
  },

  // 获取存储统计
  async getStats(): Promise<{
    adapters: Record<string, boolean>;
    usage: { used: number; total: number; percentage: number };
    performance: Record<string, number>;
  }> {
    const [availability, usage] = await Promise.all([
      StorageUtils.checkAvailability(),
      StorageUtils.estimateUsage()
    ]);
    
    // 性能测试
    const performance: Record<string, number> = {};
    const testData = { test: 'performance', timestamp: Date.now() };
    
    try {
      const storage = await storageFactory.getDefault();
      
      // 写入性能
      const writeStart = Date.now();
      await storage.set('perf_test', testData);
      performance.write = Date.now() - writeStart;
      
      // 读取性能
      const readStart = Date.now();
      await storage.get('perf_test');
      performance.read = Date.now() - readStart;
      
      // 删除性能
      const deleteStart = Date.now();
      await storage.remove('perf_test');
      performance.delete = Date.now() - deleteStart;
    } catch (error) {
      console.error('Performance test failed:', error);
    }
    
    return {
      adapters: availability,
      usage: {
        used: usage.used,
        total: usage.total,
        percentage: usage.percentage
      },
      performance
    };
  }
};
