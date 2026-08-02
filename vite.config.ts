import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base helps iOS Safari / home-screen installs on varied hosts.
export default defineConfig({
  base: './',
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
