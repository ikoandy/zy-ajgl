<template>
  <div class="case-detail">
    <!-- 案件基本信息 -->
    <van-card class="case-card">
      <h2 class="case-title">{{ caseInfo.title }}</h2>
      <div class="case-basic-info">
        <div class="info-item">
          <span class="info-label">案件编号:</span>
          <span class="info-value">{{ caseInfo.caseNo }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">案件类型:</span>
          <van-tag :type="getTypeTagType(caseInfo.type)">{{ getTypeLabel(caseInfo.type) }}</van-tag>
        </div>
        <div class="info-item">
          <span class="info-label">当前状态:</span>
          <van-tag :type="getStatusTagType(caseInfo.status)">{{ getStatusLabel(caseInfo.status) }}</van-tag>
        </div>
        <div class="info-item">
          <span class="info-label">负责律师:</span>
          <span class="info-value">{{ caseInfo.lawyerName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">立案时间:</span>
          <span class="info-value">{{ formatDate(caseInfo.createTime) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">预计结案:</span>
          <span class="info-value">{{ formatDate(caseInfo.expectedEndTime) }}</span>
        </div>
      </div>
    </van-card>
    
    <!-- 案件进度 -->
    <van-card title="案件进度" class="case-card">
      <div class="case-progress">
        <div v-for="(item, index) in caseInfo.progress" :key="index" class="progress-item">
          <div class="progress-step">
            <div class="step-icon" :class="{ 'completed': item.completed }">
              {{ index + 1 }}
            </div>
            <div class="step-line" v-if="index < caseInfo.progress.length - 1" :class="{ 'completed': item.completed }">
            </div>
          </div>
          <div class="progress-content">
            <div class="progress-title">{{ item.title }}</div>
            <div class="progress-description">{{ item.description }}</div>
            <div class="progress-time">{{ formatDate(item.time) }}</div>
          </div>
        </div>
      </div>
    </van-card>
    
    <!-- 文书材料 -->
    <van-card title="文书材料" class="case-card">
      <div v-if="caseInfo.documents.length > 0" class="case-documents">
        <van-cell
          v-for="doc in caseInfo.documents"
          :key="doc.id"
          :title="doc.name"
          :label="formatDate(doc.uploadTime)"
          is-link
          @click="handleDocumentClick(doc)"
        >
          <template #right-icon>
            <van-icon name="download-o" color="#1989fa" />
          </template>
        </van-cell>
      </div>
      <div v-else class="empty-documents">
        <van-empty description="暂无文书材料" />
      </div>
    </van-card>
    
    <!-- 待办事项 -->
    <van-card title="待办事项" class="case-card">
      <div v-if="caseInfo.todos.length > 0" class="case-todos">
        <van-cell-group>
          <van-cell
            v-for="todo in caseInfo.todos"
            :key="todo.id"
            :title="todo.title"
            is-link
            @click="handleTodoClick(todo)"
          >
            <template #left-icon>
              <van-checkbox v-model="todo.completed" @change="handleTodoCheck(todo)" />
            </template>
            <template #right-icon>
              <span class="todo-deadline">{{ formatDate(todo.deadline) }}</span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      <div v-else class="empty-todos">
        <van-empty description="暂无待办事项" />
      </div>
    </van-card>
    
    <!-- 操作按钮 -->
    <div class="case-actions">
      <van-button type="primary" block @click="handleContactLawyer">联系律师</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';

const route = useRoute();

// 案件信息（模拟数据）
const caseInfo = ref({
  id: 1,
  caseNo: 'CASE2024001',
  title: '张三离婚纠纷案',
  type: 'civil',
  status: 'processing',
  lawyerName: '李四律师',
  createTime: '2024-01-15',
  expectedEndTime: '2024-06-30',
  progress: [
    {
      title: '案件受理',
      description: '案件已正式受理',
      time: '2024-01-15',
      completed: true
    },
    {
      title: '证据收集',
      description: '正在收集相关证据',
      time: '2024-02-01',
      completed: true
    },
    {
      title: '庭审准备',
      description: '正在准备庭审材料',
      time: '2024-03-10',
      completed: false
    },
    {
      title: '开庭审理',
      description: '等待法院安排开庭',
      time: '',
      completed: false
    },
    {
      title: '案件结案',
      description: '案件审理完毕',
      time: '',
      completed: false
    }
  ],
  documents: [
    {
      id: 1,
      name: '起诉状.pdf',
      uploadTime: '2024-01-20'
    },
    {
      id: 2,
      name: '证据清单.pdf',
      uploadTime: '2024-02-05'
    },
    {
      id: 3,
      name: '代理词.pdf',
      uploadTime: '2024-03-15'
    }
  ],
  todos: [
    {
      id: 1,
      title: '提供补充证据',
      deadline: '2024-04-10',
      completed: false
    },
    {
      id: 2,
      title: '签署授权委托书',
      deadline: '2024-04-05',
      completed: true
    }
  ]
});

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '未确定';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

// 获取案件类型标签类型
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    civil: 'primary',
    criminal: 'danger',
    administrative: 'warning'
  };
  return typeMap[type] || undefined;
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

// 获取案件状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success'
  };
  return typeMap[status] || undefined;
};

// 处理文档点击
const handleDocumentClick = (doc: any) => {
  showToast(`下载文档：${doc.name}`);
};

// 处理待办点击
const handleTodoClick = (todo: any) => {
  showToast(`查看待办：${todo.title}`);
};

// 处理待办勾选
const handleTodoCheck = (todo: any) => {
  showToast(todo.completed ? '已完成' : '未完成');
};

// 处理联系律师
const handleContactLawyer = () => {
  showToast('联系律师功能开发中');
};

// 生命周期钩子
onMounted(() => {
  // 实际项目中这里应该根据案件ID获取案件详情
  console.log('案件ID:', route.params.id);
});
</script>

<style scoped>
.case-detail {
  padding-bottom: var(--spacing-6);
  background-color: var(--background-color);
  min-height: 100vh;
}

.case-card {
  margin: 0 var(--spacing-4) var(--spacing-4);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: var(--background-white);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.case-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.case-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-4);
  color: var(--primary-color);
}

.case-basic-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  background-color: var(--background-light);
  border-radius: var(--radius-md);
}

.info-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-1);
  font-weight: var(--font-weight-medium);
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

/* 案件进度样式 */
.case-progress {
  display: flex;
  flex-direction: column;
  padding: 0 var(--spacing-6);
}

.progress-item {
  display: flex;
  margin-bottom: var(--spacing-6);
  position: relative;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: var(--spacing-5);
  position: relative;
}

.step-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--border-dark);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  z-index: 1;
  border: 2px solid var(--background-white);
  box-shadow: 0 0 0 2px var(--background-light);
  transition: all 0.3s ease;
}

.step-icon.completed {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 0 0 2px var(--primary-100);
}

.step-line {
  width: 2px;
  height: 60px;
  background-color: var(--border-dark);
  margin-top: var(--spacing-2);
  margin-bottom: calc(var(--spacing-2) * -1);
}

.step-line.completed {
  background-color: var(--primary-color);
}

.progress-content {
  flex: 1;
  padding: var(--spacing-2) 0;
}

.progress-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-1);
}

.progress-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-1);
  line-height: var(--line-height-relaxed);
}

.progress-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* 文书材料样式 */
.case-documents,
.case-todos {
  background-color: var(--background-white);
}

.empty-documents,
.empty-todos {
  padding: var(--spacing-6) 0;
  text-align: center;
}

/* 操作按钮样式 */
.case-actions {
  padding: 0 var(--spacing-4);
  margin-top: var(--spacing-4);
}

.case-actions :deep(.van-button--primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.case-actions :deep(.van-button--primary:hover) {
  background-color: var(--primary-light);
  border-color: var(--primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.case-actions :deep(.van-button--primary:active) {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(0);
}

/* 适配Vant组件样式 */
:deep(.van-card__title) {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

:deep(.van-tag--primary) {
  background-color: var(--primary-100);
  color: var(--primary-color);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

:deep(.van-tag--danger) {
  background-color: #fff5f5;
  color: var(--error-color);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

:deep(.van-tag--warning) {
  background-color: #fffaf0;
  color: var(--warning-color);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
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

:deep(.van-empty__image) {
  width: 100px;
  height: 100px;
}

:deep(.van-empty__description) {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}
</style>
