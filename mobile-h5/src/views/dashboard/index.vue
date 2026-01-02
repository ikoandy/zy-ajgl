<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>欢迎回来，{{ userInfo?.name }}</h2>
      <div class="dashboard-header-actions">
        <van-icon name="bell-o" size="24" @click="handleNotification" />
      </div>
    </div>
    
    <!-- 我的案件概览 -->
    <div class="dashboard-stats">
      <van-grid :column-num="2" :border="false">
        <van-grid-item icon="document" text="我的案件" :value="statistics.totalCases" value-color="#1989fa" />
        <van-grid-item icon="clock-o" text="进行中" :value="statistics.activeCases" value-color="#f7b801" />
        <van-grid-item icon="success" text="已完成" :value="statistics.completedCases" value-color="#07c160" />
        <van-grid-item icon="file-text" text="待处理文书" :value="statistics.pendingDocuments" value-color="#ee0a24" />
      </van-grid>
    </div>
    
    <!-- 最近案件动态 -->
    <van-card title="最近案件动态" class="dashboard-card">
      <div v-if="recentActivities.length > 0" class="recent-activities">
        <van-cell
          v-for="item in recentActivities"
          :key="item.id"
          :title="item.caseTitle"
          :label="item.content"
          is-link
          @click="handleActivityClick(item)"
        >
          <template #extra>
            <span class="activity-time">{{ formatTime(item.time) }}</span>
          </template>
        </van-cell>
      </div>
      <div v-else class="empty-activities">
        <van-empty description="暂无案件动态" />
      </div>
      <div class="card-action">
        <a href="/case" class="action-link">查看全部案件</a>
      </div>
    </van-card>
    
    <!-- 进行中案件 -->
    <van-card title="进行中案件" class="dashboard-card">
      <div v-if="activeCases.length > 0" class="active-cases">
        <van-cell-group>
          <van-cell
            v-for="item in activeCases"
            :key="item.id"
            :title="item.title"
            :label="item.statusText"
            is-link
            @click="handleCaseClick(item)"
          >
            <template #extra>
              <van-tag :type="item.statusType">{{ item.status }}</van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      <div v-else class="empty-cases">
        <van-empty description="暂无进行中案件" />
      </div>
    </van-card>
    
    <!-- 待办事项 -->
    <van-card title="我的待办" class="dashboard-card">
      <div v-if="todos.length > 0" class="todo-list">
        <van-cell-group>
          <van-cell
            v-for="item in todos"
            :key="item.id"
            :title="item.title"
            is-link
            @click="handleTodoClick(item)"
          >
            <template #left-icon>
              <van-checkbox v-model="item.checked" @change="handleTodoCheck(item)" />
            </template>
            <template #right-icon>
              <span class="todo-deadline">{{ formatDate(item.deadline) }}</span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      <div v-else class="empty-todos">
        <van-empty description="暂无待办事项" />
      </div>
    </van-card>
    
    <!-- 快捷操作 -->
    <div class="quick-actions">
      <van-cell title="在线咨询" icon="chat-o" is-link @click="handleQuickAction('consult')" />
      <van-cell title="提交材料" icon="upload-o" is-link @click="handleQuickAction('upload')" />
      <van-cell title="查看文书" icon="file-text-o" is-link @click="handleQuickAction('documents')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();

// 用户信息（模拟数据 - 客户视角）
const userInfo = computed(() => ({ name: '李四' }));

// 统计数据（客户视角）
const statistics = ref({
  totalCases: 3,
  activeCases: 2,
  completedCases: 1,
  pendingDocuments: 4
});

// 最近案件动态
const recentActivities = ref([
  {
    id: 1,
    caseId: 1,
    caseTitle: '合同纠纷案件',
    content: '案件已提交法院，等待立案通知',
    time: '2024-01-15 14:30'
  },
  {
    id: 2,
    caseId: 2,
    caseTitle: '离婚纠纷案件',
    content: '律师已更新案件进度，请及时查看',
    time: '2024-01-14 10:15'
  },
  {
    id: 3,
    caseId: 1,
    caseTitle: '合同纠纷案件',
    content: '新的文书材料已上传，请查收',
    time: '2024-01-13 16:45'
  }
]);

// 进行中案件
const activeCases = ref([
  {
    id: 1,
    title: '合同纠纷案件',
    status: '进行中',
    statusText: '已提交法院，等待立案',
    statusType: 'primary' as const
  },
  {
    id: 2,
    title: '离婚纠纷案件',
    status: '进行中',
    statusText: '财产分割协商中',
    statusType: 'primary' as const
  }
]);

// 待办事项（客户视角）
const todos = ref([
  {
    id: 1,
    title: '签署案件委托协议',
    deadline: '2024-01-20',
    checked: false
  },
  {
    id: 2,
    title: '提供案件相关证据材料',
    deadline: '2024-01-16',
    checked: false
  },
  {
    id: 3,
    title: '确认诉讼请求细节',
    deadline: '2024-01-18',
    checked: true
  }
]);

// 格式化时间
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 处理案件点击
const handleCaseClick = (caseItem: any) => {
  router.push(`/case/detail/${caseItem.id}`);
};

// 处理活动点击
const handleActivityClick = (activity: any) => {
  router.push(`/case/detail/${activity.caseId}`);
};

// 处理待办点击
const handleTodoClick = (todoItem: any) => {
  showToast(`查看待办：${todoItem.title}`);
};

// 处理待办勾选
const handleTodoCheck = (todoItem: any) => {
  showToast(todoItem.checked ? '已完成' : '未完成');
};

// 处理通知
const handleNotification = () => {
  router.push('/messages');
};

// 处理快捷操作
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'consult':
      showToast('跳转到在线咨询');
      break;
    case 'upload':
      showToast('跳转到材料提交');
      break;
    case 'documents':
      showToast('跳转到文书查看');
      break;
    default:
      showToast('功能开发中');
  }
};
</script>

<style scoped>
.dashboard {
  padding-bottom: var(--spacing-6);
  background-color: var(--background-color);
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  background-color: var(--background-white);
  margin-bottom: var(--spacing-4);
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border-color);
}

.dashboard-header h2 {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--text-primary);
}

.dashboard-stats {
  padding: 0 var(--spacing-4) var(--spacing-4);
}

.dashboard-card {
  margin: 0 var(--spacing-4) var(--spacing-4);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: var(--background-white);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.recent-activities,
.active-cases,
.todo-list {
  margin-top: var(--spacing-3);
}

.activity-time,
.todo-deadline {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.case-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.quick-actions {
  margin: 0 var(--spacing-4) var(--spacing-4);
  background-color: var(--background-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.quick-actions :deep(.van-cell) {
  border-bottom: 1px solid var(--border-light);
}

.quick-actions :deep(.van-cell:last-child) {
  border-bottom: none;
}

.quick-actions :deep(.van-cell:active) {
  background-color: var(--primary-50);
}

.card-action {
  text-align: right;
  margin-top: var(--spacing-3);
  padding: 0 var(--spacing-4) var(--spacing-4);
}

.action-link {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-link:hover {
  color: var(--primary-light);
  text-decoration: underline;
}

/* 适配Vant组件样式 */
:deep(.van-grid-item__content) {
  background-color: var(--background-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  margin: var(--spacing-2);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

:deep(.van-grid-item__content:active) {
  background-color: var(--primary-50);
  transform: scale(0.98);
}

:deep(.van-grid-item__icon) {
  color: var(--primary-color);
}

:deep(.van-grid-item__text) {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

:deep(.van-grid-item__value) {
  color: var(--primary-color);
  font-weight: var(--font-weight-semibold);
}

:deep(.van-card__title) {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

:deep(.van-cell__title) {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

:deep(.van-cell__label) {
  color: var(--text-secondary);
}

:deep(.van-tag--primary) {
  background-color: var(--primary-100);
  color: var(--primary-color);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

:deep(.van-tag--success) {
  background-color: #f0fff4;
  color: var(--success-color);
}

:deep(.van-empty__image) {
  width: 100px;
  height: 100px;
}

:deep(.van-empty__description) {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}
</style>
