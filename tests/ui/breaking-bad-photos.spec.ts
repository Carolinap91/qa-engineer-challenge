import { test, expect } from '@fixtures/fixtures';
import { Top250TvPage } from '@pages/Top250TvPage';
import { PhotosGalleryPage } from '@pages/PhotosGalleryPage';

/**
 * Caso 3: Breaking Bad - Photos filtradas por Danny Trejo, click en la 2da foto.
 *
 * BORRADOR sin inspección en vivo del DOM (ver notas en Top250TvPage y
 * PhotosGalleryPage) — pendiente de validar/ajustar selectores con el
 * primer run real y su trace.
 */
test.describe('Breaking Bad - Photos', () => {
  test('Filtrar fotos por Danny Trejo y abrir la 2da foto', async ({ page }) => {
    await page.goto('/');

    const top250Page = new Top250TvPage(page);
    await top250Page.navigateToTop250TvShows();
    await expect(page).toHaveURL(/\/chart\/toptv/);

    await top250Page.clickShowByTitle('Breaking Bad');
    await expect(page).toHaveURL(/\/title\/tt\d+/);

    const photosPage = new PhotosGalleryPage(page);
    await photosPage.goToPhotos();
    await expect(page).toHaveURL(/mediaindex/);

    await photosPage.filterByCastMember('Danny Trejo');
    await photosPage.clickNthPhoto(2);

    // Tras hacer click en una foto, IMDb abre el visor de imagen (lightbox/URL con /mediaviewer/).
    await expect(page).toHaveURL(/mediaviewer/);
  });

  test('Buscar un show inexistente en el Top 250 lanza un error claro', async ({ page }) => {
    await page.goto('/');

    const top250Page = new Top250TvPage(page);
    await top250Page.navigateToTop250TvShows();
    await expect(page).toHaveURL(/\/chart\/toptv/);

    await expect(
      top250Page.clickShowByTitle('Zzxqvbnmasdfghjkl1234NoExiste')
    ).rejects.toThrow(/No se encontró el show/);
  });

  test('Pedir una foto en una posición fuera de rango lanza un error claro', async ({ page }) => {
    await page.goto('/');

    const top250Page = new Top250TvPage(page);
    await top250Page.navigateToTop250TvShows();
    await top250Page.clickShowByTitle('Breaking Bad');
    await expect(page).toHaveURL(/\/title\/tt\d+/);

    const photosPage = new PhotosGalleryPage(page);
    await photosPage.goToPhotos();
    await photosPage.filterByCastMember('Danny Trejo');

    // Posición deliberadamente absurda: ninguna galería filtrada tiene
    // miles de fotos, así que esto siempre debe exceder el conteo real.
    await expect(photosPage.clickNthPhoto(9999)).rejects.toThrow(
      /solo tiene \d+ foto/
    );
  });
});
