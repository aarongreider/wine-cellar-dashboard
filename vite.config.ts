import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: 'https://aaron.greider.org/wine-cellar-dashboard/dist/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        dir: './dist/',
        entryFileNames: 'script.js',
        assetFileNames: 'style.css',
      }
    }
  }
})
