<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <h3>菜品管理</h3>
        <div class="header-actions">
          <el-button type="primary" @click="handleAddDish">
            添加菜品
          </el-button>
        </div>
      </div>
    </template>

    <div v-loading="loading">
      <el-table :data="dishes" style="width: 100%">
        <el-table-column prop="name" label="菜品名称" />
        <el-table-column prop="price" label="价格">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="primary" 
                @click="handleEditDish(row)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                @click="handleDeleteDish(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 使用 DishForm 组件 -->
    <dish-form
      v-model:visible="showDishDialog"
      :dish="currentDish"
      @submit="handleDishSubmit"
    />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import DishForm from './DishForm.vue'

const store = useStore()
const loading = ref(false)
const dishes = ref([])
const showDishDialog = ref(false)
const currentDish = ref(null)

// 获取菜品列表
const fetchDishes = async () => {
  loading.value = true
  try {
    const response = await store.$api.getDishes()
    dishes.value = response.data.data
  } catch (error) {
    ElMessage.error('获取菜品列表失败')
  } finally {
    loading.value = false
  }
}

// 添加菜品
const handleAddDish = () => {
  currentDish.value = null
  showDishDialog.value = true
}

// 编辑菜品
const handleEditDish = (dish) => {
  currentDish.value = { ...dish }
  showDishDialog.value = true
}

// 删除菜品
const handleDeleteDish = async (dish) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个菜品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await store.$api.deleteDish(dish._id)
    ElMessage.success('删除成功')
    fetchDishes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 更新菜品状态
const handleStatusChange = async (dish) => {
  try {
    await store.$api.updateDish(dish._id, { status: dish.status })
    ElMessage.success('更新成功')
  } catch (error) {
    dish.status = !dish.status  // 恢复状态
    ElMessage.error('更新失败')
  }
}

// 处理表单提交
const handleDishSubmit = async (formData) => {
  try {
    if (currentDish.value) {
      await store.$api.updateDish(currentDish.value._id, formData)
      ElMessage.success('更新成功')
    } else {
      const response = await store.$api.addDish(formData)
      if (response.data.success) {
        ElMessage.success('添加成功')
        showDishDialog.value = false
        fetchDishes()
      } else {
        throw new Error(response.data.message || '添加失败')
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败，请重试')
    return false // 阻止对话框关闭
  }
  return true // 允许对话框关闭
}

onMounted(() => {
  fetchDishes()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}
</style> 