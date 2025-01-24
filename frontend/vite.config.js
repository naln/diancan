import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    {
      name: 'copy-config',
      closeBundle() {
        // 只复制配置文件
        const config = fs.readFileSync('public/config.js', 'utf-8')
        fs.writeFileSync('dist/config.js', config)
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',  // 允许外部 IP 访问
  },
  build: {
    // 生产环境配置
    chunkSizeWarningLimit: 2000, // 提高代码分割警告阈值
    target: ['es2015', 'safari11'],
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks(id) {
          // 自定义代码分割策略
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    emptyOutDir: true,
    sourcemap: true
  },
  optimizeDeps: {
    include: ['xlsx', 'speech-synthesis']
  }
}) 