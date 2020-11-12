export const TYPES = ['selection', 'index', 'expand']
export const SLOT_DEFAULT = 'default-'
export const SLOT_HEADER = 'header-'
export const HeaderCellClassName = 'editable-header-cell-class'
export const RowClassName = 'eiditable-row-class-name'
// 表头不可更改的关键词，type值或者属性
export const disableMoveTableArr = ['index', 'expand', 'selection']
// elementUI公用组件分页layout
export const PAGINATION_LAYOUT = 'total, sizes, prev, pager, next, jumper'
// 分页页码选择，默认页码应当是第一个，即：PAGE_NUMBER[0]
export const PAGE_NUMBER = [10, 20, 30, 50, 100]

/**
 * 转换为大小驼峰命名
 * abc-efg => abcEfg
 */
export const toCamelCase = str => {
  return str.indexOf('-') !== -1 ? str.replace(/-([a-zA-Z])/g, ($0, $1) => $1.toUpperCase()) : str
}
