import Vue from 'vue'
import axios from 'axios'
Vue.axios = Vue.prototype.axios = axios
const isPrd = process.env.NODE_ENV !== 'production'
// 配置 Content-Type
axios.defaults.headers.post['Content-Type'] = 'aplication/json'
/**
 * 可以对axios发出的每个请求做公共配置
 * 比如添加约定的 header 等
 */
axios.create({
  baseURL: isPrd ? process.env.API_SERVER : '', // process.env.API_SERVER
  withCredentials: true,
  timeout: 30000 // request timeout
})
axios.interceptors.request.use(
  config => {
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

/**
 * 可以对响应做一些公共配置
 * 比如判断code决定是否跳出登录
 */
axios.interceptors.response.use(
  response => {
    /* switch (response.data.status) {
      case 200:
        // todo
        break
        // case ...
    } */
    if (/^null\(/.test(response.data)) {
      response.data = JSON.parse(response.data.replace('null(', '').replace(/\)$/, ''))
    }
    // let data =
    return response
  },
  error => {
    console.log(error)
  }
)

export default axios
