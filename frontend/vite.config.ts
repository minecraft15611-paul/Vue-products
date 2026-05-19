import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Critters from 'critters'
import fs from 'fs'
import path from 'path'

// 自訂 Vite plugin，build 後用 critters 處理 dist/index.html
function crittersPlugin() {
  return {
    name: 'vite-critters',
    apply: 'build' as const,
    async closeBundle() {
      const critters = new Critters({
        path: path.resolve('./dist'),
        publicPath: '/Vue-products/',
        preload: 'swap',
        pruneSource: false,
      })
      const htmlPath = path.resolve('./dist/index.html')
      const html = fs.readFileSync(htmlPath, 'utf-8')
      const result = await critters.process(html)
      fs.writeFileSync(htmlPath, result)
      console.log('✅ Critters: 關鍵 CSS 已內嵌，非關鍵 CSS 改為非阻塞載入')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    crittersPlugin(),
  ],
  base: '/Vue-products/',
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
            return 'vendor'
          }
        },
      },
    },
  },
})