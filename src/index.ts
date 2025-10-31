/**
 * 拖拽滚动参数
 */
export interface DragScrollOptions {
  /** 容器宽度, 默认 100% */
  width?: number | string;
  /** 容器高度, 默认 400px */
  height?: number | string;
  /**
   * 滚动内容, 默认空字符串
   */
  content?: string | (() => string);
  /**
   * 拖拽开始回调
   * @param e MouseEvent | TouchEvent - 触发拖拽开始的事件对象
   */
  onDragStart?: (e: MouseEvent | TouchEvent) => void;
  /**
   * 拖拽结束回调
   * @param e MouseEvent | TouchEvent - 触发拖拽开始的事件对象
   */
  onDragEnd?: (e: MouseEvent | TouchEvent) => void;
  /**
   * 拖拽过程中回调
   * @param x number - 当前鼠标或触摸拖拽过程的 X 坐标
   * @param y number - 当前鼠标或触摸拖拽过程的 Y 坐标
   */
  onDragging?: (x: number, y: number) => void;
}
/**
 * 默认参数
 */
const _$DRAG_SCROLL_DEFAULT_OPTIONS$_: DragScrollOptions = {
  content: '',
  width: '100%',
  height: '400px',
};

/**
 * 前缀类名
 */
const _$DRAG_SCROLL_PREFIX_CLASSNAME$_ = 'drag-scroll';

/**
 * 拖拽滚动
 * @class DragScroll
 * @example
 * ```ts
 * const container = document.getElementById('scrollContainer');
 * const dragScroll = new DragScroll(container, {
 *   width: '300px',
 *   height: '500px',
 *   content: '<div>...</div>',
 * });
 * ```
 */
class DragScroll {
  $container: HTMLElement;
  $content: HTMLElement;
  options: Required<DragScrollOptions>;
  isDragging: boolean;
  startY: number;
  currentY: number;
  velocity: number;
  animationId!: number;
  lastTimestamp!: number;
  spring: number;
  friction: number;
  bounceDamping: number;
  maxVelocity: number;

  // private
  private _indicatorTimeout: number | null = null;
  private _$scrollbar: HTMLElement | null;
  private _$scrollbarThumb: HTMLElement | null;
  private _$scrollIndicator: HTMLElement | null;
  private _$positionInfo: HTMLElement | null;
  private _$velocityInfo: HTMLElement | null;

  constructor(container: HTMLElement, options: Partial<DragScrollOptions> = {}) {
    this.$container = container;
    this.options = Object.assign({}, _$DRAG_SCROLL_DEFAULT_OPTIONS$_, options) as Required<DragScrollOptions>;

    this.$container.classList.add(_$DRAG_SCROLL_PREFIX_CLASSNAME$_, `${_$DRAG_SCROLL_PREFIX_CLASSNAME$_}-container`);

    this.$content = document.createElement('div');
    this.$content.classList.add(`${_$DRAG_SCROLL_PREFIX_CLASSNAME$_}-content`);
    this.innerHtml(this.options.content);
    this.$container.appendChild(this.$content);

    this.isDragging = false;
    this.startY = 0;
    this.currentY = 0;
    this.velocity = 0;
    this.animationId = null!;
    this.lastTimestamp = 0;

    // 物理参数
    this.spring = 0.25; // 弹性系数
    this.friction = 0.92; // 摩擦力
    this.bounceDamping = 0.6; // 边界反弹阻尼
    this.maxVelocity = 30; // 最大速度限制

    // DOM 元素
    this._$scrollbar = document.getElementById('scrollbar');
    this._$scrollbarThumb = document.getElementById('scrollbarThumb');
    this._$scrollIndicator = document.getElementById('scrollIndicator');
    this._$positionInfo = document.getElementById('positionInfo');
    this._$velocityInfo = document.getElementById('velocityInfo');

    this._init();
  }

  /**
   * 获取容器宽度
   * @example
   * ```ts
   * const width = dragScroll.width;
   * ```
   * @return {number}
   */
  get width() {
    return this.$container.clientWidth;
  }

  /**
   * 获取容器高度
   * @example
   * ```ts
   * const height = dragScroll.height;
   * ```
   * @return {number}
   */
  get height() {
    return this.$container.clientHeight;
  }

  /**
   * 设置容器尺寸
   * @param width 容器宽度
   * @param height 容器高度
   * @example
   * ```ts
   * dragScroll.resize(500, '400px');
   * dragScroll.resize('80%', '600px');
   * ```
   */
  resize(width?: number | string, height?: number | string) {
    let css = ``;
    if (typeof width === 'number') {
      css = `width: ${width}px;`;
    } else if (typeof width === 'string') {
      css = `width: ${width};`;
    }
    if (typeof height === 'number') {
      css += `height: ${height}px;`;
    } else if (typeof height === 'string') {
      css += `height: ${height};`;
    }
    this.$container.style.cssText += css;
  }

  /**
   * 设置 HTML 内容
   * @param html HTML 字符串或返回 HTML 字符串的函数
   * @example
   * ```ts
   * dragScroll.innerHtml('<div>New Content</div>');
   * dragScroll.innerHtml(() => '<div>Dynamic Content</div>');
   * ```
   */
  innerHtml(html: string | (() => string)) {
    this.$content.innerHTML = typeof html === 'function' ? html() : html;
  }

  /**
   * 销毁方法，用于清理资源
   * @example
   * ```ts
   * dragScroll.destroy();
   * ```
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null!;
    }

    if (this._indicatorTimeout) {
      clearTimeout(this._indicatorTimeout);
      this._indicatorTimeout = null;
    }

    this._removeEventListeners();
  }

  // ---------------------------------------------------------------------- //
  // 私有方法
  // ---------------------------------------------------------------------- //
  // 初始化
  private _init() {
    this._addEventListeners();

    // 初始化滚动条
    this.updateScrollbar();

    // 初始化控制按钮
    this.setupControls();

    // 初始化动画
    this.animate();
  }

  //  ----------- 事件处理 -----------  //
  /**
   * 添加事件监听器
   */
  private _addEventListeners() {
    // 添加事件监听器
    this.$container.addEventListener('mousedown', this._onMouseDown.bind(this));
    this.$container.addEventListener('touchstart', this._onTouchStart.bind(this));

    document.addEventListener('mousemove', this._onMouseMove.bind(this));
    document.addEventListener('touchmove', this._onTouchMove.bind(this), {
      passive: false,
    });

    document.addEventListener('mouseup', this._onMouseUp.bind(this));
    document.addEventListener('touchend', this._onTouchEnd.bind(this));
  }

  /**
   * 移除事件监听器
   */
  private _removeEventListeners() {
    // 移除事件监听器
    this.$container.removeEventListener('mousedown', this._onMouseDown);
    this.$container.removeEventListener('touchstart', this._onTouchStart);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('touchend', this._onTouchEnd);
  }

  /**
   * 鼠标按下
   * @param e 鼠标事件
   */
  private _onMouseDown(e: MouseEvent) {
    this._startDrag(e.clientY);
  }

  /**
   * 触摸开始
   * @param e 触摸事件
   */
  private _onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      this._startDrag(e.touches[0].clientY);
      e.preventDefault();
    }
  }

  /**
   * 开始拖拽
   * @param clientY 鼠标或触摸的 Y 坐标
   */
  private _startDrag(clientY: number) {
    this.isDragging = true;
    this.startY = clientY;
    this.velocity = 0;

    // 显示拖动指示器和滚动条
    this.showIndicator();
    this._$scrollbar?.classList.add('drag-scroll-show');

    // 更新光标样式
    this.$container.style.cursor = 'grabbing';
  }

  /**
   * 鼠标移动
   * @param e 鼠标事件
   */
  private _onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    this._drag(e.clientY);
  }

  /**
   * 触摸移动
   * @param e 触摸事件
   */
  private _onTouchMove(e: TouchEvent) {
    if (!this.isDragging || e.touches.length !== 1) return;
    this._drag(e.touches[0].clientY);
    e.preventDefault();
  }

  /**
   * 拖动
   * @param clientY 鼠标或触摸的 Y 坐标
   */
  private _drag(clientY: number) {
    const deltaY = this.startY - clientY;
    this.startY = clientY;

    // 更新位置
    this.currentY += deltaY;

    // 计算速度（用于惯性滚动）
    this.velocity = deltaY;

    // 限制速度
    this.velocity = Math.max(Math.min(this.velocity, this.maxVelocity), -this.maxVelocity);

    this.applyTransform();
    this.updateScrollbar();
    this.updateStats();
  }

  /**
   * 鼠标释放
   */
  private _onMouseUp() {
    this._endDrag();
  }

  /**
   * 触摸结束
   */
  private _onTouchEnd() {
    this._endDrag();
  }

  /**
   * 结束拖动
   */
  private _endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // 恢复光标样式
    this.$container.style.cursor = 'grab';

    // 隐藏指示器
    this.hideIndicator();

    // 延迟隐藏滚动条
    setTimeout(() => {
      if (!this.isDragging) this._$scrollbar?.classList.remove('drag-scroll-show');
    }, 1500);
  }

  applyTransform() {
    const maxScroll = this.$content.scrollHeight - this.$container.clientHeight;

    // 边界检查与弹性效果
    if (this.currentY < 0) {
      // 超出顶部边界
      this.currentY = this.currentY * this.bounceDamping;
      this.velocity *= this.bounceDamping;
    } else if (this.currentY > maxScroll) {
      // 超出底部边界
      this.currentY = maxScroll + (this.currentY - maxScroll) * this.bounceDamping;
      this.velocity *= this.bounceDamping;
    }

    // 应用 transform
    this.$content.style.transform = `translate3d(0, ${-this.currentY}px, 0)`;
  }

  animate(timestamp = 0) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const deltaTime = Math.min(timestamp - this.lastTimestamp, 100) / 16; // 限制最大时间增量
    this.lastTimestamp = timestamp as number;

    if (!this.isDragging) {
      // 惯性滚动
      this.velocity *= this.friction;
      this.currentY += this.velocity;

      // 弹性回弹
      const maxScroll = this.$content.scrollHeight - this.$container.clientHeight;

      if (this.currentY < 0) {
        // 顶部弹性
        this.velocity -= this.currentY * this.spring * deltaTime;
      } else if (this.currentY > maxScroll) {
        // 底部弹性
        this.velocity -= (this.currentY - maxScroll) * this.spring * deltaTime;
      }

      this.applyTransform();
      this.updateScrollbar();
      this.updateStats();

      // 当速度足够小时停止动画
      if (Math.abs(this.velocity) < 0.1 && this.currentY >= 0 && this.currentY <= maxScroll) {
        this.velocity = 0;
      }
    }

    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }

  updateScrollbar() {
    const containerHeight = this.$container.clientHeight;
    const contentHeight = this.$content.scrollHeight;
    const maxScroll = contentHeight - containerHeight;

    if (maxScroll <= 0) {
      if (this._$scrollbarThumb) this._$scrollbarThumb.style.height = '0';
      return;
    }

    // 计算滚动条高度和位置
    const thumbHeight = Math.max((containerHeight / contentHeight) * containerHeight, 20);
    const thumbPosition = (this.currentY / maxScroll) * (containerHeight - thumbHeight);

    if (this._$scrollbarThumb) {
      this._$scrollbarThumb.style.height = `${thumbHeight}px`;
      this._$scrollbarThumb.style.transform = `translateY(${thumbPosition}px)`;
    }
  }

  updateStats() {
    if (this._$positionInfo) {
      this._$positionInfo.textContent = `位置: ${Math.round(this.currentY)}px`;
    }

    if (this._$velocityInfo) {
      this._$velocityInfo.textContent = `速度: ${this.velocity.toFixed(1)}px/帧`;
    }
  }

  showIndicator() {
    this._$scrollIndicator?.classList.add('show');
    if (this._indicatorTimeout) {
      clearTimeout(this._indicatorTimeout);
    }
    // 3秒后自动隐藏
    this._indicatorTimeout = setTimeout(() => {
      this.hideIndicator();
    }, 3000) as unknown as number;
  }

  hideIndicator() {
    this._$scrollIndicator?.classList.remove('show');
  }

  resetPosition() {
    this.currentY = 0;
    this.velocity = 0;
    this.applyTransform();
    this.updateScrollbar();
    this.updateStats();
  }

  scrollToTop() {
    this.currentY = 0;
    this.velocity = 0;
    this.applyTransform();
    this.updateScrollbar();
    this.updateStats();
  }

  scrollToBottom() {
    const maxScroll = this.$content.scrollHeight - this.$container.clientHeight;
    this.currentY = maxScroll;
    this.velocity = 0;
    this.applyTransform();
    this.updateScrollbar();
    this.updateStats();
  }

  setupControls() {
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.resetPosition();
    });

    document.getElementById('toTopBtn')?.addEventListener('click', () => {
      this.scrollToTop();
    });

    document.getElementById('toBottomBtn')?.addEventListener('click', () => {
      this.scrollToBottom();
    });
  }
}

export default DragScroll;
