<template>
  <!-- 购物车内容 -->
  <div class="cart-items">
    <div v-for="item in cart" :key="item._id" class="cart-item">
      <span class="item-name">{{ item.name }}</span>
      <div class="item-controls">
        <el-button 
          type="primary" 
          size="large"
          class="quantity-btn"
          @click="updateQuantity(item._id, item.quantity - 1)"
        >
          <el-icon><Minus /></el-icon>
        </el-button>
        <span class="quantity">{{ item.quantity }}</span>
        <el-button 
          type="primary"
          size="large"
          class="quantity-btn"
          @click="updateQuantity(item._id, item.quantity + 1)"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
        <el-button 
          type="danger"
          size="large"
          class="delete-btn"
          @click="removeFromCart(item._id)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
  
  <!-- 提交按钮 -->
  <el-button 
    type="success" 
    size="large"
    class="submit-btn"
    :disabled="!cart.length"
    @click="submitOrder"
  >
    完成点单
  </el-button>
</template>

<style scoped>
.cart-items {
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 数量调整按钮 */
.quantity-btn {
  width: 48px;
  height: 48px;
  padding: 0;
  font-size: 20px;
}

/* 删除按钮 */
.delete-btn {
  width: 48px;
  height: 48px;
  padding: 0;
  font-size: 20px;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 50px;
  font-size: 18px;
  margin-top: 20px;
}

.quantity {
  font-size: 18px;
  min-width: 30px;
  text-align: center;
}

/* 确保图标居中 */
:deep(.el-icon) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style> 