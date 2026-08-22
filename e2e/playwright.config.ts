import { defineConfig } from '@playwright/test'

/**
 * Playwright E2E — territorio del orquestador (raíz del monorepo).
 *
 * Levanta el frontend (`@scryland/web`, Vite en :5173) con `webServer` y
 * corre los tests de usabilidad contra él. La pantalla de búsqueda es
 * presentacional (mock data), así que no necesita el backend corriendo.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm --filter @scryland/web dev --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
