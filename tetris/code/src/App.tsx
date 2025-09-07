import React, { useState, useRef, useCallback } from 'react';
import { SettingsProvider, SettingsButton, SettingsStatus, useSettingsShortcuts } from './components/settings/SettingsManager';
import { GameBoard } from './components/game/GameBoard';
import { NextBlockPreview } from './components/game/NextBlockPreview';
import { ScoreDisplay } from './components/game/ScoreDisplay';
import { TouchControls } from './components/game/TouchControls';
import GameLogic from './components/game/GameLogic';
import { GameState, GameInput, Block, NextBlock, GameBoard as GameBoardType } from './types';
import './App.css';

// 主游戏组件
const GameApp: React.FC = () => {
  // 启用设置快捷键
  useSettingsShortcuts();

  // 游戏状态
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [gameBoard, setGameBoard] = useState<GameBoardType>({
    width: 10,
    height: 20,
    grid: Array(20).fill(null).map(() => 
      Array(10).fill(null).map(() => ({
        filled: false,
        color: 'transparent'
      }))
    )
  });
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [ghostBlock, setGhostBlock] = useState<Block | null>(null);
  const [nextBlocks, setNextBlocks] = useState<NextBlock[]>([]);
  const [gameStats, setGameStats] = useState({
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    totalTime: 0,
    totalGames: 0,
    totalLines: 0,
    highScores: { classic: 0, time_attack: 0, challenge: 0 }
  });

  // 游戏逻辑引用
  const gameLogicRef = useRef<any>(null);

  // 处理输入
  const handleInput = useCallback((input: GameInput) => {
    if (gameLogicRef.current) {
      gameLogicRef.current.handleInput(input);
    }
  }, []);

  // 开始游戏
  const handleStartGame = useCallback(() => {
    console.log('开始游戏按钮被点击');
    if (gameLogicRef.current) {
      console.log('调用游戏逻辑的startGame方法');
      gameLogicRef.current.startGame();
    } else {
      console.error('游戏逻辑引用为空');
    }
  }, []);

  // 检查游戏是否已初始化
  const [isGameReady, setIsGameReady] = useState(false);

  // 监听游戏状态变化，判断游戏是否已初始化
  React.useEffect(() => {
    if (gameState !== GameState.MENU) {
      setIsGameReady(true);
    }
  }, [gameState]);

  // 暂停/继续游戏
  const handlePauseGame = useCallback(() => {
    if (gameLogicRef.current) {
      if (gameState === GameState.PLAYING) {
        gameLogicRef.current.pauseGame();
      } else if (gameState === GameState.PAUSED) {
        gameLogicRef.current.resumeGame();
      }
    }
  }, [gameState]);

  // 键盘事件处理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState !== GameState.PLAYING) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        handleInput({ type: 'move', direction: 'left' });
        break;
      case 'ArrowRight':
        event.preventDefault();
        handleInput({ type: 'move', direction: 'right' });
        break;
      case 'ArrowDown':
        event.preventDefault();
        handleInput({ type: 'move', direction: 'down' });
        break;
      case 'ArrowUp':
        event.preventDefault();
        handleInput({ type: 'rotate' });
        break;
      case ' ':
        event.preventDefault();
        handleInput({ type: 'drop' });
        break;
      case 'p':
      case 'P':
        event.preventDefault();
        handleInput({ type: 'pause' });
        break;
      case 'r':
      case 'R':
        event.preventDefault();
        handleInput({ type: 'restart' });
        break;
    }
  }, [gameState, handleInput]);

  // 添加键盘事件监听
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="game-container">
      <header className="game-header">
        <h1 className="game-title">俄罗斯方块</h1>
        <div className="game-controls">
          <button 
            className="game-btn"
            onClick={handleStartGame}
            disabled={!isGameReady}
          >
            {!isGameReady ? '初始化中...' : (gameState === GameState.PLAYING ? '重新开始' : '开始游戏')}
          </button>
          <button 
            className="game-btn"
            onClick={handlePauseGame}
          >
            {gameState === GameState.PAUSED ? '继续' : '暂停'}
          </button>
          <SettingsButton className="settings-btn" />
        </div>
      </header>

      <main className="game-main">
        <div className="game-left">
          <GameBoard 
            board={gameBoard}
            currentBlock={currentBlock}
            ghostBlock={ghostBlock}
          />
          <TouchControls 
            onInput={handleInput}
            disabled={gameState === GameState.MENU}
          />
        </div>
        
        <div className="game-right">
          <ScoreDisplay 
            stats={gameStats}
          />
          <NextBlockPreview 
            nextBlocks={nextBlocks}
          />
          <SettingsStatus />
        </div>
      </main>

      {/* 游戏逻辑组件 */}
      <GameLogic
        ref={gameLogicRef}
        onGameStateChange={setGameState}
        onStatsUpdate={setGameStats}
        onBoardUpdate={setGameBoard}
        onCurrentBlockUpdate={setCurrentBlock}
        onNextBlocksUpdate={setNextBlocks}
        onGhostBlockUpdate={setGhostBlock}
      />
    </div>
  );
};

// 应用根组件
function App() {
  return (
    <SettingsProvider>
      <GameApp />
    </SettingsProvider>
  );
}

export default App
