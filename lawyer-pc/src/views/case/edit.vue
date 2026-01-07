<template>
  <div class="case-edit-container">
    <div class="page-header">
      <el-button type="primary" @click="goBack">
        <i class="el-icon-arrow-left"></i>
        返回
      </el-button>
      <h1 class="page-title">编辑案件</h1>
    </div>
    
    <el-card class="edit-card">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-position="top"
        label-width="100px"
        size="default"
      >
        <!-- 基本信息 -->
        <h3 class="form-section">基本信息</h3>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="案件编号" prop="caseNumber">
              <el-input v-model="ruleForm.caseNumber" placeholder="请输入案件编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="案件状态" prop="status">
              <el-select v-model="ruleForm.status" placeholder="请选择案件状态">
                <el-option label="已立案" value="已立案" />
                <el-option label="进行中" value="进行中" />
                <el-option label="已结案" value="已结案" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="案件名称" prop="title">
              <el-input v-model="ruleForm.title" placeholder="请输入案件名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="client">
              <el-input v-model="ruleForm.client" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="案件类型" prop="type">
              <el-select v-model="ruleForm.type" placeholder="请选择案件类型">
                <el-option label="民事诉讼" value="民事诉讼" />
                <el-option label="刑事诉讼" value="刑事诉讼" />
                <el-option label="行政诉讼" value="行政诉讼" />
                <el-option label="非诉业务" value="非诉业务" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责律师" prop="lawyer">
              <el-input v-model="ruleForm.lawyer" placeholder="请输入负责律师" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="24">
            <el-form-item label="案件描述" prop="description">
              <el-input
                v-model="ruleForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入案件描述"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const ruleFormRef = ref<FormInstance>()

// 表单数据
const ruleForm = reactive({
  id: 0,
  caseNumber: '',
  title: '',
  client: '',
  status: '已立案',
  type: '',
  lawyer: '',
  description: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  title: [{ required: true, message: '请输入案件名称', trigger: 'blur' }],
  client: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择案件状态', trigger: 'change' }],
  type: [{ required: true, message: '请选择案件类型', trigger: 'change' }]
})

// 获取案件详情
const getCaseDetail = async (id: number) => {
  try {
    const res = await request.get(`/cases/${id}`)
    if (res.code === 200 && res.data) {
      Object.assign(ruleForm, res.data)
    }
  } catch (error) {
    console.error('获取案件详情失败:', error)
    ElMessage.error('获取案件详情失败')
  }
}

// 生命周期钩子，用于获取案件详情数据
onMounted(() => {
  const id = route.params.id as string
  if (id) {
    getCaseDetail(parseInt(id))
  }
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 提交表单
const submitForm = async () => {
  if (!ruleFormRef.value) return
  try {
    await ruleFormRef.value.validate()
    // 调用API更新案件
    await request.put(`/cases/${ruleForm.id}`, {
      caseNumber: ruleForm.caseNumber,
      title: ruleForm.title,
      client: ruleForm.client,
      status: ruleForm.status,
      type: ruleForm.type,
      lawyer: ruleForm.lawyer,
      description: ruleForm.description
    })
    ElMessage.success('案件更新成功')
    // 返回案件详情页
    router.push(`/case/${ruleForm.id}`)
  } catch (error) {
    console.error('案件更新失败:', error)
    ElMessage.error('案件更新失败')
  }
}
</script>

<style scoped>
.case-edit-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  color: #1a365d;
  font-size: 24px;
  font-weight: 600;
}

.edit-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.form-section {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a365d;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 20px;
}
</style>