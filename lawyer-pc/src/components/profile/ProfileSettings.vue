<template>
  <el-card class="profile-card settings-card">
    <template #header>
      <div class="card-header">
        <span>账号设置</span>
      </div>
    </template>
    <div class="settings-content">
      <el-form :model="settingsForm" label-width="150px" class="settings-form">
        <el-form-item label="消息通知">
          <el-switch v-model="settingsForm.notification" active-text="开启" inactive-text="关闭"></el-switch>
        </el-form-item>
        <el-form-item label="邮件通知">
          <el-switch v-model="settingsForm.emailNotification" active-text="开启" inactive-text="关闭"></el-switch>
        </el-form-item>
        <el-form-item label="自动登录">
          <el-switch v-model="settingsForm.autoLogin" active-text="开启" inactive-text="关闭"></el-switch>
        </el-form-item>
        <el-form-item label="通知提醒方式">
          <el-select v-model="settingsForm.notificationType" multiple placeholder="请选择">
            <el-option label="站内消息" value="inSite"></el-option>
            <el-option label="短信" value="sms"></el-option>
            <el-option label="邮件" value="email"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="语言偏好">
          <el-select v-model="settingsForm.language" placeholder="请选择">
            <el-option label="简体中文" value="zh-CN"></el-option>
            <el-option label="English" value="en"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="profile-actions">
      <el-button type="primary" @click="$emit('save-settings')" :loading="loading">
        <i class="el-icon-check"></i>
        保存设置
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  settingsForm: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save-settings'])
</script>

<style scoped>
.profile-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.profile-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

/* 设置表单样式 */
.settings-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  align-items: center;
}

.settings-content {
  padding: 20px 0;
}

/* 操作按钮样式 */
.profile-actions {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0 0;
  gap: 12px;
  border-top: 1px solid var(--border-color);
}

.profile-actions .el-button {
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 14px;
  transition: all 0.2s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-form {
    grid-template-columns: 1fr;
  }

  .profile-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>