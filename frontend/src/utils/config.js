// 获取后端地址
export const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || window.APP_CONFIG?.API_URL || 'http://localhost:3000'
} 