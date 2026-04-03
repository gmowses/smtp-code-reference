import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/smtp-code-reference/',
  plugins: [react(), tailwindcss()],
})
