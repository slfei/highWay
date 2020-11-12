<template>
    <div>
      我是首页
      <el-button type="primary">
        确定
      </el-button>
    </div>
</template>

<script>
export default {
  name: 'index',
  data () {
    return {

    }
  },
  created () {
    console.log(this.$store, this.$fetch, 'index')
  }
}
</script>

<style scoped>

</style>
