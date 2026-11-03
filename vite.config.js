import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path './' so assets load properly on GitHub Pages (e.g. username.github.io/SAT/)
  base: './',
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
})
