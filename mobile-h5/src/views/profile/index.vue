<template>
  <div class="profile-container">
    <!-- 用户信息卡片 -->
    <van-card class="profile-card">
      <div class="profile-header">
        <van-image
          round
          fit="cover"
          :src="userInfo.avatar || defaultAvatar"
          :width="80"
          :height="80"
        />
        <div class="profile-info">
          <h2 class="profile-name">{{ userInfo.name }}</h2>
          <p class="profile-role">{{ userInfo.role || '客户' }}</p>
        </div>
      </div>
    </van-card>
    
    <!-- 功能列表 -->
    <van-card title="我的服务" class="profile-card">
      <van-cell-group>
        <van-cell title="案件进度" is-link @click="handleCaseProgress" />
        <van-cell title="咨询预约" is-link @click="handleConsultation" />
        <van-cell title="消息中心" is-link @click="handleMessages" />
        <van-cell title="资料上传" is-link @click="handleUpload" />
      </van-cell-group>
    </van-card>
    
    <!-- 设置列表 -->
    <van-card title="设置" class="profile-card">
      <van-cell-group>
        <van-cell title="个人信息" is-link @click="handlePersonalInfo" />
        <van-cell title="安全设置" is-link @click="handleSecurity" />
        <van-cell title="通知设置" is-link @click="handleNotificationSettings" />
        <van-cell title="关于我们" is-link @click="handleAbout" />
      </van-cell-group>
    </van-card>
    
    <!-- 退出登录按钮 -->
    <div class="profile-actions">
      <van-button type="primary" block @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();

// 默认头像
const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg';

// 用户信息（模拟数据）
const userInfo = ref({
  name: '张三',
  avatar: '',
  role: '客户',
  phone: '13800138000'
});

// 处理案件进度
const handleCaseProgress = () => {
  showToast('案件进度功能开发中');
};

// 处理咨询预约
const handleConsultation = () => {
  showToast('咨询预约功能开发中');
};

// 处理消息中心
const handleMessages = () => {
  showToast('消息中心功能开发中');
};

// 处理资料上传
const handleUpload = () => {
  showToast('资料上传功能开发中');
};

// 处理个人信息
const handlePersonalInfo = () => {
  showToast('个人信息功能开发中');
};

// 处理安全设置
const handleSecurity = () => {
  showToast('安全设置功能开发中');
};

// 处理通知设置
const handleNotificationSettings = () => {
  showToast('通知设置功能开发中');
};

// 处理关于我们
const handleAbout = () => {
  showToast('关于我们功能开发中');
};

// 处理退出登录
const handleLogout = () => {
  showToast('退出登录成功');
  // 实际项目中这里应该清除登录状态
  router.push('/auth/login');
};
</script>

<style scoped>
.profile-container {
  padding-bottom: 20px;
}

.profile-card {
  margin-bottom: 16px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  margin-bottom: 5px;
}

.profile-role {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.profile-actions {
  padding: 16px;
}
</style>
