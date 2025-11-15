import React, { useEffect } from 'react';
import '@skax/drag-scroll/dist/style/css.css';
import DragScroll from '@skax/drag-scroll';
import './App.css';

function App() {
  const dragScrollRef = React.useRef<DragScroll | null>(null);
  const $containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!$containerRef.current) {
      return;
    }
    dragScrollRef.current = new DragScroll($containerRef.current as unknown as HTMLElement, {
      content: `
        <div class="item">
                  <h3>项目 1</h3>
                  <p>这是第一个项目的内容。使用 transform: translate3d 实现平移，可以获得更好的性能。</p>
                </div>
                <div class="item" id="item_11">
                  <h3>项目 2</h3>
                  <p>这是第二个项目的内容。GPU 加速使滚动更加流畅，特别是在移动设备上。</p>
                </div>
                <div class="item">
                  <h3>项目 3</h3>
                  <p>这是第三个项目的内容。弹性效果通过物理模拟实现，更加自然。</p>
                </div>
                <div class="item">
                  <h3>项目 4</h3>
                  <p>这是第四个项目的内容。尝试快速拖动并释放，观察弹性效果。</p>
                </div>
                <div class="item">
                  <h3>项目 5</h3>
                  <p>这是第五个项目的内容。滚动到边界时会有明显的弹性反馈。</p>
                </div>
                <div class="item">
                  <h3>项目 6</h3>
                  <p>这是第六个项目的内容。代码使用了 requestAnimationFrame 实现流畅动画。</p>
                </div>
                <div class="item">
                  <h3>项目 7</h3>
                  <p>这是第七个项目的内容。transform 方法避免了重排，性能更优。</p>
                </div>
                <div class="item">
                  <h3>项目 8</h3>
                  <p>这是第八个项目的内容。弹性系数和摩擦力可以调整以获得不同效果。</p>
                </div>
                <div class="item">
                  <h3>项目 9</h3>
                  <p>这是第九个项目的内容。尝试不同的拖动速度体验不同的弹性反馈。</p>
                </div>
                <div class="item">
                  <h3>项目 10</h3>
                  <p>这是第十个项目的内容。这是最后一个项目，向上拖动可以回到顶部。</p>
                </div>
                <div class="item">
                  <h3>项目 11</h3>
                  <p>额外添加的项目，用于测试更长的滚动内容。</p>
                </div>
                <div class="item">
                  <h3>项目 12</h3>
                  <p>最后一个测试项目，展示完整的滚动范围。</p>
                </div>
      `,
      onDragStart: e => {
        console.log('拖拽开始 onDragStart', e);
      },
      onDragging: (x, y) => {
        console.log('拖拽中 onDragging', x, y);
      },
      onDragEnd: e => {
        console.log('拖拽结束 onDragEnd', e);
      },
      onChange: state => {
        console.log('onChange', state);
        // document.getElementById('positionInfo').textContent = `位置 X: ${Math.round(state.x)}px, Y: ${Math.round(state.y)}px`;
        // document.getElementById('velocityInfo').textContent = `速度: ${state.velocity.toFixed(2)}px/帧`;
      },
      // readonly: true,
      // hideScrollbar: true,
    });

    return () => {
      if (dragScrollRef.current) {
        dragScrollRef.current.destroy();
        dragScrollRef.current = null;
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-link" ref={$containerRef}></div>
      </header>
    </div>
  );
}

export default App;
