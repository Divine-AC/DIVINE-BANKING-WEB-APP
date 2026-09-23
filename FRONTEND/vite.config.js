import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Explicitly target standard build outputs
    outDir: 'dist',
  },
})