<template>
  <div class="error-container">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-message">页面不存在</h2>
      <p class="error-desc">抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" @click="goHome">
        <i class="el-icon-home"></i>
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7fafc;
}

.error-content {
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.error-code {
  margin: 0 0 10px 0;
  font-size: 96px;
  font-weight: 600;
  color: #1a365d;
}

.error-message {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
}

.error-desc {
  margin: 0 0 30px 0;
  font-size: 16px;
  color: #718096;
}
</style>
