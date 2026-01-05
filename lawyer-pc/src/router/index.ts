import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/',
    name: 'layout',
    component: () => import('../layouts/BasicLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'el-icon-data-line'
        }
      },
      {
        path: 'case',
        name: 'case',
        component: () => import('../views/case/index.vue'),
        meta: {
          title: '案件管理',
          icon: 'el-icon-folder-opened'
        }
      },
      {
        path: 'case/:id',
        name: 'case-detail',
        component: () => import('../views/case/detail.vue'),
        meta: {
          title: '案件详情',
          hidden: true
        }
      },
      {
        path: 'client',
        name: 'client',
        component: () => import('../views/client/index.vue'),
        meta: {
          title: '客户管理',
          icon: 'el-icon-user-solid'
        }
      },
      {
        path: 'client/:id',
        name: 'client-detail',
        component: () => import('../views/client/detail.vue'),
        meta: {
          title: '客户详情',
          hidden: true
        }
      },
      {
        path: 'docs',
        name: 'docs',
        component: () => import('../views/docs/index.vue'),
        meta: {
          title: '文档管理',
          icon: 'el-icon-document'
        }
      },
      {
        path: 'schedule',
        name: 'schedule',
        component: () => import('../views/schedule/index.vue'),
        meta: {
          title: '日程管理',
          icon: 'el-icon-date'
        }
      },
      {
        path: 'todo',
        name: 'todo',
        component: () => import('../views/todo/index.vue'),
        meta: {
          title: '待办事项',
          icon: 'el-icon-check'
        }
      },
      {
        path: 'message',
        name: 'message',
        component: () => import('../views/message/index.vue'),
        meta: {
          title: '消息中心',
          icon: 'el-icon-message-solid'
        }
      },
      {
        path: 'finance',
        name: 'finance',
        component: () => import('../views/finance/index.vue'),
        meta: {
          title: '财务记录',
          icon: 'el-icon-calculator'
        }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../views/profile/index.vue'),
        meta: {
          title: '个人中心',
          icon: 'el-icon-user'
        }
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    component: () => import('../views/error/404.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory('/lawyer/'),
  routes
})

export default router
