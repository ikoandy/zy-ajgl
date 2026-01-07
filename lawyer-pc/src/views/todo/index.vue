<template>
  <div class="todo-container">
    <div class="page-header">
      <h1 class="page-title">待办事项</h1>
      <el-button type="primary" @click="openAddTodoDialog">
        <i class="el-icon-plus"></i>
        新增待办
      </el-button>
    </div>
    
    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :model="searchForm" class="search-form" layout="inline">
        <el-form-item label="待办标题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入待办标题"
            clearable
            style="width: 200px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px;"
          >
            <el-option label="未完成" value="未完成"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已逾期" value="已逾期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select
            v-model="searchForm.priority"
            placeholder="请选择优先级"
            clearable
            style="width: 120px;"
          >
            <el-option label="高" value="高"></el-option>
            <el-option label="中" value="中"></el-option>
            <el-option label="低" value="低"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 待办列表 -->
    <el-card class="table-card">
      <el-table
        :data="todoList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="待办ID" width="80"></el-table-column>
        <el-table-column prop="title" label="待办标题" min-width="250"></el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.priority === '高' ? 'danger' : scope.row.priority === '中' ? 'warning' : 'success'">
              {{ scope.row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="截止日期" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-select v-model="scope.row.status" @change="updateTodoStatus(scope.row.id, scope.row.status)" placeholder="请选择">
              <el-option label="未完成" value="未完成"></el-option>
              <el-option label="已完成" value="已完成"></el-option>
              <el-option label="已逾期" value="已逾期"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="assignee" label="负责人" width="120"></el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="viewTodoDetail(scope.row.id)"
                plain
              >
                <i class="el-icon-view"></i>
                详情
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="openEditTodoDialog(scope.row)"
                plain
              >
                <i class="el-icon-edit"></i>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteTodo(scope.row.id)"
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
    
    <!-- 新增待办对话框 -->
    <el-dialog
      v-model="addTodoDialogVisible"
      title="新增待办"
      width="600px"
    >
      <el-form :model="todoForm" :rules="todoRules" ref="todoFormRef" label-width="100px">
        <el-form-item label="待办标题" prop="title">
          <el-input v-model="todoForm.title" placeholder="请输入待办标题"></el-input>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="todoForm.priority" placeholder="请选择优先级">
            <el-option label="高" value="高"></el-option>
            <el-option label="中" value="中"></el-option>
            <el-option label="低" value="低"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="dueDate">
          <el-date-picker
            v-model="todoForm.dueDate"
            type="datetime"
            placeholder="选择截止日期"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="负责人" prop="assignee">
          <el-input v-model="todoForm.assignee" placeholder="请输入负责人"></el-input>
        </el-form-item>
        <el-form-item label="待办描述" prop="description">
          <el-input v-model="todoForm.description" type="textarea" rows="3" placeholder="请输入待办描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addTodoDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addTodo">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑待办对话框 -->
    <el-dialog
      v-model="editTodoDialogVisible"
      title="编辑待办"
      width="600px"
    >
      <el-form :model="todoForm" :rules="todoRules" ref="todoFormRef" label-width="100px">
        <el-form-item label="待办标题" prop="title">
          <el-input v-model="todoForm.title" placeholder="请输入待办标题"></el-input>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="todoForm.priority" placeholder="请选择优先级">
            <el-option label="高" value="高"></el-option>
            <el-option label="中" value="中"></el-option>
            <el-option label="低" value="低"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="dueDate">
          <el-date-picker
            v-model="todoForm.dueDate"
            type="datetime"
            placeholder="选择截止日期"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="todoForm.status" placeholder="请选择状态">
            <el-option label="未完成" value="未完成"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已逾期" value="已逾期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="assignee">
          <el-input v-model="todoForm.assignee" placeholder="请输入负责人"></el-input>
        </el-form-item>
        <el-form-item label="待办描述" prop="description">
          <el-input v-model="todoForm.description" type="textarea" rows="3" placeholder="请输入待办描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editTodoDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editTodo">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  title: '',
  status: '',
  priority: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 定义待办类型
interface TodoItem {
  id: number;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  status: string;
  assignee: string;
  createTime: string;
  updateTime: string;
}

// 选中的待办
const selectedTodos = ref<TodoItem[]>([])

// 待办列表数据
const todoList = ref<TodoItem[]>([])

// 待办表单
const todoForm = reactive({
  id: 0,
  title: '',
  description: '',
  priority: '中',
  dueDate: '',
  status: '未完成',
  assignee: ''
})

// 表单引用
const todoFormRef = ref()

// 对话框控制
const addTodoDialogVisible = ref(false)
const editTodoDialogVisible = ref(false)

// 表单验证规则
const todoRules = {
  title: [
    { required: true, message: '请输入待办标题', trigger: 'blur' },
    { min: 2, max: 100, message: '待办标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  dueDate: [
    { required: true, message: '请选择截止日期', trigger: 'change' }
  ],
  assignee: [
    { required: true, message: '请输入负责人', trigger: 'blur' }
  ]
}

// 生命周期钩子，用于获取待办列表数据
onMounted(() => {
  getTodoList()
})

// 获取待办列表
const getTodoList = async () => {
  try {
    const params: Record<string, any> = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.title) params.title = searchForm.title
    if (searchForm.status) params.status = searchForm.status
    if (searchForm.priority) params.priority = searchForm.priority
    
    const res = await request.get('/todos', params)
    if (res.code === 200 && res.data) {
      todoList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取待办列表失败:', error)
  }
}

// 处理选择变化
const handleSelectionChange = (selection: TodoItem[]) => {
  selectedTodos.value = selection
}

// 搜索待办
const handleSearch = () => {
  pagination.currentPage = 1
  getTodoList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    title: '',
    status: '',
    priority: ''
  })
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  getTodoList()
}

// 当前页码变化
const handleCurrentChange = (current: number) => {
  pagination.currentPage = current
  getTodoList()
}

// 查看待办详情
const viewTodoDetail = async (id: number) => {
  try {
    const res = await request.get(`/todos/${id}`)
    if (res.code === 200 && res.data) {
      ElMessage.success('获取详情成功')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取详情失败')
  }
}

// 更新待办状态
const updateTodoStatus = async (id: number, status: string) => {
  try {
    await request.put(`/todos/${id}/status`, { status })
    ElMessage.success('更新待办状态成功')
    getTodoList()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '更新状态失败')
  }
}

// 打开新增待办对话框
const openAddTodoDialog = () => {
  // 重置表单
  Object.assign(todoForm, {
    id: 0,
    title: '',
    description: '',
    priority: '中',
    dueDate: '',
    status: '未完成',
    assignee: ''
  })
  addTodoDialogVisible.value = true
}

// 打开编辑待办对话框
const openEditTodoDialog = (todo: TodoItem) => {
  // 填充表单数据
  Object.assign(todoForm, todo)
  editTodoDialogVisible.value = true
}

// 新增待办
const addTodo = async () => {
  if (todoFormRef.value) {
    todoFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          await request.post('/todos', {
            title: todoForm.title,
            description: todoForm.description,
            priority: todoForm.priority,
            dueDate: todoForm.dueDate,
            status: todoForm.status,
            assignee: todoForm.assignee
          })
          ElMessage.success('新增待办成功')
          addTodoDialogVisible.value = false
          getTodoList()
        } catch (error: any) {
          ElMessage.error(error.response?.data?.message || '新增待办失败')
        }
      }
    })
  }
}

// 编辑待办
const editTodo = async () => {
  if (todoFormRef.value) {
    todoFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          await request.put(`/todos/${todoForm.id}`, {
            title: todoForm.title,
            description: todoForm.description,
            priority: todoForm.priority,
            dueDate: todoForm.dueDate,
            status: todoForm.status,
            assignee: todoForm.assignee
          })
          ElMessage.success('编辑待办成功')
          editTodoDialogVisible.value = false
          getTodoList()
        } catch (error: any) {
          ElMessage.error(error.response?.data?.message || '编辑待办失败')
        }
      }
    })
  }
}

// 删除待办
const deleteTodo = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个待办吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    await request.delete(`/todos/${id}`)
    ElMessage.success('删除待办成功')
    getTodoList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除待办失败')
    }
  }
}
</script>

<style scoped>
.todo-container {
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