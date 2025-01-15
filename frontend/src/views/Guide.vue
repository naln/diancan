<template>
  <div class="guide-container">
    <div class="guide-content">
      <h1>欢迎使用餐厅点单系统</h1>
      <div class="guide-buttons">
        <!-- 顾客入口 -->
        <el-button 
          type="primary" 
          size="large" 
          @click="$router.push('/customer')"
        >
          <el-icon><User /></el-icon>
          顾客点单
        </el-button>
        
        <!-- 厨师入口 -->
        <el-button 
          type="success" 
          size="large" 
          @click="$router.push('/chef')"
        >
          <el-icon><KnifeFork /></el-icon>
          厨师工作台
        </el-button>
        
        <!-- 管理员入口 -->
        <el-button 
          type="warning" 
          size="large" 
          @click="$router.push('/admin')"
        >
          <el-icon><Setting /></el-icon>
          后台管理
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, KnifeFork, Setting } from '@element-plus/icons-vue'
</script>

<style scoped>
.guide-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.guide-content {
  text-align: center;
}

.guide-buttons {
  margin-top: 2rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.el-button {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.el-icon {
  font-size: 2rem;
}
</style> 