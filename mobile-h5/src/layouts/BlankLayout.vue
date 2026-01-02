<template>
  <div class="blank-layout">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 空白布局，用于不需要顶部和底部导航的页面
</script>

<style scoped>
.blank-layout {
  height: 100vh;
  background-color: #f5f5f5;
}
</style>
