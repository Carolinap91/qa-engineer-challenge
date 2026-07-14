import { test, expect } from '@fixtures/fixtures';
import { SearchPage } from '@pages/SearchPage';
import { ActorProfilePage } from '@pages/ActorProfilePage';

/**
 * Caso 1: Nicolas Cage - Upcoming credits.
 */

test.describe('Nicolas Cage - Upcoming credits', () => {
  test('Acceder a la primera película con tag "Completed" en Upcoming', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('suggestion-search').waitFor({ state: 'visible' });

    const searchPage = new SearchPage(page);
    await searchPage.searchAndOpenActor('Nicolas Cage');
    await expect(page).toHaveURL(/\/name\/nm\d+/);

    const actorPage = new ActorProfilePage(page);
    await actorPage.expandUpcomingCredits();
    await actorPage.clickFirstMovieWithTag('Completed');

    // Las páginas de título en IMDb usan la ruta /title/tt<id>/
    await expect(page).toHaveURL(/\/title\/tt\d+/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Buscar un actor inexistente lanza un error claro (sin resultados)', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('suggestion-search').waitFor({ state: 'visible' });

    const searchPage = new SearchPage(page);
    await expect(
      searchPage.searchAndOpenActor('Zzxqvbnmasdfghjkl1234NoExiste')
    ).rejects.toThrow(/No se encontró un perfil/);
  });

  test('Un actor sin sección "Upcoming" lanza un error claro', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('suggestion-search').waitFor({ state: 'visible' });

    const searchPage = new SearchPage(page);
    // BORRADOR sin confirmar contra el DOM real: Marlon Brando (fallecido en
    // 2004, sin carrera activa) es el candidato elegido para "actor sin
    // Upcoming". Pendiente de validar con el primer run — si IMDb igual
    // renderiza la sección (vacía) en vez de omitirla, hay que ajustar
    // el actor de prueba o el criterio del assert.
    await searchPage.searchAndOpenActor('Marlon Brando');
    await expect(page).toHaveURL(/\/name\/nm\d+/);

    const actorPage = new ActorProfilePage(page);
    await expect(actorPage.expandUpcomingCredits()).rejects.toThrow(/Upcoming/);
  });
});