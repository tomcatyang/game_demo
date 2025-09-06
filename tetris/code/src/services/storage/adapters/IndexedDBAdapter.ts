import { StorageType } from '@/types';
import { IStorageAdapter, StorageException } from '../interfaces/StorageInterface';

// IndexedDB适配器
export class IndexedDBAdapter implements IStorageAdapter {
  public readonly type = StorageType.INDEXED_DB;
  private readonly dbName: string;
  private readonly dbVersion: number;
  private readonly storeName: string;
  private db: IDBDatabase | null = null;

  constructor(config: { 
    dbName?: string; 
    version?: number; 
    storeName?: string 
  } = {}) {
    this.dbName = config.dbName || 'TetrisGameDB';
    this.dbVersion = config.version || 1;
    this.storeName = config.storeName || 'gameData';

    if (!this.isAvailable()) {
      throw StorageException.notAvailable(this.type);
    }
  }

  // 检查是否可用
  isAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  // 初始化数据库连接
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(StorageException.unknownError(
          new Error(request.error?.message || 'Failed to open database'),
          this.type
        ));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };

      request.onblocked = () => {
        reject(StorageException.permissionDenied(this.type));
      };
    });
  }

  // 获取事务
  private async getTransaction(mode: IDBTransactionMode = 'readonly'): Promise<IDBTransaction> {
    const db = await this.initDB();
    return db.transaction([this.storeName], mode);
  }

  // 获取对象存储
  private async getObjectStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const transaction = await this.getTransaction(mode);
    return transaction.objectStore(this.storeName);
  }

  // 执行请求
  private executeRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(
        StorageException.unknownError(
          new Error(request.error?.message || 'IndexedDB request failed'),
          this.type
        )
      );
    });
  }

  // 获取数据
  async get(key: string): Promise<unknown> {
    try {
      const store = await this.getObjectStore('readonly');
      const request = store.get(key);
      const result = await this.executeRequest(request);
      
      return result ? result.value : undefined;
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
      const store = await this.getObjectStore('readwrite');
      const data = {
        key,
        value,
        timestamp: Date.now(),
        type: typeof value,
        size: JSON.stringify(value).length
      };
      
      const request = store.put(data);
      await this.executeRequest(request);
    } catch (error) {
      if (error instanceof StorageException) {
        throw error;
      }
      
      // 处理配额超出错误
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw StorageException.quotaExceeded(this.type);
      }
      
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 删除数据
  async remove(key: string): Promise<void> {
    try {
      const store = await this.getObjectStore('readwrite');
      const request = store.delete(key);
      await this.executeRequest(request);
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 清空数据
  async clear(): Promise<void> {
    try {
      const store = await this.getObjectStore('readwrite');
      const request = store.clear();
      await this.executeRequest(request);
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 检查键是否存在
  async has(key: string): Promise<boolean> {
    try {
      const store = await this.getObjectStore('readonly');
      const request = store.count(key);
      const count = await this.executeRequest(request);
      return count > 0;
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取所有键
  async keys(): Promise<string[]> {
    try {
      const store = await this.getObjectStore('readonly');
      const request = store.getAllKeys();
      const keys = await this.executeRequest(request);
      return keys as string[];
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取存储大小
  async size(): Promise<number> {
    try {
      const store = await this.getObjectStore('readonly');
      const request = store.getAll();
      const results = await this.executeRequest(request);
      
      return results.reduce((total, item) => {
        return total + (item.size || JSON.stringify(item.value).length);
      }, 0);
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 获取容量信息
  async getCapacity(): Promise<{ used: number; available: number; total: number }> {
    try {
      // IndexedDB 没有固定的容量限制，这里返回估算值
      const used = await this.size();
      
      // 尝试使用 Storage API 获取配额信息
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const total = estimate.quota || 1024 * 1024 * 1024; // 默认1GB
        const globalUsed = estimate.usage || 0;
        const available = total - globalUsed;
        
        return { used, available, total };
      }
      
      // 回退到默认值
      const total = 1024 * 1024 * 1024; // 1GB
      return { used, available: total - used, total };
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
      const transaction = await this.getTransaction('readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const promises = operations.map(operation => {
        if (operation.type === 'set' && operation.value !== undefined) {
          const data = {
            key: operation.key,
            value: operation.value,
            timestamp: Date.now(),
            type: typeof operation.value,
            size: JSON.stringify(operation.value).length
          };
          return this.executeRequest(store.put(data));
        } else if (operation.type === 'remove') {
          return this.executeRequest(store.delete(operation.key));
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
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
      const store = await this.getObjectStore('readonly');
      const request = store.getAll();
      const results = await this.executeRequest(request);
      
      const exported: Record<string, unknown> = {};
      results.forEach((item) => {
        exported[item.key] = item.value;
      });
      
      return exported;
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 导入数据
  async import(data: Record<string, unknown>): Promise<void> {
    try {
      const operations = Object.entries(data).map(([key, value]) => ({
        type: 'set' as const,
        key,
        value
      }));
      
      await this.batch(operations);
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
      const store = await this.getObjectStore('readwrite');
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
      
      // 使用索引查询所有记录
      const request = store.getAll();
      const results = await this.executeRequest(request);
      
      const keysToDelete: string[] = [];
      
      results.forEach((item) => {
        if (item.timestamp && (now - item.timestamp) > maxAge) {
          keysToDelete.push(item.key);
        }
      });
      
      // 批量删除过期数据
      for (const key of keysToDelete) {
        await this.executeRequest(store.delete(key));
      }
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 按条件查询
  async query(condition: {
    indexName?: string;
    value?: IDBValidKey;
    range?: IDBKeyRange;
    limit?: number;
  }): Promise<Array<{ key: string; value: unknown; timestamp: number }>> {
    try {
      const store = await this.getObjectStore('readonly');
      let request: IDBRequest<unknown[]>;
      
      if (condition.indexName) {
        const index = store.index(condition.indexName);
        if (condition.range) {
          request = index.getAll(condition.range, condition.limit);
        } else if (condition.value !== undefined) {
          request = index.getAll(condition.value, condition.limit);
        } else {
          request = index.getAll(undefined, condition.limit);
        }
      } else {
        request = store.getAll(undefined, condition.limit);
      }
      
      const results = await this.executeRequest(request);
      return results.map((item: any) => ({
        key: item.key,
        value: item.value,
        timestamp: item.timestamp
      }));
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }

  // 关闭数据库连接
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // 删除数据库
  async deleteDatabase(): Promise<void> {
    try {
      await this.close();
      
      return new Promise((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(this.dbName);
        
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(
          StorageException.unknownError(
            new Error('Failed to delete database'),
            this.type
          )
        );
        deleteRequest.onblocked = () => reject(
          StorageException.permissionDenied(this.type)
        );
      });
    } catch (error) {
      throw StorageException.unknownError(error as Error, this.type);
    }
  }
}
