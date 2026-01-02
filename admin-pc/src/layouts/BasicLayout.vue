<template>
  <div class="basic-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '240px'" class="aside">
        <div class="logo">
          <h1 v-if="!isCollapse">管理员后台</h1>
          <el-icon v-else><Setting /></el-icon>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          background-color="#1a365d"
          text-color="#fff"
          active-text-color="#3182ce"
          :collapse="isCollapse"
          router
        >
          <template v-for="menu in menuList" :key="menu.path">
            <!-- 有子菜单的情况 -->
            <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
              <template #title>
                <el-icon>
                  <component :is="menu.meta?.icon || 'Setting'" />
                </el-icon>
                <span>{{ menu.meta?.title || '' }}</span>
              </template>
              <el-menu-item
                v-for="subMenu in menu.children"
                :key="subMenu.path"
                :index="'/' + menu.path + '/' + subMenu.path"
              >
                <el-icon>
                  <component :is="subMenu.meta?.icon || 'Setting'" />
                </el-icon>
                <span>{{ subMenu.meta?.title || '' }}</span>
              </el-menu-item>
            </el-sub-menu>
            <!-- 无子菜单的情况 -->
            <el-menu-item v-else :index="'/' + menu.path">
              <el-icon>
                <component :is="menu.meta?.icon || 'Setting'" />
              </el-icon>
              <span>{{ menu.meta?.title || '' }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="header">
          <div class="header-left">
            <el-button
              type="text"
              plain
              icon="el-icon-menu"
              @click="toggleCollapse"
            ></el-button>
            <el-breadcrumb separator="/" class="breadcrumb">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentMenu.meta" :to="{ path: currentMenu.path }">
                {{ currentMenu.meta.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <div class="user-info">
              <span class="welcome-text">欢迎，</span>
              <el-dropdown>
                <div class="user-avatar-wrapper">
                  <div class="user-avatar">
                    <User />
                  </div>
                  <span class="username-text">管理员</span>
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 主内容区域 -->
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 生成菜单列表（从路由配置中提取）
const menuList = computed(() => {
  const routes = router.getRoutes()
  const layoutRoute = routes.find(route => route.name === 'layout')
  return layoutRoute?.children || []
})

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 当前菜单信息
const currentMenu = computed(() => {
  // 从匹配的路由中获取最后一个非layout的路由
  const matchedRoutes = route.matched.filter(route => route.name !== 'layout')
  return matchedRoutes[matchedRoutes.length - 1] || {
    meta: { title: '' },
    path: ''
  }
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 退出登录
const handleLogout = () => {
  router.push('/login')
}
</script>

<style scoped>
.basic-layout {
  height: 100vh;
  overflow: hidden;
  background-color: var(--background-color, #f7fafc);
}

.layout-container {
  height: 100%;
  display: flex;
  flex-direction: row;
}

/* 侧边栏样式优化 */
.aside {
  width: 240px;
  background: linear-gradient(180deg, var(--primary-color, #1a365d) 0%, #1a202c 100%);
  overflow-y: auto;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.aside:hover {
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.2);
}

/* Logo样式优化 */
.logo {
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(49, 130, 206, 0.2) 0%, rgba(66, 153, 225, 0.1) 100%);
  position: relative;
  overflow: hidden;
}

.logo::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-color, #3182ce), #63b3ed);
}

.logo h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.2;
  z-index: 1;
}

.logo .el-icon {
  font-size: 24px;
  color: #fff;
}

/* 菜单样式优化 */
.el-menu {
  background-color: transparent;
  border-right: none;
  padding: 8px 0;
}

.el-menu-item {
  height: 56px;
  line-height: 56px;
  margin: 6px 12px;
  padding: 0 20px;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: transparent;
  position: relative;
  overflow: hidden;
  font-size: 15px;
}

.el-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--accent-color, #3182ce), #63b3ed);
  transform: scaleY(0);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.el-menu-item.is-active {
  background-color: rgba(49, 130, 206, 0.2);
  color: #fff;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2);
}

.el-menu-item.is-active::before {
  transform: scaleY(1);
}

.el-menu-item .el-icon {
  margin-right: 14px;
  font-size: 18px;
  width: 24px;
  text-align: center;
  transition: all 0.25s ease;
}

.el-menu-item:hover .el-icon {
  color: var(--accent-color, #3182ce);
  transform: scale(1.1);
}

/* 子菜单样式 */
.el-sub-menu .el-sub-menu__title {
  height: 56px;
  line-height: 56px;
  margin: 6px 12px;
  padding: 0 20px;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: transparent;
  position: relative;
  overflow: hidden;
  font-size: 15px;
}

.el-sub-menu .el-sub-menu__title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--accent-color, #3182ce), #63b3ed);
  transform: scaleY(0);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-sub-menu .el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.el-sub-menu .el-sub-menu__title:hover .el-icon {
  color: var(--accent-color, #3182ce);
  transform: scale(1.1);
}

.el-sub-menu.is-active > .el-sub-menu__title {
  background-color: rgba(49, 130, 206, 0.2);
  color: #fff;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2);
}

.el-sub-menu.is-active > .el-sub-menu__title::before {
  transform: scaleY(1);
}

/* 右侧主内容区域 */
.layout-container > .el-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航栏样式优化 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  padding: 0 24px;
  height: 64px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.header:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 菜单折叠按钮样式优化 */
.header-left .el-button {
  color: var(--text-primary, #1a202c);
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 15px;
}

.header-left .el-button:hover {
  color: var(--accent-color, #3182ce);
  background-color: rgba(49, 130, 206, 0.1);
  border-color: rgba(49, 130, 206, 0.2);
  box-shadow: 0 2px 8px rgba(49, 130, 206, 0.2);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 面包屑样式 */
.breadcrumb {
  margin: 0;
  font-size: 14px;
}

.breadcrumb .el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: var(--accent-color, #3182ce);
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-text {
  font-size: 15px;
  color: var(--text-secondary, #4a5568);
  font-weight: 500;
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 50px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.user-avatar-wrapper:hover {
  background-color: rgba(49, 130, 206, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color, #3182ce), #63b3ed);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(49, 130, 206, 0.3);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: #fff;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.4);
}

.user-avatar .el-icon {
  font-size: 20px;
}

.username-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
}

.user-avatar-wrapper .el-icon {
  font-size: 14px;
  color: var(--text-secondary, #4a5568);
  transition: all 0.25s ease;
}

.user-avatar-wrapper:hover .el-icon {
  color: var(--accent-color, #3182ce);
}

/* 下拉菜单样式 */
.el-dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color, #e2e8f0);
  background-color: #fff;
  overflow: hidden;
}

.el-dropdown-menu__item {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 12px 20px;
}

.el-dropdown-menu__item:hover {
  background-color: rgba(49, 130, 206, 0.1);
  color: var(--accent-color, #3182ce);
  transform: translateX(4px);
}

.el-dropdown-menu__item:last-child {
  border-top: 1px solid var(--border-color, #e2e8f0);
  color: var(--error-color, #e53e3e);
}

.el-dropdown-menu__item:last-child:hover {
  background-color: rgba(229, 62, 62, 0.1);
  color: var(--error-color, #e53e3e);
}

/* 主内容区域样式优化 */
.main {
  background-color: var(--background-color, #f7fafc);
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* 滚动条样式优化 */
.main::-webkit-scrollbar,
.aside::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.main::-webkit-scrollbar-track,
.aside::-webkit-scrollbar-track {
  background-color: transparent;
}

.main::-webkit-scrollbar-thumb,
.aside::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.main::-webkit-scrollbar-thumb:hover,
.aside::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.25);
}
</style>
