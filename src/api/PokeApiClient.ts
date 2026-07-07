import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Wrapper tipado sobre la PokeAPI. Recibe un APIRequestContext de Playwright
 * (inyectado vía fixture) en vez de instanciar su propio cliente HTTP,
 * para reutilizar la config de baseURL/timeouts de playwright.config.ts.
 */
export class PokeApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async getBerry(idOrName: string | number): Promise<APIResponse> {
    return this.request.get(`/berry/${idOrName}/`);
  }

  async getBerryFlavor(idOrName: string | number): Promise<APIResponse> {
    return this.request.get(`/berry-flavor/${idOrName}/`);
  }
}
