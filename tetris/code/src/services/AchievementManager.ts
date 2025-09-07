import { GameMode, GameDifficulty } from '../types';

// 成就类型枚举
export enum AchievementType {
  // 分数成就
  SCORE_1000 = 'score_1000',
  SCORE_5000 = 'score_5000',
  SCORE_10000 = 'score_10000',
  SCORE_50000 = 'score_50000',
  SCORE_100000 = 'score_100000',
  
  // 等级成就
  LEVEL_5 = 'level_5',
  LEVEL_10 = 'level_10',
  LEVEL_15 = 'level_15',
  LEVEL_20 = 'level_20',
  LEVEL_25 = 'level_25',
  
  // 消除行成就
  LINES_10 = 'lines_10',
  LINES_50 = 'lines_50',
  LINES_100 = 'lines_100',
  LINES_500 = 'lines_500',
  LINES_1000 = 'lines_1000',
  
  // 四行消除成就
  TETRIS_1 = 'tetris_1',
  TETRIS_10 = 'tetris_10',
  TETRIS_50 = 'tetris_50',
  TETRIS_100 = 'tetris_100',
  
  // T-Spin成就
  TSPIN_1 = 'tspin_1',
  TSPIN_10 = 'tspin_10',
  TSPIN_50 = 'tspin_50',
  TSPIN_100 = 'tspin_100',
  
  // 连击成就
  COMBO_3 = 'combo_3',
  COMBO_5 = 'combo_5',
  COMBO_10 = 'combo_10',
  COMBO_15 = 'combo_15',
  
  // 时间成就
  SURVIVE_1_MIN = 'survive_1_min',
  SURVIVE_5_MIN = 'survive_5_min',
  SURVIVE_10_MIN = 'survive_10_min',
  SURVIVE_30_MIN = 'survive_30_min',
  
  // 特殊成就
  PERFECT_CLEAR = 'perfect_clear',
  SPEED_DEMON = 'speed_demon',
  CONSISTENCY = 'consistency',
  MASTER = 'master',
  
  // 游戏模式成就
  CLASSIC_MASTER = 'classic_master',
  TIME_ATTACK_MASTER = 'time_attack_master',
  CHALLENGE_MASTER = 'challenge_master',
  
  // 特殊方块成就
  BOMB_EXPERT = 'bomb_expert',
  LOCK_MASTER = 'lock_master',
  SPECIAL_COMBO = 'special_combo',
}

// 成就稀有度枚举
export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

// 成就状态枚举
export enum AchievementStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  COMPLETED = 'completed',
}

// 成就配置接口
export interface AchievementConfig {
  id: AchievementType;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  points: number;
  category: string;
  condition: AchievementCondition;
  reward?: AchievementReward;
  hidden: boolean;
  enabled: boolean;
}

// 成就条件接口
export interface AchievementCondition {
  type: 'score' | 'level' | 'lines' | 'tetris' | 'tspin' | 'combo' | 'time' | 'perfect_clear' | 'mode' | 'special';
  value: number;
  mode?: GameMode;
  difficulty?: GameDifficulty;
  timeLimit?: number; // 时间限制（秒）
  consecutive?: boolean; // 是否要求连续达成
}

// 成就奖励接口
export interface AchievementReward {
  type: 'points' | 'theme' | 'sound' | 'title' | 'badge';
  value: string | number;
  description: string;
}

// 成就进度接口
export interface AchievementProgress {
  id: AchievementType;
  current: number;
  target: number;
  percentage: number;
  status: AchievementStatus;
  unlockedAt?: number;
  completedAt?: number;
}

// 成就统计接口
export interface AchievementStats {
  total: number;
  unlocked: number;
  completed: number;
  locked: number;
  points: number;
  byRarity: Record<AchievementRarity, number>;
  byCategory: Record<string, number>;
  recent: AchievementType[];
}

// 默认成就配置
const DEFAULT_ACHIEVEMENTS: Record<AchievementType, AchievementConfig> = {
  // 分数成就
  [AchievementType.SCORE_1000]: {
    id: AchievementType.SCORE_1000,
    name: '新手入门',
    description: '获得1000分',
    icon: '🎯',
    rarity: AchievementRarity.COMMON,
    points: 10,
    category: '分数',
    condition: { type: 'score', value: 1000 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.SCORE_5000]: {
    id: AchievementType.SCORE_5000,
    name: '渐入佳境',
    description: '获得5000分',
    icon: '⭐',
    rarity: AchievementRarity.COMMON,
    points: 20,
    category: '分数',
    condition: { type: 'score', value: 5000 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.SCORE_10000]: {
    id: AchievementType.SCORE_10000,
    name: '小有成就',
    description: '获得10000分',
    icon: '🏆',
    rarity: AchievementRarity.UNCOMMON,
    points: 50,
    category: '分数',
    condition: { type: 'score', value: 10000 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.SCORE_50000]: {
    id: AchievementType.SCORE_50000,
    name: '分数达人',
    description: '获得50000分',
    icon: '💎',
    rarity: AchievementRarity.RARE,
    points: 100,
    category: '分数',
    condition: { type: 'score', value: 50000 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.SCORE_100000]: {
    id: AchievementType.SCORE_100000,
    name: '分数大师',
    description: '获得100000分',
    icon: '👑',
    rarity: AchievementRarity.EPIC,
    points: 200,
    category: '分数',
    condition: { type: 'score', value: 100000 },
    hidden: false,
    enabled: true,
  },
  
  // 等级成就
  [AchievementType.LEVEL_5]: {
    id: AchievementType.LEVEL_5,
    name: '初出茅庐',
    description: '达到5级',
    icon: '📈',
    rarity: AchievementRarity.COMMON,
    points: 15,
    category: '等级',
    condition: { type: 'level', value: 5 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.LEVEL_10]: {
    id: AchievementType.LEVEL_10,
    name: '登堂入室',
    description: '达到10级',
    icon: '🎖️',
    rarity: AchievementRarity.UNCOMMON,
    points: 30,
    category: '等级',
    condition: { type: 'level', value: 10 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.LEVEL_15]: {
    id: AchievementType.LEVEL_15,
    name: '炉火纯青',
    description: '达到15级',
    icon: '🔥',
    rarity: AchievementRarity.RARE,
    points: 60,
    category: '等级',
    condition: { type: 'level', value: 15 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.LEVEL_20]: {
    id: AchievementType.LEVEL_20,
    name: '登峰造极',
    description: '达到20级',
    icon: '⚡',
    rarity: AchievementRarity.EPIC,
    points: 120,
    category: '等级',
    condition: { type: 'level', value: 20 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.LEVEL_25]: {
    id: AchievementType.LEVEL_25,
    name: '超凡入圣',
    description: '达到25级',
    icon: '🌟',
    rarity: AchievementRarity.LEGENDARY,
    points: 250,
    category: '等级',
    condition: { type: 'level', value: 25 },
    hidden: false,
    enabled: true,
  },
  
  // 消除行成就
  [AchievementType.LINES_10]: {
    id: AchievementType.LINES_10,
    name: '清理专家',
    description: '消除10行',
    icon: '🧹',
    rarity: AchievementRarity.COMMON,
    points: 10,
    category: '消除',
    condition: { type: 'lines', value: 10 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.LINES_50]: {
    id: AchievementType.LINES_50,
    name: '清理大师',
    description: '消除50行',
    icon: '🧽',
    rarity: AchievementRarity.UNCOMMON,
    points: 25,
    category: '消除',
    condition: { type: 'lines', value: 50 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.LINES_100]: {
    id: AchievementType.LINES_100,
    name: '清理宗师',
    description: '消除100行',
    icon: '✨',
    rarity: AchievementRarity.RARE,
    points: 50,
    category: '消除',
    condition: { type: 'lines', value: 100 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.LINES_500]: {
    id: AchievementType.LINES_500,
    name: '清理传奇',
    description: '消除500行',
    icon: '💫',
    rarity: AchievementRarity.EPIC,
    points: 100,
    category: '消除',
    condition: { type: 'lines', value: 500 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.LINES_1000]: {
    id: AchievementType.LINES_1000,
    name: '清理神话',
    description: '消除1000行',
    icon: '🌠',
    rarity: AchievementRarity.LEGENDARY,
    points: 200,
    category: '消除',
    condition: { type: 'lines', value: 1000 },
    hidden: false,
    enabled: true,
  },
  
  // 四行消除成就
  [AchievementType.TETRIS_1]: {
    id: AchievementType.TETRIS_1,
    name: '四行初体验',
    description: '完成1次四行消除',
    icon: '🎯',
    rarity: AchievementRarity.COMMON,
    points: 20,
    category: '技巧',
    condition: { type: 'tetris', value: 1 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.TETRIS_10]: {
    id: AchievementType.TETRIS_10,
    name: '四行达人',
    description: '完成10次四行消除',
    icon: '🎪',
    rarity: AchievementRarity.UNCOMMON,
    points: 50,
    category: '技巧',
    condition: { type: 'tetris', value: 10 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.TETRIS_50]: {
    id: AchievementType.TETRIS_50,
    name: '四行专家',
    description: '完成50次四行消除',
    icon: '🎭',
    rarity: AchievementRarity.RARE,
    points: 100,
    category: '技巧',
    condition: { type: 'tetris', value: 50 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.TETRIS_100]: {
    id: AchievementType.TETRIS_100,
    name: '四行宗师',
    description: '完成100次四行消除',
    icon: '🎨',
    rarity: AchievementRarity.EPIC,
    points: 200,
    category: '技巧',
    condition: { type: 'tetris', value: 100 },
    hidden: false,
    enabled: true,
  },
  
  // T-Spin成就
  [AchievementType.TSPIN_1]: {
    id: AchievementType.TSPIN_1,
    name: 'T-Spin新手',
    description: '完成1次T-Spin',
    icon: '🌀',
    rarity: AchievementRarity.UNCOMMON,
    points: 30,
    category: '技巧',
    condition: { type: 'tspin', value: 1 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.TSPIN_10]: {
    id: AchievementType.TSPIN_10,
    name: 'T-Spin达人',
    description: '完成10次T-Spin',
    icon: '🌪️',
    rarity: AchievementRarity.RARE,
    points: 75,
    category: '技巧',
    condition: { type: 'tspin', value: 10 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.TSPIN_50]: {
    id: AchievementType.TSPIN_50,
    name: 'T-Spin专家',
    description: '完成50次T-Spin',
    icon: '🌊',
    rarity: AchievementRarity.EPIC,
    points: 150,
    category: '技巧',
    condition: { type: 'tspin', value: 50 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.TSPIN_100]: {
    id: AchievementType.TSPIN_100,
    name: 'T-Spin宗师',
    description: '完成100次T-Spin',
    icon: '🌌',
    rarity: AchievementRarity.LEGENDARY,
    points: 300,
    category: '技巧',
    condition: { type: 'tspin', value: 100 },
    hidden: false,
    enabled: true,
  },
  
  // 连击成就
  [AchievementType.COMBO_3]: {
    id: AchievementType.COMBO_3,
    name: '连击新手',
    description: '达成3连击',
    icon: '🔥',
    rarity: AchievementRarity.COMMON,
    points: 15,
    category: '连击',
    condition: { type: 'combo', value: 3 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.COMBO_5]: {
    id: AchievementType.COMBO_5,
    name: '连击达人',
    description: '达成5连击',
    icon: '⚡',
    rarity: AchievementRarity.UNCOMMON,
    points: 30,
    category: '连击',
    condition: { type: 'combo', value: 5 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.COMBO_10]: {
    id: AchievementType.COMBO_10,
    name: '连击专家',
    description: '达成10连击',
    icon: '💥',
    rarity: AchievementRarity.RARE,
    points: 60,
    category: '连击',
    condition: { type: 'combo', value: 10 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.COMBO_15]: {
    id: AchievementType.COMBO_15,
    name: '连击宗师',
    description: '达成15连击',
    icon: '🌟',
    rarity: AchievementRarity.EPIC,
    points: 120,
    category: '连击',
    condition: { type: 'combo', value: 15 },
    hidden: false,
    enabled: true,
  },
  
  // 时间成就
  [AchievementType.SURVIVE_1_MIN]: {
    id: AchievementType.SURVIVE_1_MIN,
    name: '坚持一分钟',
    description: '单局游戏坚持1分钟',
    icon: '⏰',
    rarity: AchievementRarity.COMMON,
    points: 10,
    category: '生存',
    condition: { type: 'time', value: 60 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.SURVIVE_5_MIN]: {
    id: AchievementType.SURVIVE_5_MIN,
    name: '坚持五分钟',
    description: '单局游戏坚持5分钟',
    icon: '⏳',
    rarity: AchievementRarity.UNCOMMON,
    points: 25,
    category: '生存',
    condition: { type: 'time', value: 300 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.SURVIVE_10_MIN]: {
    id: AchievementType.SURVIVE_10_MIN,
    name: '坚持十分钟',
    description: '单局游戏坚持10分钟',
    icon: '🕐',
    rarity: AchievementRarity.RARE,
    points: 50,
    category: '生存',
    condition: { type: 'time', value: 600 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.SURVIVE_30_MIN]: {
    id: AchievementType.SURVIVE_30_MIN,
    name: '坚持半小时',
    description: '单局游戏坚持30分钟',
    icon: '🕒',
    rarity: AchievementRarity.EPIC,
    points: 100,
    category: '生存',
    condition: { type: 'time', value: 1800 },
    hidden: false,
    enabled: true,
  },
  
  // 特殊成就
  [AchievementType.PERFECT_CLEAR]: {
    id: AchievementType.PERFECT_CLEAR,
    name: '完美清除',
    description: '完成一次完美清除',
    icon: '✨',
    rarity: AchievementRarity.RARE,
    points: 100,
    category: '特殊',
    condition: { type: 'perfect_clear', value: 1 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.SPEED_DEMON]: {
    id: AchievementType.SPEED_DEMON,
    name: '速度恶魔',
    description: '在30秒内达到5级',
    icon: '⚡',
    rarity: AchievementRarity.EPIC,
    points: 150,
    category: '特殊',
    condition: { type: 'level', value: 5, timeLimit: 30 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.CONSISTENCY]: {
    id: AchievementType.CONSISTENCY,
    name: '持之以恒',
    description: '连续10局游戏都达到1000分',
    icon: '🎯',
    rarity: AchievementRarity.RARE,
    points: 80,
    category: '特殊',
    condition: { type: 'score', value: 1000, consecutive: true },
    hidden: false,
    enabled: true,
  },
  [AchievementType.MASTER]: {
    id: AchievementType.MASTER,
    name: '大师',
    description: '解锁所有成就',
    icon: '👑',
    rarity: AchievementRarity.LEGENDARY,
    points: 500,
    category: '特殊',
    condition: { type: 'special', value: 0 }, // 特殊条件，需要检查所有成就
    hidden: true,
    enabled: true,
  },
  
  // 游戏模式成就
  [AchievementType.CLASSIC_MASTER]: {
    id: AchievementType.CLASSIC_MASTER,
    name: '经典大师',
    description: '在经典模式下获得50000分',
    icon: '🎮',
    rarity: AchievementRarity.EPIC,
    points: 150,
    category: '模式',
    condition: { type: 'score', value: 50000, mode: GameMode.CLASSIC },
    hidden: false,
    enabled: true,
  },
  [AchievementType.TIME_ATTACK_MASTER]: {
    id: AchievementType.TIME_ATTACK_MASTER,
    name: '时间大师',
    description: '在时间攻击模式下获得30000分',
    icon: '⏱️',
    rarity: AchievementRarity.EPIC,
    points: 150,
    category: '模式',
    condition: { type: 'score', value: 30000, mode: GameMode.TIME_ATTACK },
    hidden: false,
    enabled: true,
  },
  [AchievementType.CHALLENGE_MASTER]: {
    id: AchievementType.CHALLENGE_MASTER,
    name: '挑战大师',
    description: '在挑战模式下获得20000分',
    icon: '🏆',
    rarity: AchievementRarity.EPIC,
    points: 150,
    category: '模式',
    condition: { type: 'score', value: 20000, mode: GameMode.CHALLENGE },
    hidden: false,
    enabled: true,
  },
  
  // 特殊方块成就
  [AchievementType.BOMB_EXPERT]: {
    id: AchievementType.BOMB_EXPERT,
    name: '炸弹专家',
    description: '使用炸弹方块消除100行',
    icon: '💣',
    rarity: AchievementRarity.RARE,
    points: 100,
    category: '特殊方块',
    condition: { type: 'special', value: 100 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.LOCK_MASTER]: {
    id: AchievementType.LOCK_MASTER,
    name: '锁定大师',
    description: '使用锁定方块50次',
    icon: '🔒',
    rarity: AchievementRarity.RARE,
    points: 100,
    category: '特殊方块',
    condition: { type: 'special', value: 50 },
    hidden: false,
    enabled: true,
  },
  [AchievementType.SPECIAL_COMBO]: {
    id: AchievementType.SPECIAL_COMBO,
    name: '特殊连击',
    description: '在一次连击中使用特殊方块',
    icon: '🎆',
    rarity: AchievementRarity.EPIC,
    points: 120,
    category: '特殊方块',
    condition: { type: 'combo', value: 1 },
    hidden: false,
    enabled: true,
  },
};

// 成就管理器类
export class AchievementManager {
  private achievements: Map<AchievementType, AchievementConfig>;
  private progress: Map<AchievementType, AchievementProgress>;
  private stats: Map<string, number>;
  private listeners: Map<string, (achievement: AchievementType, progress: AchievementProgress) => void>;
  private recentUnlocks: AchievementType[];
  private maxRecentUnlocks: number;

  constructor() {
    this.achievements = new Map();
    this.progress = new Map();
    this.stats = new Map();
    this.listeners = new Map();
    this.recentUnlocks = [];
    this.maxRecentUnlocks = 10;
    
    this.initializeAchievements();
    this.initializeProgress();
    this.initializeStats();
  }

  // 初始化成就配置
  private initializeAchievements(): void {
    Object.values(DEFAULT_ACHIEVEMENTS).forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  // 初始化成就进度
  private initializeProgress(): void {
    this.achievements.forEach((achievement, id) => {
      const progress: AchievementProgress = {
        id,
        current: 0,
        target: achievement.condition.value,
        percentage: 0,
        status: AchievementStatus.LOCKED,
      };
      this.progress.set(id, progress);
    });
  }

  // 初始化统计数据
  private initializeStats(): void {
    this.stats.set('total_games', 0);
    this.stats.set('total_score', 0);
    this.stats.set('total_lines', 0);
    this.stats.set('total_tetris', 0);
    this.stats.set('total_tspin', 0);
    this.stats.set('total_combo', 0);
    this.stats.set('total_time', 0);
    this.stats.set('total_perfect_clear', 0);
    this.stats.set('consecutive_games', 0);
    this.stats.set('max_combo', 0);
    this.stats.set('max_score', 0);
    this.stats.set('max_level', 0);
    this.stats.set('max_lines', 0);
  }

  // 更新游戏统计
  updateStats(stats: {
    score?: number;
    lines?: number;
    tetris?: number;
    tspin?: number;
    combo?: number;
    time?: number;
    perfectClear?: boolean;
    level?: number;
    gameMode?: GameMode;
    difficulty?: GameDifficulty;
  }): void {
    if (stats.score !== undefined) {
      const currentTotal = this.stats.get('total_score') ?? 0;
      const currentMax = this.stats.get('max_score') ?? 0;
      this.stats.set('total_score', currentTotal + stats.score);
      this.stats.set('max_score', Math.max(currentMax, stats.score));
    }
    
    if (stats.lines !== undefined) {
      const currentTotal = this.stats.get('total_lines') ?? 0;
      const currentMax = this.stats.get('max_lines') ?? 0;
      this.stats.set('total_lines', currentTotal + stats.lines);
      this.stats.set('max_lines', Math.max(currentMax, stats.lines));
    }
    
    if (stats.tetris !== undefined) {
      const currentTotal = this.stats.get('total_tetris') ?? 0;
      this.stats.set('total_tetris', currentTotal + stats.tetris);
    }
    
    if (stats.tspin !== undefined) {
      const currentTotal = this.stats.get('total_tspin') ?? 0;
      this.stats.set('total_tspin', currentTotal + stats.tspin);
    }
    
    if (stats.combo !== undefined) {
      const currentTotal = this.stats.get('total_combo') ?? 0;
      const currentMax = this.stats.get('max_combo') ?? 0;
      this.stats.set('total_combo', currentTotal + stats.combo);
      this.stats.set('max_combo', Math.max(currentMax, stats.combo));
    }
    
    if (stats.time !== undefined) {
      const currentTotal = this.stats.get('total_time') ?? 0;
      this.stats.set('total_time', currentTotal + stats.time);
    }
    
    if (stats.perfectClear) {
      const currentTotal = this.stats.get('total_perfect_clear') ?? 0;
      this.stats.set('total_perfect_clear', currentTotal + 1);
    }
    
    if (stats.level !== undefined) {
      const currentMax = this.stats.get('max_level') ?? 0;
      this.stats.set('max_level', Math.max(currentMax, stats.level));
    }
    
    if (stats.gameMode) {
      const currentTotal = this.stats.get('total_games') ?? 0;
      this.stats.set('total_games', currentTotal + 1);
    }
    
    // 检查成就解锁
    this.checkAchievements(stats);
  }

  // 检查成就解锁
  private checkAchievements(stats: any): void {
    this.achievements.forEach((achievement, id) => {
      if (!achievement.enabled) return;
      
      const progress = this.progress.get(id);
      if (!progress || progress.status === AchievementStatus.COMPLETED) return;
      
      const condition = achievement.condition;
      let shouldUnlock = false;
      
      switch (condition.type) {
        case 'score':
          shouldUnlock = this.checkScoreAchievement(condition, stats);
          break;
        case 'level':
          shouldUnlock = this.checkLevelAchievement(condition, stats);
          break;
        case 'lines':
          shouldUnlock = this.checkLinesAchievement(condition, stats);
          break;
        case 'tetris':
          shouldUnlock = this.checkTetrisAchievement(condition, stats);
          break;
        case 'tspin':
          shouldUnlock = this.checkTSpinAchievement(condition, stats);
          break;
        case 'combo':
          shouldUnlock = this.checkComboAchievement(condition, stats);
          break;
        case 'time':
          shouldUnlock = this.checkTimeAchievement(condition, stats);
          break;
        case 'perfect_clear':
          shouldUnlock = this.checkPerfectClearAchievement(condition, stats);
          break;
        case 'mode':
          shouldUnlock = this.checkModeAchievement(condition, stats);
          break;
        case 'special':
          shouldUnlock = this.checkSpecialAchievement(condition, stats);
          break;
      }
      
      if (shouldUnlock) {
        this.unlockAchievement(id);
      }
    });
  }

  // 检查分数成就
  private checkScoreAchievement(condition: AchievementCondition, stats: any): boolean {
    if (condition.mode && stats.gameMode !== condition.mode) return false;
    if (condition.difficulty && stats.difficulty !== condition.difficulty) return false;
    if (condition.timeLimit && stats.time > condition.timeLimit) return false;
    
    // 对于consecutive条件，需要特殊处理
    if (condition.consecutive) {
      // 这里需要实现连续游戏检查逻辑
      // 暂时返回false，因为需要更复杂的实现
      return false;
    }
    
    const currentScore = this.stats.get('total_score') || 0;
    return currentScore >= condition.value;
  }

  // 检查等级成就
  private checkLevelAchievement(condition: AchievementCondition, stats: any): boolean {
    if (condition.mode && stats.gameMode !== condition.mode) return false;
    if (condition.difficulty && stats.difficulty !== condition.difficulty) return false;
    if (condition.timeLimit && stats.time > condition.timeLimit) return false;
    
    const currentLevel = this.stats.get('max_level') || 0;
    return currentLevel >= condition.value;
  }

  // 检查消除行成就
  private checkLinesAchievement(condition: AchievementCondition, stats: any): boolean {
    if (condition.mode && stats.gameMode !== condition.mode) return false;
    if (condition.difficulty && stats.difficulty !== condition.difficulty) return false;
    
    const currentLines = this.stats.get('total_lines') || 0;
    return currentLines >= condition.value;
  }

  // 检查四行消除成就
  private checkTetrisAchievement(condition: AchievementCondition, stats: any): boolean {
    if (condition.mode && stats.gameMode !== condition.mode) return false;
    if (condition.difficulty && stats.difficulty !== condition.difficulty) return false;
    
    const currentTetris = this.stats.get('total_tetris') || 0;
    return currentTetris >= condition.value;
  }

  // 检查T-Spin成就
  private checkTSpinAchievement(condition: AchievementCondition, stats: any): boolean {
    if (condition.mode && stats.gameMode !== condition.mode) return false;
    if (condition.difficulty && stats.difficulty !== condition.difficulty) return false;
    
    const currentTSpin = this.stats.get('total_tspin') || 0;
    return currentTSpin >= condition.value;
  }

  // 检查连击成就
  private checkComboAchievement(condition: AchievementCondition, stats: any): boolean {
    if (condition.mode && stats.gameMode !== condition.mode) return false;
    if (condition.difficulty && stats.difficulty !== condition.difficulty) return false;
    
    const currentCombo = this.stats.get('max_combo') || 0;
    return currentCombo >= condition.value;
  }

  // 检查时间成就
  private checkTimeAchievement(condition: AchievementCondition, stats: any): boolean {
    if (condition.mode && stats.gameMode !== condition.mode) return false;
    if (condition.difficulty && stats.difficulty !== condition.difficulty) return false;
    
    return stats.time >= condition.value;
  }

  // 检查完美清除成就
  private checkPerfectClearAchievement(condition: AchievementCondition, stats: any): boolean {
    if (condition.mode && stats.gameMode !== condition.mode) return false;
    if (condition.difficulty && stats.difficulty !== condition.difficulty) return false;
    
    return stats.perfectClear === true;
  }

  // 检查模式成就
  private checkModeAchievement(condition: AchievementCondition, stats: any): boolean {
    if (condition.mode && stats.gameMode !== condition.mode) return false;
    if (condition.difficulty && stats.difficulty !== condition.difficulty) return false;
    
    return this.checkScoreAchievement(condition, stats);
  }

  // 检查特殊成就
  private checkSpecialAchievement(condition: AchievementCondition, _stats: any): boolean {
    // 检查master成就（解锁所有成就）
    if (condition.value === 0) {
      // 检查是否所有其他成就都已解锁
      let allUnlocked = true;
      this.achievements.forEach((achievement, id) => {
        if (id === AchievementType.MASTER) return; // 跳过自己
        if (!achievement.enabled) return;
        
        const progress = this.progress.get(id);
        if (!progress || progress.status === AchievementStatus.LOCKED) {
          allUnlocked = false;
        }
      });
      return allUnlocked;
    }
    
    // 其他特殊成就的检查逻辑
    return false;
  }

  // 解锁成就
  private unlockAchievement(id: AchievementType): void {
    const progress = this.progress.get(id);
    if (!progress || progress.status !== AchievementStatus.LOCKED) return;
    
    progress.status = AchievementStatus.UNLOCKED;
    progress.unlockedAt = Date.now();
    progress.percentage = 100;
    
    // 添加到最近解锁列表
    this.recentUnlocks.unshift(id);
    if (this.recentUnlocks.length > this.maxRecentUnlocks) {
      this.recentUnlocks.pop();
    }
    
    // 通知监听器
    this.notifyListeners(id, progress);
  }

  // 完成成就
  completeAchievement(id: AchievementType): boolean {
    const progress = this.progress.get(id);
    if (!progress || progress.status !== AchievementStatus.UNLOCKED) return false;
    
    progress.status = AchievementStatus.COMPLETED;
    progress.completedAt = Date.now();
    
    // 通知监听器
    this.notifyListeners(id, progress);
    
    return true;
  }

  // 获取成就配置
  getAchievementConfig(id: AchievementType): AchievementConfig | null {
    return this.achievements.get(id) || null;
  }

  // 获取成就进度
  getAchievementProgress(id: AchievementType): AchievementProgress | null {
    return this.progress.get(id) || null;
  }

  // 获取所有成就进度
  getAllAchievementProgress(): AchievementProgress[] {
    return Array.from(this.progress.values());
  }

  // 获取成就统计
  getAchievementStats(): AchievementStats {
    const total = this.achievements.size;
    let unlocked = 0;
    let completed = 0;
    let locked = 0;
    let points = 0;
    const byRarity: Record<AchievementRarity, number> = {
      [AchievementRarity.COMMON]: 0,
      [AchievementRarity.UNCOMMON]: 0,
      [AchievementRarity.RARE]: 0,
      [AchievementRarity.EPIC]: 0,
      [AchievementRarity.LEGENDARY]: 0,
    };
    const byCategory: Record<string, number> = {};
    
    this.progress.forEach((progress, id) => {
      const config = this.achievements.get(id);
      if (!config) return;
      
      switch (progress.status) {
        case AchievementStatus.UNLOCKED:
          unlocked++;
          break;
        case AchievementStatus.COMPLETED:
          completed++;
          points += config.points;
          break;
        case AchievementStatus.LOCKED:
          locked++;
          break;
      }
      
      byRarity[config.rarity]++;
      byCategory[config.category] = (byCategory[config.category] || 0) + 1;
    });
    
    return {
      total,
      unlocked,
      completed,
      locked,
      points,
      byRarity,
      byCategory,
      recent: [...this.recentUnlocks],
    };
  }

  // 获取游戏统计
  getGameStats(): Record<string, number> {
    const result: Record<string, number> = {};
    this.stats.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // 添加事件监听器
  addEventListener(id: string, callback: (achievement: AchievementType, progress: AchievementProgress) => void): void {
    this.listeners.set(id, callback);
  }

  // 移除事件监听器
  removeEventListener(id: string): void {
    this.listeners.delete(id);
  }

  // 通知监听器
  private notifyListeners(achievement: AchievementType, progress: AchievementProgress): void {
    this.listeners.forEach(callback => {
      try {
        callback(achievement, progress);
      } catch (error) {
        console.error('Error in achievement event listener:', error);
      }
    });
  }

  // 重置成就进度
  resetAchievementProgress(id: AchievementType): boolean {
    const progress = this.progress.get(id);
    if (!progress) return false;
    
    progress.current = 0;
    progress.percentage = 0;
    progress.status = AchievementStatus.LOCKED;
    progress.unlockedAt = undefined;
    progress.completedAt = undefined;
    
    return true;
  }

  // 重置所有成就
  resetAllAchievements(): void {
    this.progress.forEach((_progress, id) => {
      this.resetAchievementProgress(id);
    });
    this.recentUnlocks = [];
  }

  // 重置统计数据
  resetStats(): void {
    this.stats.clear();
    this.initializeStats();
  }

  // 重置系统
  reset(): void {
    this.resetAllAchievements();
    this.resetStats();
  }

  // 导出成就数据
  exportAchievementData(): string {
    const data = {
      progress: Array.from(this.progress.entries()),
      stats: Array.from(this.stats.entries()),
      recentUnlocks: this.recentUnlocks,
    };
    return JSON.stringify(data, null, 2);
  }

  // 导入成就数据
  importAchievementData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.progress) {
        this.progress.clear();
        parsed.progress.forEach(([id, progress]: [AchievementType, AchievementProgress]) => {
          this.progress.set(id, progress);
        });
      }
      
      if (parsed.stats) {
        this.stats.clear();
        parsed.stats.forEach(([key, value]: [string, number]) => {
          this.stats.set(key, value);
        });
      }
      
      if (parsed.recentUnlocks) {
        this.recentUnlocks = parsed.recentUnlocks;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import achievement data:', error);
      return false;
    }
  }
}

// 单例实例
let achievementManagerInstance: AchievementManager | null = null;

// 获取成就管理器实例
export const getAchievementManager = (): AchievementManager => {
  if (!achievementManagerInstance) {
    achievementManagerInstance = new AchievementManager();
  }
  return achievementManagerInstance;
};

// 重置成就管理器实例
export const resetAchievementManager = (): void => {
  if (achievementManagerInstance) {
    achievementManagerInstance.reset();
    achievementManagerInstance = null;
  }
};

export default AchievementManager;
