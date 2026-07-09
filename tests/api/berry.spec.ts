import { test, expect } from '@fixtures/fixtures';

/**
 * PokeAPI - Berry endpoint: casos positivos y negativos por id y nombre.
 */
test.describe('PokeAPI - Berry endpoint', () => {
  test('Consultar berry por id válido', async ({ pokeApi }) => {
    const response = await pokeApi.getBerry('1');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBeTruthy();
  });

  test('Consultar berry por id inválido', async ({ pokeApi }) => {
    const response = await pokeApi.getBerry('99999');
    expect(response.status()).toBe(404);
  });

  test('Consultar berry por nombre válido', async ({ pokeApi }) => {
    const response = await pokeApi.getBerry('cheri');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBeTruthy();
  });

  test('Consultar berry por nombre inválido', async ({ pokeApi }) => {
    const response = await pokeApi.getBerry('not-a-real-berry');
    expect(response.status()).toBe(404);
  });
});