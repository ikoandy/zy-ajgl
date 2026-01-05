import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// 静态路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/auth/login'
  },
  {
    path: '/auth',
    component: () => import('@/layouts/BlankLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: {
          title: '登录'
        }
      }
    ]
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/layouts/BasicLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'home-o'
        }
      }
    ]
  },
  {
    path: '/case',
    name: 'Case',
    component: () => import('@/layouts/BasicLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/case/index.vue'),
        meta: {
          title: '案件列表',
          icon: 'document-o'
        }
      },
      {
        path: 'detail/:id',
        name: 'CaseDetail',
        component: () => import('@/views/case/detail.vue'),
        meta: {
          title: '案件详情'
        }
      }
    ]
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/layouts/BasicLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/messages/index.vue'),
        meta: {
          title: '消息中心',
          icon: 'chat-o'
        }
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/layouts/BasicLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          title: '个人中心',
          icon: 'user-o'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404页面'
    }
  }
];

const router = createRouter({
  history: createWebHistory('/mobile/'),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title as string || '律师事务所管理系统';
  
  // 获取本地存储的token
  const token = localStorage.getItem('token');
  
  // 无需认证的白名单路由
  const whiteList = ['/auth/login'];
  
  // 如果访问的是白名单中的路由，直接放行
  if (whiteList.includes(to.path)) {
    next();
    return;
  }
  
  // 如果有token，放行
  if (token) {
    next();
  } else {
    // 没有token，重定向到登录页面
    next('/auth/login');
  }
});

export default router;
