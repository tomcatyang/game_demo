import React, { useState, useEffect } from 'react';
import { GameModeSelector } from './GameModeSelector';
import { ThemeSelector } from './ThemeSelector';
import { AudioSettings } from './AudioSettings';
import { AchievementDisplay } from './AchievementDisplay';
import styles from './SettingsPanel.module.css';

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: GameSettings) => void;
}

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

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onSettingsChange
}) => {
  const [activeTab, setActiveTab] = useState<string>('game');
  const [settings, setSettings] = useState<GameSettings>({
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

  // 加载保存的设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('tetris-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.warn('Failed to load settings:', error);
      }
    }
  }, []);

  // 保存设置
  const saveSettings = (newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('tetris-settings', JSON.stringify(updatedSettings));
    onSettingsChange?.(updatedSettings);
  };

  // 重置设置
  const resetSettings = () => {
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
    setSettings(defaultSettings);
    localStorage.setItem('tetris-settings', JSON.stringify(defaultSettings));
    onSettingsChange?.(defaultSettings);
  };

  // 导出设置
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tetris-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // 导入设置
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(prev => ({ ...prev, ...importedSettings }));
        localStorage.setItem('tetris-settings', JSON.stringify(importedSettings));
        onSettingsChange?.(importedSettings);
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert('设置文件格式错误，请选择正确的设置文件');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'game', label: '游戏设置', icon: '🎮' },
    { id: 'theme', label: '主题设置', icon: '🎨' },
    { id: 'audio', label: '音效设置', icon: '🔊' },
    { id: 'achievements', label: '成就系统', icon: '🏆' },
    { id: 'data', label: '数据管理', icon: '💾' }
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>游戏设置</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {activeTab === 'game' && (
            <div className={styles.tabContent}>
              <GameModeSelector
                onModeChange={(mode, difficulty) => saveSettings({ 
                  gameMode: mode,
                  difficulty: difficulty
                })}
                onConfigChange={(config) => saveSettings({
                  enableSpecialBlocks: config.enableSpecialBlocks,
                  enableCombo: config.enableCombo
                })}
              />
            </div>
          )}

          {activeTab === 'theme' && (
            <div className={styles.tabContent}>
              <ThemeSelector
                onThemeChange={(theme) => saveSettings({ theme: theme })}
              />
            </div>
          )}

          {activeTab === 'audio' && (
            <div className={styles.tabContent}>
              <AudioSettings
                onConfigChange={(config) => saveSettings({
                  audioEnabled: config.enabled,
                  musicVolume: config.musicVolume,
                  soundVolume: config.sfxVolume
                })}
              />
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className={styles.tabContent}>
              <AchievementDisplay />
            </div>
          )}

          {activeTab === 'data' && (
            <div className={styles.tabContent}>
              <div className={styles.dataManagement}>
                <h3>数据管理</h3>
                <div className={styles.dataActions}>
                  <button className={styles.actionButton} onClick={exportSettings}>
                    📤 导出设置
                  </button>
                  <label className={styles.actionButton}>
                    📥 导入设置
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button className={styles.actionButton} onClick={resetSettings}>
                    🔄 重置设置
                  </button>
                </div>
                <div className={styles.dataInfo}>
                  <p>设置数据将保存在本地浏览器中</p>
                  <p>导出设置可以备份您的游戏配置</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.saveButton} onClick={onClose}>
            保存并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
