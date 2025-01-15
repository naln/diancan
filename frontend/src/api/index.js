import axios from 'axios'
import { getBackendUrl } from '@/utils/config'

const api = axios.create({
  baseURL: getBackendUrl(),
  timeout: 5000,
  validateStatus: function (status) {
    return status >= 200 && status < 600  // 不要让 axios 自动拒绝任何状态码
  },
  withCredentials: false  // 不发送 cookie
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.error('API错误:', error)
    return Promise.reject({
      response: {
        data: {
          message: error.message || '请求失败'
        }
      }
    })
  }
)

export default {
  // 认证相关
  login: credentials => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  
  // 菜品相关
  getDishes: () => api.get('/api/dishes'),
  getDishById: (id) => api.get(`/api/dishes/${id}`),
  addDish: data => api.post('/api/admin/dishes', data),
  updateDish: (id, data) => api.put(`/api/admin/dishes/${id}`, data),
  deleteDish: id => api.delete(`/api/admin/dishes/${id}`),
  
  // 订单相关
  createOrder: data => api.post('/api/orders', data),
  getOrders: () => api.get('/api/orders'),
  updateOrderStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
  updateOrderQuantity: (id, data) => api.put(`/api/orders/${id}/quantity`, data),
  
  // 更新订单菜品完成数量
  updateOrderItemQuantity(orderId, dishId, data) {
    return api.put(`/api/orders/${orderId}/items/${dishId}/complete`, data)
  },
  
  // 统计相关
  getStatistics: (params) => api.get('/api/admin/statistics', { params }),
  
  // 用户管理
  getUsers: () => api.get('/api/admin/users'),
  createUser: (data) => api.post('/api/admin/users', data),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`)
} 