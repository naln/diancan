<template>
  <el-dialog
    :title="dish ? '编辑菜品' : '添加菜品'"
    v-model="dialogVisible"
    width="500px"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number 
          v-model="form.price" 
          :precision="2" 
          :step="0.1" 
          :min="0"
        />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input 
          v-model="form.description"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="图片" prop="image">
        <el-upload
          class="avatar-uploader"
          :action="`${getBackendUrl()}/api/admin/upload`"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          accept=".jpg,.jpeg,.png,.gif"
        >
          <img v-if="form.image" :src="getImageUrl(form.image)" class="avatar">
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 JPG/PNG/GIF 格式图片，且不超过 2MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch v-model="form.status" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getBackendUrl } from '@/utils/config'

const props = defineProps({
  visible: Boolean,
  dish: Object
})

const emit = defineEmits(['update:visible', 'submit'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const formRef = ref(null)
const form = ref({
  name: '',
  price: 0,
  description: '',
  image: '',
  status: true
})

const rules = {
  name: [
    { required: true, message: '请输入菜品名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ]
}

// 监听 dish 变化，更新表单数据
watch(() => props.dish, (newDish) => {
  if (newDish) {
    form.value = { ...newDish }
  } else {
    form.value = {
      name: '',
      price: 0,
      description: '',
      image: '',
      status: true
    }
  }
}, { immediate: true })

// 上传相关
const beforeUpload = (file) => {
  // 严格限制图片类型
  const allowedTypes = {
    'image/jpeg': '.jpg,.jpeg',
    'image/png': '.png',
    'image/gif': '.gif'
  }
  
  const isValidType = Object.keys(allowedTypes).includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isValidType) {
    ElMessage({
      message: `只能上传以下格式的图片：${Object.values(allowedTypes).join('/')}`,
      type: 'error',
      duration: 5000,
      showClose: true
    })
    return false
  }
  if (!isLt2M) {
    ElMessage({
      message: '图片大小不能超过 2MB!',
      type: 'error',
      duration: 3000
    })
    return false
  }
  return true
}

const handleUploadSuccess = (response) => {
  if (response.success) {
    form.value.image = response.data.path
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

const handleUploadError = () => {
  ElMessage.error('上传失败，请重试')
}

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${getBackendUrl()}${path}`
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...form.value })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style> 