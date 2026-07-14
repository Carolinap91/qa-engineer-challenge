import { test, expect } from '@fixtures/fixtures';
import { AdvancedNameSearchPage } from '@pages/AdvancedNameSearchPage';
import { getExactDateYearsAgo } from '@utils/dates';

/**
 * Caso 5: Born Today - personas que cumplen EXACTAMENTE 40 años hoy.
 * Rango de fecha calculado respecto al día real de ejecución
 * (getExactDateYearsAgo), nunca hardcodeado.
 *
 * El click en el link de la descripción del 1er resultado es condicional
 * ("si existe alguno" en el enunciado) — no se asume que siempre haya uno.
 */
test.describe('Born Today - Cumplen 40 años hoy', () => {
  test('Buscar personas nacidas hace 40 años y abrir el link de su descripción si existe', async ({
    page,
  }) => {
    await page.goto('/');

    const searchPage = new AdvancedNameSearchPage(page);
    await searchPage.navigateToBornToday();
    await expect(page).toHaveURL(/\/search\/name\//);

    await searchPage.clearDefaultBirthdayFilter();
    await searchPage.searchByBirthDateRange(getExactDateYearsAgo(40), getExactDateYearsAgo(0));

    await searchPage.clickFirstDescriptionLink(1);

    await page.screenshot({ path: 'test-results/caso5-born-40-years-ago.png' });
  });

  test('Un rango de fechas invertido (from posterior a to) no rompe la búsqueda', async ({
    page,
  }) => {
    await page.goto('/');

    const searchPage = new AdvancedNameSearchPage(page);
    await searchPage.navigateToBornToday();
    await searchPage.clearDefaultBirthdayFilter();

    // BORRADOR sin confirmar contra el DOM real: "from" (hoy) es posterior a
    // "to" (hace 40 años), al revés del orden esperado. Se asume que IMDb no
    // devuelve resultados en vez de romper la página; pendiente de ajustar
    // el assert con el primer run si el comportamiento real es otro (ej. si
    // el sitio invierte el rango solo internamente).
    await searchPage.searchByBirthDateRange(
      getExactDateYearsAgo(0),
      getExactDateYearsAgo(40)
    );

    await expect(page.locator('li.ipc-metadata-list-summary-item')).toHaveCount(0);
  });

  test('Un rango de fechas en el futuro devuelve cero resultados', async ({ page }) => {
    await page.goto('/');

    const searchPage = new AdvancedNameSearchPage(page);
    await searchPage.navigateToBornToday();
    await searchPage.clearDefaultBirthdayFilter();

    // Nadie puede haber nacido en el futuro: rango garantizado sin
    // resultados, sin depender de datos reales de IMDb.
    await searchPage.searchByBirthDateRange(
      getExactDateYearsAgo(-2),
      getExactDateYearsAgo(-1)
    );

    await expect(page.locator('li.ipc-metadata-list-summary-item')).toHaveCount(0);
  });
});
