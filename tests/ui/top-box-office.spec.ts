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

  test('Cerrar el modal de rating sin calificar (Escape) no aplica ningún rating', async ({
    page,
  }) => {
    await page.goto('/');

    const boxOfficePage = new TopBoxOfficePage(page);
    await boxOfficePage.navigateToTopBoxOffice();
    await boxOfficePage.clickSecondListItem();
    await boxOfficePage.clickImdbRating();
    await boxOfficePage.clickRateButton();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Al cerrar sin seleccionar estrellas ni confirmar, no debe dispararse
    // el flujo de guardado (el mismo que en el caso feliz termina en el
    // mensaje "Sign in" por no estar logueados) — si apareciera acá, el
    // modal estaría aplicando un rating aunque se haya cancelado.
    await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).not.toBeVisible();
  });

  test('Abrir "Rate" dos veces seguidas no duplica el modal', async ({ page }) => {
    await page.goto('/');

    const boxOfficePage = new TopBoxOfficePage(page);
    await boxOfficePage.navigateToTopBoxOffice();
    await boxOfficePage.clickSecondListItem();
    await boxOfficePage.clickImdbRating();

    await boxOfficePage.clickRateButton();

    // Segundo intento de click directo sobre el trigger original (sin pasar
    // por clickRateButton(), que reintenta hasta 3 veces esperando el
    // dialog — con el modal ya abierto esos reintentos tardan hasta el
    // timeout completo). Con el dialog abierto es esperable que el trigger
    // quede tapado/no interactuable; eso en sí mismo confirma que no se
    // puede abrir un segundo modal, así que toleramos el error con un
    // timeout corto en vez de dejar que cuelgue.
    const rateTrigger = page.getByRole('button', { name: /^Rate\s/ }).first();
    await rateTrigger.click({ timeout: 3_000 }).catch(() => {});

    await expect(page.getByRole('dialog')).toHaveCount(1);
  });
});