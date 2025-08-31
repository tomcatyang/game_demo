// 通用测试工具类

// 测试结果接口
export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  duration?: number;
}

// 基础测试类
export abstract class BaseTest {
  protected testResults: TestResult[] = [];
  
  abstract runAllTests(): Promise<void>;

  protected addTestResult(name: string, passed: boolean, message?: string, duration?: number): void {
    this.testResults.push({ name, passed, message, duration });
  }

  protected printResults(): void {
    console.log(`\n📊 ${this.constructor.name} Results:`);
    console.log('='.repeat(50));
    
    let passedCount = 0;
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const durationText = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${status} ${result.name}${durationText}`);
      
      if (result.message) {
        console.log(`   ${result.message}`);
      }
      
      if (result.passed) {
        passedCount++;
      }
    });
    
    console.log('='.repeat(50));
    console.log(`Total: ${this.testResults.length}, Passed: ${passedCount}, Failed: ${this.testResults.length - passedCount}`);
    
    if (passedCount === this.testResults.length) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️ Some tests failed. Please check the implementation.');
    }
  }

  getResults(): TestResult[] {
    return [...this.testResults];
  }

  clearResults(): void {
    this.testResults = [];
  }

  // 测量执行时间的辅助方法
  protected async measureTime<T>(fn: () => T | Promise<T>): Promise<T> {
    const result = await fn();
    return result;
  }

  // 断言辅助方法
  protected assert(condition: boolean, message: string): boolean {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
    return true;
  }

  protected assertEqual<T>(actual: T, expected: T, message?: string): boolean {
    const isEqual = actual === expected;
    if (!isEqual) {
      const errorMessage = message || `Expected ${expected}, but got ${actual}`;
      throw new Error(`Assertion failed: ${errorMessage}`);
    }
    return true;
  }

  protected assertNotEqual<T>(actual: T, expected: T, message?: string): boolean {
    const isEqual = actual === expected;
    if (isEqual) {
      const errorMessage = message || `Expected not ${expected}, but got ${actual}`;
      throw new Error(`Assertion failed: ${errorMessage}`);
    }
    return true;
  }

  protected assertThrows(fn: () => void): boolean {
    try {
      fn();
      throw new Error(`Expected function to throw, but it didn't`);
    } catch {
      // 预期的错误
      return true;
    }
  }

  protected async assertThrowsAsync(fn: () => Promise<void>): Promise<boolean> {
    try {
      await fn();
      throw new Error(`Expected async function to throw, but it didn't`);
    } catch {
      // 预期的错误
      return true;
    }
  }
}

// 测试运行器
export class TestRunner {
  private tests: BaseTest[] = [];

  addTest(test: BaseTest): void {
    this.tests.push(test);
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Starting All Tests...\n');
    
    const allResults: TestResult[] = [];
    
    for (const test of this.tests) {
      try {
        await test.runAllTests();
        allResults.push(...test.getResults());
      } catch (error) {
        console.error(`Error running ${test.constructor.name}:`, error);
        allResults.push({
          name: `${test.constructor.name} - Runtime Error`,
          passed: false,
          message: `${error}`,
        });
      }
    }
    
    this.printSummary(allResults);
    return allResults;
  }

  private printSummary(results: TestResult[]): void {
    console.log('\n🏁 Test Summary:');
    console.log('='.repeat(60));
    
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
    
    console.log(`Total Tests: ${totalCount}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${totalCount - passedCount}`);
    console.log(`Pass Rate: ${passRate}%`);
    
    if (passedCount === totalCount) {
      console.log('\n🎉 All tests passed! Great job!');
    } else {
      console.log('\n⚠️ Some tests failed. Please review and fix.');
      
      // 显示失败的测试
      const failedTests = results.filter(r => !r.passed);
      console.log('\nFailed Tests:');
      failedTests.forEach(test => {
        console.log(`❌ ${test.name}: ${test.message || 'No message'}`);
      });
    }
  }
}

// 模拟数据生成器
export class MockDataGenerator {
  // 生成随机整数
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 生成随机浮点数
  static randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  // 生成随机布尔值
  static randomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  // 生成随机字符串
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 从数组中随机选择元素
  static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // 生成随机数组
  static randomArray<T>(generator: () => T, length: number): T[] {
    return Array.from({ length }, generator);
  }
}

// 性能测试工具
export class PerformanceTestUtils {
  static async measurePerformance<T>(
    fn: () => T | Promise<T>,
    iterations: number = 1000,
    warmupIterations: number = 100
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
    iterations: number;
  }> {
    // 预热
    for (let i = 0; i < warmupIterations; i++) {
      await fn();
    }

    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return {
      averageTime: Math.round(averageTime * 1000) / 1000,
      minTime: Math.round(minTime * 1000) / 1000,
      maxTime: Math.round(maxTime * 1000) / 1000,
      totalTime: Math.round(totalTime * 1000) / 1000,
      iterations,
    };
  }
}

// 导出单例测试运行器
export const testRunner = new TestRunner();
