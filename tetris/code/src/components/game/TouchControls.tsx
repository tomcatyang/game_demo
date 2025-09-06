import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { GameInput } from '@/types';
import styles from './TouchControls.module.css';

// 触摸控制属性
interface TouchControlsProps {
  onInput: (input: GameInput) => void;
  disabled?: boolean;
  layout?: 'compact' | 'extended' | 'minimal';
  showLabels?: boolean;
  vibration?: boolean;
  className?: string;
}

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
const GESTURE_CONFIG = {
  SWIPE_THRESHOLD: 50,     // 滑动最小距离
  SWIPE_VELOCITY: 0.3,     // 滑动最小速度 (像素/毫秒)
  TAP_MAX_DURATION: 200,   // 点击最大持续时间
  TAP_MAX_DISTANCE: 10,    // 点击最大移动距离
  LONG_PRESS_DURATION: 500, // 长按持续时间
};

// 控制按钮组件
interface ControlButtonProps {
  icon: string;
  label?: string;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const ControlButton = memo<ControlButtonProps>(({
  icon,
  label,
  onPress,
  onLongPress,
  disabled = false,
  variant = 'secondary',
  size = 'medium',
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<number | null>(null);

  const handleTouchStart = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(true);
    
    // 震动反馈
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // 长按检测
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
        setIsPressed(false);
      }, GESTURE_CONFIG.LONG_PRESS_DURATION);
    }
  }, [disabled, onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(false);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      onPress();
    }
  }, [disabled, onPress]);

  const handleTouchCancel = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const buttonClasses = [
    styles.controlButton,
    styles[variant],
    styles[size],
    isPressed && styles.pressed,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchCancel}
      disabled={disabled}
      type="button"
    >
      <span className={styles.buttonIcon}>{icon}</span>
      {label && <span className={styles.buttonLabel}>{label}</span>}
    </button>
  );
});

ControlButton.displayName = 'ControlButton';

// 主要触摸控制组件
export const TouchControls = memo<TouchControlsProps>(({
  onInput,
  disabled = false,
  layout = 'extended',
  showLabels = false,
  vibration = true,
  className = '',
}) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const touchData = useRef<TouchData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 发送输入事件
  const sendInput = useCallback((input: GameInput) => {
    if (disabled) return;
    onInput(input);
    
    // 震动反馈
    if (vibration && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
  }, [onInput, disabled, vibration]);

  // 处理手势输入
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    touchData.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: Date.now(),
      isDragging: false,
    };
    
    setIsDragging(false);
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !touchData.current || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const data = touchData.current;
    
    data.currentX = touch.clientX;
    data.currentY = touch.clientY;
    
    const deltaX = data.currentX - data.startX;
    const deltaY = data.currentY - data.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > GESTURE_CONFIG.TAP_MAX_DISTANCE && !data.isDragging) {
      data.isDragging = true;
      setIsDragging(true);
    }
  }, [disabled]);

  const handleTouchEnd = useCallback(() => {
    if (disabled || !touchData.current) return;
    
    const data = touchData.current;
    const deltaX = data.currentX - data.startX;
    const deltaY = data.currentY - data.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - data.startTime;
    const velocity = distance / duration;
    
    // 点击检测
    if (!data.isDragging && 
        duration < GESTURE_CONFIG.TAP_MAX_DURATION && 
        distance < GESTURE_CONFIG.TAP_MAX_DISTANCE) {
      
      // 软降
      sendInput({ type: 'move', direction: 'down' });
    }
    // 滑动检测
    else if (data.isDragging && 
             distance >= GESTURE_CONFIG.SWIPE_THRESHOLD && 
             velocity >= GESTURE_CONFIG.SWIPE_VELOCITY) {
      
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
    // 长按检测
    else if (!data.isDragging && duration >= GESTURE_CONFIG.LONG_PRESS_DURATION) {
      sendInput({ type: 'pause' });
    }
    
    touchData.current = null;
    setIsDragging(false);
  }, [disabled, sendInput]);

  // 按钮操作
  const handleMove = useCallback((direction: 'left' | 'right' | 'down') => {
    sendInput({ type: 'move', direction });
  }, [sendInput]);

  const handleRotate = useCallback(() => {
    sendInput({ type: 'rotate' });
  }, [sendInput]);

  const handleDrop = useCallback(() => {
    sendInput({ type: 'drop' });
  }, [sendInput]);

  const handlePause = useCallback(() => {
    sendInput({ type: 'pause' });
  }, [sendInput]);

  const handleRestart = useCallback(() => {
    sendInput({ type: 'restart' });
  }, [sendInput]);

  const containerClasses = [
    styles.touchControls,
    styles[layout],
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');

  // 阻止默认的触摸行为
  useEffect(() => {
    const preventDefaultTouch = (e: TouchEvent) => {
      e.preventDefault();
    };

    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.addEventListener('touchstart', preventDefaultTouch, { passive: false });
      gameArea.addEventListener('touchmove', preventDefaultTouch, { passive: false });
      
      return () => {
        gameArea.removeEventListener('touchstart', preventDefaultTouch);
        gameArea.removeEventListener('touchmove', preventDefaultTouch);
      };
    }
  }, []);

  return (
    <div className={containerClasses}>
      {/* 手势区域 */}
      <div 
        ref={gameAreaRef}
        className={`${styles.gestureArea} ${isDragging ? styles.dragging : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className={styles.gestureHint}>
          <div className={styles.hintItem}>
            <span className={styles.hintIcon}>👆</span>
            <span className={styles.hintText}>点击: 软降</span>
          </div>
          <div className={styles.hintItem}>
            <span className={styles.hintIcon}>⬅️➡️</span>
            <span className={styles.hintText}>滑动: 移动</span>
          </div>
          <div className={styles.hintItem}>
            <span className={styles.hintIcon}>⬆️</span>
            <span className={styles.hintText}>上滑: 旋转</span>
          </div>
          <div className={styles.hintItem}>
            <span className={styles.hintIcon}>⬇️</span>
            <span className={styles.hintText}>下滑: 硬降</span>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      {layout !== 'minimal' && (
        <div className={styles.buttonArea}>
          {/* 移动按钮 */}
          <div className={styles.moveButtons}>
            <ControlButton
              icon="⬅️"
              label={showLabels ? "左" : undefined}
              onPress={() => handleMove('left')}
              variant="secondary"
              size={layout === 'compact' ? 'small' : 'medium'}
            />
            <ControlButton
              icon="⬇️"
              label={showLabels ? "降" : undefined}
              onPress={() => handleMove('down')}
              variant="secondary"
              size={layout === 'compact' ? 'small' : 'medium'}
            />
            <ControlButton
              icon="➡️"
              label={showLabels ? "右" : undefined}
              onPress={() => handleMove('right')}
              variant="secondary"
              size={layout === 'compact' ? 'small' : 'medium'}
            />
          </div>

          {/* 动作按钮 */}
          <div className={styles.actionButtons}>
            <ControlButton
              icon="🔄"
              label={showLabels ? "旋转" : undefined}
              onPress={handleRotate}
              variant="primary"
              size={layout === 'compact' ? 'small' : 'medium'}
            />
            <ControlButton
              icon="⬇️⬇️"
              label={showLabels ? "硬降" : undefined}
              onPress={handleDrop}
              variant="primary"
              size={layout === 'compact' ? 'small' : 'medium'}
            />
          </div>

          {/* 系统按钮 */}
          {layout === 'extended' && (
            <div className={styles.systemButtons}>
              <ControlButton
                icon="⏸️"
                label={showLabels ? "暂停" : undefined}
                onPress={handlePause}
                variant="secondary"
                size="small"
              />
              <ControlButton
                icon="🔄"
                label={showLabels ? "重启" : undefined}
                onPress={handleRestart}
                onLongPress={handleRestart}
                variant="danger"
                size="small"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

TouchControls.displayName = 'TouchControls';

export default TouchControls;
