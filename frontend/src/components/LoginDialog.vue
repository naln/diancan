<template>
  <el-dialog
    v-model="dialogVisible"
    :title="getDialogTitle"
    width="400px"
    center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      ref="formRef"
      :model="loginForm"
      :rules="rules"
      label-width="80px"
      @keyup.enter="handleLogin"
    >
      <el-form-item label="用户名" prop="username">
        <el-input 
          v-model="loginForm.username"
          placeholder="请输入用户名"
          clearable
          autofocus
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          ref="passwordRef"
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
          @keyup.enter="handleLogin"
        />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  type: String  // 'chef' 或 'admin'
})

const emit = defineEmits(['update:visible'])

const store = useStore()
const router = useRouter()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => {
    emit('update:visible', value)
    // 当对话框打开时，加载保存的登录信息
    if (value) {
      const savedInfo = getSavedLoginInfo()
      if (savedInfo) {
        loginForm.value = savedInfo
      }
    }
  }
})

// 获取存储的登录信息
const getSavedLoginInfo = () => {
  const key = `login_${props.type}`
  const savedInfo = localStorage.getItem(key)
  if (savedInfo) {
    try {
      return JSON.parse(savedInfo)
    } catch (e) {
      localStorage.removeItem(key)
    }
  }
  return null
}

// 保存登录信息
const saveLoginInfo = (info) => {
  const key = `login_${props.type}`
  localStorage.setItem(key, JSON.stringify(info))
}

// 清除登录信息
const clearLoginInfo = () => {
  const key = `login_${props.type}`
  localStorage.removeItem(key)
}

const formRef = ref(null)
const passwordRef = ref(null)
const loginForm = ref({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const getDialogTitle = computed(() => {
  const titles = {
    chef: '厨师登录',
    admin: '管理员登录'
  }
  return titles[props.type] || '登录'
})

const handleCancel = () => {
  dialogVisible.value = false
  // 如果没有选择记住密码，清空表单
  if (!loginForm.value.remember) {
    loginForm.value = {
      username: '',
      password: '',
      remember: false
    }
  }
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    console.log('开始登录，表单数据:', {
      ...loginForm.value,
      role: props.type
    })
    
    await formRef.value.validate()
    
    const response = await store.$api.login({
      ...loginForm.value,
      role: props.type
    })

    if (response.data.success) {
      // 登录成功处理
      store.commit('SET_USER', response.data.data.user)
      
      // 如果选择了记住密码，保存登录信息
      if (loginForm.value.remember) {
        saveLoginInfo()
      } else {
        clearLoginInfo()
      }
      
      dialogVisible.value = false
      ElMessage.success('登录成功')
      
      // 根据角色跳转
      if (props.type === 'chef') {
        router.push('/chef')
      } else if (props.type === 'admin') {
        router.push('/admin')
      }
    }else{
      ElMessage.error(response.data.message)

    }
  } catch (error) {
    // 处理错误响应
    console.group('登录错误详情')
    console.error('完整错误对象:', error)
    console.error('错误响应:', error.response)
    console.error('错误状态:', error.response?.status)
    console.error('错误数据:', error.response?.data)
    console.groupEnd()
    
    let errorMessage = '登录失败，请稍后重试'
    let duration = 3000
    let showClose = false
    
    if (error.response) {
      console.log('处理错误响应，状态码:', error.response.status)
      switch (error.response.status) {
        case 403:
          errorMessage = '账号已被禁用，请联系管理员'
          duration = 5000
          showClose = true
          console.log('账号禁用错误')
          break
        case 401:
          errorMessage = '用户名或密码错误'
          console.log('认证错误')
          break
        default:
          errorMessage = error.response.data?.message || errorMessage
          console.log('其他错误:', errorMessage)
      }
    }
    
    console.log('显示错误消息:', {
      message: errorMessage,
      duration,
      showClose
    })
    
    ElMessage({
      message: errorMessage,
      type: 'error',
      duration,
      showClose
    })
    
    // 清空密码
    loginForm.value.password = ''
    // 如果有密码输入框的引用，聚焦它
    if (passwordRef.value) {
      // 使用 nextTick 确保在 DOM 更新后再聚焦
      nextTick(() => {
        passwordRef.value.focus()
      })
    }
  }
}

// 初始化时加载保存的登录信息
onMounted(() => {
  const savedInfo = getSavedLoginInfo()
  if (savedInfo) {
    loginForm.value = savedInfo
  }
})

// 监听 type 变化，切换登录类型时重新加载对应的保存信息
watch(() => props.type, () => {
  const savedInfo = getSavedLoginInfo()
  if (savedInfo) {
    loginForm.value = savedInfo
  } else {
    // 如果没有保存的信息，清空表单
    loginForm.value = {
      username: '',
      password: '',
      remember: false
    }
  }
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
  padding-bottom: 20px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-form-item__label) {
  font-weight: bold;
}

:deep(.el-checkbox) {
  margin-left: 0;
}
</style> 