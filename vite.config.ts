import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? 'https://aaron.greider.org/wine-cellar-dashboard/dist/' : '/',
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          dir: './dist/',
          entryFileNames: 'scripts.js',
          assetFileNames: 'styles.css',
        }
      }
    }
  };
});