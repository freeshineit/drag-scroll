/**
 * 这是一个测试示例文件，展示如何为 DragScroll 编写额外的测试
 * 
 * 你可以参考这个文件来添加更多的测试用例
 */

import DragScroll from '../src/index';

describe('DragScroll 示例测试', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('示例：测试默认配置', () => {
    const dragScroll = new DragScroll(container);
    
    expect(dragScroll.options.width).toBe('100%');
    expect(dragScroll.options.height).toBe('400px');
    expect(dragScroll.readonly).toBe(false);
    
    dragScroll.destroy();
  });

  it('示例：测试自定义内容', () => {
    const customContent = '<div class="custom">自定义内容</div>';
    const dragScroll = new DragScroll(container, {
      content: customContent,
    });
    
    expect(dragScroll.$content.innerHTML).toBe(customContent);
    
    dragScroll.destroy();
  });

  it('示例：测试回调函数', () => {
    const mockCallback = jest.fn();
    const dragScroll = new DragScroll(container, {
      content: '<div style="height: 1000px;">长内容</div>',
      onChange: mockCallback,
    });
    
    // 设置尺寸以支持滚动
    Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });
    Object.defineProperty(dragScroll.$content, 'scrollHeight', { value: 1000, writable: true });
    
    // 触发滚动
    dragScroll.scrollToY(100);
    
    // 验证回调被调用
    expect(mockCallback).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        y: 100,
        velocity: expect.any(Number),
      })
    );
    
    dragScroll.destroy();
  });
});
