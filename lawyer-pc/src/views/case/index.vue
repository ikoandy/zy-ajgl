<template>
  <div class="case-container">
    <div class="page-header">
      <h1 class="page-title">案件管理</h1>
      <el-button type="primary" @click="createCase">
        <i class="el-icon-plus"></i>
        新建案件
      </el-button>
    </div>
    
    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :model="searchForm" class="search-form" layout="inline">
        <el-form-item label="案件编号">
          <el-input
            v-model="searchForm.caseNumber"
            placeholder="请输入案件编号"
            clearable
            style="width: 200px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="案件名称">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入案件名称"
            clearable
            style="width: 200px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.client"
            placeholder="请输入客户名称"
            clearable
            style="width: 200px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="案件状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择案件状态"
            clearable
            style="width: 150px;"
          >
            <el-option label="进行中" value="进行中"></el-option>
            <el-option label="已立案" value="已立案"></el-option>
            <el-option label="已结案" value="已结案"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 案件列表 -->
    <el-card class="table-card">
      <el-table
        :data="casesList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="caseNumber" label="案件编号" width="120"></el-table-column>
        <el-table-column prop="title" label="案件名称" min-width="200"></el-table-column>
        <el-table-column prop="client" label="客户名称" width="120"></el-table-column>
        <el-table-column prop="status" label="案件状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="viewCase(scope.row.id)"
                plain
              >
                <i class="el-icon-view"></i>
                详情
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="editCase(scope.row.id)"
                plain
              >
                <i class="el-icon-edit"></i>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteCase(scope.row.id)"
                plain
              >
                <i class="el-icon-delete"></i>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  caseNumber: '',
  title: '',
  client: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 定义案件类型
interface CaseItem {
  id: number;
  caseNumber: string;
  title: string;
  client: string;
  status: string;
  createTime: string;
  updateTime: string;
}

// 选中的案件
const selectedCases = ref<CaseItem[]>([])

// 案件列表数据
const casesList = ref<CaseItem[]>([])

// 生命周期钩子，用于获取案件列表数据
onMounted(() => {
  getCasesList()
})

// 获取案件列表
const getCasesList = async () => {
  try {
    const params: Record<string, any> = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.caseNumber) params.caseNumber = searchForm.caseNumber
    if (searchForm.title) params.title = searchForm.title
    if (searchForm.client) params.client = searchForm.client
    if (searchForm.status) params.status = searchForm.status
    
    const res = await request.get('/cases', params)
    if (res.code === 200 && res.data) {
      casesList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取案件列表失败:', error)
  }
}

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

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedCases.value = selection
}

// 搜索案件
const handleSearch = () => {
  pagination.currentPage = 1
  getCasesList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    caseNumber: '',
    title: '',
    client: '',
    status: ''
  })
  pagination.currentPage = 1
  getCasesList()
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  getCasesList()
}

// 当前页码变化
const handleCurrentChange = (current: number) => {
  pagination.currentPage = current
  getCasesList()
}

// 新建案件
const createCase = () => {
  // 跳转到新建案件页面
  router.push('/case/create')
}

// 查看案件详情
const viewCase = (id: number) => {
  router.push(`/case/${id}`)
}

// 编辑案件
const editCase = (id: number) => {
  // 跳转到编辑案件页面
  router.push(`/case/${id}/edit`)
}

// 删除案件
const deleteCase = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该案件吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    await request.delete(`/cases/${id}`)
    ElMessage.success('删除成功')
    
    // 重新获取案件列表
    getCasesList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}
</script>

<style scoped>
.case-container {
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

/* 搜索筛选卡片 */
.filter-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  padding: 24px;
  transition: all 0.3s ease;
}

.filter-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

/* 搜索表单 */
.search-form {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

/* 表格卡片 */
.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  overflow: hidden;
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

/* 表格内容 */
.table-card .el-card__body {
  padding: 0;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px 24px;
  background-color: rgba(0, 0, 0, 0.02);
  border-top: 1px solid var(--border-color);
}

/* 操作按钮组样式 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
}

/* 操作按钮样式优化 */
.el-button--small {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

/* 主按钮样式 */
.el-button--primary {
  background-color: transparent;
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.el-button--primary:hover,
.el-button--primary:focus {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
  box-shadow: 0 2px 8px rgba(49, 130, 206, 0.3);
}

/* 警告按钮样式 */
.el-button--warning {
  background-color: transparent;
  border-color: var(--warning-color);
  color: var(--warning-color);
}

.el-button--warning:hover,
.el-button--warning:focus {
  background-color: var(--warning-color);
  border-color: var(--warning-color);
  color: #fff;
  box-shadow: 0 2px 8px rgba(214, 158, 46, 0.3);
}

/* 危险按钮样式 */
.el-button--danger {
  background-color: transparent;
  border-color: var(--error-color);
  color: var(--error-color);
}

.el-button--danger:hover,
.el-button--danger:focus {
  background-color: var(--error-color);
  border-color: var(--error-color);
  color: #fff;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
}

/* 按钮图标样式 */
.el-button .el-icon {
  margin-right: 4px;
  font-size: 12px;
}

/* 标签样式优化 */
.el-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 表单输入框样式优化 */
.el-input__wrapper,
.el-select .el-input__wrapper {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.el-input__wrapper:hover,
.el-select .el-input__wrapper:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-input__wrapper.is-focus,
.el-select .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-container {
    justify-content: center;
  }
}
</style>
