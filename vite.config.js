import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path './' so assets work whether deployed at
  // username.github.io/SAT/ or custom domain or local
  base: './',
})
