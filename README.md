# QA Engineer Challenge

Suite de automatización para el challenge técnico: escenarios UI sobre IMDb.com
y tests de API sobre PokeAPI (`/berry`, `/berry-flavor`).

> Estado: cobertura parcial, entregada por límite de tiempo. Caso 1, Caso 2 (UI)
> y ambos endpoints de API completos y verdes. Casos 3, 4 y 5 quedaron fuera de
> alcance — ver nota de scope más abajo.

## Stack técnico

- **[Playwright](https://playwright.dev/)** + **TypeScript** — framework de automatización, UI y API.
- **Page Object Model** para UI.

## Decisiones técnicas

- **Un solo framework (Playwright) para UI y API**, en vez de Cypress+Playwright
  como sugiere el enunciado. Playwright tiene soporte nativo de API testing
  (`request` fixture) con la misma configuración, reporting y CI que el resto
  de la suite, evitando mantener dos toolchains distintas para un mismo challenge.
- **Variables de entorno vía `.env`** (no versionado, ver `.gitignore`) para
  URLs base; `.env.example` documenta las variables esperadas sin exponer datos sensibles.
- **Accept-Language forzado a inglés** en la config de Playwright: IMDb determina
  el idioma por ese header (no por la URL), y los selectores de texto (tags,
  menús) dependen de que el sitio responda siempre en inglés sin importar el
  entorno donde corran los tests.
- **Sin credenciales de login en ningún test**, por decisión de seguridad. Donde
  IMDb requiere sesión (persistir un rating), se valida el comportamiento
  esperado para usuario anónimo en lugar de autenticar con una cuenta real.

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
npm run test:chrome     # UI solo en Chrome
npm run test:firefox    # UI solo en Firefox
npm run report          # abre el reporte HTML del último runn
```

Requiere Node.js 20+. Funciona igual en Windows, macOS, Linux y CI (sin dependencias del sistema operativo).

## Cobertura de casos

Caso 1 — Nicolas Cage: primera película con tag "Completed" en Upcoming, corrido en Chrome + Firefox. Completo.
Caso 2 — Top Box Office: calificar con 5 estrellas el 2do ítem del ranking. Completo.
API /berry: válido/inválido, por id y por nombre — 4 tests. Completo.
API /berry-flavor: válido + caso encadenado spicy/potency — 2 tests. Completo.

Total: 2/5 casos UI + 6/6 tests de API, todos verdes.


## Metodología de trabajo

- Inspección manual del DOM real en el navegador antes de escribir cada selector.
- Diagnóstico de fallos con Playwright Trace Viewer (Actions, Log, Errors,
  screenshots Before/After) y Playwright Inspector (`--debug`) cuando el trace
  no alcanza.
- Registro continuo de ambigüedades y decisiones de diseño a medida que
  aparecían, en vez de reconstruirlas al final.
- Commit por bloque de funcionalidad estable (no por archivo).

## Ambigüedades y bugs encontrados

El enunciado del challenge, como cualquier especificación de UI real, dejaba
casos sin definir explícitamente. Cada uno se resolvió con una decisión
explícita y, en varios casos, se destapó un bug real de la aplicación bajo
prueba (no del test):

1. **Idioma de la página según locale del entorno.** IMDb responde en español
   si el navegador/SO tiene ese locale → `Accept-Language: en-US` forzado en
   `playwright.config.ts`.
2. **El dropdown de autocompletado no lista el perfil del actor** como opción
   navegable → búsqueda por Enter y navegación desde la página de resultados `/find`.
3. **Selector de créditos genérico matcheaba secciones colapsadas** además de
   la visible → acotado con el atributo `aria-controls`.
4. **Click intermitente en "Upcoming"** por hydration lenta de React → reintento
   automático verificando `aria-expanded` antes de interactuar.
5. **Bug real de la app:** los tests de API "válido" (por id y por nombre)
   fallaban con 404 → una ruta con `/` inicial descartaba el `/api/v2` de la
   baseURL al resolverse como absoluta en vez de relativa.
6. **"2do ítem" de Top Box Office cambia semanalmente** (contenido dinámico) →
   selección por posición (`nth`), no por nombre de película.
7. **Link del menú invisible para `getByRole()`**: el `aria-hidden` del drawer
   CSS-only no se sincroniza con su estado visual → selector por `href`.
8. **`data-testid="hero-rating-bar__aggregate-rating"` duplicado en el DOM** →
    acotado con `.first()`.
8. **Botón "Rate" con `aria-label` dinámico** (incluye el título de la
    película) → match por regex (`/^Rate\s/`) en vez de texto exacto.
10. **Mismo bug de hydration que el punto 6**, ahora en el botón "Rate" del
    modal → mismo patrón de reintento.
11. **Capa `ipc-starbar__touch` bloqueaba clicks de mouse** sobre las estrellas
    de rating → interacción por teclado (`focus` + `Enter`).
12. **Selector del botón de confirmación de rating** parecía un `data-testid`
    pero era una clase CSS → `getByRole` acotado al `dialog`.
13. **IMDb requiere login para persistir el rating** (no pedido en el
    enunciado) → se valida el redirect/mensaje "Sign in" como resultado
    esperado para usuario anónimo, sin usar credenciales reales.
14. **El heading "Sign in" matcheaba por substring** con un `<h4>` de marketing
    homónimo ("It's so much better when you sign in") → `getByRole('heading',
    { name: 'Sign in', exact: true })`.

## Próximos pasos:

- Implementar Casos 3, 4 y 5 reutilizando el patrón de selector por `href`
  para navegación de menú, que cubren la mayoría de la fricción esperada.

