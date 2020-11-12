
const store = {
  state: {
    tableHeadConfig: null,
    userInfo: {
      realName: '',
      mobile: ''
    }
  },
  getters: {
    getUserInfo (state) {
      return state.userInfo
    }
  },
  mutations: {
    setUserInfo (state, payload) {
      state.userInfo = payload
    },
    // 记录用户自定义表头
    tableHeadConfig (state, {json, path}) {
      // 如果没有path则标识刷新或者刚登陆状态
      if (!path) {
        state.tableHeadConfig = json
      } else {
        // 如果不是null
        if (state.tableHeadConfig) {
          state.tableHeadConfig = Object.assign({}, state.tableHeadConfig, {
            [path]: json
          })
        } else {
          state.tableHeadConfig = {
            [path]: json
          }
        }
        localStorage.setItem('testKey', JSON.stringify(state.tableHeadConfig))
      }
    }
  },
  actions: {

  }
}

export default store
