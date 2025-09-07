import React, { useState, useEffect, useCallback } from 'react';
import { GameEngineManager } from '../../services/GameEngineManager';
import { BlockSystem } from '../../services/BlockSystem';
import { GameStateManager } from '../../store/gameState';
import { GameBoard as GameBoardType, Block, NextBlock, GameInput } from '../../types';
import { GameState, GameMode, GameDifficulty } from '../../types';

// 游戏逻辑组件属性
interface GameLogicProps {
  onGameStateChange?: (state: GameState) => void;
  onStatsUpdate?: (stats: any) => void;
  onBoardUpdate?: (board: GameBoardType) => void;
  onCurrentBlockUpdate?: (block: Block | null) => void;
  onNextBlocksUpdate?: (blocks: NextBlock[]) => void;
  onGhostBlockUpdate?: (block: Block | null) => void;
}

// 游戏逻辑组件
export const GameLogic = React.forwardRef<any, GameLogicProps>(({
  onGameStateChange,
  onStatsUpdate,
  onBoardUpdate,
  onCurrentBlockUpdate,
  onNextBlocksUpdate,
  onGhostBlockUpdate,
}, ref) => {
  const [gameEngine, setGameEngine] = useState<any>(null);
  const [gameStateManager, setGameStateManager] = useState<GameStateManager | null>(null);
  const [blockSystem, setBlockSystem] = useState<BlockSystem | null>(null);
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
  const [, setNextBlocks] = useState<NextBlock[]>([]);
  const [ghostBlock, setGhostBlock] = useState<Block | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化游戏
  useEffect(() => {
    const initializeGame = () => {
      console.log('开始初始化游戏...');
      try {
        // 初始化游戏引擎管理器
        console.log('创建游戏引擎管理器...');
        const engineManager = GameEngineManager.getInstance();
        console.log('初始化游戏引擎...');
        const engine = engineManager.initialize({
          mode: GameMode.CLASSIC,
          difficulty: GameDifficulty.MEDIUM,
          initialSpeed: 500,
          enableSpecialBlocks: false,
          enableCombo: true,
          gridWidth: 10,
          gridHeight: 20,
        });
        console.log('游戏引擎初始化完成');

        console.log('获取状态管理器...');
        const stateManager = engineManager.getStateManager();
        console.log('状态管理器获取完成:', stateManager);

        console.log('创建方块系统...');
        const blocks = new BlockSystem({
          enableSpecialBlocks: false,
          gridWidth: 10,
          gridHeight: 20,
        });
        console.log('方块系统创建完成');

        setGameEngine(engine);
        setGameStateManager(stateManager);
        setBlockSystem(blocks);

        // 生成初始方块
        console.log('生成初始方块...');
        const initialBlock = blocks.generateBlock();
        console.log('初始方块:', initialBlock);
        setCurrentBlock(initialBlock);

        // 生成下一个方块
        console.log('生成下一个方块...');
        const nextBlock = blocks.previewNextBlock();
        console.log('下一个方块:', nextBlock);
        setNextBlocks([nextBlock]);

        // 计算幽灵方块
        console.log('计算幽灵方块...');
        const ghost = {
          ...initialBlock,
          position: blocks.calculateGhostPosition(initialBlock, gameBoard)
        };
        console.log('幽灵方块:', ghost);
        setGhostBlock(ghost);

        console.log('游戏初始化完成！');
        setIsInitialized(true);
      } catch (error) {
        console.error('游戏初始化失败:', error);
        console.error('错误堆栈:', error instanceof Error ? error.stack : String(error));
      }
    };

    initializeGame();
  }, []);

  // 监听游戏状态变化
  useEffect(() => {
    if (gameStateManager) {
      const handleStateChange = (context: any) => {
        onGameStateChange?.(context.state);
        onStatsUpdate?.(context.stats);
      };

      gameStateManager.addListener(handleStateChange);
      return () => gameStateManager.removeListener(handleStateChange);
    }
  }, [gameStateManager, onGameStateChange, onStatsUpdate]);

  // 处理输入
  const handleInput = useCallback((input: GameInput) => {
    if (!gameEngine || !blockSystem || !currentBlock) return;

    let newBlock = currentBlock;
    let shouldUpdate = false;

    switch (input.type) {
      case 'move':
        if (input.direction) {
          const movedBlock = blockSystem.move(currentBlock, input.direction);
          const collision = blockSystem.checkCollision(movedBlock, gameBoard);
          
          if (!collision.hasCollision) {
            newBlock = movedBlock;
            shouldUpdate = true;
          }
        }
        break;

      case 'rotate':
        const rotatedBlock = blockSystem.tryRotate(currentBlock, gameBoard, true);
        if (rotatedBlock) {
          newBlock = rotatedBlock;
          shouldUpdate = true;
        }
        break;

      case 'drop':
        // 硬降 - 直接移动到幽灵方块位置
        if (ghostBlock) {
          newBlock = { ...currentBlock, position: ghostBlock.position };
          shouldUpdate = true;
        }
        break;

      case 'pause':
        if (gameStateManager) {
          const currentState = gameStateManager.getState();
          if (currentState === GameState.PLAYING) {
            gameStateManager.pauseGame();
          } else if (currentState === GameState.PAUSED) {
            gameStateManager.resumeGame();
          }
        }
        break;

      case 'restart':
        if (gameStateManager) {
          gameStateManager.resetGame();
          gameStateManager.startNewGame();
          // 重置游戏板
          const newBoard = {
            width: 10,
            height: 20,
            grid: Array(20).fill(null).map(() => 
              Array(10).fill(null).map(() => ({
                filled: false,
                color: 'transparent'
              }))
            )
          };
          setGameBoard(newBoard);
          onBoardUpdate?.(newBoard);
        }
        break;
    }

    if (shouldUpdate) {
      setCurrentBlock(newBlock);
      onCurrentBlockUpdate?.(newBlock);

      // 更新幽灵方块
      const newGhost = {
        ...newBlock,
        position: blockSystem.calculateGhostPosition(newBlock, gameBoard)
      };
      setGhostBlock(newGhost);
      onGhostBlockUpdate?.(newGhost);
    }
  }, [gameEngine, blockSystem, currentBlock, gameBoard, ghostBlock, gameStateManager, onCurrentBlockUpdate, onGhostBlockUpdate, onBoardUpdate]);

  // 方块下落逻辑
  useEffect(() => {
    if (!isInitialized || !gameStateManager || !blockSystem || !currentBlock) return;

    const currentState = gameStateManager.getState();
    if (currentState !== GameState.PLAYING) return;

    const interval = setInterval(() => {
      const movedBlock = blockSystem.move(currentBlock, 'down');
      const collision = blockSystem.checkCollision(movedBlock, gameBoard);

      if (collision.hasCollision) {
        // 方块落地，放置到游戏板上
        placeBlock(currentBlock);
      } else {
        // 继续下落
        setCurrentBlock(movedBlock);
        onCurrentBlockUpdate?.(movedBlock);

        // 更新幽灵方块
        const newGhost = {
          ...movedBlock,
          position: blockSystem.calculateGhostPosition(movedBlock, gameBoard)
        };
        setGhostBlock(newGhost);
        onGhostBlockUpdate?.(newGhost);
      }
    }, gameStateManager.calculateSpeed());

    return () => clearInterval(interval);
  }, [isInitialized, gameStateManager, blockSystem, currentBlock, gameBoard, onCurrentBlockUpdate, onGhostBlockUpdate]);

  // 放置方块到游戏板
  const placeBlock = useCallback((block: Block) => {
    if (!blockSystem || !gameStateManager) return;

    const newBoard = { ...gameBoard };
    const positions = blockSystem.getBlockPositions(block);

    // 将方块放置到游戏板上
    positions.forEach(pos => {
      if (pos.y >= 0 && pos.y < newBoard.height && pos.x >= 0 && pos.x < newBoard.width) {
        newBoard.grid[pos.y][pos.x] = {
          filled: true,
          color: block.color,
          isSpecial: block.isSpecial,
          specialType: block.specialType,
        };
      }
    });

    setGameBoard(newBoard);
    onBoardUpdate?.(newBoard);

    // 检查并清除完整的行
    const clearedLines = clearLines(newBoard);
    if (clearedLines > 0) {
      gameStateManager.addScore(clearedLines * 100, clearedLines);
    }

    // 生成新方块
    const newBlock = blockSystem.generateBlock();
    setCurrentBlock(newBlock);
    onCurrentBlockUpdate?.(newBlock);

    // 更新下一个方块
    const nextBlock = blockSystem.previewNextBlock();
    setNextBlocks([nextBlock]);
    onNextBlocksUpdate?.([nextBlock]);

    // 检查游戏结束
    const collision = blockSystem.checkCollision(newBlock, newBoard);
    if (collision.hasCollision) {
      gameStateManager.endGame();
    }
  }, [blockSystem, gameStateManager, gameBoard, onBoardUpdate, onCurrentBlockUpdate, onNextBlocksUpdate]);

  // 清除完整的行
  const clearLines = useCallback((board: GameBoardType): number => {
    let clearedLines = 0;
    const newGrid = [...board.grid];

    // 从底部开始检查
    for (let y = board.height - 1; y >= 0; y--) {
      const isFullLine = newGrid[y].every(cell => cell.filled);
      
      if (isFullLine) {
        // 移除这一行
        newGrid.splice(y, 1);
        // 在顶部添加新的空行
        newGrid.unshift(Array(board.width).fill(null).map(() => ({
          filled: false,
          color: 'transparent'
        })));
        clearedLines++;
        y++; // 重新检查这一行，因为行号已经改变
      }
    }

    if (clearedLines > 0) {
      const newBoard = {
        ...board,
        grid: newGrid
      };
      setGameBoard(newBoard);
      onBoardUpdate?.(newBoard);
    }

    return clearedLines;
  }, [onBoardUpdate]);

  // 暴露方法给父组件
  React.useImperativeHandle(ref, () => ({
    handleInput,
    startGame: () => {
      console.log('GameLogic startGame 被调用');
      console.log('初始化状态:', isInitialized);
      console.log('gameStateManager:', gameStateManager);
      console.log('blockSystem:', blockSystem);
      
      if (!isInitialized) {
        console.error('游戏尚未初始化完成，请稍后再试');
        return;
      }
      
      if (gameStateManager) {
        console.log('开始新游戏');
        gameStateManager.startNewGame();
        // 重置游戏板
        const newBoard = {
          width: 10,
          height: 20,
          grid: Array(20).fill(null).map(() => 
            Array(10).fill(null).map(() => ({
              filled: false,
              color: 'transparent'
            }))
          )
        };
        setGameBoard(newBoard);
        onBoardUpdate?.(newBoard);
        
        // 生成新方块
        if (blockSystem) {
          console.log('生成新方块');
          const newBlock = blockSystem.generateBlock();
          setCurrentBlock(newBlock);
          onCurrentBlockUpdate?.(newBlock);
          
          // 更新下一个方块
          const nextBlock = blockSystem.previewNextBlock();
          setNextBlocks([nextBlock]);
          onNextBlocksUpdate?.([nextBlock]);
          
          // 计算幽灵方块
          const ghost = {
            ...newBlock,
            position: blockSystem.calculateGhostPosition(newBlock, newBoard)
          };
          setGhostBlock(ghost);
          onGhostBlockUpdate?.(ghost);
        } else {
          console.error('blockSystem 为空');
        }
      } else {
        console.error('gameStateManager 为空');
      }
    },
    pauseGame: () => gameStateManager?.pauseGame(),
    resumeGame: () => gameStateManager?.resumeGame(),
    resetGame: () => gameStateManager?.resetGame(),
  }), [handleInput, gameStateManager, blockSystem, isInitialized, onBoardUpdate, onCurrentBlockUpdate, onNextBlocksUpdate, onGhostBlockUpdate]);

  return null;
});

export default GameLogic;
