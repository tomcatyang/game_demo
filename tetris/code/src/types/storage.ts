// 存储类型枚举
export enum StorageType {
  LOCAL_STORAGE = 'localStorage',
  INDEXED_DB = 'indexedDB',
  MEMORY = 'memory',
  CACHE = 'cache',
}

// 存储接口
export interface StorageInterface {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

// 存储适配器接口
export interface StorageAdapter extends StorageInterface {
  type: StorageType;
  isAvailable(): boolean;
  getSize(): Promise<number>;
}

// 存储工厂接口
export interface StorageFactory {
  createStorage(type: StorageType): StorageAdapter;
  getDefaultStorage(): StorageAdapter;
  getAvailableStorages(): StorageType[];
}

// 存储配置接口
export interface StorageConfig {
  defaultType: StorageType;
  fallbackTypes: StorageType[];
  compression: boolean;
  encryption: boolean;
  maxSize: number; // bytes
}

// 存储错误类型
export enum StorageErrorType {
  NOT_AVAILABLE = 'not_available',
  QUOTA_EXCEEDED = 'quota_exceeded',
  PERMISSION_DENIED = 'permission_denied',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
}

// 存储错误接口
export interface StorageError extends Error {
  type: StorageErrorType;
  originalError?: Error;
}
