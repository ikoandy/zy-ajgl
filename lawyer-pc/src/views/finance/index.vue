<template>
  <div class="finance-container">
    <div class="page-header">
      <h1 class="page-title">财务记录</h1>
      <el-button type="primary" @click="createFinance">
        <i class="el-icon-plus"></i>
        新建记录
      </el-button>
    </div>
    
    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :model="searchForm" class="search-form" layout="inline">
        <el-form-item label="记录类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择记录类型"
            clearable
            style="width: 150px;"
          >
            <el-option label="收入" value="income"></el-option>
            <el-option label="支出" value="expense"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="金额范围">
          <el-input-number
            v-model="searchForm.minAmount"
            :min="0"
            style="width: 100px;"
            placeholder="最小"
          ></el-input-number>
          <span style="margin: 0 10px;">-</span>
          <el-input-number
            v-model="searchForm.maxAmount"
            :min="0"
            style="width: 100px;"
            placeholder="最大"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 财务记录列表 -->
    <el-card class="table-card">
      <el-table
        :data="financeList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="记录ID" width="120"></el-table-column>
        <el-table-column prop="type" label="记录类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'">
              {{ scope.row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            <span :class="scope.row.type === 'income' ? 'amount-income' : 'amount-expense'">
              {{ scope.row.type === 'income' ? '+' : '-' }}¥{{ scope.row.amount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="category" label="分类" width="120"></el-table-column>
        <el-table-column prop="createTime" label="记录时间" width="180"></el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="viewFinance(scope.row.id)"
                plain
              >
                <i class="el-icon-view"></i>
                详情
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="editFinance()"
                plain
              >
                <i class="el-icon-edit"></i>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteFinance(scope.row.id)"
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
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  type: '',
  minAmount: 0,
  maxAmount: 0
})

// 日期范围
const dateRange = ref([])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 定义财务记录类型
interface FinanceItem {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  createTime: string;
}

// 选中的记录
const selectedFinances = ref<FinanceItem[]>([])

// 财务记录列表数据
const financeList = ref<FinanceItem[]>([])

// 生命周期钩子，用于获取财务记录列表数据
onMounted(() => {
  getFinanceList()
})

// 获取财务记录列表
const getFinanceList = async () => {
  try {
    const params: Record<string, any> = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.type) params.type = searchForm.type
    if (searchForm.minAmount) params.minAmount = searchForm.minAmount
    if (searchForm.maxAmount) params.maxAmount = searchForm.maxAmount
    
    const res = await request.get('/financial', params)
    if (res.code === 200 && res.data) {
      financeList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取财务记录列表失败:', error)
  }
}

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedFinances.value = selection
}

// 搜索财务记录
const handleSearch = () => {
  pagination.currentPage = 1
  getFinanceList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    type: '',
    minAmount: 0,
    maxAmount: 0
  })
  dateRange.value = []
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  getFinanceList()
}

// 当前页码变化
const handleCurrentChange = (current: number) => {
  pagination.currentPage = current
  getFinanceList()
}

// 新建财务记录
const createFinance = async () => {
  ElMessage.success('新建记录功能已触发')
}

// 查看财务记录详情
const viewFinance = async (id: number) => {
  try {
    const res = await request.get(`/financial/${id}`)
    if (res.code === 200 && res.data) {
      ElMessage.success('获取详情成功')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取详情失败')
  }
}

// 编辑财务记录
const editFinance = async () => {
  try {
    ElMessage.success('编辑记录功能已触发')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '编辑记录失败')
  }
}

// 删除财务记录
const deleteFinance = async (id: number) => {
  try {
    await request.delete(`/financial/${id}`)
    ElMessage.success('删除记录成功')
    getFinanceList()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '删除记录失败')
  }
}
</script>

<style scoped>
.finance-container {
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
}

/* 表格内容 */
.table-card .el-card__body {
  padding: 0;
}

/* 金额样式 */
.amount-income {
  color: #67c23a;
  font-weight: 600;
}

.amount-expense {
  color: #f56c6c;
  font-weight: 600;
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
</style>
