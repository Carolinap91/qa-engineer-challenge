# QA Engineer Challenge

Suite de automatización para el challenge técnico: escenarios UI sobre IMDb.com
y tests de API sobre PokeAPI (`/berry`, `/berry-flavor`).

> Estado: cobertura completa — los 5 casos UI y ambos endpoints de API,
> completos y verdes en Chrome y Firefox, incluyendo casos negativos/border
> agregados sobre cada caso.

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
- **Job de `lint` + `typecheck` como gate en CI**, separado del job de tests y
  corriendo primero (`needs: lint`). Antes existían los scripts (`npm run
  lint`, `npm run typecheck`) pero no se ejecutaban en el pipeline — el CI
  podía quedar verde con errores de tipo o de lint sin que nadie lo notara.
  También faltaba el archivo de configuración de ESLint (`.eslintrc.json`)
  en sí; el script `lint` fallaba si se corría. Este job además falla rápido
  antes de instalar navegadores e ir al job de tests (más caro).

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

- Caso 1 — Nicolas Cage: primera película con tag "Completed" en Upcoming, corrido en Chrome + Firefox. Completo. + 2 casos negativos/border: actor inexistente, actor sin sección "Upcoming".
- Caso 2 — Top Box Office: calificar con 5 estrellas el 2do ítem del ranking. Completo. + 2 casos negativos/border: cerrar el modal sin calificar (Escape), abrir "Rate" dos veces seguidas sin duplicar el modal.
- Caso 3 — Breaking Bad / Photos: filtrar por Danny Trejo y abrir la 2da foto, corrido en Chrome + Firefox. Completo. + 2 casos negativos/border: show inexistente en el Top 250, posición de foto fuera de rango.
- Caso 4 — Born Today: celebridades nacidas ayer, click en el 3er resultado, corrido en Chrome + Firefox. Completo. + 2 casos negativos/border: fecha inválida (30 de febrero), posición de resultado fuera de rango.
- Caso 5 — Born Today: personas que cumplen 40 años hoy, click condicional en el link de la descripción del 1er resultado, corrido en Chrome + Firefox. Completo. + 2 casos negativos/border: rango de fechas invertido, rango de fechas en el futuro (sin resultados).
- API /berry: válido/inválido, por id y por nombre — 4 tests. Completo.
- API /berry-flavor: válido + inválido (404) + caso encadenado spicy/potency — 3 tests. Completo.

Total: 15/15 tests UI (5 casos felices + 10 negativos/border) + 7/7 tests de API, todos verdes en Chrome y Firefox.


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
9. **Botón "Rate" con `aria-label` dinámico** (incluye el título de la
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
15. **"Ir a la sección Photos" era ambiguo** — IMDb tiene un botón "99+ Photos"
    en el hero y una `<section data-testid="Photos">` más abajo en la página,
    ambos terminan en la misma URL. Se interpretó literalmente: la sección,
    no el atajo del hero. Además, esa sección abre primero un visor de una
    sola imagen (mediaviewer) — hace falta un segundo click en el ícono de
    grilla para llegar al índice completo con filtros (mediaindex).
16. **Mismo patrón de hydration lenta que los puntos 4 y 10**, ahora en el
    botón de filtro de fotos (`image-chip-dropdown-test-id`) → mismo
    reintento verificando que el `dialog` se haya abierto.
17. **"More people" no es un botón que revela más chips**: es un `<select>`
    nativo oculto (`opacity: 0`) con las personas que no están entre los
    ~14 chips más frecuentes visibles por defecto. Se resuelve buscando la
    `<option>` por texto y seleccionándola por `value`, no por click.
18. **`data-testid="select-dropdown-test-id"` duplicado** (un `<select>` por
    categoría de filtro: PERSON y OTHER) → acotado al contenedor
    `image-names-filter-container-test-id`, mismo patrón que el punto 8.
19. **"Born Today" no tiene un preset "Celebrities born yesterday"**: la
    página real (Advanced name search) solo permite tipear una fecha
    MM-DD a mano en el filtro "Birthday". Se resolvió calculando la fecha
    dinámicamente (`getMonthDay(-1)`, nunca hardcodeada) en vez de asumir
    un texto de búsqueda literal.
20. **El link "Born today" del menú no resolvía por `href`** (nunca
    quedaba "attached" pese a existir en la inspección manual del DOM) →
    `getByLabel('Go to Born today')`, confirmado con Playwright Inspector
    (Pick locator), sí resuelve. Selector por atributo `href` no siempre
    es más confiable que uno semántico.
21. **El botón "See results" quedaba deshabilitado tras `fill()`** en el
    campo de fecha: la validación que lo habilita depende de eventos de
    teclado reales por carácter y de un blur final, no solo del valor
    final del input → `pressSequentially()` + `press('Tab')` en vez de
    `fill()`.
22. **Bug real de la app:** una fecha inválida en el filtro "Birthday" (ej.
    "02-30", 30 de febrero, que no existe en ningún calendario) no muestra
    0 resultados como sería esperable — deja el botón "See results"
    permanentemente deshabilitado (`aria-disabled="true"`), sin dar
    feedback de por qué es inválida. Detectado con Trace Viewer: el primer
    borrador del test asumía 0 resultados y colgaba 30s reintentando un
    click sobre un botón que nunca se habilita. Se resolvió separando
    `typeBirthday()` (solo tipea, sin intentar el submit) de
    `searchByBirthday()`, y validando el estado `disabled` en vez de
    forzar el click.
23. **Race condition en los `count()` de bounds-checking**: al agregar
    validaciones de "elemento no encontrado" (actor inexistente, show
    inexistente, posición fuera de rango, etc.) con un `count()`
    inmediato, el caso feliz se volvía intermitente — justo después de un
    click/navegación la lista todavía no había renderizado, así que
    `count()` leía 0 por timing y no por ausencia real, lanzando el error
    de "no encontrado" sobre datos que sí existían. Se resolvió esperando
    explícitamente (`waitFor` con timeout acotado) antes de contar, y solo
    tratando el timeout como "no existe".

## Cierre

Los 5 casos UI se cubrieron con 3 Page Objects reutilizables entre sí
(`AdvancedNameSearchPage` sirve para los Casos 4 y 5 sin duplicar código,
`PhotosGalleryPage` está pensado para reusarse con cualquier título, no
solo Breaking Bad). Se sumaron 10 casos negativos/border (2 por cada caso
UI) y 1 caso negativo de API, con bounds-checking defensivo agregado a los
Page Objects (errores descriptivos en vez de timeouts genéricos). 6 bugs
reales de la aplicación bajo prueba quedaron documentados (puntos 5, 15,
20, 21 y 22 de la lista de arriba — el punto 23 es un bug del propio
framework de tests, no de la app), no solo ambigüedades de interpretación
del enunciado.

