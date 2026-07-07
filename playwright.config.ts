import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * playwright-bdd genera specs de Playwright a partir de los .feature files.
 * Los steps quedan en step-definitions/, separados por dominio (ui / api).
 * Decisión técnica: un solo framework (Playwright) para UI y API en vez de
 * Cypress+Playwright, para simplificar mantenimiento, CI y reporting.
 * Ver README > "Decisiones técnicas" para el detalle.
 */
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'step-definitions/**/*.ts',
});

export default defineConfig({
  testDir,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    cucumberReporter('html', { outputFile: 'cucumber-report/report.html' }),
  ],
  use: {
    baseURL: process.env.BASE_URL_IMDB ?? 'https://www.imdb.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // UI - requerido: correr en Chrome y Firefox
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /.*api.*/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: /.*api.*/ },
    // API - no necesita browser, corre una sola vez
    { name: 'api', use: {}, testMatch: /.*api.*/ },
  ],
});
