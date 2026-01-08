<template>
  <div class="profile-container">
    <h1 class="page-title">个人中心</h1>
    
    <!-- 用户信息概览卡片 -->
    <ProfileHeader :user-info="userInfo" />
    
    <!-- 详细信息卡片 -->
    <ProfileDetail 
      :user-info="userInfo"
      @edit-info="handleEditInfo"
      @change-password="handleChangePassword"
      @update-avatar="handleUpdateAvatar"
    />
    
    <!-- 账号设置卡片 -->
    <ProfileSettings 
      :settings-form="settingsForm"
      :loading="loading.saveSettings"
      @save-settings="handleSaveSettings"
    />
    
    <!-- 编辑信息对话框 -->
    <EditInfoDialog 
      v-model:visible="editInfoVisible"
      :initial-form="editFormInitialData"
      :loading="loading.editInfo"
      @submit="submitEditInfo"
    />
    
    <!-- 修改密码对话框 -->
    <ChangePasswordDialog 
      v-model:visible="changePasswordVisible"
      :loading="loading.changePassword"
      @submit="submitChangePassword"
    />
    
    <!-- 更新头像对话框 -->
    <UpdateAvatarDialog 
      v-model:visible="updateAvatarVisible"
      :initial-avatar="userInfo.avatar"
      :loading="loading.updateAvatar"
      @submit="submitUpdateAvatar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../utils/request'
import { useUserStore } from '../../stores/user'

// 导入组件
import ProfileHeader from '../../components/profile/ProfileHeader.vue'
import ProfileDetail from '../../components/profile/ProfileDetail.vue'
import ProfileSettings from '../../components/profile/ProfileSettings.vue'
import EditInfoDialog from '../../components/profile/EditInfoDialog.vue'
import ChangePasswordDialog from '../../components/profile/ChangePasswordDialog.vue'
import UpdateAvatarDialog from '../../components/profile/UpdateAvatarDialog.vue'

const userStore = useUserStore()

// 用户信息，从store获取
const userInfo = computed(() => userStore.userInfo)


// 设置表单
const settingsForm = reactive({
  notification: true,
  emailNotification: false,
  autoLogin: false,
  notificationType: ['inSite', 'email'],
  language: 'zh-CN'
})

// 对话框可见性
const editInfoVisible = ref(false)
const changePasswordVisible = ref(false)
const updateAvatarVisible = ref(false)

// 加载状态
const loading = reactive({
  editInfo: false,
  changePassword: false,
  updateAvatar: false,
  saveSettings: false
})

// 编辑表单初始数据
const editFormInitialData = computed(() => ({
  realName: userInfo.value.realName,
  gender: userInfo.value.gender,
  birthDate: userInfo.value.birthDate,
  email: userInfo.value.email,
  phone: userInfo.value.phone,
  introduction: userInfo.value.introduction
}))

// 编辑信息按钮点击事件
const handleEditInfo = () => {
  editInfoVisible.value = true
}

// 修改密码按钮点击事件
const handleChangePassword = () => {
  changePasswordVisible.value = true
}

// 更新头像按钮点击事件
const handleUpdateAvatar = () => {
  updateAvatarVisible.value = true
}

// 提交编辑信息
const submitEditInfo = (formData) => {
  loading.editInfo = true
  
  // 模拟API请求
  setTimeout(() => {
    // 更新用户信息
    userInfo.value.realName = formData.realName
    userInfo.value.gender = formData.gender
    userInfo.value.birthDate = formData.birthDate
    userInfo.value.email = formData.email
    userInfo.value.phone = formData.phone
    userInfo.value.introduction = formData.introduction
    
    editInfoVisible.value = false
    ElMessage.success('信息更新成功')
    loading.editInfo = false
  }, 800)
}

// 提交修改密码
const submitChangePassword = (formData) => {
  loading.changePassword = true
  
  // 模拟API请求
  setTimeout(() => {
    changePasswordVisible.value = false
    ElMessage.success('密码修改成功')
    loading.changePassword = false
  }, 800)
}

// 提交更新头像
const submitUpdateAvatar = async (file: File) => {
  loading.updateAvatar = true
  
  try {
    // 构建FormData
    const formData = new FormData()
    formData.append('avatar', file)
    
    // 调用API上传头像
    const res = await request.post('/users/avatar/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (res.code === 200) {
      // 更新用户头像，添加时间戳防止浏览器缓存
      const avatarUrl = `${res.data.url}?t=${Date.now()}`
      // 使用store更新头像，这样所有组件都会自动更新
      userStore.updateAvatar(avatarUrl)
      updateAvatarVisible.value = false
      ElMessage.success('头像更新成功')
    } else {
      ElMessage.error(res.message || '头像更新失败')
    }
  } catch (error) {
    console.error('头像更新失败:', error)
    ElMessage.error('头像更新失败')
  } finally {
    loading.updateAvatar = false
  }
}

// 保存设置
const handleSaveSettings = () => {
  loading.saveSettings = true
  
  // 模拟API请求
  setTimeout(() => {
    ElMessage.success('设置保存成功')
    loading.saveSettings = false
  }, 800)
}
</script>

<style scoped>
.profile-container {
  padding: 0;
}

.page-title {
  margin: 0 0 24px 0;
  color: var(--primary-color);
  font-size: 24px;
  font-weight: 600;
}
</style>
