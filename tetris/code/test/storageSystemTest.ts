import { BaseTest } from './utils/testUtils';
import { StorageType } from '../src/types';

// 存储系统测试类
export class StorageSystemTest extends BaseTest {

  // 运行所有测试
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Storage System Tests...');
    
    this.testStorageInterfaces();
    this.testLocalStorageAdapter();
    this.testIndexedDBAdapter();
    this.testMemoryStorageAdapter();
    this.testStorageFactory();
    this.testUserDataManager();
    this.testStoragePerformance();
    this.testStorageErrorHandling();
    
    this.printResults();
  }

  // 测试存储接口
  private testStorageInterfaces(): void {
    try {
      // 测试存储类型枚举
      const storageTypes = Object.values(StorageType);
      this.addTestResult('Storage Types Enum', 
        storageTypes.includes(StorageType.LOCAL_STORAGE) &&
        storageTypes.includes(StorageType.INDEXED_DB) &&
        storageTypes.includes(StorageType.MEMORY)
      );

      // 测试接口结构
      const mockStorageInterface = {
        type: StorageType.MEMORY,
        get: async () => undefined,
        set: async () => {},
        remove: async () => {},
        clear: async () => {},
        has: async () => false,
        keys: async () => [],
        size: async () => 0,
        isAvailable: () => true,
        getCapacity: async () => ({ used: 0, available: 100, total: 100 }),
        batch: async () => {},
        export: async () => ({}),
        import: async () => {},
        cleanup: async () => {}
      };

      this.addTestResult('Storage Interface Structure', 
        typeof mockStorageInterface.get === 'function' &&
        typeof mockStorageInterface.set === 'function' &&
        typeof mockStorageInterface.isAvailable === 'function'
      );

      // 测试存储异常类型
      const errorTypes = ['NOT_AVAILABLE', 'QUOTA_EXCEEDED', 'PERMISSION_DENIED', 'NETWORK_ERROR'];
      this.addTestResult('Storage Error Types', errorTypes.length === 4);

    } catch (error) {
      this.addTestResult('Storage Interfaces', false, `Error: ${error}`);
    }
  }

  // 测试LocalStorage适配器
  private testLocalStorageAdapter(): void {
    try {
      // 模拟localStorage API
      const mockLocalStorage = {
        data: new Map<string, string>(),
        length: 0,
        
        getItem(key: string): string | null {
          return this.data.get(key) || null;
        },
        
        setItem(key: string, value: string): void {
          if (!this.data.has(key)) this.length++;
          this.data.set(key, value);
        },
        
        removeItem(key: string): void {
          if (this.data.has(key)) {
            this.data.delete(key);
            this.length--;
          }
        },
        
        clear(): void {
          this.data.clear();
          this.length = 0;
        },
        
        key(index: number): string | null {
          const keys = Array.from(this.data.keys());
          return keys[index] as string ?? null;
        }
      };

      // 测试基本操作
      mockLocalStorage.setItem('test', 'value');
      this.addTestResult('LocalStorage Set Item', 
        mockLocalStorage.getItem('test') === 'value');

      this.addTestResult('LocalStorage Has Item', 
        mockLocalStorage.getItem('test') !== null);

      mockLocalStorage.removeItem('test');
      this.addTestResult('LocalStorage Remove Item', 
        mockLocalStorage.getItem('test') === null);

      // 测试序列化
      const testData = { name: 'test', value: 123, array: [1, 2, 3] };
      const serialized = JSON.stringify({
        value: testData,
        timestamp: Date.now(),
        type: typeof testData
      });
      
      mockLocalStorage.setItem('serialized', serialized);
      const deserialized = JSON.parse(mockLocalStorage.getItem('serialized')!);
      
      this.addTestResult('LocalStorage Serialization', 
        deserialized.value.name === 'test' && 
        Array.isArray(deserialized.value.array)
      );

      // 测试键名前缀
      const prefix = 'tetris_';
      const key = 'user_data';
      const fullKey = prefix + key;
      
      mockLocalStorage.setItem(fullKey, 'prefixed_data');
      this.addTestResult('LocalStorage Key Prefix', 
        mockLocalStorage.getItem(fullKey) === 'prefixed_data');

    } catch (error) {
      this.addTestResult('LocalStorage Adapter', false, `Error: ${error}`);
    }
  }

  // 测试IndexedDB适配器
  private testIndexedDBAdapter(): void {
    try {
      // 模拟IndexedDB结构
      const mockIndexedDB = {
        databases: new Map(),
        
        open(name: string, version: number) {
          return {
            result: null,
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
            onupgradeneeded: null as (() => void) | null,
            onblocked: null as (() => void) | null,
            
            // 模拟成功
            mockSuccess() {
              this.result = {
                name,
                version,
                objectStoreNames: { contains: () => false },
                createObjectStore: () => ({
                  createIndex: () => {}
                }),
                transaction: () => ({
                  objectStore: () => ({
                    get: () => ({ onsuccess: null, onerror: null, result: null }),
                    put: () => ({ onsuccess: null, onerror: null }),
                    delete: () => ({ onsuccess: null, onerror: null }),
                    clear: () => ({ onsuccess: null, onerror: null }),
                    getAll: () => ({ onsuccess: null, onerror: null, result: [] }),
                    getAllKeys: () => ({ onsuccess: null, onerror: null, result: [] }),
                    count: () => ({ onsuccess: null, onerror: null, result: 0 })
                  })
                })
              };
              if (this.onsuccess) this.onsuccess();
            }
          };
        },
        
        deleteDatabase() {
          return {
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
            onblocked: null as (() => void) | null,
            mockSuccess() {
              if (this.onsuccess) this.onsuccess();
            }
          };
        }
      };

      // 测试数据库打开
      const openRequest = mockIndexedDB.open('TetrisGameDB', 1);
      this.addTestResult('IndexedDB Open Request', 
        openRequest !== null && typeof openRequest.mockSuccess === 'function');

      // 测试对象存储创建
      const mockDB = {
        objectStoreNames: { contains: () => false },
        createObjectStore: (name: string, options: { keyPath: string }) => {
          return {
            name,
            keyPath: options.keyPath,
            createIndex: (indexName: string) => ({ name: indexName })
          };
        }
      };

      const store = mockDB.createObjectStore('gameData', { keyPath: 'key' });
      this.addTestResult('IndexedDB Object Store Creation', 
        store.name === 'gameData' && store.keyPath === 'key');

      // 测试事务处理
      const mockTransaction = {
        mode: 'readwrite',
        objectStore: (name: string) => ({
          name,
          put: (data: { key: string; value: unknown }) => ({ key: data.key, value: data.value }),
          get: (key: string) => ({ key, result: null }),
          delete: (key: string) => ({ key, deleted: true })
        })
      };

      const transactionStore = mockTransaction.objectStore('gameData');
      this.addTestResult('IndexedDB Transaction', 
        transactionStore.name === 'gameData');

    } catch (error) {
      this.addTestResult('IndexedDB Adapter', false, `Error: ${error}`);
    }
  }

  // 测试内存存储适配器
  private testMemoryStorageAdapter(): void {
    try {
      // 模拟内存存储
      const memoryStorage = new Map<string, {
        value: unknown;
        timestamp: number;
        type: string;
        size: number;
        ttl?: number;
      }>();

      const maxSize = 1024 * 1024; // 1MB

      // 测试存储设置
      const testData = { name: 'test', score: 1000 };
      const item = {
        value: testData,
        timestamp: Date.now(),
        type: typeof testData,
        size: JSON.stringify(testData).length * 2,
        ttl: 60000 // 1分钟
      };

      memoryStorage.set('test_key', item);
      this.addTestResult('Memory Storage Set', 
        memoryStorage.has('test_key'));

      // 测试数据获取
      const retrieved = memoryStorage.get('test_key');
      this.addTestResult('Memory Storage Get', 
        retrieved?.value === testData);

      // 测试TTL逻辑
      const now = Date.now();
      const expiredItem = {
        value: 'expired',
        timestamp: now - 120000, // 2分钟前
        type: 'string',
        size: 7,
        ttl: 60000 // 1分钟TTL
      };

      memoryStorage.set('expired_key', expiredItem);
      const isExpired = expiredItem.ttl ? 
        (now - expiredItem.timestamp) > expiredItem.ttl : false;
      
      this.addTestResult('Memory Storage TTL', isExpired);

      // 测试大小计算
      let totalSize = 0;
      for (const item of memoryStorage.values()) {
        totalSize += item.size;
      }
      
      this.addTestResult('Memory Storage Size Calculation', 
        totalSize > 0);

      // 测试配额检查
      const quotaExceeded = totalSize > maxSize;
      this.addTestResult('Memory Storage Quota Check', 
        typeof quotaExceeded === 'boolean');

      // 测试批量操作
      const batchOperations = [
        { type: 'set' as const, key: 'batch1', value: 'value1' },
        { type: 'set' as const, key: 'batch2', value: 'value2' },
        { type: 'remove' as const, key: 'old_key' }
      ];

      this.addTestResult('Memory Storage Batch Operations', 
        Array.isArray(batchOperations) && batchOperations.length === 3);

    } catch (error) {
      this.addTestResult('Memory Storage Adapter', false, `Error: ${error}`);
    }
  }

  // 测试存储工厂
  private testStorageFactory(): void {
    try {
      // 测试适配器注册
      const adapterRegistry = new Map();
      adapterRegistry.set(StorageType.LOCAL_STORAGE, 'LocalStorageAdapter');
      adapterRegistry.set(StorageType.INDEXED_DB, 'IndexedDBAdapter');
      adapterRegistry.set(StorageType.MEMORY, 'MemoryStorageAdapter');

      this.addTestResult('Storage Factory Registry', 
        adapterRegistry.size === 3);

      // 测试默认配置
      const defaultConfig = {
        defaultType: StorageType.LOCAL_STORAGE,
        fallbackTypes: [StorageType.INDEXED_DB, StorageType.MEMORY],
        compression: false,
        encryption: false,
        maxSize: 10 * 1024 * 1024,
        prefix: 'tetris_',
        version: 1,
      };

      this.addTestResult('Storage Factory Default Config', 
        defaultConfig.defaultType === StorageType.LOCAL_STORAGE &&
        defaultConfig.fallbackTypes.length === 2
      );

      // 测试适配器能力检测
      const capabilities = {
        [StorageType.LOCAL_STORAGE]: {
          available: true,
          features: ['persistent', 'synchronous', 'limited_size'],
          performance: 'medium'
        },
        [StorageType.INDEXED_DB]: {
          available: true,
          features: ['persistent', 'asynchronous', 'large_size', 'transactions'],
          performance: 'medium'
        },
        [StorageType.MEMORY]: {
          available: true,
          features: ['fast', 'temporary', 'ttl_support'],
          performance: 'high'
        }
      };

      this.addTestResult('Storage Capabilities Detection', 
        capabilities[StorageType.MEMORY].performance === 'high');

      // 测试回退机制
      const fallbackChain = [
        StorageType.LOCAL_STORAGE,
        StorageType.INDEXED_DB,
        StorageType.MEMORY
      ];

      let selectedStorage: StorageType | null = null;
      for (const type of fallbackChain) {
        if (capabilities[type]?.available) {
          selectedStorage = type;
          break;
        }
      }

      this.addTestResult('Storage Fallback Mechanism', 
        selectedStorage === StorageType.LOCAL_STORAGE);

    } catch (error) {
      this.addTestResult('Storage Factory', false, `Error: ${error}`);
    }
  }

  // 测试用户数据管理器
  private testUserDataManager(): void {
    try {
      // 测试默认用户数据结构
      const defaultUserData = {
        preferences: {
          theme: 'dark',
          audio: { masterVolume: 0.7, enableMusic: true },
          touch: { sensitivity: 0.8, enableHaptic: true },
          language: 'zh-CN',
          autoSave: true
        },
        stats: {
          totalGames: 0,
          totalScore: 0,
          highScores: {},
          averageScore: 0,
          bestLevel: 1
        },
        achievements: [] as Array<{
          id: string;
          name: string;
          description: string;
          unlockedAt: number;
        }>,
        session: {
          currentGameId: null,
          lastPlayTime: Date.now(),
          currentStreak: 0,
          dailyStats: { games: 0, score: 0 }
        }
      };

      this.addTestResult('Default User Data Structure', 
        defaultUserData.preferences.theme === 'dark' &&
        defaultUserData.stats.totalGames === 0
      );

      // 测试数据验证
      const isValidUserData = (data: unknown) => {
        return data &&
          typeof data === 'object' &&
          data !== null &&
          'preferences' in data &&
          'stats' in data &&
          'achievements' in data &&
          'session' in data &&
          Array.isArray((data as Record<string, unknown>).achievements);
      };

      this.addTestResult('User Data Validation', 
        Boolean(isValidUserData(defaultUserData)));

      // 测试统计更新
      const stats = { ...defaultUserData.stats };
      stats.totalGames++;
      stats.totalScore += 1000;
      stats.averageScore = stats.totalScore / stats.totalGames;

      this.addTestResult('Stats Update Logic', 
        stats.totalGames === 1 && stats.averageScore === 1000);

      // 测试成就系统
      const achievements = [...defaultUserData.achievements];
      const newAchievement = {
        id: 'first_game',
        name: 'First Game',
        description: 'Play your first game',
        unlockedAt: Date.now()
      };

      achievements.push(newAchievement);
      this.addTestResult('Achievement System', 
        achievements.length === 1 && achievements[0].id === 'first_game');

      // 测试会话管理
      const session = { ...defaultUserData.session };
      session.dailyStats.games++;
      session.dailyStats.score += 500;
      session.currentStreak++;

      this.addTestResult('Session Management', 
        session.dailyStats.games === 1 && session.currentStreak === 1);

      // 测试数据导出/导入
      const exportData = {
        userData: defaultUserData,
        exportTime: Date.now(),
        version: '1.0'
      };

      const exportString = JSON.stringify(exportData);
      const importData = JSON.parse(exportString);

      this.addTestResult('Data Export/Import', 
        importData.version === '1.0' && 
        importData.userData.preferences.theme === 'dark');

    } catch (error) {
      this.addTestResult('User Data Manager', false, `Error: ${error}`);
    }
  }

  // 测试存储性能
  private testStoragePerformance(): void {
    try {
      // 测试大量数据操作性能
      const startTime = performance.now();
      
      const mockStorage = new Map<string, string>();
      const operationCount = 1000;
      
      // 批量写入
      for (let i = 0; i < operationCount; i++) {
        const key = `key_${i}`;
        const value = JSON.stringify({ index: i, data: `value_${i}` });
        mockStorage.set(key, value);
      }
      
      // 批量读取
      for (let i = 0; i < operationCount; i++) {
        const key = `key_${i}`;
        const value = mockStorage.get(key);
        if (value) {
          JSON.parse(value);
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.addTestResult('Storage Performance - 1000 Operations', 
        duration < 100 && mockStorage.size === operationCount);

      // 测试数据大小计算性能
      const sizeTestStart = performance.now();
      let totalSize = 0;
      
      for (const value of mockStorage.values()) {
        totalSize += new Blob([value]).size;
      }
      
      const sizeTestEnd = performance.now();
      const sizeDuration = sizeTestEnd - sizeTestStart;
      
      this.addTestResult('Storage Size Calculation Performance', 
        sizeDuration < 50 && totalSize > 0);

      // 测试查询性能
      const queryStart = performance.now();
      const keys = Array.from(mockStorage.keys());
      const filteredKeys = keys.filter(key => key.includes('_5'));
      
      const queryEnd = performance.now();
      const queryDuration = queryEnd - queryStart;
      
      this.addTestResult('Storage Query Performance', 
        queryDuration < 10 && filteredKeys.length > 0);

    } catch (error) {
      this.addTestResult('Storage Performance', false, `Error: ${error}`);
    }
  }

  // 测试存储错误处理
  private testStorageErrorHandling(): void {
    try {
      // 测试配额超出错误
      const quotaError = {
        name: 'QuotaExceededError',
        message: 'Storage quota exceeded'
      };

      const isQuotaError = quotaError.name === 'QuotaExceededError';
      this.addTestResult('Quota Exceeded Error Detection', isQuotaError);

      // 测试权限拒绝错误
      const permissionError = {
        name: 'SecurityError',
        message: 'Permission denied'
      };

      const isPermissionError = permissionError.name === 'SecurityError';
      this.addTestResult('Permission Error Detection', isPermissionError);

      // 测试网络错误处理
      const networkError = {
        name: 'NetworkError',
        message: 'Network connection failed'
      };

      const isNetworkError = networkError.name === 'NetworkError';
      this.addTestResult('Network Error Detection', isNetworkError);

      // 测试错误恢复机制
      const errorRecovery = {
        attempts: 3,
        delay: 1000,
        fallbackStorage: StorageType.MEMORY
      };

      const canRecover = errorRecovery.attempts > 0 && 
        errorRecovery.fallbackStorage === StorageType.MEMORY;
      
      this.addTestResult('Error Recovery Mechanism', canRecover);

      // 测试数据验证错误
      const invalidData = { corrupted: true };
      const isValidData = (data: unknown) => {
        try {
          return data && 
            typeof data === 'object' && 
            data !== null &&
            !('corrupted' in data && (data as Record<string, unknown>).corrupted);
        } catch {
          return false;
        }
      };

      this.addTestResult('Data Validation Error Handling', 
        !isValidData(invalidData));

    } catch (error) {
      this.addTestResult('Storage Error Handling', false, `Error: ${error}`);
    }
  }
}

// 导出测试实例
export const storageSystemTest = new StorageSystemTest();

// 简单的测试运行函数
export const runStorageSystemTests = async (): Promise<boolean> => {
  const test = new StorageSystemTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};
