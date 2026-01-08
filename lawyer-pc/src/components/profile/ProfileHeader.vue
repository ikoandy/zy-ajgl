<template>
  <el-card class="profile-card overview-card">
    <div class="overview-content">
      <div class="avatar-section">
        <!-- 直接使用img标签显示头像，更可靠 -->
        <div class="avatar-container">
          <img :src="userInfo.avatar" class="avatar" :alt="userInfo.realName" />
          <div class="avatar-placeholder" v-if="!userInfo.avatar">
            {{ userInfo.realName.substring(0, 1) }}
          </div>
        </div>
        <div class="status-indicator">
          <el-tag :type="userInfo.status === '在线' ? 'success' : 'info'" effect="dark">
            {{ userInfo.status }}
          </el-tag>
        </div>
      </div>
      <div class="basic-info-section">
        <h2 class="user-name">{{ userInfo.realName }}</h2>
        <p class="user-title">{{ userInfo.position }} | {{ userInfo.lawFirm }}</p>
        <div class="user-meta">
          <span class="meta-item">{{ userInfo.professionalField }}</span>
          <span class="meta-item">{{ userInfo.practiceYears }}年执业经验</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})
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

/* 概览卡片样式 */
.overview-card {
  background: linear-gradient(135deg, var(--primary-color) 0%, #2d3748 100%);
  color: #fff;
  border-radius: 12px;
}

.overview-content {
  display: flex;
  align-items: center;
  padding: 32px;
  gap: 32px;
}

.avatar-section {
  position: relative;
}

/* 自定义头像容器 */
.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  background-color: rgba(255, 255, 255, 0.1);
}

/* 头像图片 */
.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 头像占位符 */
.avatar-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  background-color: rgba(255, 255, 255, 0.1);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #fff;
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.status-indicator .el-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.basic-info-section {
  flex: 1;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.user-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-content {
    flex-direction: column;
    text-align: center;
  }

  .basic-info-section {
    text-align: center;
  }

  .user-meta {
    justify-content: center;
  }
}
</style>