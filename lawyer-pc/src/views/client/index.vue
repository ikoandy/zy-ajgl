<template>
  <div class="client-container">
    <div class="page-header">
      <h1 class="page-title">客户管理</h1>
      <el-button type="primary" @click="openAddClientDialog">
        <i class="el-icon-plus"></i>
        新增客户
      </el-button>
    </div>
    
    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :model="searchForm" class="search-form" layout="inline">
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入客户名称"
            clearable
            style="width: 200px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="客户类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择客户类型"
            clearable
            style="width: 150px;"
          >
            <el-option label="个人" value="个人"></el-option>
            <el-option label="企业" value="企业"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入联系电话"
            clearable
            style="width: 200px;"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 客户列表 -->
    <el-card class="table-card">
      <el-table
        :data="clientList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="客户ID" width="80"></el-table-column>
        <el-table-column prop="name" label="客户名称" min-width="150"></el-table-column>
        <el-table-column prop="type" label="客户类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === '个人' ? 'success' : 'info'">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="viewClientDetail(scope.row.id)"
                plain
              >
                <i class="el-icon-view"></i>
                详情
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="openEditClientDialog(scope.row)"
                plain
              >
                <i class="el-icon-edit"></i>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteClient(scope.row.id)"
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
    
    <!-- 新增客户对话框 -->
    <el-dialog
      v-model="addClientDialogVisible"
      title="新增客户"
      width="500px"
    >
      <el-form :model="clientForm" :rules="clientRules" ref="clientFormRef" label-width="100px">
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="clientForm.name" placeholder="请输入客户名称"></el-input>
        </el-form-item>
        <el-form-item label="客户类型" prop="type">
          <el-select v-model="clientForm.type" placeholder="请选择客户类型">
            <el-option label="个人" value="个人"></el-option>
            <el-option label="企业" value="企业"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="clientForm.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="clientForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="clientForm.address" type="textarea" rows="3" placeholder="请输入地址"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addClientDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addClient">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑客户对话框 -->
    <el-dialog
      v-model="editClientDialogVisible"
      title="编辑客户"
      width="500px"
    >
      <el-form :model="clientForm" :rules="clientRules" ref="clientFormRef" label-width="100px">
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="clientForm.name" placeholder="请输入客户名称"></el-input>
        </el-form-item>
        <el-form-item label="客户类型" prop="type">
          <el-select v-model="clientForm.type" placeholder="请选择客户类型">
            <el-option label="个人" value="个人"></el-option>
            <el-option label="企业" value="企业"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="clientForm.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="clientForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="clientForm.address" type="textarea" rows="3" placeholder="请输入地址"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editClientDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editClient">确定</el-button>
        </span>
      </template>
    </el-dialog>
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
  name: '',
  type: '',
  phone: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 定义客户类型
interface ClientItem {
  id: number;
  name: string;
  type: string;
  phone: string;
  email: string;
  address: string;
  createTime: string;
  updateTime: string;
}

// 选中的客户
const selectedClients = ref<ClientItem[]>([])

// 客户列表数据
const clientList = ref<ClientItem[]>([])

// 客户表单
const clientForm = reactive({
  id: 0,
  name: '',
  type: '',
  phone: '',
  email: '',
  address: '',
  createTime: '',
  updateTime: ''
})

// 表单引用
const clientFormRef = ref()

// 对话框控制
const addClientDialogVisible = ref(false)
const editClientDialogVisible = ref(false)

// 表单验证规则
const clientRules = {
  name: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '客户名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择客户类型', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ]
}

// 生命周期钩子，用于获取客户列表数据
onMounted(() => {
  getClientList()
})

// 获取客户列表
const getClientList = async () => {
  try {
    const params: Record<string, any> = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.type) params.type = searchForm.type
    if (searchForm.phone) params.phone = searchForm.phone
    
    const res = await request.get('/clients', params)
    if (res.code === 200 && res.data) {
      clientList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取客户列表失败:', error)
  }
}

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedClients.value = selection
}

// 搜索客户
const handleSearch = () => {
  pagination.currentPage = 1
  getClientList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    phone: ''
  })
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  getClientList()
}

// 当前页码变化
const handleCurrentChange = (current: number) => {
  pagination.currentPage = current
  getClientList()
}

// 查看客户详情
const viewClientDetail = (id: number) => {
  router.push(`/client/${id}`)
}

// 打开新增客户对话框
const openAddClientDialog = () => {
  // 重置表单
  Object.assign(clientForm, {
    id: 0,
    name: '',
    type: '',
    phone: '',
    email: '',
    address: ''
  })
  addClientDialogVisible.value = true
}

// 打开编辑客户对话框
const openEditClientDialog = (client: any) => {
  // 填充表单数据
  Object.assign(clientForm, client)
  editClientDialogVisible.value = true
}

// 新增客户
const addClient = async () => {
  if (clientFormRef.value) {
    clientFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          await request.post('/clients', {
            name: clientForm.name,
            type: clientForm.type,
            phone: clientForm.phone,
            email: clientForm.email,
            address: clientForm.address
          })
          ElMessage.success('新增客户成功')
          addClientDialogVisible.value = false
          getClientList()
        } catch (error: any) {
          ElMessage.error(error.response?.data?.message || '新增客户失败')
        }
      }
    })
  }
}

// 编辑客户
const editClient = async () => {
  if (clientFormRef.value) {
    clientFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          await request.put(`/clients/${clientForm.id}`, {
            name: clientForm.name,
            type: clientForm.type,
            phone: clientForm.phone,
            email: clientForm.email,
            address: clientForm.address
          })
          ElMessage.success('编辑客户成功')
          editClientDialogVisible.value = false
          getClientList()
        } catch (error: any) {
          ElMessage.error(error.response?.data?.message || '编辑客户失败')
        }
      }
    })
  }
}

// 删除客户
const deleteClient = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个客户吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    await request.delete(`/clients/${id}`)
    ElMessage.success('删除客户成功')
    getClientList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除客户失败')
    }
  }
}
</script>

<style scoped>
.client-container {
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