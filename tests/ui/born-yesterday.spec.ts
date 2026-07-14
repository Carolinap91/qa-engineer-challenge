import { test, expect } from '@fixtures/fixtures';
import { AdvancedNameSearchPage } from '@pages/AdvancedNameSearchPage';
import { getMonthDay } from '@utils/dates';

/**
 * Caso 4: Born Today - celebridades nacidas AYER.
 * Fecha calculada respecto al día real de ejecución (getMonthDay(-1)),
 * nunca hardcodeada.
 */
test.describe('Born Today - Celebrities born yesterday', () => {
  let searchPage: AdvancedNameSearchPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    searchPage = new AdvancedNameSearchPage(page);
    await searchPage.navigateToBornToday();
    await searchPage.clearDefaultBirthdayFilter();
  });

  test('Buscar celebridades nacidas ayer y abrir el 3er resultado', async ({ page }) => {
    await expect(page).toHaveURL(/\/search\/name\//);

    await searchPage.searchByBirthday(getMonthDay(-1));
    await searchPage.clickNthResult(3);

    await expect(page).toHaveURL(/\/name\/nm\d+/);
    await page.screenshot({ path: 'test-results/caso4-born-yesterday.png' });
  });

  test('Buscar con una fecha inválida (30 de febrero) deja "See results" deshabilitado', async () => {
    // Confirmado por trace: 30 de febrero no existe, e IMDb deja el botón
    // permanentemente disabled en vez de devolver 0 resultados. Por eso
    // se usa typeBirthday() (sin submit) en vez de searchByBirthday().
    await searchPage.typeBirthday('02-30');

    await expect(searchPage.getSeeResultsButton()).toBeDisabled();
  });

  test('Pedir un resultado en una posición fuera de rango lanza un error claro', async () => {
    await searchPage.searchByBirthday(getMonthDay(-1));

    await expect(searchPage.clickNthResult(99999)).rejects.toThrow(/solo devolvió \d+ resultado/);
  });
});
