<template>
  <div
     class="title-bar"
    :class="{'bottom-border': hasBottomBorder}">
    <h3>{{ titleText }}</h3>
    <div class="slot-content">
      <slot/>
    </div>
  </div>
</template>
<script>
export default {
  name: 'TitleBar',
  props: {
    titleText: {
      type: [String, Number],
      default: ''
    },
    hasBottomBorder: {
      type: [Boolean],
      default: false
    }
  },
  data () {
    return {

    }
  }
}
</script>

<style scoped lang="less">
  .title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    h3 {
      font-size: 20px;
      /*color: #2371c5;*/
      color: #409eff;
      position: relative;
      padding-left: 10px;
      display: inline-block;
      line-height: 100%;
      margin: 10px 0;
    }
    h3::before {
      content: '';
      width: 4px;
      height: 20px;
      background: #409eff;
      position: absolute;
      left: 0;
    }
  }
  .bottom-border {
    border-bottom: 2px solid  #eef0f4;
  }
</style>
