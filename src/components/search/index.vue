<!--本组件是对businesscomponents/search的改造，向下兼容，扩展了展开搜索的功能-->
<template>
  <div class="custom-search-form">
    <el-form
      :inline="true"
      :model="formData"
      :label-width="labelWidthStr"
      :label-position="labelPosition"
      class="el-form--inline filter-box"
    >
      <el-form-item
        v-for="item in searchData"
        :key="item.index"
        :label="item.title"
        :class="{badge: item.type === 'badge'}"
      >
        <div v-if="item.type === 'input'">
          <el-input v-model="formData[item.key]" v-bind="item.attr" />
        </div>

        <div v-if="item.type === 'select'">
          <el-select
            v-model="formData[item.key]"
            v-bind="item.attr"
            :remote-method="remoteMethod"
            @focus="focuskey(item.key)"
          >
            <el-option
              v-for="items in item.options"
              :title="items.label"
              :key="items.value"
              :label="items.label"
              :value="items.value"
            />
          </el-select>
        </div>

        <div v-if="item.type === 'time'">
          <el-date-picker
            v-model="formData[item.key]"
            v-bind="item.attr"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </div>

        <div v-if="item.type === 'radio'">
          <template>
            <el-radio
              v-for="items in item.options"
              :key="items.value"
              v-model="formData[item.key]"
              :label="items.value"
              v-bind="item.attr"
              >{{ items.label }}</el-radio
            >
          </template>
        </div>

        <div v-if="item.type === 'badge'">
          <template>
            <el-badge
              v-for="(items, i) in item.options"
              :key="i"
              :class="{'badge-active': badgeKey === items.value}"
            >
              <el-button
                class="badge-button"
                @click="changeStatus(item.key, items.value)"
                size="small"
              >
                {{ items.label }}
              </el-button>
            </el-badge>
          </template>
        </div>

        <div v-if="item.type === 'cascader'">
          <el-cascader
            v-model="formData[item.key]"
            :options="item.options"
            v-bind="item.attr"
            :props="item.optionProps"
          />
        </div>
      </el-form-item>

      <el-form-item class="searchButtonList">
        <el-button class="submit" type="primary" @click.stop="search">查询</el-button>
        <el-button class="reset" @click.stop="reset">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="collapse-button-wrapper" v-if="showCollapse">
      <el-button type="text" @click="collapse = !collapse">
        <span v-if="collapse"
          >展开 <i class="el-icon-arrow-down"
        /></span>
        <span v-else>收起<i class="el-icon-arrow-up"/></span>
      </el-button>
    </div>
  </div>
</template>

<script>
import {formatDate} from '@/filter/index'
import {isObject} from 'lodash'
export default {
  name: 'Search',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    // 自定义label-width长度
    labelWidth: {
      type: String,
      default: () => ''
    },
    labelPosition: {
      type: String,
      default: 'right'
    },
    showCollapse: {
      type: Boolean,
      default: false
    },
    compactData: {
      // 收起搜索时的选项
      type: Array,
      default: () => []
    }
  },
  data () {
    // 获取字段，设置默认为空
    let item = this.data
    let formDataBox = {}
    // 用于badge 默认值
    let badgeKey = null
    item.forEach(item => {
      // 如果有默认值
      if (item.value) {
        formDataBox[item.key] = item.value
        // 用于tab默认值
        if (item.type === 'badge') {
          badgeKey = item.value
        }
      } else {
        if (item.type === 'badge') {
          badgeKey = ''
        } else if (item.type === 'cascader') {
          formDataBox[item.key] = []
        } else {
          formDataBox[item.key] = null
        }
      }
    })
    return {
      // 自定义表头长度
      labelWidthStr: this.labelWidth || 'max-content',
      // 内容数据
      formData: {
        ...formDataBox
      },
      // 用于badge
      badgeKey,
      collapse: true
    }
  },
  computed: {
    searchData () {
      return this.showCollapse && this.collapse ? this.compactData : this.data
    }
  },
  methods: {
    // 状态tab切换
    changeStatus (key, value) {
      this.formData[key] = value
      this.badgeKey = value
      // 点击tab切换的时候直接查询列表
      this.search()
    },
    // 用于保存select为搜索下拉时使用
    focuskey (key) {
      this.selectkey = key
      this.$emit('focuskey', this.selectkey)
    },
    // 搜索下拉框返回值
    remoteMethod (query) {
      this.$emit('remoteMethod', query, this.selectkey)
    },
    // 点击搜索
    search () {
      // 表单数据
      let formData = {
        ...this.formData
      }
      // 时间处理  为了点击提交不需要转换时间
      // 这里做了一个处理 在外层需要添加fieldname字段
      // fieldname为数组 必须两个值['开始时间字段',结束时间字段]
      this.searchData.forEach(item => {
        // 判断当前处理的时间一定是时间段
        if (item.type === 'time' && item.attr.type === 'daterange') {
          // 判断有没有选时间 且有fieldname字段
          if (formData[item.key] && item.fieldname) {
            // 开始时间
            formData[item.fieldname[0]] = formatDate(
              formData[item.key][0],
              'YYYY-MM-DD HH:mm:ss'
            )
            // 结束时间
            formData[item.fieldname[1]] = formatDate(
              formData[item.key][1],
              'YYYY-MM-DD HH:mm:ss'
            )
            // 删除多余的时间数组
            delete formData[item.key]
          }
        }
        // 处理单个时间
        if (item.type === 'time' && item.attr.type === 'date') {
          // 确定选了时间才处理
          if (formData[item.key]) {
            // 时间转换
            // 替换原来字段内容
            formData[item.key] = formatDate(
              formData[item.key],
              'YYYY-MM-DD HH:mm:ss'
            )
          }
        }
        // 对多类目处理-只返回一个ID
        if (item.type === 'cascader') {
          if (formData[item.key]) {
            if (isObject(formData[item.key])) {
              let index = formData[item.key].length
              if (index > 0) {
                formData[item.key] = formData[item.key][index - 1] + ''
              } else {
                formData[item.key] = null
              }
            }
          } else {
            formData[item.key] = null
          }
        }
      })
      this.$emit('searchForm', formData)
    },
    // 点击重置
    reset () {
      let arr = this.searchData
      let DefaultFormInlineBox = {}
      // 用于badge 默认值
      arr.forEach(item => {
        // 如果有默认值
        if (item.value) {
          DefaultFormInlineBox[item.key] = item.value
          // 用于tab默认值
          if (item.type === 'badge') {
            this.badgeKey = item.value
          }
        } else {
          DefaultFormInlineBox[item.key] = null
        }
      })
      this.formData = DefaultFormInlineBox
      this.$emit('resetForm', this.formData)
    }
  }
}
</script>

<style lang="less">
.custom-search-form {
  display: flex;

  .collapse-button-wrapper {
    flex: 0 0 120px;
  }

  .filter-box {
    flex: 1;

    .badge {
      display: block;
    }

    .daterange {
      width: 538px !important;
    }

    .el-badge {
      margin-right: 14px;
      line-height: 20px;
    }

    .badge-button {
      border: 0 !important;
      border-radius: 14px;
    }

    .el-input__inner {
      width: 300px;
    }

    .badge-active {
      .badge-button {
        background: #2371c5;
        color: #fff;
      }
    }

    .el-form-item {
      margin-bottom: 10px;
    }

    .el-form-item__label {
      padding-right: 10px;
    }
  }
  .el-range-editor--medium .el-range-separator {
    line-height: 21px;
  }
  .el-range-editor--medium .el-range__icon,
  .el-range-editor--medium .el-range__close-icon {
    line-height: 21px;
  }
}
</style>
