/**
 * 拖拽滚动状态
 */
export interface DragScrollState {
  /** 当前平移 X 位置 */
  x: number;
  /** 当前平移 Y 位置 */
  y: number;
  /** 当前滚动速度 */
  velocity: number;
}

/**
 * 拖拽滚动参数
 */
export interface DragScrollOptions {
  /** 容器宽度, 默认 100% */
  width?: number | string;
  /** 容器高度, 默认 400px */
  height?: number | string;
  /** 滚动内容, 默认空字符串 */
  content?: string | (() => string);
  /** 是否只读，默认 false */
  readonly?: boolean;
  /** 隐藏滚动条，默认 false */
  hideScrollbar?: boolean;
  /**
   * 滚动状态改变回调
   * @param state DragScrollState - 当前滚动状态
   */
  onChange?: (state: DragScrollState) => void;
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
  height: '400px',
  readonly: false,
  hideScrollbar: false,
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
  /** 容器元素 classname drag-scroll-container */
  $container: HTMLElement;
  /** 内容容器元素 classname drag-scroll-content */
  $content: HTMLElement;
  /** 配置项 */
  options: Required<DragScrollOptions>;
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 当前平移 Y 位置 */
  currentY: number;
  /** 滚动速度 */
  velocity: number;

  // private
  /** 起始 Y 位置 */
  private _startY: number;
  private _indicatorTimeout: number | null = null;
  /** 滚动条元素 */
  private _$scrollbar: HTMLElement | null = null;
  /** 滚动条指示器元素 */
  private _$scrollbarThumb: HTMLElement | null = null;
  /** 是否只读 */
  private _readonly = false;
  /** 上一帧时间戳 */
  private _lastTimestamp!: number;
  /** 滚动动画 ID */
  private _animationId!: number;
  /** 边界反弹阻尼 */
  private _bounceDamping: number;
  /** 弹性系数, 默认 0.25 */
  private _spring: number;
  /** 摩擦力, 默认 0.92 */
  private _friction: number;
  /** 最大速度限制, 默认 30 */
  private _maxVelocity: number;

  constructor(container: HTMLElement, options: Partial<DragScrollOptions> = {}) {
    this.$container = container;
    this.options = Object.assign({}, _$DRAG_SCROLL_DEFAULT_OPTIONS$_, options) as Required<DragScrollOptions>;
    this.$container.classList.add(_$DRAG_SCROLL_PREFIX_CLASSNAME$_, `${_$DRAG_SCROLL_PREFIX_CLASSNAME$_}-container`);
    this.readonly = this.options.readonly;
    this.$content = document.createElement('div');
    this.$content.classList.add(`${_$DRAG_SCROLL_PREFIX_CLASSNAME$_}-content`);
    this.innerHtml(this.options.content);
    this.$container.appendChild(this.$content);

    this.isDragging = false;
    this._startY = 0;
    this.currentY = 0;
    this.velocity = 0;
    this._animationId = null!;
    this._lastTimestamp = 0;

    // 物理参数
    this._spring = 0.25; // 弹性系数
    this._friction = 0.92; // 摩擦力
    this._bounceDamping = 0.6; // 边界反弹阻尼
    this._maxVelocity = 30; // 最大速度限制

    if (!this.options.hideScrollbar) {
      this._renderScrollbar();
    }

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
   * 只读属性
   */
  get readonly() {
    return this._readonly;
  }

  set readonly(value: boolean) {
    if (this._readonly !== value) {
      this.$container.style.cursor = value ? 'not-allowed' : 'grab';
      this._readonly = value;
    }
  }

  /**
   * 内容是否可滚动
   */
  get canDrag() {
    const clientHeight = this.$content.clientHeight;
    return !this.readonly && clientHeight > this.$container.clientHeight;
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
    if (/^\d+(\.\d+)?$/.test(width + '')) {
      css = `width: ${width}px;`;
    } else if (typeof width === 'string') {
      css = `width: ${width};`;
    }
    if (/^\d+(\.\d+)?$/.test(height + '')) {
      css += `height: ${height}px;`;
    } else if (typeof height === 'string') {
      css += `height: ${height};`;
    }
    this.$container.style.cssText += css;

    this._applyTransform();
    this._updateScrollbar();
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
    this._applyTransform();
    this._updateScrollbar();
  }

  /**
   * Y轴滚动到指定位置
   * @param y Y轴平移值 （正值不支持负值）
   */
  scrollToY(y: number) {
    const maxScroll = this.$content.scrollHeight - this.$container.clientHeight;
    // 边界检查
    if (y < 0 || y > maxScroll) return;
    this.currentY = y;
    this.velocity = 0;
    this._applyTransform();
    this._updateScrollbar();
    this._updateStats();
  }

  /**
   * 销毁方法，用于清理资源
   * @example
   * ```ts
   * dragScroll.destroy();
   * dragScroll = null;
   * ```
   */
  destroy() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null!;
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

  private _renderScrollbar() {
    this._$scrollbar = document.createElement('div');
    this._$scrollbar.className = `${_$DRAG_SCROLL_PREFIX_CLASSNAME$_}-scrollbar`;
    this._$scrollbarThumb = document.createElement('div');
    this._$scrollbarThumb.className = `${_$DRAG_SCROLL_PREFIX_CLASSNAME$_}-scrollbar-thumb`;
    this._$scrollbar.appendChild(this._$scrollbarThumb);
    this.$container.appendChild(this._$scrollbar);
  }

  // 初始化
  private _init() {
    this.resize(this.options.width, this.options.height);
    this._addEventListeners();
    // 初始化滚动条
    this._updateScrollbar();
    // 初始化动画
    this._animate();
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
    if (!this.canDrag) return;
    this._startDrag(e.clientY);
  }

  /**
   * 触摸开始
   * @param e 触摸事件
   */
  private _onTouchStart(e: TouchEvent) {
    if (!this.canDrag) return;
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
    if (!this.canDrag) return;
    this.isDragging = true;
    this._startY = clientY;
    this.velocity = 0;
    this._$scrollbar?.classList.add(`${_$DRAG_SCROLL_PREFIX_CLASSNAME$_}-show`);
    // 更新光标样式
    this.$container.style.cursor = 'grabbing';
  }

  /**
   * 鼠标移动
   * @param e 鼠标事件
   */
  private _onMouseMove(e: MouseEvent) {
    if (!this.canDrag) return;
    if (!this.isDragging) return;
    this._drag(e.clientY);
  }

  /**
   * 触摸移动
   * @param e 触摸事件
   */
  private _onTouchMove(e: TouchEvent) {
    if (!this.canDrag) return;
    if (!this.isDragging || e.touches.length !== 1) return;
    this._drag(e.touches[0].clientY);
    e.preventDefault();
  }

  /**
   * 拖动
   * @param clientY 鼠标或触摸的 Y 坐标
   */
  private _drag(clientY: number) {
    if (!this.canDrag) return;
    const deltaY = this._startY - clientY;
    this._startY = clientY;

    // 更新位置
    this.currentY += deltaY;

    // 计算速度（用于惯性滚动）
    this.velocity = deltaY;

    // 限制速度
    this.velocity = Math.max(Math.min(this.velocity, this._maxVelocity), -this._maxVelocity);

    this._applyTransform();
    this._updateScrollbar();
    this._updateStats();
  }

  /**
   * 鼠标释放
   */
  private _onMouseUp() {
    if (!this.canDrag) return;
    this._endDrag();
  }

  /**
   * 触摸结束
   */
  private _onTouchEnd() {
    if (!this.canDrag) return;
    this._endDrag();
  }

  /**
   * 结束拖动
   */
  private _endDrag() {
    if (!this.canDrag) return;
    if (!this.isDragging) return;
    this.isDragging = false;
    // 恢复光标样式
    this.$container.style.cursor = 'grab';
    // 延迟隐藏滚动条
    setTimeout(() => {
      if (!this.isDragging) this._$scrollbar?.classList.remove('drag-scroll-show');
    }, 1500);
  }

  /**
   * 平移内容
   */
  private _applyTransform() {
    const clientHeight = this.$content.clientHeight;
    // 内容高度小于等于容器高度时，不进行滚动
    if (clientHeight <= this.$container.clientHeight) {
      this.$content.style.transform = `translate3d(0, 0, 0)`;
      return;
    }

    const maxScroll = this.$content.scrollHeight - this.$container.clientHeight;
    // 边界检查与弹性效果
    if (this.currentY < 0) {
      // 超出顶部边界
      this.currentY = this.currentY * this._bounceDamping;
      this.velocity *= this._bounceDamping;
    } else if (this.currentY > maxScroll) {
      // 超出底部边界
      this.currentY = maxScroll + (this.currentY - maxScroll) * this._bounceDamping;
      this.velocity *= this._bounceDamping;
    }
    // 应用 transform
    this.$content.style.transform = `translate3d(0, ${-this.currentY}px, 0)`;
  }

  /**
   * 动画
   * @param timestamp 时间戳
   */
  private _animate(timestamp = 0) {
    const clientHeight = this.$content.clientHeight;
    // 内容高度小于等于容器高度时，不进行滚动
    if (clientHeight <= this.$container.clientHeight) {
      return;
    }

    if (!this._lastTimestamp) this._lastTimestamp = timestamp;
    const deltaTime = Math.min(timestamp - this._lastTimestamp, 100) / 16; // 限制最大时间增量
    this._lastTimestamp = timestamp as number;

    if (!this.isDragging) {
      // 惯性滚动
      this.velocity *= this._friction;
      this.currentY += this.velocity;

      // 弹性回弹
      const maxScroll = this.$content.scrollHeight - this.$container.clientHeight;

      if (this.currentY < 0) {
        // 顶部弹性
        this.velocity -= this.currentY * this._spring * deltaTime;
      } else if (this.currentY > maxScroll) {
        // 底部弹性
        this.velocity -= (this.currentY - maxScroll) * this._spring * deltaTime;
      }

      this._applyTransform();
      this._updateScrollbar();
      this._updateStats();

      // 当速度足够小时停止动画
      if (Math.abs(this.velocity) < 0.1 && this.currentY >= 0 && this.currentY <= maxScroll) {
        this.velocity = 0;
      }
    }

    this._animationId = requestAnimationFrame(this._animate.bind(this));
  }

  /**
   * 更新滚动条
   */
  private _updateScrollbar() {
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

  /**
   * 更新统计信息
   */
  private _updateStats() {
    this.options.onChange?.({
      x: 0,
      y: this.currentY,
      velocity: +this.velocity.toFixed(1),
    });
  }
}

export default DragScroll;
