<template>
  <div class="lawyer-management">
    <h2 class="page-title">律师管理</h2>
    <el-card shadow="hover" class="content-card">
      <!-- 搜索区域 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="律师姓名">
            <el-input v-model="searchForm.name" placeholder="请输入律师姓名" clearable style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="律师事务所">
            <el-input v-model="searchForm.firm" placeholder="请输入律师事务所" clearable style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="律师状态">
            <el-select v-model="searchForm.status" placeholder="请选择律师状态" clearable style="width: 150px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="在职" value="active"></el-option>
              <el-option label="离职" value="inactive"></el-option>
              <el-option label="休假" value="vacation"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="专业领域">
            <el-select v-model="searchForm.specialty" placeholder="请选择专业领域" clearable style="width: 150px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="民事诉讼" value="civil"></el-option>
              <el-option label="刑事诉讼" value="criminal"></el-option>
              <el-option label="知识产权" value="intellectual"></el-option>
              <el-option label="企业法务" value="corporate"></el-option>
              <el-option label="婚姻家庭" value="family"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="search-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon-plus></el-icon-plus> 新增律师
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedLawyerIds.length === 0">
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
          :data="lawyerList"
          @selection-change="handleSelectionChange"
          style="width: 100%"
          stripe
          border
        >
          <el-table-column type="selection" width="55" fixed="left"></el-table-column>
          <el-table-column prop="id" label="律师ID" width="100" fixed="left"></el-table-column>
          <el-table-column prop="name" label="律师姓名" width="120"></el-table-column>
          <el-table-column prop="gender" label="性别" width="80">
            <template #default="scope">
              {{ scope.row.gender === 'male' ? '男' : scope.row.gender === 'female' ? '女' : '未知' }}
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" width="80"></el-table-column>
          <el-table-column prop="phone" label="联系电话" width="150"></el-table-column>
          <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
          <el-table-column prop="firm" label="律师事务所" width="180"></el-table-column>
          <el-table-column prop="specialty" label="专业领域" width="150">
            <template #default="scope">
              {{ getSpecialtyLabel(scope.row.specialty) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="律师状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="experience" label="执业年限" width="100"></el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" sortable></el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="180" sortable></el-table-column>
          <el-table-column label="操作" width="320" fixed="right">
            <template #default="scope">
              <div class="table-actions">
                <el-button type="primary" size="small" @click="handleDetail(scope.row)">
                  <el-icon><InfoFilled /></el-icon> 详情
                </el-button>
                <el-button type="success" size="small" @click="handleEdit(scope.row)">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button type="warning" size="small" @click="handleChangeStatus(scope.row)">
                  <el-icon><SwitchButton /></el-icon> {{ getStatusChangeText(scope.row.status) }}
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

    <!-- 新增/编辑律师对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增律师' : '编辑律师'"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="lawyerFormRef"
        :model="lawyerForm"
        :rules="lawyerRules"
        label-width="120px"
        class="lawyer-form"
      >
        <el-form-item label="律师姓名" prop="name">
          <el-input v-model="lawyerForm.name" placeholder="请输入律师姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="lawyerForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="unknown">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="lawyerForm.age" :min="22" :max="70" placeholder="请输入年龄"></el-input-number>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="lawyerForm.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="lawyerForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="律师事务所" prop="firm">
          <el-input v-model="lawyerForm.firm" placeholder="请输入律师事务所"></el-input>
        </el-form-item>
        <el-form-item label="专业领域" prop="specialty">
          <el-select v-model="lawyerForm.specialty" placeholder="请选择专业领域">
            <el-option label="民事诉讼" value="civil"></el-option>
            <el-option label="刑事诉讼" value="criminal"></el-option>
            <el-option label="知识产权" value="intellectual"></el-option>
            <el-option label="企业法务" value="corporate"></el-option>
            <el-option label="婚姻家庭" value="family"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执业年限" prop="experience">
          <el-input-number v-model="lawyerForm.experience" :min="0" :max="40" placeholder="请输入执业年限"></el-input-number>
        </el-form-item>
        <el-form-item label="律师状态" prop="status">
          <el-select v-model="lawyerForm.status" placeholder="请选择律师状态">
            <el-option label="在职" value="active"></el-option>
            <el-option label="离职" value="inactive"></el-option>
            <el-option label="休假" value="vacation"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执业证号" prop="licenseNumber">
          <el-input v-model="lawyerForm.licenseNumber" placeholder="请输入执业证号"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="lawyerForm.remark" placeholder="请输入备注" type="textarea" :rows="4"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 律师详情对话框 -->
    <el-dialog v-model="detailVisible" title="律师详情" width="800px" @close="handleDetailClose">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="律师ID">{{ currentLawyer.id }}</el-descriptions-item>
        <el-descriptions-item label="律师姓名">{{ currentLawyer.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentLawyer.gender === 'male' ? '男' : currentLawyer.gender === 'female' ? '女' : '未知' }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ currentLawyer.age }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentLawyer.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentLawyer.email }}</el-descriptions-item>
        <el-descriptions-item label="律师事务所">{{ currentLawyer.firm }}</el-descriptions-item>
        <el-descriptions-item label="专业领域">{{ getSpecialtyLabel(currentLawyer.specialty) }}</el-descriptions-item>
        <el-descriptions-item label="律师状态">
          <el-tag :type="getStatusTagType(currentLawyer.status)">
            {{ getStatusLabel(currentLawyer.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执业年限">{{ currentLawyer.experience }}年</el-descriptions-item>
        <el-descriptions-item label="执业证号">{{ currentLawyer.licenseNumber }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentLawyer.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentLawyer.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentLawyer.remark || '-' }}</el-descriptions-item>
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
  firm: '',
  status: '',
  specialty: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 律师列表
const lawyerList = ref<any[]>([])
const loading = ref(false)

// 选中的律师ID
const selectedLawyerIds = ref<string[]>([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const lawyerFormRef = ref()
const lawyerForm = reactive({
  id: '',
  name: '',
  gender: 'male',
  age: 25,
  phone: '',
  email: '',
  firm: '',
  specialty: 'civil',
  status: 'active',
  experience: 0,
  licenseNumber: '',
  remark: ''
})

// 表单验证规则
const lawyerRules = reactive({
  name: [
    { required: true, message: '请输入律师姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '律师姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  firm: [
    { required: true, message: '请输入律师事务所', trigger: 'blur' }
  ],
  specialty: [
    { required: true, message: '请选择专业领域', trigger: 'change' }
  ],
  licenseNumber: [
    { required: true, message: '请输入执业证号', trigger: 'blur' }
  ]
})

// 详情对话框
const detailVisible = ref(false)
const currentLawyer = reactive({
  id: '',
  name: '',
  gender: 'male',
  age: 0,
  phone: '',
  email: '',
  firm: '',
  specialty: 'civil',
  status: 'active',
  experience: 0,
  licenseNumber: '',
  createTime: '',
  updateTime: '',
  remark: ''
})

// 获取律师列表
const getLawyerList = () => {
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    lawyerList.value = [
      {
        id: '1',
        name: '张明',
        gender: 'male',
        age: 35,
        phone: '13800138001',
        email: 'zhangming@example.com',
        firm: '正义律师事务所',
        specialty: 'civil',
        status: 'active',
        experience: 10,
        licenseNumber: '11012014101010101',
        createTime: '2024-01-01 09:00:00',
        updateTime: '2024-01-01 09:00:00',
        remark: '高级合伙人'
      },
      {
        id: '2',
        name: '李娜',
        gender: 'female',
        age: 32,
        phone: '13900139001',
        email: 'lina@example.com',
        firm: '光明律师事务所',
        specialty: 'family',
        status: 'vacation',
        experience: 8,
        licenseNumber: '11012016111111111',
        createTime: '2024-01-02 10:30:00',
        updateTime: '2024-01-15 14:20:00',
        remark: '婚姻家庭专家'
      },
      {
        id: '3',
        name: '王强',
        gender: 'male',
        age: 40,
        phone: '13700137001',
        email: 'wangqiang@example.com',
        firm: '诚信律师事务所',
        specialty: 'criminal',
        status: 'active',
        experience: 15,
        licenseNumber: '11012010121212121',
        createTime: '2024-01-03 14:00:00',
        updateTime: '2024-01-03 14:00:00',
        remark: '刑事辩护专家'
      },
      {
        id: '4',
        name: '赵敏',
        gender: 'female',
        age: 28,
        phone: '13600136001',
        email: 'zhaomin@example.com',
        firm: '智慧律师事务所',
        specialty: 'intellectual',
        status: 'inactive',
        experience: 3,
        licenseNumber: '11012021131313131',
        createTime: '2024-01-04 16:30:00',
        updateTime: '2024-02-01 10:15:00',
        remark: '知识产权律师'
      }
    ]
    pagination.total = lawyerList.value.length
    loading.value = false
  }, 500)
}

// 获取专业领域标签文本
const getSpecialtyLabel = (specialty: string) => {
  const specialtyMap: Record<string, string> = {
    civil: '民事诉讼',
    criminal: '刑事诉讼',
    intellectual: '知识产权',
    corporate: '企业法务',
    family: '婚姻家庭'
  }
  return specialtyMap[specialty] || specialty
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'danger'
    case 'vacation':
      return 'warning'
    default:
      return ''
  }
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return '在职'
    case 'inactive':
      return '离职'
    case 'vacation':
      return '休假'
    default:
      return status
  }
}

// 获取状态变更文本
const getStatusChangeText = (status: string) => {
  switch (status) {
    case 'active':
      return '离职'
    case 'inactive':
      return '复职'
    case 'vacation':
      return '复工'
    default:
      return '变更状态'
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  getLawyerList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    firm: '',
    status: '',
    specialty: ''
  })
  pagination.currentPage = 1
  getLawyerList()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedLawyerIds.value = selection.map(item => item.id)
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  // 重置表单
  Object.assign(lawyerForm, {
    id: '',
    name: '',
    gender: 'male',
    age: 25,
    phone: '',
    email: '',
    firm: '',
    specialty: 'civil',
    status: 'active',
    experience: 0,
    licenseNumber: '',
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  // 填充表单
  Object.assign(lawyerForm, row)
  dialogVisible.value = true
}

// 详情
const handleDetail = (row: any) => {
  Object.assign(currentLawyer, row)
  detailVisible.value = true
}

// 变更状态
const handleChangeStatus = (row: any) => {
  let newStatus = 'active'
  let actionText = ''
  
  switch (row.status) {
    case 'active':
      newStatus = 'inactive'
      actionText = '离职'
      break
    case 'inactive':
      newStatus = 'active'
      actionText = '复职'
      break
    case 'vacation':
      newStatus = 'active'
      actionText = '复工'
      break
    default:
      newStatus = 'active'
      actionText = '激活'
  }
  
  ElMessageBox.confirm(`确定要将该律师${actionText}吗？`, '提示', {
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
  ElMessageBox.confirm('确定要删除该律师吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 模拟删除
    setTimeout(() => {
      lawyerList.value = lawyerList.value.filter(item => item.id !== row.id)
      pagination.total = lawyerList.value.length
      ElMessage.success('删除成功')
    }, 500)
  }).catch(() => {
    // 取消操作
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的${selectedLawyerIds.value.length}个律师吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 模拟删除
    setTimeout(() => {
      lawyerList.value = lawyerList.value.filter(item => !selectedLawyerIds.value.includes(item.id))
      pagination.total = lawyerList.value.length
      selectedLawyerIds.value = []
      ElMessage.success('批量删除成功')
    }, 500)
  }).catch(() => {
    // 取消操作
  })
}

// 批量导出
const handleBatchExport = () => {
  if (selectedLawyerIds.value.length === 0) {
    ElMessage.warning('请先选择要导出的律师')
    return
  }
  // 模拟导出数据
  setTimeout(() => {
    ElMessage.success(`成功导出 ${selectedLawyerIds.value.length} 个律师数据`)
  }, 800)
}

// 提交表单
const handleSubmit = () => {
  lawyerFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 模拟提交
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 新增
          const newLawyer = {
            ...lawyerForm,
            id: Date.now().toString(),
            createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
            updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
          lawyerList.value.unshift(newLawyer)
          pagination.total = lawyerList.value.length
          ElMessage.success('新增律师成功')
        } else {
          // 编辑
          const index = lawyerList.value.findIndex(item => item.id === lawyerForm.id)
          if (index !== -1) {
            lawyerList.value[index] = {
              ...lawyerList.value[index],
              ...lawyerForm,
              updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }
            ElMessage.success('编辑律师成功')
          }
        }
        dialogVisible.value = false
      }, 500)
    }
  })
}

// 关闭对话框
const handleDialogClose = () => {
  lawyerFormRef.value.resetFields()
}

// 关闭详情对话框
const handleDetailClose = () => {
  // 重置详情数据
  Object.assign(currentLawyer, {
    id: '',
    name: '',
    gender: 'male',
    age: 0,
    phone: '',
    email: '',
    firm: '',
    specialty: 'civil',
    status: 'active',
    experience: 0,
    licenseNumber: '',
    createTime: '',
    updateTime: '',
    remark: ''
  })
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  getLawyerList()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  getLawyerList()
}

// 初始化
onMounted(() => {
  getLawyerList()
})
</script>

<style scoped>
.lawyer-management {
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

.lawyer-form {
  margin-top: 20px;
}
</style>
