<script>
import { Table, TableColumn } from 'element-ui'
import { set, get, cloneDeep } from 'lodash'
import mixinOptionExtensions from './mixin-package-option.js'
import {
  TYPES,
  SLOT_DEFAULT,
  SLOT_HEADER,
  HeaderCellClassName,
  RowClassName,
  disableMoveTableArr,
  PAGE_NUMBER,
  PAGINATION_LAYOUT,
  toCamelCase
} from './const.js'

let len = 0
export default {
  name: 'Editable',
  components: {
    'el-table': Table,
    'el-table-column': TableColumn
  },
  directives: {
    drag: {
      bind (el, binding) {
        // 如果没有配置custom-attr属性，则不允许移动
        if (!binding.expression) {
          return
        }
        // const classNameArr = ['gutter'];
        setTimeout(() => {
          let tbodyBox = el.querySelector('thead')
          el.querySelectorAll(`.el-table__header-wrapper tr .${HeaderCellClassName}`).forEach((item, index) => {
            item.setAttribute('draggable', true)
            item.setAttribute('index', index)
          })
          let curIndex = 0
          let toIndex = 0
          tbodyBox.addEventListener(
            'dragstart',
            function (e) {
              curIndex = e.target.getAttribute('index')
            },
            false
          )
          tbodyBox.addEventListener(
            'dragover',
            function (e) {
              toIndex = e.path.filter(item => item.nodeName === 'TH')[0].getAttribute('index')
            },
            false
          )
          tbodyBox.addEventListener(
            'dragend',
            function (e) {
              binding.value({ curIndex, toIndex })
            },
            false
          )
        }, 0)
      }
    }
  },
  mixins: [mixinOptionExtensions],
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    editableMethod: {
      type: Function,
      default: () => {}
    },
    pageTotal: {
      type: [Number, String],
      default: 0
    },
    needPagination: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      tableData: [],
      tablePager: { page: 1, size: PAGE_NUMBER[0], total: 0 },
      store: [],
      spanArr: [],
      spanObject: {},
      customSpanMethod: () => {}
    }
  },
  computed: {
    storeConfig () {
      return this.$store.state.tableHeadConfig
    },
    customColumns () {
      // 如果存在，则重新定义顺序，如果不存在，则直接返回当前columns
      if (this.storeConfig && this.storeConfig[this.$attrs['custom-attr']]) {
        let jsonArr = this.storeConfig[this.$attrs['custom-attr']]
        return jsonArr.map(item => {
          return this.columns[item]
        })
      } else {
        return this.columns
      }
    }
  },
  watch: {
    data: {
      handler: function (val) {
        this.tableData = val
      },
      immediate: true
    },
    columns: {
      handler: 'rowspan',
      immediate: true
    },
    pageTotal (newV, oldV) {
      this.tablePager.total = newV ? Number(newV) : 0
    }
  },
  mounted () {
    this.customSpanMethod = this.$attrs['span-method'] || this.$attrs.spanMethod || this.arraySpanMethod
  },
  methods: {
    // 是否可以执行表头移动 ,'custonAttr', 'fixed'是属性
    checkTableHead (curIndex, toIndex) {
      let flag = true
      let lastColumns = this.customColumns
      // 选中的对象
      let curObj = lastColumns[curIndex]
      if (disableMoveTableArr.includes(curObj.type) || curObj['customAttr'] || curObj['fixed']) {
        flag = false
      }
      // 目标对象
      let toObj = lastColumns[toIndex]
      if (disableMoveTableArr.includes(toObj.type) || toObj['customAttr'] || toObj['fixed']) {
        flag = false
      }
      return flag
    },
    // 更改表头顺序
    changeTableHeadConfig ({ curIndex, toIndex }) {
      // 获取表头，查看表头是否可以更改
      if (this.checkTableHead(curIndex, toIndex)) {
        // 标识位置的更改
        let config = this.$store.state.tableHeadConfig
        let arrIndex
        if (config && config[this.$attrs['custom-attr']]) {
          arrIndex = cloneDeep(config[this.$attrs['custom-attr']])
        } else {
          arrIndex = new Array(this.customColumns.length).fill('').map((item, index) => index)
        }
        arrIndex.splice(toIndex, 0, ...arrIndex.splice(curIndex, 1))
        this.$store.commit('tableHeadConfig', { json: arrIndex, path: this.$attrs['custom-attr'] })
      }
    },
    renderColumn (h, data = {}) {
      return data.columns.map((col, index) => {
        let columnIndex
        // todo: 待优化
        len = col.children ? len : len + 1 // 用于计算 column 的 index
        columnIndex = len - 1 // 从0开始，所以减1

        let filterData = {
          props: col
        }
        let scopedSlot = this.$scopedSlots[SLOT_DEFAULT + col.type] || this.$scopedSlots[SLOT_DEFAULT + col.prop]

        if ((!col.type || TYPES.indexOf(col.type) < 0) && !scopedSlot) {
          filterData.scopedSlots = {
            default: scope => {
              const config =
                (data.editableMethod &&
                  data.editableMethod({
                    row: scope.row,
                    column: scope.column,
                    rowIndex: scope.$index,
                    columnIndex: columnIndex
                  })) ||
                col.render

              const renderElement = (typeof config === 'object' && (config.$component || config.$type)) || 'el-input'
              return config
                ? h(
                  renderElement,
                  {
                    props: { ...config.$el, value: get(scope.row, col.prop) },
                    on: {
                      input: val => {
                        // 处理空值时修改很慢的问题
                        get(scope.row, col.prop) === undefined
                          ? this.$set(scope.row, col.prop, val) // todo: 这里存在bug, 如果 prop 为 . 拼接的 key
                          : set(scope.row, col.prop, val)
                      },
                      change: val => {
                        this.handleChange({
                          prop: col.prop,
                          value: val,
                          row: scope.row,
                          column: scope.column,
                          rowIndex: scope.$index,
                          columnIndex: columnIndex
                        })
                      }
                    }
                  },
                  [
                    (() => {
                      const optType =
                          config.$type && config.$type.indexOf('el-') === 0 ? config.$type.slice(3) : config.$type
                      let optRenderer = optType && this[`${toCamelCase(optType)}_opt`]
                      if (typeof optRenderer === 'function' && Array.isArray(config.$options)) {
                        return config.$options.map(optRenderer)
                      }
                    })()
                  ]
                )
                : col.formatter
                  ? col.formatter(scope.row, scope.column, get(scope.row, col.prop), scope.$index)
                  : get(scope.row, col.prop)
            }
          }
        }
        if (scopedSlot) {
          filterData.scopedSlots = {
            default: scopedSlot
          }
        }
        if (this.$scopedSlots[SLOT_HEADER + col.prop]) {
          filterData.scopedSlots.header = this.$scopedSlots[SLOT_HEADER + col.prop]
        }
        return h(
          'el-table-column',
          filterData,
          col.children && [
            this.renderColumn(h, {
              columns: col.children,
              editableMethod: this.editableMethod
            })
          ]
        )
      })
    },
    rowspan () {
      const data = this.tableData
      const getSpanObject = (arr, con = {}) => {
        return arr.reduce((sum, col) => {
          if (col.children && col.children.length) {
            getSpanObject(col.children, sum)
            return sum
          }

          if (!col.isMergeCell) {
            return sum
          }

          sum[col.prop] = []

          let position
          let spanArr = sum[col.prop]

          data.forEach((item, index) => {
            if (index === 0) {
              spanArr.push(1)
              position = 0
            } else {
              if (data[index][col.prop] === data[index - 1][col.prop]) {
                spanArr[position] += 1
                spanArr.push(0)
              } else {
                spanArr.push(1)
                position = index
              }
            }
          })
          return sum
        }, con)
      }

      this.spanObject = getSpanObject(this.columns)
    },
    arraySpanMethod ({ row, column, rowIndex, columnIndex }) {
      const spanArr = this.spanObject[column.property]
      if (spanArr) {
        const _row = spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    handleChange (data) {
      const index = this.store.findIndex(
        item => item.rowIndex === data.rowIndex && item.columnIndex === data.columnIndex
      )
      this.$emit('cell-change', data)
      if (index > -1) {
        this.store.splice(index, 1, data)
        return
      }
      this.store.push(data)
    },
    setCellValue (key, rowIndex, value) {
      const row = this.tableData[rowIndex]
      set(row, key, value)
    }
  },
  render (h) {
    len = 0 // 初始化值
    const slots = Object.keys(this.$slots)
      .reduce((arr, key) => arr.concat(this.$slots[key]), [])
      // 手动更正 context
      .map(vnode => {
        vnode.context = this._self
        return vnode
      })
    const columns = this.renderColumn(h, {
      // 优先使用自定义表头
      columns: this.customColumns,
      editableMethod: this.editableMethod
    })

    const elemTable = h(
      'el-table',
      {
        ref: 'table',
        props: {
          ...this.$attrs,
          data: this.tableData,
          rowClassName: RowClassName,
          border: true,
          headerCellClassName: HeaderCellClassName,
          spanMethod: this.customSpanMethod
        },
        directives: [{ name: 'drag', value: this.changeTableHeadConfig, expression: !!this.$attrs['custom-attr'] }],
        on: this.$listeners
      },
      columns.concat(slots)
    )

    const elemPagination = h('div', { attrs: { class: 'pagination' } }, [
      h('el-pagination', {
        props: {
          layout: PAGINATION_LAYOUT,
          pageSize: this.tablePager.size,
          total: this.tablePager.total,
          currentPage: this.tablePager.page,
          pageSizes: PAGE_NUMBER
        },
        attrs: { align: 'right' },
        on: {
          'size-change': pageSize => {
            this.tablePager.size = pageSize
            console.log(pageSize, 'size')
            this.$emit('reloadPage', {
              page: this.tablePager.page,
              size: this.tablePager.size,
              total: this.tablePager.total
            })
          },
          'current-change': curPage => {
            console.log(curPage, 'curPage')
            this.tablePager.page = curPage
            this.$emit('reloadPage', {
              page: this.tablePager.page,
              size: this.tablePager.size,
              total: this.tablePager.total
            })
          }
        }
      })
    ])

    let subelem = []
    subelem.push(elemTable)
    if (this.needPagination) {
      subelem.push(elemPagination)
    }
    return h('div', { attrs: { class: 'el-editable' } }, subelem)
  }
}
</script>
<style lang="less">
.el-editable {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  .el-table {
    color: #26344c;
    border: 1px solid #f3f3f3;

    .editable-header-cell-class {
      height: 40px;
      padding: 5px 0;
      font-weight: 400;
      color:#ffffff;
      background: #2371c5;

      > div {
        cursor: pointer;
        width: 100%;
      }
    }

    .eiditable-row-class-name {
      height: 40px;
      > td {
        padding: 2px 0;
      }

      &:nth-child(odd):hover > td,
      &:nth-child(odd).hover-row > td {
        background-color: rgb(255, 255, 255);
      }

      &:nth-child(even) {
        background-color: rgb(248, 249, 251);

        &:hover > td,
        &.hover-row > td {
          background-color: rgb(248, 249, 251);
        }
      }
    }
  }
  .pagination {
    padding-top: 10px;
    display: flex;
    justify-content: flex-end;
    padding-right: 0;
  }
}
</style>
