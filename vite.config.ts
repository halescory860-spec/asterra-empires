import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project Pages URL: https://<user>.github.io/asterra-empires/
export default defineConfig({
  base: '/asterra-empires/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
