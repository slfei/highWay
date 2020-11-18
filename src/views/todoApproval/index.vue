<template>
  <div class="approval">
    <el-page-header class="page-header" @back="goBack" :content="routeParams.title"></el-page-header>
    <div class="base-info" v-loading="loading">
      <el-row :gutter="10">
        <el-col :xs="12" :sm="12" :md="6" :lg="8" v-for="item in contentList" :key="item.label">
          <div class="data-item">
            <span class="label">{{item.label}} :</span>
            <span :style="{color: item.label=='正文' ? '#409eff' :'#333',cursor: item.label=='正文' ? 'pointer' :'text' }" class="label-value" v-html="item.labelValue || '--'"></span>
          </div>
        </el-col>
      </el-row>
    </div>
    <TitleBar titleText="历史审批记录" :hasBottomBorder="true">
      <el-button type="primary" size="small" @click="lookDetails">查看单据明细</el-button>
    </TitleBar>
    <div class="history-record">
      <el-editable
        ref="table"
        :max-height="400"
        :data="recordData"
        :columns="recordTableColumn">
      </el-editable>
    </div>
    <div class="opinion" v-if="doType==='0'">
      <TitleBar titleText="审批意见" :hasBottomBorder="true"></TitleBar>
      <el-form ref="opinionForm" :model="opinionForm" :rules="rules">
        <el-form-item label=""  prop="opinion">
          <el-input  type="textarea" v-model="opinionForm.opinion"  :autosize="{ minRows: 4, maxRows: 8}"
                     placeholder="请输入审批意见"></el-input>
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
    <!-- 单据明细--->
    <el-dialog
      :title="hasSelect? '请选择审批节点' : '单据明细'"
      :visible.sync="dialogVisible"
      :width="hasSelect? '40%' : '80%'"
      :before-close="handleClose">
      <div v-if="hasSelect">
        <el-form ref="nodeForm" :model="nodeForm" :rules="nodeRules">
          <el-form-item label="审批节点"  prop="nodeName" v-if="nextNodeArr.length&&nextNodeArr[0].chinaKey">
            <el-select clearable v-model="nodeForm.nodeName" placeholder="请选择审批节点" style="width: 70%" @change="getNodePerson">
              <el-option :label="item.chinaKey" :value="item" v-for="item in nextNodeArr" :key="item.chinaKey"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="审批人员"  prop="nextprId">
            <el-select clearable v-model="nodeForm.nextprId" @change="getNextprNameById" placeholder="请选择审批人员" style="width: 70%">
              <el-option :label="item.label" :value="item.labelValue" v-for="item in nodePerson" :key="item.label"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div v-else class="detail-wraper">
        <el-collapse v-model="activeIndex">
          <el-collapse-item :title="`单据${index+1}`" :name="index" v-for="(item,index) in  detailData" :key="index">
            <el-row :gutter="10">
              <el-col :xs="12" :sm="12" :md="8" :lg="8" v-for="single in item" :key="single.label">
                <div class="data-item">
                  <span class="label">{{single.label}} :</span>
                  <span :style="{color: single.label=='正文' ? '#409eff' :'#333',cursor: single.label=='正文' ? 'pointer' :'text' }" class="label-value" v-html="single.labelValue || '--'"></span>
                </div>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
         <div  class="no-data" v-if="!detailData.length">
           暂无数据
         </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <div class="btns" v-if="hasSelect">
              <el-button type=""  @click="cancel">取消</el-button>
              <div style="width: 40px"></div>
              <el-button type="primary" @click="submitHandle">确定</el-button>
        </div>
        <div class="btns" v-else>
              <el-button type="primary" @click="dialogVisible=false">关闭</el-button>
        </div>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import jQuery from 'jquery'
import {isObject, isArray, cloneDeep} from 'lodash'
import elEditable from '@/components/el-editable'
import {recordTableColumn} from './const'
export default {
  name: 'Approval',
  components: {
    elEditable
  },
  data () {
    return {
      recordTableColumn,
      loading: false,
      dialogVisible: false,
      hasSelect: false, // 区分是否打开审批节点
      doType: '0', // 1 为已办 0为代办
      approvalType: 0, // 通过 1 拒绝 0
      activeIndex: 0,
      detailData: [],
      recordData: [],
      taskInfo: {},
      routeParams: {},
      contentList: [],
      nextNode: [],
      nextNodeArr: '',
      rejectNode: [],
      nodePerson: [],
      opinionForm: {
        opinion: ''
      },
      rules: {
        opinion: [
          { required: true, message: '请输入审批意见', trigger: 'blur' }
        ]
      },

      nodeForm: {
        nodeName: '',
        nextprName: '',
        nextprId: ''
      },
      nodeRules: {
        nodeName: [
          { required: true, message: '请选择审批节点', trigger: 'blur' }
        ],
        nextprId: [
          { required: true, message: '请选择审批人', trigger: 'blur' }
        ]
      },
      currentRow: {}
    }
  },
  created () {
    this.routeParams = JSON.parse(this.$route.query.taskInfo)
    this.doType = this.$route.query.doType
    this.getTaskInfo()
    this.getTaskRecords()
    jQuery.DownLoadOA_XTBGFile = this.downloadFile
  },
  methods: {
    // 取消操作
    cancel () {
      this.$refs['nodeForm'].resetFields()
      this.dialogVisible = false
    },
    submitHandle () {
      this.$refs['nodeForm'].validate(valid => {
        if (valid) {
          this.submit()
        }
      })
    },
    // 提交审批
    submit () {
      this.$fetch('todolist.mobileWork', {
        'method': 'todosubmit',
        'uid': 'apple1',
        'processinstid': this.routeParams.probjId,
        'systemcode': this.routeParams.systemCode,
        'applyid': this.routeParams.recordId,
        'leix': this.routeParams.ywlx,
        'flag': '1',
        'suggestion': this.opinion,
        'operatime': this.$dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        'taskId': this.routeParams.taskId,
        'probjId': this.routeParams.probjId,
        'nextprName': this.nodeForm.nextprName,
        'nextprId': this.nodeForm.nextprId,
        'username': this.routeParams.username,
        'isdonext': '',
        'nextNodeCode': this.currentRow.requestParams || this.currentRow.chinaKey,
        'procNodeType': '',
        'nodeMarker': ''
      }).then(res => {
        // let data = res.data
        console.log(res)
        this.cancel()
      }).finally(() => {

      })
    },
    getNextprNameById (value) {
      let obj = this.nodePerson.find(item => item.labelValue === value) || {label: ''}
      this.nodeForm.nextprName = obj.label
    },
    // 通过节点获取审批人员
    getNodePerson (value) {
      this.currentRow = value
      this.nodePerson = value.labelValueArr || []
      this.nodeForm.nodePerson = ''
    },
    // 校验审批意见
    validateHandle () {
      this.$refs['opinionForm'].validate((valid) => {
        if (valid) {
          this.dialogVisible = true
          this.hasSelect = true
          this.nodeForm.nodePerson = ''
          this.nodeForm.nodeName = ''
        }
      })
    },
    // 拒绝操作
    handleRefuse () {
      this.approvalType = 0
      this.nextNodeArr = cloneDeep(this.rejectNode)
      if (!(this.nextNodeArr.length && this.nextNodeArr[0].chinaKey)) {
        this.nodePerson = cloneDeep(this.rejectNode)
      }
      this.validateHandle()
    },
    // 通过操作
    handleNext () {
      this.approvalType = 1
      this.nextNodeArr = cloneDeep(this.nextNode)
      this.validateHandle()
    },
    // 关闭弹窗
    handleClose (done) {
      done()
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
    // 将数组转成label  labelValue格式
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
    // 获取基本信息
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
    },
    // 获取历史审核记录
    getTaskRecords () {
      this.$fetch('todolist.mobileWork', {
        'method': 'history',
        'uid': 'apple1',
        'processinstid': this.routeParams.probjId,
        'systemcode': this.routeParams.systemCode,
        'applyid': this.routeParams.recordId,
        'leix': this.routeParams.ywlx,
        'taskId': this.routeParams.taskId
      }).then(res => {
        this.recordData = res.data
      }).finally(() => {

      })
    },
    // 获取单据详情
    getTaskDetail () {
      this.$fetch('todolist.mobileWork', {
        'method': 'tododetail',
        'uid': 'apple1',
        'processinstid': this.routeParams.probjId,
        'systemcode': this.routeParams.systemCode,
        'applyid': this.routeParams.recordId,
        'leix': this.routeParams.ywlx
      }).then(res => {
        let data = res.data
        this.detailData = data.map(item => {
          return this.getJSonData(item)
        })
      }).finally(() => {

      })
    },
    // 查看单据明细操作
    lookDetails () {
      this.dialogVisible = true
      this.hasSelect = false
      this.getTaskDetail()
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
      min-height: 100px;
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
    .detail-wraper{
      max-height: 420px;
      overflow: auto;
    }
    .no-data {
      height: 120px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
