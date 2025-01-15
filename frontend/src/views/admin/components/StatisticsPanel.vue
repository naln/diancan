<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <h3>销量统计</h3>
        <div class="header-actions">
          <!-- 分开的日期选择器 -->
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="开始日期"
            :default-value="new Date()"
            value-format="YYYY-MM-DD"
          />
          <span class="date-separator">至</span>
          <el-date-picker
            v-model="endDate"
            type="date"
            placeholder="结束日期"
            :default-value="new Date()"
            value-format="YYYY-MM-DD"
          />
          <!-- 查询按钮 -->
          <el-button type="primary" @click="fetchStatistics">
            查询
          </el-button>
          <el-button type="success" @click="exportData">
            导出数据
          </el-button>
        </div>
      </div>
    </template>

    <div v-loading="loading">
      <!-- 总销量统计 -->
      <div class="total-stats">
        <el-card shadow="hover">
          <div class="total-header">
            <div class="total-content">
              <span class="total-label">总销量：</span>
              <span class="total-value">{{ totalQuantity }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 菜品销量统计 -->
      <el-table :data="dishSalesList" stripe>
        <el-table-column prop="name" label="菜品名称" />
        <el-table-column prop="quantity" label="销售数量" sortable />
        <el-table-column label="占比" width="180">
          <template #default="{ row }">
            <el-progress 
              :percentage="calculatePercentage(row.quantity)"
              :format="(p) => p + '%'"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { exportToExcel } from '@/utils/export'

const store = useStore()
const loading = ref(false)
// 分开的日期选择
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const statistics = ref({
  dishStats: {}
})

// 将菜品销量对象转换为数组形式，方便表格展示
const dishSalesList = computed(() => {
  if (!statistics.value?.dishStats) return []
  
  return Object.entries(statistics.value.dishStats)
    .map(([id, stats]) => ({
      id,
      name: stats.name,
      quantity: stats.quantity
    }))
    .sort((a, b) => b.quantity - a.quantity)
})

// 获取统计数据
const fetchStatistics = async () => {
  loading.value = true
  try {
    // 验证日期
    if (!startDate.value || !endDate.value) {
      ElMessage.warning('请选择开始日期和结束日期')
      return
    }
    
    // 确保开始日期不大于结束日期
    if (startDate.value > endDate.value) {
      ElMessage.warning('开始日期不能大于结束日期')
      return
    }

    // 处理日期范围，结束日期设为当天的最后一刻
    const endDateTime = new Date(endDate.value)
    endDateTime.setHours(23, 59, 59, 999)

    const response = await store.$api.getStatistics({
      startDate: startDate.value,
      endDate: endDateTime.toISOString()
    })

    if (response.data.success) {
      statistics.value = response.data.data
    } else {
      throw new Error(response.data.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
    statistics.value = { dishStats: {} }
  } finally {
    loading.value = false
  }
}

// 导出数据
const exportData = () => {
  try {
    if (!dishSalesList.value.length) {
      ElMessage.warning('没有可导出的数据')
      return
    }

    const data = [
      ['统计时间', `${startDate.value} 至 ${endDate.value}`],
      ['总销量', totalQuantity.value],
      [], // 空行分隔
      ['菜品名称', '销售数量', '占比'],
      ...dishSalesList.value.map(dish => [
        dish.name,
        dish.quantity,
        `${calculatePercentage(dish.quantity)}%`
      ])
    ]
    
    const fileName = `菜品销量统计(${startDate.value}至${endDate.value})`
    exportToExcel(data, fileName)
  } catch (error) {
    console.error('Export error:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 初始化时加载当天数据
onMounted(() => {
  fetchStatistics()
})

const totalQuantity = computed(() => {
  return dishSalesList.value.reduce((sum, dish) => sum + dish.quantity, 0)
})

// 计算百分比
const calculatePercentage = (quantity) => {
  if (!totalQuantity.value) return 0
  return Number(((quantity / totalQuantity.value) * 100).toFixed(1))
}
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.date-separator {
  color: #606266;
}

:deep(.el-date-editor.el-input) {
  width: 180px;
}

.total-stats {
  margin-bottom: 20px;
}

.total-header {
  display: flex;
  justify-content: flex-start;
  padding: 12px 20px;
}

.total-content {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-label {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}

.total-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  line-height: 1;
}
</style> 