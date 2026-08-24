import { defineConfig } from '@playwright/test'

/**
 * Playwright E2E — territorio del orquestador (raíz del monorepo).
 *
 * Desde Spec 10, la pantalla de búsqueda consume el backend real, así que
 * el runner arranca **ambos** procesos: el backend (`@scryland/api`, Nest en
 * :3000) y el frontend (`@scryland/web`, Vite en :5173, cuyo proxy rutea
 * `/api` → :3000). El backend lee su `.env` de la raíz del monorepo.
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
  webServer: [
    {
      command: 'pnpm --filter @scryland/api start:dev',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @scryland/web dev --strictPort',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
})
