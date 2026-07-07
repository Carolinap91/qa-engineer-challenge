import { When, Then } from '@fixtures/fixtures';
import { expect } from '@playwright/test';

/**
 * Steps del caso "PokeAPI - Berry endpoint".
 * Usa la fixture `pokeApi` (PokeApiClient) inyectada en fixtures.ts.
 */

let lastStatus: number;
let lastBody: any;

When('solicito el berry con id {string}', async ({ pokeApi }, id: string) => {
  const response = await pokeApi.getBerry(id);
  lastStatus = response.status();
  lastBody = response.ok() ? await response.json() : null;
});

When('solicito el berry con nombre {string}', async ({ pokeApi }, name: string) => {
  const response = await pokeApi.getBerry(name);
  lastStatus = response.status();
  lastBody = response.ok() ? await response.json() : null;
});

Then('la respuesta debería tener status {int}', async ({}, status: number) => {
  expect(lastStatus).toBe(status);
});

Then('el body debería contener el nombre de la berry esperado', async () => {
  expect(lastBody?.name).toBeTruthy();
});

Then('el body debería contener el id de la berry esperado', async () => {
  expect(lastBody?.id).toBeTruthy();
});
