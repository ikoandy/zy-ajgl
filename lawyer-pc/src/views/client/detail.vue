<template>
  <div class="client-detail-container">
    <div class="page-header">
      <el-button type="primary" @click="goBack">
        <i class="el-icon-arrow-left"></i>
        返回
      </el-button>
      <h1 class="page-title">客户详情</h1>
      <el-button type="primary" @click="editClient">
        <i class="el-icon-edit"></i>
        编辑
      </el-button>
    </div>
    
    <!-- 客户基本信息 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <div class="detail-content">
        <div class="detail-row">
          <div class="detail-item">
            <label>客户ID：</label>
            <span>{{ clientDetail.id }}</span>
          </div>
          <div class="detail-item">
            <label>客户类型：</label>
            <el-tag :type="clientDetail.type === '个人' ? 'success' : 'info'">
              {{ clientDetail.type }}
            </el-tag>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>客户名称：</label>
            <span>{{ clientDetail.name }}</span>
          </div>
          <div class="detail-item">
            <label>联系电话：</label>
            <span>{{ clientDetail.phone }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>邮箱：</label>
            <span>{{ clientDetail.email }}</span>
          </div>
          <div class="detail-item">
            <label>创建时间：</label>
            <span>{{ clientDetail.createTime }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item full-width">
            <label>地址：</label>
            <p>{{ clientDetail.address }}</p>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 关联案件 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>关联案件</span>
        </div>
      </template>
      <div class="related-cases">
        <el-table :data="relatedCases" stripe style="width: 100%">
          <el-table-column prop="id" label="案件ID" width="80"></el-table-column>
          <el-table-column prop="caseNumber" label="案件编号" width="120"></el-table-column>
          <el-table-column prop="title" label="案件名称" min-width="200"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button type="text" size="small" @click="viewCaseDetail(scope.row.id)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <!-- 客户备注 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>客户备注</span>
          <el-button type="text" size="small" @click="addRemark">添加备注</el-button>
        </div>
      </template>
      <div class="remark-list">
        <el-timeline>
          <el-timeline-item
            v-for="item in clientRemarks"
            :key="item.id"
            :timestamp="item.time"
          >
            <div class="remark-item">
              <p>{{ item.content }}</p>
              <span class="remark-author">{{ item.author }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 客户详情数据
const clientDetail = ref({
  id: 1,
  name: '张先生',
  type: '个人',
  phone: '13800138000',
  email: 'zhang@example.com',
  address: '北京市朝阳区',
  createTime: '2025-12-01 10:00:00',
  updateTime: '2025-12-30 14:30:00'
})

// 关联案件
const relatedCases = ref([
  {
    id: 1,
    caseNumber: 'LAW-2025-001',
    title: 'XX合同纠纷案件',
    status: '进行中'
  },
  {
    id: 2,
    caseNumber: 'LAW-2025-002',
    title: 'XX侵权赔偿案件',
    status: '已立案'
  }
])

// 客户备注
const clientRemarks = ref([
  {
    id: 1,
    content: '客户是VIP客户，需要重点关注',
    time: '2025-12-01 10:30:00',
    author: '王律师'
  },
  {
    id: 2,
    content: '客户最近有新的案件需求',
    time: '2025-12-15 14:30:00',
    author: '王律师'
  }
])

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case '进行中':
      return 'warning'
    case '已立案':
      return 'success'
    case '已结案':
      return 'info'
    default:
      return 'info'
  }
}

// 生命周期钩子，用于获取客户详情数据
onMounted(() => {
  const id = route.params.id
  // 这里应该根据id调用API获取客户详情
  console.log('获取客户详情，ID：', id)
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 编辑客户
const editClient = () => {
  // 这里应该跳转到编辑客户页面
  ElMessage.success('编辑客户功能已触发')
}

// 查看案件详情
const viewCaseDetail = (id: number) => {
  router.push(`/case/${id}`)
}

// 添加备注
const addRemark = () => {
  // 这里应该弹出添加备注的对话框
  ElMessage.success('添加备注功能已触发')
}
</script>

<style scoped>
.client-detail-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  color: #1a365d;
  font-size: 24px;
  font-weight: 600;
}

.detail-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-content {
  padding: 20px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.detail-item {
  flex: 1;
  min-width: 300px;
  margin-right: 20px;
  margin-bottom: 15px;
}

.detail-item.full-width {
  flex: 100%;
  min-width: 100%;
  margin-right: 0;
}

.detail-item label {
  display: inline-block;
  width: 100px;
  font-weight: 600;
  color: #1a365d;
  margin-right: 10px;
}

.detail-item span {
  display: inline-block;
  vertical-align: top;
}

.detail-item p {
  margin: 0;
  padding-left: 110px;
  color: #718096;
  line-height: 1.5;
}

/* 关联案件 */
.related-cases {
  padding: 10px 0;
}

/* 备注列表 */
.remark-list {
  padding: 20px;
}

.remark-item {
  background-color: rgba(0, 0, 0, 0.02);
  padding: 12px;
  border-radius: 6px;
}

.remark-item p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
}

.remark-author {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 时间线样式优化 */
.el-timeline {
  padding: 0;
}

.el-timeline-item {
  padding-bottom: 24px;
}

.el-timeline-item__timestamp {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
</style>