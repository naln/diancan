<template>
  <div v-if="dish.status" class="dish-card" @click="addToCart">
    <div class="dish-image-container">
      <img 
        :src="getImageUrl(dish.image)"
        :alt="dish.name"
        @error="handleImageError"
        class="dish-image"
      />
      <div v-if="showNoImage" class="no-image-text">
        暂无菜品图片
      </div>
      <div v-if="pendingCount > 0" class="pending-count-wrapper">
        <div class="pending-count">
          {{ pendingCount }}
        </div>
        <div class="pending-label">待完成</div>
      </div>
    </div>
    <div class="dish-info">
      <h3 class="dish-name">{{ dish.name }}</h3>
      <div class="dish-description">{{ dish.description }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { getBackendUrl } from '@/utils/config'
import speech from '@/utils/speech'

const props = defineProps({
  dish: {
    type: Object,
    required: true
  },
  pendingCount: {
    type: Number,
    default: 0
  }
})

const store = useStore()

const showNoImage = ref(false)

const addToCart = () => {
  if (props.dish.status) {
    store.commit('ADD_TO_CART', props.dish)
  } else {
    speech.speak('该菜品暂时无法点单')
    ElMessage.warning('该菜品暂时无法点单')
  }
}

// 处理图片URL
const getImageUrl = (image) => {
  if (!image) return '/default-dish.png'
  return `${getBackendUrl()}${image}`
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
  showNoImage.value = true
}
</script>

<style scoped>
.dish-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
  height: 360px;
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

.dish-info {
  padding: 16px;
  height: 100px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dish-name {
  margin: 0;
  font-size: 56px;
  line-height: 1.2;
  font-weight: bold;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 42px;
}

.no-image-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #909399;
  font-size: 14px;
  text-align: center;
  width: 100%;
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
</style> 