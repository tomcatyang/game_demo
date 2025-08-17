import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';

// 根据设备调整游戏板大小
const getAdaptiveBoardSize = () => {
  // 检测是否为移动设备
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobile = mobileRegex.test(userAgent);
  
  // 小屏幕设备使用较小的游戏板
  if (isMobile) {
    if (window.innerWidth < 360) {
      return 10; // 非常小的屏幕
    } else if (window.innerWidth < 480) {
      return 12; // 小屏幕
    } else {
      return 15; // 中等屏幕
    }
  }
  
  return 20; // 桌面设备使用标准大小
};

const BOARD_SIZE = getAdaptiveBoardSize();
const INITIAL_SNAKE = [{ x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) }];
const INITIAL_FOODS = [
  { x: Math.floor(BOARD_SIZE * 0.75), y: Math.floor(BOARD_SIZE * 0.75), id: 1 },
  { x: Math.floor(BOARD_SIZE * 0.25), y: Math.floor(BOARD_SIZE * 0.25), id: 2 },
  { x: Math.floor(BOARD_SIZE * 0.9), y: Math.floor(BOARD_SIZE * 0.4), id: 3 }
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [foods, setFoods] = useState(INITIAL_FOODS);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(200); // 默认速度200ms
  const [playerName, setPlayerName] = useState('');
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [boardSize, setBoardSize] = useState(BOARD_SIZE);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  // 获取本地存储的得分记录
  const getScoreRecords = () => {
    const records = localStorage.getItem('snakeGameScores');
    return records ? JSON.parse(records) : [];
  };

  // 保存得分记录到本地存储
  const saveScoreRecord = (name, score, speed) => {
    const records = getScoreRecords();
    const speedText = speed === 300 ? '慢速' : speed === 200 ? '中速' : speed === 120 ? '快速' : '极速';
    const newRecord = {
      id: Date.now(),
      name: name.trim() || '匿名玩家',
      score,
      speed: speedText,
      date: new Date().toLocaleDateString('zh-CN')
    };
    
    records.push(newRecord);
    // 按分数降序排列，保留前10名
    records.sort((a, b) => b.score - a.score);
    const topRecords = records.slice(0, 10);
    
    localStorage.setItem('snakeGameScores', JSON.stringify(topRecords));
  };

  const generateFood = useCallback((excludePositions = [], currentBoardSize = boardSize) => {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const newFood = {
        x: Math.floor(Math.random() * currentBoardSize),
        y: Math.floor(Math.random() * currentBoardSize),
        id: Date.now() + Math.random()
      };
      
      const isPositionSafe = !excludePositions.some(pos => pos.x === newFood.x && pos.y === newFood.y);
      
      if (isPositionSafe) {
        return newFood;
      }
      
      attempts++;
    }
    
    // 如果找不到安全位置，返回一个随机位置
    return {
      x: Math.floor(Math.random() * currentBoardSize),
      y: Math.floor(Math.random() * currentBoardSize),
      id: Date.now() + Math.random()
    };
  }, [boardSize]);

  const resetGame = useCallback((newBoardSize = boardSize) => {
    // 根据当前游戏板大小创建初始蛇和食物
    const initialSnake = [{ 
      x: Math.floor(newBoardSize / 2), 
      y: Math.floor(newBoardSize / 2) 
    }];
    
    const initialFoods = [
      { x: Math.floor(newBoardSize * 0.75), y: Math.floor(newBoardSize * 0.75), id: 1 },
      { x: Math.floor(newBoardSize * 0.25), y: Math.floor(newBoardSize * 0.25), id: 2 },
      { x: Math.floor(newBoardSize * 0.9), y: Math.floor(newBoardSize * 0.4), id: 3 }
    ];
    
    setSnake(initialSnake);
    setFoods(initialFoods);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
    setShowNameInput(false);
    setShowScoreBoard(false);
    setPlayerName('');
  }, [boardSize]);

  const handleSaveScore = () => {
    if (score > 0) {
      saveScoreRecord(playerName, score, gameSpeed);
    }
    setShowNameInput(false);
    setPlayerName('');
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const moveSnake = useCallback(() => {
    if (!gameStarted || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // 检查撞墙
      if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
        setGameOver(true);
        setShowNameInput(true);
        return currentSnake;
      }

      // 检查撞到自己
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setShowNameInput(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // 检查是否吃到食物
      const eatenFoodIndex = foods.findIndex(food => food.x === head.x && food.y === head.y);
      
      if (eatenFoodIndex !== -1) {
        setScore(prev => prev + 10);
        // 移除被吃掉的食物，生成新的食物
        setFoods(currentFoods => {
          const newFoods = [...currentFoods];
          const excludePositions = [...newSnake, ...newFoods.filter((_, index) => index !== eatenFoodIndex)];
          newFoods[eatenFoodIndex] = generateFood(excludePositions);
          return newFoods;
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, foods, gameStarted, gameOver, generateFood, boardSize]);

  // 键盘控制
  const handleKeyPress = useCallback((e) => {
    if (!gameStarted) return;

    switch (e.key) {
      case 'ArrowUp':
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      default:
        break;
    }
  }, [direction, gameStarted]);

  // 触摸控制
  const handleTouchStart = useCallback((e) => {
    if (!gameStarted) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, [gameStarted]);
  
  const handleTouchMove = useCallback((e) => {
    if (!gameStarted) return;
    e.preventDefault(); // 防止页面滚动
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // 确定主要的移动方向（水平或垂直）
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平移动
      if (deltaX > 30) {
        // 向右滑动
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
      } else if (deltaX < -30) {
        // 向左滑动
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
      }
    } else {
      // 垂直移动
      if (deltaY > 30) {
        // 向下滑动
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
      } else if (deltaY < -30) {
        // 向上滑动
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
      }
    }
    
    // 更新触摸起始点，使滑动更流畅
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, [direction, gameStarted, touchStart]);

  // 处理虚拟方向键点击
  const handleDirectionButtonClick = useCallback((newDirection) => {
    if (!gameStarted || gameOver) return;
    
    switch (newDirection) {
      case 'up':
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case 'down':
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case 'left':
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case 'right':
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      default:
        break;
    }
  }, [direction, gameStarted, gameOver]);

  // 检测移动设备和屏幕尺寸变化
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent));
      
      // 根据屏幕大小调整游戏板尺寸
      const newBoardSize = getAdaptiveBoardSize();
      if (newBoardSize !== boardSize) {
        setBoardSize(newBoardSize);
        // 重置游戏状态
        if (!gameStarted) {
          resetGame(newBoardSize);
        }
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [boardSize, gameStarted, resetGame]);

  // 添加键盘事件监听
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
  
  // 添加触摸事件监听
  useEffect(() => {
    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
      gameBoard.addEventListener('touchstart', handleTouchStart);
      gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
      
      return () => {
        gameBoard.removeEventListener('touchstart', handleTouchStart);
        gameBoard.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [handleTouchStart, handleTouchMove]);

  // 游戏循环
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, gameSpeed]);

  const renderBoard = () => {
    const board = [];
    const foodColors = ['', 'food-red', 'food-purple', 'food-green'];
    
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        let cellClass = 'cell';
        
        if (snake.some(segment => segment.x === x && segment.y === y)) {
          cellClass += ' snake';
          if (snake[0].x === x && snake[0].y === y) {
            cellClass += ' head';
          }
        } else {
          const foodIndex = foods.findIndex(food => food.x === x && food.y === y);
          if (foodIndex !== -1) {
            cellClass += ' food';
            // 为不同的食物添加不同颜色类
            if (foodColors[foodIndex]) {
              cellClass += ` ${foodColors[foodIndex]}`;
            }
          }
        }

        board.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
          />
        );
      }
    }
    return board;
  };

  return (
    <div className="snake-game">
      <div className="game-header">
        <h1>🐍 贪吃蛇游戏</h1>
        <div className="score">得分: {score}</div>
      </div>
      
      <div 
        className="game-board"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, minmax(15px, 25px))`,
          gridTemplateRows: `repeat(${boardSize}, minmax(15px, 25px))`
        }}
      >
        {renderBoard()}
        
        {!gameStarted && !gameOver && (
          <div className="game-overlay">
            <div className="speed-selection">
              <h3>选择游戏速度</h3>
              <div className="speed-buttons">
                <button 
                  className={`speed-btn ${gameSpeed === 300 ? 'active' : ''}`}
                  onClick={() => setGameSpeed(300)}
                >
                  🐌 慢速
                </button>
                <button 
                  className={`speed-btn ${gameSpeed === 200 ? 'active' : ''}`}
                  onClick={() => setGameSpeed(200)}
                >
                  🚶 中速
                </button>
                <button 
                  className={`speed-btn ${gameSpeed === 120 ? 'active' : ''}`}
                  onClick={() => setGameSpeed(120)}
                >
                  🏃 快速
                </button>
                <button 
                  className={`speed-btn ${gameSpeed === 80 ? 'active' : ''}`}
                  onClick={() => setGameSpeed(80)}
                >
                  🚀 极速
                </button>
              </div>
            </div>
            <div className="start-buttons">
              <button onClick={startGame} className="start-button">
                🎮 开始游戏
              </button>
              <button onClick={() => setShowScoreBoard(true)} className="scoreboard-button">
                🏆 排行榜
              </button>
            </div>
            <div className="instructions">
              {isMobile ? 
                "滑动屏幕或使用下方虚拟按键控制蛇的移动" : 
                "使用方向键 ↑↓←→ 控制蛇的移动"
              }
            </div>
          </div>
        )}

        {gameOver && !showScoreBoard && (
          <div className="game-overlay">
            {showNameInput ? (
              <div className="name-input-section">
                <h2>🎉 恭喜！</h2>
                <p>你的得分: {score}</p>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="请输入你的姓名"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveScore()}
                    className="name-input"
                    maxLength={10}
                  />
                  <button onClick={handleSaveScore} className="save-button">
                    💾 保存记录
                  </button>
                </div>
                <button onClick={() => setShowNameInput(false)} className="skip-button">
                  跳过保存
                </button>
              </div>
            ) : (
              <div className="game-over">
                <h2>💀 游戏结束!</h2>
                <p>最终得分: {score}</p>
                <div className="game-over-buttons">
                  <button onClick={() => resetGame()} className="restart-button">
                    🔄 重新开始
                  </button>
                  <button onClick={() => setShowScoreBoard(true)} className="scoreboard-button">
                    🏆 查看排行榜
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showScoreBoard && (
          <div className="game-overlay">
            <div className="scoreboard">
              <h2>🏆 排行榜</h2>
              <div className="score-list">
                {getScoreRecords().length === 0 ? (
                  <p className="no-records">暂无记录</p>
                ) : (
                  getScoreRecords().map((record, index) => (
                    <div key={record.id} className="score-item">
                      <span className="rank">#{index + 1}</span>
                      <span className="name">{record.name}</span>
                      <span className="score">{record.score}分</span>
                      <span className="speed">{record.speed}</span>
                      <span className="date">{record.date}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="scoreboard-buttons">
                <button onClick={() => setShowScoreBoard(false)} className="back-button">
                  ← 返回
                </button>
                <button onClick={() => resetGame()} className="restart-button">
                  🔄 重新开始
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 虚拟方向键 - PC端和移动端都可使用 */}
      {gameStarted && !gameOver && !showScoreBoard && (
        <div className="mobile-controls">
          <button 
            className="direction-btn up-btn" 
            onClick={() => handleDirectionButtonClick('up')}
            aria-label="向上"
          >
            ↑
          </button>
          <div className="horizontal-controls">
            <button 
              className="direction-btn left-btn" 
              onClick={() => handleDirectionButtonClick('left')}
              aria-label="向左"
            >
              ←
            </button>
            <button 
              className="direction-btn right-btn" 
              onClick={() => handleDirectionButtonClick('right')}
              aria-label="向右"
            >
              →
            </button>
          </div>
          <button 
            className="direction-btn down-btn" 
            onClick={() => handleDirectionButtonClick('down')}
            aria-label="向下"
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;