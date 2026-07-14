import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para "Advanced name search" (donde aterriza "Born Today").
 * Genérico a propósito: los Casos 4 y 5 comparten esta mecánica de filtro,
 * solo cambia la fecha — por eso los métodos la reciben como parámetro.
 */
export class AdvancedNameSearchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navega a "Born Today" desde el menú. Interacción por teclado (focus +
   * Enter) porque el click de mouse nunca se resuelve: una capa del drawer
   * intercepta el punto de click aunque el link sea visible (mismo bug que
   * las estrellas de rating del Caso 2).
   */
  async navigateToBornToday(): Promise<void> {
    await this.openMainMenu();

    // getByLabel confirmado con Playwright Inspector; el selector por href
    // nunca llegaba a "attached" pese a existir en el DOM estático.
    const bornTodayLink = this.page.getByLabel('Go to Born today');
    await bornTodayLink.waitFor({ state: 'attached' });
    await bornTodayLink.focus();
    await bornTodayLink.press('Enter');
  }

  /**
   * Remueve el chip "Birthday" (fecha de hoy) que IMDb aplica por defecto.
   * Match por prefijo (^=) porque el data-testid incluye la fecha del día.
   */
  async clearDefaultBirthdayFilter(): Promise<void> {
    await this.page.locator('[data-testid^="selected-input-chip-list-birthday-"]').click();
  }

  /**
   * Escribe una fecha en el campo "Birthday" SIN confirmar con "See
   * results". Separado de `searchByBirthday()` para el caso border de
   * fecha inválida (ej. 30 de febrero): ese input deja "See results"
   * permanentemente disabled en vez de devolver 0 resultados, así que
   * forzar el click ahí cuelga el test — lo que hay que validar es
   * justamente que el botón nunca se habilita.
   */
  async typeBirthday(monthDay: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Expand Birthday' }).click();

    // pressSequentially() (no fill()) porque la validación que habilita
    // "See results" depende de eventos de tecla reales, no del valor final.
    const birthdayInput = this.page.locator('[data-testid="birthday-input-test-id"]');
    await birthdayInput.pressSequentially(monthDay);
    await birthdayInput.press('Tab'); // blur explícito, la validación también reacciona a esto
  }

  /**
   * Locator del botón "See results", expuesto para que los tests validen
   * su estado (enabled/disabled) sin necesariamente hacer click.
   */
  getSeeResultsButton(): Locator {
    return this.page.locator('[data-testid="adv-search-get-results"]');
  }

  /**
   * Locator de los resultados de búsqueda (1-indexed vía .nth() en los
   * callers). Centralizado acá porque el selector se usa en más de un lugar.
   */
  private getResultItems(): Locator {
    return this.page.locator('li.ipc-metadata-list-summary-item');
  }

  /** Espera a que "See results" esté visible y confirma la búsqueda. */
  private async submitSearch(): Promise<void> {
    const seeResultsButton = this.getSeeResultsButton();
    await seeResultsButton.waitFor({ state: 'visible' });
    await seeResultsButton.click();
  }

  /**
   * Busca personas por fecha de nacimiento (MM-DD, sin año) con el filtro
   * "Birthday". No existe un preset "Celebrities born yesterday" en la UI
   * real — hay que tipear la fecha calculada por el caller.
   */
  async searchByBirthday(monthDay: string): Promise<void> {
    await this.typeBirthday(monthDay);
    await this.submitSearch();
  }

  /**
   * Busca por rango de fecha de nacimiento COMPLETA (con año), usando
   * "Birth date" — distinto de "Birthday" (Caso 4), que no incluye año.
   * Es el filtro correcto para calcular una edad exacta.
   */
  async searchByBirthDateRange(fromISO: string, toISO: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Expand Birth date' }).click();

    const dateInputs = this.page.locator(
      '#accordion-item-birthDateAccordion input[type="date"]'
    );
    await dateInputs.nth(0).fill(fromISO);
    await dateInputs.nth(1).fill(toISO);
    await dateInputs.nth(1).press('Tab'); // blur, mismo motivo que en typeBirthday()

    await this.submitSearch();
  }

  /**
   * Hace click en el N-ésimo resultado (1-indexed). Selección por posición
   * porque la lista depende del filtro y del orden (popularidad).
   *
   * `count()` inmediato es racy (la lista puede no haber renderizado
   * todavía), así que primero esperamos a que aparezca al menos un
   * resultado antes de contar y decidir si la posición pedida existe.
   */
  async clickNthResult(position: number): Promise<void> {
    const items = this.getResultItems();
    await items.first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {
      // Sin resultados genuinamente (ej. fecha inválida): count() dará 0.
    });

    const count = await items.count();
    if (position > count) {
      throw new Error(
        `No se puede hacer click en el resultado #${position}: la búsqueda solo devolvió ${count} resultado(s).`
      );
    }
    await items.nth(position - 1).locator('a.ipc-title-link-wrapper').click();
  }

  /**
   * Hace click en el primer link de la DESCRIPCIÓN del N-ésimo resultado
   * (no en el nombre) — comportamiento condicional del Caso 5 ("si existe
   * alguno"), no es un error si no hay link.
   *
   * @returns true si encontró y clickeó un link, false si no había ninguno.
   */
  async clickFirstDescriptionLink(position: number): Promise<boolean> {
    const item = this.getResultItems().nth(position - 1);
    const descriptionLink = item.locator('a.ipc-link').first();

    if ((await descriptionLink.count()) > 0) {
      await descriptionLink.click();
      return true;
    }
    return false;
  }
}
