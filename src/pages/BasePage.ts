import { Page } from '@playwright/test';

/**
 * Clase base para todos los Page Objects de IMDb.
 * Centraliza navegación y helpers reutilizables (menú, waits, etc.)
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async openMainMenu(): Promise<void> {
    // TODO: implementar apertura del menú hamburguesa de IMDb
  }
}
