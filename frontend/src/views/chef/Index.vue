<template>
  <div class="chef-container">
    <el-container class="main-container">
      <el-main>
          <div v-loading="loading">
          <!-- 菜品网格 -->
          <div class="dishes-grid">
            <template v-if="pendingDishes.length">
              <div 
                v-for="dish in pendingDishes" 
                :key="dish.name"
                class="dish-card"
                @click="selectDish(dish)"
              >
                <div class="dish-image-container">
                  <img 
                    :src="getImageUrl(dish.image)"
                    :alt="dish.name"
                    class="dish-image"
                    @error="e => handleImageError(e, dish._id)"
                  />
                  <div v-if="showNoImage[dish._id]" class="no-image-text">
                    暂无菜品图片
                  </div>
                  <div class="pending-count-wrapper">
                    <div class="pending-count">
                      {{ dish.pendingCount }}
                </div>
                    <div class="pending-label">待完成</div>
                  </div>
                </div>
                <div class="dish-info">
                  <h3 class="dish-name">{{ dish.name }}</h3>
                </div>
              </div>
            </template>
            <el-empty v-else description="暂无待完成菜品" />
          </div>
        </div>
      </el-main>

      <!-- 固定在右侧的完成确认 -->
      <el-aside width="300px" class="confirm-aside">
        <div class="confirm-panel">
          <h2 class="confirm-title">完成确认</h2>
          <div class="selected-items">
            <TransitionGroup name="list">
              <div v-if="selectedDish" class="selected-item">
                <div class="item-info">
                  <h3 class="item-name">{{ selectedDish.name }}</h3>
                  <div class="item-quantity">
                    <el-button-group>
                    <el-button 
                        type="primary" 
                        :icon="Minus" 
                        @click="decreaseQuantity"
                        :disabled="completeQuantity <= 1"
                      />
                      <el-button class="quantity-display">
                        {{ completeQuantity }}/{{ selectedDish.pendingCount }}
                    </el-button>
                      <el-button 
                        type="primary" 
                        :icon="Plus" 
                        @click="increaseQuantity"
                        :disabled="completeQuantity >= selectedDish.pendingCount"
                      />
                    </el-button-group>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
          <div class="confirm-footer">
            <el-button 
              v-if="selectedDish"
              type="success"
              size="large"
              class="confirm-button"
              @click="handleComplete"
            >
              确认完成
            </el-button>
            <el-empty v-else description="请选择要完成的菜品" />
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
import { Minus, Plus } from '@element-plus/icons-vue'
import { getBackendUrl } from '@/utils/config'
import speech from '@/utils/speech'

const store = useStore()
const loading = ref(false)
const orders = ref([])
const selectedDish = ref(null)
const completeQuantity = ref(1)
const showNoImage = ref({})  // 用于跟踪每个图片的显示状态
const updateTimer = ref(null)  // 用于存储定时器ID

// 处理图片URL
const getImageUrl = (image) => {
  if (!image) return '/default-dish.png'
  return `${getBackendUrl()}${image}`
}

const handleImageError = (e, dishId) => {
  e.target.style.display = 'none'
  showNoImage.value[dishId] = true
}

// 获取待完成菜品列表
const pendingDishes = computed(() => {
  const dishes = new Map()
  
  orders.value.forEach(order => {
    if (order.status !== 'completed') {
      order.items.forEach(item => {
        const remainingQuantity = item.quantity - (item.completedQuantity || 0)
        if (remainingQuantity > 0) {
          const dish = item.dish
          if (!dishes.has(dish.name)) {
            dishes.set(dish.name, {
              ...dish,
              pendingCount: 0,
              orders: []
            })
          }
          const dishData = dishes.get(dish.name)
          dishData.pendingCount += remainingQuantity
          dishData.orders.push({
            orderId: order._id,
            dishId: item.dish._id,
            quantity: remainingQuantity
          })
        }
      })
    }
  })
  
  return Array.from(dishes.values())
})

// 选择菜品
const selectDish = (dish) => {
  if (selectedDish.value?.name === dish.name) {
    // 如果点击的是同一个菜品，数量加1
    if (completeQuantity.value < selectedDish.value.pendingCount) {
      completeQuantity.value++
    }
  } else {
    // 如果是新菜品，初始化选择
    selectedDish.value = dish
    completeQuantity.value = 1
  }
}

// 调整完成数量
const increaseQuantity = () => {
  if (completeQuantity.value < selectedDish.value.pendingCount) {
    completeQuantity.value++
  }
}

const decreaseQuantity = () => {
  if (completeQuantity.value > 1) {
    completeQuantity.value--
  }
}

// 完成菜品
const handleComplete = async () => {
  if (!selectedDish.value) return
  
  try {
    let completedCount = 0 // 跟踪已完成的数量
    let targetCount = completeQuantity.value // 目标完成数量

    // 遍历所有未完成的订单
    for (const order of orders.value) {
      if (order.status !== 'completed') {
        for (const item of order.items) {
          if (item.dish._id === selectedDish.value._id) {
            const remainingQuantity = item.quantity - (item.completedQuantity || 0)
            if (remainingQuantity > 0 && completedCount < targetCount) {
              const updateQuantity = Math.min(remainingQuantity, targetCount - completedCount)

              try {
                // 更新完成数量
                await store.$api.updateOrderItemQuantity(
                  order._id,
                  item.dish._id,
                  { completedQuantity: updateQuantity }
                )
                completedCount += updateQuantity
                
                // 如果已达到目标数量，退出循环
                if (completedCount >= targetCount) {
                  break
                }
              } catch (error) {
                console.error('更新完成数量失败:', error)
                ElMessage.error('操作失败')
              }
            }
          }
        }
        
        // 如果已达到目标数量，退出外层循环
        if (completedCount >= targetCount) {
          break
        }
      }
    }

    // 重置选择和数量
    selectedDish.value = null
    completeQuantity.value = 1
    
    // 刷新订单列表
    await fetchOrders()
    
    ElMessage.success('操作成功')
  } catch (error) {
    console.error('完成菜品失败:', error)
    ElMessage.error('操作失败')
  }
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    const response = await store.$api.getOrders()
    const newOrders = response.data.data
    
    orders.value = newOrders
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  }
}

// 开始定时更新
const startAutoUpdate = () => {
  // 每30秒更新一次数据
  updateTimer.value = setInterval(fetchOrders, 3000)
}

// 停止定时更新
const stopAutoUpdate = () => {
  if (updateTimer.value) {
    clearInterval(updateTimer.value)
    updateTimer.value = null
  }
}

// 初始化
onMounted(() => {
  fetchOrders()  // 首次获取数据
  startAutoUpdate()  // 开始定时更新
})

// 组件销毁时清理定时器
onUnmounted(() => {
  stopAutoUpdate()
})
</script>

<style scoped>
.chef-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-container {
  flex: 1;
  background-color: #f5f7fa;
  overflow: hidden;
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  margin-right: 300px;
}

.dish-card {
  display: flex;
  flex-direction: column;
  height: 360px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.dish-card:hover {
  transform: translateY(-5px);
}

.dish-image-container {
  position: relative;
  height: 300px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.dish-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pending-count-wrapper {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(245, 108, 108, 0.9);
  border-radius: 8px;
  padding: 10px 15px;
  color: white;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.pending-count {
  font-size: 36px;
  font-weight: bold;
  line-height: 1.2;
}

.pending-label {
  font-size: 16px;
  margin-top: 4px;
}

.dish-info {
  padding: 12px;
  height: 80px;
  display: flex;
  align-items: center;
}

.dish-name {
  font-size: 30px;
  font-weight: bold;
  margin: 0;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.confirm-aside {
  width: 300px;
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.confirm-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.confirm-title {
  margin: 0 0 20px 0;
  text-align: center;
  color: #303133;
  font-size: 24px;
  font-weight: bold;
}

.selected-items {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.selected-item {
  padding: 20px;
  margin-bottom: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.item-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: #303133;
  text-align: center;
}

.item-quantity {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quantity-display {
  min-width: 100px;
  font-size: 20px;
  font-weight: bold;
}

:deep(.el-button-group .el-button) {
  width: 60px;
  height: 60px;
  padding: 0;
  font-size: 24px;
}
.confirm-footer {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background: white;
}

.confirm-button {
  width: 100%;
  height: 100px;
  font-size: 32px;
  font-weight: bold;
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
</style> 