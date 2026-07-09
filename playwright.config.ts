import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL_IMDB ?? 'https://www.imdb.com',
    // IMDb determina el idioma por el header Accept-Language, no por la URL.
    // Forzado a inglés (US) para que los selectores de texto sean estables sin importar el
    // idioma del entorno CI/local.
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // UI:
    { name: 'chromium', testDir: './tests/ui', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: './tests/ui', use: { ...devices['Desktop Firefox'] } },
    // API: // baseURL propia (PokeAPI), no necesita browser.
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.BASE_URL_POKEAPI ?? 'https://pokeapi.co/api/v2/',
      },
    },
  ],
});