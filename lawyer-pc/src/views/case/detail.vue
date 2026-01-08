<template>
  <div class="case-detail-container">
    <div class="page-header">
      <el-button type="primary" @click="goBack">
        <i class="el-icon-arrow-left"></i>
        返回
      </el-button>
      <h1 class="page-title">案件详情</h1>
      <el-button type="primary" @click="editCase">
        <i class="el-icon-edit"></i>
        编辑
      </el-button>
    </div>
    
    <!-- 案件基本信息 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <div class="detail-content">
        <div class="detail-row">
          <div class="detail-item">
            <label>案件编号：</label>
            <span>{{ caseDetail.caseNumber }}</span>
          </div>
          <div class="detail-item">
            <label>案件状态：</label>
            <el-tag :type="getStatusType(caseDetail.status)">{{ caseDetail.status }}</el-tag>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>案件名称：</label>
            <span>{{ caseDetail.title }}</span>
          </div>
          <div class="detail-item">
            <label>客户名称：</label>
            <span>{{ caseDetail.client }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>案件类型：</label>
            <span>{{ caseDetail.type }}</span>
          </div>
          <div class="detail-item">
            <label>负责律师：</label>
            <span>{{ caseDetail.lawyer }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item full-width">
            <label>案件描述：</label>
            <p>{{ caseDetail.description }}</p>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 案件时间线 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>案件进度</span>
          <el-button type="text" size="small" @click="addProgress">添加进度</el-button>
        </div>
      </template>
      <div class="timeline-container">
        <el-timeline>
          <el-timeline-item
            v-for="item in caseDetail.timeline"
            :key="item.id"
            :timestamp="item.time"
          >
            <div class="timeline-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.content }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
    
    <!-- 案件文档 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>案件文档</span>
          <el-button type="text" size="small" @click="uploadDocument">上传文档</el-button>
        </div>
      </template>
      <div class="document-list">
        <el-table :data="caseDetail.documents" stripe style="width: 100%">
          <el-table-column prop="name" label="文档名称" min-width="200"></el-table-column>
          <el-table-column prop="type" label="文档类型" width="100"></el-table-column>
          <el-table-column prop="size" label="文档大小" width="100"></el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="180"></el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="handlePreviewDocument(scope.row)"
                style="margin-right: 5px;"
              >
                预览
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="downloadDocument(scope.row.id)"
                style="margin-right: 5px;"
              >
                下载
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteDocument(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <!-- 添加进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="添加进度"
      width="500px"
      @close="resetProgressForm"
    >
      <el-form
        ref="progressFormRef"
        :model="progressForm"
        :rules="progressRules"
        label-position="top"
      >
        <el-form-item label="进度标题" prop="title">
          <el-input v-model="progressForm.title" placeholder="请输入进度标题" />
        </el-form-item>
        <el-form-item label="进度内容" prop="content">
          <el-input
            v-model="progressForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入进度内容"
          />
        </el-form-item>
        <el-form-item label="进度时间" prop="time">
          <el-date-picker
            v-model="progressForm.time"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="progressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProgress">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 上传文档对话框 -->
    <el-dialog
      v-model="documentDialogVisible"
      title="上传文档"
      width="500px"
      @close="resetDocumentForm"
    >
      <el-form
        ref="documentFormRef"
        :model="documentForm"
        :rules="documentRules"
        label-position="top"
      >
        <el-form-item label="文档名称" prop="name">
          <el-input v-model="documentForm.name" placeholder="请输入文档名称" />
        </el-form-item>
        <el-form-item label="选择文件" prop="file">
          <el-upload
            v-model:file-list="fileList"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传 PDF、Word、Excel、TXT 或图片文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="documentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDocument">上传</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 文档预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="`文档预览 - ${previewDocument.value.name}`"
      width="90%"
      fullscreen
    >
      <div class="preview-container">
        <div v-if="isImageFile" class="image-preview">
          <img :src="previewUrl" alt="文档预览" />
        </div>
        <div v-else-if="isPdfFile" class="pdf-preview">
          <iframe :src="previewUrl" frameborder="0"></iframe>
        </div>
        <div v-else-if="isTextFile" class="text-preview">
          <pre>{{ textContent }}</pre>
        </div>
        <div v-else class="office-preview">
          <el-alert
            title="提示"
            type="warning"
            description="该类型文件不支持在线预览，请下载查看"
            show-icon
          >
            <template #default>
              <el-button type="primary" size="small" @click="downloadDocument(previewDocument.value.id)">
                立即下载
              </el-button>
            </template>
          </el-alert>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

// 案件详情数据
const caseDetail = ref({
  id: 0,
  caseNumber: '',
  title: '',
  client: '',
  status: '',
  type: '',
  lawyer: '',
  description: '',
  timeline: [],
  documents: []
})

// 进度对话框
const progressDialogVisible = ref(false)
const progressFormRef = ref<FormInstance>()

// 进度表单数据
const progressForm = reactive({
  title: '',
  content: '',
  time: new Date()
})

// 进度表单验证规则
const progressRules = reactive<FormRules>({
  title: [{ required: true, message: '请输入进度标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入进度内容', trigger: 'blur' }],
  time: [{ required: true, message: '请选择进度时间', trigger: 'change' }]
})

// 文档对话框
const documentDialogVisible = ref(false)
const documentFormRef = ref<FormInstance>()

// 文档表单数据
const documentForm = reactive({
  name: '',
  file: null as File | null
})

// 文件列表
const fileList = ref<Array<any>>([])

// 文档表单验证规则
const documentRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入文档名称', trigger: 'blur' }],
  file: [{ required: true, message: '请选择文件', trigger: 'change' }]
})

// 文档预览相关变量
const previewDialogVisible = ref(false)
const previewDocument = ref({
  id: 0,
  name: '',
  type: '',
  url: ''
})
const previewUrl = ref('')
const textContent = ref('')

// 文件类型判断
const isImageFile = computed(() => {
  const ext = previewDocument.value.name.split('.').pop()?.toLowerCase() || ''
  return ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)
})

const isPdfFile = computed(() => {
  const ext = previewDocument.value.name.split('.').pop()?.toLowerCase() || ''
  return ext === 'pdf'
})

const isTextFile = computed(() => {
  const ext = previewDocument.value.name.split('.').pop()?.toLowerCase() || ''
  return ext === 'txt'
})

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case '进行中':
      return 'warning'
    case '已立案':
      return 'success'
    case '已结案':
      return 'info'
    default:
      return 'info'
  }
}

// 获取案件详情
const getCaseDetail = async (id: number) => {
  try {
    const res = await request.get(`/cases/${id}`)
    if (res.code === 200 && res.data) {
      caseDetail.value = res.data
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

// 编辑案件
const editCase = () => {
  // 跳转到编辑案件页面
  router.push(`/case/${caseDetail.value.id}/edit`)
}

// 添加进度
const addProgress = () => {
  // 打开添加进度对话框
  progressDialogVisible.value = true
}

// 重置进度表单
const resetProgressForm = () => {
  if (progressFormRef.value) {
    progressFormRef.value.resetFields()
  }
  progressForm.title = ''
  progressForm.content = ''
  progressForm.time = new Date()
}

// 提交进度
const submitProgress = async () => {
  if (!progressFormRef.value) return
  try {
    await progressFormRef.value.validate()
    // 调用API添加进度
    await request.post(`/cases/${caseDetail.value.id}/timeline`, {
      title: progressForm.title,
      content: progressForm.content,
      time: progressForm.time
    })
    ElMessage.success('进度添加成功')
    progressDialogVisible.value = false
    // 重新获取案件详情，更新进度列表
    getCaseDetail(caseDetail.value.id)
  } catch (error) {
    console.error('进度添加失败:', error)
    ElMessage.error('进度添加失败')
  }
}

// 下载文档
const downloadDocument = async (docId: number) => {
  try {
    const res = await request.get(`/cases/${caseDetail.value.id}/documents/${docId}/download`)
    if (res.code === 200 && res.data) {
      window.open(res.data.downloadUrl, '_blank')
      ElMessage.success('开始下载文档')
    }
  } catch (error) {
    console.error('下载文档失败:', error)
    ElMessage.error('下载文档失败')
  }
}

// 预览文档
const handlePreviewDocument = async (document: any) => {
  try {
    console.log('开始预览文档:', document)
    
    // 直接设置当前预览的文档
    previewDocument.value = {
      id: document.id,
      name: document.name,
      type: document.type,
      url: document.url
    }
    
    // 尝试生成预览URL
    try {
      const res = await request.get(`/cases/${caseDetail.value.id}/documents/${document.id}/download`)
      console.log('获取下载URL成功:', res.data)
      
      if (res.code === 200 && res.data) {
        previewUrl.value = res.data.downloadUrl
        
        // 如果是文本文件，获取文件内容
        if (isTextFile.value) {
          try {
            const textRes = await fetch(previewUrl.value)
            textContent.value = await textRes.text()
            console.log('获取文本内容成功')
          } catch (textError) {
            console.error('获取文本内容失败:', textError)
            textContent.value = '无法加载文本内容'
          }
        }
      }
    } catch (apiError) {
      console.error('获取下载URL失败:', apiError)
      // 即使API请求失败，也打开弹窗，显示错误信息
      ElMessage.warning('无法获取完整预览信息，将显示基本内容')
    }
    
    // 无论如何都打开预览对话框
    console.log('打开预览对话框')
    previewDialogVisible.value = true
  } catch (error) {
    console.error('预览文档失败:', error)
    ElMessage.error('预览文档失败')
  }
}

// 上传文档
const uploadDocument = () => {
  // 打开上传文档对话框
  documentDialogVisible.value = true
}

// 处理文件变化
const handleFileChange = (file: any) => {
  documentForm.file = file.raw
  // 自动填充文档名称（如果未手动输入）
  if (!documentForm.name) {
    documentForm.name = file.raw.name
  }
}

// 获取文件类型图标
const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📋',
    pptx: '📋',
    txt: '📄',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    mp3: '🎵',
    wav: '🎵',
    mp4: '🎬',
    mov: '🎬',
    zip: '📦',
    rar: '📦',
    '7z': '📦'
  }
  return iconMap[ext] || '📄'
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 重置文档表单
const resetDocumentForm = () => {
  if (documentFormRef.value) {
    documentFormRef.value.resetFields()
  }
  documentForm.name = ''
  documentForm.file = null
  fileList.value = []
}

// 提交文档
const submitDocument = async () => {
  if (!documentFormRef.value) return
  try {
    await documentFormRef.value.validate()
    
    // 创建FormData对象
    const formData = new FormData()
    formData.append('name', documentForm.name)
    if (documentForm.file) {
      formData.append('file', documentForm.file)
      // 添加文件大小信息
      formData.append('size', String(documentForm.file.size))
    }
    
    // 调用API上传文档
    await request.post(`/cases/${caseDetail.value.id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    ElMessage.success('文档上传成功')
    documentDialogVisible.value = false
    // 重新获取案件详情，更新文档列表
    getCaseDetail(caseDetail.value.id)
  } catch (error) {
    console.error('文档上传失败:', error)
    ElMessage.error('文档上传失败')
  }
}

// 删除文档
const deleteDocument = async (docId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文档吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    await request.delete(`/cases/${caseDetail.value.id}/documents/${docId}`)
    ElMessage.success('删除文档成功')
    // 重新获取案件详情，更新文档列表
    getCaseDetail(caseDetail.value.id)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除文档失败')
    }
  }
}
</script>

<style scoped>
.case-detail-container {
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

.detail-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-content {
  padding: 20px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.detail-item {
  flex: 1;
  min-width: 300px;
  margin-right: 20px;
  margin-bottom: 15px;
}

.detail-item.full-width {
  flex: 100%;
  min-width: 100%;
  margin-right: 0;
}

.detail-item label {
  display: inline-block;
  width: 100px;
  font-weight: 600;
  color: #1a365d;
  margin-right: 10px;
}

.detail-item span {
  display: inline-block;
  vertical-align: top;
}

.detail-item p {
  margin: 0;
  padding-left: 110px;
  color: #718096;
  line-height: 1.5;
}

.timeline-container {
  padding: 10px 0;
}

.timeline-content h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 600;
}

.timeline-content p {
  margin: 0;
  font-size: 12px;
  color: #718096;
}

.document-list {
  padding: 10px 0;
}

/* 预览弹窗样式 */
.preview-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  overflow: auto;
}

/* 图片预览样式 */
.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* PDF预览样式 */
.pdf-preview {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.pdf-preview iframe {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: none;
}

/* 文本预览样式 */
.text-preview {
  width: 100%;
  height: 100%;
  min-height: 600px;
  padding: 20px;
  background: #f5f5f5;
  overflow: auto;
}

.text-preview pre {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: auto;
}

/* Office文件预览样式 */
.office-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: #f5f5f5;
}

/* 全屏对话框样式 */
:deep(.el-dialog__body) {
  padding: 0 !important;
  overflow: hidden;
}
</style>
