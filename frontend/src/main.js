import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import api from '@/api'

const app = createApp(App)

// 注册全局 API 实例
app.config.globalProperties.$api = api

// 将 API 实例添加到 store
store.$api = api

app
  .use(store)
  .use(router)
  .use(ElementPlus)
  .mount('#app') 