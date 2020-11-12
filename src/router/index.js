import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '*',
      redirect: '/todo'
    },
    {
      path: '/todo',
      name: 'todoList',
      component: () => import('@/views/todoList'),
      meta: {
        title: '代办'
      },
      children: []
    }
  ]
})
