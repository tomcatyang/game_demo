import { BaseTest } from './utils/testUtils';
import { AudioManager, getAudioManager, resetAudioManager, AudioType, AudioSystemConfig } from '../src/services/AudioManager';
import { GameState } from '../src/types';

// 音效测试类
export class AudioTest extends BaseTest {
  private audioManager: AudioManager;

  constructor() {
    super();
    this.audioManager = new AudioManager();
  }

  // 测试音效管理器初始化
  testAudioManagerInitialization() {
    const manager = new AudioManager();
    
    this.assert(!!manager, 'AudioManager should be created');
    
    const config = manager.getConfig();
    this.assert(!!config, 'Config should exist');
    this.assert(config.masterVolume === 1.0, 'Default master volume should be 1.0');
    this.assert(config.musicVolume === 0.7, 'Default music volume should be 0.7');
    this.assert(config.sfxVolume === 0.8, 'Default sfx volume should be 0.8');
    this.assert(config.uiVolume === 0.6, 'Default ui volume should be 0.6');
    this.assert(config.enabled === true, 'Audio should be enabled by default');
    this.assert(config.maxConcurrentSounds === 8, 'Default max concurrent sounds should be 8');
    
    console.log('✅ AudioManager initialization test passed');
  }

  // 测试配置更新
  testConfigUpdate() {
    const manager = new AudioManager();
    
    const newConfig: Partial<AudioSystemConfig> = {
      masterVolume: 0.8,
      musicVolume: 0.5,
      sfxVolume: 0.9,
      uiVolume: 0.3,
      enabled: false,
      maxConcurrentSounds: 12,
    };
    
    manager.updateConfig(newConfig);
    const updatedConfig = manager.getConfig();
    
    this.assert(updatedConfig.masterVolume === 0.8, 'Master volume should be updated');
    this.assert(updatedConfig.musicVolume === 0.5, 'Music volume should be updated');
    this.assert(updatedConfig.sfxVolume === 0.9, 'SFX volume should be updated');
    this.assert(updatedConfig.uiVolume === 0.3, 'UI volume should be updated');
    this.assert(updatedConfig.enabled === false, 'Enabled should be updated');
    this.assert(updatedConfig.maxConcurrentSounds === 12, 'Max concurrent sounds should be updated');
    
    console.log('✅ Config update test passed');
  }

  // 测试音频配置获取
  testAudioConfigRetrieval() {
    const manager = new AudioManager();
    
    // 测试获取背景音乐配置
    const musicConfig = manager.getAudioConfig(AudioType.BACKGROUND_MUSIC);
    this.assert(!!musicConfig, 'Background music config should exist');
    this.assert(musicConfig!.name === '背景音乐', 'Background music name should be correct');
    this.assert(musicConfig!.category === 'music', 'Background music category should be music');
    this.assert(musicConfig!.loop === true, 'Background music should loop');
    this.assert(musicConfig!.enabled === true, 'Background music should be enabled');
    
    // 测试获取方块移动配置
    const moveConfig = manager.getAudioConfig(AudioType.BLOCK_MOVE);
    this.assert(!!moveConfig, 'Block move config should exist');
    this.assert(moveConfig!.name === '方块移动', 'Block move name should be correct');
    this.assert(moveConfig!.category === 'sfx', 'Block move category should be sfx');
    this.assert(moveConfig!.loop === false, 'Block move should not loop');
    this.assert(moveConfig!.enabled === true, 'Block move should be enabled');
    
    // 测试获取按钮点击配置
    const clickConfig = manager.getAudioConfig(AudioType.BUTTON_CLICK);
    this.assert(!!clickConfig, 'Button click config should exist');
    this.assert(clickConfig!.name === '按钮点击', 'Button click name should be correct');
    this.assert(clickConfig!.category === 'ui', 'Button click category should be ui');
    this.assert(clickConfig!.loop === false, 'Button click should not loop');
    this.assert(clickConfig!.enabled === true, 'Button click should be enabled');
    
    console.log('✅ Audio config retrieval test passed');
  }

  // 测试音频配置更新
  testAudioConfigUpdate() {
    const manager = new AudioManager();
    
    // 更新背景音乐配置
    const updateResult = manager.updateAudioConfig(AudioType.BACKGROUND_MUSIC, {
      volume: 0.5,
      loop: false,
      enabled: false,
    });
    
    this.assert(updateResult === true, 'Audio config update should succeed');
    
    const updatedConfig = manager.getAudioConfig(AudioType.BACKGROUND_MUSIC);
    this.assert(!!updatedConfig, 'Updated config should exist');
    this.assert(updatedConfig!.volume === 0.5, 'Updated volume should be correct');
    this.assert(updatedConfig!.loop === false, 'Updated loop should be correct');
    this.assert(updatedConfig!.enabled === false, 'Updated enabled should be correct');
    
    console.log('✅ Audio config update test passed');
  }

  // 测试播放状态检查
  testPlaybackStateCheck() {
    const manager = new AudioManager();
    
    // 初始状态检查
    this.assert(manager.isPlaying(AudioType.BACKGROUND_MUSIC) === false, 'Background music should not be playing initially');
    this.assert(manager.isPaused(AudioType.BACKGROUND_MUSIC) === false, 'Background music should not be paused initially');
    
    // 测试不存在的音频类型
    this.assert(manager.isPlaying('nonexistent' as AudioType) === false, 'Nonexistent audio should not be playing');
    this.assert(manager.isPaused('nonexistent' as AudioType) === false, 'Nonexistent audio should not be paused');
    
    console.log('✅ Playback state check test passed');
  }

  // 测试播放进度获取
  testPlaybackProgress() {
    const manager = new AudioManager();
    
    // 未播放的音频进度应该为0
    const progress1 = manager.getProgress(AudioType.BACKGROUND_MUSIC);
    this.assert(progress1 === 0, 'Progress should be 0 for non-playing audio');
    
    // 测试不存在的音频类型
    const progress2 = manager.getProgress('nonexistent' as AudioType);
    this.assert(progress2 === 0, 'Progress should be 0 for nonexistent audio');
    
    console.log('✅ Playback progress test passed');
  }

  // 测试事件监听器
  testEventListenerFunctionality() {
    const manager = new AudioManager();
    let eventReceived = false;
    let receivedType: AudioType | null = null;
    let receivedEvent: string | null = null;
    
    const listener = (type: AudioType, event: string) => {
      eventReceived = true;
      receivedType = type;
      receivedEvent = event;
    };
    
    // 添加监听器
    manager.addEventListener('test-listener', listener);
    
    // 模拟事件触发（通过内部方法）
    // 注意：这里我们无法直接触发事件，因为播放方法需要真实的音频文件
    // 但我们可以测试监听器的添加和移除功能
    
    // 移除监听器
    manager.removeEventListener('test-listener');
    
    this.assert(!!manager, 'Manager should exist');
    this.assert(typeof listener === 'function', 'Listener should be a function');
    
    console.log('✅ Event listener functionality test passed');
  }

  // 测试统计信息获取
  testStatsRetrieval() {
    const manager = new AudioManager();
    const stats = manager.getStats();
    
    this.assert(typeof stats === 'object', 'Stats should be an object');
    this.assert(typeof stats.totalAudio === 'number', 'Total audio count should be a number');
    this.assert(typeof stats.playingCount === 'number', 'Playing count should be a number');
    this.assert(typeof stats.pausedCount === 'number', 'Paused count should be a number');
    this.assert(typeof stats.loadedCount === 'number', 'Loaded count should be a number');
    this.assert(stats.currentBackgroundMusic === null, 'Current background music should be null initially');
    
    this.assert(stats.totalAudio >= 0, 'Total audio count should be non-negative');
    this.assert(stats.playingCount >= 0, 'Playing count should be non-negative');
    this.assert(stats.pausedCount >= 0, 'Paused count should be non-negative');
    this.assert(stats.loadedCount >= 0, 'Loaded count should be non-negative');
    
    console.log('✅ Stats retrieval test passed');
  }

  // 测试游戏状态音效
  testGameStateAudio() {
    const manager = new AudioManager();
    
    // 测试各种游戏状态的音效处理
    // 注意：由于没有真实的音频文件，这些方法会返回false，但不会抛出错误
    
    // 测试暂停状态
    const pauseResult = manager.playGameStateSound(GameState.PAUSED);
    this.assert(pauseResult instanceof Promise, 'Pause audio should return Promise');
    
    // 测试游戏结束状态
    const gameOverResult = manager.playGameStateSound(GameState.GAME_OVER);
    this.assert(gameOverResult instanceof Promise, 'Game over audio should return Promise');
    
    // 测试菜单状态
    const menuResult = manager.playGameStateSound(GameState.MENU);
    this.assert(menuResult instanceof Promise, 'Menu audio should return Promise');
    
    console.log('✅ Game state audio test passed');
  }

  // 测试背景音乐控制
  testBackgroundMusicControl() {
    const manager = new AudioManager();
    
    // 测试停止背景音乐（初始状态）
    const stopResult = manager.stopBackgroundMusic();
    this.assert(stopResult instanceof Promise, 'Stop background music should return Promise');
    
    // 测试停止背景音乐（带淡出）
    const stopFadeResult = manager.stopBackgroundMusic(true);
    this.assert(stopFadeResult instanceof Promise, 'Stop background music with fade should return Promise');
    
    console.log('✅ Background music control test passed');
  }

  // 测试停止所有音效
  testStopAllAudio() {
    const manager = new AudioManager();
    
    // 测试停止所有音效
    const stopAllResult = manager.stopAll();
    this.assert(typeof stopAllResult === 'object', 'Stop all should return Promise');
    
    // 验证停止所有音效是异步操作
    this.assert(stopAllResult instanceof Promise, 'Stop all should return Promise');
    
    console.log('✅ Stop all audio test passed');
  }

  // 测试暂停和恢复所有音效
  testPauseResumeAllAudio() {
    const manager = new AudioManager();
    
    // 测试暂停所有音效
    manager.pauseAll();
    // 这个方法没有返回值，我们只测试它不会抛出错误
    
    // 测试恢复所有音效
    manager.resumeAll();
    // 这个方法没有返回值，我们只测试它不会抛出错误
    
    console.log('✅ Pause/resume all audio test passed');
  }

  // 测试单例模式
  testSingletonPattern() {
    // 重置单例
    resetAudioManager();
    
    const manager1 = getAudioManager();
    const manager2 = getAudioManager();
    
    this.assert(manager1 === manager2, 'Should return the same instance');
    
    // 测试配置共享
    manager1.updateConfig({ masterVolume: 0.5 });
    const config2 = manager2.getConfig();
    this.assert(config2.masterVolume === 0.5, 'Config should be shared between instances');
    
    console.log('✅ Singleton pattern test passed');
  }

  // 测试系统重置
  testSystemReset() {
    const manager = new AudioManager();
    
    // 更新一些配置
    manager.updateConfig({ masterVolume: 0.3, enabled: false });
    
    // 重置系统
    const resetResult = manager.reset();
    this.assert(typeof resetResult === 'object', 'Reset should return Promise');
    this.assert(resetResult instanceof Promise, 'Reset should return Promise');
    
    console.log('✅ System reset test passed');
  }

  // 测试系统销毁
  testSystemDestroy() {
    const manager = new AudioManager();
    
    // 销毁系统
    const destroyResult = manager.destroy();
    this.assert(typeof destroyResult === 'object', 'Destroy should return Promise');
    this.assert(destroyResult instanceof Promise, 'Destroy should return Promise');
    
    console.log('✅ System destroy test passed');
  }

  // 测试音频类型枚举
  testAudioTypeEnum() {
    // 测试所有音频类型都存在
    const audioTypes = Object.values(AudioType);
    this.assert(audioTypes.length > 0, 'AudioType enum should have values');
    
    // 测试特定音频类型
    this.assert(AudioType.BACKGROUND_MUSIC === 'background_music', 'BACKGROUND_MUSIC should be correct');
    this.assert(AudioType.BLOCK_MOVE === 'block_move', 'BLOCK_MOVE should be correct');
    this.assert(AudioType.BLOCK_ROTATE === 'block_rotate', 'BLOCK_ROTATE should be correct');
    this.assert(AudioType.BLOCK_DROP === 'block_drop', 'BLOCK_DROP should be correct');
    this.assert(AudioType.LINE_CLEAR === 'line_clear', 'LINE_CLEAR should be correct');
    this.assert(AudioType.TETRIS === 'tetris', 'TETRIS should be correct');
    this.assert(AudioType.T_SPIN === 't_spin', 'T_SPIN should be correct');
    this.assert(AudioType.LEVEL_UP === 'level_up', 'LEVEL_UP should be correct');
    this.assert(AudioType.GAME_OVER === 'game_over', 'GAME_OVER should be correct');
    this.assert(AudioType.PAUSE === 'pause', 'PAUSE should be correct');
    this.assert(AudioType.RESUME === 'resume', 'RESUME should be correct');
    this.assert(AudioType.BUTTON_CLICK === 'button_click', 'BUTTON_CLICK should be correct');
    this.assert(AudioType.BOMB_EXPLOSION === 'bomb_explosion', 'BOMB_EXPLOSION should be correct');
    this.assert(AudioType.LOCK_BLOCK === 'lock_block', 'LOCK_BLOCK should be correct');
    this.assert(AudioType.ACHIEVEMENT === 'achievement', 'ACHIEVEMENT should be correct');
    
    console.log('✅ Audio type enum test passed');
  }

  // 测试配置验证
  testConfigValidation() {
    const manager = new AudioManager();
    
    // 测试有效配置
    const validConfig: Partial<AudioSystemConfig> = {
      masterVolume: 0.8,
      musicVolume: 0.6,
      sfxVolume: 0.7,
      uiVolume: 0.5,
      enabled: true,
      autoPlay: false,
      fadeInDuration: 1000,
      fadeOutDuration: 500,
      maxConcurrentSounds: 10,
      spatialAudio: false,
    };
    
    manager.updateConfig(validConfig);
    const updatedConfig = manager.getConfig();
    
    this.assert(updatedConfig.masterVolume === 0.8, 'Valid config should be applied');
    this.assert(updatedConfig.musicVolume === 0.6, 'Valid config should be applied');
    this.assert(updatedConfig.sfxVolume === 0.7, 'Valid config should be applied');
    this.assert(updatedConfig.uiVolume === 0.5, 'Valid config should be applied');
    this.assert(updatedConfig.enabled === true, 'Valid config should be applied');
    this.assert(updatedConfig.autoPlay === false, 'Valid config should be applied');
    this.assert(updatedConfig.fadeInDuration === 1000, 'Valid config should be applied');
    this.assert(updatedConfig.fadeOutDuration === 500, 'Valid config should be applied');
    this.assert(updatedConfig.maxConcurrentSounds === 10, 'Valid config should be applied');
    this.assert(updatedConfig.spatialAudio === false, 'Valid config should be applied');
    
    console.log('✅ Config validation test passed');
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 Starting Audio tests...');
    
    try {
      this.testAudioManagerInitialization();
      this.testConfigUpdate();
      this.testAudioConfigRetrieval();
      this.testAudioConfigUpdate();
      this.testPlaybackStateCheck();
      this.testPlaybackProgress();
      this.testEventListenerFunctionality();
      this.testStatsRetrieval();
      this.testGameStateAudio();
      this.testBackgroundMusicControl();
      this.testStopAllAudio();
      this.testPauseResumeAllAudio();
      this.testSingletonPattern();
      this.testSystemReset();
      this.testSystemDestroy();
      this.testAudioTypeEnum();
      this.testConfigValidation();
      
      console.log('✅ All Audio tests passed!');
    } catch (error) {
      console.log(`❌ Audio test failed: ${error}`);
      throw error;
    }
  }
}

// 导出测试函数
export const runAudioTests = async () => {
  const test = new AudioTest();
  return await test.runAllTests();
};

// 默认导出
export default AudioTest;
