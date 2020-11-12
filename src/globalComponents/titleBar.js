import TitleBarComponent from '@/components/TitleBar'

const titleBar = {
  install: function (Vue) {
    Vue.component('TitleBar', TitleBarComponent)
  }
}

export default titleBar
