import React, { memo, useState, useEffect, useCallback } from 'react';
import { GameMode, GameDifficulty } from '@/types';
import { GameModeManager, GameModeConfig } from '@/services/GameModeManager';
import styles from './GameModeSelector.module.css';

// 游戏模式选择器属性
interface GameModeSelectorProps {
  onModeChange?: (mode: GameMode, difficulty: GameDifficulty) => void;
  onConfigChange?: (config: any) => void;
  disabled?: boolean;
  showDescription?: boolean;
  showStats?: boolean;
  className?: string;
}

// 模式卡片组件
interface ModeCardProps {
  mode: GameModeConfig;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (mode: GameMode) => void;
  showDescription?: boolean;
  showStats?: boolean;
  stats?: { gamesPlayed: number; bestScore: number; totalTime: number };
}

const ModeCard = memo<ModeCardProps>(({
  mode,
  isSelected,
  isDisabled,
  onSelect,
  showDescription = true,
  showStats = false,
  stats,
}) => {
  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onSelect(mode.id);
    }
  }, [mode.id, isDisabled, onSelect]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const cardClasses = [
    styles.modeCard,
    isSelected && styles.selected,
    isDisabled && styles.disabled,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      style={{ '--mode-color': mode.color } as React.CSSProperties}
    >
      <div className={styles.modeHeader}>
        <div className={styles.modeIcon}>{mode.icon}</div>
        <div className={styles.modeInfo}>
          <h3 className={styles.modeName}>{mode.name}</h3>
          {showDescription && (
            <p className={styles.modeDescription}>{mode.description}</p>
          )}
        </div>
      </div>

      {showStats && stats && (
        <div className={styles.modeStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>游戏次数</span>
            <span className={styles.statValue}>{stats.gamesPlayed}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>最高分</span>
            <span className={styles.statValue}>{stats.bestScore.toLocaleString()}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>总时长</span>
            <span className={styles.statValue}>{formatTime(stats.totalTime)}</span>
          </div>
        </div>
      )}

      <div className={styles.modeRules}>
        <div className={styles.ruleItem}>
          <span className={styles.ruleIcon}>⚡</span>
          <span className={styles.ruleText}>
            初始速度: {mode.rules.initialSpeed}ms
          </span>
        </div>
        <div className={styles.ruleItem}>
          <span className={styles.ruleIcon}>📈</span>
          <span className={styles.ruleText}>
            速度增长: {((1 - mode.rules.speedIncrease) * 100).toFixed(1)}%
          </span>
        </div>
        <div className={styles.ruleItem}>
          <span className={styles.ruleIcon}>🎯</span>
          <span className={styles.ruleText}>
            升级行数: {mode.rules.levelUpLines}
          </span>
        </div>
        {mode.rules.timeLimit && (
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>⏰</span>
            <span className={styles.ruleText}>
              时间限制: {mode.rules.timeLimit}秒
            </span>
          </div>
        )}
        {mode.rules.specialBlocksEnabled && (
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>💣</span>
            <span className={styles.ruleText}>特殊方块</span>
          </div>
        )}
        {mode.rules.comboEnabled && (
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>🔥</span>
            <span className={styles.ruleText}>连击系统</span>
          </div>
        )}
      </div>
    </div>
  );
});

ModeCard.displayName = 'ModeCard';

// 难度选择器组件
interface DifficultySelectorProps {
  selectedDifficulty: GameDifficulty;
  onDifficultyChange: (difficulty: GameDifficulty) => void;
  disabled?: boolean;
}

const DifficultySelector = memo<DifficultySelectorProps>(({
  selectedDifficulty,
  onDifficultyChange,
  disabled = false,
}) => {
  const difficulties = [
    { value: GameDifficulty.EASY, label: '简单', color: '#22c55e', description: '适合新手' },
    { value: GameDifficulty.MEDIUM, label: '普通', color: '#3b82f6', description: '标准难度' },
    { value: GameDifficulty.HARD, label: '困难', color: '#f59e0b', description: '挑战性' },
    { value: GameDifficulty.EXPERT, label: '专家', color: '#ef4444', description: '极限挑战' },
  ];

  return (
    <div className={styles.difficultySelector}>
      <h4 className={styles.difficultyTitle}>难度选择</h4>
      <div className={styles.difficultyOptions}>
        {difficulties.map((difficulty) => (
          <button
            key={difficulty.value}
            className={`${styles.difficultyButton} ${
              selectedDifficulty === difficulty.value ? styles.selected : ''
            } ${disabled ? styles.disabled : ''}`}
            onClick={() => !disabled && onDifficultyChange(difficulty.value)}
            disabled={disabled}
            style={{ '--difficulty-color': difficulty.color } as React.CSSProperties}
          >
            <span className={styles.difficultyLabel}>{difficulty.label}</span>
            <span className={styles.difficultyDescription}>{difficulty.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

DifficultySelector.displayName = 'DifficultySelector';

// 主要游戏模式选择器组件
export const GameModeSelector = memo<GameModeSelectorProps>(({
  onModeChange,
  onConfigChange,
  disabled = false,
  showDescription = true,
  showStats = false,
  className = '',
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.CLASSIC);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(GameDifficulty.MEDIUM);
  const [availableModes, setAvailableModes] = useState<GameModeConfig[]>([]);
  const [modeStats, setModeStats] = useState<Record<GameMode, { gamesPlayed: number; bestScore: number; totalTime: number }>>({
    [GameMode.CLASSIC]: { gamesPlayed: 0, bestScore: 0, totalTime: 0 },
    [GameMode.TIME_ATTACK]: { gamesPlayed: 0, bestScore: 0, totalTime: 0 },
    [GameMode.CHALLENGE]: { gamesPlayed: 0, bestScore: 0, totalTime: 0 },
  });
  const [gameModeManager] = useState(() => new GameModeManager());

  // 初始化模式数据
  useEffect(() => {
    const modes = gameModeManager.getAvailableModes();
    setAvailableModes(modes);
    setModeStats(gameModeManager.getModeStats());
  }, [gameModeManager]);

  // 处理模式选择
  const handleModeSelect = useCallback((mode: GameMode) => {
    if (disabled) return;
    
    setSelectedMode(mode);
    gameModeManager.setMode(mode);
    
    // 通知父组件
    onModeChange?.(mode, selectedDifficulty);
    onConfigChange?.(gameModeManager.getCurrentGameConfig());
  }, [disabled, selectedDifficulty, gameModeManager, onModeChange, onConfigChange]);

  // 处理难度选择
  const handleDifficultySelect = useCallback((difficulty: GameDifficulty) => {
    if (disabled) return;
    
    setSelectedDifficulty(difficulty);
    gameModeManager.setDifficulty(difficulty);
    
    // 通知父组件
    onModeChange?.(selectedMode, difficulty);
    onConfigChange?.(gameModeManager.getCurrentGameConfig());
  }, [disabled, selectedMode, gameModeManager, onModeChange, onConfigChange]);

  // 获取当前选中的模式配置
  const currentModeConfig = availableModes.find(mode => mode.id === selectedMode);

  const containerClasses = [
    styles.gameModeSelector,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={styles.header}>
        <h2 className={styles.title}>选择游戏模式</h2>
        <p className={styles.subtitle}>选择你喜欢的游戏模式和难度</p>
      </div>

      <div className={styles.modeGrid}>
        {availableModes.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            isSelected={selectedMode === mode.id}
            isDisabled={disabled || !mode.enabled}
            onSelect={handleModeSelect}
            showDescription={showDescription}
            showStats={showStats}
            stats={modeStats[mode.id]}
          />
        ))}
      </div>

      <DifficultySelector
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={handleDifficultySelect}
        disabled={disabled}
      />

      {currentModeConfig && (
        <div className={styles.currentConfig}>
          <h4 className={styles.configTitle}>当前配置</h4>
          <div className={styles.configInfo}>
            <div className={styles.configItem}>
              <span className={styles.configLabel}>模式:</span>
              <span className={styles.configValue}>{currentModeConfig.name}</span>
            </div>
            <div className={styles.configItem}>
              <span className={styles.configLabel}>难度:</span>
              <span className={styles.configValue}>
                {selectedDifficulty === GameDifficulty.EASY && '简单'}
                {selectedDifficulty === GameDifficulty.MEDIUM && '普通'}
                {selectedDifficulty === GameDifficulty.HARD && '困难'}
                {selectedDifficulty === GameDifficulty.EXPERT && '专家'}
              </span>
            </div>
            <div className={styles.configItem}>
              <span className={styles.configLabel}>初始速度:</span>
              <span className={styles.configValue}>{currentModeConfig.rules.initialSpeed}ms</span>
            </div>
            <div className={styles.configItem}>
              <span className={styles.configLabel}>分数倍数:</span>
              <span className={styles.configValue}>{currentModeConfig.rules.scoringMultiplier}x</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

GameModeSelector.displayName = 'GameModeSelector';

export default GameModeSelector;
