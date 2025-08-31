import React, { memo, useMemo } from 'react';
import { GameBoard as GameBoardType, Block, Position } from '@/types';
import styles from './GameBoard.module.css';

// 游戏板属性接口
interface GameBoardProps {
  board: GameBoardType;
  currentBlock?: Block | null;
  ghostBlock?: Block | null;
  className?: string;
  showGrid?: boolean;
  showGhost?: boolean;
  animationSpeed?: number;
}

// 格子组件属性
interface CellProps {
  filled: boolean;
  color: string;
  isGhost?: boolean;
  isCurrent?: boolean;
  isSpecial?: boolean;
  specialType?: string;
  x: number;
  y: number;
}

// 格子组件
const Cell = memo<CellProps>(({ 
  filled, 
  color, 
  isGhost = false, 
  isCurrent = false, 
  isSpecial = false,
  specialType,
  x,
  y
}) => {
  const cellClasses = [
    styles.cell,
    filled && styles.filled,
    isGhost && styles.ghost,
    isCurrent && styles.current,
    isSpecial && styles.special,
    specialType && styles[`special-${specialType}`],
  ].filter(Boolean).join(' ');

  const cellStyle: React.CSSProperties = {
    backgroundColor: filled ? color : 'transparent',
    gridColumn: x + 1,
    gridRow: y + 1,
  };

  return (
    <div 
      className={cellClasses}
      style={cellStyle}
      data-x={x}
      data-y={y}
      data-filled={filled}
      data-ghost={isGhost}
      data-current={isCurrent}
    />
  );
});

Cell.displayName = 'Cell';

// 获取方块占用的位置
const getBlockPositions = (block: Block): Position[] => {
  if (!block || !block.rotation.shapes[block.rotation.current]) {
    return [];
  }

  const shape = block.rotation.shapes[block.rotation.current];
  const positions: Position[] = [];
  const { x, y } = block.position;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 1) {
        positions.push({
          x: x + col,
          y: y + row,
        });
      }
    }
  }

  return positions;
};

// 游戏板组件
export const GameBoard = memo<GameBoardProps>(({
  board,
  currentBlock,
  ghostBlock,
  className = '',
  showGrid = true,
  showGhost = true,
  animationSpeed = 300,
}) => {
  // 计算当前方块位置
  const currentBlockPositions = useMemo(() => {
    return currentBlock ? getBlockPositions(currentBlock) : [];
  }, [currentBlock]);

  // 计算幽灵方块位置
  const ghostBlockPositions = useMemo(() => {
    return ghostBlock && showGhost ? getBlockPositions(ghostBlock) : [];
  }, [ghostBlock, showGhost]);

  // 生成格子数据
  const cells = useMemo(() => {
    const cellData: Array<{
      x: number;
      y: number;
      filled: boolean;
      color: string;
      isGhost: boolean;
      isCurrent: boolean;
      isSpecial: boolean;
      specialType?: string;
    }> = [];

    // 遍历游戏板
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const cell = board.grid[y][x];
        const isCurrentBlock = currentBlockPositions.some(pos => pos.x === x && pos.y === y);
        const isGhostBlock = ghostBlockPositions.some(pos => pos.x === x && pos.y === y);

        // 确定格子状态
        let filled = cell.filled;
        let color = cell.color || 'transparent';
        let isSpecial = cell.isSpecial || false;
        let specialType = cell.specialType;

        // 当前方块覆盖
        if (isCurrentBlock && currentBlock) {
          filled = true;
          color = currentBlock.color;
          isSpecial = currentBlock.isSpecial;
          specialType = currentBlock.specialType;
        }

        cellData.push({
          x,
          y,
          filled,
          color,
          isGhost: isGhostBlock && !isCurrentBlock && !cell.filled,
          isCurrent: isCurrentBlock,
          isSpecial,
          specialType,
        });
      }
    }

    return cellData;
  }, [board, currentBlockPositions, ghostBlockPositions, currentBlock]);

  const boardClasses = [
    styles.gameBoard,
    showGrid && styles.showGrid,
    className,
  ].filter(Boolean).join(' ');

  const boardStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${board.width}, 1fr)`,
    gridTemplateRows: `repeat(${board.height}, 1fr)`,
    '--animation-speed': `${animationSpeed}ms`,
  } as React.CSSProperties & { '--animation-speed': string };

  return (
    <div 
      className={boardClasses}
      style={boardStyle}
      data-width={board.width}
      data-height={board.height}
    >
      {cells.map(cell => (
        <Cell
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          filled={cell.filled}
          color={cell.color}
          isGhost={cell.isGhost}
          isCurrent={cell.isCurrent}
          isSpecial={cell.isSpecial}
          specialType={cell.specialType}
        />
      ))}
    </div>
  );
});

GameBoard.displayName = 'GameBoard';

export default GameBoard;
