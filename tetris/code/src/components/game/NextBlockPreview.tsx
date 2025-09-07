import React, { memo, useMemo } from 'react';
import { NextBlock, BlockShape } from '@/types';
import styles from './NextBlockPreview.module.css';

// 下一个方块预览属性
interface NextBlockPreviewProps {
  nextBlocks: NextBlock[];
  className?: string;
  showMultiple?: boolean;
  maxPreview?: number;
  size?: 'small' | 'medium' | 'large';
}

// 单个方块预览属性
interface BlockPreviewProps {
  block: NextBlock;
  size?: 'small' | 'medium' | 'large';
  index?: number;
}

// 获取方块形状的边界框
const getBlockBounds = (shape: BlockShape): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
} => {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 1) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return {
    minX: minX === Infinity ? 0 : minX,
    maxX: maxX === -Infinity ? 0 : maxX,
    minY: minY === Infinity ? 0 : minY,
    maxY: maxY === -Infinity ? 0 : maxY,
    width: maxX === -Infinity ? 0 : maxX - minX + 1,
    height: maxY === -Infinity ? 0 : maxY - minY + 1,
  };
};

// 单个方块预览组件
const BlockPreview = memo<BlockPreviewProps>(({ 
  block, 
  size = 'medium',
  index = 0
}) => {
  const { shape, color, isSpecial, specialType } = block;

  // 计算方块边界和偏移
  const bounds = useMemo(() => getBlockBounds(shape), [shape]);
  
  // 生成方块格子
  const cells = useMemo(() => {
    const cellData: Array<{
      x: number;
      y: number;
      filled: boolean;
      key: string;
    }> = [];

    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        const filled = shape[y] && shape[y][x] === 1;
        cellData.push({
          x: x - bounds.minX,
          y: y - bounds.minY,
          filled,
          key: `${x}-${y}`,
        });
      }
    }

    return cellData;
  }, [shape, bounds]);

  const previewClasses = [
    styles.blockPreview,
    styles[size],
    isSpecial && styles.special,
    specialType && styles[`special-${specialType}`],
    index > 0 && styles.secondary,
  ].filter(Boolean).join(' ');

  const previewStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${bounds.width}, 1fr)`,
    gridTemplateRows: `repeat(${bounds.height}, 1fr)`,
  };

  return (
    <div 
      className={previewClasses}
      style={previewStyle}
      data-block-type={block.type}
      data-special={isSpecial}
    >
      {cells.map(cell => (
        <div
          key={cell.key}
          className={`${styles.cell} ${cell.filled ? styles.filled : ''}`}
          style={{
            backgroundColor: cell.filled ? color : 'transparent',
            gridColumn: cell.x + 1,
            gridRow: cell.y + 1,
          }}
          data-filled={cell.filled}
        />
      ))}
      
      {/* 特殊方块图标 */}
      {isSpecial && (
        <div className={styles.specialIcon}>
          {specialType === 'BOMB' && '💣'}
          {specialType === 'LOCK' && '🔒'}
        </div>
      )}
    </div>
  );
});

BlockPreview.displayName = 'BlockPreview';

// 下一个方块预览组件
export const NextBlockPreview = memo<NextBlockPreviewProps>(({
  nextBlocks,
  className = '',
  showMultiple = true,
  maxPreview = 3,
  size = 'medium',
}) => {
  // 处理预览数据
  const previewBlocks = useMemo(() => {
    if (!nextBlocks || nextBlocks.length === 0) {
      return [];
    }

    const limit = showMultiple ? Math.min(maxPreview, nextBlocks.length) : 1;
    return nextBlocks.slice(0, limit);
  }, [nextBlocks, showMultiple, maxPreview]);

  if (previewBlocks.length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.header}>
          <h3>Next</h3>
        </div>
        <div className={styles.empty}>
          <span>无预览</span>
        </div>
      </div>
    );
  }

  const containerClasses = [
    styles.container,
    styles[size],
    showMultiple && styles.multiple,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={styles.header}>
        <h3>Next</h3>
        {showMultiple && previewBlocks.length > 1 && (
          <span className={styles.count}>({previewBlocks.length})</span>
        )}
      </div>
      
      <div className={styles.previewList}>
        {previewBlocks.map((block, index) => (
          <div 
            key={`${block.type}-${index}`}
            className={styles.previewItem}
            data-index={index}
          >
            <BlockPreview 
              block={block} 
              size={index === 0 ? size : 'small'}
              index={index}
            />
            
            {/* 显示方块类型名称 */}
            <div className={styles.blockInfo}>
              <span className={styles.blockType}>
                {block.type}
              </span>
              {block.isSpecial && (
                <span className={styles.specialLabel}>
                  Special
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

NextBlockPreview.displayName = 'NextBlockPreview';

export default NextBlockPreview;
