<template>
  <div class="user-management">
    <h2 class="page-title">用户管理</h2>
    
    <el-card shadow="hover" class="content-card">
      <!-- 搜索与操作区 -->
      <div class="search-operation-area">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form :inline="true" :model="searchForm" class="search-form">
              <el-form-item label="用户名">
                <el-input v-model="searchForm.username" placeholder="请输入用户名"></el-input>
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="searchForm.phone" placeholder="请输入手机号"></el-input>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="请选择状态">
                  <el-option label="启用" value="1"></el-option>
                  <el-option label="禁用" value="0"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="8" class="text-right">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon> 新增用户
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 数据表格 -->
      <el-table :data="userList" style="width: 100%" border>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="phone" label="手机号"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role" label="角色">
          <template #default="scope">
            <el-tag>{{ scope.row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-switch 
              v-model="scope.row.status" 
              active-value="1" 
              inactive-value="0"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon> 编辑
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
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!dialogData.id">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="管理员"></el-option>
            <el-option label="律师" value="律师"></el-option>
            <el-option label="客户" value="客户"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option label="启用" value="1"></el-option>
            <el-option label="禁用" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  username: '',
  phone: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 用户列表
const userList = ref([
  {
    id: 1,
    username: 'admin',
    phone: '13800138000',
    email: 'admin@example.com',
    role: '管理员',
    status: '1',
    createTime: '2025-12-31 00:00:00'
  },
  {
    id: 2,
    username: 'lawyer001',
    phone: '13800138001',
    email: 'lawyer001@example.com',
    role: '律师',
    status: '1',
    createTime: '2025-12-31 00:00:00'
  },
  {
    id: 3,
    username: 'client001',
    phone: '13800138002',
    email: 'client001@example.com',
    role: '客户',
    status: '1',
    createTime: '2025-12-31 00:00:00'
  }
])

// 对话框配置
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const dialogData = reactive({ id: '' })

// 表单配置
const userFormRef = ref()
const userForm = reactive({
  username: '',
  password: '',
  phone: '',
  email: '',
  role: '',
  status: '1'
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 搜索
const handleSearch = () => {
  // 模拟搜索
  ElMessage.info('搜索功能待实现')
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.phone = ''
  searchForm.status = ''
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  dialogData.id = ''
  // 重置表单
  userForm.username = ''
  userForm.password = ''
  userForm.phone = ''
  userForm.email = ''
  userForm.role = ''
  userForm.status = '1'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑用户'
  dialogData.id = row.id
  // 填充表单数据
  userForm.username = row.username
  userForm.phone = row.phone
  userForm.email = row.email
  userForm.role = row.role
  userForm.status = row.status
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从列表中删除用户
    const index = userList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      userList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 状态变更
const handleStatusChange = (row: any) => {
  // 模拟状态变更
  ElMessage.info(`用户 ${row.username} 状态已变更为 ${row.status === '1' ? '启用' : '禁用'}`)
}

// 对话框确认
const handleDialogConfirm = async () => {
  if (!userFormRef.value) return
  try {
    const valid = await userFormRef.value.validate()
    if (valid) {
      // 模拟提交
      setTimeout(() => {
        if (!dialogData.id) {
          // 新增用户
          const maxId = userList.value.length > 0 ? Math.max(...userList.value.map(item => item.id)) : 0
          const newUser = {
            id: maxId + 1,
            username: userForm.username,
            phone: userForm.phone,
            email: userForm.email,
            role: userForm.role,
            status: userForm.status,
            createTime: new Date().toLocaleString('zh-CN')
          }
          userList.value.unshift(newUser)
        } else {
          // 编辑用户
          const index = userList.value.findIndex(item => item.id === parseInt(dialogData.id))
          if (index !== -1 && userList.value[index]) {
            const originalUser = userList.value[index]
            userList.value[index] = {
              ...originalUser,
              username: userForm.username,
              phone: userForm.phone,
              email: userForm.email,
              role: userForm.role,
              status: userForm.status
            }
          }
        }
        
        ElMessage.success(dialogData.id ? '编辑成功' : '新增成功')
        dialogVisible.value = false
      }, 1000)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
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
</script>

<style scoped>
.user-management {
  padding: 0;
}

.search-operation-area {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
