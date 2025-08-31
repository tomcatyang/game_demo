# 测试目录

这个目录包含所有的测试文件，用于验证游戏功能的正确性。

## 目录结构

```
test/
├── README.md                   # 测试目录说明
├── gameEngineTest.ts          # 游戏引擎测试
├── blockSystemTest.ts         # 方块系统测试（待创建）
├── gameBoardTest.ts           # 游戏板测试（待创建）
├── scoreSystemTest.ts         # 分数系统测试（待创建）
├── storageTest.ts             # 存储系统测试（待创建）
├── utils/                     # 测试工具类
│   ├── testUtils.ts           # 通用测试工具
│   └── mockData.ts            # 模拟数据
└── integration/               # 集成测试
    ├── gameFlowTest.ts        # 游戏流程测试
    └── performanceTest.ts     # 性能测试
```

## 测试规范

### 文件命名
- 单元测试：`[模块名]Test.ts`
- 集成测试：放在 `integration/` 目录下
- 测试工具：放在 `utils/` 目录下

### 导入路径
由于测试文件位于 `test/` 目录，导入源代码时使用相对路径：
```typescript
import { GameEngine } from '../src/services/GameEngine';
import { BlockType } from '../src/types';
```

### 测试类结构
```typescript
export class [ModuleName]Test {
  private testResults: Array<{ name: string; passed: boolean; message?: string }> = [];

  async runAllTests(): Promise<void> {
    // 运行所有测试
  }

  private test[FeatureName](): void {
    // 具体测试方法
  }

  private addTestResult(name: string, passed: boolean, message?: string): void {
    // 添加测试结果
  }

  private printResults(): void {
    // 打印测试结果
  }
}
```

## 运行测试

### 单个测试
```typescript
import { gameEngineTest } from './test/gameEngineTest';
await gameEngineTest.runAllTests();
```

### 批量测试
```typescript
import { runAllTests } from './test/utils/testRunner';
await runAllTests();
```

## 测试类型

1. **单元测试**：测试单个模块或类的功能
2. **集成测试**：测试多个模块协同工作
3. **性能测试**：测试游戏性能和帧率
4. **用户体验测试**：测试触摸操作和响应

## 注意事项

- 所有测试文件都应该包含完整的错误处理
- 测试结果应该有清晰的成功/失败标识
- 复杂的测试应该拆分为多个小的测试方法
- 测试数据应该使用模拟数据，避免依赖外部资源
