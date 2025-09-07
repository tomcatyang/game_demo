import React, { memo, useState, useEffect, useCallback } from 'react';
import { SpecialBlockConfig } from '../../services/SpecialBlockSystem';
import styles from './SpecialBlockSettings.module.css';

// 特殊方块设置属性
interface SpecialBlockSettingsProps {
  onConfigChange?: (config: SpecialBlockConfig) => void;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
}

// 滑块组件
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  color?: string;
}

const Slider = memo<SliderProps>(({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
  disabled = false,
  color = '#3b82f6',
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  }, [onChange]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderLabel}>
        <span className={styles.labelText}>{label}</span>
        <span className={styles.labelValue}>
          {value.toFixed(step < 1 ? 2 : 0)}{unit}
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

Slider.displayName = 'Slider';

// 特殊方块预览组件
interface SpecialBlockPreviewProps {
  config: SpecialBlockConfig;
  disabled?: boolean;
}

const SpecialBlockPreview = memo<SpecialBlockPreviewProps>(({
  config,
  disabled = false,
}) => {
  const [previewBoard, setPreviewBoard] = useState<number[][]>([]);
  const [animationStep, setAnimationStep] = useState(0);

  // 初始化预览板
  useEffect(() => {
    const board = Array(20).fill(null).map(() => Array(10).fill(0));
    
    // 添加一些示例方块
    for (let y = 15; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        if (Math.random() > 0.3) {
          board[y][x] = Math.floor(Math.random() * 7) + 1; // 1-7 普通方块
        }
      }
    }
    
    // 添加特殊方块
    if (config.enabled) {
      if (Math.random() < config.bombProbability) {
        board[16][4] = 8; // 炸弹方块
      }
      if (Math.random() < config.lockProbability) {
        board[17][6] = 9; // 锁定方块
      }
    }
    
    setPreviewBoard(board);
  }, [config]);

  // 动画效果
  useEffect(() => {
    if (disabled) return;
    
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [disabled]);

  const getBlockColor = (blockType: number): string => {
    const colors = {
      0: 'transparent',
      1: '#00FFFF', // I
      2: '#FFFF00', // O
      3: '#800080', // T
      4: '#00FF00', // S
      5: '#FF0000', // Z
      6: '#0000FF', // J
      7: '#FFA500', // L
      8: '#FF1493', // BOMB
      9: '#696969', // LOCK
    };
    return colors[blockType as keyof typeof colors] || 'transparent';
  };

  const getBlockIcon = (blockType: number): string => {
    const icons = {
      0: '',
      1: '▬', // I
      2: '■', // O
      3: '▲', // T
      4: '◢', // S
      5: '◣', // Z
      6: '◤', // J
      7: '◥', // L
      8: '💣', // BOMB
      9: '🔒', // LOCK
    };
    return icons[blockType as keyof typeof icons] || '';
  };

  return (
    <div className={styles.previewContainer}>
      <h4 className={styles.previewTitle}>特殊方块预览</h4>
      <div className={styles.previewBoard}>
        {previewBoard.map((row, y) => (
          <div key={y} className={styles.previewRow}>
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`${styles.previewCell} ${
                  cell === 8 ? styles.bombCell : ''
                } ${cell === 9 ? styles.lockCell : ''}`}
                style={{
                  backgroundColor: getBlockColor(cell),
                  animationDelay: `${(x + y) * 50}ms`,
                }}
              >
                {cell !== 0 && (
                  <span className={styles.blockIcon}>
                    {getBlockIcon(cell)}
                  </span>
                )}
                {cell === 8 && animationStep % 2 === 0 && (
                  <div className={styles.explosionEffect} />
                )}
                {cell === 9 && (
                  <div className={styles.lockEffect} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.previewLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendIcon}>💣</span>
          <span className={styles.legendText}>炸弹方块</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendIcon}>🔒</span>
          <span className={styles.legendText}>锁定方块</span>
        </div>
      </div>
    </div>
  );
});

SpecialBlockPreview.displayName = 'SpecialBlockPreview';

// 主要特殊方块设置组件
export const SpecialBlockSettings = memo<SpecialBlockSettingsProps>(({
  onConfigChange,
  disabled = false,
  showPreview = true,
  className = '',
}) => {
  const [config, setConfig] = useState<SpecialBlockConfig>({
    enabled: true,
    bombProbability: 0.1,
    lockProbability: 0.05,
    bombRadius: 1,
    lockDuration: 3000,
    bombScore: 500,
    lockScore: 200,
    clearScore: 100,
  });

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<SpecialBlockConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  }, [config, onConfigChange]);

  // 处理开关切换
  const handleToggle = useCallback((enabled: boolean) => {
    updateConfig({ enabled });
  }, [updateConfig]);

  // 处理滑块变化
  const handleSliderChange = useCallback((key: keyof SpecialBlockConfig, value: number) => {
    updateConfig({ [key]: value });
  }, [updateConfig]);

  // 重置为默认值
  const handleReset = useCallback(() => {
    const defaultConfig: SpecialBlockConfig = {
      enabled: true,
      bombProbability: 0.1,
      lockProbability: 0.05,
      bombRadius: 1,
      lockDuration: 3000,
      bombScore: 500,
      lockScore: 200,
      clearScore: 100,
    };
    setConfig(defaultConfig);
    onConfigChange?.(defaultConfig);
  }, [onConfigChange]);

  const containerClasses = [
    styles.specialBlockSettings,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={styles.header}>
        <h3 className={styles.title}>特殊方块设置</h3>
        <p className={styles.subtitle}>配置炸弹方块和锁定方块的行为</p>
      </div>

      <div className={styles.content}>
        {/* 总开关 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>启用特殊方块</h4>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleToggle(e.target.checked)}
                disabled={disabled}
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>
          <p className={styles.sectionDescription}>
            开启后游戏中会出现炸弹方块和锁定方块
          </p>
        </div>

        {config.enabled && (
          <>
            {/* 生成概率设置 */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>生成概率</h4>
              <div className={styles.slidersGroup}>
                <Slider
                  label="炸弹方块概率"
                  value={config.bombProbability}
                  min={0}
                  max={0.5}
                  step={0.01}
                  unit="%"
                  onChange={(value) => handleSliderChange('bombProbability', value)}
                  disabled={disabled}
                  color="#ef4444"
                />
                <Slider
                  label="锁定方块概率"
                  value={config.lockProbability}
                  min={0}
                  max={0.3}
                  step={0.01}
                  unit="%"
                  onChange={(value) => handleSliderChange('lockProbability', value)}
                  disabled={disabled}
                  color="#6b7280"
                />
              </div>
            </div>

            {/* 炸弹方块设置 */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>炸弹方块</h4>
              <div className={styles.slidersGroup}>
                <Slider
                  label="爆炸半径"
                  value={config.bombRadius}
                  min={1}
                  max={3}
                  step={1}
                  unit="格"
                  onChange={(value) => handleSliderChange('bombRadius', value)}
                  disabled={disabled}
                  color="#ef4444"
                />
                <Slider
                  label="爆炸分数"
                  value={config.bombScore}
                  min={100}
                  max={1000}
                  step={50}
                  unit="分"
                  onChange={(value) => handleSliderChange('bombScore', value)}
                  disabled={disabled}
                  color="#ef4444"
                />
              </div>
            </div>

            {/* 锁定方块设置 */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>锁定方块</h4>
              <div className={styles.slidersGroup}>
                <Slider
                  label="锁定时间"
                  value={config.lockDuration / 1000}
                  min={1}
                  max={10}
                  step={0.5}
                  unit="秒"
                  onChange={(value) => handleSliderChange('lockDuration', value * 1000)}
                  disabled={disabled}
                  color="#6b7280"
                />
                <Slider
                  label="破坏分数"
                  value={config.lockScore}
                  min={50}
                  max={500}
                  step={25}
                  unit="分"
                  onChange={(value) => handleSliderChange('lockScore', value)}
                  disabled={disabled}
                  color="#6b7280"
                />
              </div>
            </div>

            {/* 其他设置 */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>其他设置</h4>
              <div className={styles.slidersGroup}>
                <Slider
                  label="清除效果分数"
                  value={config.clearScore}
                  min={50}
                  max={300}
                  step={25}
                  unit="分"
                  onChange={(value) => handleSliderChange('clearScore', value)}
                  disabled={disabled}
                  color="#3b82f6"
                />
              </div>
            </div>
          </>
        )}

        {/* 预览区域 */}
        {showPreview && config.enabled && (
          <SpecialBlockPreview config={config} disabled={disabled} />
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

SpecialBlockSettings.displayName = 'SpecialBlockSettings';

export default SpecialBlockSettings;
