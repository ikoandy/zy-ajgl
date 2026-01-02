<template>
  <div class="profile-container">
    <h1 class="page-title">个人中心</h1>
    
    <!-- 用户信息概览卡片 -->
    <el-card class="profile-card overview-card">
      <div class="overview-content">
        <div class="avatar-section">
          <el-avatar :size="120" :src="userInfo.avatar">
            {{ userInfo.realName.substring(0, 1) }}
          </el-avatar>
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
    
    <!-- 详细信息卡片 -->
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
        <el-button type="primary">
          <i class="el-icon-edit"></i>
          编辑信息
        </el-button>
        <el-button type="warning">
          <i class="el-icon-lock"></i>
          修改密码
        </el-button>
        <el-button type="info">
          <i class="el-icon-upload"></i>
          更新头像
        </el-button>
      </div>
    </el-card>
    
    <!-- 账号设置卡片 -->
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
        <el-button type="primary">
          <i class="el-icon-check"></i>
          保存设置
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 用户信息
const userInfo = ref({
  username: 'lawyer001',
  realName: '王律师',
  avatar: 'https://via.placeholder.com/80',
  gender: '男',
  birthDate: '1985-05-15',
  email: 'lawyer@example.com',
  phone: '13800138000',
  role: '律师',
  practiceCertificate: '11101200010123456',
  lawFirm: '北京市XX律师事务所',
  professionalField: '合同纠纷、知识产权、企业法律顾问',
  practiceYears: '15',
  position: '高级合伙人',
  officeAddress: '北京市朝阳区建国路88号',
  education: '北京大学法学院 法学博士',
  qualifications: '中国律师执业资格证、专利代理人资格证',
  introduction: '专注于合同纠纷、知识产权保护和企业法律顾问服务，拥有丰富的诉讼和非诉经验，曾为多家知名企业提供法律服务。',
  joinTime: '2025-01-01',
  lastLoginTime: '2025-12-31 14:30:00',
  status: '在线'
})

// 设置表单
const settingsForm = reactive({
  notification: true,
  emailNotification: false,
  autoLogin: false,
  notificationType: ['inSite', 'email'],
  language: 'zh-CN'
})
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

/* 通用卡片样式 */
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

.avatar-section .el-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
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

/* 详细信息卡片样式 */
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
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-form {
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
