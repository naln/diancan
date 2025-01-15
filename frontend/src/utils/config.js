// 获取后端地址
export const getBackendUrl = () => {
  return window.APP_CONFIG?.API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
} 