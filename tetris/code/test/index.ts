// 测试入口文件
import { testRunner } from './utils/testUtils';
import { GameEngineTest } from './gameEngineTest';
import { BlockSystemTest } from './blockSystemTest';
import { GameBoardTest } from './gameBoardTest';
import { ScoreSystemTest } from './scoreSystemTest';

import { IntegrationTest } from './integration/integrationTest';
import { StorageSystemTest } from './storageSystemTest';

// 注册所有测试
export const setupTests = (): void => {
  testRunner.addTest(new GameEngineTest());
  testRunner.addTest(new BlockSystemTest());
  testRunner.addTest(new GameBoardTest());
  testRunner.addTest(new ScoreSystemTest());

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

export { IntegrationTest } from './integration/integrationTest';
export { StorageSystemTest } from './storageSystemTest';
export { BaseTest, TestRunner, MockDataGenerator, PerformanceTestUtils } from './utils/testUtils';
