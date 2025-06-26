// @ts-nocheck

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: [
      'e2e/**', 
      '**/*.e2e.*', 
      '**/*.spec.e2e.*',
      'node_modules/**',
      '**/node_modules/**'
    ],
  },
}) 