import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('html5-qrcode')) return 'html5-qrcode';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('lucide-react')) return 'lucide-react';
            if (id.includes('gsap')) return 'gsap';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
