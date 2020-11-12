<template>
    <div class="to-do">
      <TitleBar titleText="代办事项" :hasBottomBorder="true"></TitleBar>
      <Search
        label-width="80px"
        :data="searchData"
        @searchForm="searchForm"
        @resetForm="searchForm"
      />
      <div class="table-box">
        <el-editable
          v-loading="loading"
          style="height: 100%"
          ref="table"
          height="400"
          :data="tableData"
          :columns="templateTableColumn"
          :needPagination="true"
          :pageTotal="pageTotal"
          @reloadPage = getPaginationParams
        >
          <template
            slot="default-operation"
            slot-scope="{row}">
            <el-button type="text">查看</el-button>
          </template>
        </el-editable>
      </div>
    </div>
</template>

<script>
import elEditable from '@/components/el-editable'
import Search from '@/components/search'
import {templateTableColumn, searchData} from './const'
import axios from 'axios'
export default {
  name: 'todoList',
  components: {
    elEditable,
    Search
  },
  data: function () {
    return {
      templateTableColumn,
      searchData,
      loading: false,
      title: '',
      pageTotal: 0,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 10,
        total: 0
      }
    }
  },
  created () {
    this.getTableData()
  },
  methods: {
    // 搜索 重置
    searchForm (form) {
      this.title = form.title || ''
      this.pageConfig.page = 1
      this.$refs.table.tablePager.page = 1
      this.getTableData()
    },
    // 请求列表数据
    getTableList () {
      return this.$fetch('todolist.mobileWork', {
        'method': 'todo',
        'uid': 'apple1',
        'searchValues': this.title,
        'pageno': this.pageConfig.page,
        'pages': this.pageConfig.size
      })
    },
    // 请求代办总数
    getPageTotal () {
      return this.$fetch('todolist.mobileWork', {
        'method': 'getTodoNumbersJsonStr',
        'recPersonId': 'apple1'
      })
    },
    // 获取整体数据
    getTableData () {
      this.loading = true
      axios.all([this.getPageTotal(), this.getTableList()])
        .then(axios.spread((totalRes, listRes) => {
          this.pageTotal = totalRes.data.todo || 0
          this.tableData = listRes.data || []
          this.loading = false
        }))
    },
    // 获取分页参数
    getPaginationParams (pageConfig) {
      this.pageConfig = pageConfig
      this.getTableData()
    }
  }
}
</script>

<style scoped lang="less">
  .to-do {
    height: 100%;
    padding: 0 8px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .table-box {
      height: 100%;
    }
  }

</style>
