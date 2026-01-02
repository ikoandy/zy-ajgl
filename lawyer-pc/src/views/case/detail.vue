<template>
  <div class="case-detail-container">
    <div class="page-header">
      <el-button type="primary" @click="goBack">
        <i class="el-icon-arrow-left"></i>
        返回
      </el-button>
      <h1 class="page-title">案件详情</h1>
      <el-button type="primary" @click="editCase">
        <i class="el-icon-edit"></i>
        编辑
      </el-button>
    </div>
    
    <!-- 案件基本信息 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <div class="detail-content">
        <div class="detail-row">
          <div class="detail-item">
            <label>案件编号：</label>
            <span>{{ caseDetail.caseNumber }}</span>
          </div>
          <div class="detail-item">
            <label>案件状态：</label>
            <el-tag :type="getStatusType(caseDetail.status)">{{ caseDetail.status }}</el-tag>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>案件名称：</label>
            <span>{{ caseDetail.title }}</span>
          </div>
          <div class="detail-item">
            <label>客户名称：</label>
            <span>{{ caseDetail.client }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>案件类型：</label>
            <span>{{ caseDetail.type }}</span>
          </div>
          <div class="detail-item">
            <label>负责律师：</label>
            <span>{{ caseDetail.lawyer }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item full-width">
            <label>案件描述：</label>
            <p>{{ caseDetail.description }}</p>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 案件时间线 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>案件进度</span>
          <el-button type="text" size="small" @click="addProgress">添加进度</el-button>
        </div>
      </template>
      <div class="timeline-container">
        <el-timeline>
          <el-timeline-item
            v-for="item in caseDetail.timeline"
            :key="item.id"
            :timestamp="item.time"
          >
            <div class="timeline-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.content }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
    
    <!-- 案件文档 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>案件文档</span>
          <el-button type="text" size="small" @click="uploadDocument">上传文档</el-button>
        </div>
      </template>
      <div class="document-list">
        <el-table :data="caseDetail.documents" stripe style="width: 100%">
          <el-table-column prop="name" label="文档名称" min-width="200"></el-table-column>
          <el-table-column prop="type" label="文档类型" width="100"></el-table-column>
          <el-table-column prop="size" label="文档大小" width="100"></el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="180"></el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="downloadDocument(scope.row.id)"
                style="margin-right: 5px;"
              >
                下载
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteDocument(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 案件详情数据
const caseDetail = ref({
  id: 1,
  caseNumber: 'LAW-2025-001',
  title: 'XX合同纠纷案件',
  client: '张先生',
  status: '进行中',
  type: '合同纠纷',
  lawyer: '王律师',
  description: '这是一起关于XX公司与YY公司之间的合同纠纷案件，涉及金额较大，需要仔细处理。',
  timeline: [
    {
      id: 1,
      title: '案件立案',
      content: '案件已在法院立案，案号为（2025）XX民初字第001号',
      time: '2025-12-01 10:00:00'
    },
    {
      id: 2,
      title: '第一次开庭',
      content: '案件第一次开庭审理，双方进行了举证质证',
      time: '2025-12-15 14:30:00'
    },
    {
      id: 3,
      title: '提交补充证据',
      content: '向法院提交了补充证据材料',
      time: '2025-12-30 10:00:00'
    }
  ],
  documents: [
    {
      id: 1,
      name: '起诉状.pdf',
      type: 'PDF',
      size: '1.2MB',
      uploadTime: '2025-12-01 10:30:00'
    },
    {
      id: 2,
      name: '证据清单.xlsx',
      type: 'Excel',
      size: '500KB',
      uploadTime: '2025-12-01 11:00:00'
    },
    {
      id: 3,
      name: '答辩状.pdf',
      type: 'PDF',
      size: '800KB',
      uploadTime: '2025-12-10 15:00:00'
    }
  ]
})

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

// 生命周期钩子，用于获取案件详情数据
onMounted(() => {
  const id = route.params.id
  // 这里应该根据id调用API获取案件详情
  console.log('获取案件详情，ID：', id)
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 编辑案件
const editCase = () => {
  // 这里应该跳转到编辑案件页面
  ElMessage.success('编辑案件功能已触发')
}

// 添加进度
const addProgress = () => {
  // 这里应该弹出添加进度的对话框
  ElMessage.success('添加进度功能已触发')
}

// 下载文档
const downloadDocument = (_id: number) => {
  // 这里应该调用API下载文档
  ElMessage.success('下载文档功能已触发')
}

// 上传文档
const uploadDocument = () => {
  // 这里应该调用API上传文档
  ElMessage.success('上传文档功能已触发')
}

// 删除文档
const deleteDocument = (_id: number) => {
  // 这里应该调用API删除文档
  ElMessage.success('删除文档功能已触发')
}
</script>

<style scoped>
.case-detail-container {
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

.timeline-container {
  padding: 10px 0;
}

.timeline-content h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 600;
}

.timeline-content p {
  margin: 0;
  font-size: 12px;
  color: #718096;
}

.document-list {
  padding: 10px 0;
}
</style>
