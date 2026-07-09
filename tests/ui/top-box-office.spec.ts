import { test, expect } from '@fixtures/fixtures';
import { TopBoxOfficePage } from '@pages/TopBoxOfficePage';

/**
 * Caso 2: Top Box Office - calificar el 2do ítem con 5 estrellas.
 */
test.describe('Top Box Office - Calificar película', () => {
  test('Calificar con 5 estrellas la 2da película del Top Box Office', async ({ page }) => {
    await page.goto('/');

    const boxOfficePage = new TopBoxOfficePage(page);
    await boxOfficePage.navigateToTopBoxOffice();
    await expect(page).toHaveURL(/\/chart\/boxoffice/);

    await boxOfficePage.clickSecondListItem();
    await expect(page).toHaveURL(/\/title\/tt\d+/);

    await boxOfficePage.clickImdbRating();
    await expect(page).toHaveURL(/\/ratings\//);

    await boxOfficePage.clickRateButton();
    await boxOfficePage.rateWithStars(5);

    // Tras calificar, "YOUR RATING", comportaiento esperado: el modal se cierra y aparece un mensaje de "Sign in" (porque no estamos logueados).
    await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
  });
});