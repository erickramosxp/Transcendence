import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: true,  // Isso aqui libera o acesso externo (0.0.0.0)
    port: 5173,  // Garante que a porta seja a padrão
    watch: {
      usePolling: true // Necessário para o Hot Reload funcionar bem no Docker/WSL
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
