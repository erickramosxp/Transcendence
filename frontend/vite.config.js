import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Isso aqui libera o acesso externo (0.0.0.0)
    port: 5173,  // Garante que a porta seja a padrão
    watch: {
      usePolling: true // Necessário para o Hot Reload funcionar bem no Docker/WSL
    }
  }
})
