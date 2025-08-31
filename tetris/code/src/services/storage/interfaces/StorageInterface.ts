import { StorageType, StorageError, StorageErrorType } from '@/types';

// 基础存储接口
export interface IStorage {
  /**
   * 获取数据
   * @param key 键名
   * @returns Promise<unknown> 值
   */
  get(key: string): Promise<unknown>;

  /**
   * 设置数据
   * @param key 键名
   * @param value 值
   */
  set(key: string, value: unknown): Promise<void>;

  /**
   * 删除数据
   * @param key 键名
   */
  remove(key: string): Promise<void>;

  /**
   * 清空所有数据
   */
  clear(): Promise<void>;

  /**
   * 检查键是否存在
   * @param key 键名
   */
  has(key: string): Promise<boolean>;

  /**
   * 获取所有键
   */
  keys(): Promise<string[]>;

  /**
   * 获取存储大小
   */
  size(): Promise<number>;
}

// 扩展存储接口
export interface IStorageAdapter extends IStorage {
  /**
   * 存储类型
   */
  readonly type: StorageType;

  /**
   * 检查存储是否可用
   */
  isAvailable(): boolean;

  /**
   * 获取存储容量信息
   */
  getCapacity(): Promise<{
    used: number;
    available: number;
    total: number;
  }>;

  /**
   * 批量操作
   */
  batch(operations: Array<{
    type: 'set' | 'remove';
    key: string;
    value?: unknown;
  }>): Promise<void>;

  /**
   * 导出数据
   */
  export(): Promise<Record<string, unknown>>;

  /**
   * 导入数据
   */
  import(data: Record<string, unknown>): Promise<void>;

  /**
   * 清理过期数据
   */
  cleanup(): Promise<void>;
}

// 存储工厂接口
export interface IStorageFactory {
  /**
   * 创建存储实例
   * @param type 存储类型
   * @param config 配置选项
   */
  create(type: StorageType, config?: Record<string, unknown>): Promise<IStorageAdapter>;

  /**
   * 获取默认存储
   */
  getDefault(): Promise<IStorageAdapter>;

  /**
   * 获取可用的存储类型
   */
  getAvailableTypes(): StorageType[];

  /**
   * 检查存储类型是否支持
   * @param type 存储类型
   */
  isSupported(type: StorageType): boolean;
}

// 存储配置接口
export interface IStorageConfig {
  /**
   * 默认存储类型
   */
  defaultType: StorageType;

  /**
   * 备用存储类型列表（按优先级排序）
   */
  fallbackTypes: StorageType[];

  /**
   * 是否启用压缩
   */
  compression: boolean;

  /**
   * 是否启用加密
   */
  encryption: boolean;

  /**
   * 最大存储大小（字节）
   */
  maxSize: number;

  /**
   * 数据过期时间（毫秒）
   */
  ttl?: number;

  /**
   * 键名前缀
   */
  prefix: string;

  /**
   * 版本号（用于数据迁移）
   */
  version: number;
}

// 存储事件接口
export interface IStorageEvent {
  type: 'set' | 'remove' | 'clear' | 'error';
  key?: string;
  oldValue?: unknown;
  newValue?: unknown;
  timestamp: number;
  storage: StorageType;
}

// 存储监听器接口
export interface IStorageListener {
  /**
   * 存储事件监听器
   * @param event 存储事件
   */
  onStorageEvent(event: IStorageEvent): void;
}

// 存储管理器接口
export interface IStorageManager {
  /**
   * 注册存储适配器
   * @param type 存储类型
   * @param adapter 适配器实例
   */
  register(type: StorageType, adapter: IStorageAdapter): void;

  /**
   * 获取存储适配器
   * @param type 存储类型，不指定则返回默认存储
   */
  getStorage(type?: StorageType): Promise<IStorageAdapter>;

  /**
   * 设置默认存储类型
   * @param type 存储类型
   */
  setDefault(type: StorageType): void;

  /**
   * 添加事件监听器
   * @param listener 监听器
   */
  addListener(listener: IStorageListener): void;

  /**
   * 移除事件监听器
   * @param listener 监听器
   */
  removeListener(listener: IStorageListener): void;

  /**
   * 触发存储事件
   * @param event 存储事件
   */
  emit(event: IStorageEvent): void;

  /**
   * 获取所有存储的统计信息
   */
  getStats(): Promise<Record<StorageType, {
    available: boolean;
    used: number;
    total: number;
    itemCount: number;
  }>>;

  /**
   * 迁移数据
   * @param fromType 源存储类型
   * @param toType 目标存储类型
   */
  migrate(fromType: StorageType, toType: StorageType): Promise<void>;
}

// 存储错误类
export class StorageException extends Error implements StorageError {
  public readonly type: StorageErrorType;
  public readonly originalError?: Error;
  public readonly storage?: StorageType;

  constructor(
    type: StorageErrorType, 
    message: string, 
    originalError?: Error, 
    storage?: StorageType
  ) {
    super(message);
    this.name = 'StorageException';
    this.type = type;
    this.originalError = originalError;
    this.storage = storage;
  }

  static notAvailable(storage: StorageType): StorageException {
    return new StorageException(
      StorageErrorType.NOT_AVAILABLE,
      `Storage ${storage} is not available`,
      undefined,
      storage
    );
  }

  static quotaExceeded(storage: StorageType): StorageException {
    return new StorageException(
      StorageErrorType.QUOTA_EXCEEDED,
      `Storage quota exceeded for ${storage}`,
      undefined,
      storage
    );
  }

  static permissionDenied(storage: StorageType): StorageException {
    return new StorageException(
      StorageErrorType.PERMISSION_DENIED,
      `Permission denied for ${storage}`,
      undefined,
      storage
    );
  }

  static networkError(storage: StorageType): StorageException {
    return new StorageException(
      StorageErrorType.NETWORK_ERROR,
      `Network error for ${storage}`,
      undefined,
      storage
    );
  }

  static unknownError(error: Error, storage?: StorageType): StorageException {
    return new StorageException(
      StorageErrorType.UNKNOWN_ERROR,
      `Unknown error: ${error.message}`,
      error,
      storage
    );
  }
}
