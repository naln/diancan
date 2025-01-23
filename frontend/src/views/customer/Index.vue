<template>
  <div class="customer-container">
    <!-- 主要内容区 -->
    <el-container class="main-container">
      <el-main>
        <div v-loading="loading">
          <!-- 菜品网格 -->
          <div class="dishes-grid">
            <template v-if="filteredDishes.length">
              <DishCard
                v-for="dish in filteredDishes.filter(d => d.status)"
                :key="dish._id"
                :dish="dish"
                :pending-count="getPendingCount(dish._id)"
              />
            </template>
            <el-empty v-else description="暂无菜品" />
          </div>
        </div>
      </el-main>

      <!-- 固定在右侧的订单确认 -->
      <el-aside width="300px" class="order-aside">
        <div class="order-panel">
          <h2 class="order-title">订单确认</h2>
          <div class="cart-items">
            <TransitionGroup name="list">
              <div v-for="item in cart" :key="item._id" class="cart-item">
                <div class="item-info">
                  <h3 class="item-name">{{ item.name }}</h3>
                  <div class="item-quantity">
                    <el-button-group>
                      <el-button 
                        type="primary" 
                        :icon="Minus" 
                        @click="decreaseQuantity(item)"
                        :disabled="item.quantity <= 1"
                      />
                      <el-button class="quantity-display">{{ item.quantity }}</el-button>
                      <el-button 
                        type="primary" 
                        :icon="Plus" 
                        @click="increaseQuantity(item)"
                      />
                    </el-button-group>
                    <el-button 
                      class="delete-btn"
                      type="danger" 
                      :icon="Delete"
                      @click="removeFromCart(item)"
                    />
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
          <div class="order-footer">
            <el-button 
              v-if="cart.length" 
              type="primary" 
              size="large"
              class="submit-button"
              @click="handleSubmit" 
              :loading="submitting"
            >
              提交订单
            </el-button>
            <el-empty v-else description="未选择菜品" />
          </div>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Menu, ShoppingCart as ShoppingCartIcon, Minus, Plus, Delete } from '@element-plus/icons-vue'
import DishCard from '@/components/DishCard.vue'
import speech from '@/utils/speech'

const store = useStore()
const loading = ref(false)
const submitting = ref(false)
const dishes = ref([])
const orders = ref([])
const completedItems = ref(new Set())

// 购物车数据
const cart = computed(() => store.state.cart)

// 过滤后的菜品列表
const filteredDishes = computed(() => {
  if (!Array.isArray(dishes.value)) return []
  return dishes.value.filter(dish => dish.status)
})

// 获取菜品列表
const fetchDishes = async () => {
  loading.value = true
  try {
    const response = await store.$api.getDishes()
    dishes.value = Array.isArray(response.data.data) ? response.data.data : []
  } catch (error) {
    console.error('获取菜品列表失败:', error)
    ElMessage.error('获取菜品列表失败')
    dishes.value = []
  } finally {
    loading.value = false
  }
}

// 计算每个菜品的待完成数量
const getPendingCount = (dishId) => {
  let count = 0
  orders.value.forEach(order => {
    if (order.status !== 'completed') {
      order.items.forEach(item => {
        if (item.dish._id === dishId) {
          count += item.quantity - (item.completedQuantity || 0)
        }
      })
    }
  })
  return count
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    const response = await store.$api.getOrders()
    const newOrders = response.data.data
    
    // 只检查未完成的订单
    const pendingOrders = newOrders.filter(order => order.status !== 'completed')
    
    pendingOrders.forEach(order => {
      order.items.forEach(item => {
        const itemKey = `${order._id}-${item.dish._id}`
        const oldItem = orders.value
          .find(o => o._id === order._id)
          ?.items.find(i => i.dish._id === item.dish._id)
        
        // 只有当完成数量增加时才播报
        if (oldItem && item.completedQuantity > oldItem.completedQuantity) {
          const newCompleted = item.completedQuantity - oldItem.completedQuantity
          // 播报新完成的项目
          speech.speak(`已完成${newCompleted}碗${item.dish.name}，请及时取用`)
        }
      })
    })
    
    orders.value = response.data.data
  } catch (error) {
    console.error('获取订单失败:', error)
    orders.value = []
  }
}

// 购物车操作方法
const increaseQuantity = (item) => {
  store.commit('UPDATE_CART_ITEM_QUANTITY', {
    dishId: item._id,
    quantity: item.quantity + 1
  })
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    store.commit('UPDATE_CART_ITEM_QUANTITY', {
      dishId: item._id,
      quantity: item.quantity - 1
    })
  }
}

const removeFromCart = (item) => {
  store.commit('REMOVE_FROM_CART', item._id)
}

// 提交订单
const handleSubmit = async () => {
  if (!cart.value.length) {
    ElMessage.warning('请先选择菜品')
    return
  }

  submitting.value = true
  try {
    const items = cart.value.map(item => ({
      dish: item._id,
      quantity: item.quantity,
      price: item.price
    }))

    await store.$api.createOrder({ items })
    store.commit('CLEAR_CART')
    ElMessage.success('订单提交成功')
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error(error.response?.data?.message || '提交订单失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchDishes()
  fetchOrders()
  // 在用户首次交互时初始化语音
  const initSpeech = () => {
    speech.init()
    document.removeEventListener('click', initSpeech)
  }
  document.addEventListener('click', initSpeech)
  
  // 启动定时更新
  const updateTimer = ref(null)
  updateTimer.value = setInterval(fetchOrders, 5000)
  
  // 组件销毁时清理定时器
  onUnmounted(() => {
    clearInterval(updateTimer.value)
  })
})
</script>

<style scoped>
.customer-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止出现滚动条 */
}

.main-container {
  flex: 1;
  background-color: #f5f7fa;
  overflow: hidden;
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  /* 固定两列 */
  gap: 20px;
  padding: 20px;
  margin-right: 300px;
  /* 自动适应内容高度 */
  min-height: 0;
}

.order-aside {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 300px;
}

.order-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.order-title {
  margin: 0 0 20px 0;
  text-align: center;
  color: #303133;
  font-size: 24px;
  font-weight: bold;
}

.cart-items {
  flex: 1;
  min-height: 0; /* 防止溢出 */
  overflow-y: auto;
  margin-bottom: 20px;
}

.cart-item {
  padding: 15px;
  margin-bottom: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.item-name {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.item-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
}

.quantity-display {
  min-width: 60px;
  height: 60px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.delete-btn{

  transform: translateY(-50px);
}
.order-footer {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background: white;
}

.submit-button {
  width: 100%;
  height: 100px;
  font-size: 32px;
  font-weight: bold;
}

/* DishCard 样式调整 */
:deep(.dish-card) {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

:deep(.dish-card:hover) {
  transform: translateY(-5px);
}

:deep(.dish-image-container) {
  position: relative;
  height: 300px;  /* 减少图片区域高度 */
  overflow: hidden;
  background-color: #f5f5f5;
}

:deep(.dish-image) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.dish-info) {
  padding: 12px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

:deep(.dish-name) {
  font-size: 30px;
  font-weight: bold;
  margin: 8px 0;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.dish-description) {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 8px;
}

:deep(.no-image-text) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #909399;
  font-size: 14px;
  text-align: center;
  width: 100%;
}

/* 过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-leave-active {
  position: absolute;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 加减按钮样式 */
:deep(.el-button-group .el-button) {
  width: 60px;
  height: 60px;
  padding: 0;
  font-size: 24px;
}

/* 删除按钮 */
:deep(.el-button.is-circle) {
  width: 60px;
  height: 60px;
  font-size: 24px;
  padding: 0;
}

/* 确保图标在按钮中居中 */
:deep(.el-icon) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style> 