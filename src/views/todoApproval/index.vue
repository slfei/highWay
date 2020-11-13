<template>
  <div class="approval">
    <el-page-header class="page-header" @back="goBack" :content="routeParams.title"></el-page-header>
    <div class="base-info" v-loading="loading">
      <el-row :gutter="10">
        <el-col :xs="12" :sm="12" :md="8" :lg="8" v-for="item in contentList" :key="item.label">
          <div class="data-item">
            <span class="label">{{item.label}} :</span>
            <span :style="{color: item.label=='正文' ? '#409eff' :'#333',cursor: item.label=='正文' ? 'pointer' :'text' }" class="label-value" v-html="item.labelValue || '--'"></span>
          </div>
        </el-col>
      </el-row>
    </div>
    <TitleBar titleText="历史审批记录" :hasBottomBorder="true">
      <el-button type="primary" size="small">查看单据明细</el-button>
    </TitleBar>
    <div class="history-record">
      <el-editable
        ref="table"
        :max-height="400"
        :data="recordData"
        :columns="templateTableColumn">
      </el-editable>
    </div>
    <TitleBar titleText="审批意见" :hasBottomBorder="true"></TitleBar>
    <div class="opinion">
      <el-form ref="opinionForm" :model="opinionForm">
        <el-form-item label="">
          <el-input  type="textarea" v-model="opinionForm.opinion"  :autosize="{ minRows: 4, maxRows: 8}"
                     placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item>
          <div class="btns">
            <el-button type="primary"  @click="handleNext">流程通过</el-button>
             <div style="width: 40px"></div>
            <el-button type="danger" @click="handleRefuse">流程拒绝</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import jQuery from 'jquery'
import {isObject, isArray} from 'lodash'
import elEditable from '@/components/el-editable'
import {templateTableColumn} from './const'
export default {
  name: 'Approval',
  components: {
    elEditable
  },
  data () {
    return {
      loading: false,
      recordData: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      templateTableColumn,
      taskInfo: {},
      routeParams: {},
      contentList: [],
      nextNode: [],
      rejectNode: [],
      opinionForm: {
        opinion: ''
      }
    }
  },
  created () {
    this.routeParams = JSON.parse(this.$route.query.taskInfo)
    this.getTaskInfo()
    jQuery.DownLoadOA_XTBGFile = this.downloadFile
  },
  methods: {
    handleRefuse () {

    },
    handleNext () {

    },
    // 正文下载
    downloadFile (name, path, sys) {
      console.log(name, path, sys)
    },
    // 返回
    goBack () {
      this.$router.go(-1)
    },
    // 对象转json
    getJSonData (data) {
      if (!isObject(data)) return []
      let reg = /^[\u4E00-\u9FA5]+/
      let json = Object.entries(data).filter((item) => {
        return reg.test(item[0])
      }).map(mapItem => {
        return {
          label: mapItem[0],
          labelValue: mapItem[1]
        }
      })
      return json
    },
    getLabelKeyArr (list) {
      if (!isArray(list)) return []
      let labelKeyArr = list.map(item => {
        let res = Object.entries(item)
        return {
          label: res[0][0],
          labelValue: res[0][1]
        }
      })
      return labelKeyArr
    },
    // 处理成你想要的Array
    getStandardArray (arr) {
      if (!isArray(arr)) return []
      let standard = arr.map(item => {
        let lableArr = item.label.split('@')
        let itemArr = item.labelValue
        let labelValueArr = itemArr.map(valeItem => {
          let res = Object.entries(valeItem)
          return {
            label: res[0][0],
            labelValue: res[0][1]
          }
        })
        return {
          chinaKey: lableArr[0],
          requestParams: lableArr[1] || '',
          labelValueArr
        }
      })
      return standard
    },
    getTaskInfo () {
      this.loading = true
      this.$fetch('todolist.mobileWork', {
        'method': 'tododesc',
        'uid': 'apple1',
        'processinstid': this.routeParams.probjId,
        'systemcode': this.routeParams.systemCode,
        'applyid': this.routeParams.recordId,
        'leix': this.routeParams.ywlx,
        'taskId': this.routeParams.taskId,
        'username': encodeURIComponent(this.routeParams.loginName),
        'categoryType': '00'
      }).then(res => {
        let resData = res.data[0]
        let nextprv = resData.nextprv
        this.rejectNode = this.getLabelKeyArr(resData.rejectprv)
        this.nextNode = this.getStandardArray(this.getJSonData(nextprv))
        this.contentList = this.getJSonData(resData)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped lang="less">
  .approval {
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
    .page-header{
      background: #409eff;
      color: #ffffff;
      font-weight: bolder;
      padding: 10px;
      margin-bottom: 20px;
    }
    .base-info {
      min-height: 180px;
    }
    .data-item {
      padding: 10px 0;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      .label {
        display: inline-block;
        min-width: 120px;
        text-align: right;
        color: #999999;
        margin-right: 16px;
      }
    }
    .history-record {
      margin-bottom: 10px;
    }
    .btns {
      display: flex;
      justify-content: center;
    }
  }
</style>
