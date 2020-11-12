import axios from './config'
const fetchCfg = {}
const requireContext = require.context('../apiModules', false, /\.js$/)
requireContext.keys().forEach(path => {
  let module = path.replace('.js', '').replace('./', '')
  fetchCfg[module] = requireContext(path).default
})
// console.log("接口总数统计：", Object.values(fetchCfg).reduce((sum, item) => sum + Object.keys(item).length, 0))
/**
 * 解析参数
 * @param {String} param
 */
const fetchParam = param => {
  var valid = /[a-z]+(\.[a-z])+/.test(param)
  if (!valid) {
    throw new Error('[Error in fetch]: fetch 参数格式为 moduleName.apiName')
  } else {
    return {
      moduleName: param.split('.')[0],
      apiName: param.split('.')[1]
    }
  }
}

class Fetch {
  // 给Vue提供安装接口
  install (Vue) {
    Object.assign(Vue.prototype, {
      $fetch: this.fetch
    })
  }
  /**
   * 对axios封装通用fetch方法
   * 会根据传入的下列参数自动寻找 method 和路径
   * @param {*} module 对应 fetch配置的名字
   * @param {*} apiName 该模块下的某个请求api名称
   */
  fetch (moduleInfo, payload) {
    // let prefix = '/api'
    let moduleName = fetchParam(moduleInfo)['moduleName']
    let apiName = fetchParam(moduleInfo)['apiName']
    // 判断API模块存在情况
    if (!fetchCfg) {
      throw new Error(`[Error in fetch]: 未找到api配置文件`)
    }
    if (!fetchCfg.hasOwnProperty(moduleName)) {
      throw new Error(`[Error in fetch]: api配置中未找到模块 -> ${moduleName}`)
    }
    if (!fetchCfg[moduleName].hasOwnProperty(apiName)) {
      throw new Error(`[Error in fetch]: api模块${moduleName}中未找到接口 -> ${apiName}`)
    }

    let fetchInfo = fetchCfg[moduleName][apiName]
    let method = fetchInfo['method']
    // let url = `${prefix}/${fetchInfo['url']}`
    let url = `${fetchInfo['url']}`
    if (method && url) {
      if (method === 'get') {
        payload.R = Date.parse(new Date()) // 清除缓存
        return axios[method](url, {
          params: payload
        })
      } else {
        return axios[method](url, payload)
      }
    }
  }
}

export default new Fetch()
