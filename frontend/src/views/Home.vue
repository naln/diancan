<template>
  <div class="login-container">
    <div class="login-content">
      <h1 class="title">点单系统</h1>
      <div class="button-group">
        <el-button 
          type="primary" 
          size="large"
          class="entrance-button"
          @click="$router.push('/customer')"
        >
          选择你要点的面种类
        </el-button>
        <el-button 
          type="success" 
          size="large"
          class="entrance-button"
          @click="handleLoginClick('chef')"
        >
          厨师（煮熟操作员）入口
        </el-button>
        <el-button 
          type="warning" 
          size="large"
          class="entrance-button"
          @click="handleLoginClick('admin')"
        >
          管理员入口
        </el-button>
      </div>
    </div>
    
    <LoginDialog
      v-model:visible="loginVisible"
      :type="loginType"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoginDialog from '@/components/LoginDialog.vue'

const loginVisible = ref(false)
const loginType = ref('')

const handleLoginClick = (type) => {
  loginType.value = type
  loginVisible.value = true
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-content {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  margin-bottom: 2rem;
  color: #303133;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

/* 增大按钮尺寸和间距 */
.entrance-button {
  width: 280px;  /* 增加按钮宽度 */
  height: 60px;  /* 增加按钮高度 */
  font-size: 18px;  /* 增大字体 */
  border-radius: 8px;  /* 圆角 */
}

/* 确保按钮文字不会换行 */
:deep(.entrance-button .el-button__content) {
  white-space: nowrap;
}

/* 增加按钮悬停效果 */
.entrance-button:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 覆盖 Element Plus 的默认样式 */
:deep(.entrance-button) {
  margin-left: 0 !important;  /* 移除 Element Plus 的默认左边距 */
}
</style> 