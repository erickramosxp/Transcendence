/// <reference types="vitest/config" />
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: true,
    // Isso aqui libera o acesso externo (0.0.0.0)
    port: 5173,
    // Garante que a porta seja a padrão
    watch: {
      usePolling: true // Necessário para o Hot Reload funcionar bem no Docker/WSL
    }
  },
  test: {
    projects: [{
      extends: true,
      test: {
        name: 'unit',
        environment: "jsdom",
        globals: true,
        setupFiles: "./src/test/setup.js",
        include: [
          'src/**/*.{test,spec}.{js,jsx,ts,tsx}'
        ],
        exclude: [
          'node_modules/**',
          'dist/**',
          'e2e/**',
          '**/*.e2e.*'
        ]
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        maxWorkers: 1,
        fileParallelism: true,
        testTimeout: 30000,
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          },
          {
            browser: 'firefox'
          }]
        }
      }
    }]
  }
});
