<template>
  <div id="app">
    <DragScroll />
  </div>
</template>

<script>
import DragScroll from './components';
export default {
  name: 'app',
  components: {
    DragScroll,
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 150vh;
}
</style>
