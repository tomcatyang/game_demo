import { useCallback, useRef, useState, useEffect } from 'react';
import { GameInput } from '@/types';

// 触摸事件数据
interface TouchData {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  isDragging: boolean;
}

// 手势识别配置
interface GestureConfig {
  swipeThreshold: number;      // 滑动最小距离
  swipeVelocity: number;       // 滑动最小速度 (像素/毫秒)
  tapMaxDuration: number;      // 点击最大持续时间
  tapMaxDistance: number;      // 点击最大移动距离
  longPressDuration: number;   // 长按持续时间
  doubleTapDelay: number;      // 双击间隔时间
}

// 触摸控制配置
interface TouchControlsConfig {
  enabled: boolean;
  vibration: boolean;
  sensitivity: number;         // 灵敏度 (0.1-2.0)
  gestureConfig: GestureConfig;
}

// 默认配置
const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  swipeThreshold: 50,
  swipeVelocity: 0.3,
  tapMaxDuration: 200,
  tapMaxDistance: 10,
  longPressDuration: 500,
  doubleTapDelay: 300,
};

const DEFAULT_CONFIG: TouchControlsConfig = {
  enabled: true,
  vibration: true,
  sensitivity: 1.0,
  gestureConfig: DEFAULT_GESTURE_CONFIG,
};

// 触摸控制Hook
export const useTouchControls = (
  onInput: (input: GameInput) => void,
  config: Partial<TouchControlsConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const touchData = useRef<TouchData | null>(null);
  const lastTapTime = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);

  // 发送输入事件
  const sendInput = useCallback((input: GameInput) => {
    if (!finalConfig.enabled) return;
    
    onInput(input);
    
    // 震动反馈
    if (finalConfig.vibration && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
  }, [onInput, finalConfig.enabled, finalConfig.vibration]);

  // 处理手势输入
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!finalConfig.enabled || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const currentTime = Date.now();
    
    touchData.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: currentTime,
      isDragging: false,
    };
    
    setIsDragging(false);
    setIsLongPressing(false);
    
    // 长按检测
    const longPressTimer = setTimeout(() => {
      if (touchData.current && !touchData.current.isDragging) {
        setIsLongPressing(true);
        sendInput({ type: 'pause' });
      }
    }, finalConfig.gestureConfig.longPressDuration);
    
    // 清理定时器
    const cleanup = () => clearTimeout(longPressTimer);
    e.currentTarget.addEventListener('touchend', cleanup, { once: true });
    e.currentTarget.addEventListener('touchcancel', cleanup, { once: true });
  }, [finalConfig.enabled, finalConfig.gestureConfig.longPressDuration, sendInput]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!finalConfig.enabled || !touchData.current || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const data = touchData.current;
    
    data.currentX = touch.clientX;
    data.currentY = touch.clientY;
    
    const deltaX = data.currentX - data.startX;
    const deltaY = data.currentY - data.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 应用灵敏度
    const adjustedDistance = distance * finalConfig.sensitivity;
    
    if (adjustedDistance > finalConfig.gestureConfig.tapMaxDistance && !data.isDragging) {
      data.isDragging = true;
      setIsDragging(true);
    }
  }, [finalConfig.enabled, finalConfig.sensitivity, finalConfig.gestureConfig.tapMaxDistance]);

  const handleTouchEnd = useCallback((_e: React.TouchEvent) => {
    if (!finalConfig.enabled || !touchData.current) return;
    
    const data = touchData.current;
    const deltaX = data.currentX - data.startX;
    const deltaY = data.currentY - data.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - data.startTime;
    const velocity = distance / duration;
    
    // 应用灵敏度
    const adjustedDistance = distance * finalConfig.sensitivity;
    const adjustedVelocity = velocity * finalConfig.sensitivity;
    
    // 点击检测
    if (!data.isDragging && 
        duration < finalConfig.gestureConfig.tapMaxDuration && 
        adjustedDistance < finalConfig.gestureConfig.tapMaxDistance) {
      
      const currentTime = Date.now();
      const timeSinceLastTap = currentTime - lastTapTime.current;
      
      if (timeSinceLastTap < finalConfig.gestureConfig.doubleTapDelay) {
        // 双击 - 硬降
        sendInput({ type: 'drop' });
      } else {
        // 单击 - 软降
        sendInput({ type: 'move', direction: 'down' });
      }
      
      lastTapTime.current = currentTime;
    }
    // 滑动检测
    else if (data.isDragging && 
             adjustedDistance >= finalConfig.gestureConfig.swipeThreshold && 
             adjustedVelocity >= finalConfig.gestureConfig.swipeVelocity) {
      
      // 确定滑动方向
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 0) {
          sendInput({ type: 'move', direction: 'right' });
        } else {
          sendInput({ type: 'move', direction: 'left' });
        }
      } else {
        // 垂直滑动
        if (deltaY > 0) {
          // 向下滑动 - 硬降
          sendInput({ type: 'drop' });
        } else {
          // 向上滑动 - 旋转
          sendInput({ type: 'rotate' });
        }
      }
    }
    
    touchData.current = null;
    setIsDragging(false);
    setIsLongPressing(false);
  }, [finalConfig.enabled, finalConfig.sensitivity, finalConfig.gestureConfig, sendInput]);

  // 键盘事件处理（桌面端支持）
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!finalConfig.enabled) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        sendInput({ type: 'move', direction: 'left' });
        break;
      case 'ArrowRight':
        e.preventDefault();
        sendInput({ type: 'move', direction: 'right' });
        break;
      case 'ArrowDown':
        e.preventDefault();
        sendInput({ type: 'move', direction: 'down' });
        break;
      case 'ArrowUp':
        e.preventDefault();
        sendInput({ type: 'rotate' });
        break;
      case ' ':
        e.preventDefault();
        sendInput({ type: 'drop' });
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        sendInput({ type: 'pause' });
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        sendInput({ type: 'restart' });
        break;
    }
  }, [finalConfig.enabled, sendInput]);

  // 设置键盘事件监听
  useEffect(() => {
    if (!finalConfig.enabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [finalConfig.enabled, handleKeyDown]);

  // 触摸事件处理器
  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  };

  // 状态信息
  const state = {
    isDragging,
    isLongPressing,
    config: finalConfig,
  };

  return {
    touchHandlers,
    sendInput,
    state,
  };
};

// 触摸控制工具函数
export const createTouchControls = (
  onInput: (input: GameInput) => void,
  config?: Partial<TouchControlsConfig>
) => {
  return {
    useTouchControls: () => useTouchControls(onInput, config),
  };
};

// 手势识别工具
export const recognizeGesture = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration: number,
  config: GestureConfig
): 'tap' | 'double-tap' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'long-press' | 'none' => {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const velocity = distance / duration;
  
  // 长按检测
  if (duration >= config.longPressDuration && distance < config.tapMaxDistance) {
    return 'long-press';
  }
  
  // 点击检测
  if (duration < config.tapMaxDuration && distance < config.tapMaxDistance) {
    return 'tap';
  }
  
  // 滑动检测
  if (distance >= config.swipeThreshold && velocity >= config.swipeVelocity) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'swipe-right' : 'swipe-left';
    } else {
      return deltaY > 0 ? 'swipe-down' : 'swipe-up';
    }
  }
  
  return 'none';
};

// 触摸控制预设配置
export const TOUCH_PRESETS = {
  // 高灵敏度配置
  highSensitivity: {
    sensitivity: 1.5,
    gestureConfig: {
      ...DEFAULT_GESTURE_CONFIG,
      swipeThreshold: 30,
      swipeVelocity: 0.2,
    },
  },
  
  // 低灵敏度配置
  lowSensitivity: {
    sensitivity: 0.7,
    gestureConfig: {
      ...DEFAULT_GESTURE_CONFIG,
      swipeThreshold: 80,
      swipeVelocity: 0.5,
    },
  },
  
  // 移动端优化配置
  mobile: {
    sensitivity: 1.2,
    gestureConfig: {
      ...DEFAULT_GESTURE_CONFIG,
      swipeThreshold: 40,
      tapMaxDistance: 15,
      longPressDuration: 400,
    },
  },
  
  // 桌面端配置
  desktop: {
    sensitivity: 1.0,
    gestureConfig: {
      ...DEFAULT_GESTURE_CONFIG,
      swipeThreshold: 60,
      tapMaxDistance: 8,
    },
  },
} as const;

export default useTouchControls;