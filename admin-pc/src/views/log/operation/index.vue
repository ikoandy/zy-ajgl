<template>
  <div class="operation-log">
    <h2 class="page-title">操作日志</h2>
    <el-card shadow="hover" class="content-card">
      <!-- 搜索区域 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="操作类型">
            <el-select v-model="searchForm.operationType" placeholder="请选择操作类型" clearable style="width: 150px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="新增" value="add"></el-option>
              <el-option label="编辑" value="edit"></el-option>
              <el-option label="删除" value="delete"></el-option>
              <el-option label="查询" value="query"></el-option>
              <el-option label="导出" value="export"></el-option>
              <el-option label="导入" value="import"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="操作模块">
            <el-select v-model="searchForm.module" placeholder="请选择操作模块" clearable style="width: 150px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="案件管理" value="case"></el-option>
              <el-option label="客户管理" value="client"></el-option>
              <el-option label="律师管理" value="lawyer"></el-option>
              <el-option label="用户管理" value="user"></el-option>
              <el-option label="角色管理" value="role"></el-option>
              <el-option label="菜单管理" value="menu"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="操作时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 300px;"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="search-actions">
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedLogIds.length === 0">
            <el-icon-delete></el-icon-delete> 批量删除
          </el-button>
          <el-button @click="handleExport">
            <el-icon-download></el-icon-download> 导出数据
          </el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="logList"
          @selection-change="handleSelectionChange"
          style="width: 100%"
          stripe
          border
        >
          <el-table-column type="selection" width="55" fixed="left"></el-table-column>
          <el-table-column prop="id" label="日志ID" width="120" fixed="left"></el-table-column>
          <el-table-column prop="userId" label="用户ID" width="120"></el-table-column>
          <el-table-column prop="username" label="用户名" width="150"></el-table-column>
          <el-table-column prop="module" label="操作模块" width="120">
            <template #default="scope">
              {{ getModuleLabel(scope.row.module) }}
            </template>
          </el-table-column>
          <el-table-column prop="operationType" label="操作类型" width="120">
            <template #default="scope">
              <el-tag :type="getOperationTypeTagType(scope.row.operationType)">
                {{ getOperationTypeLabel(scope.row.operationType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operationContent" label="操作内容" min-width="300"></el-table-column>
          <el-table-column prop="ip" label="操作IP" width="180"></el-table-column>
          <el-table-column prop="location" label="操作地点" width="200"></el-table-column>
          <el-table-column prop="browser" label="浏览器" width="200"></el-table-column>
          <el-table-column prop="operationTime" label="操作时间" width="180" sortable></el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  username: '',
  operationType: '',
  module: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 操作日志列表
const logList = ref<any[]>([])
const loading = ref(false)

// 选中的日志ID
const selectedLogIds = ref<string[]>([])

// 模块映射
const moduleMap: Record<string, string> = {
  case: '案件管理',
  client: '客户管理',
  lawyer: '律师管理',
  user: '用户管理',
  role: '角色管理',
  menu: '菜单管理'
}

// 操作类型映射
const operationTypeMap: Record<string, string> = {
  add: '新增',
  edit: '编辑',
  delete: '删除',
  query: '查询',
  export: '导出',
  import: '导入'
}

// 获取模块标签文本
const getModuleLabel = (module: string) => {
  return moduleMap[module] || module
}

// 获取操作类型标签类型
const getOperationTypeTagType = (operationType: string) => {
  switch (operationType) {
    case 'add':
      return 'success'
    case 'edit':
      return 'primary'
    case 'delete':
      return 'danger'
    case 'query':
      return 'info'
    case 'export':
      return 'warning'
    case 'import':
      return 'success'
    default:
      return ''
  }
}

// 获取操作类型标签文本
const getOperationTypeLabel = (operationType: string) => {
  return operationTypeMap[operationType] || operationType
}

// 获取操作日志列表
const getOperationLogList = () => {
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    logList.value = [
      {
        id: '1',
        userId: '1001',
        username: 'admin',
        module: 'case',
        operationType: 'add',
        operationContent: '新增了案件：张三诉李四民间借贷纠纷案',
        ip: '192.168.1.100',
        location: '北京市朝阳区',
        browser: 'Chrome 96.0.4664.110',
        operationTime: '2024-01-31 10:30:45'
      },
      {
        id: '2',
        userId: '1002',
        username: 'testuser',
        module: 'client',
        operationType: 'edit',
        operationContent: '编辑了客户：张三的联系方式',
        ip: '192.168.1.101',
        location: '上海市浦东新区',
        browser: 'Safari 15.1',
        operationTime: '2024-01-31 09:45:23'
      },
      {
        id: '3',
        userId: '1001',
        username: 'admin',
        module: 'lawyer',
        operationType: 'delete',
        operationContent: '删除了律师：王五',
        ip: '10.0.0.5',
        location: '北京市海淀区',
        browser: 'Firefox 95.0',
        operationTime: '2024-01-30 16:20:18'
      },
      {
        id: '4',
        userId: '1003',
        username: 'lawyer001',
        module: 'case',
        operationType: 'query',
        operationContent: '查询了案件列表',
        ip: '218.12.34.56',
        location: '广州市天河区',
        browser: 'Chrome Mobile 96.0',
        operationTime: '2024-01-30 14:15:07'
      },
      {
        id: '5',
        userId: '1004',
        username: 'client001',
        module: 'case',
        operationType: 'query',
        operationContent: '查询了个人案件信息',
        ip: '113.20.30.40',
        location: '深圳市南山区',
        browser: 'Safari Mobile 15.1',
        operationTime: '2024-01-30 11:05:32'
      },
      {
        id: '6',
        userId: '1005',
        username: 'lawyer002',
        module: 'client',
        operationType: 'add',
        operationContent: '新增了客户：赵六',
        ip: '192.168.1.102',
        location: '杭州市西湖区',
        browser: 'Edge 96.0.1054.62',
        operationTime: '2024-01-29 18:45:12'
      },
      {
        id: '7',
        userId: '1006',
        username: 'client002',
        module: 'case',
        operationType: 'query',
        operationContent: '查询了案件进度',
        ip: '124.123.45.67',
        location: '成都市武侯区',
        browser: 'Chrome Mobile 96.0',
        operationTime: '2024-01-29 15:20:45'
      },
      {
        id: '8',
        userId: '1007',
        username: 'lawyer003',
        module: 'case',
        operationType: 'edit',
        operationContent: '更新了案件：李四诉王五合同纠纷案的状态为已结案',
        ip: '192.168.1.103',
        location: '武汉市洪山区',
        browser: 'Chrome 96.0.4664.110',
        operationTime: '2024-01-29 10:15:38'
      },
      {
        id: '9',
        userId: '1008',
        username: 'client003',
        module: 'client',
        operationType: 'query',
        operationContent: '查询了个人信息',
        ip: '222.111.222.111',
        location: '重庆市渝北区',
        browser: 'Safari Mobile 15.2',
        operationTime: '2024-01-28 19:30:22'
      },
      {
        id: '10',
        userId: '1009',
        username: 'lawyer004',
        module: 'lawyer',
        operationType: 'edit',
        operationContent: '更新了个人资料',
        ip: '192.168.1.104',
        location: '西安市雁塔区',
        browser: 'Chrome 96.0.4664.110',
        operationTime: '2024-01-28 14:50:15'
      },
      {
        id: '11',
        userId: '1010',
        username: 'client004',
        module: 'case',
        operationType: 'query',
        operationContent: '查询了案件文档',
        ip: '180.123.45.67',
        location: '南京市鼓楼区',
        browser: 'Chrome Mobile 96.0',
        operationTime: '2024-01-28 11:25:48'
      },
      {
        id: '12',
        userId: '1011',
        username: 'lawyer005',
        module: 'case',
        operationType: 'export',
        operationContent: '导出了案件列表',
        ip: '192.168.1.105',
        location: '天津市和平区',
        browser: 'Firefox 95.0',
        operationTime: '2024-01-27 17:40:33'
      }
    ]
    pagination.total = logList.value.length
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  getOperationLogList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    operationType: '',
    module: '',
    dateRange: []
  })
  pagination.currentPage = 1
  getOperationLogList()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedLogIds.value = selection.map(item => item.id)
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该操作日志吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除
    setTimeout(() => {
      logList.value = logList.value.filter(item => item.id !== row.id)
      pagination.total = logList.value.length
      ElMessage.success('删除成功')
    }, 500)
  }).catch(() => {
    // 取消操作
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的${selectedLogIds.value.length}条操作日志吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除
    setTimeout(() => {
      logList.value = logList.value.filter(item => !selectedLogIds.value.includes(item.id))
      pagination.total = logList.value.length
      selectedLogIds.value = []
      ElMessage.success('批量删除成功')
    }, 500)
  }).catch(() => {
    // 取消操作
  })
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  getOperationLogList()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  getOperationLogList()
}

// 初始化
onMounted(() => {
  getOperationLogList()
})
</script>

<style scoped>
.operation-log {
  padding: 0;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.content-card {
  border-radius: 8px;
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-form {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.search-actions {
  display: flex;
  gap: 10px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
