<template>
  <div class="docs-container">
    <div class="page-header">
      <h1 class="page-title">文档管理</h1>
      <el-button type="primary" @click="openUploadDialog">
        <i class="el-icon-plus"></i>
        上传文档
      </el-button>
    </div>
    
    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :model="searchForm" class="search-form" layout="inline">
        <el-form-item label="文档名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入文档名称"
            clearable
            style="width: 200px;"
          ></el-input>
        </el-form-item>
        <el-form-item label="文档类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择文档类型"
            clearable
            style="width: 150px;"
          >
            <el-option label="PDF" value="PDF"></el-option>
            <el-option label="Word" value="Word"></el-option>
            <el-option label="Excel" value="Excel"></el-option>
            <el-option label="PPT" value="PPT"></el-option>
            <el-option label="图片" value="图片"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属案件">
          <el-input
            v-model="searchForm.caseName"
            placeholder="请输入所属案件"
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
    
    <!-- 文档列表 -->
    <el-card class="table-card">
      <el-table
        :data="docsList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="文档ID" width="80"></el-table-column>
        <el-table-column prop="name" label="文档名称" min-width="200">
          <template #default="scope">
            <div class="doc-name-wrapper">
              <i class="el-icon-document"></i>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="文档类型" width="100">
          <template #default="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="caseName" label="所属案件" min-width="150"></el-table-column>
        <el-table-column prop="size" label="文档大小" width="100"></el-table-column>
        <el-table-column prop="uploadUser" label="上传人" width="120"></el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180"></el-table-column>
        <el-table-column prop="downloadCount" label="下载次数" width="100"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="previewDocument(scope.row.id)"
                plain
              >
                <i class="el-icon-view"></i>
                预览
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="downloadDocument(scope.row.id)"
                plain
              >
                <i class="el-icon-download"></i>
                下载
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="editDocument()"
                plain
              >
                <i class="el-icon-edit"></i>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteDocument(scope.row.id)"
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
    
    <!-- 上传文档对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传文档"
      width="600px"
    >
      <el-form :model="docForm" :rules="docRules" ref="docFormRef" label-width="100px">
        <el-form-item label="文档名称" prop="name">
          <el-input v-model="docForm.name" placeholder="请输入文档名称"></el-input>
        </el-form-item>
        <el-form-item label="所属案件" prop="caseId">
          <el-select v-model="docForm.caseId" placeholder="请选择所属案件">
            <el-option
              v-for="caseItem in caseList"
              :key="caseItem.id"
              :label="caseItem.name"
              :value="caseItem.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文档描述" prop="description">
          <el-input v-model="docForm.description" type="textarea" rows="3" placeholder="请输入文档描述"></el-input>
        </el-form-item>
        <el-form-item label="上传文件" prop="file">
          <el-upload
            class="upload-demo"
            action="#"
            :file-list="fileList"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持上传 PDF, Word, Excel, PPT, 图片等格式文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadDocument">确定上传</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 定义文档类型
interface DocItem {
  id: number;
  name: string;
  type: string;
  caseName: string;
  size: string;
  uploadUser: string;
  uploadTime: string;
  downloadCount: number;
}

// 定义文件类型
interface FileItem {
  name: string;
  size: number;
  raw: File;
  uid: string;
  status: string;
}

// 定义案件类型
interface CaseItem {
  id: number;
  name: string;
}

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  caseName: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 选中的文档
const selectedDocs = ref<DocItem[]>([])

// 文档列表数据
const docsList = ref<DocItem[]>([])

// 文档表单
const docForm = reactive({
  id: 0,
  name: '',
  caseId: 0,
  description: '',
  file: null as File | null
})

// 案件列表
const caseList = ref<CaseItem[]>([])

// 获取案件列表用于文档上传
const getCaseList = async () => {
  try {
    const res = await request.get('/cases', { pageSize: 100 })
    if (res.code === 200 && res.data) {
      caseList.value = res.data.list.map((item: any) => ({
        id: item.id,
        name: item.title
      }))
    }
  } catch (error) {
    console.error('获取案件列表失败:', error)
  }
}

// 初始化获取案件列表
onMounted(() => {
  getCaseList()
})

// 文件列表
const fileList = ref<FileItem[]>([])

// 表单引用
const docFormRef = ref()

// 对话框控制
const uploadDialogVisible = ref(false)

// 表单验证规则
const docRules = {
  name: [
    { required: true, message: '请输入文档名称', trigger: 'blur' },
    { min: 2, max: 100, message: '文档名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  caseId: [
    { required: true, message: '请选择所属案件', trigger: 'change' }
  ],
  file: [
    { required: true, message: '请选择要上传的文件', trigger: 'change' }
  ]
}

// 生命周期钩子，用于获取文档列表数据
onMounted(() => {
  getDocList()
})

// 获取文档列表
const getDocList = async () => {
  try {
    const params: Record<string, any> = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.type) params.type = searchForm.type
    if (searchForm.caseName) params.caseName = searchForm.caseName
    
    const res = await request.get('/documents', params)
    if (res.code === 200 && res.data) {
      docsList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取文档列表失败:', error)
  }
}

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedDocs.value = selection
}

// 搜索文档
const handleSearch = () => {
  pagination.currentPage = 1
  getDocList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    caseName: ''
  })
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  getDocList()
}

// 当前页码变化
const handleCurrentChange = (current: number) => {
  pagination.currentPage = current
  getDocList()
}

// 打开上传文档对话框
const openUploadDialog = () => {
  // 重置表单
  Object.assign(docForm, {
    id: 0,
    name: '',
    caseId: '',
    description: '',
    file: null
  })
  fileList.value = []
  uploadDialogVisible.value = true
}

// 处理文件选择
const handleFileChange = (file: FileItem) => {
  docForm.file = file.raw
  fileList.value = [file]
}

// 上传文档
const uploadDocument = async () => {
  if (docFormRef.value) {
    docFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          const formData = new FormData()
          formData.append('name', docForm.name)
          formData.append('caseId', String(docForm.caseId))
          formData.append('description', docForm.description)
          if (docForm.file) {
            formData.append('file', docForm.file)
          }
          
          await request.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          ElMessage.success('上传文档成功')
          uploadDialogVisible.value = false
          getDocList()
        } catch (error: any) {
          ElMessage.error(error.response?.data?.message || '上传文档失败')
        }
      }
    })
  }
}

// 预览文档
const previewDocument = async (id: number) => {
  try {
    const res = await request.get(`/documents/${id}`)
    if (res.code === 200 && res.data) {
      ElMessage.success('获取文档信息成功')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '预览文档失败')
  }
}

// 下载文档
const downloadDocument = async (id: number) => {
  try {
    const res = await request.get(`/documents/${id}/download`)
    if (res.code === 200) {
      ElMessage.success('下载文档成功')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '下载文档失败')
  }
}

// 编辑文档
const editDocument = async () => {
  try {
    ElMessage.success('编辑文档功能已触发')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '编辑文档失败')
  }
}

// 删除文档
const deleteDocument = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文档吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    await request.delete(`/documents/${id}`)
    ElMessage.success('删除文档成功')
    getDocList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除文档失败')
    }
  }
}
</script>

<style scoped>
.docs-container {
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

/* 文档名称 */
.doc-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-name-wrapper i {
  color: var(--accent-color);
  font-size: 16px;
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

/* 成功按钮样式 */
.el-button--success {
  background-color: transparent;
  border-color: var(--success-color);
  color: var(--success-color);
}

.el-button--success:hover,
.el-button--success:focus {
  background-color: var(--success-color);
  border-color: var(--success-color);
  color: #fff;
  box-shadow: 0 2px 8px rgba(56, 161, 105, 0.3);
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

/* 上传组件样式 */
.upload-demo {
  width: 100%;
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