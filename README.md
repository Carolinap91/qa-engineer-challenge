# QA Engineer Challenge

Automatización E2E sobre IMDb.com (UI) y PokeAPI (API) con Playwright + TypeScript.

**37/37 tests verdes** en Chrome y Firefox: 5 casos funcionales + 10 casos negativos/border en UI, 7 tests de API.

## Stack y decisiones clave

- **Playwright + TypeScript** para UI y API con un solo framework (en vez de Cypress+Playwright) — misma config, reporting y CI para toda la suite.
- **Page Object Model** para UI.
- **Sin credenciales de login en ningún test.** Donde IMDb requiere sesión, se valida el comportamiento esperado para usuario anónimo en vez de autenticar con una cuenta real.
- **`Accept-Language: en-US` forzado** en la config: IMDb determina el idioma por header, no por URL, y los selectores de texto dependen de eso.
- **Variables de entorno vía `.env`** (no versionado) para URLs base.
- **CI con gate de `lint` + `typecheck`** antes del job de tests (falla rápido, sin instalar navegadores si el código no compila).

## Estructura del proyecto

```
qa-engineer-challenge/
├── tests/
│   ├── ui/                    # Specs de Playwright para los casos de IMDb
│   └── api/                   # Specs de Playwright para PokeAPI
├── src/
│   ├── pages/                  # Page Objects (POM) de IMDb
│   ├── api/                    # Clientes tipados de API (PokeApiClient)
│   └── fixtures/                # Fixtures custom (inyección de POs / clients)
├── .github/workflows/ci.yml   # Pipeline CI
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
npm run lint             # ESLint
npm run typecheck        # TypeScript
npm run report           # abre el reporte HTML del último run
```

Requiere Node.js 20+. Sin dependencias del sistema operativo — corre igual en Windows, macOS, Linux y CI.

## Cobertura de casos

| Caso | Escenario | Negativos / border |
|---|---|---|
| 1 — Nicolas Cage | 1ra película "Completed" en Upcoming | Actor inexistente · sin sección Upcoming |
| 2 — Top Box Office | Calificar 2do ítem con 5 estrellas | Cerrar modal sin calificar · doble apertura de "Rate" |
| 3 — Breaking Bad | Fotos filtradas por Danny Trejo, abrir 2da foto | Show inexistente · posición fuera de rango |
| 4 — Born Today (ayer) | Click en 3er resultado | Fecha inválida · posición fuera de rango |
| 5 — Born Today (40 años) | Click condicional en link de descripción | Rango invertido · rango a futuro |

| Endpoint | Cobertura |
|---|---|
| `/berry` | Válido/inválido, por id y por nombre (4 tests) |
| `/berry-flavor` | Válido/inválido + caso encadenado spicy → potency (3 tests) |

## Metodología

- Inspección manual del DOM real antes de escribir cada selector; diagnóstico de fallos con Trace Viewer e Inspector.
- Selección por posición (`nth`) en listas con contenido dinámico, nunca por nombre.
- Bounds-checking defensivo en los Page Objects: errores descriptivos en vez de timeouts genéricos.

## Hallazgos técnicos destacados

- **Bug de resolución de URL en el cliente HTTP:** una ruta con `/` inicial descartaba el `/api/v2` de la baseURL al resolverse como absoluta en vez de relativa — los tests de API "válido" fallaban con 404 hasta corregirlo.
- **Bug real de IMDb:** una fecha inválida en el filtro "Birthday" (ej. 30 de febrero) deja el botón "See results" permanentemente deshabilitado, sin ningún feedback al usuario de por qué.
- **La validación de "See results" solo reacciona a eventos de teclado reales** (no al valor final de un `fill()`), lo que rompe cualquier integración que setee el campo programáticamente.
- **El link "Born today" del menú nunca resolvía por `href`** pese a existir en la inspección manual del DOM — `getByLabel` (selector semántico) resultó más confiable que el atributo.
- **`data-testid` duplicados en el DOM** (rating del hero, selects de filtro) — requirieron acotar cada selector a su contenedor específico para evitar violaciones de strict mode.
