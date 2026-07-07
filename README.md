# QA Engineer Challenge

Suite de automatización para el challenge técnico: escenarios UI sobre IMDb.com
y tests de API sobre PokeAPI (`/berry`, `/berry-flavor`).

> Estado: 🚧 en construcción — la arquitectura y los `.feature` están definidos;
> los step definitions se están implementando caso por caso (ver sección Progreso).

## Stack técnico

- **[Playwright](https://playwright.dev/)** + **TypeScript** — framework de automatización, UI y API.
- **[playwright-bdd](https://github.com/vitalets/playwright-bdd)** — permite escribir escenarios en Gherkin/BDD manteniendo el test runner nativo de Playwright (multi-browser, traces, paralelización).
- **Page Object Model** para UI.
- **GitHub Actions** para CI (matriz Chromium / Firefox / API).

## Decisiones técnicas

- **Un solo framework (Playwright) para UI y API**, en vez de Cypress+Playwright
  como sugiere el enunciado. Playwright tiene soporte nativo de API testing
  (`request` fixture) con la misma configuración, reporting y CI que el resto
  de la suite, evitando mantener dos toolchains distintas para un mismo challenge.
- **playwright-bdd en vez de cucumber-js "puro"**: permite Gherkin sin perder
  proyectos multi-browser de Playwright (requisito explícito del caso 1: Chrome + Firefox).
- **Variables de entorno vía `.env`** (no versionado, ver `.gitignore`) para
  URLs base; `.env.example` documenta las variables esperadas sin exponer datos sensibles.

## Estructura del proyecto

```
qa-engineer-challenge/
├── features/                # Escenarios Gherkin
│   ├── ui/                  # 5 casos IMDb
│   └── api/                 # Casos PokeAPI
├── step-definitions/        # Implementación de los steps
│   ├── ui/
│   └── api/
├── src/
│   ├── pages/                # Page Objects (POM) de IMDb
│   ├── api/                  # Clientes tipados de API (PokeApiClient)
│   ├── fixtures/              # Fixtures custom (inyección de POs / clients)
│   └── utils/                 # Helpers (ej. cálculo de fechas)
├── .github/workflows/ci.yml # Pipeline CI
├── playwright.config.ts
└── .env.example
```

## Cómo correrlo localmente

```bash
npm install
npx playwright install --with-deps   # instala los navegadores
cp .env.example .env

npm test                # todos los tests
npm run test:ui         # solo UI (Chrome + Firefox)
npm run test:api        # solo API
npm run test:chrome     # UI solo en Chrome
npm run test:firefox    # UI solo en Firefox
npm run report          # abre el reporte HTML del último run
```

Requiere Node.js 20+. Funciona igual en Windows, macOS, Linux y CI (sin dependencias del sistema operativo).

## Cobertura de casos

| # | Caso | Estado |
|---|------|--------|
| 1 | Nicolas Cage - Upcoming credits (Chrome + Firefox) | 🚧 feature definido, steps pendientes |
| 2 | Top Box Office - Rating 5 estrellas | 🚧 feature definido, steps pendientes |
| 3 | Breaking Bad - Fotos filtradas por Danny Trejo | 🚧 feature definido, steps pendientes |
| 4 | Born Today - Nacidos ayer + screenshot | 🚧 feature definido, steps pendientes |
| 5 | Born Today - Nacidos hace 40 años (date picker) + screenshot | 🚧 feature definido, steps pendientes |
| 6 | API `/berry` - id/nombre válido e inválido | 🚧 feature definido, steps pendientes |
| 7 | API `/berry-flavor` - spicy + mayor potencia | 🚧 feature definido, steps pendientes |

## Próximos pasos

Implementación de Page Objects y step definitions, caso por caso, siguiendo
el patrón de referencia en `nicolas_cage.steps.ts` (UI) y `berry.steps.ts` (API).
