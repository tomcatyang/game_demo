import { BlockType } from '@/types';

// 主题类型枚举
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  NEON = 'neon',
  RETRO = 'retro',
  OCEAN = 'ocean',
  FOREST = 'forest',
  SUNSET = 'sunset',
  MONOCHROME = 'monochrome',
}

// 颜色配置接口
export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: string;
  shadow: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// 方块颜色配置接口
export interface BlockColorConfig {
  [BlockType.I]: string;
  [BlockType.O]: string;
  [BlockType.T]: string;
  [BlockType.S]: string;
  [BlockType.Z]: string;
  [BlockType.J]: string;
  [BlockType.L]: string;
  [BlockType.BOMB]: string;
  [BlockType.LOCK]: string;
}

// 主题配置接口
export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  icon: string;
  colors: ColorConfig;
  blockColors: BlockColorConfig;
  enabled: boolean;
  isCustom: boolean;
  author?: string;
  version?: string;
}

// 默认主题配置
const DEFAULT_THEMES: Record<ThemeType, ThemeConfig> = {
  [ThemeType.LIGHT]: {
    id: ThemeType.LIGHT,
    name: '明亮主题',
    description: '清新明亮的浅色主题，适合日间使用',
    icon: '☀️',
    enabled: true,
    isCustom: false,
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
      },
      border: '#e5e7eb',
      shadow: 'rgba(0, 0, 0, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    blockColors: {
      [BlockType.I]: '#00bcd4',
      [BlockType.O]: '#ffeb3b',
      [BlockType.T]: '#9c27b0',
      [BlockType.S]: '#4caf50',
      [BlockType.Z]: '#f44336',
      [BlockType.J]: '#2196f3',
      [BlockType.L]: '#ff9800',
      [BlockType.BOMB]: '#e91e63',
      [BlockType.LOCK]: '#607d8b',
    },
  },
  [ThemeType.DARK]: {
    id: ThemeType.DARK,
    name: '暗黑主题',
    description: '护眼的深色主题，适合夜间使用',
    icon: '🌙',
    enabled: true,
    isCustom: false,
    colors: {
      primary: '#60a5fa',
      secondary: '#9ca3af',
      accent: '#fbbf24',
      background: '#0f172a',
      surface: '#1e293b',
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
      },
      border: '#334155',
      shadow: 'rgba(0, 0, 0, 0.3)',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },
    blockColors: {
      [BlockType.I]: '#22d3ee',
      [BlockType.O]: '#fde047',
      [BlockType.T]: '#c084fc',
      [BlockType.S]: '#4ade80',
      [BlockType.Z]: '#f87171',
      [BlockType.J]: '#60a5fa',
      [BlockType.L]: '#fb923c',
      [BlockType.BOMB]: '#f472b6',
      [BlockType.LOCK]: '#94a3b8',
    },
  },
  [ThemeType.NEON]: {
    id: ThemeType.NEON,
    name: '霓虹主题',
    description: '炫酷的霓虹灯效果，充满科技感',
    icon: '💫',
    enabled: true,
    isCustom: false,
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#ffff00',
      background: '#000000',
      surface: '#0a0a0a',
      text: {
        primary: '#00ffff',
        secondary: '#ff00ff',
        tertiary: '#ffff00',
      },
      border: '#00ffff',
      shadow: 'rgba(0, 255, 255, 0.5)',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
      info: '#00ffff',
    },
    blockColors: {
      [BlockType.I]: '#00ffff',
      [BlockType.O]: '#ffff00',
      [BlockType.T]: '#ff00ff',
      [BlockType.S]: '#00ff00',
      [BlockType.Z]: '#ff0000',
      [BlockType.J]: '#0080ff',
      [BlockType.L]: '#ff8000',
      [BlockType.BOMB]: '#ff0080',
      [BlockType.LOCK]: '#808080',
    },
  },
  [ThemeType.RETRO]: {
    id: ThemeType.RETRO,
    name: '复古主题',
    description: '怀旧的复古风格，致敬经典游戏',
    icon: '🎮',
    enabled: true,
    isCustom: false,
    colors: {
      primary: '#8b4513',
      secondary: '#a0522d',
      accent: '#daa520',
      background: '#2f4f4f',
      surface: '#3f5f5f',
      text: {
        primary: '#f5deb3',
        secondary: '#d2b48c',
        tertiary: '#bc9a6a',
      },
      border: '#8b4513',
      shadow: 'rgba(139, 69, 19, 0.3)',
      success: '#32cd32',
      warning: '#ffa500',
      error: '#dc143c',
      info: '#4169e1',
    },
    blockColors: {
      [BlockType.I]: '#00ced1',
      [BlockType.O]: '#ffd700',
      [BlockType.T]: '#9370db',
      [BlockType.S]: '#32cd32',
      [BlockType.Z]: '#ff6347',
      [BlockType.J]: '#4169e1',
      [BlockType.L]: '#ff8c00',
      [BlockType.BOMB]: '#ff1493',
      [BlockType.LOCK]: '#696969',
    },
  },
  [ThemeType.OCEAN]: {
    id: ThemeType.OCEAN,
    name: '海洋主题',
    description: '清新的海洋色彩，带来宁静的感觉',
    icon: '🌊',
    enabled: true,
    isCustom: false,
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#f59e0b',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: {
        primary: '#0c4a6e',
        secondary: '#0369a1',
        tertiary: '#0284c7',
      },
      border: '#bae6fd',
      shadow: 'rgba(14, 165, 233, 0.1)',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0ea5e9',
    },
    blockColors: {
      [BlockType.I]: '#06b6d4',
      [BlockType.O]: '#fbbf24',
      [BlockType.T]: '#8b5cf6',
      [BlockType.S]: '#10b981',
      [BlockType.Z]: '#ef4444',
      [BlockType.J]: '#3b82f6',
      [BlockType.L]: '#f97316',
      [BlockType.BOMB]: '#ec4899',
      [BlockType.LOCK]: '#6b7280',
    },
  },
  [ThemeType.FOREST]: {
    id: ThemeType.FOREST,
    name: '森林主题',
    description: '自然的绿色调，营造森林氛围',
    icon: '🌲',
    enabled: true,
    isCustom: false,
    colors: {
      primary: '#16a34a',
      secondary: '#22c55e',
      accent: '#eab308',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: {
        primary: '#14532d',
        secondary: '#166534',
        tertiary: '#15803d',
      },
      border: '#bbf7d0',
      shadow: 'rgba(22, 163, 74, 0.1)',
      success: '#16a34a',
      warning: '#ca8a04',
      error: '#dc2626',
      info: '#2563eb',
    },
    blockColors: {
      [BlockType.I]: '#22d3ee',
      [BlockType.O]: '#fde047',
      [BlockType.T]: '#a855f7',
      [BlockType.S]: '#22c55e',
      [BlockType.Z]: '#ef4444',
      [BlockType.J]: '#3b82f6',
      [BlockType.L]: '#f97316',
      [BlockType.BOMB]: '#ec4899',
      [BlockType.LOCK]: '#6b7280',
    },
  },
  [ThemeType.SUNSET]: {
    id: ThemeType.SUNSET,
    name: '日落主题',
    description: '温暖的日落色彩，温馨浪漫',
    icon: '🌅',
    enabled: true,
    isCustom: false,
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#fbbf24',
      background: '#fff7ed',
      surface: '#fed7aa',
      text: {
        primary: '#9a3412',
        secondary: '#c2410c',
        tertiary: '#ea580c',
      },
      border: '#fdba74',
      shadow: 'rgba(249, 115, 22, 0.1)',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb',
    },
    blockColors: {
      [BlockType.I]: '#06b6d4',
      [BlockType.O]: '#fde047',
      [BlockType.T]: '#a855f7',
      [BlockType.S]: '#22c55e',
      [BlockType.Z]: '#ef4444',
      [BlockType.J]: '#3b82f6',
      [BlockType.L]: '#f97316',
      [BlockType.BOMB]: '#ec4899',
      [BlockType.LOCK]: '#6b7280',
    },
  },
  [ThemeType.MONOCHROME]: {
    id: ThemeType.MONOCHROME,
    name: '单色主题',
    description: '简约的黑白灰配色，专注游戏本身',
    icon: '⚫',
    enabled: true,
    isCustom: false,
    colors: {
      primary: '#374151',
      secondary: '#6b7280',
      accent: '#9ca3af',
      background: '#ffffff',
      surface: '#f9fafb',
      text: {
        primary: '#111827',
        secondary: '#374151',
        tertiary: '#6b7280',
      },
      border: '#d1d5db',
      shadow: 'rgba(0, 0, 0, 0.1)',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb',
    },
    blockColors: {
      [BlockType.I]: '#6b7280',
      [BlockType.O]: '#9ca3af',
      [BlockType.T]: '#4b5563',
      [BlockType.S]: '#374151',
      [BlockType.Z]: '#1f2937',
      [BlockType.J]: '#111827',
      [BlockType.L]: '#6b7280',
      [BlockType.BOMB]: '#dc2626',
      [BlockType.LOCK]: '#9ca3af',
    },
  },
};

// 主题管理器类
export class ThemeManager {
  private currentTheme: ThemeType;
  private customThemes: Map<string, ThemeConfig>;
  private listeners: Map<string, (theme: ThemeType, config: ThemeConfig) => void>;
  private isSystemTheme: boolean;

  constructor() {
    this.currentTheme = ThemeType.LIGHT;
    this.customThemes = new Map();
    this.listeners = new Map();
    this.isSystemTheme = false;
    
    // 检测系统主题偏好
    this.detectSystemTheme();
    
    // 监听系统主题变化
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
    }
  }

  // 检测系统主题偏好
  private detectSystemTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? ThemeType.DARK : ThemeType.LIGHT;
      this.isSystemTheme = true;
    }
  }

  // 处理系统主题变化
  private handleSystemThemeChange(event: MediaQueryListEvent): void {
    if (this.isSystemTheme) {
      const newTheme = event.matches ? ThemeType.DARK : ThemeType.LIGHT;
      this.setTheme(newTheme, true);
    }
  }

  // 获取当前主题
  getCurrentTheme(): ThemeType {
    return this.currentTheme;
  }

  // 获取当前主题配置
  getCurrentThemeConfig(): ThemeConfig {
    return this.getThemeConfig(this.currentTheme) || DEFAULT_THEMES[ThemeType.LIGHT];
  }

  // 获取主题配置
  getThemeConfig(theme: ThemeType | string): ThemeConfig | null {
    if (theme in DEFAULT_THEMES) {
      return DEFAULT_THEMES[theme as ThemeType];
    }
    return this.customThemes.get(theme) || null;
  }

  // 设置主题
  setTheme(theme: ThemeType | string, isSystemTheme: boolean = false): boolean {
    const themeConfig = this.getThemeConfig(theme);
    if (!themeConfig || !themeConfig.enabled) {
      return false;
    }

    this.currentTheme = theme as ThemeType;
    this.isSystemTheme = isSystemTheme;
    
    // 应用主题到DOM
    this.applyThemeToDOM(themeConfig);
    
    // 通知监听器
    this.notifyListeners(theme as ThemeType, themeConfig);
    
    return true;
  }

  // 应用主题到DOM
  private applyThemeToDOM(config: ThemeConfig): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // 设置CSS变量
    root.style.setProperty('--color-primary', config.colors.primary);
    root.style.setProperty('--color-secondary', config.colors.secondary);
    root.style.setProperty('--color-accent', config.colors.accent);
    root.style.setProperty('--color-background', config.colors.background);
    root.style.setProperty('--color-surface', config.colors.surface);
    root.style.setProperty('--color-text-primary', config.colors.text.primary);
    root.style.setProperty('--color-text-secondary', config.colors.text.secondary);
    root.style.setProperty('--color-text-tertiary', config.colors.text.tertiary);
    root.style.setProperty('--color-border', config.colors.border);
    root.style.setProperty('--color-shadow', config.colors.shadow);
    root.style.setProperty('--color-success', config.colors.success);
    root.style.setProperty('--color-warning', config.colors.warning);
    root.style.setProperty('--color-error', config.colors.error);
    root.style.setProperty('--color-info', config.colors.info);

    // 设置方块颜色
    Object.entries(config.blockColors).forEach(([blockType, color]) => {
      root.style.setProperty(`--color-block-${blockType.toLowerCase()}`, color);
    });

    // 设置主题属性
    root.setAttribute('data-theme', config.id);
  }

  // 获取所有可用主题
  getAvailableThemes(): ThemeConfig[] {
    const defaultThemes = Object.values(DEFAULT_THEMES).filter(theme => theme.enabled);
    const customThemes = Array.from(this.customThemes.values()).filter(theme => theme.enabled);
    return [...defaultThemes, ...customThemes];
  }

  // 创建自定义主题
  createCustomTheme(config: Omit<ThemeConfig, 'id' | 'isCustom'>): string {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customTheme: ThemeConfig = {
      ...config,
      id: id as ThemeType,
      isCustom: true,
    };
    
    this.customThemes.set(id, customTheme);
    return id;
  }

  // 更新自定义主题
  updateCustomTheme(id: string, config: Partial<ThemeConfig>): boolean {
    const existingTheme = this.customThemes.get(id);
    if (!existingTheme) {
      return false;
    }

    const updatedTheme = { ...existingTheme, ...config };
    this.customThemes.set(id, updatedTheme);
    
    // 如果当前主题被更新，重新应用
    if (this.currentTheme === id) {
      this.applyThemeToDOM(updatedTheme);
    }
    
    return true;
  }

  // 删除自定义主题
  deleteCustomTheme(id: string): boolean {
    return this.customThemes.delete(id);
  }

  // 启用/禁用主题
  setThemeEnabled(theme: ThemeType | string, enabled: boolean): boolean {
    const themeConfig = this.getThemeConfig(theme);
    if (!themeConfig) {
      return false;
    }

    themeConfig.enabled = enabled;
    return true;
  }

  // 添加主题变化监听器
  addThemeChangeListener(id: string, callback: (theme: ThemeType, config: ThemeConfig) => void): void {
    this.listeners.set(id, callback);
  }

  // 移除主题变化监听器
  removeThemeChangeListener(id: string): void {
    this.listeners.delete(id);
  }

  // 通知监听器
  private notifyListeners(theme: ThemeType, config: ThemeConfig): void {
    this.listeners.forEach(callback => {
      try {
        callback(theme, config);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  // 获取方块颜色
  getBlockColor(blockType: BlockType): string {
    const config = this.getCurrentThemeConfig();
    return config.blockColors[blockType] || '#000000';
  }

  // 获取所有方块颜色
  getBlockColors(): BlockColorConfig {
    const config = this.getCurrentThemeConfig();
    return { ...config.blockColors };
  }

  // 切换主题
  toggleTheme(): ThemeType {
    const availableThemes = this.getAvailableThemes();
    const currentIndex = availableThemes.findIndex(theme => theme.id === this.currentTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    const nextTheme = availableThemes[nextIndex].id;
    
    this.setTheme(nextTheme);
    return nextTheme;
  }

  // 重置为默认主题
  resetToDefault(): void {
    this.setTheme(ThemeType.LIGHT);
    this.isSystemTheme = false;
  }

  // 跟随系统主题
  followSystemTheme(): void {
    this.detectSystemTheme();
    this.isSystemTheme = true;
  }

  // 获取主题统计信息
  getThemeStats(): Record<ThemeType, { usageCount: number; lastUsed: number }> {
    // 这里应该从存储中获取统计数据
    // 暂时返回模拟数据
    const stats: Record<ThemeType, { usageCount: number; lastUsed: number }> = {} as any;
    Object.values(ThemeType).forEach(theme => {
      stats[theme] = { usageCount: 0, lastUsed: 0 };
    });
    return stats;
  }

  // 验证主题配置
  validateThemeConfig(config: Partial<ThemeConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.colors) {
      const requiredColors = ['primary', 'secondary', 'accent', 'background', 'surface'];
      requiredColors.forEach(color => {
        if (!config.colors![color as keyof ColorConfig]) {
          errors.push(`Missing required color: ${color}`);
        }
      });
    }

    if (config.blockColors) {
      Object.values(BlockType).forEach(blockType => {
        if (!config.blockColors![blockType]) {
          errors.push(`Missing block color for: ${blockType}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // 导出主题配置
  exportTheme(theme: ThemeType | string): string | null {
    const themeConfig = this.getThemeConfig(theme);
    if (!themeConfig) {
      return null;
    }

    return JSON.stringify(themeConfig, null, 2);
  }

  // 导入主题配置
  importTheme(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson) as ThemeConfig;
      
      // 验证配置
      const validation = this.validateThemeConfig(config);
      if (!validation.valid) {
        return false;
      }

      // 创建自定义主题
      this.createCustomTheme(config);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 重置管理器
  reset(): void {
    this.customThemes.clear();
    this.listeners.clear();
    this.resetToDefault();
  }

  // 销毁管理器
  destroy(): void {
    this.reset();
  }
}

// 单例实例
let themeManagerInstance: ThemeManager | null = null;

// 获取主题管理器实例
export const getThemeManager = (): ThemeManager => {
  if (!themeManagerInstance) {
    themeManagerInstance = new ThemeManager();
  }
  return themeManagerInstance;
};

// 重置主题管理器实例
export const resetThemeManager = (): void => {
  if (themeManagerInstance) {
    themeManagerInstance.destroy();
    themeManagerInstance = null;
  }
};

export default ThemeManager;
