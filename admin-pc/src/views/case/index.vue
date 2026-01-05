<template>
  <div class="case-management">
    <h2 class="page-title">案件管理</h2>
    
    <el-card shadow="hover" class="content-card">
      <!-- 搜索与操作区 -->
      <div class="search-operation-area">
        <el-row :gutter="20">
          <el-col :span="18">
            <el-form :inline="true" :model="searchForm" class="search-form">
              <el-form-item label="案件编号">
                <el-input v-model="searchForm.caseNo" placeholder="请输入案件编号"></el-input>
              </el-form-item>
              <el-form-item label="案件名称">
                <el-input v-model="searchForm.caseName" placeholder="请输入案件名称"></el-input>
              </el-form-item>
              <el-form-item label="案件类型">
                <el-select v-model="searchForm.caseType" placeholder="请选择案件类型">
                  <el-option label="民事案件" value="civil"></el-option>
                  <el-option label="刑事案件" value="criminal"></el-option>
                  <el-option label="行政案件" value="administrative"></el-option>
                  <el-option label="其他案件" value="other"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="案件状态">
                <el-select v-model="searchForm.status" placeholder="请选择案件状态">
                  <el-option label="待处理" value="pending"></el-option>
                  <el-option label="进行中" value="progress"></el-option>
                  <el-option label="已完成" value="completed"></el-option>
                  <el-option label="已归档" value="archived"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6" class="text-right">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon> 新增案件
            </el-button>
            <el-button type="warning" @click="handleExport">
              <el-icon><Download /></el-icon> 导出
            </el-button>
            <el-button type="success" @click="handleImportClick">
              <el-icon><Upload /></el-icon> 导入
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 批量操作区 -->
      <div class="batch-operation-area" v-if="selectedCases.length > 0">
        <el-button type="warning" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
        <el-button type="success" @click="handleBatchArchive">
          <el-icon><DocumentCopy /></el-icon> 批量归档
        </el-button>
      </div>

      <!-- 表格列控制 -->
      <div class="table-column-control" v-if="caseList.length > 0">
        <el-dropdown trigger="click">
          <el-button type="info" size="small">
            <el-icon><Setting /></el-icon> 列设置
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="column in tableColumns" :key="column.prop" @click="toggleColumn(column.prop)">
                <el-checkbox v-model="column.visible">{{ column.label }}</el-checkbox>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 数据表格 -->
      <el-table 
        :data="caseList" 
        style="width: 100%" 
        border
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="caseNo" label="案件编号" v-if="tableColumns.find(col => col.prop === 'caseNo')?.visible"></el-table-column>
        <el-table-column prop="caseName" label="案件名称" v-if="tableColumns.find(col => col.prop === 'caseName')?.visible"></el-table-column>
        <el-table-column prop="caseType" label="案件类型" v-if="tableColumns.find(col => col.prop === 'caseType')?.visible">
          <template #default="scope">
            <el-tag :type="getCaseTypeTagType(scope.row.caseType)">
              {{ getCaseTypeLabel(scope.row.caseType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="clientName" label="客户名称" v-if="tableColumns.find(col => col.prop === 'clientName')?.visible"></el-table-column>
        <el-table-column prop="lawyerName" label="负责律师" v-if="tableColumns.find(col => col.prop === 'lawyerName')?.visible"></el-table-column>
        <el-table-column prop="status" label="案件状态" v-if="tableColumns.find(col => col.prop === 'status')?.visible">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" v-if="tableColumns.find(col => col.prop === 'createTime')?.visible"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" v-if="tableColumns.find(col => col.prop === 'updateTime')?.visible"></el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button type="primary" size="small" @click="handleDetail(scope.row)">
                <el-icon><InfoFilled /></el-icon> 详情
              </el-button>
              <el-button type="success" size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button type="warning" size="small" @click="handleArchive(scope.row)">
                <el-icon><DocumentCopy /></el-icon> 归档
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-area">
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
    >
      <el-form
        ref="caseFormRef"
        :model="caseForm"
        :rules="caseRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="案件编号" prop="caseNo">
              <el-input v-model="caseForm.caseNo" placeholder="请输入案件编号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="案件名称" prop="caseName">
              <el-input v-model="caseForm.caseName" placeholder="请输入案件名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="案件类型" prop="caseType">
              <el-select v-model="caseForm.caseType" placeholder="请选择案件类型">
                <el-option label="民事案件" value="civil"></el-option>
                <el-option label="刑事案件" value="criminal"></el-option>
                <el-option label="行政案件" value="administrative"></el-option>
                <el-option label="其他案件" value="other"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="案件状态" prop="status">
              <el-select v-model="caseForm.status" placeholder="请选择案件状态">
                <el-option label="待处理" value="pending"></el-option>
                <el-option label="进行中" value="progress"></el-option>
                <el-option label="已完成" value="completed"></el-option>
                <el-option label="已归档" value="archived"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="clientName">
              <el-input v-model="caseForm.clientName" placeholder="请输入客户名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责律师" prop="lawyerName">
              <el-input v-model="caseForm.lawyerName" placeholder="请输入负责律师"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="案件描述" prop="description">
              <el-input 
                v-model="caseForm.description" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入案件描述"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="案件进展" prop="progress">
              <el-input 
                v-model="caseForm.progress" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入案件进展"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 案件详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="案件详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="案件编号">{{ detailForm.caseNo }}</el-descriptions-item>
        <el-descriptions-item label="案件名称">{{ detailForm.caseName }}</el-descriptions-item>
        <el-descriptions-item label="案件类型">
          <el-tag :type="getCaseTypeTagType(detailForm.caseType)">
            {{ getCaseTypeLabel(detailForm.caseType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="案件状态">
          <el-tag :type="getStatusTagType(detailForm.status)">
            {{ getStatusLabel(detailForm.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ detailForm.clientName }}</el-descriptions-item>
        <el-descriptions-item label="负责律师">{{ detailForm.lawyerName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ detailForm.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ detailForm.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="案件描述" :span="2">{{ detailForm.description }}</el-descriptions-item>
        <el-descriptions-item label="案件进展" :span="2">{{ detailForm.progress }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 文件上传组件（隐藏） -->
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileUpload"
      accept=".xlsx,.xls,.csv"
      class="hidden-upload"
    >
      <el-button type="primary">上传文件</el-button>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, DocumentCopy, InfoFilled, Download, Upload, Setting, ArrowDown } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  caseNo: '',
  caseName: '',
  caseType: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 表格列配置
const tableColumns = ref([
  { prop: 'caseNo', label: '案件编号', visible: true },
  { prop: 'caseName', label: '案件名称', visible: true },
  { prop: 'caseType', label: '案件类型', visible: true },
  { prop: 'clientName', label: '客户名称', visible: true },
  { prop: 'lawyerName', label: '负责律师', visible: true },
  { prop: 'status', label: '案件状态', visible: true },
  { prop: 'createTime', label: '创建时间', visible: true },
  { prop: 'updateTime', label: '更新时间', visible: true }
])

// 切换列显示状态
const toggleColumn = (prop: string) => {
  const column = tableColumns.value.find(col => col.prop === prop)
  if (column) {
    // 确保至少显示3列
    const visibleColumns = tableColumns.value.filter(col => col.visible)
    if (visibleColumns.length <= 3 && column.visible) {
      ElMessage.warning('至少需要显示3列数据')
      return
    }
    column.visible = !column.visible
  }
}

// 案件列表
const caseList = ref([
  {
    id: 1,
    caseNo: 'CASE20251231001',
    caseName: '张三合同纠纷案件',
    caseType: 'civil',
    clientName: '张三',
    lawyerName: '李四律师',
    status: 'progress',
    description: '这是一个合同纠纷案件，涉及金额100万元。',
    progress: '案件正在审理中，已完成证据收集。',
    createTime: '2025-12-31 09:00:00',
    updateTime: '2025-12-31 10:00:00'
  },
  {
    id: 2,
    caseNo: 'CASE20251231002',
    caseName: '王五刑事案件',
    caseType: 'criminal',
    clientName: '王五',
    lawyerName: '赵六律师',
    status: 'pending',
    description: '这是一个刑事案件，涉及故意伤害罪。',
    progress: '案件已受理，等待开庭。',
    createTime: '2025-12-30 14:00:00',
    updateTime: '2025-12-30 14:00:00'
  },
  {
    id: 3,
    caseNo: 'CASE20251231003',
    caseName: '赵七行政案件',
    caseType: 'administrative',
    clientName: '赵七',
    lawyerName: '孙八律师',
    status: 'completed',
    description: '这是一个行政诉讼案件，涉及行政处罚。',
    progress: '案件已胜诉，法院判决撤销行政处罚。',
    createTime: '2025-12-29 09:00:00',
    updateTime: '2025-12-31 11:00:00'
  }
])

// 选中的案件
const selectedCases = ref<any[]>([])

// 对话框配置
const dialogVisible = ref(false)
const dialogTitle = ref('新增案件')
const dialogData = reactive({ id: '' })

// 详情对话框
const detailVisible = ref(false)
const detailForm = reactive({
  caseNo: '',
  caseName: '',
  caseType: '',
  clientName: '',
  lawyerName: '',
  status: '',
  description: '',
  progress: '',
  createTime: '',
  updateTime: ''
})

// 表单配置
const caseFormRef = ref()
const caseForm = reactive({
  caseNo: '',
  caseName: '',
  caseType: '',
  clientName: '',
  lawyerName: '',
  status: 'pending',
  description: '',
  progress: ''
})

// 表单验证规则
const caseRules = {
  caseNo: [
    { required: true, message: '请输入案件编号', trigger: 'blur' },
    { min: 8, max: 20, message: '案件编号长度在 8 到 20 个字符', trigger: 'blur' }
  ],
  caseName: [
    { required: true, message: '请输入案件名称', trigger: 'blur' },
    { min: 2, max: 100, message: '案件名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  caseType: [
    { required: true, message: '请选择案件类型', trigger: 'change' }
  ],
  clientName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '客户名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  lawyerName: [
    { required: true, message: '请输入负责律师', trigger: 'blur' },
    { min: 2, max: 50, message: '负责律师长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择案件状态', trigger: 'change' }
  ]
}

// 获取案件类型标签类型
const getCaseTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    civil: 'success',
    criminal: 'danger',
    administrative: 'warning',
    other: 'info'
  }
  return typeMap[type] || 'info'
}

// 获取案件类型标签
const getCaseTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    civil: '民事案件',
    criminal: '刑事案件',
    administrative: '行政案件',
    other: '其他案件'
  }
  return typeMap[type] || '其他案件'
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'info',
    progress: 'primary',
    completed: 'success',
    archived: 'warning'
  }
  return statusMap[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    progress: '进行中',
    completed: '已完成',
    archived: '已归档'
  }
  return statusMap[status] || '待处理'
}

// 选择变更
const handleSelectionChange = (selection: any[]) => {
  selectedCases.value = selection
}

// 搜索
const handleSearch = () => {
  // 模拟搜索
  ElMessage.info('搜索功能已触发')
}

// 重置
const handleReset = () => {
  searchForm.caseNo = ''
  searchForm.caseName = ''
  searchForm.caseType = ''
  searchForm.status = ''
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增案件'
  dialogData.id = ''
  // 重置表单
  caseForm.caseNo = ''
  caseForm.caseName = ''
  caseForm.caseType = ''
  caseForm.clientName = ''
  caseForm.lawyerName = ''
  caseForm.status = 'pending'
  caseForm.description = ''
  caseForm.progress = ''
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑案件'
  dialogData.id = row.id
  // 填充表单数据
  caseForm.caseNo = row.caseNo
  caseForm.caseName = row.caseName
  caseForm.caseType = row.caseType
  caseForm.clientName = row.clientName
  caseForm.lawyerName = row.lawyerName
  caseForm.status = row.status
  caseForm.description = row.description
  caseForm.progress = row.progress
  dialogVisible.value = true
}

// 详情
const handleDetail = (row: any) => {
  // 填充详情数据
  detailForm.caseNo = row.caseNo
  detailForm.caseName = row.caseName
  detailForm.caseType = row.caseType
  detailForm.clientName = row.clientName
  detailForm.lawyerName = row.lawyerName
  detailForm.status = row.status
  detailForm.description = row.description
  detailForm.progress = row.progress
  detailForm.createTime = row.createTime
  detailForm.updateTime = row.updateTime
  detailVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该案件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从列表中删除该案件
    const index = caseList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      caseList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 归档
const handleArchive = (row: any) => {
  ElMessageBox.confirm('确定要归档该案件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 更新案件状态为已归档
    const index = caseList.value.findIndex(item => item.id === row.id)
    if (index !== -1 && caseList.value[index]) {
      caseList.value[index] = {
        ...caseList.value[index],
        status: 'archived',
        updateTime: new Date().toLocaleString('zh-CN')
      }
      ElMessage.success('归档成功')
    }
  }).catch(() => {
    // 取消归档
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm('确定要删除选中的案件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从列表中删除选中的案件
    const selectedIds = selectedCases.value.map(item => item.id)
    caseList.value = caseList.value.filter(item => !selectedIds.includes(item.id))
    ElMessage.success(`成功删除 ${selectedCases.value.length} 个案件`)
    selectedCases.value = []
  }).catch(() => {
    // 取消删除
  })
}

// 批量归档
const handleBatchArchive = () => {
  ElMessageBox.confirm('确定要归档选中的案件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 更新选中案件的状态为已归档
    selectedCases.value.forEach(selectedCase => {
      const index = caseList.value.findIndex(item => item.id === selectedCase.id)
      if (index !== -1 && caseList.value[index]) {
        caseList.value[index] = {
          ...caseList.value[index],
          status: 'archived',
          updateTime: new Date().toLocaleString('zh-CN')
        }
      }
    })
    ElMessage.success(`成功归档 ${selectedCases.value.length} 个案件`)
    selectedCases.value = []
  }).catch(() => {
    // 取消归档
  })
}

// 对话框确认
const handleDialogConfirm = async () => {
  if (!caseFormRef.value) {
    ElMessage.error('表单初始化失败')
    return
  }
  
  try {
    const valid = await caseFormRef.value.validate()
    if (valid) {
      // 模拟提交
      setTimeout(() => {
        // 模拟API请求成功
        ElMessage.success(dialogData.id ? '编辑成功' : '新增成功')
        
        // 新增案件成功后，将新案件添加到列表中
        if (!dialogData.id) {
          // 生成新的案件ID（最大ID + 1）
          const maxId = caseList.value.length > 0 ? Math.max(...caseList.value.map(item => item.id)) : 0
          const newCase = {
            id: maxId + 1,
            caseNo: caseForm.caseNo,
            caseName: caseForm.caseName,
            caseType: caseForm.caseType,
            clientName: caseForm.clientName,
            lawyerName: caseForm.lawyerName,
            status: caseForm.status,
            description: caseForm.description,
            progress: caseForm.progress,
            createTime: new Date().toLocaleString('zh-CN'),
            updateTime: new Date().toLocaleString('zh-CN')
          }
          // 添加到案件列表
          caseList.value.unshift(newCase)
        } else {
          // 编辑案件，更新列表中的对应数据
          const index = caseList.value.findIndex(item => item.id === parseInt(dialogData.id))
          if (index !== -1 && caseList.value[index]) {
            const originalCase = caseList.value[index]
            caseList.value[index] = {
              id: originalCase.id,
              caseNo: caseForm.caseNo,
              caseName: caseForm.caseName,
              caseType: caseForm.caseType,
              clientName: caseForm.clientName,
              lawyerName: caseForm.lawyerName,
              status: caseForm.status,
              description: caseForm.description,
              progress: caseForm.progress,
              createTime: originalCase.createTime,
              updateTime: new Date().toLocaleString('zh-CN')
            }
          }
        }
        
        dialogVisible.value = false
        
        // 重置表单
        caseFormRef.value.resetFields()
        dialogData.id = ''
      }, 1000)
    }
  } catch (error: any) {
    console.error('表单验证失败:', error)
    if (error?.message) {
      ElMessage.error(error.message)
    }
  }
}

// 分页大小变更
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  // 模拟分页查询
  ElMessage.info('分页大小变更')
}

// 当前页码变更
const handleCurrentChange = (current: number) => {
  pagination.currentPage = current
  // 模拟分页查询
  ElMessage.info('当前页码变更')
}

// 导出功能
const handleExport = () => {
  // 模拟导出数据
  setTimeout(() => {
    ElMessage.success('案件数据导出成功')
  }, 1000)
}

// 文件上传组件引用
const uploadRef = ref()

// 导入点击事件
const handleImportClick = () => {
  // 触发文件选择
  if (uploadRef.value) {
    uploadRef.value.$refs.input.click()
  }
}

// 文件上传处理
const handleFileUpload = (file: any) => {
  // 模拟文件上传
  const reader = new FileReader()
  reader.onload = (_e) => {
    // 模拟处理导入数据
    setTimeout(() => {
      ElMessage.success(`成功导入 ${caseList.value.length + 2} 条案件数据`)
    }, 1500)
  }
  reader.readAsText(file.raw)
  return false // 阻止自动上传
}

// 初始化
onMounted(() => {
  // 模拟数据加载
  ElMessage.info('案件数据加载成功')
})
</script>

<style scoped>
.case-management {
  padding: 0;
}

.search-operation-area {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.batch-operation-area {
  margin-bottom: 20px;
  padding: 12px;
  background-color: rgba(49, 130, 206, 0.05);
  border-radius: 6px;
  display: flex;
  gap: 10px;
}

.table-column-control {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.table-column-control .el-dropdown-menu {
  width: 200px;
  padding: 10px 0;
}

.table-column-control .el-dropdown-item {
  padding: 8px 20px;
  cursor: pointer;
}

.table-column-control .el-checkbox {
  width: 100%;
  margin: 0;
}

.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-right {
  text-align: right;
}

.hidden-upload {
  display: none;
}
</style>

