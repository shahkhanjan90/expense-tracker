import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SCRIPT_BASE_URL =
  'https://script.google.com/macros/s/AKfycbwEQbN1F1h5kFVlIVmzuOj0ZR2G2D0pnybDAYWqB10JspEvgCJGlJ8yNiqlfiY0_fE/exec'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: SCRIPT_BASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
