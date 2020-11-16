// 列表--搜索字段
export const searchData = [
  {
    key: 'title',
    title: '标题名称', // 1
    type: 'input',
    attr: {
      placeholder: '请输入标题'
    }
  }
]
// 历史审批记录
export const recordTableColumn = [
  {
    label: '序号',
    type: 'index',
    width: 56
  },
  {
    prop: 'operator',
    label: '审批人',
    minWidth: 150
  },
  {
    prop: 'operatime',
    label: '处理时间',
    minWidth: 150
    // formatter: row => dayjs(new Date(row.time)).format('YYYY-MM-DD')
  },
  {
    prop: 'suggestion',
    label: '审批意见',
    minWidth: 400
  }
]
