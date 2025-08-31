import React, { memo, useEffect, useState } from 'react';
import { GameStats, LevelInfo, ComboInfo } from '@/types';
import { ScoreFormatter } from '@/utils/scoreCalculator';
import styles from './ScoreDisplay.module.css';

// 分数显示属性
interface ScoreDisplayProps {
  stats: GameStats;
  levelInfo?: LevelInfo;
  comboInfo?: ComboInfo;
  className?: string;
  layout?: 'vertical' | 'horizontal' | 'compact';
  showAnimation?: boolean;
  showDetails?: boolean;
}

// 动画数字组件
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}

const AnimatedNumber = memo<AnimatedNumberProps>(({ 
  value, 
  duration = 300,
  formatter = (v) => v.toString(),
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === displayValue) return;

    setIsAnimating(true);
    const startValue = displayValue;
    const difference = value - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用easeOutQuart缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + difference * easeProgress);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, displayValue]);

  return (
    <span className={`${className} ${isAnimating ? styles.animating : ''}`}>
      {formatter(displayValue)}
    </span>
  );
});

AnimatedNumber.displayName = 'AnimatedNumber';

// 分数项组件
interface ScoreItemProps {
  label: string;
  value: React.ReactNode;
  icon?: string;
  highlight?: boolean;
  className?: string;
}

const ScoreItem = memo<ScoreItemProps>(({ 
  label, 
  value, 
  icon, 
  highlight = false,
  className = ''
}) => {
  const itemClasses = [
    styles.scoreItem,
    highlight && styles.highlight,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={itemClasses}>
      <div className={styles.label}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span>{label}</span>
      </div>
      <div className={styles.value}>
        {value}
      </div>
    </div>
  );
});

ScoreItem.displayName = 'ScoreItem';

// 主要分数显示组件
export const ScoreDisplay = memo<ScoreDisplayProps>(({
  stats,
  levelInfo,
  comboInfo,
  className = '',
  layout = 'vertical',
  showAnimation = true,
  showDetails = true,
}) => {
  const [scoreChange, setScoreChange] = useState(0);
  const [showScoreChange, setShowScoreChange] = useState(false);

  // 监听分数变化并显示增量动画
  useEffect(() => {
    const prevScore = parseInt(localStorage.getItem('prevScore') || '0');
    const currentScore = stats.score;
    
    if (currentScore > prevScore && prevScore > 0) {
      const change = currentScore - prevScore;
      setScoreChange(change);
      setShowScoreChange(true);
      
      // 3秒后隐藏分数变化
      const timer = setTimeout(() => {
        setShowScoreChange(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    localStorage.setItem('prevScore', currentScore.toString());
  }, [stats.score]);

  const containerClasses = [
    styles.scoreDisplay,
    styles[layout],
    className,
  ].filter(Boolean).join(' ');

  // 格式化时间显示
  const formatGameTime = (totalTime: number): string => {
    return ScoreFormatter.formatTime(totalTime);
  };

  // 计算当前等级进度
  const levelProgress = levelInfo ? 
    (levelInfo.linesCompleted / levelInfo.linesRequired) * 100 : 0;

  return (
    <div className={containerClasses}>
      {/* 主要分数 */}
      <div className={styles.mainScore}>
        <ScoreItem
          label="Score"
          icon="🏆"
          highlight={true}
          value={
            <div className={styles.scoreValue}>
              {showAnimation ? (
                <AnimatedNumber 
                  value={stats.score}
                  formatter={ScoreFormatter.formatScore}
                  className={styles.mainNumber}
                />
              ) : (
                <span className={styles.mainNumber}>
                  {ScoreFormatter.formatScore(stats.score)}
                </span>
              )}
              
              {/* 分数变化动画 */}
              {showScoreChange && scoreChange > 0 && (
                <span className={styles.scoreChange}>
                  +{ScoreFormatter.formatScore(scoreChange)}
                </span>
              )}
            </div>
          }
        />
      </div>

      {/* 等级信息 */}
      <div className={styles.levelSection}>
        <ScoreItem
          label="Level"
          icon="📈"
          value={
            <div className={styles.levelValue}>
              {showAnimation ? (
                <AnimatedNumber 
                  value={stats.level}
                  formatter={ScoreFormatter.formatLevel}
                  className={styles.levelNumber}
                />
              ) : (
                <span className={styles.levelNumber}>
                  {ScoreFormatter.formatLevel(stats.level)}
                </span>
              )}
              
              {/* 等级进度条 */}
              {levelInfo && showDetails && (
                <div className={styles.levelProgress}>
                  <div 
                    className={styles.progressBar}
                    style={{ width: `${levelProgress}%` }}
                  />
                  <span className={styles.progressText}>
                    {levelInfo.linesCompleted}/{levelInfo.linesRequired}
                  </span>
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* 行数统计 */}
      <ScoreItem
        label="Lines"
        icon="📊"
        value={
          showAnimation ? (
            <AnimatedNumber 
              value={stats.lines}
              formatter={ScoreFormatter.formatLines}
            />
          ) : (
            ScoreFormatter.formatLines(stats.lines)
          )
        }
      />

      {/* 连击信息 */}
      {comboInfo && comboInfo.count > 0 && (
        <ScoreItem
          label="Combo"
          icon="⚡"
          highlight={true}
          value={
            <div className={styles.comboValue}>
              <span className={styles.comboNumber}>
                {ScoreFormatter.formatCombo(comboInfo.count)}
              </span>
              {showDetails && (
                <span className={styles.comboMultiplier}>
                  {comboInfo.multiplier.toFixed(1)}x
                </span>
              )}
            </div>
          }
        />
      )}

      {/* 详细信息 */}
      {showDetails && (
        <div className={styles.detailsSection}>
          <ScoreItem
            label="Time"
            icon="⏱️"
            value={formatGameTime(stats.totalTime)}
          />
          
          {comboInfo && comboInfo.maxCombo > 0 && (
            <ScoreItem
              label="Max Combo"
              icon="🔥"
              value={`${comboInfo.maxCombo} hits`}
            />
          )}
          
          <ScoreItem
            label="Games"
            icon="🎮"
            value={stats.totalGames.toString()}
          />
        </div>
      )}
    </div>
  );
});

ScoreDisplay.displayName = 'ScoreDisplay';

export default ScoreDisplay;
