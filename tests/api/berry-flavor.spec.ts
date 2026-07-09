import { test, expect } from '@fixtures/fixtures';

/**
 * PokeAPI - Berry flavor endpoint: validación básica + caso encadenado
 * (identificar la berry "spicy" con mayor potencia y validarla contra /berry/).
 */
test.describe('PokeAPI - Berry flavor endpoint', () => {
  test('Consultar berry-flavor por nombre válido', async ({ pokeApi }) => {
    const response = await pokeApi.getBerryFlavor('spicy');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.berries)).toBe(true);
    expect(body.berries.length).toBeGreaterThan(0);
  });

  test('Encontrar la berry "spicy" con mayor potencia y validarla', async ({ pokeApi }) => {
    // 1. Obtener todas las berries con sabor "spicy"
    const flavorResponse = await pokeApi.getBerryFlavor('spicy');
    expect(flavorResponse.status()).toBe(200);

    const flavorBody = await flavorResponse.json();
    const berries: { berry: { name: string; url: string }; potency: number }[] =
      flavorBody.berries;

    expect(berries.length).toBeGreaterThan(0);

    // 2. Identificar la de mayor "potency"
    const mostPotent = berries.reduce((max, current) =>
      current.potency > max.potency ? current : max
    );

    // 3. Llamar a /berry/{name}/ con esa berry y validar la respuesta
    const berryResponse = await pokeApi.getBerry(mostPotent.berry.name);
    expect(berryResponse.status()).toBe(200);

    const berryBody = await berryResponse.json();
    expect(berryBody.name).toBe(mostPotent.berry.name);
  });
});