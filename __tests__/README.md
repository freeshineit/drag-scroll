# DragScroll 单元测试

本项目使用 Jest 进行单元测试。

## 测试覆盖范围

测试文件覆盖了 DragScroll 类的以下功能：

- ✅ 构造函数和初始化
- ✅ 属性访问器（width, height, readonly, canDrag）
- ✅ resize 方法
- ✅ innerHtml 方法
- ✅ scrollToY 方法
- ✅ 事件处理（pointerdown, pointermove, pointerup）
- ✅ destroy 方法
- ✅ 滚动条渲染
- ✅ 边界情况处理

## 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式（开发时使用）
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

## 测试覆盖率

当前测试覆盖率：
- Statements: 82.35%
- Branches: 66.12%
- Functions: 88.46%
- Lines: 84.48%

## 测试文件结构

```
__tests__/
├── setup.ts              # Jest 测试环境配置
├── DragScroll.test.ts    # DragScroll 类的单元测试
└── README.md             # 本文件
```

## 配置文件

- `jest.config.mjs` - Jest 配置文件
- `__tests__/setup.ts` - 测试环境设置，包括 PointerEvent polyfill

## 注意事项

1. 测试使用 jsdom 环境模拟浏览器 DOM
2. PointerEvent 在 jsdom 中不可用，已在 setup.ts 中进行 polyfill
3. 由于 jsdom 不会自动计算布局，测试中使用 `Object.defineProperty` 手动设置元素尺寸
