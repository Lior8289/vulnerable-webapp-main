import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.PNG'], // include uppercase PNG files as assets
  server: {
    proxy: {
      '/api': 'https://communication-ltd-9gwa.onrender.com'
    }
  }
})

