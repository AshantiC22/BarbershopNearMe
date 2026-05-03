import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react','react-dom','react-router-dom'],
        }
      }
    }
  },
  resolve: {
    alias: {
      // @ maps to src/ — lets you write import from '@/components/...'
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    // proxy API calls to Django backend during dev
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
