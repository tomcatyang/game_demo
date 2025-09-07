import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SettingsPanel, GameSettings } from './SettingsPanel';

interface SettingsContextType {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetSettings: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  isSettingsOpen: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
  onSettingsChange?: (settings: GameSettings) => void;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  onSettingsChange
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  // 保存设置到localStorage
  useEffect(() => {
    localStorage.setItem('tetris-settings', JSON.stringify(settings));
  }, [settings]);

  // 通知外部组件设置变化
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

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
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    openSettings,
    closeSettings,
    isSettingsOpen
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        onSettingsChange={updateSettings}
      />
    </SettingsContext.Provider>
  );
};

// 设置按钮组件
interface SettingsButtonProps {
  className?: string;
  children?: ReactNode;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  className = '',
  children
}) => {
  const { openSettings } = useSettings();

  return (
    <button
      className={`settings-button ${className}`}
      onClick={openSettings}
      title="打开设置"
    >
      {children || '⚙️ 设置'}
    </button>
  );
};

// 设置状态指示器组件
export const SettingsStatus: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="settings-status">
      <div className="status-item">
        <span className="status-label">游戏模式:</span>
        <span className="status-value">{settings.gameMode}</span>
      </div>
      <div className="status-item">
        <span className="status-label">难度:</span>
        <span className="status-value">{settings.difficulty}</span>
      </div>
      <div className="status-item">
        <span className="status-label">主题:</span>
        <span className="status-value">{settings.theme}</span>
      </div>
      <div className="status-item">
        <span className="status-label">音效:</span>
        <span className="status-value">{settings.audioEnabled ? '开启' : '关闭'}</span>
      </div>
    </div>
  );
};

// 设置快捷键处理
export const useSettingsShortcuts = () => {
  const { openSettings, closeSettings, isSettingsOpen } = useSettings();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + , 打开设置
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault();
        if (isSettingsOpen) {
          closeSettings();
        } else {
          openSettings();
        }
      }

      // ESC 关闭设置
      if (event.key === 'Escape' && isSettingsOpen) {
        closeSettings();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSettings, closeSettings, isSettingsOpen]);
};

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
