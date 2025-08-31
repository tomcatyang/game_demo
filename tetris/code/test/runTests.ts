#!/usr/bin/env ts-node

// Node.js 类型声明
declare const process: {
  argv: string[];
  exit: (code?: number) => never;
};

declare const require: {
  main: any;
};

declare const module: any;

import { 
  runGameEngineTests,
  runBlockSystemTests,
  runGameBoardTests,
  runScoreSystemTests,

  runIntegrationTests
} from './index';

// 测试运行器
class TestRunner {
  private totalTests = 0;
  private passedTests = 0;
  private failedTests = 0;
  private startTime = 0;

  // 运行所有测试
  async runAll(): Promise<void> {
    console.log('🚀 Starting All Tests...\n');
    this.startTime = Date.now();

    try {
      const results = await Promise.all([
        this.runTestSuite('Game Engine', runGameEngineTests),
        this.runTestSuite('Block System', runBlockSystemTests),
        this.runTestSuite('Game Board', runGameBoardTests),
        this.runTestSuite('Score System', runScoreSystemTests),

        this.runTestSuite('Integration', runIntegrationTests),
      ]);

      this.printSummary(results);
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  // 运行单个测试套件
  private async runTestSuite(name: string, testFunction: () => Promise<boolean>): Promise<{
    name: string;
    passed: boolean;
    duration: number;
  }> {
    const startTime = Date.now();
    console.log(`📋 Running ${name} Tests...`);
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      if (result) {
        console.log(`✅ ${name} Tests: PASSED (${duration}ms)\n`);
        this.passedTests++;
      } else {
        console.log(`❌ ${name} Tests: FAILED (${duration}ms)\n`);
        this.failedTests++;
      }
      
      this.totalTests++;
      
      return {
        name,
        passed: result,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`💥 ${name} Tests: ERROR - ${error} (${duration}ms)\n`);
      this.failedTests++;
      this.totalTests++;
      
      return {
        name,
        passed: false,
        duration
      };
    }
  }

  // 打印测试总结
  private printSummary(results: Array<{name: string; passed: boolean; duration: number}>): void {
    const totalDuration = Date.now() - this.startTime;
    
    console.log('=' .repeat(60));
    console.log('🎯 TEST SUMMARY');
    console.log('=' .repeat(60));
    
    results.forEach(result => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status} ${result.name.padEnd(20)} (${result.duration}ms)`);
    });
    
    console.log('-'.repeat(60));
    console.log(`📊 Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`⏱️ Total Time: ${totalDuration}ms`);
    console.log(`📈 Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.failedTests === 0) {
      console.log('\n🎉 All tests passed! 🎉');
      process.exit(0);
    } else {
      console.log(`\n💔 ${this.failedTests} test suite(s) failed.`);
      process.exit(1);
    }
  }

  // 运行特定测试
  async runSpecific(testName: string): Promise<void> {
    console.log(`🎯 Running ${testName} Tests...\n`);
    this.startTime = Date.now();

    let testFunction: (() => Promise<boolean>) | null = null;

    switch (testName.toLowerCase()) {
      case 'engine':
      case 'gameengine':
        testFunction = runGameEngineTests;
        break;
      case 'block':
      case 'blocksystem':
        testFunction = runBlockSystemTests;
        break;
      case 'board':
      case 'gameboard':
        testFunction = runGameBoardTests;
        break;
      case 'score':
      case 'scoresystem':
        testFunction = runScoreSystemTests;
        break;

      case 'integration':
        testFunction = runIntegrationTests;
        break;
      case 'all':
        await this.runAll();
        return;
      default:
        console.log(`❌ Unknown test suite: ${testName}`);
        console.log('Available test suites: engine, block, board, score, integration, all');
        process.exit(1);
    }

    if (testFunction) {
      const result = await this.runTestSuite(testName, testFunction);
      this.printSummary([result]);
    }
  }
}

// 主函数
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const testRunner = new TestRunner();

  if (args.length === 0) {
    // 运行所有测试
    await testRunner.runAll();
  } else {
    // 运行特定测试
    const testName = args[0];
    await testRunner.runSpecific(testName);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

export { TestRunner };
