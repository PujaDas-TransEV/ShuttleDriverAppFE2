/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['fe.driver.shuttleapp.transev.site'],
    cors: {
      origin: ['https://fe.driver.shuttleapp.transev.site'],
    },
  },
  preview: {
    allowedHosts: ['fe.driver.shuttleapp.transev.site'],
    cors: {
      origin: ['https://fe.driver.shuttleapp.transev.site'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})