# 测试使用说明

## 基本用法

```bash
# 运行所有测试
npm run test

# 运行所有测试（显式指定）
npm run test -- all
```

## 模块化测试

```bash
# 游戏引擎测试
npm run test -- engine

# 方块系统测试
npm run test -- block

# 游戏板测试
npm run test -- board

# 分数系统测试
npm run test -- score

# 存储系统测试
npm run test -- storage

# 集成测试
npm run test -- integration
```

## 测试结果

- ✅ **PASSED**: 测试通过
- ❌ **FAILED**: 测试失败
- ⚠️ **WARNING**: 部分测试失败

## 当前状态

- **总测试数**: 185
- **通过率**: 98%
- **主要问题**: `requestAnimationFrame` 在 Node.js 环境中未定义

## 注意事项

1. 所有测试都使用 `tsx` 运行，支持 TypeScript 和路径别名
2. 测试配置使用 `tsconfig.app.json`
3. 可以通过参数灵活运行不同的测试模块
