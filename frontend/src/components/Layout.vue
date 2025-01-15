<template>
  <el-container class="app-container">
    <el-header class="app-header" height="60px">
      <div class="header-left">
        <h2 class="app-title">点餐系统</h2>
      </div>
      <div class="header-right">
      </div>
    </el-header>

    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.app-title {
  margin: 0;
  color: #409EFF;
  font-size: 24px;
}

.welcome-text {
  color: #606266;
  font-size: 14px;
}

.app-main {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

:deep(.el-button) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style> 