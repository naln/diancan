<template>
  <el-drawer
    v-model="drawerVisible"
    title="购物车"
    :size="400"
  >
    <div class="cart-content">
      <div v-if="cart.length" class="cart-items">
        <TransitionGroup name="list">
          <div v-for="item in cart" :key="item._id" class="cart-item">
            <div class="item-info">
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <div class="item-price">¥{{ item.price }}</div>
              </div>
            </div>
            <div class="item-actions">
              <el-button-group>
                <el-button 
                  type="primary" 
                  :icon="Minus" 
                  @click="decreaseQuantity(item)"
                  :disabled="item.quantity <= 1"
                />
                <el-button>{{ item.quantity }}</el-button>
                <el-button 
                  type="primary" 
                  :icon="Plus" 
                  @click="increaseQuantity(item)"
                />
              </el-button-group>
              <el-button 
                type="danger" 
                :icon="Delete"
                @click="removeFromCart(item)"
              />
            </div>
          </div>
        </TransitionGroup>
      </div>
      <el-empty v-else description="购物车为空" />

      <div v-if="cart.length" class="cart-footer">
        <div class="total">
          总计: <span class="total-price">¥{{ total }}</span>
        </div>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { Delete, Plus, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 添加 showNoImage 的定义
const showNoImageMap = ref({})  // 使用 Map 来跟踪每个商品的图片状态

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:visible'])

const store = useStore()

const drawerVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const cart = computed(() => store.state.cart)

const total = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

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

const handleSubmit = async () => {
  try {
    // 转换购物车数据为订单格式
    const items = store.state.cart.map(item => ({
      dish: item._id,
      quantity: item.quantity,
      price: item.price
    }))

    // 添加数据验证
    if (!items.length) {
      ElMessage.warning('购物车为空')
      return
    }

    // 验证数据完整性
    const isValid = items.every(item => item.dish && item.quantity && item.price)
    if (!isValid) {
      ElMessage.error('订单数据不完整')
      return
    }

    await store.$api.createOrder({ items })
    
    // 清空购物车
    store.commit('CLEAR_CART')
    drawerVisible.value = false
    ElMessage.success('订单提交成功')
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error(error.response?.data?.message || '提交订单失败')
  }
}

// 处理图片URL
const getImageUrl = (image) => {
  if (!image) return '/default-dish.png'
  // 如果已经是完整的URL，直接返回
  if (image.startsWith('http')) return image
  // 如果是相对路径，添加后端服务器地址
  return `${process.env.VITE_BACKEND_URL || 'http://localhost:3000'}${image}`
}

// 修改图片错误处理函数
const handleImageError = (e, itemId) => {
  e.target.style.display = 'none'
  showNoImageMap.value[itemId] = true
}
</script>

<style scoped>
.cart-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.item-info {
  display: flex;
  align-items: center;
}

.item-details {
  flex: 1;
}

.item-price {
  color: #f56c6c;
  font-weight: bold;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-footer {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
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