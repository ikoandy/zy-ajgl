<template>
  <div class="case-create-container">
    <div class="page-header">
      <h1 class="page-title">新建案件</h1>
      <el-button type="primary" @click="saveCase">
        <i class="el-icon-check"></i>
        保存
      </el-button>
      <el-button @click="cancel">
        <i class="el-icon-close"></i>
        取消
      </el-button>
    </div>
    
    <el-card class="form-card">
      <el-form :model="caseForm" :rules="caseRules" ref="caseFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="案件编号" prop="caseNumber">
              <el-input v-model="caseForm.caseNumber" placeholder="请输入案件编号"></el-input>
            </el-form-item>
            <el-form-item label="案件名称" prop="title">
              <el-input v-model="caseForm.title" placeholder="请输入案件名称"></el-input>
            </el-form-item>
            <el-form-item label="客户名称" prop="client">
              <el-input v-model="caseForm.client" placeholder="请输入客户名称"></el-input>
            </el-form-item>
            <el-form-item label="案件类型" prop="type">
              <el-select v-model="caseForm.type" placeholder="请选择案件类型">
                <el-option label="合同纠纷" value="合同纠纷"></el-option>
                <el-option label="知识产权" value="知识产权"></el-option>
                <el-option label="劳动争议" value="劳动争议"></el-option>
                <el-option label="婚姻家庭" value="婚姻家庭"></el-option>
                <el-option label="房产纠纷" value="房产纠纷"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="案件状态" prop="status">
              <el-select v-model="caseForm.status" placeholder="请选择案件状态">
                <el-option label="进行中" value="进行中"></el-option>
                <el-option label="已立案" value="已立案"></el-option>
                <el-option label="已结案" value="已结案"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="立案时间" prop="filingDate">
              <el-date-picker v-model="caseForm.filingDate" type="date" placeholder="选择立案时间"></el-date-picker>
            </el-form-item>
            <el-form-item label="预计结案时间" prop="expectedEndDate">
              <el-date-picker v-model="caseForm.expectedEndDate" type="date" placeholder="选择预计结案时间"></el-date-picker>
            </el-form-item>
            <el-form-item label="主审法官" prop="judge">
              <el-input v-model="caseForm.judge" placeholder="请输入主审法官"></el-input>
            </el-form-item>
            <el-form-item label="法院名称" prop="court">
              <el-input v-model="caseForm.court" placeholder="请输入法院名称"></el-input>
            </el-form-item>
            <el-form-item label="案件金额" prop="amount">
              <el-input v-model="caseForm.amount" type="number" placeholder="请输入案件金额"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="案件描述" prop="description">
          <el-input v-model="caseForm.description" type="textarea" rows="6" placeholder="请输入案件描述"></el-input>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()

// 案件表单数据
const caseForm = reactive({
  caseNumber: '',
  title: '',
  client: '',
  type: '',
  status: '',
  filingDate: '',
  expectedEndDate: '',
  judge: '',
  court: '',
  amount: 0,
  description: ''
})

// 表单引用
const caseFormRef = ref()

// 表单验证规则
const caseRules = {
  caseNumber: [
    { required: true, message: '请输入案件编号', trigger: 'blur' },
    { min: 5, max: 20, message: '案件编号长度在 5 到 20 个字符', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入案件名称', trigger: 'blur' },
    { min: 2, max: 100, message: '案件名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  client: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '客户名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择案件类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择案件状态', trigger: 'change' }
  ]
}

// 保存案件
const saveCase = async () => {
  if (caseFormRef.value) {
    caseFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          // 直接发送表单数据，与后端期望的格式匹配
          await request.post('/cases', caseForm)
          ElMessage.success('案件创建成功')
          router.push('/case')
        } catch (error: any) {
          ElMessage.error(error.response?.data?.message || '案件创建失败')
        }
      }
    })
  }
}

// 取消操作
const cancel = () => {
  router.push('/case')
}
</script>

<style scoped>
.case-create-container {
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

/* 表单卡片 */
.form-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  padding: 24px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}
</style>