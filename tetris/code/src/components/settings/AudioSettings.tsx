import React, { memo, useState, useCallback } from 'react';
import { AudioManager, AudioType, AudioSystemConfig } from '@/services/AudioManager';
import styles from './AudioSettings.module.css';

// 音效设置属性
interface AudioSettingsProps {
  onConfigChange?: (config: AudioSystemConfig) => void;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
}

// 音量滑块组件
interface VolumeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  color?: string;
  icon?: string;
}

const VolumeSlider = memo<VolumeSliderProps>(({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
  color = '#3b82f6',
  icon = '🔊',
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  }, [onChange]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.volumeSlider}>
      <div className={styles.volumeLabel}>
        <span className={styles.volumeIcon}>{icon}</span>
        <span className={styles.volumeText}>{label}</span>
        <span className={styles.volumeValue}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className={styles.sliderWrapper}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={styles.slider}
          style={{ '--slider-color': color } as React.CSSProperties}
        />
        <div 
          className={styles.sliderTrack}
          style={{ 
            '--slider-percentage': `${percentage}%`,
            '--slider-color': color 
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
});

VolumeSlider.displayName = 'VolumeSlider';

// 音效预览组件
interface AudioPreviewProps {
  audioManager: AudioManager;
  disabled?: boolean;
}

const AudioPreview = memo<AudioPreviewProps>(({
  audioManager,
  disabled = false,
}) => {
  const [playingSounds, setPlayingSounds] = useState<Set<AudioType>>(new Set());

  // 播放预览音效
  const playPreview = useCallback(async (type: AudioType) => {
    if (disabled) return;
    
    try {
      await audioManager.play(type);
      setPlayingSounds(prev => new Set(prev).add(type));
      
      // 自动停止非循环音效
      if (!audioManager.getAudioConfig(type)?.loop) {
        setTimeout(() => {
          setPlayingSounds(prev => {
            const newSet = new Set(prev);
            newSet.delete(type);
            return newSet;
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to play preview audio:', error);
    }
  }, [audioManager, disabled]);

  // 停止预览音效
  const stopPreview = useCallback(async (type: AudioType) => {
    try {
      await audioManager.stop(type);
      setPlayingSounds(prev => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to stop preview audio:', error);
    }
  }, [audioManager]);

  const soundCategories = [
    {
      name: '游戏音效',
      icon: '🎮',
      sounds: [
        { type: AudioType.BLOCK_MOVE, name: '方块移动', icon: '⬅️➡️' },
        { type: AudioType.BLOCK_ROTATE, name: '方块旋转', icon: '🔄' },
        { type: AudioType.BLOCK_DROP, name: '方块下落', icon: '⬇️' },
        { type: AudioType.LINE_CLEAR, name: '消除行', icon: '✨' },
        { type: AudioType.TETRIS, name: '四行消除', icon: '🎉' },
        { type: AudioType.T_SPIN, name: 'T-Spin', icon: '🌀' },
        { type: AudioType.LEVEL_UP, name: '升级', icon: '📈' },
        { type: AudioType.GAME_OVER, name: '游戏结束', icon: '💀' },
      ],
    },
    {
      name: '特殊音效',
      icon: '💥',
      sounds: [
        { type: AudioType.BOMB_EXPLOSION, name: '炸弹爆炸', icon: '💣' },
        { type: AudioType.LOCK_BLOCK, name: '锁定方块', icon: '🔒' },
        { type: AudioType.ACHIEVEMENT, name: '成就解锁', icon: '🏆' },
      ],
    },
    {
      name: '界面音效',
      icon: '🎵',
      sounds: [
        { type: AudioType.BUTTON_CLICK, name: '按钮点击', icon: '👆' },
        { type: AudioType.PAUSE, name: '暂停', icon: '⏸️' },
        { type: AudioType.RESUME, name: '恢复', icon: '▶️' },
      ],
    },
  ];

  return (
    <div className={styles.audioPreview}>
      <h4 className={styles.previewTitle}>音效预览</h4>
      <div className={styles.previewCategories}>
        {soundCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className={styles.previewCategory}>
            <h5 className={styles.categoryTitle}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              {category.name}
            </h5>
            <div className={styles.previewSounds}>
              {category.sounds.map((sound, soundIndex) => {
                const isPlaying = playingSounds.has(sound.type);
                return (
                  <button
                    key={soundIndex}
                    className={`${styles.previewButton} ${isPlaying ? styles.playing : ''}`}
                    onClick={() => isPlaying ? stopPreview(sound.type) : playPreview(sound.type)}
                    disabled={disabled}
                    title={isPlaying ? '停止播放' : '播放预览'}
                  >
                    <span className={styles.soundIcon}>{sound.icon}</span>
                    <span className={styles.soundName}>{sound.name}</span>
                    {isPlaying && <span className={styles.playingIndicator}>🔊</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

AudioPreview.displayName = 'AudioPreview';

// 主要音效设置组件
export const AudioSettings = memo<AudioSettingsProps>(({
  onConfigChange,
  disabled = false,
  showPreview = true,
  className = '',
}) => {
  const [config, setConfig] = useState<AudioSystemConfig>({
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    uiVolume: 0.6,
    enabled: true,
    autoPlay: false,
    fadeInDuration: 1000,
    fadeOutDuration: 500,
    maxConcurrentSounds: 8,
    spatialAudio: false,
  });
  const [audioManager] = useState(() => new AudioManager());

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<AudioSystemConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    audioManager.updateConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  }, [config, audioManager, onConfigChange]);

  // 处理开关切换
  const handleToggle = useCallback((key: keyof AudioSystemConfig, value: boolean) => {
    updateConfig({ [key]: value });
  }, [updateConfig]);

  // 处理滑块变化
  const handleSliderChange = useCallback((key: keyof AudioSystemConfig, value: number) => {
    updateConfig({ [key]: value });
  }, [updateConfig]);

  // 测试主音量
  const testMasterVolume = useCallback(async () => {
    if (disabled) return;
    
    try {
      await audioManager.play(AudioType.BUTTON_CLICK);
    } catch (error) {
      console.error('Failed to test master volume:', error);
    }
  }, [audioManager, disabled]);

  // 测试背景音乐
  const testBackgroundMusic = useCallback(async () => {
    if (disabled) return;
    
    try {
      if (audioManager.isPlaying(AudioType.BACKGROUND_MUSIC)) {
        await audioManager.stopBackgroundMusic();
      } else {
        await audioManager.playBackgroundMusic();
      }
    } catch (error) {
      console.error('Failed to test background music:', error);
    }
  }, [audioManager, disabled]);

  // 重置为默认值
  const handleReset = useCallback(() => {
    const defaultConfig: AudioSystemConfig = {
      masterVolume: 1.0,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      uiVolume: 0.6,
      enabled: true,
      autoPlay: false,
      fadeInDuration: 1000,
      fadeOutDuration: 500,
      maxConcurrentSounds: 8,
      spatialAudio: false,
    };
    setConfig(defaultConfig);
    audioManager.updateConfig(defaultConfig);
    onConfigChange?.(defaultConfig);
  }, [audioManager, onConfigChange]);

  const containerClasses = [
    styles.audioSettings,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={styles.header}>
        <h3 className={styles.title}>音效设置</h3>
        <p className={styles.subtitle}>调整游戏音效和背景音乐</p>
      </div>

      <div className={styles.content}>
        {/* 总开关 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>启用音效</h4>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleToggle('enabled', e.target.checked)}
                disabled={disabled}
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>
          <p className={styles.sectionDescription}>
            开启后游戏中会播放音效和背景音乐
          </p>
        </div>

        {config.enabled && (
          <>
            {/* 音量控制 */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>音量控制</h4>
              <div className={styles.volumeControls}>
                <VolumeSlider
                  label="主音量"
                  value={config.masterVolume}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => handleSliderChange('masterVolume', value)}
                  disabled={disabled}
                  color="#3b82f6"
                  icon="🔊"
                />
                <VolumeSlider
                  label="背景音乐"
                  value={config.musicVolume}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => handleSliderChange('musicVolume', value)}
                  disabled={disabled}
                  color="#10b981"
                  icon="🎵"
                />
                <VolumeSlider
                  label="游戏音效"
                  value={config.sfxVolume}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => handleSliderChange('sfxVolume', value)}
                  disabled={disabled}
                  color="#f59e0b"
                  icon="🎮"
                />
                <VolumeSlider
                  label="界面音效"
                  value={config.uiVolume}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => handleSliderChange('uiVolume', value)}
                  disabled={disabled}
                  color="#8b5cf6"
                  icon="🔔"
                />
              </div>
              
              <div className={styles.volumeActions}>
                <button
                  className={styles.testButton}
                  onClick={testMasterVolume}
                  disabled={disabled}
                >
                  🔊 测试音量
                </button>
                <button
                  className={styles.testButton}
                  onClick={testBackgroundMusic}
                  disabled={disabled}
                >
                  {audioManager.isPlaying(AudioType.BACKGROUND_MUSIC) ? '⏹️ 停止音乐' : '▶️ 播放音乐'}
                </button>
              </div>
            </div>

            {/* 高级设置 */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>高级设置</h4>
              <div className={styles.advancedSettings}>
                <div className={styles.settingItem}>
                  <label className={styles.settingLabel}>
                    <input
                      type="checkbox"
                      checked={config.autoPlay}
                      onChange={(e) => handleToggle('autoPlay', e.target.checked)}
                      disabled={disabled}
                    />
                    <span className={styles.checkboxLabel}>自动播放</span>
                  </label>
                  <p className={styles.settingDescription}>
                    游戏开始时自动播放背景音乐
                  </p>
                </div>

                <div className={styles.settingItem}>
                  <label className={styles.settingLabel}>
                    <input
                      type="checkbox"
                      checked={config.spatialAudio}
                      onChange={(e) => handleToggle('spatialAudio', e.target.checked)}
                      disabled={disabled}
                    />
                    <span className={styles.checkboxLabel}>空间音效</span>
                  </label>
                  <p className={styles.settingDescription}>
                    启用3D空间音效（实验性功能）
                  </p>
                </div>

                <div className={styles.sliderSetting}>
                  <label className={styles.sliderLabel}>
                    最大并发音效: {config.maxConcurrentSounds}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={16}
                    step={1}
                    value={config.maxConcurrentSounds}
                    onChange={(e) => handleSliderChange('maxConcurrentSounds', parseInt(e.target.value))}
                    disabled={disabled}
                    className={styles.rangeSlider}
                  />
                  <p className={styles.sliderDescription}>
                    同时播放的最大音效数量
                  </p>
                </div>

                <div className={styles.sliderSetting}>
                  <label className={styles.sliderLabel}>
                    淡入时间: {config.fadeInDuration}ms
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={3000}
                    step={100}
                    value={config.fadeInDuration}
                    onChange={(e) => handleSliderChange('fadeInDuration', parseInt(e.target.value))}
                    disabled={disabled}
                    className={styles.rangeSlider}
                  />
                  <p className={styles.sliderDescription}>
                    音效淡入的持续时间
                  </p>
                </div>

                <div className={styles.sliderSetting}>
                  <label className={styles.sliderLabel}>
                    淡出时间: {config.fadeOutDuration}ms
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={3000}
                    step={100}
                    value={config.fadeOutDuration}
                    onChange={(e) => handleSliderChange('fadeOutDuration', parseInt(e.target.value))}
                    disabled={disabled}
                    className={styles.rangeSlider}
                  />
                  <p className={styles.sliderDescription}>
                    音效淡出的持续时间
                  </p>
                </div>
              </div>
            </div>

            {/* 音效预览 */}
            {showPreview && (
              <AudioPreview audioManager={audioManager} disabled={disabled} />
            )}
          </>
        )}

        {/* 操作按钮 */}
        <div className={styles.actions}>
          <button
            className={styles.resetButton}
            onClick={handleReset}
            disabled={disabled}
          >
            重置为默认值
          </button>
        </div>
      </div>
    </div>
  );
});

AudioSettings.displayName = 'AudioSettings';

export default AudioSettings;
