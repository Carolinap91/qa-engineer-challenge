# QA Engineer Challenge

Suite de automatización para el challenge técnico: escenarios UI sobre IMDb.com
y tests de API sobre PokeAPI (`/berry`, `/berry-flavor`).

> Estado: 🚧 en construcción — casos 1 (UI) y `/berry` (API) implementados;
> el resto se está desarrollando caso por caso. *******************

## Stack técnico

- **[Playwright](https://playwright.dev/)** + **TypeScript** — framework de automatización, UI y API.
- **Page Object Model** para UI.
- **GitHub Actions** para CI (matriz Chromium / Firefox / API).

## Decisiones técnicas

- **Un solo framework (Playwright) para UI y API**, en vez de Cypress+Playwright
  como sugiere el enunciado. Playwright tiene soporte nativo de API testing
  (`request` fixture) con la misma configuración, reporting y CI que el resto
  de la suite, evitando mantener dos toolchains distintas para un mismo challenge.
- **Tests directos de Playwright (sin capa BDD)**: se evaluó `playwright-bdd`
  para escribir escenarios en Gherkin, pero se descartó para reducir riesgo y
  complejidad de configuración en el tiempo disponible, priorizando cobertura
  real de los casos por sobre la capa de legibilidad BDD.
- **Variables de entorno vía `.env`** (no versionado, ver `.gitignore`) para
  URLs base; `.env.example` documenta las variables esperadas sin exponer datos sensibles.
- **Accept-Language forzado a inglés** en la config de Playwright: IMDb determina
  el idioma por ese header (no por la URL), y los selectores de texto (tags,
  menús) dependen de que el sitio responda siempre en inglés sin importar el
  entorno donde corran los tests.

## Estructura del proyecto

qa-engineer-challenge/
├── tests/
│   ├── ui/                   # Specs de Playwright para los casos de IMDb
│   └── api/                  # Specs de Playwright para PokeAPI
├── src/
│   ├── pages/                 # Page Objects (POM) de IMDb
│   ├── api/                   # Clientes tipados de API (PokeApiClient)
│   └── fixtures/               # Fixtures custom (inyección de POs / clients)
├── .github/workflows/ci.yml  # Pipeline CI
├── playwright.config.ts
└── .env.example

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

