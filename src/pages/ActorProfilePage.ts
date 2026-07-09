import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la página de perfil de un actor/actriz en IMDb.
 * URL de referencia: /name/nm0000115/ (Nicolas Cage)
 *
 * Selectores obtenidos inspeccionando el DOM real:
 * - Botón "Upcoming": <label role="button"> que contiene el texto "Upcoming".
 *   Su atributo aria-controls apunta al ID del contenedor con los créditos.
 * - Items de créditos: <li class="ipc-metadata-list-summary-item ...">
 *   OJO: esta clase se repite en TODAS las secciones (Actor, Producer,
 *   Director...), por eso siempre acotamos la búsqueda al contenedor
 *   específico de "Upcoming" (vía aria-controls), nunca a page-wide.
 * - Tag de estado (ej. "Completed"): <a class="...ipc-metadata-list-summary-item__li--link">
 */

export class ActorProfilePage extends BasePage {
  // Botón que expande/colapsa la sección "Upcoming" dentro de Actor > Credits.
  private readonly upcomingToggle = this.page
    .locator('label[role="button"]')
    .filter({ hasText: 'Upcoming' })
    .first();

  constructor(page: Page) {
    super(page);
  }

  /**
   * Devuelve el locator de los <li> de créditos DENTRO del contenedor de
   * Upcoming (no de toda la página), usando el aria-controls del botón.
   */
  private async getUpcomingListItems(): Promise<Locator> {
    const contentId = await this.upcomingToggle.getAttribute('aria-controls');
    if (!contentId) {
      throw new Error('No se encontró aria-controls en el botón de Upcoming');
    }
    return this.page.locator(`[id="${contentId}"] li.ipc-metadata-list-summary-item`);
  }

  /**
   * Despliega la pestaña "Upcoming" en la sección Credits del perfil del actor.
   * Verifica aria-expanded antes de hacer click para no colapsar si ya está abierta.
   */
async expandUpcomingCredits(): Promise<void> {
    await this.upcomingToggle.waitFor({ state: 'visible' });

    // Reintentamos el click hasta 3 veces: en IMDb (SPA React) el botón puede
    // estar visible en el DOM antes de que su listener de click esté
    // conectado (hydration), lo que hace que un click ocasionalmente no
    // tenga efecto. Un solo intento es intermitente (flaky); reintentar
    // hasta confirmar aria-expanded="true" lo vuelve determinístico.
    const isAlreadyExpanded = (await this.upcomingToggle.getAttribute('aria-expanded')) === 'true';

    if (!isAlreadyExpanded) {
      let expanded = false;
      for (let attempt = 1; attempt <= 3 && !expanded; attempt++) {
        await this.upcomingToggle.click();
        try {
          await expect(this.upcomingToggle).toHaveAttribute('aria-expanded', 'true', {
            timeout: 5_000,
          });
          expanded = true;
        } catch {
          if (attempt === 3) {
            throw new Error('No se pudo expandir la sección "Upcoming" tras 3 intentos');
          }
        }
      }
    }

    const upcomingItems = await this.getUpcomingListItems();
    await upcomingItems.first().waitFor({ state: 'visible' });
  }

  /**
   * Dentro de la sección Upcoming ya expandida, encuentra el primer <li>
   * que contenga un link con el texto del tag buscado (ej. "Completed")
   * y hace click en el título de esa película para navegar a su detalle.
   */
  async clickFirstMovieWithTag(tag: string): Promise<void> {
    const upcomingItems = await this.getUpcomingListItems();

    const movieItem = upcomingItems
      .filter({
        has: this.page.locator(
          `a.ipc-metadata-list-summary-item__li--link:text-is("${tag}")`
        ),
      })
      .first();

    await movieItem.waitFor({ state: 'visible' });

    // Click en el título de la película (el primer <a> del título dentro del <li>),
    // no en el tag mismo, para navegar a la página de detalle.
    await movieItem.locator('a.ipc-metadata-list-summary-item__t').first().click();
  }
}

