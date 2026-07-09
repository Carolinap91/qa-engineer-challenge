import { test as base, expect } from '@playwright/test';
import { PokeApiClient } from '@api/PokeApiClient';

/**
 * Extiende el test nativo de Playwright con fixtures propios.
 * Los tests importan `test`/`expect` desde este archivo en vez de
 * '@playwright/test' directamente, para tener acceso a `pokeApi` ya inyectado.
 */
export const test = base.extend<{ pokeApi: PokeApiClient }>({
  pokeApi: async ({ request }, use) => {
    await use(new PokeApiClient(request));
  },
});

export { expect };