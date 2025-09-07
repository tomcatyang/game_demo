import { 
  UserData, 
  UserStats, 
  UserPreferences, 
  Achievement, 
  GameMode,
  StorageType 
} from '../types';
import { IStorageAdapter } from './storage/interfaces/StorageInterface';
import { storageFactory } from './storage/factory/StorageFactory';

// 用户数据管理器
export class UserDataManager {
  private storage: IStorageAdapter | null = null;
  private userData: UserData | null = null;
  private readonly USER_DATA_KEY = 'user_data';
  private readonly PREFERENCES_KEY = 'user_preferences';
  private readonly STATS_KEY = 'user_stats';
  private readonly ACHIEVEMENTS_KEY = 'user_achievements';
  private readonly SESSION_KEY = 'user_session';

  constructor() {
    this.initializeStorage();
  }

  // 初始化存储
  private async initializeStorage(): Promise<void> {
    try {
      this.storage = await storageFactory.getDefault();
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  // 确保存储已初始化
  private async ensureStorage(): Promise<IStorageAdapter> {
    if (!this.storage) {
      await this.initializeStorage();
    }
    return this.storage!;
  }

  // 加载用户数据
  async loadUserData(): Promise<UserData> {
    try {
      const storage = await this.ensureStorage();
      
      // 尝试加载完整用户数据
      const userData = await storage.get(this.USER_DATA_KEY) as UserData | undefined;
      
      if (userData) {
        this.userData = userData;
        return userData;
      }

      // 如果没有完整数据，尝试分别加载各部分
      const [preferences, stats, achievements] = await Promise.all([
        this.loadPreferences(),
        this.loadStats(),
        this.loadAchievements(),
      ]);

      this.userData = {
        id: 'default-user',
        name: 'Player',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        settings: {
          theme: 'light' as any,
          audio: {
            backgroundMusic: true,
            soundEffects: true,
            volume: 0.7,
          },
          touch: {
            sensitivity: 0.8,
            swipeThreshold: 50,
            tapDelay: 200,
          },
          autoSave: true,
          showGrid: false,
          showGhost: true,
          fullscreen: false,
        },
        preferences,
        stats,
        achievements,
      };

      // 保存合并后的数据
      await this.saveUserData();
      
      return this.userData!;
    } catch (error) {
      console.error('Failed to load user data:', error);
      
      // 返回默认用户数据
      this.userData = this.createDefaultUserData();
      return this.userData;
    }
  }

  // 保存用户数据
  async saveUserData(): Promise<void> {
    if (!this.userData) {
      return;
    }

    try {
      const storage = await this.ensureStorage();
      
      // 保存完整用户数据
      await storage.set(this.USER_DATA_KEY, this.userData);
      
      // 分别保存各部分数据（备份）
      await Promise.all([
        storage.set(this.PREFERENCES_KEY, this.userData.preferences),
        storage.set(this.STATS_KEY, this.userData.stats),
        storage.set(this.ACHIEVEMENTS_KEY, this.userData.achievements),
      ]);
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }

  // 创建默认用户数据
  private createDefaultUserData(): UserData {
    
    return {
      id: 'default-user',
      name: 'Player',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      settings: {
        theme: 'light' as any,
        audio: {
          backgroundMusic: true,
          soundEffects: true,
          volume: 0.7,
        },
        touch: {
          sensitivity: 0.8,
          swipeThreshold: 50,
          tapDelay: 200,
        },
        autoSave: true,
        showGrid: false,
        showGhost: true,
        fullscreen: false,
      },
      preferences: {
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        notifications: true,
        dataCollection: false,
        autoBackup: true,
      },
      stats: {
        totalGames: 0,
        totalPlayTime: 0,
        totalScore: 0,
        totalLines: 0,
        highScores: {
          [GameMode.CLASSIC]: 0,
          [GameMode.TIME_ATTACK]: 0,
          [GameMode.CHALLENGE]: 0,
        },
        averageScore: 0,
        gamesPerDay: 0,
        longestSession: 0,
        favoriteMode: GameMode.CLASSIC,
      },
      achievements: [],
    };
  }

  // 加载用户偏好设置
  async loadPreferences(): Promise<UserPreferences> {
    try {
      const storage = await this.ensureStorage();
      const preferences = await storage.get(this.PREFERENCES_KEY) as UserPreferences | undefined;
      
      return preferences || this.createDefaultUserData().preferences;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return this.createDefaultUserData().preferences;
    }
  }

  // 保存用户偏好设置
  async savePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      if (!this.userData) {
        await this.loadUserData();
      }

      this.userData!.preferences = { ...this.userData!.preferences, ...preferences };
      await this.saveUserData();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  }

  // 加载用户统计
  async loadStats(): Promise<UserStats> {
    try {
      const storage = await this.ensureStorage();
      const stats = await storage.get(this.STATS_KEY) as UserStats | undefined;
      
      return stats || this.createDefaultUserData().stats;
    } catch (error) {
      console.error('Failed to load stats:', error);
      return this.createDefaultUserData().stats;
    }
  }

  // 更新用户统计
  async updateStats(updates: Partial<UserStats>): Promise<void> {
    try {
      if (!this.userData) {
        await this.loadUserData();
      }

      this.userData!.stats = { 
        ...this.userData!.stats, 
        ...updates,
      };
      
      await this.saveUserData();
    } catch (error) {
      console.error('Failed to update stats:', error);
      throw error;
    }
  }

  // 加载成就
  async loadAchievements(): Promise<Achievement[]> {
    try {
      const storage = await this.ensureStorage();
      const achievements = await storage.get(this.ACHIEVEMENTS_KEY) as Achievement[] | undefined;
      
      return achievements || [];
    } catch (error) {
      console.error('Failed to load achievements:', error);
      return [];
    }
  }

  // 解锁成就
  async unlockAchievement(achievement: Achievement): Promise<void> {
    try {
      if (!this.userData) {
        await this.loadUserData();
      }

      // 检查是否已解锁
      const existingAchievement = this.userData!.achievements.find(
        a => a.id === achievement.id
      );

      if (!existingAchievement) {
        this.userData!.achievements.push({
          ...achievement,
          unlockedAt: new Date(),
        });
        
        await this.saveUserData();
      }
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      throw error;
    }
  }

  // 加载会话数据

  // 记录游戏结果
  async recordGameResult(result: {
    mode: GameMode;
    score: number;
    lines: number;
    level: number;
    playTime: number;
    isNewHigh: boolean;
  }): Promise<void> {
    try {
      if (!this.userData) {
        await this.loadUserData();
      }

      const stats = this.userData!.stats;

      // 更新统计数据
      stats.totalGames++;
      stats.totalPlayTime += result.playTime;
      stats.totalScore += result.score;
      stats.totalLines += result.lines;
      
      // 更新平均分
      stats.averageScore = Math.floor(stats.totalScore / stats.totalGames);
      
      // 更新最高分
      if (result.isNewHigh) {
        stats.highScores[result.mode] = result.score;
      }
      


      await this.saveUserData();
    } catch (error) {
      console.error('Failed to record game result:', error);
      throw error;
    }
  }

  // 导出用户数据
  async exportUserData(): Promise<string> {
    try {
      if (!this.userData) {
        await this.loadUserData();
      }

      const exportData = {
        userData: this.userData,
        exportTime: Date.now(),
        version: '1.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  // 导入用户数据
  async importUserData(data: string): Promise<void> {
    try {
      const importData = JSON.parse(data);
      
      if (!importData.userData || !importData.version) {
        throw new Error('Invalid user data format');
      }

      this.userData = importData.userData;
      await this.saveUserData();
    } catch (error) {
      console.error('Failed to import user data:', error);
      throw error;
    }
  }

  // 重置用户数据
  async resetUserData(): Promise<void> {
    try {
      const storage = await this.ensureStorage();
      
      // 删除所有用户数据
      await Promise.all([
        storage.remove(this.USER_DATA_KEY),
        storage.remove(this.PREFERENCES_KEY),
        storage.remove(this.STATS_KEY),
        storage.remove(this.ACHIEVEMENTS_KEY),
        storage.remove(this.SESSION_KEY),
      ]);

      // 重新创建默认数据
      this.userData = this.createDefaultUserData();
      await this.saveUserData();
    } catch (error) {
      console.error('Failed to reset user data:', error);
      throw error;
    }
  }

  // 清理过期数据
  async cleanupData(): Promise<void> {
    try {
      const storage = await this.ensureStorage();
      await storage.cleanup();
    } catch (error) {
      console.error('Failed to cleanup data:', error);
    }
  }

  // 获取存储统计
  async getStorageStats(): Promise<{
    used: number;
    available: number;
    total: number;
    itemCount: number;
  }> {
    try {
      const storage = await this.ensureStorage();
      const capacity = await storage.getCapacity();
      const keys = await storage.keys();
      
      return {
        used: capacity.used,
        available: capacity.available,
        total: capacity.total,
        itemCount: keys.length,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { used: 0, available: 0, total: 0, itemCount: 0 };
    }
  }

  // 切换存储类型
  async switchStorage(storageType: StorageType): Promise<void> {
    try {
      // 导出当前数据
      const currentData = this.userData || await this.loadUserData();
      
      // 创建新存储
      const newStorage = await storageFactory.create(storageType);
      
      // 保存数据到新存储
      this.storage = newStorage;
      this.userData = currentData;
      await this.saveUserData();
    } catch (error) {
      console.error('Failed to switch storage:', error);
      throw error;
    }
  }

  // 获取用户数据
  getUserData(): UserData | null {
    return this.userData;
  }

  // 检查是否已初始化
  isInitialized(): boolean {
    return this.userData !== null;
  }
}

// 导出默认实例
export const userDataManager = new UserDataManager();
