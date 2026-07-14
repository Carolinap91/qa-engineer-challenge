import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la sección "Top 250 TV Shows" de IMDb.
 * URL de referencia: /chart/toptv/
 *
 * Selector del link de menú (a[href*="/chart/toptv/"]) confirmado contra el
 * DOM real: <a role="menuitem" href="/chart/toptv/?ref_=hm_nv_menu"
 * aria-label="Go to Top 250 TV Shows">.
 *
 * Estructura de la lista también confirmada contra el DOM real: idéntica a
 * Top Box Office — div.cli-parent > ... > a.ipc-title-link-wrapper con el
 * título en h4.ipc-title__text. Ambas páginas /chart/ comparten componente.
 */
export class Top250TvPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Despliega el menú principal y navega a "Top 250 TV Shows".
   * Selector por href (mismo patrón que Top Box Office): el drawer de IMDb
   * no sincroniza aria-hidden correctamente, así que getByRole() no sirve.
   */
  async navigateToTop250TvShows(): Promise<void> {
    await this.openMainMenu();
    await this.page.locator('a[href*="/chart/toptv/"]').first().click();
  }

  /**
   * Hace click en un show del ranking por TÍTULO exacto (a diferencia de
   * Top Box Office, acá el caso pide una serie puntual — "Breaking Bad" —
   * no una posición, así que sí tiene sentido buscar por texto en vez de nth).
   *
   * Bounds-checking para el caso border "show inexistente": un `count()`
   * inmediato es racy (la lista tarda en renderizar tras la navegación, así
   * que `count()` puede leer 0 solo por timing, no por ausencia real —
   * rompía el caso feliz de forma intermitente). Esperamos explícitamente
   * (timeout acotado) a que la fila aparezca antes de decidir si el show
   * existe o no.
   */
  async clickShowByTitle(title: string): Promise<void> {
    const items = this.page.locator('[data-testid="chart-layout-main-column"] .cli-parent');
    const matches = items.filter({
      has: this.page.locator('a.ipc-title-link-wrapper', { hasText: title }),
    });

    try {
      await matches.first().waitFor({ state: 'visible', timeout: 10_000 });
    } catch {
      throw new Error(`No se encontró el show "${title}" en el Top 250 TV Shows.`);
    }

    await matches.first().locator('a.ipc-title-link-wrapper').click();
  }
}
