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
   * Busca el nombre y abre el primer resultado cuyo aria-label coincida
   * exacto (perfil de persona, no película).
   *
   * Espera explícitamente a que aparezca (no `count()` inmediato, que es
   * racy justo después de navegar) para distinguir "actor inexistente" de
   * un fallo real.
   */
  async searchAndOpenActor(name: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.searchInput.press('Enter');

    // El perfil aparece como <a class="ipc-lockup-overlay" aria-label="...">.
    const profileLink = this.page
      .locator('a.ipc-lockup-overlay')
      .and(this.page.locator(`[aria-label="${name}"]`))
      .first();

    try {
      await profileLink.waitFor({ state: 'visible', timeout: 10_000 });
    } catch {
      throw new Error(`No se encontró un perfil de actor/actriz para "${name}".`);
    }

    await profileLink.click();
  }
}
