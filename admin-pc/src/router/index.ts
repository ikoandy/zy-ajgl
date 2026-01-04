import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
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
        path: 'system',
        name: 'system',
        meta: {
          title: '系统管理',
          icon: 'el-icon-setting'
        },
        redirect: 'system/user',
        children: [
          {
            path: 'user',
            name: 'system-user',
            component: () => import('../views/system/user/index.vue'),
            meta: {
              title: '用户管理',
              icon: 'el-icon-user'
            }
          },
          {
            path: 'role',
            name: 'system-role',
            component: () => import('../views/system/role/index.vue'),
            meta: {
              title: '角色管理',
              icon: 'el-icon-s-custom'
            }
          },
          {
            path: 'menu',
            name: 'system-menu',
            component: () => import('../views/system/menu/index.vue'),
            meta: {
              title: '菜单管理',
              icon: 'el-icon-menu'
            }
          }
        ]
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
        path: 'client',
        name: 'client',
        component: () => import('../views/client/index.vue'),
        meta: {
          title: '客户管理',
          icon: 'el-icon-user-solid'
        }
      },
      {
        path: 'lawyer',
        name: 'lawyer',
        component: () => import('../views/lawyer/index.vue'),
        meta: {
          title: '律师管理',
          icon: 'el-icon-suitcase'
        }
      },
      {
        path: 'stats',
        name: 'stats',
        meta: {
          title: '统计分析',
          icon: 'el-icon-data-analysis'
        },
        redirect: 'stats/case',
        children: [
          {
            path: 'case',
            name: 'stats-case',
            component: () => import('../views/stats/case/index.vue'),
            meta: {
              title: '案件统计',
              icon: 'el-icon-data-line'
            }
          },
          {
            path: 'finance',
            name: 'stats-finance',
            component: () => import('../views/stats/finance/index.vue'),
            meta: {
              title: '财务统计',
              icon: 'el-icon-money'
            }
          }
        ]
      },
      {
        path: 'log',
        name: 'log',
        meta: {
          title: '日志管理',
          icon: 'el-icon-document-copy'
        },
        redirect: 'log/login',
        children: [
          {
            path: 'login',
            name: 'log-login',
            component: () => import('../views/log/login/index.vue'),
            meta: {
              title: '登录日志',
              icon: 'el-icon-time'
            }
          },
          {
            path: 'operation',
            name: 'log-operation',
            component: () => import('../views/log/operation/index.vue'),
            meta: {
              title: '操作日志',
              icon: 'el-icon-edit-outline'
            }
          }
        ]
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
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, _, next) => {
  // 获取本地存储的token
  const token = localStorage.getItem('token')
  
  // 无需认证的白名单路由
  const whiteList = ['login', '404']
  
  // 如果访问的是白名单中的路由，直接放行
  if (whiteList.includes(to.name as string)) {
    next()
    return
  }
  
  // 如果有token，放行
  if (token) {
    next()
  } else {
    // 没有token，重定向到登录页面
    next('/login')
  }
})

export default router
