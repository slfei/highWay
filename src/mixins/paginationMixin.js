// 分页组件混合
export default {
  data () {
    return {
      getTableDataKey: 'getTableData',
      pageConfig: {
        page: 1,
        size: 10,
        total: 0
      }
    }
  },
  methods: {
    handlePageChange (page) {
      this.page.page = page
      this[this.getTableDataKey]()
    },
    handleSizeChange (size) {
      console.log(size)
      this.pageConfig.page = 1
      this.pageConfig.size = size
      this[this.getTableDataKey]()
    },
    handlePageReset () {
      this.pageConfig.page = 1
      this[this.getTableDataKey]()
    }
  }
}
