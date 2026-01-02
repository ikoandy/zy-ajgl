<template>
  <div class="basic-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside width="240px" class="aside">
        <div class="logo">
          <h1>智能案件管理系统</h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          background-color="#1a365d"
          text-color="#fff"
          active-text-color="#3182ce"
          router
        >
          <el-menu-item
            v-for="menuItem in menuItems"
            :key="menuItem.path"
            :index="menuItem.path"
          >
            <template #icon>
              <i v-if="menuItem.icon" :class="menuItem.icon"></i>
            </template>
            {{ menuItem.title }}
          </el-menu-item>
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
              v-if="!isCollapse"
            ></el-button>
            <el-button
              type="text"
              plain
              icon="el-icon-menu"
              @click="toggleCollapse"
              v-else
            ></el-button>
          </div>
          <div class="header-right">
            <div class="user-info">
              <span class="welcome-text">欢迎，</span>
              <el-dropdown>
                <div class="user-avatar-wrapper">
                  <div class="user-avatar">
                    <span class="avatar-text">{{ username.slice(0, 1) }}</span>
                  </div>
                  <span class="username-text">{{ username }}</span>
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
                    <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
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
import { useRouter } from 'vue-router'

const router = useRouter()
const isCollapse = ref(false)
const username = ref('律师用户')

// 静态菜单数据，避免直接依赖路由meta属性
const menuItems = computed(() => {
  return [
    { path: '/dashboard', title: '仪表盘', icon: 'el-icon-data-line' },
    { path: '/case', title: '案件管理', icon: 'el-icon-folder-opened' },
    { path: '/client', title: '客户管理', icon: 'el-icon-user-solid' },
    { path: '/docs', title: '文档管理', icon: 'el-icon-document' },
    { path: '/schedule', title: '日程管理', icon: 'el-icon-date' },
    { path: '/todo', title: '待办事项', icon: 'el-icon-check' },
    { path: '/message', title: '消息中心', icon: 'el-icon-message-solid' },
    { path: '/finance', title: '财务记录', icon: 'el-icon-calculator' },
    { path: '/profile', title: '个人中心', icon: 'el-icon-user' }
  ]
})

// 获取当前激活菜单
const activeMenu = computed(() => {
  return router.currentRoute.value.path
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 跳转到个人中心
const goToProfile = () => {
  router.push('/profile')
}

// 退出登录
const logout = () => {
  // 清除token和用户信息
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  // 跳转到登录页
  router.push('/login')
}
</script>

<style scoped>
.basic-layout {
  height: 100vh;
  overflow: hidden;
  background-color: var(--background-color);
}

.layout-container {
  height: 100%;
  display: flex;
  flex-direction: row;
}

/* 侧边栏样式优化 */
.aside {
  width: 240px;
  background: linear-gradient(180deg, var(--primary-color) 0%, #1a202c 100%);
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
  background: linear-gradient(90deg, var(--accent-color), #63b3ed);
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
  background: linear-gradient(180deg, var(--accent-color), #63b3ed);
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
  color: var(--accent-color);
  transform: scale(1.1);
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
  border-bottom: 1px solid var(--border-color);
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
  color: var(--text-primary);
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 15px;
}

.header-left .el-button:hover {
  color: var(--accent-color);
  background-color: rgba(49, 130, 206, 0.1);
  border-color: rgba(49, 130, 206, 0.2);
  box-shadow: 0 2px 8px rgba(49, 130, 206, 0.2);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-text {
  font-size: 15px;
  color: var(--text-secondary);
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
  background: linear-gradient(135deg, var(--accent-color), #63b3ed);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(49, 130, 206, 0.3);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.4);
}

.avatar-text {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.username-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.user-avatar-wrapper .el-icon {
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.25s ease;
}

.user-avatar-wrapper:hover .el-icon {
  color: var(--accent-color);
}

/* 下拉菜单样式 */
.el-dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  background-color: #fff;
  overflow: hidden;
}

.el-dropdown-menu__item {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 12px 20px;
}

.el-dropdown-menu__item:hover {
  background-color: rgba(49, 130, 206, 0.1);
  color: var(--accent-color);
  transform: translateX(4px);
}

.el-dropdown-menu__item:last-child {
  border-top: 1px solid var(--border-color);
  color: var(--error-color);
}

.el-dropdown-menu__item:last-child:hover {
  background-color: rgba(229, 62, 62, 0.1);
  color: var(--error-color);
}

/* 主内容区域样式优化 */
.main {
  background-color: var(--background-color);
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
