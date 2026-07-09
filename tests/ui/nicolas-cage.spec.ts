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
});