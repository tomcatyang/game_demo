// 性能监控类
export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private frameTime: number = 0;
  private samples: number[] = [];
  private readonly maxSamples: number = 60;

  constructor() {
    this.lastTime = performance.now();
  }

  // 更新性能数据
  update(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameTime = deltaTime;
    this.frameCount++;
    
    // 计算FPS
    this.samples.push(deltaTime);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
    
    // 计算平均FPS
    const averageFrameTime = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    this.fps = 1000 / averageFrameTime;
    
    this.lastTime = currentTime;
  }

  // 获取FPS
  getFPS(): number {
    return Math.round(this.fps * 100) / 100;
  }

  // 获取帧时间
  getFrameTime(): number {
    return Math.round(this.frameTime * 100) / 100;
  }

  // 获取总帧数
  getFrameCount(): number {
    return this.frameCount;
  }

  // 重置计数器
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
    this.frameTime = 0;
    this.samples = [];
  }

  // 获取性能报告
  getReport(): {
    fps: number;
    frameTime: number;
    frameCount: number;
    averageFrameTime: number;
    minFrameTime: number;
    maxFrameTime: number;
  } {
    const minFrameTime = Math.min(...this.samples);
    const maxFrameTime = Math.max(...this.samples);
    const averageFrameTime = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;

    return {
      fps: this.getFPS(),
      frameTime: this.getFrameTime(),
      frameCount: this.getFrameCount(),
      averageFrameTime: Math.round(averageFrameTime * 100) / 100,
      minFrameTime: Math.round(minFrameTime * 100) / 100,
      maxFrameTime: Math.round(maxFrameTime * 100) / 100,
    };
  }
}

// 帧率适应器
export class FrameRateAdapter {
  private targetFPS: number;
  private performanceMonitor: PerformanceMonitor;
  private adaptiveEnabled: boolean = true;

  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
    this.performanceMonitor = new PerformanceMonitor();
  }

  // 更新并检查是否需要适应
  update(): boolean {
    this.performanceMonitor.update();
    
    if (!this.adaptiveEnabled) {
      return true;
    }

    const currentFPS = this.performanceMonitor.getFPS();
    
    // 如果FPS低于目标的80%，建议降低质量
    if (currentFPS < this.targetFPS * 0.8) {
      return false;
    }
    
    return true;
  }

  // 启用/禁用自适应
  setAdaptiveEnabled(enabled: boolean): void {
    this.adaptiveEnabled = enabled;
  }

  // 设置目标FPS
  setTargetFPS(fps: number): void {
    this.targetFPS = fps;
  }

  // 获取性能监控器
  getMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  // 获取当前FPS
  getCurrentFPS(): number {
    return this.performanceMonitor.getFPS();
  }
}

// 内存监控工具
export class MemoryMonitor {
  // 获取内存使用情况（如果浏览器支持）
  getMemoryUsage(): {
    used?: number;
    total?: number;
    limit?: number;
  } {
    // @ts-expect-error - memory API可能不存在
    const memory = (performance as typeof performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    
    if (memory) {
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    
    return {};
  }

  // 检查内存使用是否过高
  isMemoryUsageHigh(): boolean {
    const memory = this.getMemoryUsage();
    
    if (memory.used && memory.limit) {
      return memory.used / memory.limit > 0.8; // 使用超过80%
    }
    
    return false;
  }

  // 建议进行垃圾回收
  suggestGarbageCollection(): boolean {
    return this.isMemoryUsageHigh();
  }
}

// 性能工具集合
export const performanceUtils = {
  createMonitor: () => new PerformanceMonitor(),
  createFrameRateAdapter: (targetFPS?: number) => new FrameRateAdapter(targetFPS),
  createMemoryMonitor: () => new MemoryMonitor(),
  
  // 测量函数执行时间
  measureTime: <T>(fn: () => T, label?: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (label) {
      console.log(`${label}: ${end - start}ms`);
    }
    
    return result;
  },
  
  // 异步函数执行时间测量
  measureTimeAsync: async <T>(fn: () => Promise<T>, label?: string): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (label) {
      console.log(`${label}: ${end - start}ms`);
    }
    
    return result;
  },
};
