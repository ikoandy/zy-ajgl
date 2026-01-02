<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-logo">
        <h1>律师事务所管理系统</h1>
      </div>
      
      <van-form @submit="handleSubmit" ref="loginFormRef">
        <van-field
          v-model="loginForm.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
          left-icon="contact"
        />
        
        <van-field
          v-model="loginForm.password"
          name="password"
          label="密码"
          type="password"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
          left-icon="closed-eye"
          :right-icon="showPassword ? 'eye-o' : 'closed-eye'"
          @click-right-icon="showPassword = !showPassword"
          :password-visible="showPassword"
        />
        
        <div class="login-form-actions">
          <van-checkbox v-model="loginForm.remember">记住密码</van-checkbox>
          <a href="#" class="login-forgot-password">忘记密码？</a>
        </div>
        
        <van-button
          type="primary"
          block
          native-type="submit"
          :loading="loading"
          class="login-submit-btn"
        >
          登录
        </van-button>
      </van-form>
      
      <div class="login-divider">
        <span>其他登录方式</span>
      </div>
      
      <div class="login-other-methods">
        <van-icon name="wechat" size="32" color="#07C160" />
        <van-icon name="qq" size="32" color="#12B7F5" />
        <van-icon name="phone-o" size="32" color="#FF6B6B" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();

const loading = ref(false);
const showPassword = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    // 模拟登录
    setTimeout(() => {
      showToast('登录成功');
      router.push('/dashboard');
      loading.value = false;
    }, 1000);
  } catch (error: any) {
    showToast(error.message || '登录失败，请检查账号密码');
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-logo {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.login-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;
}

.login-forgot-password {
  color: #1989fa;
  text-decoration: none;
}

.login-submit-btn {
  margin-bottom: 24px;
}

.login-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0;
  font-size: 14px;
  color: #999;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #eee;
  margin: 0 12px;
}

.login-other-methods {
  display: flex;
  justify-content: center;
  gap: 32px;
}
</style>
