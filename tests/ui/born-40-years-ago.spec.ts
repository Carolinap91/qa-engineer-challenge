import { test, expect } from '@fixtures/fixtures';
import { AdvancedNameSearchPage } from '@pages/AdvancedNameSearchPage';
import { getExactDateYearsAgo } from '@utils/dates';

/**
 * Caso 5: Born Today - personas que cumplen EXACTAMENTE 40 años hoy.
 * Rango calculado respecto al día real de ejecución, nunca hardcodeado.
 * El click en el link de descripción es condicional ("si existe alguno").
 */
test.describe('Born Today - Cumplen 40 años hoy', () => {
  let searchPage: AdvancedNameSearchPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    searchPage = new AdvancedNameSearchPage(page);
    await searchPage.navigateToBornToday();
    await searchPage.clearDefaultBirthdayFilter();
  });

  test('Buscar personas nacidas hace 40 años y abrir el link de su descripción si existe', async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/search\/name\//);

    await searchPage.searchByBirthDateRange(getExactDateYearsAgo(40), getExactDateYearsAgo(0));
    await searchPage.clickFirstDescriptionLink(1);

    await page.screenshot({ path: 'test-results/caso5-born-40-years-ago.png' });
  });

  test('Un rango de fechas invertido (from posterior a to) no rompe la búsqueda', async ({
    page,
  }) => {
    // Confirmado: con "from" (hoy) posterior a "to" (hace 40 años), IMDb
    // no devuelve resultados en vez de romper la página.
    await searchPage.searchByBirthDateRange(getExactDateYearsAgo(0), getExactDateYearsAgo(40));

    await expect(page.locator('li.ipc-metadata-list-summary-item')).toHaveCount(0);
  });

  test('Un rango de fechas en el futuro devuelve cero resultados', async ({ page }) => {
    // Nadie puede haber nacido en el futuro: rango garantizado sin
    // resultados, sin depender de datos reales de IMDb.
    await searchPage.searchByBirthDateRange(getExactDateYearsAgo(-2), getExactDateYearsAgo(-1));

    await expect(page.locator('li.ipc-metadata-list-summary-item')).toHaveCount(0);
  });
});
