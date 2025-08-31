import { StorageType } from '@/types';
import { IStorageAdapter, StorageException } from '../interfaces/StorageInterface';

// LocalStorage适配器
export class LocalStorageAdapter implements IStorageAdapter {
  public readonly type = StorageType.LOCAL_STORAGE;
  private readonly prefix: string;
  private readonly maxSize: number;

  constructor(config: { prefix?: string; maxSize?: number } = {}) {
    this.prefix = config.prefix || 'tetris_';
    this.maxSize = config.maxSize || 5 * 1024 * 1024; // 5MB

    if (!this.isAvailable()) {
      throw StorageException.notAvailable(this.type);
    }
  }

  // 检查是否可用
  isAvailable(): boolean {
    try {
      if (typeof localStorage === 'undefined') {
        return false;
      }

      const testKey = '__tetris_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // 生成完整键名
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  // 解析键名
  private parseKey(fullKey: string): string {
    return fullKey.startsWith(this.prefix) 
      ? fullKey.slice(this.prefix.length) 
      : fullKey;
  }

  // 序列化数据
  private serialize(value: unknown): string {
    try {
      return JSON.stringify({
        value,
        timestamp: Date.now(),
        type: typeof value
      });
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 反序列化数据
  private deserialize(data: string): unknown {
    try {
      const parsed = JSON.parse(data);
      return parsed.value;
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取数据
  async get(key: string): Promise<unknown> {
    try {
      const fullKey = this.getFullKey(key);
      const data = localStorage.getItem(fullKey);
      
      if (data === null) {
        return undefined;
      }

      return this.deserialize(data);
    } catch (error) {
      if (error instanceof StorageException) {
        throw error;
      }
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 设置数据
  async set(key: string, value: unknown): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const serializedData = this.serialize(value);

      // 检查存储空间
      const currentSize = await this.size();
      const newDataSize = new Blob([serializedData]).size;
      
      if (currentSize + newDataSize > this.maxSize) {
        throw StorageException.quotaExceeded(this.type);
      }

      localStorage.setItem(fullKey, serializedData);
    } catch (error) {
      if (error instanceof StorageException) {
        throw error;
      }
      
      // 处理QuotaExceededError
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw StorageException.quotaExceeded(this.type);
      }
      
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 删除数据
  async remove(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 清空数据
  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      for (const key of keys) {
        await this.remove(key);
      }
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 检查键是否存在
  async has(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取所有键
  async keys(): Promise<string[]> {
    try {
      const allKeys: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          allKeys.push(this.parseKey(key));
        }
      }
      
      return allKeys;
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取存储大小
  async size(): Promise<number> {
    try {
      let totalSize = 0;
      const keys = await this.keys();
      
      for (const key of keys) {
        const fullKey = this.getFullKey(key);
        const data = localStorage.getItem(fullKey);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      }
      
      return totalSize;
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
  }>): Promise<void> {
    try {
      for (const operation of operations) {
        if (operation.type === 'set' && operation.value !== undefined) {
          await this.set(operation.key, operation.value);
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
      const result: Record<string, unknown> = {};
      const keys = await this.keys();
      
      for (const key of keys) {
        const value = await this.get(key);
        result[key] = value;
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
      // LocalStorage 不自动过期，这里可以实现自定义的清理逻辑
      // 例如：清理超过一定时间的数据、清理异常数据等
      const keys = await this.keys();
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天

      for (const key of keys) {
        try {
          const fullKey = this.getFullKey(key);
          const data = localStorage.getItem(fullKey);
          
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
              await this.remove(key);
            }
          }
        } catch {
          // 如果数据解析失败，删除异常数据
          await this.remove(key);
        }
      }
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
  }> {
    try {
      const keys = await this.keys();
      let totalSize = 0;
      let oldestTimestamp = Date.now();
      let newestTimestamp = 0;

      for (const key of keys) {
        const fullKey = this.getFullKey(key);
        const data = localStorage.getItem(fullKey);
        
        if (data) {
          totalSize += new Blob([data]).size;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.timestamp) {
              oldestTimestamp = Math.min(oldestTimestamp, parsed.timestamp);
              newestTimestamp = Math.max(newestTimestamp, parsed.timestamp);
            }
          } catch {
            // 忽略解析错误
          }
        }
      }

      return {
        itemCount: keys.length,
        totalSize,
        averageItemSize: keys.length > 0 ? totalSize / keys.length : 0,
        oldestItem: oldestTimestamp,
        newestItem: newestTimestamp,
      };
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }
}
