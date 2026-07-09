import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la barra de búsqueda global de IMDb (home page).
 */

export class SearchPage extends BasePage {
  private readonly searchInput = this.page.getByTestId('suggestion-search');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Escribe el nombre en el buscador y presiona Enter para ir a /find.
   * Luego hace click en el primer resultado cuyo aria-label coincida
   * exactamente con el nombre buscado (perfil de persona, no película).
   */
  async searchAndOpenActor(name: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.searchInput.press('Enter');

    // En la página /find, el perfil del actor aparece como un <a> con
    // aria-label igual al nombre exacto, dentro de ipc-lockup-overlay.
    // Tomamos el primero que coincida (Exact matches section).
    const profileLink = this.page
      .locator('a.ipc-lockup-overlay')
      .filter({ hasText: '' })
      .and(this.page.locator(`[aria-label="${name}"]`))
      .first();

    await profileLink.click();
  }
}