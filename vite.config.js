import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@data': fileURLToPath(new URL('./data', import.meta.url)),
      '@assets': fileURLToPath(new URL('./assets', import.meta.url)),
      '@js': fileURLToPath(new URL('./js', import.meta.url)),
    },
  },
})