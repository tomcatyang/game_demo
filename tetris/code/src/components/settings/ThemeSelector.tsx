import React, { memo, useState, useEffect, useCallback } from 'react';
import { ThemeType, ThemeManager, ThemeConfig } from '@/services/ThemeManager';
import styles from './ThemeSelector.module.css';

// 主题选择器属性
interface ThemeSelectorProps {
  onThemeChange?: (theme: ThemeType, config: ThemeConfig) => void;
  disabled?: boolean;
  showPreview?: boolean;
  showCustomThemes?: boolean;
  className?: string;
}

// 主题卡片组件
interface ThemeCardProps {
  theme: ThemeConfig;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (theme: ThemeType | string) => void;
  onPreview?: (theme: ThemeType | string) => void;
  showPreview?: boolean;
}

const ThemeCard = memo<ThemeCardProps>(({
  theme,
  isSelected,
  isDisabled,
  onSelect,
  onPreview,
  showPreview = true,
}) => {
  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onSelect(theme.id);
    }
  }, [theme.id, isDisabled, onSelect]);

  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDisabled && onPreview) {
      onPreview(theme.id);
    }
  }, [theme.id, isDisabled, onPreview]);

  const cardClasses = [
    styles.themeCard,
    isSelected && styles.selected,
    isDisabled && styles.disabled,
    theme.isCustom && styles.custom,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      style={{ '--theme-primary': theme.colors.primary } as React.CSSProperties}
    >
      <div className={styles.themeHeader}>
        <div className={styles.themeIcon}>{theme.icon}</div>
        <div className={styles.themeInfo}>
          <h3 className={styles.themeName}>{theme.name}</h3>
          <p className={styles.themeDescription}>{theme.description}</p>
          {theme.isCustom && (
            <span className={styles.customBadge}>自定义</span>
          )}
        </div>
      </div>

      {showPreview && (
        <div className={styles.themePreview}>
          <div className={styles.previewColors}>
            <div 
              className={styles.colorSwatch}
              style={{ backgroundColor: theme.colors.primary }}
              title="主色"
            />
            <div 
              className={styles.colorSwatch}
              style={{ backgroundColor: theme.colors.secondary }}
              title="次色"
            />
            <div 
              className={styles.colorSwatch}
              style={{ backgroundColor: theme.colors.accent }}
              title="强调色"
            />
            <div 
              className={styles.colorSwatch}
              style={{ backgroundColor: theme.colors.background }}
              title="背景色"
            />
            <div 
              className={styles.colorSwatch}
              style={{ backgroundColor: theme.colors.surface }}
              title="表面色"
            />
          </div>
          
          <div className={styles.previewBlocks}>
            {Object.entries(theme.blockColors).slice(0, 4).map(([blockType, color]) => (
              <div
                key={blockType}
                className={styles.blockPreview}
                style={{ backgroundColor: color }}
                title={`${blockType} 方块`}
              />
            ))}
          </div>
        </div>
      )}

      <div className={styles.themeActions}>
        {showPreview && (
          <button
            className={styles.previewButton}
            onClick={handlePreview}
            disabled={isDisabled}
            title="预览主题"
          >
            👁️
          </button>
        )}
        
        {theme.isCustom && (
          <button
            className={styles.editButton}
            onClick={(e) => {
              e.stopPropagation();
              // TODO: 实现编辑功能
            }}
            disabled={isDisabled}
            title="编辑主题"
          >
            ✏️
          </button>
        )}
      </div>
    </div>
  );
});

ThemeCard.displayName = 'ThemeCard';

// 主题预览组件
interface ThemePreviewProps {
  theme: ThemeConfig;
  visible: boolean;
  onClose: () => void;
}

const ThemePreview = memo<ThemePreviewProps>(({
  theme,
  visible,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div className={styles.previewOverlay} onClick={onClose}>
      <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.previewHeader}>
          <h3 className={styles.previewTitle}>{theme.name} 预览</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.previewContent}>
          <div className={styles.previewDemo}>
            <div className={styles.demoCard} style={{ backgroundColor: theme.colors.surface }}>
              <h4 style={{ color: theme.colors.text.primary }}>示例标题</h4>
              <p style={{ color: theme.colors.text.secondary }}>这是一段示例文本，用于展示主题效果。</p>
              <div className={styles.demoButtons}>
                <button 
                  className={styles.demoButton}
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.background
                  }}
                >
                  主要按钮
                </button>
                <button 
                  className={styles.demoButton}
                  style={{ 
                    backgroundColor: theme.colors.secondary,
                    color: theme.colors.background
                  }}
                >
                  次要按钮
                </button>
              </div>
            </div>
          </div>
          
          <div className={styles.previewBlocks}>
            <h4 style={{ color: theme.colors.text.primary }}>方块颜色</h4>
            <div className={styles.blockGrid}>
              {Object.entries(theme.blockColors).map(([blockType, color]) => (
                <div key={blockType} className={styles.blockItem}>
                  <div 
                    className={styles.blockColor}
                    style={{ backgroundColor: color }}
                  />
                  <span style={{ color: theme.colors.text.secondary }}>
                    {blockType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ThemePreview.displayName = 'ThemePreview';

// 主要主题选择器组件
export const ThemeSelector = memo<ThemeSelectorProps>(({
  onThemeChange,
  disabled = false,
  showPreview = true,
  showCustomThemes = true,
  className = '',
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(ThemeType.LIGHT);
  const [availableThemes, setAvailableThemes] = useState<ThemeConfig[]>([]);
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [themeManager] = useState(() => new ThemeManager());

  // 初始化主题数据
  useEffect(() => {
    const themes = themeManager.getAvailableThemes();
    setAvailableThemes(themes);
    setSelectedTheme(themeManager.getCurrentTheme());
  }, [themeManager]);

  // 处理主题选择
  const handleThemeSelect = useCallback((theme: ThemeType | string) => {
    if (disabled) return;
    
    const success = themeManager.setTheme(theme);
    if (success) {
      setSelectedTheme(theme as ThemeType);
      const config = themeManager.getThemeConfig(theme);
      if (config) {
        onThemeChange?.(theme as ThemeType, config);
      }
    }
  }, [disabled, themeManager, onThemeChange]);

  // 处理主题预览
  const handleThemePreview = useCallback((theme: ThemeType | string) => {
    if (disabled) return;
    
    const config = themeManager.getThemeConfig(theme);
    if (config) {
      setPreviewTheme(config);
      setShowPreviewModal(true);
    }
  }, [disabled, themeManager]);

  // 关闭预览
  const handleClosePreview = useCallback(() => {
    setShowPreviewModal(false);
    setPreviewTheme(null);
  }, []);

  // 切换主题
  const handleToggleTheme = useCallback(() => {
    if (disabled) return;
    
    const newTheme = themeManager.toggleTheme();
    setSelectedTheme(newTheme);
    const config = themeManager.getThemeConfig(newTheme);
    if (config) {
      onThemeChange?.(newTheme, config);
    }
  }, [disabled, themeManager, onThemeChange]);

  // 跟随系统主题
  const handleFollowSystem = useCallback(() => {
    if (disabled) return;
    
    themeManager.followSystemTheme();
    setSelectedTheme(themeManager.getCurrentTheme());
    const config = themeManager.getCurrentThemeConfig();
    onThemeChange?.(themeManager.getCurrentTheme(), config);
  }, [disabled, themeManager, onThemeChange]);

  // 过滤主题
  const filteredThemes = availableThemes.filter(theme => 
    showCustomThemes || !theme.isCustom
  );

  const containerClasses = [
    styles.themeSelector,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={styles.header}>
        <h2 className={styles.title}>选择主题</h2>
        <p className={styles.subtitle}>选择你喜欢的颜色主题</p>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.toggleButton}
          onClick={handleToggleTheme}
          disabled={disabled}
        >
          🔄 切换主题
        </button>
        <button
          className={styles.systemButton}
          onClick={handleFollowSystem}
          disabled={disabled}
        >
          🌐 跟随系统
        </button>
      </div>

      <div className={styles.themeGrid}>
        {filteredThemes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={selectedTheme === theme.id}
            isDisabled={disabled || !theme.enabled}
            onSelect={handleThemeSelect}
            onPreview={handleThemePreview}
            showPreview={showPreview}
          />
        ))}
      </div>

      {showCustomThemes && (
        <div className={styles.customSection}>
          <h3 className={styles.sectionTitle}>自定义主题</h3>
          <p className={styles.sectionDescription}>
            创建你自己的主题，或导入其他主题配置
          </p>
          <div className={styles.customActions}>
            <button
              className={styles.createButton}
              disabled={disabled}
              onClick={() => {
                // TODO: 实现创建自定义主题功能
              }}
            >
              ➕ 创建主题
            </button>
            <button
              className={styles.importButton}
              disabled={disabled}
              onClick={() => {
                // TODO: 实现导入主题功能
              }}
            >
              📁 导入主题
            </button>
          </div>
        </div>
      )}

      {previewTheme && (
        <ThemePreview
          theme={previewTheme}
          visible={showPreviewModal}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
});

ThemeSelector.displayName = 'ThemeSelector';

export default ThemeSelector;
