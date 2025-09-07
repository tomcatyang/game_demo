import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // 生成source map用于调试
    sourcemap: true,
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    // 开发服务器配置
    port: 3000,
    open: true,
    cors: true
  },
  preview: {
    // 预览服务器配置
    port: 4173,
    open: true
  }
})
