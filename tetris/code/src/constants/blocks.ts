import { BlockType, BlockShape, BlockConfig } from '@/types';

// 7种经典俄罗斯方块的形状定义
export const BLOCK_SHAPES: Record<BlockType, BlockShape[]> = {
  // I 形方块 (直线)
  [BlockType.I]: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],

  // O 形方块 (正方形)
  [BlockType.O]: [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],

  // T 形方块
  [BlockType.T]: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],

  // S 形方块
  [BlockType.S]: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],

  // Z 形方块
  [BlockType.Z]: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],

  // J 形方块
  [BlockType.J]: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],

  // L 形方块
  [BlockType.L]: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],

  // 炸弹方块 (特殊方块)
  [BlockType.BOMB]: [
    [
      [1],
    ],
    [
      [1],
    ],
    [
      [1],
    ],
    [
      [1],
    ],
  ],

  // 锁定方块 (特殊方块)
  [BlockType.LOCK]: [
    [
      [1],
    ],
    [
      [1],
    ],
    [
      [1],
    ],
    [
      [1],
    ],
  ],
};

// 方块颜色配置
export const BLOCK_COLORS: Record<BlockType, string> = {
  [BlockType.I]: '#00FFFF', // 青色
  [BlockType.O]: '#FFFF00', // 黄色
  [BlockType.T]: '#800080', // 紫色
  [BlockType.S]: '#00FF00', // 绿色
  [BlockType.Z]: '#FF0000', // 红色
  [BlockType.J]: '#0000FF', // 蓝色
  [BlockType.L]: '#FFA500', // 橙色
  [BlockType.BOMB]: '#FF1493', // 深粉色
  [BlockType.LOCK]: '#696969', // 暗灰色
};

// 方块分数配置
export const BLOCK_SCORES: Record<BlockType, number> = {
  [BlockType.I]: 100,
  [BlockType.O]: 100,
  [BlockType.T]: 100,
  [BlockType.S]: 100,
  [BlockType.Z]: 100,
  [BlockType.J]: 100,
  [BlockType.L]: 100,
  [BlockType.BOMB]: 200, // 特殊方块分数更高
  [BlockType.LOCK]: 150,
};

// 完整的方块配置
export const BLOCK_CONFIG: BlockConfig = {
  [BlockType.I]: {
    shapes: BLOCK_SHAPES[BlockType.I],
    color: BLOCK_COLORS[BlockType.I],
    score: BLOCK_SCORES[BlockType.I],
  },
  [BlockType.O]: {
    shapes: BLOCK_SHAPES[BlockType.O],
    color: BLOCK_COLORS[BlockType.O],
    score: BLOCK_SCORES[BlockType.O],
  },
  [BlockType.T]: {
    shapes: BLOCK_SHAPES[BlockType.T],
    color: BLOCK_COLORS[BlockType.T],
    score: BLOCK_SCORES[BlockType.T],
  },
  [BlockType.S]: {
    shapes: BLOCK_SHAPES[BlockType.S],
    color: BLOCK_COLORS[BlockType.S],
    score: BLOCK_SCORES[BlockType.S],
  },
  [BlockType.Z]: {
    shapes: BLOCK_SHAPES[BlockType.Z],
    color: BLOCK_COLORS[BlockType.Z],
    score: BLOCK_SCORES[BlockType.Z],
  },
  [BlockType.J]: {
    shapes: BLOCK_SHAPES[BlockType.J],
    color: BLOCK_COLORS[BlockType.J],
    score: BLOCK_SCORES[BlockType.J],
  },
  [BlockType.L]: {
    shapes: BLOCK_SHAPES[BlockType.L],
    color: BLOCK_COLORS[BlockType.L],
    score: BLOCK_SCORES[BlockType.L],
  },
  [BlockType.BOMB]: {
    shapes: BLOCK_SHAPES[BlockType.BOMB],
    color: BLOCK_COLORS[BlockType.BOMB],
    score: BLOCK_SCORES[BlockType.BOMB],
  },
  [BlockType.LOCK]: {
    shapes: BLOCK_SHAPES[BlockType.LOCK],
    color: BLOCK_COLORS[BlockType.LOCK],
    score: BLOCK_SCORES[BlockType.LOCK],
  },
};

// 基础方块类型 (不包含特殊方块)
export const BASIC_BLOCK_TYPES: BlockType[] = [
  BlockType.I,
  BlockType.O,
  BlockType.T,
  BlockType.S,
  BlockType.Z,
  BlockType.J,
  BlockType.L,
];

// 特殊方块类型
export const SPECIAL_BLOCK_TYPES: BlockType[] = [
  BlockType.BOMB,
  BlockType.LOCK,
];

// 所有方块类型
export const ALL_BLOCK_TYPES: BlockType[] = [
  ...BASIC_BLOCK_TYPES,
  ...SPECIAL_BLOCK_TYPES,
];

// 方块生成权重 (用于随机生成)
export const BLOCK_WEIGHTS: Record<BlockType, number> = {
  [BlockType.I]: 10,
  [BlockType.O]: 10,
  [BlockType.T]: 10,
  [BlockType.S]: 10,
  [BlockType.Z]: 10,
  [BlockType.J]: 10,
  [BlockType.L]: 10,
  [BlockType.BOMB]: 2,  // 特殊方块出现概率较低
  [BlockType.LOCK]: 3,
};

// 方块配置常量
export const BLOCK_CONSTANTS = {
  GRID_SIZE: 20,           // 网格单元大小 (px)
  FALL_SPEED_BASE: 500,    // 基础下落速度 (ms)
  ROTATION_STATES: 4,      // 旋转状态数量
  SPECIAL_BLOCK_CHANCE: 0.1, // 特殊方块出现概率 10%
  BOMB_EXPLOSION_RADIUS: 1,  // 炸弹爆炸半径
  LOCK_DURATION: 3000,       // 锁定方块持续时间 (ms)
} as const;
