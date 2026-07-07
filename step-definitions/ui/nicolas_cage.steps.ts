import { Given, When, Then } from '@fixtures/fixtures';
import { expect } from '@playwright/test';

/**
 * Steps del caso "Nicolas Cage - Upcoming credits".
 * Este archivo es el patrón de referencia: cada caso siguiente sigue la misma
 * estructura (Given/When/Then delgados que delegan la lógica en Page Objects).
 * TODO: implementar contra los Page Objects reales (próxima iteración).
 */

Given('que estoy en la página principal de IMDb', async ({ page }) => {
  await page.goto('/');
});

When('busco al actor {string} y accedo a su perfil', async ({ page }, actor: string) => {
  // TODO: usar SearchPage.searchAndOpenActor(actor)
});

When('despliego la pestaña {string} en la sección de Credits', async ({ page }, tab: string) => {
  // TODO: usar ActorProfilePage.expandCreditsTab(tab)
});

When('hago click en la primera película con la etiqueta {string}', async ({ page }, tag: string) => {
  // TODO: usar ActorProfilePage.clickFirstMovieWithTag(tag)
});

Then('debería acceder a la página de detalle de esa película', async ({ page }) => {
  // TODO: assertion sobre la URL / heading de la página de detalle
});
