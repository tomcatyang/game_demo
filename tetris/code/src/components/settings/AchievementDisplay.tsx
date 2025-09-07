import { memo, useState, useEffect, useCallback } from 'react';
import { 
  AchievementManager, 
  AchievementType, 
  AchievementProgress, 
  AchievementConfig, 
  AchievementStats,
  AchievementRarity,
  AchievementStatus 
} from '@/services/AchievementManager';
import styles from './AchievementDisplay.module.css';

// 成就展示属性
interface AchievementDisplayProps {
  onAchievementClick?: (achievement: AchievementType) => void;
  disabled?: boolean;
  showProgress?: boolean;
  showStats?: boolean;
  className?: string;
}

// 成就卡片组件
interface AchievementCardProps {
  config: AchievementConfig;
  progress: AchievementProgress;
  onClick?: (achievement: AchievementType) => void;
  disabled?: boolean;
  showProgress?: boolean;
}

const AchievementCard = memo<AchievementCardProps>(({
  config,
  progress,
  onClick,
  disabled = false,
  showProgress = true,
}) => {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick(config.id);
    }
  }, [config.id, disabled, onClick]);

  const cardClasses = [
    styles.achievementCard,
    styles[`rarity_${config.rarity}`],
    styles[`status_${progress.status}`],
    disabled && styles.disabled,
  ].filter(Boolean).join(' ');

  const progressPercentage = Math.min((progress.current / progress.target) * 100, 100);

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className={styles.achievementIcon}>
        {progress.status === AchievementStatus.COMPLETED ? '✅' : config.icon}
      </div>
      
      <div className={styles.achievementInfo}>
        <h3 className={styles.achievementName}>{config.name}</h3>
        <p className={styles.achievementDescription}>{config.description}</p>
        
        {showProgress && progress.status === AchievementStatus.LOCKED && (
          <div className={styles.achievementProgress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {progress.current} / {progress.target}
            </span>
          </div>
        )}
        
        {progress.status === AchievementStatus.UNLOCKED && (
          <div className={styles.achievementUnlocked}>
            <span className={styles.unlockedText}>已解锁</span>
            <span className={styles.unlockedTime}>
              {progress.unlockedAt ? new Date(progress.unlockedAt).toLocaleDateString() : ''}
            </span>
          </div>
        )}
        
        {progress.status === AchievementStatus.COMPLETED && (
          <div className={styles.achievementCompleted}>
            <span className={styles.completedText}>已完成</span>
            <span className={styles.completedTime}>
              {progress.completedAt ? new Date(progress.completedAt).toLocaleDateString() : ''}
            </span>
          </div>
        )}
      </div>
      
      <div className={styles.achievementReward}>
        <span className={styles.points}>+{config.points}</span>
        <span className={styles.rarity}>{config.rarity}</span>
      </div>
    </div>
  );
});

AchievementCard.displayName = 'AchievementCard';

// 成就统计组件
interface AchievementStatsDisplayProps {
  stats: AchievementStats;
}

const AchievementStatsDisplay = memo<AchievementStatsDisplayProps>(({ stats }) => {
  return (
    <div className={styles.statsDisplay}>
      <h3 className={styles.statsTitle}>成就统计</h3>
      
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>总成就</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.unlocked}</span>
          <span className={styles.statLabel}>已解锁</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.completed}</span>
          <span className={styles.statLabel}>已完成</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.points}</span>
          <span className={styles.statLabel}>总积分</span>
        </div>
      </div>
      
      <div className={styles.rarityStats}>
        <h4 className={styles.rarityTitle}>稀有度分布</h4>
        <div className={styles.rarityGrid}>
          {Object.entries(stats.byRarity).map(([rarity, count]) => (
            <div key={rarity} className={styles.rarityItem}>
              <span className={styles.rarityName}>{rarity}</span>
              <span className={styles.rarityCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.categoryStats}>
        <h4 className={styles.categoryTitle}>分类统计</h4>
        <div className={styles.categoryGrid}>
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <div key={category} className={styles.categoryItem}>
              <span className={styles.categoryName}>{category}</span>
              <span className={styles.categoryCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

AchievementStatsDisplay.displayName = 'AchievementStatsDisplay';

// 主要成就展示组件
export const AchievementDisplay = memo<AchievementDisplayProps>(({
  onAchievementClick,
  disabled = false,
  showProgress = true,
  showStats = true,
  className = '',
}) => {
  const [achievements, setAchievements] = useState<AchievementConfig[]>([]);
  const [progress, setProgress] = useState<Map<AchievementType, AchievementProgress>>(new Map());
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedRarity, setSelectedRarity] = useState<string>('全部');
  const [selectedStatus, setSelectedStatus] = useState<string>('全部');
  const [achievementManager] = useState(() => new AchievementManager());

  // 初始化成就数据
  useEffect(() => {
    const allAchievements = Object.values(AchievementType).map(type => 
      achievementManager.getAchievementConfig(type)
    ).filter(Boolean) as AchievementConfig[];
    
    setAchievements(allAchievements);
    
    const allProgress = new Map<AchievementType, AchievementProgress>();
    Object.values(AchievementType).forEach(type => {
      const progress = achievementManager.getAchievementProgress(type);
      if (progress) {
        allProgress.set(type, progress);
      }
    });
    setProgress(allProgress);
    
    const achievementStats = achievementManager.getAchievementStats();
    setStats(achievementStats);
  }, [achievementManager]);

  // 获取分类列表
  const categories = ['全部', ...Array.from(new Set(achievements.map(a => a.category)))];
  
  // 获取稀有度列表
  const rarities = ['全部', ...Object.values(AchievementRarity)];
  
  // 获取状态列表
  const statuses = ['全部', ...Object.values(AchievementStatus)];

  // 过滤成就
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== '全部' && achievement.category !== selectedCategory) return false;
    if (selectedRarity !== '全部' && achievement.rarity !== selectedRarity) return false;
    
    const progressData = progress.get(achievement.id);
    if (selectedStatus !== '全部' && progressData?.status !== selectedStatus) return false;
    
    return true;
  });

  // 处理成就点击
  const handleAchievementClick = useCallback((achievement: AchievementType) => {
    if (!disabled && onAchievementClick) {
      onAchievementClick(achievement);
    }
  }, [disabled, onAchievementClick]);

  // 处理分类筛选
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // 处理稀有度筛选
  const handleRarityChange = useCallback((rarity: string) => {
    setSelectedRarity(rarity);
  }, []);

  // 处理状态筛选
  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const containerClasses = [
    styles.achievementDisplay,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={styles.header}>
        <h2 className={styles.title}>成就系统</h2>
        <p className={styles.subtitle}>解锁成就，获得奖励</p>
      </div>

      {showStats && stats && (
        <AchievementStatsDisplay stats={stats} />
      )}

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>分类</label>
          <select 
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={disabled}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>稀有度</label>
          <select 
            className={styles.filterSelect}
            value={selectedRarity}
            onChange={(e) => handleRarityChange(e.target.value)}
            disabled={disabled}
          >
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>{rarity}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>状态</label>
          <select 
            className={styles.filterSelect}
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={disabled}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.achievementsGrid}>
        {filteredAchievements.map(achievement => {
          const progressData = progress.get(achievement.id);
          if (!progressData) return null;
          
          return (
            <AchievementCard
              key={achievement.id}
              config={achievement}
              progress={progressData}
              onClick={handleAchievementClick}
              disabled={disabled}
              showProgress={showProgress}
            />
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>没有找到符合条件的成就</p>
        </div>
      )}
    </div>
  );
});

AchievementDisplay.displayName = 'AchievementDisplay';

export default AchievementDisplay;
