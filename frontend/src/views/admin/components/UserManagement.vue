<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <h3>用户管理</h3>
        <div class="header-actions">
          <el-button type="primary" @click="handleAddUser">
            添加用户
          </el-button>
        </div>
      </div>
    </template>

    <div v-loading="loading">
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'success'">
              {{ row.role === 'admin' ? '管理员' : '厨师' }}
            </el-tag>
          </template>
        </el-table-column>
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
                @click="handleEditUser(row)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                @click="handleDeleteUser(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 用户表单对话框 -->
    <el-dialog
      :title="editingUser ? '编辑用户' : '添加用户'"
      v-model="showUserDialog"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role">
            <el-option label="管理员" value="admin" />
            <el-option label="厨师" value="chef" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="userForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUserDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUserSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useStore()
const loading = ref(false)
const users = ref([])
const showUserDialog = ref(false)
const editingUser = ref(null)
const userFormRef = ref(null)

const userForm = ref({
  username: '',
  password: '',
  role: 'chef',
  status: true
})

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await store.$api.getUsers()
    users.value = response.data.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 添加用户
const handleAddUser = () => {
  editingUser.value = null
  userForm.value = {
    username: '',
    password: '',
    role: 'chef',
    status: true
  }
  showUserDialog.value = true
}

// 编辑用户
const handleEditUser = (user) => {
  editingUser.value = user
  userForm.value = {
    ...user,
    password: ''  // 编辑时不显示密码
  }
  showUserDialog.value = true
}

// 删除用户
const handleDeleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个用户吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await store.$api.deleteUser(user._id)
    ElMessage.success('删除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 更新用户状态
const handleStatusChange = async (user) => {
  try {
    if (!user.status) {
      // 如果是禁用操作，显示确认提示
      await ElMessageBox.confirm(
        '禁用后该用户将无法登录，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    }
    
    await store.$api.updateUser(user._id, { status: user.status })
    ElMessage.success(user.status ? '已启用用户' : '已禁用用户')
  } catch (error) {
    if (error !== 'cancel') {
      user.status = !user.status  // 恢复状态
      ElMessage.error('操作失败')
    }
  }
}

// 提交用户表单
const handleUserSubmit = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    
    if (editingUser.value) {
      await store.$api.updateUser(editingUser.value._id, userForm.value)
      ElMessage.success('更新成功')
    } else {
      await store.$api.createUser(userForm.value)
      ElMessage.success('添加成功')
    }
    
    showUserDialog.value = false
    fetchUsers()
  } catch (error) {
    console.error('表单提交失败:', error)
  }
}

onMounted(() => {
  fetchUsers()
})
</script> 