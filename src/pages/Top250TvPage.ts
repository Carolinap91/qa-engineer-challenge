import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para "Top 250 TV Shows" de IMDb (/chart/toptv/).
 * Misma estructura de lista que Top Box Office (ambas páginas /chart/
 * comparten componente): div.cli-parent > a.ipc-title-link-wrapper.
 */
export class Top250TvPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToTop250TvShows(): Promise<void> {
    await this.navigateViaMenuHref('/chart/toptv/');
  }

  /**
   * Hace click en un show por TÍTULO (a diferencia de Top Box Office, acá
   * el caso pide una serie puntual, no una posición).
   *
   * `count()` inmediato es racy (la lista tarda en renderizar tras
   * navegar), así que esperamos a que la fila aparezca antes de decidir
   * si el show existe.
   */
  async clickShowByTitle(title: string): Promise<void> {
    const matches = this.getChartItems().filter({
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
