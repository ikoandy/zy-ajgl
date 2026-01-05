<template>
  <div class="role-management">
    <h2 class="page-title">角色管理</h2>
    
    <el-card shadow="hover" class="content-card">
      <!-- 搜索与操作区 -->
      <div class="search-operation-area">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form :inline="true" :model="searchForm" class="search-form">
              <el-form-item label="角色名称">
                <el-input v-model="searchForm.roleName" placeholder="请输入角色名称"></el-input>
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
              <el-icon><Plus /></el-icon> 新增角色
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 数据表格 -->
      <el-table :data="roleList" style="width: 100%" border>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleCode" label="角色编码"></el-table-column>
        <el-table-column prop="description" label="角色描述"></el-table-column>
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
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button type="success" size="small" @click="handlePermission(scope.row)">
                <el-icon><Key /></el-icon> 权限设置
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
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="roleForm.roleCode" placeholder="请输入角色编码"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" placeholder="请输入角色描述"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="roleForm.status" placeholder="请选择状态">
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

    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限设置"
      width="600px"
    >
      <div class="permission-setting-area">
        <h3>{{ currentRole?.roleName }} - 权限设置</h3>
        <el-tree
          ref="permissionTreeRef"
          :data="permissionList"
          :props="permissionTreeProps"
          node-key="id"
          show-checkbox
          check-strictly
          class="permission-tree"
          :default-checked-keys="checkedPermissionIds"
        >
          <template #default="{ data }">
            <div class="permission-node-content">
              <span>{{ data.title }}</span>
            </div>
          </template>
        </el-tree>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePermissionConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Key } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  roleName: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 角色列表
const roleList = ref([
  {
    id: 1,
    roleName: '超级管理员',
    roleCode: 'SUPER_ADMIN',
    description: '拥有系统所有权限',
    status: '1',
    createTime: '2025-12-31 00:00:00'
  },
  {
    id: 2,
    roleName: '管理员',
    roleCode: 'ADMIN',
    description: '拥有系统管理权限',
    status: '1',
    createTime: '2025-12-31 00:00:00'
  },
  {
    id: 3,
    roleName: '律师',
    roleCode: 'LAWYER',
    description: '律师角色，拥有案件管理等权限',
    status: '1',
    createTime: '2025-12-31 00:00:00'
  },
  {
    id: 4,
    roleName: '客户',
    roleCode: 'CLIENT',
    description: '客户角色，拥有案件查询等权限',
    status: '1',
    createTime: '2025-12-31 00:00:00'
  }
])

// 对话框配置
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const dialogData = reactive({ id: '' })

// 表单配置
const roleFormRef = ref()
const roleForm = reactive({
  roleName: '',
  roleCode: '',
  description: '',
  status: '1'
})

// 表单验证规则
const roleRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 权限设置相关
const permissionDialogVisible = ref(false)
const permissionTreeRef = ref()
const currentRole = ref<any>(null)
const permissionList = ref([
  {
    id: 1,
    title: '仪表盘',
    children: [
      { id: 11, title: '查看仪表盘' }
    ]
  },
  {
    id: 2,
    title: '案件管理',
    children: [
      { id: 21, title: '查看案件列表' },
      { id: 22, title: '新增案件' },
      { id: 23, title: '编辑案件' },
      { id: 24, title: '删除案件' },
      { id: 25, title: '归档案件' }
    ]
  },
  {
    id: 3,
    title: '客户管理',
    children: [
      { id: 31, title: '查看客户列表' },
      { id: 32, title: '新增客户' },
      { id: 33, title: '编辑客户' },
      { id: 34, title: '删除客户' }
    ]
  },
  {
    id: 4,
    title: '律师管理',
    children: [
      { id: 41, title: '查看律师列表' },
      { id: 42, title: '新增律师' },
      { id: 43, title: '编辑律师' },
      { id: 44, title: '删除律师' }
    ]
  },
  {
    id: 5,
    title: '统计分析',
    children: [
      { id: 51, title: '查看案件统计' },
      { id: 52, title: '查看财务统计' }
    ]
  },
  {
    id: 6,
    title: '系统管理',
    children: [
      { id: 61, title: '用户管理' },
      { id: 62, title: '角色管理' },
      { id: 63, title: '菜单管理' }
    ]
  },
  {
    id: 7,
    title: '日志管理',
    children: [
      { id: 71, title: '查看登录日志' },
      { id: 72, title: '查看操作日志' }
    ]
  }
])
const checkedPermissionIds = ref<number[]>([])
const permissionTreeProps = {
  children: 'children',
  label: 'title'
}

// 搜索
const handleSearch = () => {
  // 模拟搜索
  ElMessage.info('搜索功能待实现')
}

// 重置
const handleReset = () => {
  searchForm.roleName = ''
  searchForm.status = ''
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增角色'
  dialogData.id = ''
  // 重置表单
  roleForm.roleName = ''
  roleForm.roleCode = ''
  roleForm.description = ''
  roleForm.status = '1'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑角色'
  dialogData.id = row.id
  // 填充表单数据
  roleForm.roleName = row.roleName
  roleForm.roleCode = row.roleCode
  roleForm.description = row.description
  roleForm.status = row.status
  dialogVisible.value = true
}

// 权限设置
const handlePermission = (row: any) => {
  currentRole.value = row
  permissionDialogVisible.value = true
  // 模拟加载角色已有的权限
  setTimeout(() => {
    // 根据角色设置默认选中的权限
    if (row.roleCode === 'SUPER_ADMIN') {
      // 超级管理员拥有所有权限
      checkedPermissionIds.value = [11, 21, 22, 23, 24, 25, 31, 32, 33, 34, 41, 42, 43, 44, 51, 52, 61, 62, 63, 71, 72]
    } else if (row.roleCode === 'ADMIN') {
      // 管理员拥有大部分权限
      checkedPermissionIds.value = [11, 21, 22, 23, 24, 25, 31, 32, 33, 34, 41, 42, 43, 44, 51, 52, 61, 62, 63, 71, 72]
    } else if (row.roleCode === 'LAWYER') {
      // 律师拥有案件相关权限
      checkedPermissionIds.value = [11, 21, 22, 23, 24, 25, 31, 32, 33, 51]
    } else if (row.roleCode === 'CLIENT') {
      // 客户拥有查询权限
      checkedPermissionIds.value = [11, 21, 31]
    } else {
      checkedPermissionIds.value = []
    }
  }, 300)
}

// 权限设置确认
const handlePermissionConfirm = () => {
  // 获取当前选中的权限
  const selectedPermissions = permissionTreeRef.value?.getCheckedKeys() || []
  console.log('Selected permissions:', selectedPermissions)
  // 模拟保存权限
  setTimeout(() => {
    ElMessage.success(`角色 ${currentRole.value.roleName} 权限设置成功`)
    permissionDialogVisible.value = false
  }, 500)
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从列表中删除角色
    const index = roleList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      roleList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 状态变更
const handleStatusChange = (row: any) => {
  // 模拟状态变更
  ElMessage.info(`角色 ${row.roleName} 状态已变更为 ${row.status === '1' ? '启用' : '禁用'}`)
}

// 对话框确认
const handleDialogConfirm = async () => {
  if (!roleFormRef.value) return
  try {
    const valid = await roleFormRef.value.validate()
    if (valid) {
      // 模拟提交
      setTimeout(() => {
        if (!dialogData.id) {
          // 新增角色
          const maxId = roleList.value.length > 0 ? Math.max(...roleList.value.map(item => item.id)) : 0
          const newRole = {
            id: maxId + 1,
            roleName: roleForm.roleName,
            roleCode: roleForm.roleCode,
            description: roleForm.description,
            status: roleForm.status,
            createTime: new Date().toLocaleString('zh-CN')
          }
          roleList.value.unshift(newRole)
        } else {
          // 编辑角色
          const index = roleList.value.findIndex(item => item.id === parseInt(dialogData.id))
          if (index !== -1 && roleList.value[index]) {
            const originalRole = roleList.value[index]
            roleList.value[index] = {
              ...originalRole,
              roleName: roleForm.roleName,
              roleCode: roleForm.roleCode,
              description: roleForm.description,
              status: roleForm.status
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
.role-management {
  padding: 0;
}

.permission-setting-area {
  margin: 20px 0;
}

.permission-setting-area h3 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: bold;
}

.permission-tree {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 10px;
  height: 400px;
  overflow-y: auto;
}

.permission-node-content {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
