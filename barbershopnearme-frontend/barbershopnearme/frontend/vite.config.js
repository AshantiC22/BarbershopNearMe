import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    // Chunk splitting for faster loading on phones
    rollupOptions: {
      output: {
        manualChunks: {
          react:  ['react','react-dom','react-router-dom'],
          vendor: ['axios'],
        }
      }
    },
    // Warn if chunks > 500kb
    chunkSizeWarningLimit: 500,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
