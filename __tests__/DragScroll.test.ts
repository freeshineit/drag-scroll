import DragScroll from '../src/index';
import type { DragScrollOptions, DragScrollState } from '../src/index';

describe('DragScroll', () => {
  let container: HTMLElement;
  let dragScroll: DragScroll;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '400px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // 清理
    if (dragScroll) {
      dragScroll.destroy();
    }
    document.body.removeChild(container);
  });

  describe('构造函数', () => {
    it('应该成功创建实例', () => {
      dragScroll = new DragScroll(container);
      expect(dragScroll).toBeInstanceOf(DragScroll);
      expect(dragScroll.$container).toBe(container);
    });

    it('应该在没有容器时抛出错误', () => {
      expect(() => {
        new DragScroll(null as any);
      }).toThrow('container is required');
    });

    it('应该在容器是不支持的元素时抛出错误', () => {
      const video = document.createElement('video');
      expect(() => {
        new DragScroll(video);
      }).toThrow("container cannot be 'VIDEO', 'CANVAS', 'IMG', 'TEXTAREA', 'INPUT' element");
    });

    it('应该应用默认选项', () => {
      dragScroll = new DragScroll(container);
      expect(dragScroll.options.width).toBe('100%');
      expect(dragScroll.options.height).toBe('400px');
      expect(dragScroll.options.readonly).toBe(false);
      expect(dragScroll.options.hideScrollbar).toBe(false);
    });

    it('应该应用自定义选项', () => {
      const options: DragScrollOptions = {
        width: '500px',
        height: '600px',
        content: '<div>Test Content</div>',
        readonly: true,
        hideScrollbar: true,
      };
      dragScroll = new DragScroll(container, options);
      expect(dragScroll.options.width).toBe('500px');
      expect(dragScroll.options.height).toBe('600px');
      expect(dragScroll.options.readonly).toBe(true);
      expect(dragScroll.options.hideScrollbar).toBe(true);
    });
  });

  describe('属性访问器', () => {
    beforeEach(() => {
      dragScroll = new DragScroll(container, {
        width: '300px',
        height: '400px',
      });
      // 手动设置容器尺寸，因为 jsdom 不会自动计算布局
      Object.defineProperty(container, 'clientWidth', { value: 300, writable: true });
      Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });
    });

    it('应该返回正确的宽度', () => {
      expect(dragScroll.width).toBe(300);
    });

    it('应该返回正确的高度', () => {
      expect(dragScroll.height).toBe(400);
    });

    it('应该正确设置和获取 readonly 属性', () => {
      expect(dragScroll.readonly).toBe(false);
      dragScroll.readonly = true;
      expect(dragScroll.readonly).toBe(true);
      expect(container.style.cursor).toBe('not-allowed');
    });

    it('应该根据内容高度正确判断 canDrag', () => {
      // 内容高度小于容器高度
      dragScroll.innerHtml('<div style="height: 100px;">Short Content</div>');
      Object.defineProperty(dragScroll.$content, 'offsetHeight', { value: 100, writable: true });
      expect(dragScroll.canDrag).toBe(false);

      // 内容高度大于容器高度
      dragScroll.innerHtml('<div style="height: 1000px;">Long Content</div>');
      Object.defineProperty(dragScroll.$content, 'offsetHeight', { value: 1000, writable: true });
      Object.defineProperty(dragScroll.$content, 'scrollHeight', { value: 1000, writable: true });
      expect(dragScroll.canDrag).toBe(true);
    });
  });

  describe('resize 方法', () => {
    beforeEach(() => {
      dragScroll = new DragScroll(container);
    });

    it('应该使用数字设置尺寸', () => {
      dragScroll.resize(500, 600);
      expect(container.style.width).toContain('500px');
      expect(container.style.height).toContain('600px');
    });

    it('应该使用字符串设置尺寸', () => {
      dragScroll.resize('80%', '50vh');
      expect(container.style.width).toContain('80%');
      expect(container.style.height).toContain('50vh');
    });
  });

  describe('innerHtml 方法', () => {
    beforeEach(() => {
      dragScroll = new DragScroll(container);
    });

    it('应该使用字符串设置内容', () => {
      const content = '<div class="test">Test Content</div>';
      dragScroll.innerHtml(content);
      expect(dragScroll.$content.innerHTML).toBe(content);
    });

    it('应该使用函数设置内容', () => {
      const content = '<div class="test">Dynamic Content</div>';
      dragScroll.innerHtml(() => content);
      expect(dragScroll.$content.innerHTML).toBe(content);
    });
  });

  describe('scrollToY 方法', () => {
    beforeEach(() => {
      dragScroll = new DragScroll(container, {
        content: '<div style="height: 1000px;">Long Content</div>',
      });
      // 设置容器和内容尺寸
      Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });
      Object.defineProperty(dragScroll.$content, 'scrollHeight', { value: 1000, writable: true });
    });

    it('应该滚动到指定位置', () => {
      dragScroll.scrollToY(200);
      expect(dragScroll.currentY).toBe(200);
    });

    it('应该忽略负值', () => {
      dragScroll.scrollToY(-100);
      expect(dragScroll.currentY).toBe(0);
    });

    it('应该忽略超出最大滚动范围的值', () => {
      const maxScroll = dragScroll.$content.scrollHeight - dragScroll.$container.clientHeight;
      dragScroll.scrollToY(maxScroll + 100);
      // 超出范围的值会被忽略，currentY 保持为 0
      expect(dragScroll.currentY).toBe(0);
    });

    it('应该在滚动时触发 onChange 回调', () => {
      const onChange = jest.fn();
      dragScroll = new DragScroll(container, {
        content: '<div style="height: 1000px;">Long Content</div>',
        onChange,
      });
      // 设置容器和内容尺寸
      Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });
      Object.defineProperty(dragScroll.$content, 'scrollHeight', { value: 1000, writable: true });
      
      dragScroll.scrollToY(100);
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('事件处理', () => {
    let onChange: jest.Mock;
    let onDragStart: jest.Mock;
    let onDragEnd: jest.Mock;
    let onDragging: jest.Mock;

    beforeEach(() => {
      onChange = jest.fn();
      onDragStart = jest.fn();
      onDragEnd = jest.fn();
      onDragging = jest.fn();

      dragScroll = new DragScroll(container, {
        content: '<div style="height: 1000px;">Long Content</div>',
        onChange,
        onDragStart,
        onDragEnd,
        onDragging,
      });
      
      // 设置容器和内容尺寸以支持拖拽
      Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });
      Object.defineProperty(dragScroll.$content, 'offsetHeight', { value: 1000, writable: true });
      Object.defineProperty(dragScroll.$content, 'scrollHeight', { value: 1000, writable: true });
    });

    it('应该在 pointerdown 时触发 onDragStart', () => {
      const event = new PointerEvent('pointerdown', {
        clientY: 100,
        bubbles: true,
      });
      container.dispatchEvent(event);
      expect(onDragStart).toHaveBeenCalledWith(event);
      expect(dragScroll.isDragging).toBe(true);
    });

    it('应该在 pointermove 时触发 onDragging', () => {
      // 开始拖拽
      const downEvent = new PointerEvent('pointerdown', {
        clientY: 100,
        bubbles: true,
      });
      container.dispatchEvent(downEvent);

      // 移动
      const moveEvent = new MouseEvent('pointermove', {
        clientY: 150,
        bubbles: true,
      });
      document.dispatchEvent(moveEvent);

      expect(onDragging).toHaveBeenCalled();
    });

    it('应该在 pointerup 时触发 onDragEnd', () => {
      // 开始拖拽
      const downEvent = new PointerEvent('pointerdown', {
        clientY: 100,
        bubbles: true,
      });
      container.dispatchEvent(downEvent);

      // 结束拖拽
      const upEvent = new PointerEvent('pointerup', {
        clientY: 150,
        bubbles: true,
      });
      document.dispatchEvent(upEvent);

      expect(onDragEnd).toHaveBeenCalledWith(upEvent);
      expect(dragScroll.isDragging).toBe(false);
    });

    it('应该在只读模式下不触发拖拽事件', () => {
      dragScroll.readonly = true;

      const event = new PointerEvent('pointerdown', {
        clientY: 100,
        bubbles: true,
      });
      container.dispatchEvent(event);

      expect(onDragStart).not.toHaveBeenCalled();
      expect(dragScroll.isDragging).toBe(false);
    });
  });

  describe('destroy 方法', () => {
    it('应该清理所有资源', () => {
      dragScroll = new DragScroll(container, {
        content: '<div>Test</div>',
      });

      const contentElement = dragScroll.$content;
      dragScroll.destroy();

      expect(dragScroll.$content).toBeNull();
      expect(container.style.cursor).toBe('default');
    });

    it('应该移除事件监听器', () => {
      dragScroll = new DragScroll(container, {
        content: '<div style="height: 1000px;">Long Content</div>',
      });

      const onDragStart = jest.fn();
      dragScroll.options.onDragStart = onDragStart;

      dragScroll.destroy();

      const event = new PointerEvent('pointerdown', {
        clientY: 100,
        bubbles: true,
      });
      container.dispatchEvent(event);

      // 事件不应该被触发，因为监听器已被移除
      expect(onDragStart).not.toHaveBeenCalled();
    });
  });

  describe('滚动条', () => {
    it('应该在 hideScrollbar 为 false 时渲染滚动条', () => {
      dragScroll = new DragScroll(container, {
        hideScrollbar: false,
      });
      const scrollbar = container.querySelector('.drag-scroll-scrollbar');
      expect(scrollbar).not.toBeNull();
    });

    it('应该在 hideScrollbar 为 true 时不渲染滚动条', () => {
      dragScroll = new DragScroll(container, {
        hideScrollbar: true,
      });
      const scrollbar = container.querySelector('.drag-scroll-scrollbar');
      expect(scrollbar).toBeNull();
    });
  });

  describe('边界情况', () => {
    beforeEach(() => {
      dragScroll = new DragScroll(container, {
        content: '<div style="height: 1000px;">Long Content</div>',
      });
      // 设置容器和内容尺寸
      Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });
      Object.defineProperty(dragScroll.$content, 'offsetHeight', { value: 1000, writable: true });
      Object.defineProperty(dragScroll.$content, 'scrollHeight', { value: 1000, writable: true });
    });

    it('应该限制滚动在顶部边界', () => {
      dragScroll.currentY = -100;
      dragScroll['_applyTransform']();
      expect(dragScroll.currentY).toBe(0);
    });

    it('应该限制滚动在底部边界', () => {
      const maxScroll = dragScroll.$content.scrollHeight - dragScroll.$container.clientHeight;
      dragScroll.currentY = maxScroll + 100;
      dragScroll['_applyTransform']();
      expect(dragScroll.currentY).toBe(maxScroll);
    });
  });
});
