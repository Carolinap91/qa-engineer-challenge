import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para "Advanced name search", donde aterriza "Born Today" del
 * menú de IMDb. Genérico a propósito (no específico de una fecha): los
 * Casos 4 y 5 comparten toda esta mecánica de filtro, solo cambia qué
 * fecha se busca — por eso los métodos reciben la fecha como parámetro
 * en vez de tenerla hardcodeada acá.
 */
export class AdvancedNameSearchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navega a "Born Today" desde el menú. Aterriza en /search/name/ con un
   * filtro "Birthday: <fecha de hoy>" ya aplicado por defecto.
   *
   * El link está presente y visible en el DOM (confirmado por trace), pero
   * un click de mouse normal nunca se resuelve como "estable/no-obstruido"
   * — mismo síntoma que el bug de las estrellas de rating del Caso 2 (una
   * capa del propio drawer intercepta el punto de click aunque el elemento
   * sea visualmente accesible). Reintentar reabriendo el menú empeora las
   * cosas: si el drawer ya está abierto, el botón hamburguesa queda tapado
   * por el propio panel y el segundo click nunca se resuelve. La solución
   * es la misma que en el Caso 2: interacción por teclado (focus + Enter),
   * que dispara un click nativo sin depender de coordenadas de mouse.
   */
  async navigateToBornToday(): Promise<void> {
    await this.openMainMenu();

    // Playwright Inspector (Pick locator) confirmó getByLabel como el
    // selector que realmente resuelve contra el DOM en vivo — el selector
    // por href (a[href*="/feature/borntoday/"]) nunca llegaba a "attached",
    // pese a que la inspección manual del DOM estático mostraba ese href.
    // Posible causa: el href real difiere levemente del observado
    // manualmente (ver ambigüedad registrada en el README).
    const bornTodayLink = this.page.getByLabel('Go to Born today');
    await bornTodayLink.waitFor({ state: 'attached' });
    await bornTodayLink.focus();
    await bornTodayLink.press('Enter');
  }

  /**
   * Remueve el chip de filtro "Birthday" que IMDb aplica por defecto (la
   * fecha de hoy). El data-testid incluye la fecha en el propio nombre
   * (ej. "selected-input-chip-list-birthday-07-13"), por eso se matchea
   * por prefijo (^=) en vez de por valor exacto — el valor cambia según
   * el día en que corra el test.
   */
  async clearDefaultBirthdayFilter(): Promise<void> {
    await this.page.locator('[data-testid^="selected-input-chip-list-birthday-"]').click();
  }

  /**
   * Escribe una fecha en el campo "Birthday" SIN confirmar con "See
   * results". Separado de `searchByBirthday()` para soportar el caso
   * border de fecha inválida (ej. 30 de febrero): confirmado contra el DOM
   * real (trace) que ese input deja el botón "See results" permanentemente
   * deshabilitado (`aria-disabled="true"`) — la validación rechaza la
   * fecha en vez de aceptarla o de devolver 0 resultados. Forzar el click
   * ahí cuelga el test hasta el timeout completo; el comportamiento real a
   * validar es justamente que el botón nunca se habilita.
   */
  async typeBirthday(monthDay: string): Promise<void> {
    // El acordeón "Birthday" arranca colapsado en una navegación fresca
    // (confirmado: aria-expanded="false" al cargar la página).
    await this.page.getByRole('button', { name: 'Expand Birthday' }).click();

    // fill() setea el valor de una sola vez y no dispara eventos de tecla
    // por carácter — el botón "See results" queda deshabilitado porque su
    // validación depende de esos eventos (confirmado: tipeando manualmente
    // sí se habilita). pressSequentially() sí los dispara, uno por uno.
    const birthdayInput = this.page.locator('[data-testid="birthday-input-test-id"]');
    await birthdayInput.pressSequentially(monthDay);
    // Blur explícito: por si la validación que habilita "See results" (y
    // crea el chip "Birthday: MM-DD") se dispara en el evento blur y no
    // solo con los keystrokes.
    await birthdayInput.press('Tab');
  }

  /**
   * Locator del botón "See results", expuesto para que los tests puedan
   * verificar su estado (enabled/disabled) sin necesariamente hacer click
   * — necesario para el caso border de fecha inválida.
   */
  getSeeResultsButton(): Locator {
    return this.page.locator('[data-testid="adv-search-get-results"]');
  }

  /**
   * Busca personas por fecha de nacimiento (MM-DD, sin año) con el filtro
   * "Birthday" de la barra lateral. No existe un preset tipo "Celebrities
   * born yesterday" en la UI real (se verificó: el campo es de texto
   * libre, sin autocompletado) — hay que tipear la fecha ya calculada por
   * el caller y confirmar con "See results".
   */
  async searchByBirthday(monthDay: string): Promise<void> {
    await this.typeBirthday(monthDay);

    const seeResultsButton = this.getSeeResultsButton();
    await seeResultsButton.waitFor({ state: 'visible' });
    await seeResultsButton.click();
  }

  /**
   * Busca personas por rango de fecha de nacimiento COMPLETA (con año),
   * usando el filtro "Birth date" — distinto de "Birthday" (Caso 4), que
   * solo acepta MM-DD sin año. Es el filtro correcto para calcular una
   * edad exacta ("hace 40 años").
   *
   * Confirmado contra el DOM real: son dos <input type="date"> nativos
   * (from/to) dentro del acordeón "Birth date". Se llenan con fill() en
   * formato ISO (YYYY-MM-DD) — la forma que Playwright documenta para
   * inputs de fecha nativos, y produce el mismo value final que el
   * enunciado describe como "date picker" (from) o "tipeo" (to): ambas
   * interacciones terminan seteando el mismo atributo.
   *
   * Igual que en el Caso 4, se agrega un blur explícito antes de esperar
   * que "See results" se habilite, porque ya vimos que esa validación no
   * siempre reacciona solo al evento de cambio del input.
   */
  async searchByBirthDateRange(fromISO: string, toISO: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Expand Birth date' }).click();

    const dateInputs = this.page.locator(
      '#accordion-item-birthDateAccordion input[type="date"]'
    );
    await dateInputs.nth(0).fill(fromISO);
    await dateInputs.nth(1).fill(toISO);
    await dateInputs.nth(1).press('Tab');

    const seeResultsButton = this.page.locator('[data-testid="adv-search-get-results"]');
    await seeResultsButton.waitFor({ state: 'visible' });
    await seeResultsButton.click();
  }

  /**
   * Hace click en el N-ésimo resultado de la lista (1-indexed).
   * Selección por POSICIÓN, mismo criterio que Top Box Office: la lista
   * depende del filtro aplicado y del orden (popularidad por defecto), no
   * hay un nombre fijo que buscar.
   *
   * Bounds-checking para el caso border "posición fuera de rango". OJO: un
   * `count()` inmediato es racy — justo después de "See results" la lista
   * puede no haber terminado de renderizar, así que `count()` puede leer un
   * número menor al real solo por timing (rompía el caso feliz de forma
   * intermitente). Esperamos explícitamente a que al menos un resultado
   * aparezca antes de contar cuántos hay en total.
   */
  async clickNthResult(position: number): Promise<void> {
    const items = this.page.locator('li.ipc-metadata-list-summary-item');
    await items
      .first()
      .waitFor({ state: 'visible', timeout: 10_000 })
      .catch(() => {
        // Si genuinamente no hay resultados (ej. una fecha inválida), no hay
        // nada que esperar — count() abajo dará 0 y el mensaje de error lo
        // deja claro.
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
   * Hace click en el primer link que aparezca en la DESCRIPCIÓN del
   * N-ésimo resultado (no en el link del nombre) — el Caso 5 pide esto
   * explícitamente "si existe alguno", es decir, es un comportamiento
   * condicional esperado, no un error si no hay link.
   *
   * BORRADOR sin confirmar contra el DOM real: se asume que el link de
   * "known for" dentro de la card usa la clase `ipc-link`, distinta de
   * `ipc-title-link-wrapper` (el nombre de la persona). Pendiente de
   * validar con el primer run.
   *
   * @returns true si encontró y clickeó un link, false si no había ninguno.
   */
  async clickFirstDescriptionLink(position: number): Promise<boolean> {
    const item = this.page.locator('li.ipc-metadata-list-summary-item').nth(position - 1);
    const descriptionLink = item.locator('a.ipc-link').first();

    if ((await descriptionLink.count()) > 0) {
      await descriptionLink.click();
      return true;
    }
    return false;
  }
}
