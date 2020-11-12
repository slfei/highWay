import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import fetch from './service/fetch'
import ElementUI from 'element-ui'
import dayjs from 'dayjs'
import VueCookies from 'vue-cookies'
import 'element-ui/lib/theme-chalk/index.css'
import TitleBar from '@/globalComponents/titleBar'
import storeModule from './store'
// 全局过滤器
import * as filter from '@/filter'
Object.keys(filter).forEach(key => {
  Vue.filter(key, filter[key])
})

Vue.config.productionTip = false
Vue.use(VueCookies)
Vue.use(ElementUI)
Vue.use(fetch)
Vue.use(Vuex)
Vue.use(TitleBar)
Vue.prototype.$dayjs = dayjs
const store = new Vuex.Store(storeModule)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
