# Leegalybuy

Product listing and detail application for the Leegality frontend assessment, using the [DummyJSON API](https://dummyjson.com/docs/products).

[Live demo](https://leegalybuy-kohl.vercel.app/) · [Repository](https://github.com/mishra-naman/Leegalybuy)

## Setup

Requires Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Use `npm.cmd` in PowerShell if script execution is disabled.

| Command                | Purpose                         |
| ---------------------- | ------------------------------- |
| `npm run build`        | Type-check and build to `dist/` |
| `npm run preview`      | Preview the production build    |
| `npm run typecheck`    | Check strict TypeScript types   |
| `npm run lint`         | Run ESLint                      |
| `npm run format`       | Format source                   |
| `npm run format:check` | Check formatting                |
| `npm test`             | Run unit and component tests    |
| `npm run test:watch`   | Watch unit tests                |
| `npm run test:e2e`     | Run browser tests               |

Playwright uses installed Chrome by default. For bundled Chromium, run `npx playwright install chromium` and set `PW_CHANNEL=chromium`. In PowerShell: `$env:PW_CHANNEL='chromium'`.

The optional live API test captures desktop, mobile, gallery and cart screenshots in `artifacts/`:

```sh
LIVE_API=1 npx playwright test e2e/live.spec.ts
```

In PowerShell, set `$env:LIVE_API='1'` before running the command.

## Features

- Combined category, brand, price and product-search filters; sorting and pagination.
- Independent sidebar search for category and brand options.
- Product details with reviews, image selection and zoom.
- Persistent cart with quantity controls, totals and limited toast feedback.
- Light/dark themes, responsive layouts, loading states and recoverable errors.

## Architectural decisions

The code is grouped by feature under `src/features/`, with application configuration in `src/app/` and reusable components in `src/shared/`.

| State                                                      | Owner             |
| ---------------------------------------------------------- | ----------------- |
| Products and categories                                    | TanStack Query    |
| Cart and theme                                             | Redux Toolkit     |
| Committed search, filters, sort and page                   | URL parameters    |
| Input drafts, filter search, drawers and gallery selection | Local React state |

Zod validates API responses, URL parameters and saved cart data. Fetch requests support cancellation, a timeout and limited retries. Product/category caches avoid fetching on every filter change.

Filtering uses the complete catalogue, with a category endpoint for a single selected category. Selections use OR within each group and AND across groups. Sorting happens before eight-item pagination without mutating cached data. Product links preserve listing state through refresh and Back navigation.

Tailwind CSS 4 handles component styling. `src/shared/styles/global.css` contains theme tokens, base rules, page layouts and a shared scrollbar utility. Route pages, cart, filter drawer and image viewer load lazily.

Native dialogs handle modal focus, Escape and backdrop behavior. Cart totals use integer cents; persisted data is validated before rehydration. The saved theme is applied before React renders.

## Assumptions

- Product content comes from DummyJSON and differs from the reference screenshots.
- Prices are displayed in USD. Cart and theme preferences are stored on the current device.
- The header searches products; sidebar search only narrows filter options. Clear filters preserves product search.
- The application fills the viewport. Desktop detail information scrolls within its column; mobile details scroll vertically.
- Missing images, brands, descriptions and reviews have fallback states.
- Checkout shows a coming-soon message. Authentication, payments and stock reservation require a backend.

## Deployment

Vercel uses `npm run build` and the `dist/` output directory. `vercel.json` provides the SPA fallback for direct product links and refreshes. No environment variables are required.

## Improvements with more time

- Server-side search and faceting for a larger catalogue.
- Account-based cart synchronization and checkout integration.
- Broader browser and assistive-technology testing.
- Field performance measurements to guide image and caching improvements.
