<template>
  <div class="messages-container">
    <!-- 搜索栏 -->
    <van-search
      v-model="searchValue"
      placeholder="搜索消息"
      shape="round"
      @search="handleSearch"
    />
    
    <!-- 消息列表 -->
    <div class="messages-list">
      <van-cell-group>
        <van-cell
          v-for="item in messagesList"
          :key="item.id"
          :title="item.title"
          :label="item.content"
          is-link
          @click="handleMessageClick(item)"
        >
          <template #extra>
            <div class="message-extra">
              <span class="message-time">{{ formatTime(item.time) }}</span>
              <van-badge v-if="item.unread" :content="item.unread" color="#ee0a24" />
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      
      <!-- 加载更多 -->
      <div class="messages-load-more">
        <van-loading type="spinner" v-if="loading" />
        <div v-else-if="hasMore" class="load-more-text" @click="handleLoadMore">
          加载更多
        </div>
        <div v-else class="no-more-text">
          没有更多消息了
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';

// 搜索值
const searchValue = ref('');
// 加载状态
const loading = ref(false);
// 是否有更多数据
const hasMore = ref(true);

// 消息列表数据
const messagesList = ref([
  {
    id: 1,
    title: '案件进度更新',
    content: '您的离婚纠纷案已进入庭审准备阶段',
    time: '2024-04-10 14:30',
    unread: 1
  },
  {
    id: 2,
    title: '律师通知',
    content: '请您提供补充证据材料',
    time: '2024-04-09 09:15',
    unread: 0
  },
  {
    id: 3,
    title: '案件材料已上传',
    content: '代理词已上传，请查收',
    time: '2024-04-08 16:45',
    unread: 0
  },
  {
    id: 4,
    title: '开庭时间通知',
    content: '法院已安排开庭时间，请留意',
    time: '2024-04-07 11:20',
    unread: 0
  },
  {
    id: 5,
    title: '案件受理通知',
    content: '您的案件已正式受理',
    time: '2024-04-05 15:00',
    unread: 0
  }
]);

// 格式化时间
const formatTime = (timeStr: string) => {
  const now = new Date();
  const messageTime = new Date(timeStr);
  
  // 如果是今天的消息，显示时分
  if (now.toDateString() === messageTime.toDateString()) {
    return timeStr.substring(11, 16);
  }
  
  // 如果是昨天的消息，显示"昨天"
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === messageTime.toDateString()) {
    return '昨天';
  }
  
  // 其他情况显示月日
  return timeStr.substring(5, 10);
};

// 处理搜索
const handleSearch = (value: string) => {
  showToast(`搜索消息：${value}`);
};

// 处理消息点击
const handleMessageClick = (message: any) => {
  showToast(`查看消息：${message.title}`);
  // 实际项目中这里应该跳转到消息详情页
};

// 处理加载更多
const handleLoadMore = () => {
  if (loading.value) return;
  
  loading.value = true;
  // 模拟加载更多数据
  setTimeout(() => {
    loading.value = false;
    hasMore.value = false;
  }, 1000);
};

// 生命周期钩子
onMounted(() => {
  // 初始化数据
});
</script>

<style scoped>
.messages-container {
  padding-bottom: var(--spacing-6);
  background-color: var(--background-color);
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  margin: 0 auto;
}

/* 搜索栏样式 */
:deep(.van-search) {
  background-color: var(--background-white);
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

:deep(.van-search__content) {
  background-color: var(--background-light);
  border-radius: var(--radius-full);
}

:deep(.van-search__input) {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.messages-list {
  background-color: var(--background-white);
  margin: var(--spacing-4);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.message-extra {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-1);
}

.message-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.messages-load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-6);
  background-color: var(--background-white);
  margin: 0 var(--spacing-4) var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.load-more-text {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.load-more-text:hover {
  color: var(--primary-light);
  text-decoration: underline;
}

.no-more-text {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

/* 消息项样式 */
:deep(.van-cell) {
  border-bottom: 1px solid var(--border-light);
  transition: all 0.2s ease;
  padding: var(--spacing-4);
}

:deep(.van-cell:active) {
  background-color: var(--primary-50);
}

:deep(.van-cell:last-child) {
  border-bottom: none;
}

:deep(.van-cell__title) {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
}

:deep(.van-cell__label) {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

/* 未读消息样式 */
:deep(.van-badge) {
  background-color: var(--error-color);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* 加载动画样式 */
:deep(.van-loading__spinner) {
  color: var(--primary-color);
}
</style>
