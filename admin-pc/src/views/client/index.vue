<template>
  <div class="client-management">
    <h2 class="page-title">客户管理</h2>
    <el-card shadow="hover" class="content-card">
      <!-- 搜索区域 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="客户名称">
            <el-input v-model="searchForm.name" placeholder="请输入客户名称" clearable style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="searchForm.phone" placeholder="请输入联系电话" clearable style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="客户状态">
            <el-select v-model="searchForm.status" placeholder="请选择客户状态" clearable style="width: 150px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="活跃" value="active"></el-option>
              <el-option label="冻结" value="frozen"></el-option>
              <el-option label="流失" value="lost"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="search-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon-plus></el-icon-plus> 新增客户
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedClientIds.length === 0">
            <el-icon-delete></el-icon-delete> 批量删除
          </el-button>
          <el-button @click="handleBatchExport">
            <el-icon-download></el-icon-download> 导出数据
          </el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="clientList"
          @selection-change="handleSelectionChange"
          style="width: 100%"
          stripe
          border
        >
          <el-table-column type="selection" width="55" fixed="left"></el-table-column>
          <el-table-column prop="id" label="客户ID" width="100" fixed="left"></el-table-column>
          <el-table-column prop="name" label="客户名称" width="150"></el-table-column>
          <el-table-column prop="gender" label="性别" width="80">
            <template #default="scope">
              {{ scope.row.gender === 'male' ? '男' : scope.row.gender === 'female' ? '女' : '未知' }}
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" width="80"></el-table-column>
          <el-table-column prop="phone" label="联系电话" width="150"></el-table-column>
          <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
          <el-table-column prop="address" label="地址" width="250"></el-table-column>
          <el-table-column prop="status" label="客户状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" sortable></el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="180" sortable></el-table-column>
          <el-table-column label="操作" width="300" fixed="right">
            <template #default="scope">
              <div class="table-actions">
                <el-button type="primary" size="small" @click="handleDetail(scope.row)">
                  <el-icon><InfoFilled /></el-icon> 详情
                </el-button>
                <el-button type="success" size="small" @click="handleEdit(scope.row)">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button type="warning" size="small" @click="handleChangeStatus(scope.row)">
                  <el-icon><SwitchButton /></el-icon> {{ scope.row.status === 'active' ? '冻结' : '激活' }}
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </div>
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

    <!-- 新增/编辑客户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增客户' : '编辑客户'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="clientFormRef"
        :model="clientForm"
        :rules="clientRules"
        label-width="100px"
        class="client-form"
      >
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="clientForm.name" placeholder="请输入客户名称"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="clientForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="unknown">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="clientForm.age" :min="0" :max="150" placeholder="请输入年龄"></el-input-number>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="clientForm.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="clientForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="clientForm.address" placeholder="请输入地址" type="textarea" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="客户状态" prop="status">
          <el-select v-model="clientForm.status" placeholder="请选择客户状态">
            <el-option label="活跃" value="active"></el-option>
            <el-option label="冻结" value="frozen"></el-option>
            <el-option label="流失" value="lost"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="clientForm.remark" placeholder="请输入备注" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 客户详情对话框 -->
    <el-dialog v-model="detailVisible" title="客户详情" width="800px" @close="handleDetailClose">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="客户ID">{{ currentClient.id }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ currentClient.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentClient.gender === 'male' ? '男' : currentClient.gender === 'female' ? '女' : '未知' }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ currentClient.age }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentClient.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentClient.email }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ currentClient.address }}</el-descriptions-item>
        <el-descriptions-item label="客户状态">
          <el-tag :type="getStatusTagType(currentClient.status)">
            {{ getStatusLabel(currentClient.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentClient.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentClient.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentClient.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled, Edit, SwitchButton, Delete } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  status: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 客户列表
const clientList = ref<any[]>([])
const loading = ref(false)

// 选中的客户ID
const selectedClientIds = ref<string[]>([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const clientFormRef = ref()
const clientForm = reactive({
  id: '',
  name: '',
  gender: 'male',
  age: 0,
  phone: '',
  email: '',
  address: '',
  status: 'active',
  remark: ''
})

// 表单验证规则
const clientRules = reactive({
  name: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '客户名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ]
})

// 详情对话框
const detailVisible = ref(false)
const currentClient = reactive({
  id: '',
  name: '',
  gender: 'male',
  age: 0,
  phone: '',
  email: '',
  address: '',
  status: 'active',
  createTime: '',
  updateTime: '',
  remark: ''
})

// 获取客户列表
const getClientList = () => {
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    clientList.value = [
      {
        id: '1',
        name: '张三',
        gender: 'male',
        age: 28,
        phone: '13800138000',
        email: 'zhangsan@example.com',
        address: '北京市朝阳区',
        status: 'active',
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00',
        remark: '测试客户'
      },
      {
        id: '2',
        name: '李四',
        gender: 'female',
        age: 32,
        phone: '13900139000',
        email: 'lisi@example.com',
        address: '上海市浦东新区',
        status: 'frozen',
        createTime: '2024-01-02 14:30:00',
        updateTime: '2024-01-03 09:15:00',
        remark: 'VIP客户'
      },
      {
        id: '3',
        name: '王五',
        gender: 'male',
        age: 45,
        phone: '13700137000',
        email: 'wangwu@example.com',
        address: '广州市天河区',
        status: 'lost',
        createTime: '2024-01-04 16:45:00',
        updateTime: '2024-01-05 11:20:00',
        remark: '流失客户'
      }
    ]
    pagination.total = clientList.value.length
    loading.value = false
  }, 500)
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'frozen':
      return 'warning'
    case 'lost':
      return 'danger'
    default:
      return ''
  }
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return '活跃'
    case 'frozen':
      return '冻结'
    case 'lost':
      return '流失'
    default:
      return status
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  getClientList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    phone: '',
    status: ''
  })
  pagination.currentPage = 1
  getClientList()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedClientIds.value = selection.map(item => item.id)
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  // 重置表单
  Object.assign(clientForm, {
    id: '',
    name: '',
    gender: 'male',
    age: 0,
    phone: '',
    email: '',
    address: '',
    status: 'active',
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  // 填充表单
  Object.assign(clientForm, row)
  dialogVisible.value = true
}

// 详情
const handleDetail = (row: any) => {
  Object.assign(currentClient, row)
  detailVisible.value = true
}

// 变更状态
const handleChangeStatus = (row: any) => {
  const newStatus = row.status === 'active' ? 'frozen' : 'active'
  ElMessageBox.confirm(`确定要${row.status === 'active' ? '冻结' : '激活'}该客户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟更新
    setTimeout(() => {
      row.status = newStatus
      ElMessage.success('操作成功')
    }, 500)
  }).catch(() => {
    // 取消操作
  })
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该客户吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 模拟删除
    setTimeout(() => {
      clientList.value = clientList.value.filter(item => item.id !== row.id)
      pagination.total = clientList.value.length
      ElMessage.success('删除成功')
    }, 500)
  }).catch(() => {
    // 取消操作
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的${selectedClientIds.value.length}个客户吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 模拟删除
    setTimeout(() => {
      clientList.value = clientList.value.filter(item => !selectedClientIds.value.includes(item.id))
      pagination.total = clientList.value.length
      selectedClientIds.value = []
      ElMessage.success('批量删除成功')
    }, 500)
  }).catch(() => {
    // 取消操作
  })
}

// 批量导出
const handleBatchExport = () => {
  if (selectedClientIds.value.length === 0) {
    ElMessage.warning('请先选择要导出的客户')
    return
  }
  // 模拟导出数据
  setTimeout(() => {
    ElMessage.success(`成功导出 ${selectedClientIds.value.length} 个客户数据`)
  }, 800)
}

// 提交表单
const handleSubmit = () => {
  clientFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 模拟提交
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 新增
          const newClient = {
            ...clientForm,
            id: Date.now().toString(),
            createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
            updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
          clientList.value.unshift(newClient)
          pagination.total = clientList.value.length
          ElMessage.success('新增客户成功')
        } else {
          // 编辑
          const index = clientList.value.findIndex(item => item.id === clientForm.id)
          if (index !== -1) {
            clientList.value[index] = {
              ...clientList.value[index],
              ...clientForm,
              updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }
            ElMessage.success('编辑客户成功')
          }
        }
        dialogVisible.value = false
      }, 500)
    }
  })
}

// 关闭对话框
const handleDialogClose = () => {
  clientFormRef.value.resetFields()
}

// 关闭详情对话框
const handleDetailClose = () => {
  // 重置详情数据
  Object.assign(currentClient, {
    id: '',
    name: '',
    gender: 'male',
    age: 0,
    phone: '',
    email: '',
    address: '',
    status: 'active',
    createTime: '',
    updateTime: '',
    remark: ''
  })
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  getClientList()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  getClientList()
}

// 初始化
onMounted(() => {
  getClientList()
})
</script>

<style scoped>
.client-management {
  padding: 0;
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  gap: 16px;
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

.client-form {
  margin-top: 20px;
}

/* 客户状态标签样式 */
.status-active {
  background-color: #f0f9eb;
  color: #67c23a;
  border-color: #b3e19d;
}

.status-freeze {
  background-color: #fdf6ec;
  color: #e6a23c;
  border-color: #f5dab1;
}

.status-lost {
  background-color: #fef0f0;
  color: #f56c6c;
  border-color: #fbc4c4;
}
</style>
