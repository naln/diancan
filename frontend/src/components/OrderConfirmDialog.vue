<template>
  <el-dialog
    title="确认订单"
    v-model="dialogVisible"
    width="90%"
    :close-on-click-modal="false"
  >
    <!-- 订单内容 -->
    <div class="order-items">
      <!-- ... 订单项目列表 ... -->
    </div>
    
    <!-- 操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button 
          size="large"
          class="confirm-btn"
          @click="dialogVisible = false"
        >
          取消
        </el-button>
        <el-button 
          type="primary"
          size="large"
          class="confirm-btn"
          @click="confirmOrder"
        >
          确认提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}

.confirm-btn {
  min-width: 120px;
  height: 48px;
  font-size: 16px;
}

/* 在移动设备上让按钮更大 */
@media screen and (max-width: 768px) {
  .dialog-footer {
    justify-content: space-around;
  }
  
  .confirm-btn {
    flex: 1;
    max-width: 200px;
    height: 54px;
    font-size: 18px;
  }
}
</style> 