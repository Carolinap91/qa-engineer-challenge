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
   * Hace click en el 2do ítem de la lista de Top Box Office.
   * Selección por POSICIÓN (no por título): el ranking cambia cada semana,
   * así que usar el nombre de la película haría el test frágil.
   */
  async clickSecondListItem(): Promise<void> {
    const items = this.page.locator('[data-testid="chart-layout-main-column"] .cli-parent');
    await items.nth(1).locator('a.ipc-title-link-wrapper').click();
  }

 /**
   * Hace click en el área "IMDb Rating" del hero de la página de detalle,
   * que navega a /title/{id}/ratings/. Usamos .first() porque IMDb duplica
   * este bloque en el DOM (probablemente una variante responsive oculta),
   * causando "strict mode violation" si no se especifica cuál tomar.
   */
  async clickImdbRating(): Promise<void> {
    await this.page
      .locator('[data-testid="hero-rating-bar__aggregate-rating"]')
      .first()
      .click();
  }

   /**
   * Hace click en el botón "Rate" (en la página de Ratings) que abre el
   * modal de calificación. Su aria-label real es "Rate {título película}"
   * (dinámico, incluye el nombre de la película) — por eso NO se puede usar
   * exact:true con "Rate"; usamos una regex que matchea el prefijo.
   *
   * Reintenta hasta 3 veces vía clickWithRetry (BasePage) — misma causa que
   * el botón "Upcoming" del Caso 1: el click puede no tener efecto si React
   * todavía no conectó su listener.
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
   * Dentro del modal, selecciona una calificación de 1 a 10 estrellas
   * y confirma con el botón "Rate" del modal.
   *
   * Usamos interacción por TECLADO (focus + Enter) en vez de click de mouse:
   * el widget de estrellas tiene una capa invisible (ipc-starbar__touch) que
   * intercepta cualquier click físico de mouse. Enfocar el botón real y
   * presionar Enter dispara un click nativo del navegador sin depender de
   * coordenadas de mouse, evitando el problema de raíz.
   *
   * El botón de confirmación se busca por rol + texto "Rate" (exacto),
   * acotado al dialog: "ipc-rating-prompt__rate-button" es una CLASE CSS,
   * no un data-testid (error de lectura inicial del DOM), por eso el
   * selector anterior nunca encontraba el botón.
   */
  async rateWithStars(stars: number): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const starButton = dialog.getByRole('button', { name: `Rate ${stars}`, exact: true });
    await starButton.focus();
    await starButton.press('Enter');

    await dialog.getByRole('button', { name: 'Rate', exact: true }).click();
  }

}