import Vue from 'vue'
import Router from 'vue-router'
import {title} from '@/utils/index'

Vue.use(Router)

const router = new Router({
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
        title: '代办事宜'
      }
    },
    {
      path: '/approval',
      name: 'todoApproval',
      component: () => import('@/views/todoApproval'),
      meta: {
        title: '代办审批'
      }
    }
  ]
})

router.afterEach(to => {
  // 更改标题
  title(to.meta.title)
})

export default router
