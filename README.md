## DragScroll

### scripts

```bash
# 安装依赖
pnpm install

# 开发运行
pnpm run dev

# 构建生产
pnpm run build
```

### Usage

```ts
import '@skax/drag-scroll/dist/style/css.css';
import DragScroll from '@skax/drag-scroll';

const scroll = new DragScroll(document.querySelector('.container'), {
  height: 100,
  content: `
    <div class="list">
        <div class="item" style="height: 100px">1</div>
        <div class="item" style="height: 100px">2</div>
        <div class="item" style="height: 100px">3</div>
        <div class="item" style="height: 100px">4</div>
        <div class="item" style="height: 100px">5</div>
        <div class="item" style="height: 100px">6</div>
        <div class="item" style="height: 100px">7</div>
        <div class="item" style="height: 100px">8</div>
    </div>
    `,
});
```

#### html umd

```html
<!-- node_modules/@skax/drag-scroll/dist/style/css.css -->
<link rel="stylesheet" href="./style/css.css" />
<!-- node_modules/@skax/drag-scroll/dist/index.umd.js-->
<script src="./index.umd.js"></script>

<div class="container"></div>

<script>
  const scroll = new DragScroll(document.querySelector('.container'), {
    height: 100,
    content: `
            <div class="list">
            <div class="item" style="height: 100px">1</div>
            <div class="item" style="height: 100px">2</div>
            <div class="item" style="height: 100px">3</div>
            <div class="item" style="height: 100px">4</div>
            <div class="item" style="height: 100px">5</div>
            <div class="item" style="height: 100px">6</div>
            <div class="item" style="height: 100px">7</div>
            <div class="item" style="height: 100px">8</div>
            </div>
        `,
  });
</script>
```

[demo](./public/index.html)
