import { StorageType } from '@/types';
import { IStorageAdapter, StorageException } from '../interfaces/StorageInterface';

// 内存存储项接口
interface MemoryStorageItem {
  value: unknown;
  timestamp: number;
  type: string;
  size: number;
  ttl?: number; // 生存时间（毫秒）
}

// 内存存储适配器
export class MemoryStorageAdapter implements IStorageAdapter {
  public readonly type = StorageType.MEMORY;
  private readonly data = new Map<string, MemoryStorageItem>();
  private readonly maxSize: number;
  private readonly defaultTTL?: number;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: { 
    maxSize?: number; 
    defaultTTL?: number; 
    cleanupInterval?: number 
  } = {}) {
    this.maxSize = config.maxSize || 10 * 1024 * 1024; // 10MB
    this.defaultTTL = config.defaultTTL;
    
    // 定期清理过期数据
    if (config.cleanupInterval) {
      this.cleanupTimer = setInterval(() => {
        this.cleanupExpired();
      }, config.cleanupInterval);
    }
  }

  // 检查是否可用
  isAvailable(): boolean {
    return true; // 内存存储总是可用的
  }

  // 计算数据大小
  private calculateSize(value: unknown): number {
    try {
      return JSON.stringify(value).length * 2; // Unicode字符占2字节
    } catch {
      return 0;
    }
  }

  // 检查并清理过期数据
  private cleanupExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.data) {
      if (item.ttl && (now - item.timestamp) > item.ttl) {
        this.data.delete(key);
      }
    }
  }

  // 检查存储空间
  private checkQuota(newDataSize: number): void {
    const currentSize = this.getCurrentSize();
    if (currentSize + newDataSize > this.maxSize) {
      throw StorageException.quotaExceeded(this.type);
    }
  }

  // 获取当前存储大小
  private getCurrentSize(): number {
    let totalSize = 0;
    for (const item of this.data.values()) {
      totalSize += item.size;
    }
    return totalSize;
  }

  // 获取数据
  async get(key: string): Promise<unknown> {
    try {
      const item = this.data.get(key);
      
      if (!item) {
        return undefined;
      }

      // 检查是否过期
      const now = Date.now();
      if (item.ttl && (now - item.timestamp) > item.ttl) {
        this.data.delete(key);
        return undefined;
      }

      return item.value;
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 设置数据
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const size = this.calculateSize(value);
      const effectiveTTL = ttl || this.defaultTTL;
      
      // 如果键已存在，先减去旧数据的大小
      const existingItem = this.data.get(key);
      const existingSize = existingItem ? existingItem.size : 0;
      
      this.checkQuota(size - existingSize);

      const item: MemoryStorageItem = {
        value,
        timestamp: Date.now(),
        type: typeof value,
        size,
        ttl: effectiveTTL
      };

      this.data.set(key, item);
    } catch (error) {
      if (error instanceof StorageException) {
        throw error;
      }
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 删除数据
  async remove(key: string): Promise<void> {
    try {
      this.data.delete(key);
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 清空数据
  async clear(): Promise<void> {
    try {
      this.data.clear();
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 检查键是否存在
  async has(key: string): Promise<boolean> {
    try {
      const item = this.data.get(key);
      
      if (!item) {
        return false;
      }

      // 检查是否过期
      const now = Date.now();
      if (item.ttl && (now - item.timestamp) > item.ttl) {
        this.data.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取所有键
  async keys(): Promise<string[]> {
    try {
      this.cleanupExpired();
      return Array.from(this.data.keys());
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取存储大小
  async size(): Promise<number> {
    try {
      this.cleanupExpired();
      return this.getCurrentSize();
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取容量信息
  async getCapacity(): Promise<{ used: number; available: number; total: number }> {
    try {
      const used = await this.size();
      const total = this.maxSize;
      const available = total - used;
      
      return { used, available, total };
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 批量操作
  async batch(operations: Array<{
    type: 'set' | 'remove';
    key: string;
    value?: unknown;
    ttl?: number;
  }>): Promise<void> {
    try {
      // 预计算所需空间
      let totalSizeChange = 0;
      
      for (const operation of operations) {
        if (operation.type === 'set' && operation.value !== undefined) {
          const newSize = this.calculateSize(operation.value);
          const existingItem = this.data.get(operation.key);
          const existingSize = existingItem ? existingItem.size : 0;
          totalSizeChange += newSize - existingSize;
        } else if (operation.type === 'remove') {
          const existingItem = this.data.get(operation.key);
          if (existingItem) {
            totalSizeChange -= existingItem.size;
          }
        }
      }
      
      // 检查配额
      if (totalSizeChange > 0) {
        this.checkQuota(totalSizeChange);
      }
      
      // 执行操作
      for (const operation of operations) {
        if (operation.type === 'set' && operation.value !== undefined) {
          await this.set(operation.key, operation.value, operation.ttl);
        } else if (operation.type === 'remove') {
          await this.remove(operation.key);
        }
      }
    } catch (error) {
      if (error instanceof StorageException) {
        throw error;
      }
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 导出数据
  async export(): Promise<Record<string, unknown>> {
    try {
      this.cleanupExpired();
      const result: Record<string, unknown> = {};
      
      for (const [key, item] of this.data) {
        result[key] = item.value;
      }
      
      return result;
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 导入数据
  async import(data: Record<string, unknown>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(data)) {
        await this.set(key, value);
      }
    } catch (error) {
      if (error instanceof StorageException) {
        throw error;
      }
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 清理过期数据
  async cleanup(): Promise<void> {
    try {
      this.cleanupExpired();
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取所有值
  async values(): Promise<unknown[]> {
    try {
      this.cleanupExpired();
      return Array.from(this.data.values()).map(item => item.value);
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取所有条目
  async entries(): Promise<Array<[string, unknown]>> {
    try {
      this.cleanupExpired();
      const result: Array<[string, unknown]> = [];
      
      for (const [key, item] of this.data) {
        result.push([key, item.value]);
      }
      
      return result;
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取统计信息
  async getStats(): Promise<{
    itemCount: number;
    totalSize: number;
    averageItemSize: number;
    oldestItem: number;
    newestItem: number;
    expiredItemCount: number;
  }> {
    try {
      let totalSize = 0;
      let oldestTimestamp = Date.now();
      let newestTimestamp = 0;
      let expiredCount = 0;
      const now = Date.now();

      for (const item of this.data.values()) {
        totalSize += item.size;
        oldestTimestamp = Math.min(oldestTimestamp, item.timestamp);
        newestTimestamp = Math.max(newestTimestamp, item.timestamp);
        
        if (item.ttl && (now - item.timestamp) > item.ttl) {
          expiredCount++;
        }
      }

      return {
        itemCount: this.data.size,
        totalSize,
        averageItemSize: this.data.size > 0 ? totalSize / this.data.size : 0,
        oldestItem: oldestTimestamp,
        newestItem: newestTimestamp,
        expiredItemCount: expiredCount,
      };
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 设置TTL
  async setTTL(key: string, ttl: number): Promise<void> {
    try {
      const item = this.data.get(key);
      if (item) {
        item.ttl = ttl;
        item.timestamp = Date.now(); // 重置时间戳
      }
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取TTL
  async getTTL(key: string): Promise<number | undefined> {
    try {
      const item = this.data.get(key);
      if (item && item.ttl) {
        const elapsed = Date.now() - item.timestamp;
        return Math.max(0, item.ttl - elapsed);
      }
      return undefined;
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 销毁适配器
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.data.clear();
  }
}
