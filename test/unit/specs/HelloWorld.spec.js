import Vue from 'vue'
import TitleBar from '@/components/TitleBar'

describe('TitleBar.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(TitleBar)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.hello h1').textContent)
      .toEqual('Welcome to Your Vue.js App')
  })
})
