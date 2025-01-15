<template>
  <div class="admin-container">
    <el-header class="header">
      <div class="header-left">
        <el-button @click="$router.push('/')" icon="Back">返回首页</el-button>
      </div>
    </el-header>

    <el-container class="main-container">
      <el-main>
        <el-tabs v-model="activeTab" class="main-tabs">
          <!-- 数据统计 -->
          <el-tab-pane label="数据统计" name="statistics">
            <statistics-panel />
          </el-tab-pane>

          <!-- 菜品管理 -->
          <el-tab-pane label="菜品管理" name="dishes">
            <dish-management />
          </el-tab-pane>

          <!-- 用户管理 -->
          <el-tab-pane label="用户管理" name="users">
            <user-management />
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StatisticsPanel from './components/StatisticsPanel.vue'
import DishManagement from './components/DishManagement.vue'
import UserManagement from './components/UserManagement.vue'

const activeTab = ref('statistics')
</script> 