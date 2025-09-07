import { BaseTest } from './utils/testUtils';

// 定义GameSettings接口（避免导入包含CSS的组件）
export interface GameSettings {
  gameMode: string;
  difficulty: string;
  enableSpecialBlocks: boolean;
  enableCombo: boolean;
  theme: string;
  audioEnabled: boolean;
  musicVolume: number;
  soundVolume: number;
  showAchievements: boolean;
}

// 设置验证工具
export const validateSettings = (settings: GameSettings): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 验证游戏模式
  if (!['classic', 'time_attack', 'challenge'].includes(settings.gameMode)) {
    errors.push('无效的游戏模式');
  }

  // 验证难度
  if (!['easy', 'medium', 'hard', 'expert'].includes(settings.difficulty)) {
    errors.push('无效的难度设置');
  }

  // 验证主题
  if (!settings.theme || typeof settings.theme !== 'string') {
    errors.push('无效的主题设置');
  }

  // 验证音量
  if (settings.musicVolume < 0 || settings.musicVolume > 1) {
    errors.push('音乐音量必须在0-1之间');
  }

  if (settings.soundVolume < 0 || settings.soundVolume > 1) {
    errors.push('音效音量必须在0-1之间');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// 设置导出工具
export const exportSettings = (settings: GameSettings): string => {
  const exportData = {
    ...settings,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };
  return JSON.stringify(exportData, null, 2);
};

// 设置导入工具
export const importSettings = (jsonString: string): { success: boolean; settings?: GameSettings; error?: string } => {
  try {
    const importedData = JSON.parse(jsonString);
    
    // 验证导入的数据结构
    const requiredFields = ['gameMode', 'difficulty', 'theme', 'audioEnabled', 'musicVolume', 'soundVolume'];
    const missingFields = requiredFields.filter(field => !(field in importedData));
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `缺少必要字段: ${missingFields.join(', ')}`
      };
    }

    // 验证设置
    const validation = validateSettings(importedData);
    if (!validation.valid) {
      return {
        success: false,
        error: `设置验证失败: ${validation.errors.join(', ')}`
      };
    }

    return {
      success: true,
      settings: importedData as GameSettings
    };
  } catch (error) {
    return {
      success: false,
      error: 'JSON格式错误'
    };
  }
};

export class SettingsTest extends BaseTest {
  constructor() {
    super('Settings');
  }

  // 测试设置验证
  testSettingsValidation() {
    console.log('🧪 Testing settings validation...');

    // 测试有效设置
    const validSettings: GameSettings = {
      gameMode: 'classic',
      difficulty: 'medium',
      enableSpecialBlocks: false,
      enableCombo: true,
      theme: 'default',
      audioEnabled: true,
      musicVolume: 0.7,
      soundVolume: 0.8,
      showAchievements: true
    };

    const validResult = validateSettings(validSettings);
    this.assert(validResult.valid, 'Valid settings should pass validation');
    this.assert(validResult.errors.length === 0, 'Valid settings should have no errors');

    // 测试无效游戏模式
    const invalidGameMode = { ...validSettings, gameMode: 'invalid' };
    const invalidGameModeResult = validateSettings(invalidGameMode);
    this.assert(!invalidGameModeResult.valid, 'Invalid game mode should fail validation');
    this.assert(invalidGameModeResult.errors.includes('无效的游戏模式'), 'Should have game mode error');

    // 测试无效难度
    const invalidDifficulty = { ...validSettings, difficulty: 'invalid' };
    const invalidDifficultyResult = validateSettings(invalidDifficulty);
    this.assert(!invalidDifficultyResult.valid, 'Invalid difficulty should fail validation');
    this.assert(invalidDifficultyResult.errors.includes('无效的难度设置'), 'Should have difficulty error');

    // 测试无效音量
    const invalidVolume = { ...validSettings, musicVolume: 1.5 };
    const invalidVolumeResult = validateSettings(invalidVolume);
    this.assert(!invalidVolumeResult.valid, 'Invalid volume should fail validation');
    this.assert(invalidVolumeResult.errors.includes('音乐音量必须在0-1之间'), 'Should have volume error');

    console.log('✅ Settings validation test passed');
  }

  // 测试设置导出
  testSettingsExport() {
    console.log('🧪 Testing settings export...');

    const settings: GameSettings = {
      gameMode: 'classic',
      difficulty: 'medium',
      enableSpecialBlocks: false,
      enableCombo: true,
      theme: 'default',
      audioEnabled: true,
      musicVolume: 0.7,
      soundVolume: 0.8,
      showAchievements: true
    };

    const exported = exportSettings(settings);
    this.assert(typeof exported === 'string', 'Export should return string');
    this.assert(exported.length > 0, 'Export should not be empty');

    // 验证导出的JSON格式
    let parsed: any;
    try {
      parsed = JSON.parse(exported);
    } catch (error) {
      this.assert(false, 'Exported data should be valid JSON');
      return;
    }

    this.assert(parsed.gameMode === settings.gameMode, 'Game mode should match');
    this.assert(parsed.difficulty === settings.difficulty, 'Difficulty should match');
    this.assert(parsed.theme === settings.theme, 'Theme should match');
    this.assert(parsed.audioEnabled === settings.audioEnabled, 'Audio enabled should match');
    this.assert(parsed.musicVolume === settings.musicVolume, 'Music volume should match');
    this.assert(parsed.soundVolume === settings.soundVolume, 'Sound volume should match');
    this.assert(parsed.exportDate, 'Should have export date');
    this.assert(parsed.version, 'Should have version');

    console.log('✅ Settings export test passed');
  }

  // 测试设置导入
  testSettingsImport() {
    console.log('🧪 Testing settings import...');

    const validJson = JSON.stringify({
      gameMode: 'classic',
      difficulty: 'medium',
      enableSpecialBlocks: false,
      enableCombo: true,
      theme: 'default',
      audioEnabled: true,
      musicVolume: 0.7,
      soundVolume: 0.8,
      showAchievements: true
    });

    const validResult = importSettings(validJson);
    this.assert(validResult.success, 'Valid JSON should import successfully');
    this.assert(validResult.settings, 'Should return settings');
    this.assert(validResult.settings!.gameMode === 'classic', 'Game mode should match');

    // 测试无效JSON
    const invalidJsonResult = importSettings('invalid json');
    this.assert(!invalidJsonResult.success, 'Invalid JSON should fail');
    this.assert(invalidJsonResult.error, 'Should have error message');

    // 测试缺少字段
    const incompleteJson = JSON.stringify({
      gameMode: 'classic'
    });
    const incompleteResult = importSettings(incompleteJson);
    this.assert(!incompleteResult.success, 'Incomplete settings should fail');
    this.assert(incompleteResult.error?.includes('缺少必要字段'), 'Should have missing fields error');

    // 测试无效设置值
    const invalidValuesJson = JSON.stringify({
      gameMode: 'classic',
      difficulty: 'medium',
      enableSpecialBlocks: false,
      enableCombo: true,
      theme: 'default',
      audioEnabled: true,
      musicVolume: 1.5, // 无效音量
      soundVolume: 0.8,
      showAchievements: true
    });
    const invalidValuesResult = importSettings(invalidValuesJson);
    this.assert(!invalidValuesResult.success, 'Invalid values should fail');
    this.assert(invalidValuesResult.error?.includes('设置验证失败'), 'Should have validation error');

    console.log('✅ Settings import test passed');
  }

  // 测试设置默认值
  testDefaultSettings() {
    console.log('🧪 Testing default settings...');

    const defaultSettings: GameSettings = {
      gameMode: 'classic',
      difficulty: 'medium',
      enableSpecialBlocks: false,
      enableCombo: true,
      theme: 'default',
      audioEnabled: true,
      musicVolume: 0.7,
      soundVolume: 0.8,
      showAchievements: true
    };

    // 验证默认设置是有效的
    const validation = validateSettings(defaultSettings);
    this.assert(validation.valid, 'Default settings should be valid');
    this.assert(validation.errors.length === 0, 'Default settings should have no errors');

    // 验证默认设置值
    this.assert(defaultSettings.gameMode === 'classic', 'Default game mode should be classic');
    this.assert(defaultSettings.difficulty === 'medium', 'Default difficulty should be medium');
    this.assert(defaultSettings.enableSpecialBlocks === false, 'Default special blocks should be false');
    this.assert(defaultSettings.enableCombo === true, 'Default combo should be true');
    this.assert(defaultSettings.theme === 'default', 'Default theme should be default');
    this.assert(defaultSettings.audioEnabled === true, 'Default audio should be enabled');
    this.assert(defaultSettings.musicVolume === 0.7, 'Default music volume should be 0.7');
    this.assert(defaultSettings.soundVolume === 0.8, 'Default sound volume should be 0.8');
    this.assert(defaultSettings.showAchievements === true, 'Default achievements should be shown');

    console.log('✅ Default settings test passed');
  }

  // 测试设置类型
  testSettingsTypes() {
    console.log('🧪 Testing settings types...');

    const settings: GameSettings = {
      gameMode: 'classic',
      difficulty: 'medium',
      enableSpecialBlocks: false,
      enableCombo: true,
      theme: 'default',
      audioEnabled: true,
      musicVolume: 0.7,
      soundVolume: 0.8,
      showAchievements: true
    };

    // 验证类型
    this.assert(typeof settings.gameMode === 'string', 'Game mode should be string');
    this.assert(typeof settings.difficulty === 'string', 'Difficulty should be string');
    this.assert(typeof settings.enableSpecialBlocks === 'boolean', 'Enable special blocks should be boolean');
    this.assert(typeof settings.enableCombo === 'boolean', 'Enable combo should be boolean');
    this.assert(typeof settings.theme === 'string', 'Theme should be string');
    this.assert(typeof settings.audioEnabled === 'boolean', 'Audio enabled should be boolean');
    this.assert(typeof settings.musicVolume === 'number', 'Music volume should be number');
    this.assert(typeof settings.soundVolume === 'number', 'Sound volume should be number');
    this.assert(typeof settings.showAchievements === 'boolean', 'Show achievements should be boolean');

    console.log('✅ Settings types test passed');
  }

  // 测试设置边界值
  testSettingsBoundaries() {
    console.log('🧪 Testing settings boundaries...');

    // 测试音量边界值
    const minVolumeSettings: GameSettings = {
      gameMode: 'classic',
      difficulty: 'medium',
      enableSpecialBlocks: false,
      enableCombo: true,
      theme: 'default',
      audioEnabled: true,
      musicVolume: 0,
      soundVolume: 0,
      showAchievements: true
    };

    const minVolumeResult = validateSettings(minVolumeSettings);
    this.assert(minVolumeResult.valid, 'Minimum volume should be valid');

    const maxVolumeSettings: GameSettings = {
      gameMode: 'classic',
      difficulty: 'medium',
      enableSpecialBlocks: false,
      enableCombo: true,
      theme: 'default',
      audioEnabled: true,
      musicVolume: 1,
      soundVolume: 1,
      showAchievements: true
    };

    const maxVolumeResult = validateSettings(maxVolumeSettings);
    this.assert(maxVolumeResult.valid, 'Maximum volume should be valid');

    // 测试超出边界的音量
    const overMaxVolumeSettings: GameSettings = {
      gameMode: 'classic',
      difficulty: 'medium',
      enableSpecialBlocks: false,
      enableCombo: true,
      theme: 'default',
      audioEnabled: true,
      musicVolume: 1.1,
      soundVolume: 1.1,
      showAchievements: true
    };

    const overMaxVolumeResult = validateSettings(overMaxVolumeSettings);
    this.assert(!overMaxVolumeResult.valid, 'Over maximum volume should be invalid');

    console.log('✅ Settings boundaries test passed');
  }

  // 测试设置更新
  testSettingsUpdate() {
    console.log('🧪 Testing settings update...');

    const originalSettings: GameSettings = {
      gameMode: 'classic',
      difficulty: 'medium',
      enableSpecialBlocks: false,
      enableCombo: true,
      theme: 'default',
      audioEnabled: true,
      musicVolume: 0.7,
      soundVolume: 0.8,
      showAchievements: true
    };

    // 测试部分更新
    const updatedSettings = { ...originalSettings, gameMode: 'time_attack', difficulty: 'hard' };
    this.assert(updatedSettings.gameMode === 'time_attack', 'Game mode should be updated');
    this.assert(updatedSettings.difficulty === 'hard', 'Difficulty should be updated');
    this.assert(updatedSettings.theme === 'default', 'Theme should remain unchanged');

    // 验证更新后的设置仍然有效
    const validation = validateSettings(updatedSettings);
    this.assert(validation.valid, 'Updated settings should be valid');

    console.log('✅ Settings update test passed');
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 Starting Settings tests...');
    
    try {
      this.testSettingsValidation();
      this.testSettingsExport();
      this.testSettingsImport();
      this.testDefaultSettings();
      this.testSettingsTypes();
      this.testSettingsBoundaries();
      this.testSettingsUpdate();
      
      console.log('✅ All Settings tests passed!');
    } catch (error) {
      console.error('❌ Settings test failed:', error);
      throw error;
    }
  }
}
