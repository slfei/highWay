import dayjs from 'dayjs'
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
// 列表
export const templateTableColumn = [
  {
    label: '序号',
    type: 'index',
    width: 56
  },
  {
    prop: 'title',
    label: '审批人',
    minWidth: 150
  },
  {
    prop: 'time',
    label: '日期',
    minWidth: 150,
    formatter: row => dayjs(new Date(row.time)).format('YYYY-MM-DD')
  },
  {
    prop: 'operation',
    label: '审批意见',
    minWidth: 400
  }
]
