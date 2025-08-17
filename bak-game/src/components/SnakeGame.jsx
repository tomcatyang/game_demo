import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SnakeGame.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const INITIAL_DIRECTION = { x: 0, y: 0 };
const GAME_SPEED = 150;

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameRunning, setGameRunning] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return localStorage.getItem('snakeHighScore') || 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(GAME_SPEED);
  
  const gameLoopRef = useRef(null);
  const canvasRef = useRef(null);
  const directionRef = useRef(direction);
  const foodRef = useRef(food);
  const snakeRef = useRef(snake);

  // 更新refs
  useEffect(() => {
    directionRef.current = direction;
    foodRef.current = food;
    snakeRef.current = snake;
  }, [direction, food, snake]);

  // 生成随机食物位置
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // 检查碰撞
  const checkCollision = useCallback((head) => {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // 检查自身碰撞
    return snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  // 移动蛇
  const moveSnake = useCallback(() => {
    if (!gameRunning || gamePaused || gameOver) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const currentDirection = directionRef.current;
      const head = { 
        x: newSnake[0].x + currentDirection.x, 
        y: newSnake[0].y + currentDirection.y 
      };

      // 检查碰撞
      if (checkCollision(head)) {
        setGameOver(true);
        setGameRunning(false);
        return prevSnake;
      }

      newSnake.unshift(head);

      // 检查是否吃到食物
      const currentFood = foodRef.current;
      if (head.x === currentFood.x && head.y === currentFood.y) {
        setScore(prevScore => {
          const newScore = prevScore + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore);
          }
          return newScore;
        });
        const newFood = generateFood();
        setFood(newFood);
        foodRef.current = newFood;
        // 增加游戏速度
        setGameSpeed(prevSpeed => Math.max(50, prevSpeed - 2));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameRunning, gamePaused, gameOver, checkCollision, generateFood, highScore]);

  // 游戏循环
  useEffect(() => {
    if (gameRunning && !gamePaused && !gameOver) {
      const timeoutId = setTimeout(() => {
        moveSnake();
      }, gameSpeed);
      
      gameLoopRef.current = timeoutId;
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [gameRunning, gamePaused, gameOver, gameSpeed, moveSnake]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameRunning || gamePaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current.y !== 1) {
            setDirection({ x: 0, y: -1 });
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current.y !== -1) {
            setDirection({ x: 0, y: 1 });
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current.x !== 1) {
            setDirection({ x: -1, y: 0 });
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current.x !== -1) {
            setDirection({ x: 1, y: 0 });
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gamePaused, gameOver]);

  // 绘制游戏
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / GRID_SIZE;

    // 清空画布
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
      if (index === 0) {
        // 蛇头
        ctx.fillStyle = '#2d3748';
      } else {
        // 蛇身
        ctx.fillStyle = '#4a5568';
      }
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });

    // 绘制食物
    ctx.fillStyle = '#e53e3e';
    ctx.fillRect(
      food.x * cellSize + 1,
      food.y * cellSize + 1,
      cellSize - 2,
      cellSize - 2
    );

    // 绘制游戏结束信息
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 20);
      
      ctx.font = '20px Arial';
      ctx.fillText(`最终分数: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
  }, [snake, food, gameOver, score]);

  // 开始游戏
  const startGame = useCallback(() => {
    console.log('开始游戏被点击');
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameRunning(true);
    setGamePaused(false);
    setGameSpeed(GAME_SPEED);
  }, []);

  // 暂停/继续游戏
  const togglePause = useCallback(() => {
    console.log('暂停/继续被点击', { gameRunning, gameOver });
    if (gameRunning && !gameOver) {
      setGamePaused(prev => !prev);
    }
  }, [gameRunning, gameOver]);

  // 重新开始游戏
  const restartGame = useCallback(() => {
    console.log('重新开始被点击');
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameRunning(false);
    setGamePaused(false);
    setGameSpeed(GAME_SPEED);
  }, []);

  return (
    <div className="snake-game">
      <h1>贪吃蛇游戏</h1>
      
      <div className="game-info">
        <div className="score">分数: {score}</div>
        <div className="high-score">最高分: {highScore}</div>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="game-canvas"
      />

      <div className="controls">
        <button 
          onClick={startGame} 
          disabled={gameRunning && !gameOver}
          className="game-button"
        >
          开始游戏
        </button>
        <button 
          onClick={togglePause} 
          disabled={!gameRunning || gameOver}
          className="game-button"
        >
          {gamePaused ? '继续' : '暂停'}
        </button>
        <button 
          onClick={restartGame}
          className="game-button"
        >
          重新开始
        </button>
      </div>

      <div className="instructions">
        <h3>游戏说明：</h3>
        <p>使用方向键或WASD键控制蛇的移动</p>
        <p>吃到食物可以增加分数和蛇的长度</p>
        <p>撞到墙壁或自己的身体会游戏结束</p>
      </div>
    </div>
  );
};

export default SnakeGame; 