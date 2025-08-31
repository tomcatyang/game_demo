import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { 
  GameState, 
  Tetromino, 
  BOARD_WIDTH, 
  BOARD_HEIGHT,
  TETROMINO_COLORS 
} from './types';
import {
  createEmptyBoard,
  createRandomTetromino,
  rotateTetromino,
  isValidPosition,
  placeTetromino,
  clearLines,
  calculateScore,
  getDropSpeed
} from './gameLogic';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 0,
    lines: 0,
    isGameOver: false,
    isPaused: false
  });

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const initGame = useCallback(() => {
    const currentPiece = createRandomTetromino();
    const nextPiece = createRandomTetromino();
    
    setGameState({
      board: createEmptyBoard(),
      currentPiece,
      nextPiece,
      score: 0,
      level: 0,
      lines: 0,
      isGameOver: false,
      isPaused: false
    });
  }, []);

  const movePiece = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      const newPosition = {
        x: prev.currentPiece.position.x + dx,
        y: prev.currentPiece.position.y + dy
      };
      
      if (isValidPosition(prev.board, prev.currentPiece, newPosition)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: newPosition
          }
        };
      }
      
      return prev;
    });
  }, []);

  const rotatePiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      const rotated = rotateTetromino(prev.currentPiece);
      
      if (isValidPosition(prev.board, rotated, rotated.position)) {
        return {
          ...prev,
          currentPiece: rotated
        };
      }
      
      return prev;
    });
  }, []);

  const dropPiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      const newPosition = {
        x: prev.currentPiece.position.x,
        y: prev.currentPiece.position.y + 1
      };
      
      if (isValidPosition(prev.board, prev.currentPiece, newPosition)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: newPosition
          }
        };
      } else {
        // 方块落地
        const newBoard = placeTetromino(prev.board, prev.currentPiece);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10);
        const newScore = prev.score + calculateScore(linesCleared, prev.level);
        
        const nextPiece = createRandomTetromino();
        
        // 检查游戏结束
        if (!isValidPosition(clearedBoard, prev.nextPiece!, prev.nextPiece!.position)) {
          return {
            ...prev,
            board: clearedBoard,
            isGameOver: true,
            score: newScore,
            level: newLevel,
            lines: newLines
          };
        }
        
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: prev.nextPiece,
          nextPiece: nextPiece,
          score: newScore,
          level: newLevel,
          lines: newLines
        };
      }
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      let newY = prev.currentPiece.position.y;
      while (isValidPosition(prev.board, prev.currentPiece, { x: prev.currentPiece.position.x, y: newY + 1 })) {
        newY++;
      }
      
      const droppedPiece = {
        ...prev.currentPiece,
        position: { x: prev.currentPiece.position.x, y: newY }
      };
      
      const newBoard = placeTetromino(prev.board, droppedPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10);
      const newScore = prev.score + calculateScore(linesCleared, prev.level) + (newY - prev.currentPiece.position.y) * 2;
      
      const nextPiece = createRandomTetromino();
      
      if (!isValidPosition(clearedBoard, prev.nextPiece!, prev.nextPiece!.position)) {
        return {
          ...prev,
          board: clearedBoard,
          isGameOver: true,
          score: newScore,
          level: newLevel,
          lines: newLines
        };
      }
      
      return {
        ...prev,
        board: clearedBoard,
        currentPiece: prev.nextPiece,
        nextPiece: nextPiece,
        score: newScore,
        level: newLevel,
        lines: newLines
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotatePiece();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePiece, hardDrop, togglePause, gameState.isGameOver]);

  // 触摸控制
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          movePiece(1, 0);
        } else {
          movePiece(-1, 0);
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          hardDrop();
        } else {
          rotatePiece();
        }
      }
    }
    
    touchStartRef.current = null;
  };

  // 游戏循环
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused || !gameState.currentPiece) return;
    
    const speed = getDropSpeed(gameState.level);
    gameLoopRef.current = setTimeout(() => {
      dropPiece();
    }, speed);
    
    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameState, dropPiece]);

  // 初始化游戏
  useEffect(() => {
    initGame();
  }, [initGame]);

  const renderBoard = () => {
    const displayBoard = gameState.board.map(row => [...row]);
    
    // 绘制当前方块
    if (gameState.currentPiece) {
      const colorIndex = TETROMINO_COLORS.indexOf(gameState.currentPiece.color) + 1;
      for (let y = 0; y < gameState.currentPiece.shape.length; y++) {
        for (let x = 0; x < gameState.currentPiece.shape[y].length; x++) {
          if (gameState.currentPiece.shape[y][x]) {
            const boardY = gameState.currentPiece.position.y + y;
            const boardX = gameState.currentPiece.position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = colorIndex;
            }
          }
        }
      }
    }
    
    return displayBoard.map((row, y) => (
      <div key={y} className="board-row">
        {row.map((cell, x) => (
          <div
            key={x}
            className={`board-cell ${cell ? 'filled' : ''}`}
            style={{
              backgroundColor: cell ? TETROMINO_COLORS[cell - 1] : 'transparent'
            }}
          />
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    if (!gameState.nextPiece) return null;
    
    return (
      <div className="next-piece">
        {gameState.nextPiece.shape.map((row, y) => (
          <div key={y} className="next-piece-row">
            {row.map((cell, x) => (
              <div
                key={x}
                className={`next-piece-cell ${cell ? 'filled' : ''}`}
                style={{
                  backgroundColor: cell ? gameState.nextPiece!.color : 'transparent'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* 顶部信息栏 */}
      <div className="top-info">
        <div className="score-section">
          <div className="score-item">
            <span className="label">分数</span>
            <span className="value">{gameState.score}</span>
          </div>
          <div className="score-item">
            <span className="label">等级</span>
            <span className="value">{gameState.level}</span>
          </div>
          <div className="score-item">
            <span className="label">行数</span>
            <span className="value">{gameState.lines}</span>
          </div>
        </div>
        
        <div className="next-section">
          <div className="label">下一个</div>
          {renderNextPiece()}
        </div>
      </div>

      <div className="game-container">
        <div className="game-board">
          {renderBoard()}
        </div>
        
        <div className="game-controls desktop-only">
          <div className="controls">
            <button onClick={togglePause} className="control-btn">
              {gameState.isPaused ? '继续' : '暂停'}
            </button>
            <button onClick={initGame} className="control-btn">
              重新开始
            </button>
          </div>
        </div>
      </div>
      
      {/* 移动端虚拟控制键 - 一行布局 */}
      <div className="mobile-controls">
        <div className="row-layout">
          <button 
            className="virtual-btn move-btn"
            onTouchStart={(e) => { 
              e.preventDefault(); 
              e.stopPropagation();
              movePiece(-1, 0); 
            }}
          >
            ←
          </button>
          <button 
            className="virtual-btn rotate-btn"
            onTouchStart={(e) => { 
              e.preventDefault(); 
              e.stopPropagation();
              rotatePiece(); 
            }}
          >
            ↻
          </button>
          <button 
            className="virtual-btn drop-btn"
            onTouchStart={(e) => { 
              e.preventDefault(); 
              e.stopPropagation();
              hardDrop(); 
            }}
          >
            ↓
          </button>
          <button 
            className="virtual-btn move-btn"
            onTouchStart={(e) => { 
              e.preventDefault(); 
              e.stopPropagation();
              movePiece(1, 0); 
            }}
          >
            →
          </button>
        </div>
        
        {/* 移动端控制按钮 */}
        {/* <div className="mobile-game-controls">
          <button onClick={togglePause} className="mobile-control-btn">
            {gameState.isPaused ? '继续' : '暂停'}
          </button>
          <button onClick={initGame} className="mobile-control-btn">
            重新开始
          </button>
        </div> */}
      </div>
      
      {gameState.isGameOver && (
        <div className="game-over">
          <div className="game-over-content">
            <h2>游戏结束</h2>
            <p>最终分数: {gameState.score}</p>
            <button onClick={initGame} className="restart-btn">
              重新开始
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default App;