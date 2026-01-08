<template>
  <el-dialog v-bind:model-value="visible" v-on:update:model-value="$emit('update:visible', $event)" title="更新头像" width="500px">
    <div class="avatar-uploader-container">
      <el-upload
        class="avatar-uploader"
        action="#"
        :show-file-list="false"
        :http-request="handleAvatarUpload"
        :before-upload="beforeAvatarUpload"
        accept="image/jpeg,image/png,image/gif"
      >
        <div class="avatar-preview">
          <img v-if="previewAvatar" :src="previewAvatar" class="avatar" />
          <div v-else class="avatar-placeholder">
            <span class="placeholder-text">点击上传头像</span>
          </div>
        </div>
      </el-upload>
      <div class="upload-hint">支持 JPG、PNG、GIF 格式，大小不超过 2MB</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading" :disabled="!selectedFile">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialAvatar: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'submit'])

// 预览头像
const previewAvatar = ref(props.initialAvatar)
// 保存选中的文件对象
const selectedFile = ref<File | null>(null)

// 监听初始头像变化
watch(
  () => props.initialAvatar,
  (newVal) => {
    previewAvatar.value = newVal
  }
)

// 监听对话框关闭，重置状态
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      // 对话框关闭时重置
      selectedFile.value = null
    }
  }
)

// 头像上传前验证
const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isGIF = file.type === 'image/gif'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG && !isGIF) {
    ElMessage.error('只支持 JPG、PNG、GIF 格式的图片')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

// 头像上传处理
const handleAvatarUpload = async (uploadFile: any) => {
  try {
    // 保存文件对象
    selectedFile.value = uploadFile.file
    
    // 读取文件预览
    const reader = new FileReader()
    reader.onload = (e) => {
      previewAvatar.value = e.target?.result as string
    }
    reader.readAsDataURL(uploadFile.file)
  } catch (error) {
    console.error('头像预览失败:', error)
    ElMessage.error('头像预览失败')
    selectedFile.value = null
  }
}

// 提交表单
const submitForm = () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择头像文件')
    return
  }
  emit('submit', selectedFile.value)
}
</script>

<style scoped>
.avatar-uploader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
}

.avatar-uploader:hover {
  border-color: var(--primary-color);
  background-color: #f0f9ff;
}

/* 头像预览容器 */
.avatar-preview {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.avatar {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

/* 头像占位符 */
.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  color: #909399;
  font-size: 14px;
  border-radius: 4px;
}

.placeholder-text {
  text-align: center;
  padding: 20px;
  line-height: 1.5;
}

.upload-hint {
  margin-top: 16px;
  font-size: 14px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>