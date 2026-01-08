<template>
  <el-dialog v-bind:model-value="visible" v-on:update:model-value="$emit('update:visible', $event)" title="编辑信息" width="600px">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" style="max-width: 500px;">
      <el-form-item label="姓名" prop="realName">
        <el-input v-model="form.realName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="form.gender" placeholder="请选择性别">
          <el-option label="男" value="男"></el-option>
          <el-option label="女" value="女"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="出生日期" prop="birthDate">
        <el-date-picker v-model="form.birthDate" type="date" placeholder="选择出生日期" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="个人简介" prop="introduction">
        <el-input v-model="form.introduction" type="textarea" :rows="4" placeholder="请输入个人简介" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialForm: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'submit'])

// 表单引用
const formRef = ref()

// 表单数据
const form = reactive({
  realName: '',
  gender: '',
  birthDate: '',
  email: '',
  phone: '',
  introduction: ''
})

// 表单验证规则
const rules = reactive({
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  introduction: [
    { max: 500, message: '个人简介不能超过 500 个字符', trigger: 'blur' }
  ]
})

// 监听visible变化，初始化表单
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // 初始化表单数据
      Object.assign(form, props.initialForm)
    }
  }
)

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...form })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>