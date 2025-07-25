import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  publicDir: 'public',
  // Add SPA fallback for client-side routing
  preview: {
    port: 5173,
    host: true
  }
}) 