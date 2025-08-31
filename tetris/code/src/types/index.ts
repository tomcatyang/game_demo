// 游戏相关类型
export * from './game';

// 方块相关类型
export * from './block';

// 用户相关类型
export * from './user';

// 存储相关类型
export * from './storage';

// 通用工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 回调函数类型
export type EventCallback<T = unknown> = (data: T) => void;

export type AsyncCallback<T = unknown> = (data: T) => Promise<void>;

// 错误处理类型
export interface ErrorInfo {
  message: string;
  code?: string;
  stack?: string;
  timestamp: number;
}
