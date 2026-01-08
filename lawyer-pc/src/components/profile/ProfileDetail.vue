<template>
  <el-card class="profile-card detail-card">
    <template #header>
      <div class="card-header">
        <span>详细信息</span>
      </div>
    </template>

    <div class="detail-content">
      <!-- 个人基本信息 -->
      <div class="detail-section">
        <h3 class="section-title">个人基本信息</h3>
        <div class="info-grid">
          <div class="profile-item">
            <label>用户名：</label>
            <span>{{ userInfo.username }}</span>
          </div>
          <div class="profile-item">
            <label>性别：</label>
            <span>{{ userInfo.gender }}</span>
          </div>
          <div class="profile-item">
            <label>出生日期：</label>
            <span>{{ userInfo.birthDate }}</span>
          </div>
          <div class="profile-item">
            <label>邮箱：</label>
            <span>{{ userInfo.email }}</span>
          </div>
          <div class="profile-item">
            <label>手机号：</label>
            <span>{{ userInfo.phone }}</span>
          </div>
          <div class="profile-item">
            <label>执业证号：</label>
            <span>{{ userInfo.practiceCertificate }}</span>
          </div>
        </div>
      </div>

      <!-- 执业信息 -->
      <div class="detail-section">
        <h3 class="section-title">执业信息</h3>
        <div class="info-grid">
          <div class="profile-item">
            <label>律师事务所：</label>
            <span>{{ userInfo.lawFirm }}</span>
          </div>
          <div class="profile-item">
            <label>职位：</label>
            <span>{{ userInfo.position }}</span>
          </div>
          <div class="profile-item">
            <label>执业领域：</label>
            <span>{{ userInfo.professionalField }}</span>
          </div>
          <div class="profile-item">
            <label>执业年限：</label>
            <span>{{ userInfo.practiceYears }}年</span>
          </div>
          <div class="profile-item">
            <label>办公地址：</label>
            <span>{{ userInfo.officeAddress }}</span>
          </div>
          <div class="profile-item">
            <label>资格证书：</label>
            <span>{{ userInfo.qualifications }}</span>
          </div>
        </div>
      </div>

      <!-- 教育背景 -->
      <div class="detail-section">
        <h3 class="section-title">教育背景</h3>
        <div class="info-grid">
          <div class="profile-item full-width">
            <label>学历：</label>
            <span>{{ userInfo.education }}</span>
          </div>
        </div>
      </div>

      <!-- 个人简介 -->
      <div class="detail-section">
        <h3 class="section-title">个人简介</h3>
        <div class="profile-item full-width description">
          <label>简介：</label>
          <span>{{ userInfo.introduction }}</span>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="detail-section">
        <h3 class="section-title">系统信息</h3>
        <div class="info-grid">
          <div class="profile-item">
            <label>角色：</label>
            <span>{{ userInfo.role }}</span>
          </div>
          <div class="profile-item">
            <label>加入时间：</label>
            <span>{{ userInfo.joinTime }}</span>
          </div>
          <div class="profile-item">
            <label>最后登录：</label>
            <span>{{ userInfo.lastLoginTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-actions">
      <el-button type="primary" @click="$emit('edit-info')">
        <i class="el-icon-edit"></i>
        编辑信息
      </el-button>
      <el-button type="warning" @click="$emit('change-password')">
        <i class="el-icon-lock"></i>
        修改密码
      </el-button>
      <el-button type="info" @click="$emit('update-avatar')">
        <i class="el-icon-upload"></i>
        更新头像
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit-info', 'change-password', 'update-avatar'])
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

.detail-content {
  padding: 20px 0;
}

.detail-section {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.detail-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  background: var(--accent-color);
  margin-right: 8px;
  border-radius: 2px;
}

/* 信息网格布局 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.profile-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.profile-item:last-child {
  border-bottom: none;
}

.profile-item label {
  display: inline-block;
  width: 100px;
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 10px;
  flex-shrink: 0;
  text-align: right;
}

.profile-item span {
  display: inline-block;
  vertical-align: top;
  flex: 1;
  color: var(--text-secondary);
  word-break: break-word;
}

/* 全宽项目 */
.profile-item.full-width {
  grid-column: 1 / -1;
}

.profile-item.description {
  align-items: flex-start;
}

.profile-item.description label {
  margin-top: 4px;
}

.profile-item.description span {
  line-height: 1.6;
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
  .info-grid {
    grid-template-columns: 1fr;
  }

  .profile-item {
    flex-direction: column;
    align-items: stretch;
  }

  .profile-item label {
    width: auto;
    text-align: left;
    margin-right: 0;
    margin-bottom: 4px;
  }

  .profile-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>