<template>
  <div class="customer-container">
    <div v-loading="loading">
      <div v-if="dishes.length > 0" class="dishes-grid">
        <div v-for="dish in dishes" :key="dish._id" class="dish-card">
          <el-card :body-style="{ padding: '0px' }">
            <img :src="dish.image" class="dish-image" />
            <div class="dish-info">
              <h3>{{ dish.name }}</h3>
              <div class="dish-price">¥{{ dish.price }}</div>
              <div class="dish-description">{{ dish.description }}</div>
              <el-button type="primary" @click="addToCart(dish)">
                加入购物车
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
      <el-empty v-else description="暂无菜品" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

const store = useStore()
const dishes = ref([])
const loading = ref(false)

// 获取菜品列表
const fetchDishes = async () => {
  loading.value = true
  try {
    const response = await store.$api.getDishes()
    console.log('获取菜品响应:', response)
    
    if (response.data?.success && Array.isArray(response.data.data)) {
      dishes.value = response.data.data
      console.log('设置菜品数据:', dishes.value)
    } else {
      dishes.value = []
      throw new Error('获取菜品失败')
    }
  } catch (error) {
    console.error('获取菜品列表失败:', error)
    ElMessage.error('获取菜品列表失败')
    dishes.value = []
  } finally {
    loading.value = false
  }
}

// 添加到购物车
const addToCart = (dish) => {
  store.commit('ADD_TO_CART', dish)
}

onMounted(() => {
  console.log('组件挂载，开始获取菜品') // 添加调试日志
  fetchDishes()
})
</script>

<style scoped>
.customer-container {
  padding: 20px;
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.dish-card {
  transition: transform 0.3s;
}

.dish-card:hover {
  transform: translateY(-5px);
}

.dish-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.dish-info {
  padding: 14px;
}

.dish-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
  margin: 10px 0;
}

.dish-description {
  color: #666;
  margin-bottom: 10px;
}
</style> 