<template>
  <el-card class="statistic-card" :body-style="{ padding: '20px' }">
    <div class="statistic-content">
      <div class="statistic-value">
        <span class="prefix">{{ prefix }}</span>
        <span class="number">{{ value }}</span>
        <span class="suffix">{{ suffix }}</span>
      </div>
      <div class="statistic-title">{{ title }}</div>
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.statistic-card {
  height: 100%;
}

.statistic-content {
  text-align: center;
}

.statistic-value {
  font-size: 2rem;
  color: #409EFF;
  font-weight: bold;
  line-height: 1.4;
}

.prefix {
  margin-right: 4px;
  font-size: 0.8em;
}

.suffix {
  margin-left: 4px;
  font-size: 0.8em;
}

.statistic-title {
  margin-top: 8px;
  color: #666;
  font-size: 1rem;
}
</style> 