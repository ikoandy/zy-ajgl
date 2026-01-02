<template>
  <div class="message-container">
    <div class="page-header">
      <h1 class="page-title">消息中心</h1>
      <el-button type="primary" @click="markAllAsRead">
        <i class="el-icon-check"></i>
        全部已读
      </el-button>
    </div>
    
    <!-- 消息筛选 -->
    <el-card class="filter-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部消息" name="all"></el-tab-pane>
        <el-tab-pane label="未读消息" name="unread"></el-tab-pane>
        <el-tab-pane label="系统通知" name="system"></el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 消息列表 -->
    <el-card class="message-card">
      <el-empty v-if="filteredMessages.length === 0" description="暂无消息"></el-empty>
      <el-timeline v-else>
        <el-timeline-item
          v-for="message in filteredMessages"
          :key="message.id"
          :timestamp="formatTime(message.createTime)"
          :color="message.status === 'unread' ? 'primary' : '#8c8c8c'"
        >
          <el-card
            class="message-item"
            :class="{ 'unread': message.status === 'unread' }"
            @click="handleMessageClick(message)"
          >
            <div class="message-header">
              <h3 class="message-title">{{ message.title }}</h3>
              <el-tag size="small" :type="message.type === 'system' ? 'info' : 'success'">
                {{ message.type === 'system' ? '系统通知' : '业务消息' }}
              </el-tag>
            </div>
            <p class="message-content">{{ message.content }}</p>
            <div class="message-footer">
              <span class="message-time">{{ formatDateTime(message.createTime) }}</span>
              <el-button
                v-if="message.status === 'unread'"
                type="primary"
                size="small"
                plain
                @click.stop="markAsRead(message.id)"
              >
                标记已读
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredMessages.length > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredMessages.length"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 分页数据
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 激活的标签页
const activeTab = ref('all')

// 定义消息类型
interface MessageItem {
  id: number;
  title: string;
  content: string;
  type: 'system' | 'business';
  status: 'read' | 'unread';
  createTime: string;
}

// 消息列表数据
const messagesList = ref<MessageItem[]>([
  {
    id: 1,
    title: '新案件分配',
    content: '您有一个新的合同纠纷案件需要处理，请及时查看。',
    type: 'business',
    status: 'unread',
    createTime: '2025-12-31 14:30:00'
  },
  {
    id: 2,
    title: '系统更新通知',
    content: '系统将于2026年1月1日凌晨2:00-4:00进行维护更新，请提前做好准备。',
    type: 'system',
    status: 'unread',
    createTime: '2025-12-30 10:00:00'
  },
  {
    id: 3,
    title: '客户预约提醒',
    content: '客户张先生预约了明天下午2:00的咨询，请准时参加。',
    type: 'business',
    status: 'read',
    createTime: '2025-12-29 16:00:00'
  },
  {
    id: 4,
    title: '案件状态更新',
    content: '案件LAW-2025-001的状态已更新为"已结案"，请查看详情。',
    type: 'business',
    status: 'read',
    createTime: '2025-12-28 09:30:00'
  },
  {
    id: 5,
    title: '财务报表生成',
    content: '12月份的财务报表已生成，请前往财务模块查看。',
    type: 'system',
    status: 'read',
    createTime: '2025-12-27 15:00:00'
  }
])

// 筛选后的消息列表
const filteredMessages = computed(() => {
  let result = [...messagesList.value]
  
  // 根据标签页筛选
  if (activeTab.value === 'unread') {
    result = result.filter(item => item.status === 'unread')
  } else if (activeTab.value === 'system') {
    result = result.filter(item => item.type === 'system')
  }
  
  return result
})

// 格式化时间
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化日期时间
const formatDateTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 处理消息点击
const handleMessageClick = (message: MessageItem) => {
  if (message.status === 'unread') {
    markAsRead(message.id)
  }
  // 这里可以跳转到相关详情页
  console.log('查看消息详情:', message.id)
}

// 标记为已读
const markAsRead = (id: number) => {
  const message = messagesList.value.find(item => item.id === id)
  if (message) {
    message.status = 'read'
    ElMessage.success('已标记为已读')
  }
}

// 全部标记为已读
const markAllAsRead = () => {
  messagesList.value.forEach(item => {
    item.status = 'read'
  })
  ElMessage.success('全部消息已标记为已读')
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
}

// 当前页码变化
const handleCurrentChange = (current: number) => {
  pagination.value.currentPage = current
}
</script>

<style scoped>
.message-container {
  padding: 0;
  overflow-x: auto;
  overflow-y: auto;
}

/* 页面标题栏 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  margin: 0;
  color: var(--primary-color);
  font-size: 24px;
  font-weight: 600;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
}

/* 消息卡片 */
.message-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  overflow: hidden;
}

/* 消息列表 */
:deep(.el-timeline-item__wrapper) {
  margin-bottom: 20px;
}

/* 消息项 */
.message-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.message-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.message-item.unread {
  border-left: 4px solid var(--primary-color);
}

/* 消息头部 */
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.message-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

/* 消息内容 */
.message-content {
  margin: 10px 0;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 消息底部 */
.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  color: #999;
  font-size: 12px;
}

/* 消息时间 */
.message-time {
  color: #999;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px 24px;
  background-color: rgba(0, 0, 0, 0.02);
  border-top: 1px solid var(--border-color);
  margin-top: 20px;
}
</style>
