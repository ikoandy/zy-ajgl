<template>
  <div class="schedule-container">
    <div class="page-header">
      <h1 class="page-title">日程管理</h1>
      <el-button type="primary" @click="openAddScheduleDialog">
        <i class="el-icon-plus"></i>
        新增日程
      </el-button>
    </div>
    
    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :model="searchForm" class="search-form" layout="inline">
        <el-form-item label="日程主题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入日程主题"
            clearable
            style="width: 200px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="日程类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择日程类型"
            clearable
            style="width: 150px;"
          >
            <el-option label="案件相关" value="案件相关"></el-option>
            <el-option label="客户会见" value="客户会见"></el-option>
            <el-option label="内部会议" value="内部会议"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="起止日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
            style="width: 300px;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 日程列表 -->
    <el-card class="table-card">
      <el-table
        :data="scheduleList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="日程ID" width="80"></el-table-column>
        <el-table-column prop="title" label="日程主题" min-width="200"></el-table-column>
        <el-table-column prop="type" label="日程类型" width="120">
          <template #default="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180"></el-table-column>
        <el-table-column prop="location" label="地点" min-width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已完成' ? 'success' : scope.row.status === '进行中' ? 'warning' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="viewScheduleDetail(scope.row.id)"
                plain
              >
                <i class="el-icon-view"></i>
                详情
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="openEditScheduleDialog(scope.row)"
                plain
              >
                <i class="el-icon-edit"></i>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteSchedule(scope.row.id)"
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
    
    <!-- 新增日程对话框 -->
    <el-dialog
      v-model="addScheduleDialogVisible"
      title="新增日程"
      width="600px"
    >
      <el-form :model="scheduleForm" :rules="scheduleRules" ref="scheduleFormRef" label-width="100px">
        <el-form-item label="日程主题" prop="title">
          <el-input v-model="scheduleForm.title" placeholder="请输入日程主题"></el-input>
        </el-form-item>
        <el-form-item label="日程类型" prop="type">
          <el-select v-model="scheduleForm.type" placeholder="请选择日程类型">
            <el-option label="案件相关" value="案件相关"></el-option>
            <el-option label="客户会见" value="客户会见"></el-option>
            <el-option label="内部会议" value="内部会议"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="scheduleForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="scheduleForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="地点" prop="location">
          <el-input v-model="scheduleForm.location" placeholder="请输入地点"></el-input>
        </el-form-item>
        <el-form-item label="日程描述" prop="description">
          <el-input v-model="scheduleForm.description" type="textarea" rows="3" placeholder="请输入日程描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addScheduleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addSchedule">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑日程对话框 -->
    <el-dialog
      v-model="editScheduleDialogVisible"
      title="编辑日程"
      width="600px"
    >
      <el-form :model="scheduleForm" :rules="scheduleRules" ref="scheduleFormRef" label-width="100px">
        <el-form-item label="日程主题" prop="title">
          <el-input v-model="scheduleForm.title" placeholder="请输入日程主题"></el-input>
        </el-form-item>
        <el-form-item label="日程类型" prop="type">
          <el-select v-model="scheduleForm.type" placeholder="请选择日程类型">
            <el-option label="案件相关" value="案件相关"></el-option>
            <el-option label="客户会见" value="客户会见"></el-option>
            <el-option label="内部会议" value="内部会议"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="scheduleForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="scheduleForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="地点" prop="location">
          <el-input v-model="scheduleForm.location" placeholder="请输入地点"></el-input>
        </el-form-item>
        <el-form-item label="日程描述" prop="description">
          <el-input v-model="scheduleForm.description" type="textarea" rows="3" placeholder="请输入日程描述"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="scheduleForm.status" placeholder="请选择状态">
            <el-option label="未开始" value="未开始"></el-option>
            <el-option label="进行中" value="进行中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已取消" value="已取消"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editScheduleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editSchedule">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
// import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

// const router = useRouter()

// 搜索表单
const searchForm = reactive({
  title: '',
  type: '',
  dateRange: [] as Date[]
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 定义日程类型
interface ScheduleItem {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  status: string;
}

// 选中的日程
const selectedSchedules = ref<ScheduleItem[]>([])

// 日程列表数据
const scheduleList = ref<ScheduleItem[]>([
  {
    id: 1,
    title: '案件讨论会',
    type: '案件相关',
    startTime: '2025-12-31 14:30:00',
    endTime: '2025-12-31 16:00:00',
    location: '会议室A',
    description: '讨论XX合同纠纷案件的诉讼策略',
    status: '未开始'
  },
  {
    id: 2,
    title: '客户会见',
    type: '客户会见',
    startTime: '2025-12-31 10:00:00',
    endTime: '2025-12-31 11:00:00',
    location: '接待室',
    description: '会见客户张先生，讨论案件进展',
    status: '已完成'
  },
  {
    id: 3,
    title: '内部会议',
    type: '内部会议',
    startTime: '2025-12-30 09:30:00',
    endTime: '2025-12-30 11:00:00',
    location: '会议室B',
    description: '每周团队例会',
    status: '已完成'
  },
  {
    id: 4,
    title: '提交法律文书',
    type: '案件相关',
    startTime: '2025-12-30 15:00:00',
    endTime: '2025-12-30 16:00:00',
    location: '办公室',
    description: '向法院提交XX案件的答辩状',
    status: '已完成'
  }
])

// 设置总条数
pagination.total = scheduleList.value.length

// 日程表单
const scheduleForm = reactive({
  id: 0,
  title: '',
  type: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  status: '未开始'
})

// 表单引用
const scheduleFormRef = ref()

// 对话框控制
const addScheduleDialogVisible = ref(false)
const editScheduleDialogVisible = ref(false)

// 表单验证规则
const scheduleRules = {
  title: [
    { required: true, message: '请输入日程主题', trigger: 'blur' },
    { min: 2, max: 100, message: '日程主题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择日程类型', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

// 生命周期钩子，用于获取日程列表数据
onMounted(() => {
  // 这里应该调用API获取日程列表
  console.log('获取日程列表')
})

// 处理选择变化
const handleSelectionChange = (selection: ScheduleItem[]) => {
  selectedSchedules.value = selection
}

// 搜索日程
const handleSearch = () => {
  // 这里应该调用API进行搜索
  ElMessage.success('搜索功能已触发')
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    title: '',
    type: '',
    dateRange: []
  })
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  // 这里应该调用API获取数据
}

// 当前页码变化
const handleCurrentChange = (current: number) => {
  pagination.currentPage = current
  // 这里应该调用API获取数据
}

// 查看日程详情
const viewScheduleDetail = (_id: number) => {
  // 这里应该跳转到日程详情页面
  ElMessage.success('查看日程详情功能已触发')
}

// 打开新增日程对话框
const openAddScheduleDialog = () => {
  // 重置表单
  Object.assign(scheduleForm, {
    id: 0,
    title: '',
    type: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    status: '未开始'
  })
  addScheduleDialogVisible.value = true
}

// 打开编辑日程对话框
const openEditScheduleDialog = (schedule: ScheduleItem) => {
  // 填充表单数据
  Object.assign(scheduleForm, schedule)
  editScheduleDialogVisible.value = true
}

// 新增日程
const addSchedule = () => {
  if (scheduleFormRef.value) {
    scheduleFormRef.value.validate((valid: boolean) => {
      if (valid) {
        // 这里应该调用API新增日程
        ElMessage.success('新增日程成功')
        addScheduleDialogVisible.value = false
        
        // 模拟添加数据
        const newSchedule = {
          ...scheduleForm,
          id: scheduleList.value.length + 1
        } as ScheduleItem
        scheduleList.value.unshift(newSchedule)
        pagination.total = scheduleList.value.length
      }
    })
  }
}

// 编辑日程
const editSchedule = () => {
  if (scheduleFormRef.value) {
    scheduleFormRef.value.validate((valid: boolean) => {
      if (valid) {
        // 这里应该调用API编辑日程
        ElMessage.success('编辑日程成功')
        editScheduleDialogVisible.value = false
        
        // 模拟更新数据
        const index = scheduleList.value.findIndex(item => item.id === scheduleForm.id)
        if (index !== -1) {
          scheduleList.value[index] = { ...scheduleForm } as ScheduleItem
        }
      }
    })
  }
}

// 删除日程
const deleteSchedule = (id: number) => {
  ElMessageBox.confirm('确定要删除这个日程吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里应该调用API删除日程
    ElMessage.success('删除日程成功')
    
    // 模拟删除数据
    const index = scheduleList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      scheduleList.value.splice(index, 1)
      pagination.total = scheduleList.value.length
    }
  }).catch(() => {
    // 取消删除
  })
}
</script>

<style scoped>
.schedule-container {
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
.el-select .el-input__wrapper,
.el-date-editor .el-input__wrapper {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.el-input__wrapper:hover,
.el-select .el-input__wrapper:hover,
.el-date-editor .el-input__wrapper:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-input__wrapper.is-focus,
.el-select .el-input__wrapper.is-focus,
.el-date-editor .el-input__wrapper.is-focus {
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