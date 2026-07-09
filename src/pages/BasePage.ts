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

   /**
   * Abre el menú hamburguesa (drawer) de IMDb. Selector basado en el
   * aria-label del botón, estable y semántico (no depende de clases CSS).
   */
  async openMainMenu(): Promise<void> {
    await this.page.getByLabel('Open navigation drawer').click();
  }
}
