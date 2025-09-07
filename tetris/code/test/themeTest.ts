import { BaseTest } from './utils/testUtils';
import { ThemeManager, getThemeManager, resetThemeManager, ThemeType } from '../src/services/ThemeManager';
import { BlockType } from '../src/types';

// 主题测试类
export class ThemeTest extends BaseTest {
  private themeManager: ThemeManager;

  constructor() {
    super();
    this.themeManager = new ThemeManager();
  }

  // 测试主题管理器初始化
  testThemeManagerInitialization() {
    const manager = new ThemeManager();
    
    this.assert(!!manager, 'ThemeManager should be created');
    this.assert(manager.getCurrentTheme() === ThemeType.LIGHT, 'Default theme should be LIGHT');
    
    const currentConfig = manager.getCurrentThemeConfig();
    this.assert(!!currentConfig, 'Current theme config should exist');
    this.assert(currentConfig.name === '明亮主题', 'Current theme name should be correct');
    this.assert(currentConfig.enabled === true, 'Current theme should be enabled');
    
    console.log('✅ ThemeManager initialization test passed');
  }

  // 测试主题切换
  testThemeSwitching() {
    const manager = new ThemeManager();
    
    // 测试切换到暗黑主题
    const result1 = manager.setTheme(ThemeType.DARK);
    this.assert(result1 === true, 'Should successfully switch to DARK theme');
    this.assert(manager.getCurrentTheme() === ThemeType.DARK, 'Current theme should be DARK');
    
    // 测试切换到霓虹主题
    const result2 = manager.setTheme(ThemeType.NEON);
    this.assert(result2 === true, 'Should successfully switch to NEON theme');
    this.assert(manager.getCurrentTheme() === ThemeType.NEON, 'Current theme should be NEON');
    
    // 测试切换到复古主题
    const result3 = manager.setTheme(ThemeType.RETRO);
    this.assert(result3 === true, 'Should successfully switch to RETRO theme');
    this.assert(manager.getCurrentTheme() === ThemeType.RETRO, 'Current theme should be RETRO');
    
    // 测试切换回明亮主题
    const result4 = manager.setTheme(ThemeType.LIGHT);
    this.assert(result4 === true, 'Should successfully switch back to LIGHT theme');
    this.assert(manager.getCurrentTheme() === ThemeType.LIGHT, 'Current theme should be LIGHT');
    
    console.log('✅ Theme switching test passed');
  }

  // 测试主题配置获取
  testThemeConfigRetrieval() {
    const manager = new ThemeManager();
    
    // 测试获取明亮主题配置
    const lightConfig = manager.getThemeConfig(ThemeType.LIGHT);
    this.assert(!!lightConfig, 'Light theme config should exist');
    this.assert(lightConfig!.name === '明亮主题', 'Light theme name should be correct');
    this.assert(lightConfig!.colors.background === '#ffffff', 'Light theme background should be white');
    this.assert(lightConfig!.colors.text.primary === '#1f2937', 'Light theme text primary should be correct');
    
    // 测试获取暗黑主题配置
    const darkConfig = manager.getThemeConfig(ThemeType.DARK);
    this.assert(!!darkConfig, 'Dark theme config should exist');
    this.assert(darkConfig!.name === '暗黑主题', 'Dark theme name should be correct');
    this.assert(darkConfig!.colors.background === '#0f172a', 'Dark theme background should be dark');
    this.assert(darkConfig!.colors.text.primary === '#f1f5f9', 'Dark theme text primary should be light');
    
    // 测试获取霓虹主题配置
    const neonConfig = manager.getThemeConfig(ThemeType.NEON);
    this.assert(!!neonConfig, 'Neon theme config should exist');
    this.assert(neonConfig!.name === '霓虹主题', 'Neon theme name should be correct');
    this.assert(neonConfig!.colors.background === '#000000', 'Neon theme background should be black');
    this.assert(neonConfig!.colors.primary === '#00ffff', 'Neon theme primary should be cyan');
    
    console.log('✅ Theme config retrieval test passed');
  }

  // 测试方块颜色获取
  testBlockColorRetrieval() {
    const manager = new ThemeManager();
    
    // 测试明亮主题的方块颜色
    manager.setTheme(ThemeType.LIGHT);
    const lightColors = manager.getBlockColors();
    
    this.assert(lightColors[BlockType.I] === '#00bcd4', 'Light theme I block color should be correct');
    this.assert(lightColors[BlockType.O] === '#ffeb3b', 'Light theme O block color should be correct');
    this.assert(lightColors[BlockType.T] === '#9c27b0', 'Light theme T block color should be correct');
    this.assert(lightColors[BlockType.BOMB] === '#e91e63', 'Light theme BOMB block color should be correct');
    this.assert(lightColors[BlockType.LOCK] === '#607d8b', 'Light theme LOCK block color should be correct');
    
    // 测试暗黑主题的方块颜色
    manager.setTheme(ThemeType.DARK);
    const darkColors = manager.getBlockColors();
    
    this.assert(darkColors[BlockType.I] === '#22d3ee', 'Dark theme I block color should be correct');
    this.assert(darkColors[BlockType.O] === '#fde047', 'Dark theme O block color should be correct');
    this.assert(darkColors[BlockType.T] === '#c084fc', 'Dark theme T block color should be correct');
    this.assert(darkColors[BlockType.BOMB] === '#f472b6', 'Dark theme BOMB block color should be correct');
    this.assert(darkColors[BlockType.LOCK] === '#94a3b8', 'Dark theme LOCK block color should be correct');
    
    // 测试单个方块颜色获取
    const iColor = manager.getBlockColor(BlockType.I);
    this.assert(iColor === '#22d3ee', 'Single block color should be correct');
    
    console.log('✅ Block color retrieval test passed');
  }

  // 测试可用主题获取
  testAvailableThemesRetrieval() {
    const manager = new ThemeManager();
    const availableThemes = manager.getAvailableThemes();
    
    this.assert(Array.isArray(availableThemes), 'Available themes should be an array');
    this.assert(availableThemes.length >= 8, 'Should have at least 8 available themes');
    
    const themeIds = availableThemes.map(theme => theme.id);
    this.assert(themeIds.includes(ThemeType.LIGHT), 'Should include LIGHT theme');
    this.assert(themeIds.includes(ThemeType.DARK), 'Should include DARK theme');
    this.assert(themeIds.includes(ThemeType.NEON), 'Should include NEON theme');
    this.assert(themeIds.includes(ThemeType.RETRO), 'Should include RETRO theme');
    this.assert(themeIds.includes(ThemeType.OCEAN), 'Should include OCEAN theme');
    this.assert(themeIds.includes(ThemeType.FOREST), 'Should include FOREST theme');
    this.assert(themeIds.includes(ThemeType.SUNSET), 'Should include SUNSET theme');
    this.assert(themeIds.includes(ThemeType.MONOCHROME), 'Should include MONOCHROME theme');
    
    // 检查所有主题都启用了
    const enabledThemes = availableThemes.filter(theme => theme.enabled);
    this.assert(enabledThemes.length === availableThemes.length, 'All themes should be enabled');
    
    console.log('✅ Available themes retrieval test passed');
  }

  // 测试主题切换功能
  testThemeToggle() {
    const manager = new ThemeManager();
    
    // 设置初始主题
    manager.setTheme(ThemeType.LIGHT);
    this.assert(manager.getCurrentTheme() === ThemeType.LIGHT, 'Initial theme should be LIGHT');
    
    // 测试切换功能
    const nextTheme = manager.toggleTheme();
    this.assert(nextTheme !== ThemeType.LIGHT, 'Toggle should change theme');
    this.assert(manager.getCurrentTheme() === nextTheme, 'Current theme should match toggled theme');
    
    // 再次切换
    const nextTheme2 = manager.toggleTheme();
    this.assert(nextTheme2 !== nextTheme, 'Second toggle should change theme again');
    this.assert(manager.getCurrentTheme() === nextTheme2, 'Current theme should match second toggled theme');
    
    console.log('✅ Theme toggle test passed');
  }

  // 测试自定义主题创建
  testCustomThemeCreation() {
    const manager = new ThemeManager();
    
    const customThemeConfig = {
      name: '自定义主题',
      description: '这是一个自定义的主题',
      icon: '🎨',
      enabled: true,
      colors: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        accent: '#45b7d1',
        background: '#f8f9fa',
        surface: '#ffffff',
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          tertiary: '#bdc3c7',
        },
        border: '#e9ecef',
        shadow: 'rgba(0, 0, 0, 0.1)',
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db',
      },
      blockColors: {
        [BlockType.I]: '#ff6b6b',
        [BlockType.O]: '#4ecdc4',
        [BlockType.T]: '#45b7d1',
        [BlockType.S]: '#96ceb4',
        [BlockType.Z]: '#feca57',
        [BlockType.J]: '#ff9ff3',
        [BlockType.L]: '#54a0ff',
        [BlockType.BOMB]: '#ff3838',
        [BlockType.LOCK]: '#c7ecee',
      },
    };
    
    const customThemeId = manager.createCustomTheme(customThemeConfig);
    this.assert(!!customThemeId, 'Custom theme should be created with an ID');
    this.assert(customThemeId.startsWith('custom_'), 'Custom theme ID should start with "custom_"');
    
    const retrievedTheme = manager.getThemeConfig(customThemeId);
    this.assert(!!retrievedTheme, 'Custom theme should be retrievable');
    this.assert(retrievedTheme!.name === '自定义主题', 'Custom theme name should be correct');
    this.assert(retrievedTheme!.isCustom === true, 'Custom theme should be marked as custom');
    this.assert(retrievedTheme!.colors.primary === '#ff6b6b', 'Custom theme colors should be correct');
    
    console.log('✅ Custom theme creation test passed');
  }

  // 测试自定义主题更新
  testCustomThemeUpdate() {
    const manager = new ThemeManager();
    
    // 创建自定义主题
    const customThemeConfig = {
      name: '测试主题',
      description: '测试描述',
      icon: '🧪',
      enabled: true,
      colors: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#666666',
        background: '#ffffff',
        surface: '#f0f0f0',
        text: {
          primary: '#000000',
          secondary: '#333333',
          tertiary: '#666666',
        },
        border: '#cccccc',
        shadow: 'rgba(0, 0, 0, 0.1)',
        success: '#00ff00',
        warning: '#ffff00',
        error: '#ff0000',
        info: '#0000ff',
      },
      blockColors: {
        [BlockType.I]: '#000000',
        [BlockType.O]: '#333333',
        [BlockType.T]: '#666666',
        [BlockType.S]: '#999999',
        [BlockType.Z]: '#cccccc',
        [BlockType.J]: '#ffffff',
        [BlockType.L]: '#ff0000',
        [BlockType.BOMB]: '#00ff00',
        [BlockType.LOCK]: '#0000ff',
      },
    };
    
    const customThemeId = manager.createCustomTheme(customThemeConfig);
    
    // 更新主题
    const updateResult = manager.updateCustomTheme(customThemeId, {
      name: '更新的测试主题',
      colors: {
        ...customThemeConfig.colors,
        primary: '#ff0000',
      },
    });
    
    this.assert(updateResult === true, 'Theme update should succeed');
    
    const updatedTheme = manager.getThemeConfig(customThemeId);
    this.assert(!!updatedTheme, 'Updated theme should be retrievable');
    this.assert(updatedTheme!.name === '更新的测试主题', 'Updated theme name should be correct');
    this.assert(updatedTheme!.colors.primary === '#ff0000', 'Updated theme primary color should be correct');
    
    console.log('✅ Custom theme update test passed');
  }

  // 测试主题配置验证
  testThemeConfigValidation() {
    const manager = new ThemeManager();
    
    // 测试有效配置
    const validConfig = {
      colors: {
        primary: '#ff0000',
        secondary: '#00ff00',
        accent: '#0000ff',
        background: '#ffffff',
        surface: '#f0f0f0',
        text: {
          primary: '#000000',
          secondary: '#333333',
          tertiary: '#666666',
        },
        border: '#cccccc',
        shadow: 'rgba(0, 0, 0, 0.1)',
        success: '#00ff00',
        warning: '#ffff00',
        error: '#ff0000',
        info: '#0000ff',
      },
      blockColors: {
        [BlockType.I]: '#ff0000',
        [BlockType.O]: '#00ff00',
        [BlockType.T]: '#0000ff',
        [BlockType.S]: '#ffff00',
        [BlockType.Z]: '#ff00ff',
        [BlockType.J]: '#00ffff',
        [BlockType.L]: '#ffffff',
        [BlockType.BOMB]: '#000000',
        [BlockType.LOCK]: '#808080',
      },
    };
    
    const validResult = manager.validateThemeConfig(validConfig);
    this.assert(validResult.valid === true, 'Valid config should pass validation');
    this.assert(validResult.errors.length === 0, 'Valid config should have no errors');
    
    // 测试无效配置
    const invalidConfig = {
      colors: {
        primary: '#ff0000',
        // 缺少其他必需颜色
      } as any,
      blockColors: {
        [BlockType.I]: '#ff0000',
        // 缺少其他方块颜色
      } as any,
    };
    
    const invalidResult = manager.validateThemeConfig(invalidConfig);
    this.assert(invalidResult.valid === false, 'Invalid config should fail validation');
    this.assert(invalidResult.errors.length > 0, 'Invalid config should have errors');
    
    console.log('✅ Theme config validation test passed');
  }

  // 测试主题统计信息
  testThemeStats() {
    const manager = new ThemeManager();
    const stats = manager.getThemeStats();
    
    this.assert(typeof stats === 'object', 'Theme stats should be an object');
    
    // 检查所有主题都有统计信息
    Object.values(ThemeType).forEach(theme => {
      this.assert(!!stats[theme], `Stats should exist for theme: ${theme}`);
      this.assert(typeof stats[theme].usageCount === 'number', 'Usage count should be a number');
      this.assert(typeof stats[theme].lastUsed === 'number', 'Last used should be a number');
    });
    
    console.log('✅ Theme stats test passed');
  }

  // 测试单例模式
  testSingletonPattern() {
    // 重置单例
    resetThemeManager();
    
    const manager1 = getThemeManager();
    const manager2 = getThemeManager();
    
    this.assert(manager1 === manager2, 'Should return the same instance');
    
    // 测试状态共享
    manager1.setTheme(ThemeType.DARK);
    this.assert(manager2.getCurrentTheme() === ThemeType.DARK, 'State should be shared between instances');
    
    console.log('✅ Singleton pattern test passed');
  }

  // 测试监听器功能
  testListenerFunctionality() {
    const manager = new ThemeManager();
    let listenerCalled = false;
    let lastTheme: ThemeType | null = null;
    let lastConfig: any = null;
    
    const listener = (theme: ThemeType, config: any) => {
      listenerCalled = true;
      lastTheme = theme;
      lastConfig = config;
    };
    
    manager.addThemeChangeListener('test-listener', listener);
    
    // 测试主题变化触发监听器
    manager.setTheme(ThemeType.DARK);
    this.assert(listenerCalled, 'Listener should be called on theme change');
    this.assert(lastTheme === ThemeType.DARK, 'Listener should receive correct theme');
    this.assert(!!lastConfig, 'Listener should receive config');
    
    // 重置状态
    listenerCalled = false;
    lastTheme = null;
    lastConfig = null;
    
    // 测试切换主题触发监听器
    manager.toggleTheme();
    this.assert(listenerCalled, 'Listener should be called on theme toggle');
    this.assert(lastTheme !== ThemeType.DARK, 'Listener should receive different theme');
    this.assert(!!lastConfig, 'Listener should receive config');
    
    // 测试移除监听器
    manager.removeThemeChangeListener('test-listener');
    listenerCalled = false;
    
    manager.setTheme(ThemeType.LIGHT);
    this.assert(listenerCalled === false, 'Listener should not be called after removal');
    
    console.log('✅ Listener functionality test passed');
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 Starting Theme tests...');
    
    try {
      this.testThemeManagerInitialization();
      this.testThemeSwitching();
      this.testThemeConfigRetrieval();
      this.testBlockColorRetrieval();
      this.testAvailableThemesRetrieval();
      this.testThemeToggle();
      this.testCustomThemeCreation();
      this.testCustomThemeUpdate();
      this.testThemeConfigValidation();
      this.testThemeStats();
      this.testSingletonPattern();
      this.testListenerFunctionality();
      
      console.log('✅ All Theme tests passed!');
    } catch (error) {
      console.log(`❌ Theme test failed: ${error}`);
      throw error;
    }
  }
}

// 导出测试函数
export const runThemeTests = async () => {
  const test = new ThemeTest();
  return await test.runAllTests();
};

// 默认导出
export default ThemeTest;
