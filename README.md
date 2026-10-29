# Leegalybuy

A Leegality Frontend Engineer Assessment: a compact, responsive product catalogue and detail experience built from the two supplied reference designs. All storefront product content comes from the live [DummyJSON API](https://dummyjson.com/docs/products).

Repository: [mishra-naman/Leegalybuy](https://github.com/mishra-naman/Leegalybuy).

Live demo: [Leegalybuy](https://leegalybuy-naman.foamygoose21.chatgpt.site) (private Sites hosting; requires the owner's ChatGPT sign-in).

## Features

**Assignment requirements:** product listing and detail routes, dynamic categories and brands, inclusive price filtering, combined filters, eight-product pagination, preserved navigation context, loading skeletons, empty states, API validation, cancellation, and recoverable errors.

**Enhancements:** debounced product search, independent category/brand option search, five sort orders, persistent shopping cart with quantity controls and integer-cent totals, light/dark themes, image gallery with keyboard navigation and zoom, responsive filter drawer, accessible native dialogs, lazy routes and noncritical features, and automated tests.

## Run locally

Use Node **24 LTS** and npm. Node 22.12+ and 26+ are also supported by the test tooling.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. On Windows PowerShell with script execution disabled, use `npm.cmd` and `npx.cmd` instead of `npm` and `npx`.

| Command                | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `npm run typecheck`    | Strict TypeScript checks                                |
| `npm run lint`         | ESLint, TypeScript, React Hooks and Fast Refresh checks |
| `npm run format:check` | Verify Prettier formatting                              |
| `npm run format`       | Format source files                                     |
| `npm test`             | Vitest unit and React Testing Library component tests   |
| `npm run test:watch`   | Watch unit/component tests                              |
| `npm run test:e2e`     | Deterministic Playwright browser tests                  |
| `npm run build`        | Type-check and create production `dist/`                |
| `npm run preview`      | Serve the production build locally                      |

To stage, commit and push the current branch yourself, run:

```sh
npm run git:publish -- "Fix storefront interactions and layout"
```

The helper uses `git add .`, commits with your message, and pushes the current branch to `origin`. It stops if staging or committing fails. Preview the commands without changing Git state or uploading anything:

```sh
npm run git:publish -- --dry-run "Fix storefront interactions and layout"
```

Playwright uses installed Google Chrome by default. For bundled Chromium:

```sh
npx playwright install chromium
PW_CHANNEL=chromium npm run test:e2e
```

PowerShell equivalent: `$env:PW_CHANNEL='chromium'; npm.cmd run test:e2e`.

Opt into the real-network smoke test and desktop/mobile screenshots with `LIVE_API=1 npx playwright test e2e/live.spec.ts --reporter=list` (PowerShell: `$env:LIVE_API='1'; npx.cmd playwright test e2e/live.spec.ts --reporter=list`). The regular suite deliberately skips this test to keep CI deterministic. Captures are written to ignored `artifacts/`.

## Stack and architecture

- **Vite + React + strict TypeScript:** lightweight development and production builds.
- **React Router:** lazy listing/detail pages, safe direct links, URL state and SPA navigation.
- **TanStack Query:** product/category fetching, cancellation and server caching. No RTK Query.
- **Redux Toolkit + React Redux:** typed cart actions/selectors and shared theme preference only.
- **Zod:** product/category API boundaries, URL parameters and persisted cart validation.
- **Native Fetch:** status checks, abort signals and a 20-second request timeout.
- **CSS Modules + semantic CSS variables:** scoped styles and consistent themes without a component framework.
- **Lucide React:** named icon imports.
- **Vitest, React Testing Library and Playwright:** pure logic, components and full browser flows.

```text
src/
  app/                 Application shell, router entry, Redux store and query client
  features/
    products/          Validated API, query definitions, cards, pages, processing utilities
    filters/           URL parsing, price validation, desktop sidebar and mobile drawer
    cart/              Slice, persisted schema, totals, add controls and lazy drawer
    gallery/           Image selection, thumbnails and lazy zoom dialog
    theme/             Shared theme preference
  shared/              Header, search, rating, pagination, dialogs, feedback, tokens and storage
  test/                Test-only factories and browser API setup
e2e/                   Deterministic flows and opt-in live API visual captures
```

### State ownership

TanStack Query owns the catalogue, individual products, categories and category-specific collections. Redux stores only compact cart snapshots and theme preference. The URL owns committed search, categories, brands, price limits, sort order and page. Component state owns drafts, open drawers, selected images and zoom level.

The header search filters products and commits to the URL after 250ms or Enter. The sidebar search has independent local state and narrows the available category and brand options; typing there does not change product results, product search or committed selections. Filter changes reset pagination; explicit pagination preserves every filter. Category and brand selections are OR within a group and AND across groups. Sorting occurs on a copy before pagination. Synchronous data-router updates give controlled checkboxes immediate feedback.

Example URL:

```text
/?q=phone&category=smartphones&category=laptops&brand=Apple&min=100&max=1000&sort=price-asc&page=2
```

Repeated `category` and `brand` keys are sorted and deduplicated. Invalid numbers/sorts are normalized; reversed URL price ranges are discarded; out-of-range pages are clamped. Price-form errors are announced without committing invalid values.

Product links carry the originating listing URL in `location.state` and an encoded `returnTo` query parameter. This preserves filters through refresh and new-tab navigation. Return destinations are restricted to the listing route; direct product links fall back to `/`.

### API integration

- `GET /products?limit=0`: complete catalogue for combined filtering and the global brand list.
- `GET /products/categories`: normalized category objects (legacy string responses are also supported).
- `GET /products/category/{slug}?limit=0`: used when exactly one category is selected.
- `GET /products/{id}`: actual product detail, description, image collection and reviews.

The live API was checked on 29 October 2026: `limit=0` returned all 194 advertised products; the first category returned all five advertised items. If a deployment caps `limit=0`, the client fetches remaining pages using `skip` and `limit`. Multi-category filters always use the full catalogue. Single-category requests can use cached full-catalogue matches while loading; a category failure leaves an explicit retry notice and usable full-catalogue matches.

Catalogue/detail cache freshness is five minutes, categories thirty minutes. Obsolete requests are cancelled, focus refetches are disabled, and persistent failures retry at most once. Every response is validated once at its boundary. Unknown extra API fields are tolerated.

### Cart, theme and accessibility

Cart snapshots contain ID, title, image, integer unit cents and quantity. The first add switches the listing/detail control to a synchronized minus/quantity/plus stepper. Decreasing from one removes that product; the drawer also offers explicit removal. Quantities are bounded from 1 to 999. Selectors derive count and subtotal. Zod rejects malformed persisted data and duplicate IDs; unavailable storage falls back safely with a developer diagnostic.

The drawer keeps Checkout visible beneath its scrollable items. Checkout displays a coming-soon notice and does not start a payment flow. One small toast appears for a first add, clearing the cart or Checkout; quantity changes, filtering, search, gallery controls and theme changes do not create toasts. Repeated identical notices are deduplicated and dismiss automatically.

Light mode is the first-visit default. A small head script restores the saved theme before React renders. The header alternates its moon/sun action icon with the selected theme. The hamburger menu provides All products, Cart and appearance controls. All surfaces use the same semantic tokens in both themes.

Native modal dialogs provide focus trapping and Escape handling. The shared wrapper restores focus, locks body scrolling and closes on backdrop click. Controls have visible focus states, labelled inputs, live feedback, reduced-motion support and image fallbacks. Decorative account imagery does not imply authentication.

## Design and assumptions

The supplied screenshots define the component styling: a 58px dark slate header, 274px sidebar, four columns, 12px grid gaps, 230px cards and compact blue pagination. Following the updated layout request, the shell fills the full viewport instead of using a centered fixed-width container. The shell hides outer overflow while the sidebar and main content scroll independently beneath the fixed header. The desktop detail page clips outer overflow, fits its gallery into the available height, and scrolls the information column independently. The image viewer keeps its frame fixed and enlarges only the picture. Tablet layouts reduce the grid; mobile uses two columns, a modal filter drawer and stacked, scrollable details. Very narrow screens use one column. Category/brand scrollbars have contrasting tracks and thumbs; Clear filters next to filter search clears selections and filter search while preserving product search.

Live product titles, prices, images, categories, descriptions and reviews differ from the illustrative reference content. Long card titles are ellipsized and available in full on detail pages and accessible links. Large category/brand lists scroll inside their sections. Missing brands/descriptions/reviews show explicit fallbacks. API prices are displayed in USD. The cart is local to the browser; there is no authentication, stock reservation, payment or checkout backend.

## Testing and performance

Unit tests cover combined filtering, multi-select behavior, inclusive boundaries, all sort orders, immutable processing, page clamping, URL round-trips, invalid input, safe return links, cart quantities/totals, corrupt storage, theme toggles and API failures/cancellation. Component tests exercise cards, filters, validation, pagination, feedback, cart, themes and gallery navigation. Browser tests cover complete filter/navigation/cart/theme/zoom/mobile/error flows, independent search state and viewport scrolling.

Verification commands are listed above. Browser regression tests also cover synchronized quantity controls, limited toast feedback, checkout notices, visible filter scrollbars, short-screen detail layout and fixed image-zoom bounds. Desktop, mobile, cart, image-viewer and dark-theme captures are produced by the opt-in live test.

Both page implementations are lazy loaded. Cart, mobile filters and zoom split into separate chunks. Above-the-fold thumbnails and the main detail image are prioritized; other images are lazy loaded with reserved dimensions. Filtering and sorting use memoized pure computations. Eight cards do not need virtualization. No runtime CSS framework, gallery package, HTTP wrapper or duplicate server-state store is included.

Production bundle sizes are reported by `npm run build`. Lighthouse and device-specific Core Web Vitals are not claimed without measurements.

## Deployment

The Vite output is compatible with **Vercel** and **Netlify**. Import this repository, use `npm run build`, and publish `dist/`. `vercel.json`, `netlify.toml` and `public/_redirects` provide SPA fallbacks for direct product links and refreshes. No secrets or environment variables are required. The API uses HTTPS directly from the browser.

The `.openai/hosting.json` file identifies the private Sites deployment in addition to the Vercel/Netlify configuration.

## Further improvements

Use a production search service when catalogue size justifies server-side faceting, add real authenticated cart synchronization when a commerce backend exists, expand cross-browser and assistive-technology testing, and collect field performance data to guide image delivery and cache tuning.
