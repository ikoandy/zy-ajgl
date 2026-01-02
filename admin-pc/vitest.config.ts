import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: '@vitest/coverage-v8',
      include: ['src/**/*.{vue,ts}'],
      exclude: ['src/main.ts', 'src/App.vue', 'src/router/**/*']
    }
  }
})
