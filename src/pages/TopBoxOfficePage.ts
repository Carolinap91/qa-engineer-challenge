import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la sección "Top Box Office" de IMDb.
 * URL de referencia: /chart/boxoffice/
 */
export class TopBoxOfficePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToTopBoxOffice(): Promise<void> {
    await this.navigateViaMenuHref('/chart/boxoffice/');
  }

  /**
   * Hace click en el 2do ítem de la lista. Selección por POSICIÓN, no por
   * título: el ranking cambia cada semana.
   */
  async clickSecondListItem(): Promise<void> {
    await this.getChartItems().nth(1).locator('a.ipc-title-link-wrapper').click();
  }

  /**
   * Hace click en "IMDb Rating" del hero, navega a /title/{id}/ratings/.
   * `.first()` porque IMDb duplica este bloque en el DOM (variante
   * responsive oculta) — strict mode violation sin acotar.
   */
  async clickImdbRating(): Promise<void> {
    await this.page
      .locator('[data-testid="hero-rating-bar__aggregate-rating"]')
      .first()
      .click();
  }

  /**
   * Abre el modal de rating. El aria-label real es "Rate {título}"
   * (dinámico), por eso se matchea por regex de prefijo en vez de texto
   * exacto. Reintenta vía clickWithRetry (BasePage) por el mismo
   * hydration lag que "Upcoming" en el Caso 1.
   */
  async clickRateButton(): Promise<void> {
    const rateTrigger = this.page.getByRole('button', { name: /^Rate\s/ }).first();
    const dialog = this.page.getByRole('dialog');

    await this.clickWithRetry(
      rateTrigger,
      () => dialog.waitFor({ state: 'visible', timeout: 5_000 }),
      { failureMessage: 'No se pudo abrir el modal de rating tras 3 intentos' }
    );
  }

  /**
   * Selecciona una calificación (1-10 estrellas) y confirma.
   *
   * Interacción por TECLADO (focus + Enter), no click de mouse: una capa
   * invisible (ipc-starbar__touch) intercepta los clicks físicos sobre las
   * estrellas. El botón de confirmación es una clase CSS
   * (ipc-rating-prompt__rate-button), no un data-testid.
   */
  async rateWithStars(stars: number): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const starButton = dialog.getByRole('button', { name: `Rate ${stars}`, exact: true });
    await starButton.focus();
    await starButton.press('Enter');

    await dialog.getByRole('button', { name: 'Rate', exact: true }).click();
  }
}
