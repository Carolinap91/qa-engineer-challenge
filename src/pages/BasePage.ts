import { Page, Locator } from '@playwright/test';

/**
 * Clase base para todos los Page Objects de IMDb.
 * Centraliza navegación y helpers reutilizables (menú, waits, etc.)
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Abre el menú hamburguesa (drawer) de IMDb. Selector basado en el
   * aria-label del botón, estable y semántico (no depende de clases CSS).
   */
  async openMainMenu(): Promise<void> {
    await this.page.getByLabel('Open navigation drawer').click();
  }

  /**
   * Hace click en `trigger` reintentando hasta `attempts` veces, dando por
   * bueno el click solo cuando `verify()` confirma que tuvo efecto real.
   *
   * Centraliza un patrón que se repetía igual en varios Page Objects
   * (Upcoming en el perfil de actor, "Rate" en Top Box Office, el filtro de
   * fotos): IMDb es una SPA de React donde un botón puede estar visible en
   * el DOM antes de que su listener de click esté conectado ("hydration
   * lenta"), así que un solo click puede no tener efecto — intermitente si
   * no se reintenta, determinístico si se reintenta verificando el
   * resultado esperado.
   */
  protected async clickWithRetry(
    trigger: Locator,
    verify: () => Promise<void>,
    options: { attempts?: number; failureMessage?: string } = {}
  ): Promise<void> {
    const attempts = options.attempts ?? 3;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      await trigger.click();
      try {
        await verify();
        return;
      } catch {
        if (attempt === attempts) {
          throw new Error(
            options.failureMessage ?? `No se pudo confirmar la acción tras ${attempts} intentos`
          );
        }
      }
    }
  }
}
