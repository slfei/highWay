<template>
  <div id="app">
    <div>
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="less">
#app {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: #f3f3f3;
  &>div {
    height: 100%;
    background: #fff;
  }
  font-family: 'Microsoft YaHei', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
