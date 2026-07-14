import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la galería de fotos de un título (Photos / mediaindex).
 * Genérico a propósito: cualquier título de IMDb expone esta misma
 * galería, separada de Top250TvPage para poder reusarla.
 */
export class PhotosGalleryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navega a la sección "Photos" (no el atajo "99+ Photos" del hero — ver
   * ambigüedad #15 en el README) hasta el índice completo con filtros.
   * Dos clicks: el heading abre un visor de una imagen (mediaviewer);
   * desde ahí, el botón de grilla lleva al índice completo (mediaindex).
   */
  async goToPhotos(): Promise<void> {
    await this.page.locator('[data-testid="Photos"] a.ipc-title-link-wrapper').click();
    await this.page.locator('[data-testid="mv-gallery-button"]').click();
  }

  /**
   * Abre el panel de filtros del índice de fotos. Reintenta vía
   * clickWithRetry (BasePage) por el mismo hydration lag que "Upcoming" y
   * "Rate" en otros casos.
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
   * Filtra la galería por miembro del cast.
   *
   * La sección PERSON del panel solo muestra ~14 chips (los más
   * frecuentes); el resto vive en un <select> nativo oculto ("More
   * people", opacity: 0). Se prueba primero el chip visible; si no
   * existe, se busca la <option> por texto y se selecciona por value.
   *
   * Tras seleccionar, el panel no se cierra solo — hay que cerrarlo con
   * "Close Prompt" para volver a la grilla filtrada.
   */
  async filterByCastMember(name: string): Promise<void> {
    await this.openFilterPanel();
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });

    const visibleChip = dialog.getByRole('button', { name, exact: false });

    if ((await visibleChip.count()) > 0) {
      await visibleChip.first().click();
    } else {
      // El testid del <select> se repite (uno por categoría: PERSON y
      // OTHER) — acotado al contenedor de PERSON para evitar strict mode.
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
   * Hace click en la N-ésima foto (1-indexed). Selección por posición: una
   * galería filtrada es una lista ordenada, no algo con nombre único.
   */
  async clickNthPhoto(position: number): Promise<void> {
    const photos = this.page.locator('a[data-testid^="mosaic-img-"]');

    // count() inmediato es racy (la grilla puede no haber re-renderizado
    // tras cerrar el filtro) — esperamos a que aparezca al menos una foto
    // antes de contar cuántas hay en total.
    await photos
      .first()
      .waitFor({ state: 'visible', timeout: 10_000 })
      .catch(() => {});

    const count = await photos.count();
    if (position > count) {
      throw new Error(
        `No se puede hacer click en la foto #${position}: la galería filtrada solo tiene ${count} foto(s).`
      );
    }
    await photos.nth(position - 1).click();
  }
}
