
// 测试入口文件
declare const global: {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
};

// Node.js 环境下的 requestAnimationFrame polyfill
if (typeof requestAnimationFrame === 'undefined') {
  (global as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(callback, 1000 / 60);
  };
  (global as any).cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
}

import { testRunner } from './utils/testUtils';
import { GameEngineTest } from './gameEngineTest';
import { BlockSystemTest } from './blockSystemTest';
import { GameBoardTest } from './gameBoardTest';
import { ScoreSystemTest } from './scoreSystemTest';
import { TouchControlsTest } from './touchControlsTest';
import { GameModeTest } from './gameModeTest';
import { SpecialBlockTest } from './specialBlockTest';
import { ThemeTest } from './themeTest';
import { AudioTest } from './audioTest';
import { AchievementTest } from './achievementTest';
import { SettingsTest } from './settingsTest';

import { IntegrationTest } from './integration/integrationTest';
import { StorageSystemTest } from './storageSystemTest';

// 注册所有测试
export const setupTests = (): void => {
  testRunner.addTest(new GameEngineTest());
  testRunner.addTest(new BlockSystemTest());
  testRunner.addTest(new GameBoardTest());
  testRunner.addTest(new ScoreSystemTest());
  testRunner.addTest(new TouchControlsTest());
  testRunner.addTest(new GameModeTest());
  testRunner.addTest(new SpecialBlockTest());
  testRunner.addTest(new ThemeTest());
  testRunner.addTest(new AudioTest());
  testRunner.addTest(new AchievementTest());
  testRunner.addTest(new SettingsTest());

  testRunner.addTest(new IntegrationTest());
  testRunner.addTest(new StorageSystemTest());
};

// 运行所有测试
export const runAllTests = async (): Promise<boolean> => {
  setupTests();
  const results = await testRunner.runAllTests();
  return results.every(result => result.passed);
};

// 单独运行游戏引擎测试
export const runGameEngineTests = async (): Promise<boolean> => {
  const test = new GameEngineTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行方块系统测试
export const runBlockSystemTests = async (): Promise<boolean> => {
  const test = new BlockSystemTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行游戏板测试
export const runGameBoardTests = async (): Promise<boolean> => {
  const test = new GameBoardTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行分数系统测试
export const runScoreSystemTests = async (): Promise<boolean> => {
  const test = new ScoreSystemTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行触摸控制测试
export const runTouchControlsTests = async (): Promise<boolean> => {
  const test = new TouchControlsTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行游戏模式测试
export const runGameModeTests = async (): Promise<boolean> => {
  const test = new GameModeTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行特殊方块测试
export const runSpecialBlockTests = async (): Promise<boolean> => {
  const test = new SpecialBlockTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行主题测试
export const runThemeTests = async (): Promise<boolean> => {
  const test = new ThemeTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行音效测试
export const runAudioTests = async (): Promise<boolean> => {
  const test = new AudioTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行成就测试
export const runAchievementTests = async (): Promise<boolean> => {
  const test = new AchievementTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行设置测试
export const runSettingsTests = async (): Promise<boolean> => {
  const test = new SettingsTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};




// 单独运行集成测试
export const runIntegrationTests = async (): Promise<boolean> => {
  const test = new IntegrationTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 单独运行存储系统测试
export const runStorageSystemTests = async (): Promise<boolean> => {
  const test = new StorageSystemTest();
  await test.runAllTests();
  const results = test.getResults();
  return results.every(result => result.passed);
};

// 导出测试类供直接使用
export { GameEngineTest } from './gameEngineTest';
export { BlockSystemTest } from './blockSystemTest';
export { GameBoardTest } from './gameBoardTest';
export { ScoreSystemTest } from './scoreSystemTest';
export { TouchControlsTest } from './touchControlsTest';
export { GameModeTest } from './gameModeTest';
export { SpecialBlockTest } from './specialBlockTest';
export { ThemeTest } from './themeTest';
export { AudioTest } from './audioTest';
export { AchievementTest } from './achievementTest';

export { IntegrationTest } from './integration/integrationTest';
export { StorageSystemTest } from './storageSystemTest';
export { BaseTest, TestRunner, MockDataGenerator, PerformanceTestUtils } from './utils/testUtils';


// Node.js 类型声明
declare const process: {
  argv: string[];
  exit: (code?: number) => never;
};

declare const require: {
  main: any;
};

// 命令行参数处理
const args = process.argv.slice(2);
const testType = args[0];

// 根据参数运行不同的测试
async function runTests() {
  console.log('🚀 Starting Tests...\n');
  
  switch (testType) {
    case 'engine':
      console.log('🎮 Running Game Engine Tests...');
      const engineResult = await runGameEngineTests();
      console.log(`Game Engine Tests: ${engineResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'block':
      console.log('🧩 Running Block System Tests...');
      const blockResult = await runBlockSystemTests();
      console.log(`Block System Tests: ${blockResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'board':
      console.log('🎯 Running Game Board Tests...');
      const boardResult = await runGameBoardTests();
      console.log(`Game Board Tests: ${boardResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'score':
      console.log('📊 Running Score System Tests...');
      const scoreResult = await runScoreSystemTests();
      console.log(`Score System Tests: ${scoreResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'touch':
      console.log('👆 Running Touch Controls Tests...');
      const touchResult = await runTouchControlsTests();
      console.log(`Touch Controls Tests: ${touchResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'mode':
      console.log('🎮 Running Game Mode Tests...');
      const modeResult = await runGameModeTests();
      console.log(`Game Mode Tests: ${modeResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'special':
      console.log('💣 Running Special Block Tests...');
      const specialResult = await runSpecialBlockTests();
      console.log(`Special Block Tests: ${specialResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'theme':
      console.log('🎨 Running Theme Tests...');
      const themeResult = await runThemeTests();
      console.log(`Theme Tests: ${themeResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'audio':
      console.log('🔊 Running Audio Tests...');
      const audioResult = await runAudioTests();
      console.log(`Audio Tests: ${audioResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'achievement':
      console.log('🏆 Running Achievement Tests...');
      const achievementResult = await runAchievementTests();
      console.log(`Achievement Tests: ${achievementResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'settings':
      console.log('⚙️ Running Settings Tests...');
      const settingsResult = await runSettingsTests();
      console.log(`Settings Tests: ${settingsResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
      
    case 'storage':
      console.log('💾 Running Storage System Tests...');
      const storageResult = await runStorageSystemTests();
      console.log(`Storage System Tests: ${storageResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'integration':
      console.log('🔗 Running Integration Tests...');
      const integrationResult = await runIntegrationTests();
      console.log(`Integration Tests: ${integrationResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
      
    case 'all':
    default:
      console.log('🎯 Running All Tests...');
      const allResult = await runAllTests();
      console.log(`All Tests: ${allResult ? '✅ PASSED' : '❌ FAILED'}`);
      break;
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
}
