# 测试指南

本项目已配置 Jest 单元测试框架。

## 快速开始

```bash
# 安装依赖（如果还没安装）
pnpm install

# 运行测试
pnpm test

# 监听模式（开发时推荐）
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

## 测试结构

```
__tests__/
├── setup.ts              # 测试环境配置
├── DragScroll.test.ts    # 主要测试文件
├── example.test.ts       # 测试示例
└── README.md             # 测试说明
```

## 已安装的测试依赖

- `jest` - 测试框架
- `@types/jest` - Jest TypeScript 类型定义
- `ts-jest` - TypeScript 支持
- `jest-environment-jsdom` - DOM 环境模拟
- `@testing-library/dom` - DOM 测试工具

## 测试配置

配置文件位于 `jest.config.mjs`，主要配置包括：

- 使用 `ts-jest` 预设处理 TypeScript
- 使用 `jsdom` 环境模拟浏览器
- 测试文件位于 `__tests__` 目录
- 覆盖率报告输出到 `coverage` 目录

## 当前测试覆盖率

```
----------|---------|----------|---------|---------|---------
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|---------
All files |   82.35 |    66.12 |   88.46 |   84.48 |
 index.ts |   82.35 |    66.12 |   88.46 |   84.48 |
----------|---------|----------|---------|---------|---------
```

## 测试内容

### DragScroll.test.ts

主要测试文件，包含以下测试套件：

1. **构造函数** - 测试实例创建、参数验证、默认选项
2. **属性访问器** - 测试 width、height、readonly、canDrag 属性
3. **resize 方法** - 测试尺寸调整功能
4. **innerHtml 方法** - 测试内容设置功能
5. **scrollToY 方法** - 测试滚动定位功能
6. **事件处理** - 测试拖拽事件（pointerdown、pointermove、pointerup）
7. **destroy 方法** - 测试资源清理
8. **滚动条** - 测试滚动条渲染
9. **边界情况** - 测试边界限制

### example.test.ts

示例测试文件，展示如何编写测试用例：

- 测试默认配置
- 测试自定义内容
- 测试回调函数

## 编写新测试

参考 `__tests__/example.test.ts` 文件，基本结构如下：

```typescript
import DragScroll from '../src/index';

describe('测试套件名称', () => {
  let container: HTMLElement;
  let dragScroll: DragScroll;

  beforeEach(() => {
    // 每个测试前的准备工作
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // 每个测试后的清理工作
    if (dragScroll) {
      dragScroll.destroy();
    }
    document.body.removeChild(container);
  });

  it('测试用例描述', () => {
    // 测试代码
    dragScroll = new DragScroll(container);
    expect(dragScroll).toBeInstanceOf(DragScroll);
  });
});
```

## 注意事项

1. **jsdom 限制**：jsdom 不会自动计算元素布局，需要手动设置尺寸：
   ```typescript
   Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });
   ```

2. **PointerEvent**：jsdom 不支持 PointerEvent，已在 `setup.ts` 中提供 polyfill

3. **异步操作**：如果测试涉及异步操作，使用 `async/await` 或 `done` 回调

4. **Mock 函数**：使用 `jest.fn()` 创建 mock 函数来测试回调

## CI/CD 集成

可以在 CI/CD 流程中添加测试步骤：

```yaml
# GitHub Actions 示例
- name: Run tests
  run: pnpm test

- name: Generate coverage
  run: pnpm test:coverage
```

## 查看覆盖率报告

运行 `pnpm test:coverage` 后，可以在以下位置查看详细报告：

- 终端输出：简要覆盖率统计
- `coverage/lcov-report/index.html`：HTML 格式的详细报告（在浏览器中打开）

## 持续改进

建议定期：

1. 增加测试用例以提高覆盖率
2. 测试边界情况和异常场景
3. 添加集成测试
4. 更新测试以匹配新功能
