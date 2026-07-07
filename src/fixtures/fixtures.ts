import { test as base } from 'playwright-bdd';
import { PokeApiClient } from '@api/PokeApiClient';

/**
 * Extiende el test de playwright-bdd con fixtures propios.
 * Cada step definition importa `test`/`Given`/`When`/`Then` desde este archivo
 * en vez de desde 'playwright-bdd' directamente, para tener acceso a estas
 * fixtures ya inyectadas (evita repetir instanciación en cada step).
 */
export const test = base.extend<{ pokeApi: PokeApiClient }>({
  pokeApi: async ({ request }, use) => {
    await use(new PokeApiClient(request));
  },
});

export const { Given, When, Then } = test;
