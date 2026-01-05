<template>
  <div class="basic-layout">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-left">
        <van-icon name="wap-home-o" size="24" />
      </div>
      <div class="header-title">{{ currentRoute.meta.title }}</div>
      <div class="header-right">
        <van-icon name="search" size="24" @click="handleSearch" />
      </div>
    </header>

    <!-- 内容区域 -->
    <main class="layout-content">
      <router-view />
    </main>

    <!-- 底部导航栏 -->
    <footer class="layout-footer">
      <van-tabbar v-model="active" @change="handleTabChange" :safe-area-inset-bottom="true" placeholder>
        <van-tabbar-item name="dashboard" icon="wap-home-o" title="我的案件" />
        <van-tabbar-item name="case" icon="document" title="案件查询" />
        <van-tabbar-item name="messages" icon="chat-o" title="消息中心" />
        <van-tabbar-item name="profile" icon="user-o" title="个人中心" />
      </van-tabbar>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 计算当前路由
const currentRoute = computed(() => route);

// 当前激活的标签
const active = computed(() => {
  const path = route.path;
  if (path.includes('/dashboard')) return 'dashboard';
  if (path.includes('/case')) return 'case';
  if (path.includes('/messages')) return 'messages';
  if (path.includes('/profile')) return 'profile';
  return 'dashboard';
});

// 处理标签切换
const handleTabChange = (name: string) => {
  router.push(`/mobile/${name}`);
};

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑
  console.log('搜索');
};
</script>

<style scoped>
.basic-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background-color);
  position: relative;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-4);
  height: 50px;
  background-color: var(--background-white);
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border-color);
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left,
.header-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
}

.header-right {
  justify-content: flex-end;
}

.header-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  color: var(--text-primary);
  flex: 1;
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  padding: 0;
  background-color: var(--background-color);
}

.layout-footer {
  background-color: var(--background-white);
  width: 100%;
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.layout-footer :deep(.van-tabbar) {
  width: 100%;
  max-width: 100vw;
  background-color: var(--background-white);
  border-top: 1px solid var(--border-color);
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.layout-footer :deep(.van-tabbar-item) {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.layout-footer :deep(.van-tabbar-item__icon) {
  color: var(--text-tertiary);
  font-size: 20px;
  margin-bottom: 2px;
}

.layout-footer :deep(.van-tabbar-item--active .van-tabbar-item__icon) {
  color: var(--primary-color);
}

.layout-footer :deep(.van-tabbar-item__text) {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  line-height: 1;
}

.layout-footer :deep(.van-tabbar-item--active .van-tabbar-item__text) {
  color: var(--primary-color);
}

/* 确保内容区域不被底部导航栏遮挡 */
.layout-content {
  padding-bottom: 60px;
}
</style>
