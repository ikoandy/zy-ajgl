<template>
  <div class="error-404">
    <div class="error-content">
      <van-empty
        image="error"
        description="页面不存在"
      />
      <van-button type="primary" block class="back-home-btn" @click="handleBackHome">
        返回首页
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const handleBackHome = () => {
  router.push('/mobile/dashboard');
};
</script>

<style scoped>
.error-404 {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.error-content {
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.back-home-btn {
  margin-top: 20px;
}
</style>
