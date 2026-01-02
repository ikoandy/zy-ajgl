<template>
  <div class="case-container">
    <!-- 搜索栏 -->
    <van-search
      v-model="searchValue"
      placeholder="搜索我的案件"
      shape="round"
      @search="handleSearch"
      class="case-search"
    />
    
    <!-- 筛选条件 -->
    <div class="case-filters">
      <van-tabs v-model:active="activeFilter" @change="handleFilterChange">
        <van-tab title="全部" name="all" />
        <van-tab title="待处理" name="pending" />
        <van-tab title="进行中" name="processing" />
        <van-tab title="已完成" name="completed" />
      </van-tabs>
    </div>
    
    <!-- 案件列表 -->
    <div class="case-list">
      <van-cell-group>
        <van-cell
          v-for="item in caseList"
          :key="item.id"
          :title="item.title"
          is-link
          @click="handleCaseClick(item)"
        >
          <template #label>
            <div class="case-info">
              <span class="case-type">{{ getTypeLabel(item.type) }}</span>
              <span class="case-lawyer">{{ item.lawyerName }}</span>
            </div>
            <div class="case-detail">
              <span class="case-status">{{ getStatusLabel(item.status) }}</span>
              <span class="case-time">{{ formatDate(item.createdAt) }}</span>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      
      <!-- 加载更多 -->
      <div class="case-load-more">
        <van-loading type="spinner" v-if="loading" />
        <div v-else-if="hasMore" class="load-more-text" @click="handleLoadMore">
          加载更多
        </div>
        <div v-else class="no-more-text">
          没有更多数据了
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 搜索值
const searchValue = ref('');
// 当前激活的筛选标签
const activeFilter = ref('all');
// 加载状态
const loading = ref(false);
// 是否有更多数据
const hasMore = ref(true);
// 分页参数
const page = ref(1);
const pageSize = ref(10);

// 案件列表数据（客户视角）
const caseList = ref([
  {
    id: 1,
    title: '合同纠纷案件',
    type: 'civil',
    status: 'processing',
    lawyerName: '张三律师',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    title: '离婚纠纷案件',
    type: 'civil',
    status: 'processing',
    lawyerName: '李四律师',
    createdAt: '2024-01-14'
  },
  {
    id: 3,
    title: '交通事故赔偿案件',
    type: 'civil',
    status: 'completed',
    lawyerName: '张三律师',
    createdAt: '2024-01-13'
  },
  {
    id: 4,
    title: '劳动仲裁案件',
    type: 'administrative',
    status: 'pending',
    lawyerName: '王五律师',
    createdAt: '2024-01-12'
  }
]);

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 获取案件类型标签
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    civil: '民事案件',
    criminal: '刑事案件',
    administrative: '行政案件'
  };
  return typeMap[type] || type;
};

// 获取案件状态标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '进行中',
    completed: '已完成'
  };
  return statusMap[status] || status;
};

// 处理搜索
const handleSearch = (value: string) => {
  console.log('搜索:', value);
  // 实际项目中这里应该调用搜索API
};

// 处理筛选标签变化
const handleFilterChange = (name: string) => {
  console.log('筛选:', name);
  // 实际项目中这里应该根据筛选条件重新获取数据
};

// 处理案件点击
const handleCaseClick = (caseItem: any) => {
  router.push(`/case/detail/${caseItem.id}`);
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
.case-container {
  background-color: var(--background-color);
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  margin: 0 auto;
}

.case-search {
  background-color: var(--background-white);
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.case-search :deep(.van-search__content) {
  background-color: var(--background-light);
  border-radius: var(--radius-full);
}

.case-search :deep(.van-search__input) {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.case-filters {
  background-color: var(--background-white);
  margin-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.case-filters :deep(.van-tabs__wrap) {
  background-color: var(--background-white);
}

.case-filters :deep(.van-tab) {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.case-filters :deep(.van-tab--active) {
  color: var(--primary-color);
}

.case-filters :deep(.van-tabs__line) {
  background-color: var(--primary-color);
  height: 3px;
  border-radius: var(--radius-full);
}

.case-list {
  background-color: var(--background-white);
  margin: 0 var(--spacing-4) var(--spacing-4);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.case-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-1);
}

.case-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.case-type {
  background-color: var(--primary-100);
  color: var(--primary-color);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.case-lawyer {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.case-status {
  font-size: var(--font-size-xs);
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
}

.case-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.case-load-more {
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

:deep(.van-cell) {
  border-bottom: 1px solid var(--border-light);
  transition: all 0.2s ease;
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
}

:deep(.van-loading__spinner) {
  color: var(--primary-color);
}
</style>
