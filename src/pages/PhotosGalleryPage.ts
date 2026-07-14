import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la galería de fotos de un título (Photos / mediaindex).
 * Genérico a propósito (no específico de Breaking Bad): cualquier título de
 * IMDb expone esta misma galería, así que separar esta lógica de
 * Top250TvPage permite reusarla para otros casos futuros sin duplicar código.
 *
 * NOTA (borrador sin inspección en vivo): selectores de filtro por cast y de
 * grilla de fotos son hipótesis basadas en la estructura típica de IMDb, no
 * confirmadas contra el DOM real. Pendiente de ajustar con el primer trace.
 */
export class PhotosGalleryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navega a la sección "Photos" del título actual y llega hasta el índice
   * completo de fotos (con filtros), no al visor de una sola imagen.
   *
   * DECISIÓN (ambigüedad #15): "ir a la sección Photos" se interpretó como
   * la sección <section data-testid="Photos"> del cuerpo de la página (no
   * el botón "99+ Photos" del hero, que es un atajo, no "la sección").
   *
   * Confirmado contra el DOM real que esto requiere DOS clicks, no uno:
   * 1. El heading "Photos" de esa sección abre el visor de una sola imagen
   *    (mediaviewer), no la galería.
   * 2. Desde el visor, el botón de grilla (data-testid="mv-gallery-button")
   *    lleva al índice completo (/mediaindex/), que es donde vive el filtro
   *    por cast member necesario para el resto del caso.
   */
  async goToPhotos(): Promise<void> {
    await this.page.locator('[data-testid="Photos"] a.ipc-title-link-wrapper').click();
    await this.page.locator('[data-testid="mv-gallery-button"]').click();
  }

  /**
   * Abre el panel de filtros del índice de fotos.
   * Confirmado: <button data-testid="image-chip-dropdown-test-id"
   * aria-label="Open filter prompt">.
   *
   * Reintenta hasta 3 veces vía clickWithRetry (BasePage) — mismo patrón
   * que el toggle "Upcoming" del Caso 1 y el botón "Rate" del Caso 2: el
   * primer click puede no tener efecto porque React todavía no conectó el
   * listener del botón.
   */
  async openFilterPanel(): Promise<void> {
    const filterButton = this.page.locator('[data-testid="image-chip-dropdown-test-id"]');
    const dialog = this.page.getByRole('dialog');

    await this.clickWithRetry(
      filterButton,
      () => dialog.waitFor({ state: 'visible', timeout: 5_000 }),
      { failureMessage: 'No se pudo abrir el panel de filtro tras 3 intentos' }
    );
  }

  /**
   * Filtra la galería para mostrar solo fotos de un miembro del cast.
   * Confirmado contra el DOM real:
   * - El panel de filtro es un dialog real (data-testid="promptable",
   *   role="dialog"), con secciones TYPE y PERSON.
   * - No todas las personas están visibles por defecto en la sección
   *   PERSON: si el nombre buscado no aparece de entrada, hay un toggle
   *   "More people" que revela el resto de los chips.
   * - Tras seleccionar el chip, el panel queda abierto y hay que cerrarlo
   *   explícitamente (botón "Close Prompt") para volver a la grilla ya
   *   filtrada — la selección del chip no lo cierra automáticamente.
   */
  async filterByCastMember(name: string): Promise<void> {
    await this.openFilterPanel();
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });

    // La sección PERSON del filtro solo muestra como chips a las ~14
    // personas con más fotos. El resto vive en un <select> NATIVO oculto
    // (opacity: 0, data-testid="select-dropdown-test-id") superpuesto por
    // el label "More people" — no es un botón que "revela" más chips como
    // parecía visualmente. Cada <option value="nmXXXXXXX"> tiene el nombre
    // y el conteo, ej. "Danny Trejo (11)".
    //
    // Estrategia: probar primero el chip visible (nombres frecuentes);
    // si no existe, resolver la opción en el <select> por texto y
    // seleccionarla por value (más estable que por label exacto, porque
    // el conteo entre paréntesis puede cambiar).
    const visibleChip = dialog.getByRole('button', { name, exact: false });

    if ((await visibleChip.count()) > 0) {
      await visibleChip.first().click();
    } else {
      // data-testid="select-dropdown-test-id" se repite (hay un <select>
      // por categoría: PERSON y OTHER) — strict mode violation si no se
      // acota al contenedor de PERSON (data-testid=
      // "image-names-filter-container-test-id").
      const morePeopleSelect = dialog
        .locator('[data-testid="image-names-filter-container-test-id"]')
        .locator('[data-testid="select-dropdown-test-id"]');
      const matchingOption = morePeopleSelect.locator('option').filter({ hasText: name });
      const value = await matchingOption.getAttribute('value');
      if (!value) {
        throw new Error(`No se encontró la opción "${name}" en el filtro de personas`);
      }
      await morePeopleSelect.selectOption(value);
    }

    await dialog.getByRole('button', { name: 'Close Prompt' }).click();
  }

  /**
   * Hace click en la N-ésima foto de la grilla (1-indexed, ej. 2 = "2da foto").
   * Selección por POSICIÓN, mismo criterio que Top Box Office: el contenido
   * de una galería filtrada es una lista ordenada, no algo identificable por
   * nombre único.
   *
   * Confirmado contra el DOM real: cada miniatura es
   * <a data-testid="mosaic-img-{fila}-{col}" href=".../mediaviewer/rm.../">,
   * en el mismo orden en que aparecen visualmente en la grilla.
   */
  async clickNthPhoto(position: number): Promise<void> {
    const photos = this.page.locator('a[data-testid^="mosaic-img-"]');

    // Bounds-checking para el caso border "posición fuera de rango". OJO: un
    // `count()` inmediato es racy — justo después de cerrar el panel de
    // filtro, la grilla puede no haber terminado de re-renderizarse, así que
    // `count()` puede leer un número menor al real solo por timing (rompía
    // el caso feliz de forma intermitente). Esperamos explícitamente a que
    // al menos una foto aparezca antes de contar cuántas hay en total.
    await photos
      .first()
      .waitFor({ state: 'visible', timeout: 10_000 })
      .catch(() => {
        // Si genuinamente no hay fotos, no hay nada que esperar — count()
        // abajo dará 0 y el mensaje de error lo deja claro.
      });

    const count = await photos.count();
    if (position > count) {
      throw new Error(
        `No se puede hacer click en la foto #${position}: la galería filtrada solo tiene ${count} foto(s).`
      );
    }
    await photos.nth(position - 1).click();
  }
}
