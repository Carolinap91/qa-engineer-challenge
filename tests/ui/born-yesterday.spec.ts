import { test, expect } from '@fixtures/fixtures';
import { AdvancedNameSearchPage } from '@pages/AdvancedNameSearchPage';
import { getMonthDay } from '@utils/dates';

/**
 * Caso 4: Born Today - celebridades nacidas AYER.
 * La fecha se calcula respecto al día real de ejecución (getMonthDay(-1)),
 * nunca hardcodeada, para que el test siga siendo válido sin importar
 * cuándo corra.
 */
test.describe('Born Today - Celebrities born yesterday', () => {
  test('Buscar celebridades nacidas ayer y abrir el 3er resultado', async ({ page }) => {
    await page.goto('/');

    const searchPage = new AdvancedNameSearchPage(page);
    await searchPage.navigateToBornToday();
    await expect(page).toHaveURL(/\/search\/name\//);

    await searchPage.clearDefaultBirthdayFilter();
    await searchPage.searchByBirthday(getMonthDay(-1));

    await searchPage.clickNthResult(3);
    await expect(page).toHaveURL(/\/name\/nm\d+/);

    await page.screenshot({ path: 'test-results/caso4-born-yesterday.png' });
  });

  test('Buscar con una fecha inválida (30 de febrero) deja "See results" deshabilitado', async ({
    page,
  }) => {
    await page.goto('/');

    const searchPage = new AdvancedNameSearchPage(page);
    await searchPage.navigateToBornToday();
    await searchPage.clearDefaultBirthdayFilter();

    // CONFIRMADO contra el DOM real (trace de Playwright): 30 de febrero no
    // existe en ningún calendario, y a diferencia de lo que se asumía en el
    // borrador original, IMDb NO deja pasar la búsqueda con 0 resultados —
    // el botón "See results" queda permanentemente
    // disabled/aria-disabled="true", la validación rechaza el valor antes
    // de habilitar el submit. Por eso acá se usa typeBirthday() (sin click)
    // en vez de searchByBirthday().
    await searchPage.typeBirthday('02-30');

    await expect(searchPage.getSeeResultsButton()).toBeDisabled();
  });

  test('Pedir un resultado en una posición fuera de rango lanza un error claro', async ({
    page,
  }) => {
    await page.goto('/');

    const searchPage = new AdvancedNameSearchPage(page);
    await searchPage.navigateToBornToday();
    await searchPage.clearDefaultBirthdayFilter();
    await searchPage.searchByBirthday(getMonthDay(-1));

    await expect(searchPage.clickNthResult(99999)).rejects.toThrow(
      /solo devolvió \d+ resultado/
    );
  });
});
